import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Box3, Quaternion, Vector3 } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

globalThis.ProgressEvent ??= class ProgressEvent {};

const MODEL_PATH = new URL("../public/models/tuki-v2n-v4-r1.glb", import.meta.url);
const bytes = readFileSync(MODEL_PATH);
assert.equal(bytes.toString("ascii", 0, 4), "glTF", "Expected a binary GLB file");
assert.equal(bytes.readUInt32LE(4), 2, "Expected glTF 2.0");
assert.equal(bytes.readUInt32LE(8), bytes.length, "GLB header length must match the file");

const jsonLength = bytes.readUInt32LE(12);
const gltfJson = JSON.parse(bytes.subarray(20, 20 + jsonLength).toString("utf8").trim());
assert.ok(gltfJson.buffers.every(({ uri }) => !uri), "The model must embed its binary buffer");
assert.ok((gltfJson.images ?? []).every(({ uri }) => !uri), "The model must not depend on external images");

const { scene, animations } = await new GLTFLoader().parseAsync(new Uint8Array(bytes).buffer, "");
scene.updateMatrixWorld(true);

const unitRoot = scene.getObjectByName("TUKI_V2N_MANO_Y_V4_R1_MILIMETROS");
assert.ok(unitRoot, "Missing shared assembly root");
const rootScale = new Vector3();
unitRoot.matrixWorld.decompose(new Vector3(), new Quaternion(), rootScale);
assert.ok(rootScale.toArray().every((axis) => Math.abs(axis - 0.001) < 1e-8), "CAD millimetres must render as metres");

const fingers = ["PULGAR", "INDICE", "MEDIO", "ANULAR", "MENIQUE"];
const requiredAssemblyNodes = [
  "R1_CARCASA_ANTEBRAZO",
  "R1_PUERTA_ANTEBRAZO",
  "R1_PLACA_M3_5_SG90",
  "R1_MUNECA_5_GUIAS",
  "R1_BASE_GABINETE",
  "R1_PUERTA_GABINETE",
  "R1_CUBIERTA_TRANSICION",
  "R1_PASADOR_SUPERIOR",
  "R1_PASADOR_INFERIOR",
  "R1_BISAGRA_SUPERIOR_EJE_Y",
  "R1_BISAGRA_INFERIOR_EJE_Y",
  ...Array.from({ length: 10 }, (_, index) => `R1_ABRAZADERA_M3_${String(index + 1).padStart(2, "0")}`),
  ...Array.from({ length: 5 }, (_, index) => `R1_POLEA_${String(index + 1).padStart(2, "0")}`),
  ...Array.from({ length: 5 }, (_, index) => `R1_SG90_${String(index + 1).padStart(2, "0")}_REFERENCIA`),
];

for (const name of requiredAssemblyNodes) assert.ok(scene.getObjectByName(name), `Missing R1 assembly node ${name}`);
assert.equal(scene.getObjectByName("R1_BISAGRA_SUPERIOR_EJE_Y").children[0]?.name, "R1_PUERTA_ANTEBRAZO");
assert.equal(scene.getObjectByName("R1_BISAGRA_INFERIOR_EJE_Y").children[0]?.name, "R1_PUERTA_GABINETE");

const expectedClips = fingers.map((finger) => `CLOSE_${finger}`);
assert.deepEqual(animations.map((clip) => clip.name).sort(), [...expectedClips].sort(), "Expected exactly the five finger clips");
for (const finger of fingers) {
  const jointCount = finger === "PULGAR" ? 2 : 3;
  const clip = animations.find((candidate) => candidate.name === `CLOSE_${finger}`);
  assert.ok(clip, `Missing CLOSE_${finger}`);
  assert.equal(clip.tracks.length, jointCount, `Unexpected track count in CLOSE_${finger}`);
  for (let jointIndex = 1; jointIndex <= jointCount; jointIndex += 1) {
    const jointName = `FINGER_${finger}_${String(jointIndex).padStart(2, "0")}`;
    const joint = scene.getObjectByName(jointName);
    assert.ok(joint, `Missing joint ${jointName}`);
    assert.ok(joint.isMesh || joint.children.some((child) => child.isMesh), `${jointName} must retain its phalanx mesh`);
    assert.ok(clip.tracks.some((track) => track.name.startsWith(`${jointName}.`)), `Missing ${jointName} animation track`);
  }
}

let meshCount = 0;
let triangleCount = 0;
let meshesWithoutSourceNormals = 0;
scene.traverse((node) => {
  if (!node.isMesh) return;
  meshCount += 1;
  const position = node.geometry.getAttribute("position");
  const normal = node.geometry.getAttribute("normal");
  assert.ok(position?.count, `Mesh ${node.name} has no vertices`);
  if (normal) assert.ok(normal.count === position.count, `Mesh ${node.name} has invalid normals`);
  else meshesWithoutSourceNormals += 1;
  triangleCount += node.geometry.index ? node.geometry.index.count / 3 : position.count / 3;
});

const bounds = new Box3().setFromObject(scene);
const dimensions = bounds.getSize(new Vector3());
assert.ok(dimensions.x > 0.1 && dimensions.x < 0.3, "Unexpected model width; check units and orientation");
assert.ok(dimensions.y > 0.35 && dimensions.y < 0.5, "Unexpected model length; check units and orientation");
assert.ok(dimensions.z > 0.07 && dimensions.z < 0.2, "Unexpected model depth; check units");

console.log(`TUKI V2N + V4 R1 GLB OK: ${bytes.length} bytes, ${gltfJson.nodes.length} nodes, ${meshCount} mesh instances, ${Math.round(triangleCount)} triangles, 14 joints, 5 clips, 5 SG90 references`);
console.log(`Source meshes without normals: ${meshesWithoutSourceNormals}; viewer computes normals for these cloned render geometries.`);
console.log(`Root scale: ${rootScale.toArray().map((axis) => axis.toFixed(3)).join(" × ")}; bounds: ${dimensions.toArray().map((axis) => axis.toFixed(3)).join(" × ")} m`);
