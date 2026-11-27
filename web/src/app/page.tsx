import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { TukiDigitalTwin } from "@/components/3d/tuki-digital-twin";
import { MovementIntro } from "@/components/movement-intro";
import { HomeArchitecture } from "@/components/home-architecture";

function Mark({ kind }: { kind: string }) {
  if (kind === "twin") return <div className="mark mark-twin" aria-hidden="true"><Image src="/images/tuki-v4-r1-exterior.png" alt="" fill sizes="(max-width: 760px) 50vw, 25vw" /></div>;
  if (kind === "gesture") return <div className="mark mark-gesture" aria-hidden="true"><span className="pose-label">FINGER INPUT</span><div className="pose-controls">{["T", "I", "M", "R", "P"].map((finger, i) => <i key={finger} className={`pose-track pose-track-${i}`}><b /><small>{finger}</small></i>)}</div><span className="pose-caption">FIVE INDEPENDENT CONTROLS</span></div>;
  if (kind === "voice") return <div className="mark mark-voice" aria-hidden="true"><span className="voice-mic"><Microphone /></span><span className="voice-wave">{[12, 22, 35, 17, 29, 10, 23, 15, 31, 12, 21].map((height, i) => <i key={i} style={{ height }} />)}</span></div>;
  if (kind === "record") return <div className="mark mark-record" aria-hidden="true"><div className="timeline-preview"><span>POSE TIMELINE</span><div><i /><i /><i /><i /><i /></div><small>00:00 <b /> 00:04</small></div></div>;
  if (kind === "game") return <div className="mark mark-game" aria-hidden="true"><span className="sequence-label">REPEAT THE PATTERN</span><div className="sequence-preview"><i>2</i><b>&rarr;</b><i className="active">4</i><b>&rarr;</b><i>1</i><b>&rarr;</b><i>3</i></div><span className="sequence-foot">ROUND 04 · SIMULATED</span></div>;
  if (kind === "number") return <div className="mark mark-number" aria-hidden="true"><span className="number-caption">FINGER COUNT</span><div className="number-scale">{[0, 1, 2, 3, 4, 5].map(n => <i key={n} className={n === 3 ? "selected" : ""}>{n}</i>)}</div><span className="number-caption">ZERO TO FIVE</span></div>;
  return <div className="mark mark-rps" aria-hidden="true"><span className="rps-caption">THREE HAND SHAPES</span><div className="rps-shapes"><span><b className="rps-rock"/><small>ROCK</small></span><span><b className="rps-paper"/><small>PAPER</small></span><span><b className="rps-scissors"/><small>SCISSORS</small></span></div></div>;
}
function Microphone() { return <svg viewBox="0 0 24 24" fill="none"><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3m-4 0h8"/></svg>; }
const capabilities = [
  ["twin", "DIGITAL TWIN", "The V2N hand and V4 R1 assembly move with your controls."],
  ["gesture", "GESTURE CONTROL", "Explore a small language of hand shapes."],
  ["voice", "VOICE INPUT", "Try browser-based commands in two languages."],
  ["record", "MOTION RECORDER", "Capture, arrange, and replay simulated poses."],
  ["game", "SIMON SAYS", "Remember the sequence. Recreate the movement."],
  ["number", "NUMBER GESTURES", "Count from zero to five, one hand at a time."],
  ["rps", "ROCK PAPER SCISSORS", "Play a classic three-shape game with the digital twin."],
] as const;

export default function Home() {
  return <>
    <MovementIntro />

    <section className="reveal-section">
      <div className="reveal-top"><span>02 â€” A CLOSER LOOK</span><span>FIVE DIGITS. ONE IDEA.</span></div>
      <div className="reveal-content">
        <div className="technical-hand"><TukiDigitalTwin variant="technical" /></div>
        <div className="reveal-copy">
          <p className="eyebrow">THE HAND, REIMAGINED</p>
          <h2>Where cables<br />become <em>motion.</em></h2>
          <p>A tendon-driven approach brings the hand into movement. Five articulated digits make the interface familiar. The hand uses the supplied CAD geometry. The enclosure fit is provisional.</p>
          <div className="reveal-list"><span>01 <b>Five articulated fingers</b></span><span>02 <b>Tendon-driven concept</b></span><span>03 <b>Digital twin simulation</b></span></div>
        </div>
      </div>
      <div className="reveal-bottom"><span>ENCLOSURE FIT UNVERIFIED</span><span>TUKI / MOTION STUDY</span></div>
    </section>

    <HomeArchitecture />

    <section className="capabilities">
      <div className="cap-top">
        <div><p className="eyebrow">A DIGITAL SPACE TO EXPLORE</p><h2>Built for <em>curiosity.</em></h2></div>
        <p>Step inside the simulation. Move each finger, play a pattern, or shape a sequence of your own.</p>
      </div>
      <div className="cap-grid">{capabilities.map(([kind, title, description]) => <Link className="cap-item" href={kind === "rps" ? "/studio?tool=rps" : "/studio"} key={kind}>
        <Mark kind={kind} /><div className="cap-meta"><span>{title}</span><ArrowUpRight size={14} /></div><p>{description}</p>
      </Link>)}</div>
    </section>

    <section className="closing">
      <p className="eyebrow"><i /> THE NEXT MOVEMENT STARTS HERE</p>
      <h2>Explore what<br /><em>TUKI can do.</em></h2>
      <Link className="button button-light" href="/studio">Launch TUKI Studio <ArrowUpRight size={15} /></Link>
      <small>AN INTERACTIVE SIMULATION Â· NO HARDWARE REQUIRED</small>
    </section>
  </>;
}
