export const FINGERS = ["thumb", "index", "middle", "ring", "pinky"] as const;
export type Finger = (typeof FINGERS)[number];
export type HandPose = Record<Finger, number>;
export const OPEN_HAND: HandPose = { thumb: 0, index: 0, middle: 0, ring: 0, pinky: 0 };
export const CLOSED_HAND: HandPose = { thumb: 1, index: 1, middle: 1, ring: 1, pinky: 1 };
export const GESTURES: Record<string, HandPose> = {
  "Open hand": OPEN_HAND,
  "Closed hand": CLOSED_HAND,
  Point: { thumb: 0.78, index: 0, middle: 1, ring: 1, pinky: 1 },
  Peace: { thumb: 0.84, index: 0, middle: 0, ring: 1, pinky: 1 },
  "Thumbs up": { thumb: 0, index: 1, middle: 1, ring: 1, pinky: 1 },
  Pinch: { thumb: 0.18, index: 0.2, middle: 0.9, ring: 0.9, pinky: 0.9 },
};
export const NUMBER_GESTURES: Record<number, HandPose> = {
  0: CLOSED_HAND,
  1: { thumb: 1, index: 0, middle: 1, ring: 1, pinky: 1 },
  2: { thumb: 1, index: 0, middle: 0, ring: 1, pinky: 1 },
  3: { thumb: 0, index: 0, middle: 0, ring: 1, pinky: 1 },
  4: { thumb: 1, index: 0, middle: 0, ring: 0, pinky: 0 },
  5: OPEN_HAND,
};
export const clampPose = (pose: HandPose): HandPose => Object.fromEntries(FINGERS.map(f => [f, Math.max(0, Math.min(1, pose[f]))])) as HandPose;
export const lerpPose = (a: HandPose, b: HandPose, t: number): HandPose => Object.fromEntries(FINGERS.map(f => [f, a[f] + (b[f] - a[f]) * Math.max(0, Math.min(1, t))])) as HandPose;

export interface Keyframe { id: string; name: string; pose: HandPose; duration: number }
export interface MotionSequence { version: 1; id: string; name: string; updatedAt: string; keyframes: Keyframe[] }
export const nextKeyframeIndex = (frames: readonly Keyframe[], currentIndex: number): number | null => currentIndex + 1 < frames.length ? currentIndex + 1 : null;
export const SEQUENCE_STORAGE_KEY = "tuki.sequences.v1";
type UnknownRecord = Record<string, unknown>;
const isRecord = (value: unknown): value is UnknownRecord => typeof value === "object" && value !== null && !Array.isArray(value);
export function parseSequences(raw: string): MotionSequence[] {
  const data: unknown = JSON.parse(raw);
  if (!Array.isArray(data)) throw new Error("Sequence file must contain a list.");
  return data.map((item: unknown) => {
    if (!isRecord(item) || item.version !== 1 || typeof item.id !== "string" || typeof item.name !== "string" || !Array.isArray(item.keyframes)) throw new Error("Unsupported sequence format.");
    const keyframes = item.keyframes.map((frame: unknown): Keyframe => {
      if (!isRecord(frame) || typeof frame.id !== "string" || typeof frame.name !== "string" || !isRecord(frame.pose)) throw new Error("Invalid keyframe.");
      const pose = frame.pose;
      if (!FINGERS.every(f => typeof pose[f] === "number" && Number.isFinite(pose[f]))) throw new Error("Invalid keyframe.");
      return { id: frame.id, name: frame.name, pose: clampPose(pose as HandPose), duration: Math.max(100, Math.min(10000, Number(frame.duration) || 800)) };
    });
    return { version:1, id:item.id, name:item.name, updatedAt:typeof item.updatedAt === "string" ? item.updatedAt : new Date(0).toISOString(), keyframes };
  });
}

export interface MotionAdapter { readonly mode: "simulation"; apply(pose: HandPose): void; readPose(): HandPose }
export interface HardwareAdapter { readonly mode: "hardware"; readonly connected: false; apply(pose: HandPose): never }
let simulatedPose = OPEN_HAND;
export const simulationAdapter: MotionAdapter = { mode: "simulation", apply: pose => { simulatedPose = clampPose(pose); }, readPose: () => ({ ...simulatedPose }) };
