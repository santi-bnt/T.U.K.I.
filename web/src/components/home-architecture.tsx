import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const CONCEPT_STAGES = [
  ["01 / INTENDED DIRECTION", "Camera-led interaction"],
  ["02 / WORKS TODAY", "Interactive web twin"],
  ["03 / FUTURE STEP", "Physical hand integration"],
] as const;

export function HomeArchitecture() {
  return (
    <section className="architecture-preview section-wrap">
      <div className="section-index">03 — A SYSTEM IN THE MAKING</div>
      <div className="arch-copy">
        <p className="eyebrow">A CAMERA-LED INTERACTION CONCEPT</p>
        <h2>Human intent.<br /><em>Machine motion.</em></h2>
        <p className="body-large">Camera-based gestures are TUKI’s intended interaction direction. Today, the articulated twin runs as an independent browser simulation.</p>
        <Link className="text-link" href="/technology">See how interaction works <ArrowUpRight size={15} /></Link>
      </div>
      <div className="concept-stages" aria-label="TUKI interaction status">
        {CONCEPT_STAGES.map(([label, title]) => (
          <div className="concept-stage" key={label}>
            <span>{label}</span>
            <strong>{title}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
