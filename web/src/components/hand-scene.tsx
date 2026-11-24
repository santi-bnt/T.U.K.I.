"use client";

import { Suspense, useEffect, useRef, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import { CadHand } from "@/components/3d/cad-hand";
import { MathUtils, Vector3 } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { EnclosureMode } from "@/components/3d/tuki-digital-twin";
import type { HandPose } from "@/lib/motion";

function HeroCamera() {
  useFrame(({ camera, gl }, delta) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const progress = MathUtils.clamp(-gl.domElement.getBoundingClientRect().top / window.innerHeight, 0, 1);
    camera.position.x = MathUtils.damp(camera.position.x, .22 + progress * .22, 4, delta);
    camera.lookAt(0, -0.045, 0);
  });
  return null;
}

const MODE_VIEWS: Record<EnclosureMode, { position: [number, number, number]; target: [number, number, number] }> = {
  exterior: { position: [.34, .06, .79], target: [0, -.045, 0] },
  interior: { position: [.48, .1, .75], target: [0, -.025, 0] },
  exploded: { position: [.51, .14, .82], target: [0, -.025, 0] },
};

/** Enfoca las puertas abiertas al cambiar de modo y luego devuelve el control al usuario. */
function ModeCamera({ mode, controls }: { mode: EnclosureMode; controls: RefObject<OrbitControlsImpl | null> }) {
  const { camera } = useThree();
  const previousMode = useRef(mode);
  const elapsed = useRef(1.4);
  const destination = useRef(MODE_VIEWS[mode]);
  const targetPosition = useRef(new Vector3(...MODE_VIEWS[mode].position));
  const targetLookAt = useRef(new Vector3(...MODE_VIEWS[mode].target));

  useEffect(() => {
    if (previousMode.current === mode) return;
    previousMode.current = mode;
    destination.current = MODE_VIEWS[mode];
    targetPosition.current.set(...destination.current.position);
    targetLookAt.current.set(...destination.current.target);
    elapsed.current = 0;
  }, [mode]);

  useFrame((_, delta) => {
    if (elapsed.current >= 1.4) return;
    elapsed.current = Math.min(1.4, elapsed.current + delta);
    const step = Math.min(delta, .05);
    camera.position.lerp(targetPosition.current, 1 - Math.exp(-6.5 * step));
    const orbit = controls.current;
    if (orbit) {
      orbit.target.lerp(targetLookAt.current, 1 - Math.exp(-6.5 * step));
      orbit.update();
    } else {
      camera.lookAt(targetLookAt.current);
    }
  });
  return null;
}

export default function HandScene({ pose, mode, orbit, hero }: {
  pose: HandPose; mode: EnclosureMode; orbit: boolean; hero: boolean;
}) {
  const controls = useRef<OrbitControlsImpl>(null);
  return (
    <Canvas
      fallback={<div className="scene-loading"><span>3D unavailable</span><small>Controls remain available</small></div>}
      dpr={[1, 1.5]}
      camera={{ position: MODE_VIEWS.exterior.position, fov: 38, near: .01, far: 8 }}
    >
      {!hero && <color attach="background" args={["#151613"]} />}
      <hemisphereLight args={["#f6f5f0", "#737580", mode === "interior" ? 1.9 : 2.25]} />
      <directionalLight position={[.45, .7, .55]} intensity={mode === "interior" ? 2.3 : 2.6} color="#fff0dc" />
      <directionalLight position={[-.4, .25, -.4]} intensity={mode === "interior" ? 1.7 : 1.5} color="#dee9ff" />
      <Suspense fallback={null}>
        <CadHand pose={pose} mode={mode} />
        <ContactShadows position={[0, -.25, 0]} opacity={.42} scale={.55} blur={2.4} far={.45} resolution={128} />
      </Suspense>
      {!hero && <ModeCamera mode={mode} controls={controls} />}
      {hero && !orbit ? <HeroCamera /> : <OrbitControls ref={controls} target={[0, -0.045, 0]} enablePan={false} minDistance={.18} maxDistance={1.15} />}
    </Canvas>
  );
}
