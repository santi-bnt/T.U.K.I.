import { clampPose, FINGERS, OPEN_HAND, type Finger, type HandPose } from "@/lib/motion";

export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export type HandTrackingStatus = "searching" | "tracking" | "lost";

const EXTENDED_ANGLE_DEGREES = 165;
// Una articulación humana suele aproximarse a 90° al cerrar el puño; 65°
// exigía una flexión extrema y dejaba el valor normalizado cerca de 0.75.
const CURLED_ANGLE_DEGREES = 120;
const FINGER_TIP_OPEN_DISTANCE = 2.35;
const FINGER_TIP_CLOSED_DISTANCE = 1.15;
const THUMB_OPPOSITION_OPEN_DISTANCE = 1.2;
const THUMB_OPPOSITION_CLOSED_DISTANCE = 0.55;
const MIN_CALIBRATION_SPAN = 0.08;
const TRACKING_LOSS_GRACE_MS = 650;

export interface OneEuroSettings {
  minCutoffHz: number;
  beta: number;
  derivativeCutoffHz: number;
  deadZone: number;
  maxSpeedPerSecond: number;
}

export const DEFAULT_ONE_EURO_SETTINGS: OneEuroSettings = {
  minCutoffHz: 1.2,
  beta: 0.025,
  derivativeCutoffHz: 1,
  deadZone: 0.012,
  maxSpeedPerSecond: 2.5,
};

export type FingerCalibration = { open: HandPose; closed: HandPose };

export type PoseProcessingResult =
  | { accepted: true; rawPose: HandPose; filteredPose: HandPose }
  | { accepted: false; reason: "invalid-pose" | "invalid-timestamp" | "stale" | "out-of-order" };

const fingerJoints = {
  // Each digit uses both bending joints; thumb landmarks are CMC/MCP/IP/tip.
  thumb: [[1, 2, 3], [2, 3, 4]],
  index: [[5, 6, 7], [6, 7, 8]],
  middle: [[9, 10, 11], [10, 11, 12]],
  ring: [[13, 14, 15], [14, 15, 16]],
  pinky: [[17, 18, 19], [18, 19, 20]],
} as const;

function normalizedFlexion(angleDegrees: number): number {
  return (EXTENDED_ANGLE_DEGREES - angleDegrees) /
    (EXTENDED_ANGLE_DEGREES - CURLED_ANGLE_DEGREES);
}

function normalizedRange(value: number, low: number, high: number): number {
  return Math.max(0, Math.min(1, (value - low) / (high - low)));
}

function normalizedProximity(distance: number, openDistance: number, closedDistance: number): number {
  return 1 - normalizedRange(distance, closedDistance, openDistance);
}

function distance(first: HandLandmark, second: HandLandmark): number {
  return Math.hypot(first.x - second.x, first.y - second.y, first.z - second.z);
}

function jointAngleDegrees(
  first: HandLandmark,
  joint: HandLandmark,
  last: HandLandmark,
): number {
  const firstVector = {
    x: first.x - joint.x,
    y: first.y - joint.y,
    z: first.z - joint.z,
  };
  const lastVector = {
    x: last.x - joint.x,
    y: last.y - joint.y,
    z: last.z - joint.z,
  };

  const firstLength = Math.hypot(firstVector.x, firstVector.y, firstVector.z);
  const lastLength = Math.hypot(lastVector.x, lastVector.y, lastVector.z);
  if (firstLength === 0 || lastLength === 0) return EXTENDED_ANGLE_DEGREES;

  const dotProduct =
    firstVector.x * lastVector.x +
    firstVector.y * lastVector.y +
    firstVector.z * lastVector.z;
  const cosine = Math.max(-1, Math.min(1, dotProduct / (firstLength * lastLength)));
  return (Math.acos(cosine) * 180) / Math.PI;
}

/** Keeps a short stable sample window from producing a one-frame calibration jump. */
export function captureStableCalibrationPose(samples: readonly HandPose[]): HandPose | null {
  if (samples.length < 5 || samples.some((sample) => !isNormalizedPose(sample))) return null;
  const recentSamples = samples.slice(-9);
  const pose = {} as HandPose;
  for (const finger of FINGERS) {
    const values = recentSamples.map((sample) => sample[finger]).sort((a, b) => a - b);
    if (values[values.length - 1] - values[0] > 0.22) return null;
    pose[finger] = values[Math.floor(values.length / 2)];
  }
  return pose;
}

