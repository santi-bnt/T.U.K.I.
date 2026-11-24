"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";

const STEPS = [
  {
    id: "camera",
    index: "01",
    title: "Camera input",
    short: "Intended interaction direction",
    status: "INTENDED DIRECTION",
    detail: "Camera-based interaction is the chosen direction for TUKI. Camera capture and camera permissions are not implemented in the current website.",
  },
  {
    id: "vision",
    index: "02",
    title: "Vision interpretation",
    short: "Gesture recognition and pose mapping",
    status: "PLANNED",
    detail: "Recognizing gestures in camera imagery and translating them into normalized hand poses remains future work.",
  },
  {
    id: "hand",
    index: "04",
    title: "Future robotic hand integration",
    short: "Physical execution planned",
    status: "FUTURE INTEGRATION",
    detail: "Physical integration, servo calibration, and movement limits remain unvalidated. The website does not drive the physical hand.",
  },
] as const;

const SIMULATION = {
  id: "simulation",
  index: "03",
  title: "Web digital twin",
  short: "Interactive browser simulation",
  status: "IMPLEMENTED · SIMULATION",
  detail: "The articulated twin responds to direct browser controls today. Camera-driven gesture interpretation is not connected yet.",
} as const;

type StepId = (typeof STEPS)[number]["id"];
type ComponentId = StepId | typeof SIMULATION.id;
type TimelineItem =
  | { kind: "step"; step: (typeof STEPS)[number] }
  | { kind: "simulation" };

const TIMELINE: TimelineItem[] = [
  { kind: "step", step: STEPS[0] },
  { kind: "step", step: STEPS[1] },
  { kind: "simulation" },
  { kind: "step", step: STEPS[2] },
];

export function ArchitectureDiagram() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<ComponentId>("camera");
  const selected = selectedId === SIMULATION.id
    ? SIMULATION
    : STEPS.find((step) => step.id === selectedId) ?? STEPS[0];

  useLayoutEffect(() => {
    if (!rootRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>("[data-flow-step]");
      gsap.fromTo(items, { y: 14, autoAlpha: 0 }, {
        y: 0,
        autoAlpha: 1,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: { trigger: rootRef.current, start: "top 82%", once: true },
      });
      gsap.fromTo("[data-flow-detail]", { y: 10, autoAlpha: 0 }, {
        y: 0,
        autoAlpha: 1,
        duration: 0.45,
        delay: 0.3,
        ease: "power2.out",
        scrollTrigger: { trigger: rootRef.current, start: "top 80%", once: true },
      });
    }, rootRef);
    return () => context.revert();
  }, []);

  const select = (id: ComponentId) => setSelectedId(id);

  return (
    <div ref={rootRef} className="architecture-visual architecture-visual-technology">
      <div className="architecture-lane-heading">
        <span>CAMERA-BASED INTERACTION</span>
        <span>INTENDED PATH / STATUS BY STAGE</span>
      </div>
      <div className="architecture-timeline" role="group" aria-label="Camera-based interaction stages">
        {TIMELINE.map((item, index) => {
          const id = item.kind === "simulation" ? SIMULATION.id : item.step.id;
          return (
            <div className="architecture-timeline-item" key={id} data-flow-step>
              {item.kind === "simulation" ? (
                <div
                  className={`simulation-feature${selectedId === SIMULATION.id ? " is-selected" : ""}`}
                  onMouseEnter={() => select(SIMULATION.id)}
                >
                  <button
                    type="button"
                    className="simulation-select"
                    aria-pressed={selectedId === SIMULATION.id}
                    onClick={() => select(SIMULATION.id)}
                    onFocus={() => select(SIMULATION.id)}
                  >
                    <span className="simulation-node-mark" aria-hidden="true">{SIMULATION.index}</span>
                    <span className="simulation-node-content">
                      <span className="architecture-node-status is-implemented"><i />{SIMULATION.status}</span>
                      <strong>{SIMULATION.title}</strong>
                      <span className="simulation-node-description">The articulated twin responds to direct browser controls today. Camera-driven gesture interpretation remains planned.</span>
                    </span>
                  </button>
                  <div className="simulation-node-aside">
                    <div className="simulation-preview">
                      <Image
                        src="/images/tuki-v2y-interior.png"
                        alt="Interior preview of the TUKI V2Y assembly and central staggered five-servo board"
                        fill
                        sizes="(max-width: 600px) 76px, (max-width: 900px) 180px, 28vw"
                      />
                      <span>CAD DIGITAL TWIN</span>
                    </div>
                    <Link className="simulation-launch" href="/studio">Launch Studio <ArrowUpRight size={14} /></Link>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className={`architecture-node${selectedId === item.step.id ? " is-selected" : ""}`}
                  aria-pressed={selectedId === item.step.id}
                  onClick={() => select(item.step.id)}
                  onFocus={() => select(item.step.id)}
                  onMouseEnter={() => select(item.step.id)}
                >
                  <span className="architecture-node-index">{item.step.index}</span>
                  <span className="architecture-node-copy">
                    <span className="architecture-node-status"><i />{item.step.status}</span>
                    <b>{item.step.title}</b>
                    <small>{item.step.short}</small>
                  </span>
                </button>
              )}
              {index < TIMELINE.length - 1 && <span className="architecture-timeline-connector" aria-hidden="true" />}
            </div>
          );
        })}
      </div>

      <div className="architecture-detail" data-flow-detail aria-live="polite" aria-atomic="true">
        <span>{selected.index} / {selected.status}</span>
        <p>{selected.detail}</p>
      </div>
    </div>
  );
}
