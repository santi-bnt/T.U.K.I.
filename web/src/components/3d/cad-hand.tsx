"use client";

import { TukiV2NV4R1Hand } from "@/components/3d/tuki-v2n-v4-r1-hand";
import type { EnclosureMode } from "./tuki-digital-twin";
import type { HandPose } from "@/lib/motion";

/**
 * Adapts Studio's English finger names to the V2N joints in the V4 R1 twin.
 * Values remain normalized (0 = open, 1 = closed); the model is visual only.
 */
export function CadHand({ pose, mode }: { pose: HandPose; mode: EnclosureMode }) {
  return (
    <TukiV2NV4R1Hand
      closure={{
        PULGAR: pose.thumb,
        INDICE: pose.index,
        MEDIO: pose.middle,
        ANULAR: pose.ring,
        MENIQUE: pose.pinky,
      }}
      mode={mode}
    />
  );
}
