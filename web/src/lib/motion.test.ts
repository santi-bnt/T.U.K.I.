import { describe, expect, it } from "vitest";
import { CLOSED_HAND, FINGERS, GESTURES, NUMBER_GESTURES, OPEN_HAND, clampPose, lerpPose, nextKeyframeIndex, parseSequences, simulationAdapter } from "@/lib/motion";
import { checkSimonAnswer, createSimonSequence } from "@/lib/simon";
import { randomRpsChoice, resolveRps } from "@/lib/rock-paper-scissors";

describe("normalized hand motion",()=>{
 it("defines five independent normalized fingers",()=>{expect(FINGERS).toHaveLength(5);expect(clampPose({...OPEN_HAND,thumb:2,index:-1})).toEqual({...OPEN_HAND,thumb:1});});
 it("keeps gesture and count mappings centralized and valid",()=>{expect(GESTURES["Open hand"]).toEqual(OPEN_HAND);expect(GESTURES["Closed hand"]).toEqual(CLOSED_HAND);expect(Object.keys(NUMBER_GESTURES)).toEqual(["0","1","2","3","4","5"]);for(const pose of Object.values(NUMBER_GESTURES))for(const finger of FINGERS)expect(pose[finger]).toBeGreaterThanOrEqual(0);});
 it("interpolates between poses",()=>{expect(lerpPose(OPEN_HAND,CLOSED_HAND,.5)).toEqual({thumb:.5,index:.5,middle:.5,ring:.5,pinky:.5});});
 it("keeps simulation adapter pose synchronized with controls",()=>{simulationAdapter.apply(CLOSED_HAND);expect(simulationAdapter.readPose()).toEqual(CLOSED_HAND);simulationAdapter.apply(OPEN_HAND);});
});
describe("Simon Says",()=>{
 it("creates bounded finger-count sequences",()=>{expect(createSimonSequence(3,()=>.5)).toEqual([3,3,3]);expect(createSimonSequence(99,()=>.99)).toHaveLength(8);});
 it("checks wrong, continuing, and completed answers",()=>{expect(checkSimonAnswer([2,4],0,3)).toBe("wrong");expect(checkSimonAnswer([2,4],0,2)).toBe("continue");expect(checkSimonAnswer([2,4],1,4)).toBe("complete");});
});
describe("Rock Paper Scissors",()=>{
 it("resolves ties and all winning matchups",()=>{expect(resolveRps("rock","rock")).toBe("tie");expect(resolveRps("rock","scissors")).toBe("win");expect(resolveRps("paper","rock")).toBe("win");expect(resolveRps("scissors","paper")).toBe("win");expect(resolveRps("paper","scissors")).toBe("loss");});
 it("chooses a bounded opponent move",()=>{expect(randomRpsChoice(()=>0)).toBe("rock");expect(randomRpsChoice(()=>.99)).toBe("scissors");});
});
describe("motion sequence schema",()=>{
 it("round trips versioned sequence JSON and bounds timing",()=>{const raw=JSON.stringify([{version:1,id:"a",name:"Wave",updatedAt:"2026-01-01",keyframes:[{id:"k",name:"Pose",pose:CLOSED_HAND,duration:20000}]}]);const [sequence]=parseSequences(raw);expect(sequence.version).toBe(1);expect(sequence.keyframes[0].duration).toBe(10000);expect(sequence.keyframes[0].pose).toEqual(CLOSED_HAND);});
 it("rejects unsupported or malformed sequence files",()=>{expect(()=>parseSequences("{}" )).toThrow();expect(()=>parseSequences(JSON.stringify([{version:9,id:"a",name:"x",keyframes:[]}]))).toThrow();});
 it("advances simulated sequence playback in keyframe order",()=>{const frames=[{id:"1",name:"a",pose:OPEN_HAND,duration:500},{id:"2",name:"b",pose:CLOSED_HAND,duration:900}];expect(nextKeyframeIndex(frames,0)).toBe(1);expect(nextKeyframeIndex(frames,1)).toBeNull();});
});
