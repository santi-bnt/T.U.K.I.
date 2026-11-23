"use client";

import { Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import { CadHand } from "@/components/3d/cad-hand";
import { MathUtils } from "three";
import type { EnclosureMode } from "@/components/3d/tuki-digital-twin";
import type { HandPose } from "@/lib/motion";

function HeroCamera() {
  useFrame(({ camera, gl }, delta) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const progress = MathUtils.clamp(-gl.domElement.getBoundingClientRect().top / window.innerHeight, 0, 1);
    camera.position.x = MathUtils.damp(camera.position.x, .22 + progress * .22, 4, delta);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function HandScene({ pose, mode, orbit, hero }: {
  pose: HandPose; mode: EnclosureMode; orbit: boolean; hero: boolean;
}) {
  return (
    <Canvas
      fallback={<div className="scene-loading"><span>3D unavailable</span><small>Controls remain available</small></div>}
      dpr={[1, 1.5]}
      camera={{ position: [.30, .12, .61], fov: 38, near: .01, far: 8 }}
    >
      {!hero && <color attach="background" args={["#151613"]} />}
      <hemisphereLight args={["#f6f5f0", "#737580", 2.25]} />
      <directionalLight position={[.45, .7, .55]} intensity={2.6} color="#fff0dc" />
      <directionalLight position={[-.4, .25, -.4]} intensity={1.5} color="#dee9ff" />
      <Suspense fallback={null}>
        <CadHand pose={pose} mode={mode} />
        <ContactShadows position={[0, -.09, 0]} opacity={.42} scale={.55} blur={2.4} far={.45} resolution={128} />
      </Suspense>
      {hero && !orbit ? <HeroCamera /> : <OrbitControls target={[0, 0, 0]} enablePan={false} minDistance={.18} maxDistance={1.15} />}
    </Canvas>
  );
}
