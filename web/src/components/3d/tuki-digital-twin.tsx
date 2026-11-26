"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { OPEN_HAND, type HandPose } from "@/lib/motion";

export type EnclosureMode = "exterior" | "interior" | "exploded";
const Scene = dynamic(() => import("@/components/hand-scene"), {
  ssr: false,
  loading: () => <div className="scene-loading">Loading TUKI CAD</div>,
});

export function TukiDigitalTwin({ variant, pose = OPEN_HAND, cameraReset = 0, focusHand = false }: {
  variant: "hero" | "studio" | "technical";
  pose?: HandPose;
  cameraReset?: number;
  focusHand?: boolean;
}) {
  const [mode, setMode] = useState<EnclosureMode>("exterior");
  const [orbit, setOrbit] = useState(variant !== "hero");
  const [visible, setVisible] = useState(variant === "studio");
  const viewport = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (variant === "studio" || !viewport.current) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin: "120px",
    });
    observer.observe(viewport.current);
    return () => observer.disconnect();
  }, [variant]);

  return (
    <div ref={viewport} className={`tuki-twin tuki-twin-${variant}`}>
      {visible && <Scene key={cameraReset} pose={pose} mode={mode} orbit={orbit} hero={variant === "hero"} focusHand={focusHand} />}
      <div className="twin-toolbar">
        {variant === "hero" ? (
          <button className="button button-muted" aria-pressed={orbit} onClick={() => setOrbit(!orbit)}>
            {orbit ? "Finish 360° view" : "Explore in 360°"}
          </button>
        ) : (
          <div className="twin-segments" role="group" aria-label="Forearm view">
            {(["exterior", "interior", "exploded"] as const).map(option => (
              <button key={option} aria-pressed={mode === option} onClick={() => setMode(option)}>
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
