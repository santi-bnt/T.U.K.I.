"use client";

import { Suspense, useEffect, useRef, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls } from "@react-three/drei";
import { CadHand } from "@/components/3d/cad-hand";
import { MathUtils, Vector3 } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { EnclosureMode } from "@/components/3d/tuki-digital-twin";
import type { HandPose } from "@/lib/motion";

type CameraView = { position: [number, number, number]; target: [number, number, number] };

const MODE_VIEWS: Record<EnclosureMode, CameraView> = {
  exterior: { position: [.34, .06, .79], target: [0, -.045, 0] },
  interior: { position: [.62, .1, .42], target: [0, -.055, -.012] },
  exploded: { position: [.51, .14, .82], target: [0, -.025, 0] },
};

// Acerca el gemelo a la mano cuando Camera Tracking está activo y revela la
// flexión en profundidad con un ángulo lateral de tres cuartos.
const HAND_FOCUS_VIEW: CameraView = {
  position: [.15, .14, .29],
  target: [-.027, .07, .006],
};

function cameraView(mode: EnclosureMode, focusHand: boolean): CameraView {
  return focusHand && mode === "exterior" ? HAND_FOCUS_VIEW : MODE_VIEWS[mode];
}

function HeroCamera() {
  useFrame(({ camera, gl }, delta) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const progress = MathUtils.clamp(-gl.domElement.getBoundingClientRect().top / window.innerHeight, 0, 1);
    camera.position.x = MathUtils.damp(camera.position.x, .22 + progress * .22, 4, delta);
    camera.lookAt(0, -0.045, 0);
  });
  return null;
}

/** Enfoca el ensamblaje o la mano al cambiar de modo; después devuelve el orbit al usuario. */
function ModeCamera({ mode, focusHand, controls }: {
  mode: EnclosureMode;
  focusHand: boolean;
  controls: RefObject<OrbitControlsImpl | null>;
}) {
  const { camera } = useThree();
  const previousView = useRef({ mode, focusHand });
  const elapsed = useRef(1.4);
  const destination = useRef(cameraView(mode, focusHand));
  const targetPosition = useRef(new Vector3(...destination.current.position));
  const targetLookAt = useRef(new Vector3(...destination.current.target));

  useEffect(() => {
    if (previousView.current.mode === mode && previousView.current.focusHand === focusHand) return;
    previousView.current = { mode, focusHand };
    destination.current = cameraView(mode, focusHand);
    targetPosition.current.set(...destination.current.position);
    targetLookAt.current.set(...destination.current.target);
    elapsed.current = 0;
  }, [mode, focusHand]);

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

export default function HandScene({ pose, mode, orbit, hero, focusHand = false }: {
  pose: HandPose;
  mode: EnclosureMode;
  orbit: boolean;
  hero: boolean;
  focusHand?: boolean;
}) {
  const controls = useRef<OrbitControlsImpl>(null);
  return (
    <Canvas
      fallback={<div className="scene-loading"><span>3D unavailable</span><small>Controls remain available</small></div>}
      dpr={[1, 1.85]}
      camera={{ position: focusHand ? HAND_FOCUS_VIEW.position : MODE_VIEWS.exterior.position, fov: focusHand ? 40 : 38, near: .01, far: 8 }}
    >
      {!hero && <color attach="background" args={["#151613"]} />}
      <hemisphereLight args={["#edf4ff", "#30343d", mode === "interior" ? 0.9 : 1.05]} />
      <ambientLight intensity={0.16} color="#dce6f2" />
      <directionalLight position={[.42, .72, .6]} intensity={2.25} color="#fff1dc" />
      <directionalLight position={[-.5, .28, -.45]} intensity={1.25} color="#b9d4ff" />
      <directionalLight position={[.05, -.25, .65]} intensity={0.65} color="#f5c99b" />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={1.8} color="#fff2dc" position={[0, 4, 2]} scale={[5, 2, 1]} />
        <Lightformer form="rect" intensity={1.5} color="#d9e8ff" position={[-4, 1, 0]} rotation={[0, Math.PI / 2, 0]} scale={[1, 4, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#ffffff" position={[3, -1, -3]} rotation={[0, -Math.PI / 3, 0]} scale={[1, 4, 1]} />
      </Environment>
      <Suspense fallback={null}>
        <CadHand pose={pose} mode={mode} />
        <ContactShadows position={[0, -.25, 0]} opacity={.36} scale={.72} blur={1.8} far={.5} resolution={192} />
      </Suspense>
      {!hero && <ModeCamera mode={mode} focusHand={focusHand} controls={controls} />}
      {hero && !orbit ? <HeroCamera /> : <OrbitControls ref={controls} target={focusHand ? HAND_FOCUS_VIEW.target : [0, -.045, 0]} enablePan={false} minDistance={.18} maxDistance={1.15} />}
    </Canvas>
  );
}
