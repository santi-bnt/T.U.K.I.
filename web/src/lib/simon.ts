export function createSimonSequence(length: number, random: () => number = Math.random): number[] {
  return Array.from({ length: Math.max(0, Math.min(8, Math.floor(length))) }, () => Math.floor(random() * 6));
}
export function checkSimonAnswer(sequence: readonly number[], index: number, answer: number): "wrong" | "continue" | "complete" {
  if (sequence[index] !== answer || index < 0 || index >= sequence.length) return "wrong";
  return index === sequence.length - 1 ? "complete" : "continue";
}