/**
 * Converts MediaPipe's 21 landmarks into the existing normalized pose shape.
 * Long fingers use joint bend plus palm-relative tip distance; the thumb also
 * uses opposition. These estimates are visual heuristics, not physical measurements.
 */
export function interpretHandLandmarks(
  landmarks: readonly HandLandmark[],
  imageAspectRatio = 1,
): HandPose | null {
  return analyzeHandLandmarks(landmarks, imageAspectRatio)?.pose ?? null;
}

export interface HandLandmarkAnalysis {
  pose: HandPose;
  jointAnglesDegrees: Record<keyof HandPose, number[]>;
  thumbOppositionRatio: number;
  palmLength: number;
}

/**
 * Estimates normalized flexion and exposes its measurements for diagnostics.
 * MediaPipe x/z are width-normalized while y is height-normalized; aspect correction
 * avoids distorting angles and normalized distances on non-square camera frames.
 */
export function analyzeHandLandmarks(
  landmarks: readonly HandLandmark[],
  imageAspectRatio = 1,
): HandLandmarkAnalysis | null {
  if (landmarks.length < 21) return null;
  if (landmarks.some(({ x, y, z }) => ![x, y, z].every(Number.isFinite))) {
    return null;
  }
  if (!Number.isFinite(imageAspectRatio) || imageAspectRatio < 0.1 || imageAspectRatio > 10) return null;

  const points = landmarks.map(({ x, y, z }) => ({ x, y: y / imageAspectRatio, z }));
  const wrist = points[0];
  const palmLength = distance(wrist, points[9]);
  if (palmLength < 1e-6) return null;
  const palmCenter = [points[5], points[9], points[13], points[17]].reduce(
    (center, point) => ({
      x: center.x + point.x / 4,
      y: center.y + point.y / 4,
      z: center.z + point.z / 4,
    }),
    { x: 0, y: 0, z: 0 },
  );
  const thumbOppositionRatio = distance(points[4], palmCenter) / palmLength;

  const pose = {} as HandPose;
  const anglesByFinger = {} as Record<keyof HandPose, number[]>;
  for (const [finger, joints] of Object.entries(fingerJoints) as Array<
    [keyof typeof fingerJoints, readonly (readonly [number, number, number])[]]
  >) {
    const angles = joints.map(([firstIndex, jointIndex, lastIndex]) =>
      jointAngleDegrees(points[firstIndex], points[jointIndex], points[lastIndex]),
    );
    anglesByFinger[finger] = angles;
    const angleFlexion = angles
      .map(normalizedFlexion)
      .reduce((sum, flexion) => sum + flexion, 0) / angles.length;

    if (finger === "thumb") {
      const opposition = normalizedProximity(
        thumbOppositionRatio,
        THUMB_OPPOSITION_OPEN_DISTANCE,
        THUMB_OPPOSITION_CLOSED_DISTANCE,
      );
      const strongestThumbBend = Math.max(...angles.map(normalizedFlexion));
      // Opposition catches a fist when perspective hides part of the thumb IP bend.
      pose.thumb = 0.55 * strongestThumbBend + 0.45 * opposition;
      continue;
    }

    const tipIndex = { index: 8, middle: 12, ring: 16, pinky: 20 }[finger];
    const tipToWristInPalmLengths = distance(points[tipIndex], wrist) / palmLength;
    const fingertipCurl = normalizedProximity(
      tipToWristInPalmLengths,
      FINGER_TIP_OPEN_DISTANCE,
      FINGER_TIP_CLOSED_DISTANCE,
    );
    // Joint angles remain primary; palm proximity separates curled fingers from a partial bend.
    pose[finger] = 0.8 * angleFlexion + 0.2 * fingertipCurl;
  }

  return {
    pose: clampPose(pose),
    jointAnglesDegrees: anglesByFinger,
    thumbOppositionRatio,
    palmLength,
  };
}

function isValidSettings(settings: OneEuroSettings): boolean {
  return [
    settings.minCutoffHz,
    settings.beta,
    settings.derivativeCutoffHz,
    settings.deadZone,
    settings.maxSpeedPerSecond,
  ].every(Number.isFinite) &&
    settings.minCutoffHz > 0 &&
    settings.beta >= 0 &&
    settings.derivativeCutoffHz > 0 &&
    settings.deadZone >= 0 && settings.deadZone <= 0.25 &&
    settings.maxSpeedPerSecond > 0;
}

