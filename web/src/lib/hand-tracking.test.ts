import { describe, expect, it } from "vitest";
import { CLOSED_HAND, OPEN_HAND, type Finger } from "@/lib/motion";
import {
  analyzeHandLandmarks,
  captureStableCalibrationValue,
  captureStableCalibrationPose,
  DEFAULT_ONE_EURO_SETTINGS,
  HandPoseProcessor,
  getHandTrackingStatus,
  interpretHandLandmarks,
  type HandLandmark,
} from "@/lib/hand-tracking";

type Curls = Record<Finger, number>;

const OPEN_CURLS: Curls = { thumb: 0, index: 0, middle: 0, ring: 0, pinky: 0 };
const MCP_LAYOUT = [
  { ids: [5, 6, 7, 8], x: -0.35, y: 1 },
  { ids: [9, 10, 11, 12], x: 0, y: 1 },
  { ids: [13, 14, 15, 16], x: 0.35, y: 0.95 },
  { ids: [17, 18, 19, 20], x: 0.7, y: 0.8 },
] as const;

function advance(point: HandLandmark, angleFromUp: number, length: number): HandLandmark {
  return {
    x: point.x + Math.sin(angleFromUp) * length,
    y: point.y + Math.cos(angleFromUp) * length,
    z: point.z,
  };
}

/** Builds a palm and articulated digit chains in hand-relative units, not coincident points. */
function realisticHand(
  curls: Partial<Curls> = {},
  thumbDirection: "out" | "up" = "out",
): HandLandmark[] {
  const closure = { ...OPEN_CURLS, ...curls };
  const landmarks = Array.from({ length: 21 }, () => ({ x: 0, y: 0, z: 0 }));
  landmarks[0] = { x: 0, y: 0, z: 0 };
  landmarks[1] = { x: -0.4, y: 0.4, z: 0 };

  const thumbStartAngle = thumbDirection === "up" ? 0 : -40 * Math.PI / 180;
  const thumbTurn = closure.thumb * 90 * Math.PI / 180;
  let thumbPoint = landmarks[1];
  for (let index = 0; index < 3; index += 1) {
    const segmentAngle = thumbStartAngle + thumbTurn * index;
    thumbPoint = advance(thumbPoint, segmentAngle, 0.38);
    landmarks[index + 2] = thumbPoint;
  }

  for (const [digitIndex, digit] of MCP_LAYOUT.entries()) {
    let point: HandLandmark = { x: digit.x, y: digit.y, z: 0 };
    landmarks[digit.ids[0]] = point;
    let segmentAngle = 0;
    for (let segment = 1; segment < digit.ids.length; segment += 1) {
      if (segment > 1) segmentAngle -= closure[["index", "middle", "ring", "pinky"][digitIndex] as Exclude<Finger, "thumb">] * Math.PI / 2;
      point = advance(point, segmentAngle, 0.65);
      landmarks[digit.ids[segment]] = point;
    }
  }

  return landmarks;
}

function transformHand(
  landmarks: readonly HandLandmark[],
  scale: number,
  rotation: { x: number; y: number; z: number },
  aspectRatio = 1,
): HandLandmark[] {
  return landmarks.map(({ x, y, z }) => {
    let next = { x: x * scale, y: y * scale, z: z * scale };
    const cosZ = Math.cos(rotation.z);
    const sinZ = Math.sin(rotation.z);
    next = { ...next, x: next.x * cosZ - next.y * sinZ, y: next.x * sinZ + next.y * cosZ };
    const cosX = Math.cos(rotation.x);
    const sinX = Math.sin(rotation.x);
    next = { ...next, y: next.y * cosX - next.z * sinX, z: next.y * sinX + next.z * cosX };
    const cosY = Math.cos(rotation.y);
    const sinY = Math.sin(rotation.y);
    next = { ...next, x: next.x * cosY + next.z * sinY, z: -next.x * sinY + next.z * cosY };
    return { x: next.x + 0.5, y: (next.y + 0.4) * aspectRatio, z: next.z - 0.2 };
  });
}

