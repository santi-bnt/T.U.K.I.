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
const CURLED_ANGLE_DEGREES = 100;
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

/**
 * Converts MediaPipe's 21 landmarks into the existing normalized pose shape.
 * Each value averages two joint-angle estimates for that digit; this is a
 * visual heuristic, not a calibrated measurement of human joints or tendons.
 */
export function interpretHandLandmarks(
  landmarks: readonly HandLandmark[],
): HandPose | null {
  if (landmarks.length < 21) return null;
  if (landmarks.some(({ x, y, z }) => ![x, y, z].every(Number.isFinite))) {
    return null;
  }

  const pose = {} as HandPose;
  for (const [finger, joints] of Object.entries(fingerJoints) as Array<
    [keyof typeof fingerJoints, readonly (readonly [number, number, number])[]]
  >) {
    const jointFlexions = joints.map(([firstIndex, jointIndex, lastIndex]) =>
      normalizedFlexion(jointAngleDegrees(
        landmarks[firstIndex],
        landmarks[jointIndex],
        landmarks[lastIndex],
      )),
    );
    pose[finger] = jointFlexions.reduce((sum, flexion) => sum + flexion, 0) / jointFlexions.length;
  }

  return clampPose(pose);
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

  filter(value: number, timestampMs: number, settings: OneEuroSettings): number {
    if (this.filteredValue === null || this.previousTimestampMs === null || this.previousRaw === null) {
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
    if (calibration && FINGERS.some((finger) => Math.abs(calibration.closed[finger] - calibration.open[finger]) < 0.05)) {
      return false;
    }
    this.openReference = calibration ? { ...calibration.open } : null;
    this.closedReference = calibration ? { ...calibration.closed } : null;
    return true;
  }

  calibrateOpen(pose: HandPose): boolean {
    if (!isNormalizedPose(pose)) return false;
    this.openReference = { ...pose };
    return true;
  }

  calibrateClosed(pose: HandPose): boolean {
    if (!isNormalizedPose(pose)) return false;
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
      const outsideDeadZone = Math.abs(filtered - previous) >= settings.deadZone;
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
