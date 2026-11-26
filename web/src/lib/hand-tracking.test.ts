import { describe, expect, it } from "vitest";
import { CLOSED_HAND, OPEN_HAND, type HandPose } from "@/lib/motion";
import {
  DEFAULT_ONE_EURO_SETTINGS,
  HandPoseProcessor,
  getHandTrackingStatus,
  interpretHandLandmarks,
  type HandLandmark,
} from "@/lib/hand-tracking";

function extendedHand(): HandLandmark[] {
  const landmarks = Array.from({ length: 21 }, () => ({ x: 0, y: 0, z: 0 }));
  for (const [root, joint, next, tip] of [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 10, 11, 12],
    [13, 14, 15, 16],
    [17, 18, 19, 20],
  ]) {
    landmarks[root] = { x: 0, y: 0, z: 0 };
    landmarks[joint] = { x: 0, y: 1, z: 0 };
    landmarks[next] = { x: 0, y: 2, z: 0 };
    landmarks[tip] = { x: 0, y: 3, z: 0 };
  }
  return landmarks;
}

function closedHandAtNinetyDegrees(): HandLandmark[] {
  const landmarks = extendedHand();
  for (const [root, firstJoint, secondJoint, tip] of [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 10, 11, 12],
    [13, 14, 15, 16],
    [17, 18, 19, 20],
  ]) {
    // Dos giros de 90° representan una flexión de puño habitual en la vista 2D.
    landmarks[root] = { x: 0, y: 0, z: 0 };
    landmarks[firstJoint] = { x: 0, y: 1, z: 0 };
    landmarks[secondJoint] = { x: 1, y: 1, z: 0 };
    landmarks[tip] = { x: 1, y: 0, z: 0 };
  }
  return landmarks;
}

describe("hand landmark interpretation", () => {
  it("maps a straight hand to five open normalized controls", () => {
    expect(interpretHandLandmarks(extendedHand())).toEqual(OPEN_HAND);
  });

  it("detects each finger independently from its own joint angle", () => {
    const flexionPoints: Array<[keyof HandPose, number]> = [
      ["thumb", 3],
      ["index", 7],
      ["middle", 11],
      ["ring", 15],
      ["pinky", 19],
    ];

    for (const [finger, pointIndex] of flexionPoints) {
      const landmarks = extendedHand();
      landmarks[pointIndex] = { x: 1, y: 1, z: 0 };
      const pose = interpretHandLandmarks(landmarks);

      expect(pose).not.toBeNull();
      expect(pose?.[finger]).toBeGreaterThan(0.7);
      for (const [otherFinger] of flexionPoints) {
        if (otherFinger !== finger) expect(pose?.[otherFinger]).toBe(0);
      }
    }
  });

  it("includes distal thumb and finger bending instead of reading only proximal joints", () => {
    const thumbCurl = extendedHand();
    thumbCurl[4] = { x: 1, y: 2, z: 0 };
    const thumbPose = interpretHandLandmarks(thumbCurl);
    expect(thumbPose?.thumb).toBeGreaterThan(0.25);
    expect(thumbPose?.index).toBe(0);

    const indexCurl = extendedHand();
    indexCurl[8] = { x: 1, y: 2, z: 0 };
    const indexPose = interpretHandLandmarks(indexCurl);
    expect(indexPose?.index).toBeGreaterThan(0.25);
    expect(indexPose?.middle).toBe(0);
  });

  it("maps a typical two-joint closed fist to full normalized closure", () => {
    expect(interpretHandLandmarks(closedHandAtNinetyDegrees())).toEqual({
      thumb: 1,
      index: 1,
      middle: 1,
      ring: 1,
      pinky: 1,
    });
  });

  it("rejects incomplete or non-finite landmark data", () => {
    expect(interpretHandLandmarks(extendedHand().slice(0, 20))).toBeNull();
    const invalid = extendedHand();
    invalid[8].x = Number.NaN;
    expect(interpretHandLandmarks(invalid)).toBeNull();
  });

});

describe("hand tracking state", () => {
  it("distinguishes active tracking, search grace, and a lost hand", () => {
    expect(getHandTrackingStatus(true, 100, 1000)).toBe("tracking");
    expect(getHandTrackingStatus(false, null, 1000)).toBe("searching");
    expect(getHandTrackingStatus(false, 900, 1200)).toBe("searching");
    expect(getHandTrackingStatus(false, 100, 1000)).toBe("lost");
  });
});

