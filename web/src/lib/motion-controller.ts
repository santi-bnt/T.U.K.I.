import { FINGERS, OPEN_HAND, simulationAdapter, type HandPose } from "@/lib/motion";

export type MotionSource = "manual" | "gesture" | "voice" | "game" | "sequence" | "camera";
export type MockTrackingState = "idle" | "searching" | "tracking" | "lost" | "stopped";
export type MockPacketStatus = "pending" | "received" | "invalid" | "out-of-order" | "dropped" | "error" | "disconnected";

export interface MockCommandPacket {
  protocol: "TUKI-MOCK";
  version: 1;
  sequence: number;
  timestampMs: number;
  pose: HandPose;
  tracking: { state: MockTrackingState; valid: boolean };
}

export interface MockPacketRecord {
  packet: MockCommandPacket;
  status: MockPacketStatus;
  latencyMs?: number;
  detail?: string;
}

export interface MockTransportSettings {
  connected: boolean;
  latencyMs: number;
  packetLossPercent: number;
  errorPercent: number;
}

export interface MotionControllerSnapshot {
  pose: HandPose;
  activeSource: MotionSource;
  packets: readonly MockPacketRecord[];
  transport: MockTransportSettings;
}

export const MOTION_SOURCE_PRIORITY: Readonly<Record<MotionSource, number>> = {
  manual: 100,
  gesture: 90,
  voice: 90,
  game: 80,
  sequence: 70,
  camera: 50,
};

const MOCK_TRACKING_STATES: readonly MockTrackingState[] = ["idle", "searching", "tracking", "lost", "stopped"];

export function isValidMockCommandPacket(value: unknown): value is MockCommandPacket {
  if (typeof value !== "object" || value === null) return false;
  const packet = value as Partial<MockCommandPacket>;
  if (
    packet.protocol !== "TUKI-MOCK" ||
    packet.version !== 1 ||
    !Number.isSafeInteger(packet.sequence) || packet.sequence! < 1 ||
    !Number.isFinite(packet.timestampMs) || packet.timestampMs! < 0 ||
    !packet.pose || !packet.tracking
  ) return false;

  const pose = packet.pose as HandPose;
  const tracking = packet.tracking;
  return FINGERS.every((finger) =>
    Number.isFinite(pose[finger]) && pose[finger] >= 0 && pose[finger] <= 1,
  ) &&
    MOCK_TRACKING_STATES.includes(tracking.state) &&
    typeof tracking.valid === "boolean" &&
    tracking.valid === (tracking.state === "tracking");
}

/** A deterministic-in-shape transport simulator; it never opens a real connection. */
export class MockCommunicationAdapter {
  private settings: MockTransportSettings = {
    connected: true,
    latencyMs: 28,
    packetLossPercent: 0,
    errorPercent: 0,
  };
  private lastReceivedSequence = 0;
  private lastReceivedTimestamp = -1;
  private readonly timers = new Set<ReturnType<typeof setTimeout>>();

  constructor(private readonly onRecord: (record: MockPacketRecord) => void) {}

  getSettings(): MockTransportSettings {
    return { ...this.settings };
  }

  configure(next: MockTransportSettings): boolean {
    if (
      !Number.isFinite(next.latencyMs) || next.latencyMs < 0 || next.latencyMs > 2000 ||
      !Number.isFinite(next.packetLossPercent) || next.packetLossPercent < 0 || next.packetLossPercent > 100 ||
      !Number.isFinite(next.errorPercent) || next.errorPercent < 0 || next.errorPercent > 100 ||
      typeof next.connected !== "boolean"
    ) return false;
    this.settings = { ...next };
    return true;
  }

  send(packet: MockCommandPacket): void {
    if (!isValidMockCommandPacket(packet)) {
      this.onRecord({ packet, status: "invalid", detail: "Command rejected by packet validation." });
      return;
    }
    if (!this.settings.connected) {
      this.onRecord({ packet, status: "disconnected", detail: "Simulated controller link is disconnected." });
      return;
    }

    const safePacket = { ...packet, pose: { ...packet.pose }, tracking: { ...packet.tracking } };
    this.onRecord({ packet: safePacket, status: "pending", detail: "Queued on simulated link." });
    const timer = setTimeout(() => {
      this.timers.delete(timer);
      if (Math.random() * 100 < this.settings.packetLossPercent) {
        this.onRecord({ packet: safePacket, status: "dropped", detail: "Simulated packet loss." });
      } else if (Math.random() * 100 < this.settings.errorPercent) {
        this.onRecord({ packet: safePacket, status: "error", detail: "Simulated transport error." });
      } else {
        this.receive(safePacket, performance.now());
      }
    }, this.settings.latencyMs);
    this.timers.add(timer);
  }

