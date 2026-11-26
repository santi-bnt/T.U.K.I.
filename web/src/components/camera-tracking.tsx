"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Camera, CameraOff, ShieldCheck } from "lucide-react";
import { FINGERS, OPEN_HAND, type Finger, type HandPose } from "@/lib/motion";
import {
  DEFAULT_ONE_EURO_SETTINGS,
  getHandTrackingStatus,
  HandPoseProcessor,
  interpretHandLandmarks,
  type HandLandmark,
  type OneEuroSettings,
} from "@/lib/hand-tracking";
import type { HandMotionController, MockTrackingState } from "@/lib/motion-controller";

type CameraStatus =
  | "idle"
  | "requesting"
  | "loading"
  | "searching"
  | "tracking"
  | "lost"
  | "stale"
  | "denied"
  | "unsupported"
  | "error"
  | "stopped";

type DeviceOption = { id: string; label: string };
type WorkerResponse =
  | { type: "ready"; delegate: "GPU" | "CPU" }
  | { type: "result"; landmarks: HandLandmark[] | null; timestampMs: number }
  | { type: "error"; message: string }
  | { type: "closed" };

const TRACKING_CONNECTIONS: ReadonlyArray<readonly [number, number]> = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20], [0, 17],
];

const STATUS_LABELS: Record<CameraStatus, string> = {
  idle: "Camera is off",
  requesting: "Requesting camera access…",
  loading: "Loading hand-tracking model…",
  searching: "Camera on · looking for a hand",
  tracking: "Hand detected · tracking",
  lost: "Hand not detected · hold it in view",
  stale: "Camera data is delayed · waiting for a fresh frame",
  denied: "Camera permission denied",
  unsupported: "Camera tracking is not supported here",
  error: "Camera tracking could not start",
  stopped: "Camera stopped",
};

const FINGER_LABELS: Record<Finger, string> = {
  thumb: "Thumb",
  index: "Index",
  middle: "Middle",
  ring: "Ring",
  pinky: "Pinky",
};

function getCameraError(error: unknown): { status: CameraStatus; message: string } {
  const name = error instanceof DOMException ? error.name : "";
  if (name === "NotAllowedError" || name === "SecurityError") {
    return {
      status: "denied",
      message: "Allow camera access in your browser and use this feature over HTTPS or localhost.",
    };
  }
  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return { status: "error", message: "No camera was found on this device." };
  }
  if (name === "NotReadableError" || name === "TrackStartError") {
    return { status: "error", message: "The camera may already be in use by another app." };
  }
  if (name === "OverconstrainedError") {
    return { status: "error", message: "That camera is unavailable. Choose another camera and retry." };
  }
  return {
    status: "error",
    message: error instanceof Error ? error.message : "Check camera access and network connectivity, then retry.",
  };
}

function cameraLabel(device: MediaDeviceInfo, index: number): string {
  if (/front|user|facetime/i.test(device.label)) return `${device.label || `Camera ${index + 1}`} · front`;
  if (/back|rear|environment/i.test(device.label)) return `${device.label || `Camera ${index + 1}`} · rear`;
  return device.label || `Camera ${index + 1}`;
}

function drawHandLandmarks(
  canvas: HTMLCanvasElement | null,
  landmarks: readonly HandLandmark[],
  video: HTMLVideoElement | null,
): void {
  if (!canvas || !video || !video.videoWidth || !video.videoHeight) return;
  if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  }

  const context = canvas.getContext("2d");
  if (!context) return;
  context.clearRect(0, 0, canvas.width, canvas.height);
  if (landmarks.length < 21) return;

  context.strokeStyle = "#f0bd77";
  context.lineWidth = Math.max(2, canvas.width / 320);
  context.lineCap = "round";
  for (const [start, end] of TRACKING_CONNECTIONS) {
    context.beginPath();
    context.moveTo(landmarks[start].x * canvas.width, landmarks[start].y * canvas.height);
    context.lineTo(landmarks[end].x * canvas.width, landmarks[end].y * canvas.height);
    context.stroke();
  }

  context.fillStyle = "#fff8e9";
  for (const point of landmarks) {
    context.beginPath();
    context.arc(point.x * canvas.width, point.y * canvas.height, Math.max(3, canvas.width / 150), 0, Math.PI * 2);
    context.fill();
  }
}

