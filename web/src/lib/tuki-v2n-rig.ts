/**
 * TUKI V2N -- adapter for Three.js / React Three Fiber.
 * Targets the named V2N finger chain preserved in the active V2Y PRO GLB.
 * Each finger has individually articulated segments.
 * The maximum local rotations match the supplied CLOSE_* clip endpoints;
 * keep them aligned with those clips and the mesh-clearance checks.
 *
 * Usage in your existing component:
 * const {scene} = useGLTF('/models/tuki-v2n.glb');
 * setTukiFingerClosure(scene, 'INDICE', .7);
 *
 * Do not play a glTF animation clip and update the same joints with this
 * controller simultaneously. Pick one motion system at a time.
 */
import { Object3D, Quaternion, Vector3 } from 'three';

export type TukiFinger = 'PULGAR' | 'INDICE' | 'MEDIO' | 'ANULAR' | 'MENIQUE';
export type TukiPose = Record<TukiFinger, number>;

const AXIS_X = new Vector3(1, 0, 0);
const MAX_ANGLES: Record<TukiFinger, number[]> = {
  PULGAR: [70, 65],
  INDICE: [70, 60, 50],
  MEDIO: [72, 60, 50],
  ANULAR: [70, 60, 50],
  MENIQUE: [70, 58, 48],
};
const BASE_KEY = '__tukiV2NBaseQuaternion';

export function setTukiFingerClosure(
  root: Object3D,
  finger: TukiFinger,
  closure: number,
): void {
  const f = Math.max(0, Math.min(1, Number.isFinite(closure) ? closure : 0));
  MAX_ANGLES[finger].forEach((deg, index) => {
    const node = root.getObjectByName(`FINGER_${finger}_${String(index + 1).padStart(2, '0')}`);
    if (!node) return;
    if (!(BASE_KEY in node.userData)) {
      node.userData[BASE_KEY] = node.quaternion.toArray();
    }
    const base = new Quaternion().fromArray(node.userData[BASE_KEY]);
    const delta = new Quaternion().setFromAxisAngle(AXIS_X, -deg * f * Math.PI / 180);
    node.quaternion.copy(base.multiply(delta));
  });
};

export function setTukiPose(root: Object3D, pose: Partial<TukiPose>): void {
  for (const finger of Object.keys(MAX_ANGLES) as TukiFinger[]) {
    if (pose[finger] !== undefined) setTukiFingerClosure(root, finger, pose[finger]!);
  }
}

export function resetTukiPose(root: Object3D): void {
  setTukiPose(root, {PULGAR:0, INDICE:0, MEDIO:0, ANULAR:0, MENIQUE:0});
}

export function verifyTukiV2NRig(root: Object3D): string[] {
  const missing: string[] = [];
  for (const finger of Object.keys(MAX_ANGLES) as TukiFinger[]) {
    for (let i = 0; i < MAX_ANGLES[finger].length; i++) {
      const name = `FINGER_${finger}_${String(i+1).padStart(2,'0')}`;
      if (!root.getObjectByName(name)) missing.push(name);
    }
  }
  return missing;
}
