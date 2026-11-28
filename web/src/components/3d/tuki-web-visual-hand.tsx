'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Material, MathUtils, Mesh, Vector3, type Object3D } from 'three';
import type { ThreeElements } from '@react-three/fiber';
import { resetTukiPose, setTukiPose, verifyTukiV2NRig, type TukiFinger } from '@/lib/tuki-v2n-rig';
import type { EnclosureMode } from './tuki-digital-twin';

export type TukiWebVisualPose = Partial<Record<TukiFinger, number>>;

type Props = Omit<ThreeElements['group'], 'children'> & {
  closure?: TukiWebVisualPose;
  mode?: EnclosureMode;
};

// Web-only hinge axes; these are presentation transforms, not print dimensions.
const WEB_HINGE_AXIS_Y = new Vector3(0, 1, 0);
const WEB_HINGES = {
  forearm: { name: 'ForearmDoor_V2Y', position: new Vector3(-34, -117, 29) },
  cabinet: { name: 'ElectronicsDoor_V2Y', position: new Vector3(-39, -239, 28) },
} as const;

const INTERNAL_PARTS = new Set([
  'ServoBoard_5SG90_V2Y',
  'TendonGuideUpper_V2Y',
  'TendonGuideMid_V2Y',
  'SERVOS_NOMINALES_V2Y',
  'TENDON_ROUTES_WEB',
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
  'TENDON_ROUTES_WEB',
] as const;

function prepareWebMaterials(root: Object3D): Set<Material> {
  const clones = new Map<string, Material>();
  root.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    object.castShadow = true;
    object.receiveShadow = true;
    const sourceMaterials = Array.isArray(object.material) ? object.material : [object.material];
    const localMaterials = sourceMaterials.map((source) => {
      const existing = clones.get(source.uuid);
      if (existing) return existing;
      const clone = source.clone();
      if ('envMapIntensity' in clone) clone.envMapIntensity = 1;
      clones.set(source.uuid, clone);
      return clone;
    });
    object.material = Array.isArray(object.material) ? localMaterials : localMaterials[0];
  });
  return new Set(clones.values());
}

/** Shared web-only model; normalized finger input and view mode remain separate. */
export function TukiWebVisualHand({ closure = {}, mode = 'exterior', ...groupProps }: Props) {
  const { scene } = useGLTF('/models/tuki-web-visual.glb');
  const reducedMotion = useRef(false);
  const model = useMemo(() => {
    const clone = scene.clone(true);
    const missing = verifyTukiV2NRig(clone);
    if (missing.length) throw new Error(`TUKI web model: missing finger pivots: ${missing.join(', ')}`);
    return clone;
  }, [scene]);
  const materials = useMemo(() => prepareWebMaterials(model), [model]);

  useEffect(() => () => materials.forEach((material) => material.dispose()), [materials]);

  const parts = useMemo(() => {
    const parts = ASSEMBLY_PARTS.map((name) => {
      const object = model.getObjectByName(name);
      if (!object) throw new Error(`TUKI web model: missing assembly node ${name}`);
      return { name, object, original: object.position.clone(), originalRotation: object.rotation.clone() };
    });
    for (const door of Object.values(WEB_HINGES)) {
      if (!model.getObjectByName(door.name)) throw new Error(`TUKI web model: missing door ${door.name}`);
    }
    return parts;
  }, [model]);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => { reducedMotion.current = preference.matches; };
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
      const isHingedDoor = Object.values(WEB_HINGES).some((hinge) => hinge.name === name);
      if (!isHingedDoor) object.position.copy(original);
      if (mode === 'exploded') {
        if (name === 'WristCollar_V2Y') object.position.y += 8;
        if (name === 'TransitionCover_V2Y') object.position.z += 18;
        if (name === 'ServoBoard_5SG90_V2Y') object.position.z += 9;
        if (name === 'SERVOS_NOMINALES_V2Y') object.position.z += 9;
        if (name === 'TENDON_ROUTES_WEB') object.position.z += 7;
      }
    }
  }, [parts, mode]);

  useFrame((_, delta) => {
    const degrees = mode === 'exterior' ? 0 : mode === 'interior' ? -108 : -95;
    const target = MathUtils.degToRad(degrees);
    const dt = Math.min(Math.max(delta, 0), 0.05);
    const moveDoor = (hinge: (typeof WEB_HINGES)[keyof typeof WEB_HINGES]) => {
      const doorPart = parts.find((part) => part.name === hinge.name);
      if (!doorPart) return;
      const angle = reducedMotion.current
        ? target
        : MathUtils.damp(doorPart.object.rotation.y, target, 8, dt);
      doorPart.object.rotation.set(
        doorPart.originalRotation.x,
        doorPart.originalRotation.y + angle,
        doorPart.originalRotation.z,
      );
      doorPart.object.position.copy(doorPart.original)
        .sub(hinge.position)
        .applyAxisAngle(WEB_HINGE_AXIS_Y, angle)
        .add(hinge.position);
    };
    moveDoor(WEB_HINGES.forearm);
    moveDoor(WEB_HINGES.cabinet);
  });

  return <group {...groupProps}><primitive object={model} /></group>;
}

useGLTF.preload('/models/tuki-web-visual.glb');
