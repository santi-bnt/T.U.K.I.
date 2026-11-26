import { afterEach, describe, expect, it, vi } from "vitest";
import { CLOSED_HAND, OPEN_HAND, simulationAdapter } from "@/lib/motion";
import {
  HandMotionController,
  isValidMockCommandPacket,
  MockCommunicationAdapter,
  type MockCommandPacket,
  type MockPacketRecord,
} from "@/lib/motion-controller";

function packet(sequence: number, timestampMs: number, pose = OPEN_HAND): MockCommandPacket {
  return {
    protocol: "TUKI-MOCK",
    version: 1,
    sequence,
    timestampMs,
    pose: { ...pose },
    tracking: { state: "tracking", valid: true },
  };
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("mock command packet validation", () => {
  it("accepts the versioned five-finger packet and rejects invalid commands", () => {
    expect(isValidMockCommandPacket(packet(1, 10))).toBe(true);
    expect(isValidMockCommandPacket({ ...packet(1, 10), version: 2 })).toBe(false);
    expect(isValidMockCommandPacket({ ...packet(1, 10), sequence: 0 })).toBe(false);
    expect(isValidMockCommandPacket({ ...packet(1, 10), pose: { ...OPEN_HAND, thumb: 1.1 } })).toBe(false);
    expect(isValidMockCommandPacket({ ...packet(1, 10), tracking: { state: "lost", valid: true } })).toBe(false);
  });

  it("rejects received packets with an old sequence or timestamp", () => {
    const records: MockPacketRecord[] = [];
    const adapter = new MockCommunicationAdapter((record) => records.push(record));
    expect(adapter.receive(packet(2, 20), 25)).toBe("received");
    expect(adapter.receive({ ...packet(3, 30), pose: { ...OPEN_HAND, pinky: 2 } }, 35)).toBe("invalid");
    expect(adapter.receive(packet(1, 30), 35)).toBe("out-of-order");
    expect(adapter.receive(packet(3, 19), 40)).toBe("out-of-order");
    expect(adapter.receive(packet(4, 40), Number.NaN)).toBe("invalid");
    expect(records.map(({ status }) => status)).toEqual(["received", "invalid", "out-of-order", "out-of-order", "invalid"]);
    adapter.close();
  });
});

describe("single-owner motion controller", () => {
  it("applies the explicit source priority and requires explicit activation to switch back", () => {
    const controller = new HandMotionController();
    controller.activateSource("camera");
    expect(controller.submit("camera", OPEN_HAND, 1, { state: "tracking", valid: true })).toBe(true);
    expect(controller.submit("manual", CLOSED_HAND, 2)).toBe(true);
    expect(controller.getSnapshot().activeSource).toBe("manual");
    expect(controller.submit("camera", OPEN_HAND, 3, { state: "tracking", valid: true })).toBe(false);
    controller.activateSource("camera");
    expect(controller.submit("camera", OPEN_HAND, 4, { state: "tracking", valid: true })).toBe(true);
    controller.close();
  });

  it("rejects invalid values and duplicate timestamps without publishing a pose", () => {
    const controller = new HandMotionController();
    expect(controller.submit("manual", { ...OPEN_HAND, index: Number.NaN }, 1)).toBe(false);
    expect(controller.submit("manual", OPEN_HAND, Number.NaN)).toBe(false);
    expect(controller.submit("manual", OPEN_HAND, 10)).toBe(true);
    expect(controller.submit("manual", CLOSED_HAND, 10)).toBe(false);
    expect(controller.getSnapshot().pose).toEqual(OPEN_HAND);
    controller.close();
  });

  it("sends the exact normalized pose that the digital-twin adapter receives", () => {
    const controller = new HandMotionController();
    const pose = { thumb: 0.12, index: 0.34, middle: 0.56, ring: 0.78, pinky: 0.9 };
    controller.activateSource("camera");
    expect(controller.submit("camera", pose, 10, { state: "tracking", valid: true })).toBe(true);
    expect(controller.getSnapshot().pose).toEqual(pose);
    expect(simulationAdapter.readPose()).toEqual(pose);
    expect(controller.getSnapshot().packets[0]).toMatchObject({
      status: "pending",
      packet: { pose, tracking: { state: "tracking", valid: true } },
    });
    controller.close();
  });
});

describe("mock communication behavior", () => {
  it("simulates successful receive, packet loss, transport error, and disconnection", async () => {
    vi.useFakeTimers();
    const records: MockPacketRecord[] = [];
    const adapter = new MockCommunicationAdapter((record) => records.push(record));
    const candidate = packet(1, 10);

    vi.spyOn(Math, "random").mockReturnValue(0.99);
    adapter.configure({ connected: true, latencyMs: 10, packetLossPercent: 0, errorPercent: 0 });
    adapter.send(candidate);
    await vi.advanceTimersByTimeAsync(10);
    expect(records.map(({ status }) => status)).toEqual(["pending", "received"]);

    adapter.configure({ connected: true, latencyMs: 10, packetLossPercent: 100, errorPercent: 0 });
    adapter.send({ ...candidate, sequence: 2, timestampMs: 20 });
    await vi.advanceTimersByTimeAsync(10);
    expect(records.at(-1)?.status).toBe("dropped");

    adapter.configure({ connected: true, latencyMs: 10, packetLossPercent: 0, errorPercent: 100 });
    adapter.send({ ...candidate, sequence: 3, timestampMs: 30 });
    await vi.advanceTimersByTimeAsync(10);
    expect(records.at(-1)?.status).toBe("error");

    adapter.configure({ connected: false, latencyMs: 10, packetLossPercent: 0, errorPercent: 0 });
    adapter.send({ ...candidate, sequence: 4, timestampMs: 40 });
    expect(records.at(-1)?.status).toBe("disconnected");
    adapter.close();
  });
});
