'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Group, MathUtils, type Object3D } from 'three';
import type { ThreeElements } from '@react-three/fiber';
import { resetTukiPose, setTukiPose, verifyTukiV2NRig, type TukiFinger } from '@/lib/tuki-v2n-rig';
import type { EnclosureMode } from './tuki-digital-twin';

export type TukiV2YPose = Partial<Record<TukiFinger, number>>;

type Props = Omit<ThreeElements['group'], 'children'> & {
  closure?: TukiV2YPose;
  mode?: EnclosureMode;
};

// Ejes suministrados para las bisagras; la raíz del GLB escala milímetros a metros.
const CAD_HINGES = {
  forearm: { name: 'ForearmDoor_V2Y', x: -48.5, z: 15 },
  cabinet: { name: 'ElectronicsDoor_V2Y', x: -62, z: 27 },
} as const;

const INTERNAL_PARTS = new Set([
  'ServoBoard_5SG90_V2Y',
  'TendonGuideUpper_V2Y',
  'TendonGuideMid_V2Y',
  'SERVOS_NOMINALES_V2Y',
]);

const ASSEMBLY_PARTS = [
  'ForearmShell_V2Y',
  'ForearmDoor_V2Y',
  'WristCollar_V2Y',
  'ElectronicsCabinet_V2Y',
  'ElectronicsDoor_V2Y',
  'TransitionCover_V2Y',
  'ServoBoard_5SG90_V2Y',
  'TendonGuideUpper_V2Y',
  'TendonGuideMid_V2Y',
  'SERVOS_NOMINALES_V2Y',
] as const;

/** Añade un pivote sin alterar la pose cerrada ni la geometría de la puerta. */
function addHinge(root: Object3D, name: string, x: number, z: number): Group {
  const door = root.getObjectByName(name);
  if (!door?.parent) throw new Error(`TUKI V2Y: missing door or parent: ${name}`);

  const pivot = new Group();
  pivot.name = `${name}_WEB_HINGE`;
  pivot.position.set(x, 0, z);

  // Compensa el pivote en coordenadas locales para que la puerta no salte al incorporarlo.
  const originalPosition = door.position.clone();
  door.parent.add(pivot);
  pivot.add(door);
  door.position.copy(originalPosition.sub(pivot.position));
  return pivot;
}

/**
 * Gemelo digital V2Y con apertura visual del gabinete y mano articulada V2N.
 * Los servos y guías son referencias gráficas; no se simulan tendones ni
 * calibración física de servos.
 */
export function TukiV2YHand({ closure = {}, mode = 'exterior', ...groupProps }: Props) {
  const { scene } = useGLTF('/models/tuki-v2y-visual.glb');
  const reducedMotion = useRef(false);
  const model = useMemo(() => {
    const clone = scene.clone(true);
    const missing = verifyTukiV2NRig(clone);
    if (missing.length) throw new Error(`TUKI V2Y: missing joint nodes: ${missing.join(', ')}`);
    return clone;
  }, [scene]);

  const { parts, hinges } = useMemo(() => {
    const forearm = addHinge(model, CAD_HINGES.forearm.name, CAD_HINGES.forearm.x, CAD_HINGES.forearm.z);
    const cabinet = addHinge(model, CAD_HINGES.cabinet.name, CAD_HINGES.cabinet.x, CAD_HINGES.cabinet.z);
    const parts = ASSEMBLY_PARTS.map(name => {
      const object = model.getObjectByName(name);
      if (!object) throw new Error(`TUKI V2Y: missing assembly node ${name}`);
      return { name, object, original: object.position.clone() };
    });
    return { parts, hinges: { forearm, cabinet } };
  }, [model]);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => {
      reducedMotion.current = preference.matches;
    };
    updatePreference();
    preference.addEventListener('change', updatePreference);
    return () => preference.removeEventListener('change', updatePreference);
  }, []);

  const thumb = closure.PULGAR ?? 0;
  const index = closure.INDICE ?? 0;
  const middle = closure.MEDIO ?? 0;
  const ring = closure.ANULAR ?? 0;
  const pinky = closure.MENIQUE ?? 0;

  useEffect(() => {
    resetTukiPose(model);
    setTukiPose(model, {
      PULGAR: thumb,
      INDICE: index,
      MEDIO: middle,
      ANULAR: ring,
      MENIQUE: pinky,
    });
  }, [model, thumb, index, middle, ring, pinky]);

  useEffect(() => {
    for (const { name, object, original } of parts) {
      object.visible = mode === 'exterior' ? !INTERNAL_PARTS.has(name) : true;
      object.position.copy(original);
      if (mode === 'exploded') {
        // Los paneles conservan sus bisagras; las piezas internas se separan para explicar el conjunto.
        if (name === 'WristCollar_V2Y') object.position.y += 8;
        if (name === 'TransitionCover_V2Y') object.position.z += 16;
        if (name === 'ServoBoard_5SG90_V2Y') object.position.z += 8;
      }
    }
  }, [parts, mode]);

  useFrame((_, delta) => {
    const degrees = mode === 'exterior' ? 0 : mode === 'interior' ? -108 : -95;
    const target = MathUtils.degToRad(degrees);
    const dt = Math.min(Math.max(delta, 0), 0.05);
    const moveDoor = (hinge: Group) => {
      hinge.rotation.y = reducedMotion.current
        ? target
        : MathUtils.damp(hinge.rotation.y, target, 8, dt);
    };

    // Una única rotación por puerta evita mezclar clips glTF con el control manual.
    moveDoor(hinges.forearm);
    moveDoor(hinges.cabinet);
  });

  return <group {...groupProps}><primitive object={model} /></group>;
}

useGLTF.preload('/models/tuki-v2y-visual.glb');
