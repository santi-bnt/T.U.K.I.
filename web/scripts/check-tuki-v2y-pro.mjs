import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

globalThis.ProgressEvent ??= class ProgressEvent {};
const path = new URL('../public/models/tuki-v2y-pro.glb', import.meta.url);
const buf = readFileSync(path);
assert.equal(buf.toString('ascii', 0, 4), 'glTF');
const jsonLen = buf.readUInt32LE(12);
const doc = JSON.parse(buf.subarray(20, 20 + jsonLen).toString('utf8').trim());
assert.ok(doc.buffers.every(b => !b.uri), 'Unexpected external buffer');
const {scene, animations} = await new GLTFLoader().parseAsync(new Uint8Array(buf).buffer, '');
assert.equal(animations.length, 5, 'Five finger clips required');
for (const f of ['PULGAR', 'INDICE', 'MEDIO', 'ANULAR', 'MENIQUE']) {
  assert.ok(animations.some(a => a.name === `CLOSE_${f}`), `Missing CLOSE_${f}`);
  for (let i=1; i<=(f === 'PULGAR' ? 2 : 3); i++) {
    assert.ok(scene.getObjectByName(`FINGER_${f}_${String(i).padStart(2, '0')}`), `Missing ${f} joint ${i}`);
  }
}
for (const n of [
  'ForearmDoor_V2Y', 'ElectronicsDoor_V2Y', 'ServoBoard_5SG90_V2Y',
  'SERVOS_NOMINALES_V2Y', 'PRO_ARM_INNER_GASKET', 'PRO_CABINET_INNER_GASKET',
  'PRO_PLACEHOLDER_PCB'
]) {
  assert.ok(scene.getObjectByName(n), `Missing ${n}`);
}
console.log(`TUKI V2Y PRO OK: ${doc.nodes.length} nodes, ${doc.meshes.length} meshes, 5 finger clips`);
