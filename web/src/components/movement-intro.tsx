"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function MovementIntro() {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (!sectionRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      gsap.fromTo("[data-story-copy]", { y: 24, autoAlpha: 0 }, {
        y: 0,
        autoAlpha: 1,
        duration: 0.75,
        ease: "power2.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 76%", once: true },
      });
      gsap.fromTo("[data-story-visual]", { clipPath: "inset(12% 0 0 0)", scale: 1.045 }, {
        clipPath: "inset(0% 0 0 0)",
        scale: 1,
        ease: "none",
        scrollTrigger: { trigger: sectionRef.current, start: "top bottom", end: "bottom top", scrub: 0.4 },
      });
    }, sectionRef);
    return () => context.revert();
  }, []);

  return (
    <section ref={sectionRef} className="manifesto section-wrap" id="story">
      <div className="section-index manifesto-index">01 — THE IDEA</div>
      <div className="manifesto-copy" data-story-copy>
        <p className="eyebrow">BUILT AROUND THE HUMAN HAND</p>
        <h2>Intelligence in<br /><em>every movement.</em></h2>
        <p className="body-large">TUKI explores a simple proposition: a robotic hand can be expressive, approachable, and open to experimentation. Tendons give the concept its motion. The digital twin gives you a place to begin.</p>
        <Link className="text-link" href="/technology">Understand the architecture <ArrowUpRight size={15} /></Link>
      </div>
      <figure className="manifesto-visual" data-story-visual>
        <Image
          src="/images/tuki-v2n-exterior.png"
          alt="TUKI V2N CAD prototype with five open fingers and the forearm enclosure"
          fill
          sizes="(max-width: 600px) 100vw, (max-width: 900px) 48vw, (max-width: 1200px) 72vw, 90vw"
          className="manifesto-render"
          priority={false}
        />
        <div className="manifesto-image-wash" aria-hidden="true" />
        <figcaption><span>TUKI V2N CAD · DIGITAL TWIN</span><span>SIMULATION RENDER</span></figcaption>
        <div className="manifesto-visual-note"><span>05</span><span>ARTICULATED DIGITS</span></div>
      </figure>
    </section>
  );
}
