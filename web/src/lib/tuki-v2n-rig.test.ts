import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { Quaternion, type Object3D } from "three";
import { setTukiFingerClosure, setTukiPose, type TukiFinger } from "@/lib/tuki-v2n-rig";

const FINGERS: TukiFinger[] = ["PULGAR", "INDICE", "MEDIO", "ANULAR", "MENIQUE"];
const JOINT_COUNT: Record<TukiFinger, number> = {
  PULGAR: 2,
  INDICE: 3,
  MEDIO: 3,
  ANULAR: 3,
  MENIQUE: 3,
};
const TEST_CLOSURES = [0, 0.25, 0.5, 0.75, 1];
let sourceScene: Object3D;
let clips = new Map<string, Map<string, Quaternion>>();

function jointName(finger: TukiFinger, joint: number): string {
  return `FINGER_${finger}_${String(joint).padStart(2, "0")}`;
}

function getJoint(root: Object3D, finger: TukiFinger, joint: number): Object3D {
  const result = root.getObjectByName(jointName(finger, joint));
  if (!result) throw new Error(`Missing GLB joint ${jointName(finger, joint)}`);
  return result;
}

function rotationDifference(first: Quaternion, second: Quaternion): number {
  const firstValues = first.toArray();
  const secondValues = second.toArray();
  const direct = Math.max(...firstValues.map((value, index) => Math.abs(value - secondValues[index])));
  const negated = Math.max(...firstValues.map((value, index) => Math.abs(value + secondValues[index])));
  return Math.min(direct, negated);
}

beforeAll(async () => {
  vi.stubGlobal("ProgressEvent", class ProgressEvent {});
  const bytes = readFileSync(resolve(process.cwd(), "public/models/tuki-v2y-pro.glb"));
  const { scene, animations } = await new GLTFLoader().parseAsync(new Uint8Array(bytes).buffer, "");
  sourceScene = scene;

  clips = new Map(animations.map((clip) => [
    clip.name,
    new Map(clip.tracks.map((track) => {
      const values = track.values;
      return [
        track.name.replace(".quaternion", ""),
        new Quaternion(
          values[values.length - 4],
          values[values.length - 3],
          values[values.length - 2],
          values[values.length - 1],
        ),
      ];
    })),
  ]));

});

afterAll(() => vi.unstubAllGlobals());

describe("TUKI V2Y web finger rig", () => {
  it("moves every independent finger through all five normalized closure values", () => {
    for (const finger of FINGERS) {
      const model = sourceScene.clone(true);
      const untouched = new Map(FINGERS.filter((item) => item !== finger).flatMap((item) =>
        Array.from({ length: JOINT_COUNT[item] }, (_, index) => [
          jointName(item, index + 1),
          getJoint(model, item, index + 1).quaternion.clone(),
        ] as const),
      ));
      const fullClosure = clips.get(`CLOSE_${finger}`)!;

      for (const closure of TEST_CLOSURES) {
        setTukiFingerClosure(model, finger, closure);
        for (let index = 0; index < JOINT_COUNT[finger]; index += 1) {
          const joint = getJoint(model, finger, index + 1);
          const base = new Quaternion().fromArray(joint.userData.__tukiV2NBaseQuaternion);
          const actualDelta = base.clone().invert().multiply(joint.quaternion);
          const fullTarget = fullClosure.get(joint.name)!;
          const fullDelta = base.clone().invert().multiply(fullTarget);
          const expectedDelta = new Quaternion().slerp(fullDelta, closure);
          expect(rotationDifference(actualDelta, expectedDelta), `${finger} joint ${index + 1} at ${closure}`).toBeLessThan(1e-5);
        }
        for (const [name, quaternion] of untouched) {
          expect(model.getObjectByName(name)!.quaternion.angleTo(quaternion)).toBeLessThan(1e-7);
        }
      }
    }

    for (const closure of TEST_CLOSURES) {
      const model = sourceScene.clone(true);
      setTukiPose(model, Object.fromEntries(FINGERS.map((item) => [item, closure])) as Record<TukiFinger, number>);
      for (const finger of FINGERS) {
        const fullTarget = clips.get(`CLOSE_${finger}`)!;
        for (let jointIndex = 1; jointIndex <= JOINT_COUNT[finger]; jointIndex += 1) {
          const joint = getJoint(model, finger, jointIndex);
          const base = new Quaternion().fromArray(joint.userData.__tukiV2NBaseQuaternion);
          const actualDelta = base.clone().invert().multiply(joint.quaternion);
          const fullDelta = base.clone().invert().multiply(fullTarget.get(joint.name)!);
          const expectedDelta = new Quaternion().slerp(fullDelta, closure);
          expect(rotationDifference(actualDelta, expectedDelta), `${finger} simultaneous pose at ${closure}`).toBeLessThan(1e-5);
        }
      }
    }
  });

  it("matches the supplied CLOSE clips at full closure", () => {
    const model = sourceScene.clone(true);
    setTukiPose(model, Object.fromEntries(FINGERS.map((finger) => [finger, 1])) as Record<TukiFinger, number>);

    for (const finger of FINGERS) {
      const clip = clips.get(`CLOSE_${finger}`);
      expect(clip, `Missing CLOSE_${finger}`).toBeDefined();
      for (let joint = 1; joint <= JOINT_COUNT[finger]; joint += 1) {
        const expected = clip!.get(jointName(finger, joint));
        expect(expected, `Missing animation track for ${jointName(finger, joint)}`).toBeDefined();
        expect(getJoint(model, finger, joint).quaternion.angleTo(expected!)).toBeLessThan(0.002);
      }
    }
  });

});