describe("MediaPipe landmark interpretation", () => {
  it("maps an anatomically spaced open hand to open controls", () => {
    const pose = interpretHandLandmarks(realisticHand());
    expect(pose).not.toBeNull();
    for (const finger of Object.keys(OPEN_HAND) as Finger[]) expect(pose![finger]).toBeLessThan(0.08);
  });

  it("maps a realistic fist close to full closure, including the opposed thumb", () => {
    const analysis = analyzeHandLandmarks(realisticHand({ thumb: 1, index: 1, middle: 1, ring: 1, pinky: 1 }));
    expect(analysis).not.toBeNull();
    for (const finger of Object.keys(CLOSED_HAND) as Finger[]) {
      expect(analysis!.pose[finger], `${finger} should close in a fist`).toBeGreaterThan(0.9);
    }
    expect(analysis!.thumbOppositionRatio).toBeLessThan(0.55);
  });

  it("uses thumb opposition while keeping an extended thumb low", () => {
    const opposed = analyzeHandLandmarks(realisticHand({ thumb: 1 }, "out"))!;
    const extended = analyzeHandLandmarks(realisticHand({ index: 1, middle: 1, ring: 1, pinky: 1 }, "up"))!;
    expect(opposed.pose.thumb).toBeGreaterThan(0.9);
    expect(extended.pose.thumb).toBeLessThan(0.4);
    for (const finger of ["index", "middle", "ring", "pinky"] as const) {
      expect(opposed.pose[finger]).toBeLessThan(0.08);
      expect(extended.pose[finger]).toBeGreaterThan(0.9);
    }
    expect(opposed.thumbOppositionRatio).toBeLessThan(extended.thumbOppositionRatio);
  });

  it("keeps a half-curled hand distinct from a fist", () => {
    const half = realisticHand({ index: 0.5, middle: 0.5, ring: 0.5, pinky: 0.5, thumb: 0.5 });
    const pose = interpretHandLandmarks(half)!;
    for (const finger of Object.keys(pose) as Finger[]) {
      expect(pose[finger], `${finger} partial flexion`).toBeGreaterThan(0.2);
      expect(pose[finger], `${finger} must not be classified as closed`).toBeLessThan(0.85);
    }
  });

  it("keeps each finger independent in open and partially curled poses", () => {
    const fingerToCurl: Array<[Finger, keyof Curls]> = [
      ["index", "index"], ["middle", "middle"], ["ring", "ring"], ["pinky", "pinky"],
    ];
    for (const [finger, key] of fingerToCurl) {
      const curls = { ...OPEN_CURLS, [key]: 0.8 };
      const pose = interpretHandLandmarks(realisticHand(curls))!;
      expect(pose[finger]).toBeGreaterThan(0.6);
      for (const other of Object.keys(pose) as Finger[]) {
        if (other !== finger && other !== "thumb") expect(pose[other]).toBeLessThan(0.08);
      }
    }
  });

  it("is stable under scale, translation, 3D orientation, and camera aspect correction", () => {
    const reference = analyzeHandLandmarks(realisticHand({ thumb: 1, index: 1, middle: 1, ring: 1, pinky: 1 }))!;
    const rotatedScaled = transformHand(
      realisticHand({ thumb: 1, index: 1, middle: 1, ring: 1, pinky: 1 }),
      2.7,
      { x: 0.6, y: -0.4, z: 1.1 },
      16 / 9,
    );
    const transformed = analyzeHandLandmarks(rotatedScaled, 16 / 9)!;
    for (const finger of Object.keys(reference.pose) as Finger[]) {
      expect(transformed.pose[finger]).toBeCloseTo(reference.pose[finger], 2);
    }
  });

  it("rejects malformed landmarks and invalid aspect ratios", () => {
    const open = realisticHand();
    expect(interpretHandLandmarks(open.slice(0, 20))).toBeNull();
    open[8].x = Number.NaN;
    expect(interpretHandLandmarks(open)).toBeNull();
    expect(interpretHandLandmarks(realisticHand(), Number.NaN)).toBeNull();
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
  it("uses a stable median for calibration and rejects a moving hand window", () => {
    const stable = Array.from({ length: 7 }, (_, index) => ({
      thumb: 0.2 + (index % 2) * 0.01,
      index: 0.3,
      middle: 0.4,
      ring: 0.5,
      pinky: 0.6,
    }));
    expect(captureStableCalibrationPose(stable)?.thumb).toBe(0.2);
    const stableThumb = captureStableCalibrationValue(stable, "thumb");
    expect(stableThumb?.value).toBe(0.2);
    expect(stableThumb?.spread).toBeCloseTo(0.01);
    expect(captureStableCalibrationValue(stable.slice(0, 4), "thumb")).toBeNull();
    expect(captureStableCalibrationPose(stable.slice(0, 4))).toBeNull();
    expect(captureStableCalibrationPose([...stable.slice(0, 6), { ...stable[6], thumb: 0.8 }])).toBeNull();
  });

  it("rejects invalid values, invalid timestamps, stale frames, and old frames", () => {
    const processor = new HandPoseProcessor(100);
    expect(processor.process({ ...OPEN_HAND, index: Number.NaN }, 10, 10)).toMatchObject({ accepted: false, reason: "invalid-pose" });
    expect(processor.process(OPEN_HAND, Number.NaN, 20)).toMatchObject({ accepted: false, reason: "invalid-timestamp" });
    expect(processor.process(OPEN_HAND, 0, 101)).toMatchObject({ accepted: false, reason: "stale" });
    expect(processor.process(OPEN_HAND, 50, 50).accepted).toBe(true);
    expect(processor.process(OPEN_HAND, 50, 60)).toMatchObject({ accepted: false, reason: "out-of-order" });
  });

  it("applies One Euro, deadband, and speed limits without closing a partial pose", () => {
    const processor = new HandPoseProcessor();
    processor.configure({ ...DEFAULT_ONE_EURO_SETTINGS, minCutoffHz: 5, beta: 0, deadZone: 0.02, maxSpeedPerSecond: 0.5 });
    processor.process(OPEN_HAND, 0, 0);
    const smallNoise = processor.process({ ...OPEN_HAND, index: 0.01 }, 100, 100);
    expect(smallNoise.accepted && smallNoise.filteredPose.index).toBe(0);
    for (let frame = 2; frame <= 20; frame += 1) {
      processor.process({ ...OPEN_HAND, index: 0.55 }, frame * 100, frame * 100);
    }
    const partial = processor.process({ ...OPEN_HAND, index: 0.55 }, 2100, 2100);
    expect(partial.accepted && partial.filteredPose.index).toBeLessThan(0.85);
  });

  it("lets intentional 0 and 1 endpoints pass smoothing/deadband while respecting the speed cap", () => {
    const processor = new HandPoseProcessor();
    processor.configure({ ...DEFAULT_ONE_EURO_SETTINGS, deadZone: 0.08, maxSpeedPerSecond: 2.5 });
    processor.process(OPEN_HAND, 0, 0);
    let closed = processor.process(CLOSED_HAND, 33, 33);
    expect(closed.accepted && closed.filteredPose.thumb).toBeLessThanOrEqual(0.083);
    for (let frame = 2; frame <= 20; frame += 1) closed = processor.process(CLOSED_HAND, frame * 33, frame * 33);
    expect(closed.accepted && closed.filteredPose).toEqual(CLOSED_HAND);
    let open = processor.process(OPEN_HAND, 693, 693);
    for (let frame = 22; frame <= 40; frame += 1) open = processor.process(OPEN_HAND, frame * 33, frame * 33);
    expect(open.accepted && open.filteredPose).toEqual(OPEN_HAND);
  });

  it("keeps filter settings and calibration across a tracking-session reset", () => {
    const processor = new HandPoseProcessor();
    const settings = { ...DEFAULT_ONE_EURO_SETTINGS, maxSpeedPerSecond: 1.1 };
    const open = { ...OPEN_HAND, thumb: 0.1 };
    const closed = { ...CLOSED_HAND, thumb: 0.9 };
    expect(processor.configure(settings, "thumb")).toBe(true);
    expect(processor.setCalibration({ open, closed })).toBe(true);
    processor.process(open, 0, 0);
    processor.reset();
    expect(processor.getSettings("thumb")).toEqual(settings);
    expect(processor.getCalibration()).toEqual({ open, closed });
    expect(processor.process(open, 0, 0).accepted).toBe(true);
  });

  it("reports insufficient per-finger calibration span without blocking other fingers", () => {
    const processor = new HandPoseProcessor();
    const open = { ...OPEN_HAND, thumb: 0.2 };
    const almostSame = { ...CLOSED_HAND, thumb: 0.25 };
    expect(processor.calibrateOpen(open)).toBe(true);
    expect(processor.calibrateClosed(almostSame)).toBe(true);
    const status = processor.getCalibrationStatus();
    expect(status.thumb).toMatchObject({ open: 0.2, closed: 0.25, usable: false });
    expect(status.thumb.span).toBeCloseTo(0.05);
    expect(status.index.usable).toBe(true);
    expect(processor.calibrateFinger("thumb", "closed", 0.9)).toBe(true);
    expect(processor.getCalibrationStatus().thumb.usable).toBe(true);
    processor.clearCalibrationForFinger("thumb");
    expect(processor.getCalibrationStatus().thumb).toMatchObject({ open: null, closed: null, span: null, usable: false });
  });

  it("exposes detected, calibrated, and filtered poses as separate values", () => {
    const processor = new HandPoseProcessor();
    processor.configure({ ...DEFAULT_ONE_EURO_SETTINGS, minCutoffHz: 5, beta: 0, deadZone: 0, maxSpeedPerSecond: 10 });
    processor.setCalibration({
      open: { thumb: 0.1 },
      closed: { thumb: 0.9 },
    });
    processor.reset();
    const result = processor.process({ ...OPEN_HAND, thumb: 0.5, index: 0.6 }, 33, 33);
    expect(result.accepted).toBe(true);
    if (result.accepted) {
      expect(result.rawPose.thumb).toBe(0.5);
      expect(result.calibratedPose.thumb).toBeCloseTo(0.5);
      expect(result.calibratedPose.index).toBe(0.6);
      expect(result.filteredPose.thumb).toBeLessThan(result.calibratedPose.thumb);
    }
    const nextFrame = processor.process({ ...OPEN_HAND, thumb: 0.5, index: 0.6 }, 66, 66);
    expect(nextFrame.accepted && nextFrame.filteredPose.thumb).toBeCloseTo(0.5);
  });

  it("maps a calibrated midpoint to half flexion and clamps in either capture direction", () => {
    const processor = new HandPoseProcessor();
    processor.configure({ ...DEFAULT_ONE_EURO_SETTINGS, minCutoffHz: 5, beta: 0, deadZone: 0, maxSpeedPerSecond: 5 });
    const open = { thumb: 0.1, index: 0.2, middle: 0.1, ring: 0.2, pinky: 0.1 };
    const closed = { thumb: 0.9, index: 0.8, middle: 0.9, ring: 0.8, pinky: 0.9 };
    processor.setCalibration({ open, closed });
    processor.reset();
    let result = processor.process({ thumb: 0.5, index: 0.5, middle: 0.5, ring: 0.5, pinky: 0.5 }, 33, 33);
    for (let frame = 2; frame <= 40; frame += 1) {
      result = processor.process({ thumb: 0.5, index: 0.5, middle: 0.5, ring: 0.5, pinky: 0.5 }, frame * 33, frame * 33);
    }
    expect(result.accepted).toBe(true);
    if (result.accepted) for (const finger of Object.keys(open) as Finger[]) expect(result.filteredPose[finger]).toBeCloseTo(0.5, 1);
  });

  it("re-seeds after a tracking gap and does not add excess One Euro delay", () => {
    const processor = new HandPoseProcessor();
    processor.configure({ ...DEFAULT_ONE_EURO_SETTINGS, minCutoffHz: 10, beta: 0, deadZone: 0, maxSpeedPerSecond: 0.5 });
    processor.process(OPEN_HAND, 0, 0);
    const beforeLoss = processor.process(CLOSED_HAND, 100, 100);
    expect(beforeLoss.accepted && beforeLoss.filteredPose.index).toBeLessThan(0.051);
    processor.recover(1000);
    const recovered = processor.process(CLOSED_HAND, 1033, 1033);
    expect(recovered.accepted && recovered.filteredPose.index).toBeLessThan(0.07);

    const fast = new HandPoseProcessor();
    fast.process(OPEN_HAND, 0, 0);
    let responseTimeMs = Number.POSITIVE_INFINITY;
    for (let frame = 1; frame <= 30; frame += 1) {
      const elapsedMs = frame * 45;
      const result = fast.process(CLOSED_HAND, elapsedMs, elapsedMs);
      if (result.accepted && result.filteredPose.index >= 0.9) {
        responseTimeMs = elapsedMs;
        break;
      }
    }
    expect(responseTimeMs).toBeLessThan(600);
  });
});
