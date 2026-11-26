import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ArchitectureDiagram } from "@/components/architecture-diagram";

const components = [
  ["01", "Camera input", "OPT-IN STUDIO INPUT", "Implemented", "Studio requests camera permission only after the user starts tracking; preview and inference run in the browser."],
  ["02", "Vision interpretation", "FINGER-FLEXION ESTIMATE", "Implemented", "MediaPipe's 21 landmarks estimate five independent normalized flexion values. Semantic gesture recognition and human/robot calibration remain future work."],
  ["03", "Web digital twin", "CURRENT WEB SYSTEM", "Implemented", "The browser simulation uses the same HandPose for manual controls, presets, games, motion sequences, and optional camera input."],
  ["04", "Tendon-driven hand", "PHYSICAL INTEGRATION", "Planned", "The five-finger right hand and its actuation have not yet been fully assembled or physically validated."],
  ["05", "SG90 servomotors", "ACTUATION", "Available", "SG90 servomotors are available for the project. Final mounting and movement calibration remain open."],
  ["06", "NXP controller", "CONTROL CONCEPT", "Planned", "An NXP controller is proposed for future hand integration. Firmware and physical control are outside this web phase."],
] as const;

export default function Technology() {
  return <div className="technology-page">
    <section className="tech-hero">
      <div className="hero-topline"><span>TECHNOLOGY / PROJECT NOTES</span><span>03 / 03 — THE SYSTEM</span></div>
      <p className="eyebrow"><i /> AN ARCHITECTURE IN PROGRESS</p>
      <h1>From intent<br />to <em>motion.</em></h1>
      <p className="body-large">A five-finger robotic hand concept, paired with an interactive browser simulation.</p>
      <div className="tech-hero-bottom"><span>PROJECT STATUS · WEB SIMULATION</span><span>NO DEVICE CONNECTION</span></div>
    </section>

    <section className="tech-flow">
      <div className="tech-flow-copy">
        <div className="section-index">01 — ARCHITECTURE MAP</div>
        <p className="eyebrow">CAMERA-DRIVEN SIMULATION / STATUS BY STAGE</p>
        <h2>From camera<br /><em>to motion.</em></h2>
        <p className="tech-flow-note"><span>INSPECT THE FLOW</span><span>Select a stage to see its role and implementation status.</span></p>
      </div>
      <ArchitectureDiagram />
    </section>

    <section className="tech-components">
      <div className="section-index">02 — WHAT&apos;S KNOWN</div>
      <div className="component-head"><h2>Designed with<br /><em>the unknowns visible.</em></h2><p>We distinguish what is available, what is planned, and what is already working in the browser.</p></div>
      <div className="component-list">{components.map(([number, title, subtitle, status, description]) => <article className="component-row" key={number}>
        <span className="component-num">{number}</span><div><small>{subtitle}</small><h3>{title}</h3></div>
        <span className={status === "Implemented" ? "component-status implemented" : "component-status"}>{status}</span><p>{description}</p>
      </article>)}</div>
    </section>

    <section className="boundaries">
      <p className="eyebrow">THE IMPORTANT DETAILS</p><h2>Progress, with<br /><em>honest edges.</em></h2>
      <div className="boundary-grid">
        <div><span>01 / MOVEMENT</span><p>Finger values are normalized from 0 to 1. They are simulation inputs, not physical servo angles or validated joint positions.</p></div>
        <div><span>02 / SENSING</span><p>No pressure or tactile sensors are part of the current project version. The website does not show live sensor data.</p></div>
        <div><span>03 / CONTROL</span><p>Servo calibration, tendon-to-joint mapping, control messages, and physical travel limits remain to be established.</p></div>
      </div>
      <Link className="button button-light" href="/studio">Explore the simulation <ArrowUpRight size={15} /></Link>
    </section>

    <section className="boundaries" id="credits" aria-labelledby="credits-title">
      <p className="eyebrow">DESIGN CREDIT</p>
      <h2 id="credits-title">Built on shared<br /><em>ideas and work.</em></h2>
      <p className="body-large">The owner supplied the V2Y web model and describes its CAD as developed for TUKI with AI assistance. The active twin combines the articulated V2N hand with the V2Y forearm enclosure, access doors, side USB-C cable passage, nominal five-servo mounting arrangement and a conceptual electronics-board placeholder. The PRO details are visual only; the board is not the physical NXP controller and does not specify mounting holes or connections. The package does not provide the complete CAD-to-mesh source chain; see the provenance notes for the evidence and its limits. No concrete external mesh dependency was identified in the supplied web assets, but this is not proof of absolute design independence or third-party authorization. Finger movement is simulated; physical fit, servo mounting, cable routing and tendon tension have not been validated.</p>
      <p className="body-large">Earlier TUKI prototypes explored and adapted Shapekit&apos;s <a href="https://shapekit.cc/robot-hand" target="_blank" rel="noreferrer">Tendon-Driven Robot Hand</a>, offered under <a href="https://creativecommons.org/licenses/by-nc/4.0/" target="_blank" rel="noreferrer">CC BY-NC 4.0</a>. That license permits adaptations under its conditions; it does not automatically classify every later TUKI component. No exact matching facets were detected between the earlier V2N STL meshes and the inspected Shapekit references; this does not certify mechanical independence. Shapekit is not affiliated with or endorsing TUKI.</p>
    </section>
  </div>;
}
