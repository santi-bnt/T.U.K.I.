"use client";

import { TukiV2NHand } from "@/components/3d/tuki-v2n-hand";
import type { EnclosureMode } from "./tuki-digital-twin";
import type { HandPose } from "@/lib/motion";

/**
 * Adapts the Studio's English finger names to the V2N CAD rig. Values remain
 * normalized (0 = open, 1 = closed); this component only updates the browser model.
 */
export function CadHand({ pose, mode }: { pose: HandPose; mode: EnclosureMode }) {
  return (
    <TukiV2NHand
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