  /** Allows tests and the diagnostics panel to exercise the receiving validator. */
  receive(packet: unknown, receivedAtMs = performance.now()): MockPacketStatus {
    if (!Number.isFinite(receivedAtMs) || receivedAtMs < 0) {
      if (typeof packet === "object" && packet !== null && "sequence" in packet) {
        this.onRecord({ packet: packet as MockCommandPacket, status: "invalid", detail: "Invalid receive timestamp." });
      }
      return "invalid";
    }
    if (!isValidMockCommandPacket(packet)) {
      if (typeof packet === "object" && packet !== null && "sequence" in packet) {
        this.onRecord({ packet: packet as MockCommandPacket, status: "invalid", detail: "Malformed or out-of-range command." });
      }
      return "invalid";
    }
    if (packet.sequence <= this.lastReceivedSequence || packet.timestampMs <= this.lastReceivedTimestamp) {
      this.onRecord({ packet, status: "out-of-order", latencyMs: Math.max(0, receivedAtMs - packet.timestampMs), detail: "Older sequence or timestamp was ignored." });
      return "out-of-order";
    }

    this.lastReceivedSequence = packet.sequence;
    this.lastReceivedTimestamp = packet.timestampMs;
    this.onRecord({ packet, status: "received", latencyMs: Math.max(0, receivedAtMs - packet.timestampMs), detail: "Command received by the mock controller." });
    return "received";
  }

  close(): void {
    for (const timer of this.timers) clearTimeout(timer);
    this.timers.clear();
  }
}

/** Single pose owner for all Studio inputs, with explicit source priority. */
export class HandMotionController {
  private snapshot: MotionControllerSnapshot;
  private readonly listeners = new Set<() => void>();
  private sequence = 0;
  private lastTimestampMs = -1;
  private readonly transport: MockCommunicationAdapter;

  constructor() {
    this.snapshot = {
      pose: { ...OPEN_HAND },
      activeSource: "manual",
      packets: [],
      transport: { connected: true, latencyMs: 28, packetLossPercent: 0, errorPercent: 0 },
    };
    this.transport = new MockCommunicationAdapter((record) => this.recordPacket(record));
  }

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = (): MotionControllerSnapshot => this.snapshot;

  activateSource(source: MotionSource): void {
    this.snapshot = { ...this.snapshot, activeSource: source };
    this.publish();
  }

  submit(
    source: MotionSource,
    pose: HandPose,
    timestampMs: number,
    tracking: { state: MockTrackingState; valid: boolean } = { state: "idle", valid: false },
  ): boolean {
    if (!Number.isFinite(timestampMs) || timestampMs < 0 || timestampMs <= this.lastTimestampMs) return false;
    if (!FINGERS.every((finger) => Number.isFinite(pose[finger]) && pose[finger] >= 0 && pose[finger] <= 1)) return false;
    if (!MOCK_TRACKING_STATES.includes(tracking.state) || tracking.valid !== (tracking.state === "tracking")) return false;

    if (source !== this.snapshot.activeSource) {
      if (MOTION_SOURCE_PRIORITY[source] <= MOTION_SOURCE_PRIORITY[this.snapshot.activeSource]) return false;
      this.snapshot = { ...this.snapshot, activeSource: source };
    }

    this.lastTimestampMs = timestampMs;
    const normalizedPose = { ...pose };
    this.snapshot = { ...this.snapshot, pose: normalizedPose };
    simulationAdapter.apply(normalizedPose);
    const packet: MockCommandPacket = {
      protocol: "TUKI-MOCK",
      version: 1,
      sequence: ++this.sequence,
      timestampMs,
      pose: normalizedPose,
      tracking: { ...tracking },
    };
    this.transport.send(packet);
    this.publish();
    return true;
  }

  setTransportSettings(settings: MockTransportSettings): boolean {
    if (!this.transport.configure(settings)) return false;
    this.snapshot = { ...this.snapshot, transport: this.transport.getSettings() };
    this.publish();
    return true;
  }

  receiveMockPacket(packet: unknown, receivedAtMs?: number): MockPacketStatus {
    return this.transport.receive(packet, receivedAtMs);
  }

  close(): void {
    this.transport.close();
  }

  private recordPacket(record: MockPacketRecord): void {
    this.snapshot = {
      ...this.snapshot,
      packets: [{ ...record }, ...this.snapshot.packets].slice(0, 12),
    };
    this.publish();
  }

  private publish(): void {
    for (const listener of this.listeners) listener();
  }
}