function isNormalizedPose(pose: HandPose): boolean {
  return FINGERS.every((finger) =>
    Number.isFinite(pose[finger]) && pose[finger] >= 0 && pose[finger] <= 1,
  );
}

function lowPass(previous: number, current: number, alpha: number): number {
  return alpha * current + (1 - alpha) * previous;
}

function smoothingAlpha(cutoffHz: number, elapsedSeconds: number): number {
  const tau = 1 / (2 * Math.PI * cutoffHz);
  return 1 / (1 + tau / elapsedSeconds);
}

class OneEuroScalarFilter {
  private previousRaw: number | null = null;
  private previousTimestampMs: number | null = null;
  private filteredValue: number | null = null;
  private filteredDerivative = 0;

  reset(value: number, timestampMs: number): void {
    this.previousRaw = value;
    this.previousTimestampMs = timestampMs;
    this.filteredValue = value;
    this.filteredDerivative = 0;
  }

  clear(): void {
    this.previousRaw = null;
    this.previousTimestampMs = null;
    this.filteredValue = null;
    this.filteredDerivative = 0;
  }

  filter(value: number, timestampMs: number, settings: OneEuroSettings): number {
    if (this.filteredValue === null || this.previousTimestampMs === null || this.previousRaw === null) {
      this.reset(value, timestampMs);
      return value;
    }

    // A clamped detector/calibration endpoint is deliberate. Keep the One Euro
    // state there; the independent speed limiter still controls the visible travel.
    if (value <= 0 || value >= 1) {
      this.reset(value, timestampMs);
      return value;
    }

    const elapsedSeconds = (timestampMs - this.previousTimestampMs) / 1000;
    const rawDerivative = (value - this.previousRaw) / elapsedSeconds;
    const derivativeAlpha = smoothingAlpha(settings.derivativeCutoffHz, elapsedSeconds);
    this.filteredDerivative = lowPass(this.filteredDerivative, rawDerivative, derivativeAlpha);

    const cutoffHz = settings.minCutoffHz + settings.beta * Math.abs(this.filteredDerivative);
    const valueAlpha = smoothingAlpha(cutoffHz, elapsedSeconds);
    const nextValue = lowPass(this.filteredValue, value, valueAlpha);

    this.previousRaw = value;
    this.previousTimestampMs = timestampMs;
    this.filteredValue = nextValue;
    return nextValue;
  }
}

/** Filters each normalized finger independently and rejects invalid/stale frames. */
export class HandPoseProcessor {
  private readonly filters = Object.fromEntries(
    FINGERS.map((finger) => [finger, new OneEuroScalarFilter()]),
  ) as Record<Finger, OneEuroScalarFilter>;
  private readonly settingsByFinger = Object.fromEntries(
    FINGERS.map((finger) => [finger, { ...DEFAULT_ONE_EURO_SETTINGS }]),
  ) as Record<Finger, OneEuroSettings>;
  private openReference: HandPose | null = null;
  private closedReference: HandPose | null = null;
  private previousOutput: HandPose = { ...OPEN_HAND };
  private lastTimestampMs: number | null = null;
  private readonly maxFrameAgeMs: number;

  constructor(maxFrameAgeMs = 250) {
    this.maxFrameAgeMs = maxFrameAgeMs;
  }

  /** Resets per-run filter state while preserving user settings and calibration. */
  reset(): void {
    for (const finger of FINGERS) this.filters[finger].clear();
    this.previousOutput = { ...OPEN_HAND };
    this.lastTimestampMs = null;
  }

  configure(settings: OneEuroSettings, finger?: Finger): boolean {
    if (!isValidSettings(settings)) return false;
    if (finger) {
      this.settingsByFinger[finger] = { ...settings };
    } else {
      for (const item of FINGERS) this.settingsByFinger[item] = { ...settings };
    }
    return true;
  }

  getSettings(finger: Finger): OneEuroSettings {
    return { ...this.settingsByFinger[finger] };
  }

  setCalibration(calibration: FingerCalibration | null): boolean {
    if (calibration && (!isNormalizedPose(calibration.open) || !isNormalizedPose(calibration.closed))) {
      return false;
    }
    if (calibration && FINGERS.some((finger) => Math.abs(calibration.closed[finger] - calibration.open[finger]) < MIN_CALIBRATION_SPAN)) {
      return false;
    }
    this.openReference = calibration ? { ...calibration.open } : null;
    this.closedReference = calibration ? { ...calibration.closed } : null;
    return true;
  }

