/**
 * TUKI V2N -- adapter for Three.js / React Three Fiber.
 * Targets the named V2N-compatible finger chain in the active web-visual GLB.
 * Each finger has individually articulated segments.
 * The visual-model closure angles match its supplied CLOSE_* clip endpoints.
 * They are not SG90 angles or mechanically validated limits.
 *
 * Usage in your existing component:
 * const {scene} = useGLTF('/models/tuki-v2n.glb');
 * setTukiFingerClosure(scene, 'INDICE', .7);
 *
 * Do not play a glTF animation clip and update the same joints with this
 * controller simultaneously. Pick one motion system at a time.
 */
import { AnimationClip, Object3D, Quaternion, Vector3 } from 'three';

export type TukiFinger = 'PULGAR' | 'INDICE' | 'MEDIO' | 'ANULAR' | 'MENIQUE';
export type TukiPose = Record<TukiFinger, number>;

const AXIS_X = new Vector3(1, 0, 0);
const MAX_ANGLES: Record<TukiFinger, number[]> = {
  PULGAR: [82, 88],
  INDICE: [82, 86, 78],
  MEDIO: [84, 86, 78],
  ANULAR: [82, 86, 78],
  MENIQUE: [80, 86, 78],
};
const BASE_KEY = '__tukiV2NBaseQuaternion';

export function setTukiFingerClosure(
  root: Object3D,
  finger: TukiFinger,
  closure: number,
  clips: readonly AnimationClip[] = [],
): void {
  const f = Math.max(0, Math.min(1, Number.isFinite(closure) ? closure : 0));
  MAX_ANGLES[finger].forEach((deg, index) => {
    const node = root.getObjectByName(`FINGER_${finger}_${String(index + 1).padStart(2, '0')}`);
    if (!node) return;
    if (!(BASE_KEY in node.userData)) {
      node.userData[BASE_KEY] = node.quaternion.toArray();
    }
    const base = new Quaternion().fromArray(node.userData[BASE_KEY]);
    const clip = clips.find((candidate) => candidate.name === `CLOSE_${finger}`);
    const track = clip?.tracks.find((candidate) => candidate.name === `${node.name}.quaternion`);
    if (track && track.values.length >= 4) {
      const endpoint = new Quaternion().fromArray(Array.from(track.values.slice(-4)));
      const fullDelta = base.clone().invert().multiply(endpoint);
      const partialDelta = new Quaternion().slerp(fullDelta, f);
      node.quaternion.copy(base.multiply(partialDelta));
      return;
    }
    const delta = new Quaternion().setFromAxisAngle(AXIS_X, -deg * f * Math.PI / 180);
    node.quaternion.copy(base.multiply(delta));
  });
};

export function setTukiPose(
  root: Object3D,
  pose: Partial<TukiPose>,
  clips: readonly AnimationClip[] = [],
): void {
  for (const finger of Object.keys(MAX_ANGLES) as TukiFinger[]) {
    if (pose[finger] !== undefined) setTukiFingerClosure(root, finger, pose[finger]!, clips);
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