describe("camera pose processing", () => {
  it("rejects invalid values, invalid timestamps, stale frames, and old frames", () => {
    const processor = new HandPoseProcessor(100);
    expect(processor.process({ ...OPEN_HAND, index: Number.NaN }, 10, 10)).toMatchObject({ accepted: false, reason: "invalid-pose" });
    expect(processor.process(OPEN_HAND, Number.NaN, 20)).toMatchObject({ accepted: false, reason: "invalid-timestamp" });
    expect(processor.process(OPEN_HAND, 0, 101)).toMatchObject({ accepted: false, reason: "stale" });
    expect(processor.process(OPEN_HAND, 50, 50).accepted).toBe(true);
    expect(processor.process(OPEN_HAND, 50, 60)).toMatchObject({ accepted: false, reason: "out-of-order" });
  });

  it("applies a One Euro filter, dead zone, and configured velocity limit", () => {
    const processor = new HandPoseProcessor();
    expect(processor.configure({ ...DEFAULT_ONE_EURO_SETTINGS, minCutoffHz: 5, beta: 0, deadZone: 0.02, maxSpeedPerSecond: 0.5 })).toBe(true);
    expect(processor.configure({ ...DEFAULT_ONE_EURO_SETTINGS, maxSpeedPerSecond: -1 })).toBe(false);
    processor.process(OPEN_HAND, 0, 0);
    const smallNoise = processor.process({ ...OPEN_HAND, index: 0.01 }, 100, 100);
    expect(smallNoise.accepted && smallNoise.filteredPose.index).toBe(0);

    const jump = processor.process({ ...OPEN_HAND, index: 1 }, 200, 200);
    expect(jump.accepted && jump.filteredPose.index).toBeLessThan(0.051);
    expect(jump.accepted && jump.filteredPose.index).toBeGreaterThan(0);
  });

  it("keeps One Euro and speed settings independent for each finger", () => {
    const processor = new HandPoseProcessor();
    processor.configure({ ...DEFAULT_ONE_EURO_SETTINGS, minCutoffHz: 5, beta: 0, deadZone: 0, maxSpeedPerSecond: 5 });
    processor.configure({ ...DEFAULT_ONE_EURO_SETTINGS, minCutoffHz: 1, beta: 0, deadZone: 0, maxSpeedPerSecond: 0.1 }, "thumb");
    expect(processor.getSettings("thumb").maxSpeedPerSecond).toBe(0.1);
    expect(processor.getSettings("index").maxSpeedPerSecond).toBe(5);
    processor.process(OPEN_HAND, 0, 0);
    const changed = processor.process(CLOSED_HAND, 33, 33);
    expect(changed.accepted).toBe(true);
    if (changed.accepted) {
      expect(changed.filteredPose.thumb).toBeLessThan(0.004);
      expect(changed.filteredPose.index).toBeGreaterThan(changed.filteredPose.thumb);
    }
  });

  it("uses optional open/closed references without inventing missing calibration", () => {
    const processor = new HandPoseProcessor();
    const sample = { thumb: 0.2, index: 0.3, middle: 0.4, ring: 0.5, pinky: 0.6 };
    processor.calibrateOpen(sample);
    processor.recover(0);
    expect(processor.process(sample, 33, 33)).toMatchObject({ accepted: true, rawPose: sample });
    processor.calibrateClosed({ thumb: 0.8, index: 0.9, middle: 1, ring: 0.9, pinky: 0.8 });
    expect(processor.getCalibration().open).toEqual(sample);
    expect(processor.getCalibration().closed?.index).toBe(0.9);
    processor.clearCalibration();
    expect(processor.getCalibration()).toEqual({ open: null, closed: null });
  });

  it("maps a captured midpoint to half flexion for each finger", () => {
    const processor = new HandPoseProcessor();
    processor.configure({ ...DEFAULT_ONE_EURO_SETTINGS, minCutoffHz: 5, beta: 0, deadZone: 0, maxSpeedPerSecond: 5 });
    const open = { thumb: 0.1, index: 0.2, middle: 0.1, ring: 0.2, pinky: 0.1 };
    const closed = { thumb: 0.9, index: 0.8, middle: 0.9, ring: 0.8, pinky: 0.9 };
    const midpoint = { thumb: 0.5, index: 0.5, middle: 0.5, ring: 0.5, pinky: 0.5 };
    processor.setCalibration({ open, closed });
    processor.recover(0);

    let result = processor.process(midpoint, 33, 33);
    for (let frame = 2; frame <= 40; frame += 1) {
      result = processor.process(midpoint, frame * 33, frame * 33);
    }
    expect(result.accepted).toBe(true);
    if (result.accepted) {
      for (const finger of Object.keys(midpoint) as Array<keyof HandPose>) {
        expect(result.filteredPose[finger]).toBeCloseTo(0.5, 1);
      }
    }
  });

  it("re-seeds after a tracking gap so recovery continues from the current output", () => {
    const processor = new HandPoseProcessor();
    processor.configure({ ...DEFAULT_ONE_EURO_SETTINGS, minCutoffHz: 10, beta: 0, deadZone: 0, maxSpeedPerSecond: 0.5 });
    processor.process(OPEN_HAND, 0, 0);
    const beforeLoss = processor.process(CLOSED_HAND, 100, 100);
    expect(beforeLoss.accepted && beforeLoss.filteredPose.index).toBeLessThan(0.051);
    processor.recover(1000);
    const recovered = processor.process(CLOSED_HAND, 1033, 1033);
    expect(recovered.accepted && recovered.filteredPose.index).toBeLessThan(0.07);
  });

  it("keeps the default step response under 600 ms at the camera's nominal frame interval", () => {
    const processor = new HandPoseProcessor();
    processor.process(OPEN_HAND, 0, 0);
    let responseTimeMs = Number.POSITIVE_INFINITY;
    for (let frame = 1; frame <= 30; frame += 1) {
      const elapsedMs = frame * 45;
      const result = processor.process(CLOSED_HAND, elapsedMs, elapsedMs);
      if (result.accepted && result.filteredPose.index >= 0.9) {
        responseTimeMs = elapsedMs;
        break;
      }
    }
    expect(responseTimeMs).toBeLessThan(600);
  });
});