function formatValue(value: number | null): string {
  return value === null ? "—" : value.toFixed(3);
}

export function CameraTracking({ controller }: { controller: HandMotionController }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const workerReadyRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const sessionRef = useRef(0);
  const frameBusyRef = useRef(false);
  const lastFrameTimeRef = useRef(0);
  const lastProcessedTimestampRef = useRef<number | null>(null);
  const lastSeenAtRef = useRef<number | null>(null);
  const lastTrackingStateRef = useRef<MockTrackingState>("stopped");
  const processorRef = useRef(new HandPoseProcessor());
  const fpsWindowRef = useRef({ startedAt: 0, frames: 0 });
  const snapshot = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);

  const [status, setStatus] = useState<CameraStatus>("idle");
  const [message, setMessage] = useState("Camera access starts only after you press Start.");
  const [devices, setDevices] = useState<DeviceOption[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [landmarks, setLandmarks] = useState<HandLandmark[]>([]);
  const [rawPose, setRawPose] = useState<HandPose | null>(null);
  const [filteredPose, setFilteredPose] = useState<HandPose>({ ...OPEN_HAND });
  const [mirrored, setMirrored] = useState(true);
  const [videoSize, setVideoSize] = useState({ width: 4, height: 3 });
  const [selectedFilterFinger, setSelectedFilterFinger] = useState<Finger>("thumb");
  const [filterSettings, setFilterSettings] = useState<OneEuroSettings>({ ...DEFAULT_ONE_EURO_SETTINGS });
  const [calibration, setCalibration] = useState<{ open: HandPose | null; closed: HandPose | null }>({ open: null, closed: null });
  const [fps, setFps] = useState(0);
  const [inferenceLatencyMs, setInferenceLatencyMs] = useState<number | null>(null);

  const updateStatus = useCallback((next: CameraStatus, detail?: string) => {
    setStatus(next);
    setMessage(detail ?? STATUS_LABELS[next]);
  }, []);

  const reportTrackingState = useCallback((next: MockTrackingState, timestampMs = performance.now()) => {
    if (lastTrackingStateRef.current === next) return controller.getSnapshot().activeSource === "camera";
    lastTrackingStateRef.current = next;
    const currentPose = controller.getSnapshot().pose;
    return controller.submit("camera", currentPose, timestampMs, {
      state: next,
      valid: next === "tracking",
    });
  }, [controller]);

  const releaseCamera = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    const worker = workerRef.current;
    workerRef.current = null;
    workerReadyRef.current = false;
    if (worker) {
      worker.postMessage({ type: "close" });
      window.setTimeout(() => worker.terminate(), 1000);
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    frameBusyRef.current = false;
    lastFrameTimeRef.current = 0;
    lastProcessedTimestampRef.current = null;
    lastSeenAtRef.current = null;
    setLandmarks([]);
  }, []);

  const stopTracking = useCallback((reason?: string) => {
    sessionRef.current += 1;
    releaseCamera();
    const stoppedAt = performance.now();
    const releasedPose = controller.submit("camera", OPEN_HAND, stoppedAt, { state: "stopped", valid: false });
    lastTrackingStateRef.current = "stopped";
    if (!releasedPose) reportTrackingState("stopped", stoppedAt);
    updateStatus("stopped", reason ?? "Camera stopped and its stream was released.");
  }, [controller, releaseCamera, reportTrackingState, updateStatus]);

  const startTracking = useCallback(async (requestedDeviceId = selectedDeviceId) => {
    const sessionId = sessionRef.current + 1;
    sessionRef.current = sessionId;
    releaseCamera();
    setLandmarks([]);
    setRawPose(null);
    setFilteredPose({ ...OPEN_HAND });
    setFps(0);
    setInferenceLatencyMs(null);
    lastTrackingStateRef.current = "stopped";
    lastProcessedTimestampRef.current = null;
    lastSeenAtRef.current = null;
    fpsWindowRef.current = { startedAt: 0, frames: 0 };
    processorRef.current = new HandPoseProcessor();

    if (
      !window.isSecureContext ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof Worker === "undefined" ||
      typeof createImageBitmap === "undefined"
    ) {
      updateStatus(
        "unsupported",
        "Use a secure context (HTTPS or localhost) and a browser with camera, Worker, and ImageBitmap support.",
      );
      return;
    }

    controller.activateSource("camera");
    updateStatus("requesting", "The browser will ask for camera permission now.");
    reportTrackingState("searching");

    try {
      const videoConstraints: MediaTrackConstraints = requestedDeviceId
        ? { deviceId: { exact: requestedDeviceId }, width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 24, max: 30 } }
        : { facingMode: { ideal: "user" }, width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 24, max: 30 } };
      const stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: videoConstraints });
      if (sessionRef.current !== sessionId) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) throw new Error("The camera preview is unavailable.");
      video.srcObject = stream;
      await video.play();
      const track = stream.getVideoTracks()[0];
      const settings = track.getSettings();
      setMirrored(settings.facingMode !== "environment");
      setVideoSize({ width: settings.width || video.videoWidth || 4, height: settings.height || video.videoHeight || 3 });
      const availableDevices = await navigator.mediaDevices.enumerateDevices();
      const cameras = availableDevices.filter((device) => device.kind === "videoinput");
      setDevices(cameras.map((device, index) => ({ id: device.deviceId, label: cameraLabel(device, index) })));
      const activeId = settings.deviceId || requestedDeviceId || cameras[0]?.deviceId || "";
      setSelectedDeviceId(activeId);

      updateStatus("loading", "Camera is on. Loading the on-device hand model and WebAssembly runtime.");
      const worker = new Worker(new URL("../workers/hand-tracking.worker.ts", import.meta.url), {
        type: "module",
        name: "tuki-hand-tracking",
      });
      workerRef.current = worker;
      worker.onmessage = ({ data }: MessageEvent<WorkerResponse>) => {
        if (workerRef.current !== worker || sessionRef.current !== sessionId) return;
        if (data.type === "closed") {
          worker.terminate();
          return;
        }
        if (data.type === "error") {
          sessionRef.current += 1;
          releaseCamera();
          reportTrackingState("stopped");
          updateStatus("error", `Hand-tracking runtime error: ${data.message}`);
          return;
        }
        if (data.type === "ready") {
          workerReadyRef.current = true;
          processorRef.current.recover(Math.max(0, performance.now() - 1));
          updateStatus("searching", `Looking for a hand · ${data.delegate} acceleration`);
          lastSeenAtRef.current = null;
          lastTrackingStateRef.current = "searching";
          reportTrackingState("searching");
          return;
        }
        if (data.type !== "result") return;

        frameBusyRef.current = false;
        const nowMs = performance.now();
        const frameAgeMs = nowMs - data.timestampMs;
        if (
          !Number.isFinite(data.timestampMs) ||
          data.timestampMs <= (lastProcessedTimestampRef.current ?? -1) ||
          frameAgeMs < -50
        ) {
          updateStatus("stale", "An invalid or out-of-order camera timestamp was ignored.");
          if (!reportTrackingState("lost", nowMs)) {
            stopTracking("Camera stopped because a higher-priority input took control.");
          }
          return;
        }
        lastProcessedTimestampRef.current = data.timestampMs;
        if (frameAgeMs > 250) {
          updateStatus("stale", `Camera result is ${Math.round(frameAgeMs)} ms old; stale poses are discarded.`);
          const stillOwnsController = reportTrackingState("lost", nowMs);
          processorRef.current.recover(data.timestampMs);
          if (lastSeenAtRef.current === null || nowMs - lastSeenAtRef.current >= 650) {
            updateStatus("lost", "Camera frames are too old. Waiting for a fresh hand result.");
          }
          if (!stillOwnsController) {
            stopTracking("Camera stopped because a higher-priority input took control.");
          }
          return;
        }

        setLandmarks(data.landmarks ?? []);
        fpsWindowRef.current.frames += 1;
        if (fpsWindowRef.current.startedAt === 0) fpsWindowRef.current.startedAt = nowMs;
        const elapsedWindowMs = nowMs - fpsWindowRef.current.startedAt;
        if (elapsedWindowMs >= 1000) {
          setFps(Math.round((fpsWindowRef.current.frames * 1000) / elapsedWindowMs));
          fpsWindowRef.current = { startedAt: nowMs, frames: 0 };
        }
        setInferenceLatencyMs(Math.max(0, frameAgeMs));

        const hasHand = data.landmarks !== null;
        const trackingState = getHandTrackingStatus(hasHand, lastSeenAtRef.current, nowMs);
        if (!hasHand) {
          if (trackingState === "lost") {
            updateStatus("lost", "Hand not detected. The last pose is held until tracking returns.");
            if (!reportTrackingState("lost", nowMs)) {
              stopTracking("Camera stopped because a higher-priority input took control.");
              return;
            }
            processorRef.current.recover(data.timestampMs);
          } else {
            updateStatus("searching", "Camera is on · looking for a hand.");
            if (!reportTrackingState("searching", nowMs)) {
              stopTracking("Camera stopped because a higher-priority input took control.");
              return;
            }
          }
          return;
        }

        lastSeenAtRef.current = nowMs;
        const wasLost = lastTrackingStateRef.current === "lost";
        const interpretedPose = interpretHandLandmarks(data.landmarks!);
        if (!interpretedPose) {
          updateStatus("stale", "Landmark data failed validation and was ignored.");
          return;
        }
        setRawPose(interpretedPose);
        if (wasLost) {
          // Seed the filter with the held pose, then use the next fresh frame for recovery.
          processorRef.current.recover(data.timestampMs);
          updateStatus("tracking", "Hand reacquired · filter is easing back in.");
          if (!reportTrackingState("tracking", nowMs)) {
            stopTracking("Camera stopped because a higher-priority input took control.");
          }
          return;
        }

        const processed = processorRef.current.process(interpretedPose, data.timestampMs, nowMs);
        if (!processed.accepted) {
          updateStatus("stale", `Frame rejected by the pose filter (${processed.reason}).`);
          return;
        }
        setFilteredPose(processed.filteredPose);
        const accepted = controller.submit("camera", processed.filteredPose, nowMs, {
          state: "tracking",
          valid: true,
        });
        if (!accepted) {
          stopTracking("Camera stopped because a higher-priority input took control. Press Start to reactivate it.");
          return;
        }
        lastTrackingStateRef.current = "tracking";
        updateStatus("tracking", "Hand detected · five filtered finger values control the simulation.");
      };
      worker.onerror = (event) => {
        sessionRef.current += 1;
        releaseCamera();
        reportTrackingState("stopped");
        updateStatus("error", `Could not run the local tracking worker: ${event.message || "unknown worker error"}`);
      };
      worker.postMessage({ type: "initialize" });

      const processFrame = async () => {
        animationFrameRef.current = requestAnimationFrame(() => void processFrame());
        const currentVideo = videoRef.current;
        const currentWorker = workerRef.current;
        if (
          !currentVideo ||
          !currentWorker ||
          !workerReadyRef.current ||
          currentVideo.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
          frameBusyRef.current
        ) return;

        const nowMs = performance.now();
        if (nowMs - lastFrameTimeRef.current < 45) return;
        lastFrameTimeRef.current = nowMs;
        frameBusyRef.current = true;
        try {
          const scale = Math.min(1, 640 / Math.max(currentVideo.videoWidth, currentVideo.videoHeight));
          let bitmap: ImageBitmap;
          try {
            bitmap = await createImageBitmap(currentVideo, {
              resizeWidth: Math.max(1, Math.round(currentVideo.videoWidth * scale)),
              resizeHeight: Math.max(1, Math.round(currentVideo.videoHeight * scale)),
              resizeQuality: "low",
            });
          } catch {
            bitmap = await createImageBitmap(currentVideo);
          }
          if (workerRef.current !== currentWorker || sessionRef.current !== sessionId) {
            bitmap.close();
            frameBusyRef.current = false;
            return;
          }
          currentWorker.postMessage(
            { type: "frame", bitmap, timestampMs: Math.max(nowMs, performance.now()) },
            [bitmap],
          );
        } catch (error) {
          frameBusyRef.current = false;
          sessionRef.current += 1;
          releaseCamera();
          reportTrackingState("stopped");
          const details = getCameraError(error);
          updateStatus("error", `Could not read a camera frame: ${details.message}`);
        }
      };
      animationFrameRef.current = requestAnimationFrame(() => void processFrame());

      track.onended = () => {
        if (sessionRef.current !== sessionId) return;
        sessionRef.current += 1;
        releaseCamera();
        reportTrackingState("stopped");
        updateStatus("error", "The camera disconnected. Choose another camera or press Start to retry.");
      };
    } catch (error) {
      if (sessionRef.current !== sessionId) return;
      releaseCamera();
      reportTrackingState("stopped");
      const details = getCameraError(error);
      updateStatus(details.status, details.message);
    }
  }, [controller, releaseCamera, reportTrackingState, selectedDeviceId, stopTracking, updateStatus]);

  useEffect(() => {
    return () => {
      sessionRef.current += 1;
      releaseCamera();
    };
  }, [releaseCamera]);

  useEffect(() => {
    drawHandLandmarks(canvasRef.current, landmarks, videoRef.current);
  }, [landmarks, videoSize]);

  const changeFilter = (key: keyof OneEuroSettings, value: number) => {
    const next = { ...filterSettings, [key]: value };
    if (processorRef.current.configure(next, selectedFilterFinger)) setFilterSettings(next);
  };

  const changeFilterFinger = (finger: Finger) => {
    setSelectedFilterFinger(finger);
    setFilterSettings(processorRef.current.getSettings(finger));
  };

  const captureCalibration = (kind: "open" | "closed") => {
    if (!rawPose) return;
    const success = kind === "open"
      ? processorRef.current.calibrateOpen(rawPose)
      : processorRef.current.calibrateClosed(rawPose);
    if (success) setCalibration(processorRef.current.getCalibration());
  };

  const updateMockSetting = (key: keyof typeof snapshot.transport, value: number | boolean) => {
    controller.setTransportSettings({ ...snapshot.transport, [key]: value });
  };

  const active = ["requesting", "loading", "searching", "tracking", "lost", "stale"].includes(status);
  const receivedRecords = snapshot.packets.filter((record) => record.status === "received");
  const simulatedLatency = receivedRecords[0]?.latencyMs ?? null;

  return (
    <div className="camera-tracking-panel">
      <div className="camera-tracking-heading">
        <div>
          <span className="eyebrow">06 / CAMERA INPUT · SIMULATION ONLY</span>
          <h2>Move TUKI with your hand.</h2>
          <p className="muted">MediaPipe estimates each finger from its joint angle and maps it to the existing five-value HandPose.</p>
        </div>
        <span className={`camera-status-pill ${status}`} role="status" aria-live="polite"><i />{STATUS_LABELS[status]}</span>
      </div>

      <div className={`camera-preview ${mirrored ? "mirrored" : ""}`} style={{ aspectRatio: `${videoSize.width} / ${videoSize.height}` }}>
        <video ref={videoRef} autoPlay muted playsInline aria-label="Live camera preview for local hand tracking" />
        <canvas ref={canvasRef} aria-hidden="true" />
        {!active && <div className="camera-preview-placeholder"><Camera size={28} /><span>Camera preview appears after you start tracking.</span></div>}
      </div>

      <div className="camera-tracking-controls">
        <label className="camera-select-label">
          Camera
          <select value={selectedDeviceId} onChange={(event) => {
            const nextDeviceId = event.target.value;
            setSelectedDeviceId(nextDeviceId);
            void startTracking(nextDeviceId);
          }} disabled={!devices.length || status === "requesting" || status === "loading"}>
            {devices.length === 0 && <option value="">Camera is chosen when started</option>}
            {devices.map((device) => <option value={device.id} key={device.id}>{device.label}</option>)}
          </select>
        </label>
        <button className="button button-light camera-action" onClick={() => void startTracking()} disabled={active}>
          <Camera size={15} />{active ? "Tracking active" : "Start tracking"}
        </button>
        <button className="button button-muted camera-action" onClick={() => stopTracking()} disabled={!active}>
          <CameraOff size={15} />Stop camera
        </button>
      </div>

      <p className="camera-feedback" role="status" aria-live="polite">{message}</p>

      <details className="tracking-diagnostics" open>
        <summary>Tracking diagnostics <span>MOCK LINK · NO PHYSICAL HARDWARE CONNECTED</span></summary>
        <div className="tracking-metrics">
          <div><small>Tracking</small><b>{STATUS_LABELS[status]}</b></div>
          <div><small>Detection FPS</small><b>{fps}</b></div>
          <div><small>Inference latency</small><b>{formatValue(inferenceLatencyMs)} ms</b></div>
          <div><small>Mock receive latency</small><b>{formatValue(simulatedLatency)} ms</b></div>
          <div><small>Active source</small><b>{snapshot.activeSource}</b></div>
        </div>

        <div className="finger-value-table" role="table" aria-label="Raw and filtered finger values">
          <div className="finger-value-row header" role="row"><span>Finger</span><span>Original</span><span>Filtered</span></div>
          {FINGERS.map((finger) => <div className="finger-value-row" role="row" key={finger}>
            <span>{FINGER_LABELS[finger]}</span><output>{formatValue(rawPose?.[finger] ?? null)}</output><output>{formatValue(filteredPose[finger])}</output>
          </div>)}
        </div>

        <div className="filter-diagnostics">
          <div className="filter-diagnostics-heading"><h3>One Euro filter and motion limits</h3><label>Finger<select value={selectedFilterFinger} onChange={(event) => changeFilterFinger(event.target.value as Finger)}>{FINGERS.map((finger) => <option key={finger} value={finger}>{FINGER_LABELS[finger]}</option>)}</select></label></div>
          <p>Settings below apply only to the selected finger.</p>
          <label><span>Minimum cutoff <b>{filterSettings.minCutoffHz.toFixed(1)} Hz</b></span><input type="range" min="0.2" max="5" step="0.1" value={filterSettings.minCutoffHz} onChange={(event) => changeFilter("minCutoffHz", Number(event.target.value))} /></label>
          <label><span>Speed response (beta) <b>{filterSettings.beta.toFixed(3)}</b></span><input type="range" min="0" max="0.2" step="0.005" value={filterSettings.beta} onChange={(event) => changeFilter("beta", Number(event.target.value))} /></label>
          <label><span>Derivative cutoff <b>{filterSettings.derivativeCutoffHz.toFixed(1)} Hz</b></span><input type="range" min="0.2" max="5" step="0.1" value={filterSettings.derivativeCutoffHz} onChange={(event) => changeFilter("derivativeCutoffHz", Number(event.target.value))} /></label>
          <label><span>Dead zone <b>{filterSettings.deadZone.toFixed(3)}</b></span><input type="range" min="0" max="0.08" step="0.002" value={filterSettings.deadZone} onChange={(event) => changeFilter("deadZone", Number(event.target.value))} /></label>
          <label><span>Maximum speed <b>{filterSettings.maxSpeedPerSecond.toFixed(1)} normalized/s</b></span><input type="range" min="0.2" max="5" step="0.1" value={filterSettings.maxSpeedPerSecond} onChange={(event) => changeFilter("maxSpeedPerSecond", Number(event.target.value))} /></label>
        </div>

        <div className="hand-calibration">
          <div><h3>Optional hand calibration</h3><p>Hold an open or closed pose in view, then capture it. Calibration changes only the camera-to-simulation mapping.</p></div>
          <button className="button button-muted" onClick={() => captureCalibration("open")} disabled={!rawPose}>Capture open</button>
          <button className="button button-muted" onClick={() => captureCalibration("closed")} disabled={!rawPose}>Capture closed</button>
          <button className="button button-quiet" onClick={() => { processorRef.current.clearCalibration(); setCalibration({ open: null, closed: null }); }}>Clear</button>
          <span>{calibration.open && calibration.closed ? "Open and closed references active" : calibration.open || calibration.closed ? "Capture both references to calibrate" : "Default joint-angle mapping"}</span>
        </div>

        <div className="mock-transport-controls">
          <h3>Simulated controller link</h3>
          <label className="mock-connection-toggle"><input type="checkbox" checked={!snapshot.transport.connected} onChange={(event) => updateMockSetting("connected", !event.target.checked)} /> Simulate disconnected controller</label>
          <label><span>Packet loss <b>{snapshot.transport.packetLossPercent}%</b></span><input type="range" min="0" max="100" step="1" value={snapshot.transport.packetLossPercent} onChange={(event) => updateMockSetting("packetLossPercent", Number(event.target.value))} /></label>
          <label><span>Transport errors <b>{snapshot.transport.errorPercent}%</b></span><input type="range" min="0" max="100" step="1" value={snapshot.transport.errorPercent} onChange={(event) => updateMockSetting("errorPercent", Number(event.target.value))} /></label>
          <label><span>Simulated latency <b>{snapshot.transport.latencyMs} ms</b></span><input type="range" min="0" max="500" step="5" value={snapshot.transport.latencyMs} onChange={(event) => updateMockSetting("latencyMs", Number(event.target.value))} /></label>
        </div>

        <div className="mock-packet-monitor">
          <h3>Recent mock packets <span>sequence · time · five normalized values · tracking</span></h3>
          {snapshot.packets.length === 0
            ? <p>No mock commands have been sent yet.</p>
            : <div className="mock-packet-list">{snapshot.packets.map((record) => <div className="mock-packet-row" key={`${record.packet.sequence}-${record.status}`}>
              <span>#{record.packet.sequence}</span>
              <span>{record.packet.timestampMs.toFixed(0)} ms</span>
              <span>{FINGERS.map((finger) => record.packet.pose[finger].toFixed(2)).join(" / ")}</span>
              <span>{record.packet.tracking.state}{record.packet.tracking.valid ? " · valid" : " · invalid"}</span>
              <b className={`packet-state ${record.status}`}>{record.status}</b>
            </div>)}</div>}
        </div>
      </details>

      <div className="camera-privacy-note"><ShieldCheck size={16} /><p>Video frames stay in this browser and are not uploaded by TUKI. The model and WebAssembly runtime load from Google and jsDelivr; MediaPipe may send usage/performance metrics to Google. The mock controller never opens a network or hardware connection.</p></div>
      <p className="camera-limit-note">Flexion values are approximate and are not human-joint measurements or calibrated SG90 positions. Browser camera access requires HTTPS (or localhost), compatible APIs, and permission.</p>
    </div>
  );
}
