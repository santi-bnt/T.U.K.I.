import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import type { HandLandmark } from "@/lib/hand-tracking";

type WorkerRequest =
  | { type: "initialize" }
  | { type: "frame"; bitmap: ImageBitmap; timestampMs: number }
  | { type: "close" };

type WorkerResponse =
  | { type: "ready"; delegate: "GPU" | "CPU" }
  | { type: "result"; landmarks: HandLandmark[] | null; timestampMs: number }
  | { type: "error"; message: string }
  | { type: "closed" };

interface WorkerScope {
  onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null;
  postMessage(message: WorkerResponse): void;
}

const WASM_BASE_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.3/wasm";
const HAND_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

const workerScope = self as unknown as WorkerScope;
let landmarker: HandLandmarker | null = null;

async function initializeLandmarker(): Promise<void> {
  const visionFiles = await FilesetResolver.forVisionTasks(WASM_BASE_URL);
  const options = {
    baseOptions: { modelAssetPath: HAND_MODEL_URL },
    runningMode: "VIDEO" as const,
    numHands: 1,
    minHandDetectionConfidence: 0.55,
    minHandPresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
  };

  try {
    landmarker = await HandLandmarker.createFromOptions(visionFiles, {
      ...options,
      baseOptions: { ...options.baseOptions, delegate: "GPU" },
    });
    workerScope.postMessage({ type: "ready", delegate: "GPU" });
  } catch {
    // Some browsers cannot create the GPU delegate in a worker; CPU keeps the feature available.
    landmarker = await HandLandmarker.createFromOptions(visionFiles, {
      ...options,
      baseOptions: { ...options.baseOptions, delegate: "CPU" },
    });
    workerScope.postMessage({ type: "ready", delegate: "CPU" });
  }
}

workerScope.onmessage = async ({ data }) => {
  try {
    if (data.type === "initialize") {
      await initializeLandmarker();
      return;
    }

    if (data.type === "close") {
      landmarker?.close();
      landmarker = null;
      workerScope.postMessage({ type: "closed" });
      return;
    }

    if (!landmarker) {
      data.bitmap.close();
      throw new Error("The hand-tracking model is not initialized.");
    }

    try {
      const result = landmarker.detectForVideo(data.bitmap, data.timestampMs);
      workerScope.postMessage({
        type: "result",
        landmarks: result.landmarks[0] ?? null,
        timestampMs: data.timestampMs,
      });
    } finally {
      data.bitmap.close();
    }
  } catch (error) {
    workerScope.postMessage({
      type: "error",
      message: error instanceof Error ? error.message : "Unknown inference error.",
    });
  }
};