  calibrateOpen(pose: HandPose): boolean {
    if (!isNormalizedPose(pose)) return false;
    if (this.closedReference && FINGERS.some((finger) =>
      Math.abs(this.closedReference![finger] - pose[finger]) < MIN_CALIBRATION_SPAN,
    )) return false;
    this.openReference = { ...pose };
    return true;
  }

  calibrateClosed(pose: HandPose): boolean {
    if (!isNormalizedPose(pose)) return false;
    if (this.openReference && FINGERS.some((finger) =>
      Math.abs(pose[finger] - this.openReference![finger]) < MIN_CALIBRATION_SPAN,
    )) return false;
    this.closedReference = { ...pose };
    return true;
  }

  clearCalibration(): void {
    this.openReference = null;
    this.closedReference = null;
  }

  getCalibration(): { open: HandPose | null; closed: HandPose | null } {
    return {
      open: this.openReference ? { ...this.openReference } : null,
      closed: this.closedReference ? { ...this.closedReference } : null,
    };
  }

  process(rawPose: HandPose, timestampMs: number, nowMs = timestampMs): PoseProcessingResult {
    if (!isNormalizedPose(rawPose)) return { accepted: false, reason: "invalid-pose" };
    if (!Number.isFinite(timestampMs) || !Number.isFinite(nowMs) || timestampMs < 0) {
      return { accepted: false, reason: "invalid-timestamp" };
    }
    if (timestampMs > nowMs + 50) return { accepted: false, reason: "invalid-timestamp" };
    if (nowMs - timestampMs > this.maxFrameAgeMs) return { accepted: false, reason: "stale" };
    if (this.lastTimestampMs !== null && timestampMs <= this.lastTimestampMs) {
      return { accepted: false, reason: "out-of-order" };
    }

    const calibratedPose = this.applyCalibration(rawPose);
    const elapsedMs = this.lastTimestampMs === null ? 33 : timestampMs - this.lastTimestampMs;
    const output = { ...calibratedPose };

    for (const finger of FINGERS) {
      const settings = this.settingsByFinger[finger];
      const filtered = this.filters[finger].filter(calibratedPose[finger], timestampMs, settings);
      const previous = this.previousOutput[finger];
      const isIntentionalEndpoint = calibratedPose[finger] === 0 || calibratedPose[finger] === 1;
      const outsideDeadZone = isIntentionalEndpoint || Math.abs(filtered - previous) >= settings.deadZone;
      const desired = outsideDeadZone ? filtered : previous;
      const maxDelta = settings.maxSpeedPerSecond * (elapsedMs / 1000);
      output[finger] = previous + Math.max(-maxDelta, Math.min(maxDelta, desired - previous));
    }

    this.lastTimestampMs = timestampMs;
    this.previousOutput = output;
    return { accepted: true, rawPose: { ...rawPose }, filteredPose: output };
  }

  /** Re-seeds the filters at the current output after a tracking gap. */
  recover(timestampMs: number): void {
    if (!Number.isFinite(timestampMs) || timestampMs < 0) return;
    const seed = this.previousOutput;
    for (const finger of FINGERS) this.filters[finger].reset(seed[finger], timestampMs);
    this.lastTimestampMs = timestampMs;
  }

  private applyCalibration(pose: HandPose): HandPose {
    if (!this.openReference || !this.closedReference) return { ...pose };
    return Object.fromEntries(FINGERS.map((finger) => {
      const open = this.openReference![finger];
      const range = this.closedReference![finger] - open;
      const normalized = Math.abs(range) < 0.05 ? pose[finger] : (pose[finger] - open) / range;
      return [finger, Math.max(0, Math.min(1, normalized))];
    })) as HandPose;
  }
}

/** Keeps the last pose briefly, then marks tracking as lost after camera dropouts. */
export function getHandTrackingStatus(
  hasHand: boolean,
  lastSeenAtMs: number | null,
  nowMs: number,
  gracePeriodMs = TRACKING_LOSS_GRACE_MS,
): HandTrackingStatus {
  if (hasHand) return "tracking";
  if (lastSeenAtMs === null || nowMs - lastSeenAtMs < gracePeriodMs) {
    return "searching";
  }
  return "lost";
}
