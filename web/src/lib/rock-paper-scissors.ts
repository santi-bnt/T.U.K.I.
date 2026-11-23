export const RPS_CHOICES = ["rock", "paper", "scissors"] as const;
export type RpsChoice = (typeof RPS_CHOICES)[number];
export type RpsResult = "win" | "loss" | "tie";

export function resolveRps(player: RpsChoice, opponent: RpsChoice): RpsResult {
  if (player === opponent) return "tie";
  const wins: Record<RpsChoice, RpsChoice> = { rock: "scissors", paper: "rock", scissors: "paper" };
  return wins[player] === opponent ? "win" : "loss";
}

export function randomRpsChoice(random: () => number = Math.random): RpsChoice {
  return RPS_CHOICES[Math.min(RPS_CHOICES.length - 1, Math.floor(random() * RPS_CHOICES.length))];
}
