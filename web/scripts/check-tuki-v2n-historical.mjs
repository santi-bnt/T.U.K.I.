import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { AnimationMixer, Box3, Vector3 } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

globalThis.ProgressEvent ??= class ProgressEvent {};

const modelPath = process.argv[2]
  ? resolve(process.argv[2])
  : new URL("../public/models/tuki-v2n.glb", import.meta.url);
const modelBytes = readFileSync(modelPath);
const { scene, animations } = await new GLTFLoader().parseAsync(new Uint8Array(modelBytes).buffer, "");
const glbJsonLength = modelBytes.readUInt32LE(12);
const glbDocument = JSON.parse(modelBytes.subarray(20, 20 + glbJsonLength).toString("utf8").trim());
assert.ok(glbDocument.buffers.every((buffer) => !buffer.uri), "Expected a self-contained GLB without external buffers");

// Load the real application pose functions so this check exercises the same
// code used by the five sliders instead of duplicating its rotation formula.
const require = createRequire(import.meta.url);
const typescript = require("typescript");
const rigSource = readFileSync(new URL("../src/lib/tuki-v2n-rig.ts", import.meta.url), "utf8");
const rigJavaScript = typescript.transpileModule(rigSource, {
  compilerOptions: { module: typescript.ModuleKind.CommonJS, target: typescript.ScriptTarget.ES2022 },
}).outputText;
const rigModule = { exports: {} };
new Function("require", "module", "exports", rigJavaScript)(require, rigModule, rigModule.exports);
const { resetTukiPose, setTukiPose } = rigModule.exports;
const fingerJoints = {
  PULGAR: 2,
  INDICE: 3,
  MEDIO: 3,
  ANULAR: 3,
  MENIQUE: 3,
};
const fingerNames = Object.keys(fingerJoints);

assert.equal(animations.length, 5, "Expected five preserved V2N animation clips");
for (const name of [
  "MANO",
  "FOREARM_V2N_ARM_V1",
  "RACK_DIAGONAL_5_SG90",
  "ForearmLeft",
  "ForearmRight",
  "WristCollar_PalmInterfacePending",
  "ElectronicsBase",
  "ServiceCover_USB_Pending",
  "ElectronicsCarrier",
]) {
  assert.ok(scene.getObjectByName(name), `Missing V2N assembly node ${name}`);
}

for (const removedName of [
  "ACOPLE_MUNECA",
  "RIOSTRA_IZQUIERDA",
  "RIOSTRA_DERECHA",
  "CARCASA_ANTEBRAZO",
  "TAPA_ANTEBRAZO",
  "GUIA_CINCO_TENDONES",
  "MARCO_CAJON",
  "CAJON_USB_C",
]) {
  const node = scene.getObjectByName(removedName);
  assert.ok(!node, `Superseded V2K component remains: ${removedName}`);
}

const cadRoot = scene.getObjectByName("TUKI_V2N_MM");
assert.ok(cadRoot, "Missing CAD millimetre root");
assert.ok(Math.abs(cadRoot.scale.x - 0.001) < 1e-6, "Expected millimetre-to-metre root scale");

const jointNames = fingerNames.flatMap((finger) =>
  Array.from({ length: fingerJoints[finger] }, (_, index) =>
    `FINGER_${finger}_${String(index + 1).padStart(2, "0")}`,
  ),
);
for (const name of jointNames) assert.ok(scene.getObjectByName(name), `Missing finger joint ${name}`);

// Confirm that the live manual rig moves only the selected finger, then
// returns every joint to its authored open pose before checking the next one.
for (const finger of fingerNames) {
  resetTukiPose(scene);
  const before = new Map(jointNames.map((name) => [name, scene.getObjectByName(name).quaternion.clone()]));
  setTukiPose(scene, { [finger]: 1 });

  let targetMoved = false;
  for (const name of jointNames) {
    const angle = scene.getObjectByName(name).quaternion.angleTo(before.get(name));
    if (name.startsWith(`FINGER_${finger}_`)) targetMoved ||= angle > 0.01;
    else assert.ok(angle < 1e-6, `Manual pose for ${finger} unexpectedly moved ${name}`);
  }
  assert.ok(targetMoved, `Manual pose for ${finger} did not articulate its joints`);
}
resetTukiPose(scene);

const bounds = new Box3().setFromObject(scene).getSize(new Vector3());
assert.ok([bounds.x, bounds.y, bounds.z].every(Number.isFinite), "Model bounds must be finite");
assert.ok(Math.max(bounds.x, bounds.y, bounds.z) < 1, "Model should be rendered in metres, not raw millimetres");

const mixer = new AnimationMixer(scene);
for (const finger of fingerNames) {
  const clip = animations.find((candidate) => candidate.name === `CLOSE_${finger}`);
  assert.ok(clip, `Missing animation clip CLOSE_${finger}`);
  const before = jointNames.map((name) => scene.getObjectByName(name).quaternion.clone());
  const action = mixer.clipAction(clip).reset().play();
  action.paused = true;
  action.time = clip.duration;
  mixer.update(0);

  let targetMoved = false;
  jointNames.forEach((name, index) => {
    const angle = scene.getObjectByName(name).quaternion.angleTo(before[index]);
    if (name.startsWith(`FINGER_${finger}_`)) targetMoved ||= angle > 0.01;
    else assert.ok(angle < 0.001, `${clip.name} unexpectedly moved ${name}`);
  });
  assert.ok(targetMoved, `${clip.name} did not articulate its own finger joints`);
  action.stop();
}

console.log("V2N GLB passed embedded-resource, replacement-node, root-scale, independent manual-pose, and five independent clip checks.");
