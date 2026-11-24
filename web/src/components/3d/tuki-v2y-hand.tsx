'use client';

import { useEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import type { ThreeElements } from '@react-three/fiber';
import { resetTukiPose, setTukiPose, verifyTukiV2NRig, type TukiFinger } from '@/lib/tuki-v2n-rig';
import type { EnclosureMode } from './tuki-digital-twin';

export type TukiV2YPose = Partial<Record<TukiFinger, number>>;

type Props = Omit<ThreeElements['group'], 'children'> & {
  closure?: TukiV2YPose;
  mode?: EnclosureMode;
};

/**
 * Primary TUKI web digital twin: V2Y forearm/cabinet and V2N articulated hand.
 * Servo/pulley meshes are nominal visual references; neither tendon routing
 * nor physical servo calibration is simulated or certified here.
 */
export function TukiV2YHand({ closure = {}, mode = 'exterior', ...groupProps }: Props) {
  const { scene } = useGLTF('/models/tuki-v2y.glb');
  const model = useMemo(() => {
    const clone = scene.clone(true);
    const missing = verifyTukiV2NRig(clone);
    if (missing.length) throw new Error(`TUKI V2Y: missing joint nodes: ${missing.join(', ')}`);
    return clone;
  }, [scene]);

  const parts = useMemo(() => {
    const names = [
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
    ];
    return names.map(name => {
      const object = model.getObjectByName(name);
      if (!object) throw new Error(`TUKI V2Y: missing assembly node ${name}`);
      return { name, object, original: object.position.clone() };
    });
  }, [model]);

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
    parts.forEach(({ name, object, original }) => {
      const isDoor = [
        'ForearmDoor_V2Y',
        'ElectronicsDoor_V2Y',
        'TransitionCover_V2Y',
      ].includes(name);
      const internal = [
        'ServoBoard_5SG90_V2Y',
        'TendonGuideUpper_V2Y',
        'TendonGuideMid_V2Y',
        'SERVOS_NOMINALES_V2Y',
      ].includes(name);
      // In 'interior', remove both access doors but keep the structural
      // open shells and collar for context; show the servo board and guides.
      object.visible = mode === 'exterior' ? !internal : mode === 'interior' ? !isDoor : true;
      object.position.copy(original);
      // Values here are millimetres under the 0.001-scaled CAD root.
      if (mode === 'exploded' && name === 'ForearmDoor_V2Y') object.position.z += 20;
      if (mode === 'exploded' && name === 'ElectronicsDoor_V2Y') object.position.z += 25;
      if (mode === 'exploded' && name === 'WristCollar_V2Y') object.position.y += 8;
      if (mode === 'exploded' && name === 'TransitionCover_V2Y') object.position.z += 16;
      if (mode === 'exploded' && name === 'ServoBoard_5SG90_V2Y') object.position.z += 8;
    });
  }, [parts, mode]);

  return <group {...groupProps}><primitive object={model} /></group>;
}

useGLTF.preload('/models/tuki-v2y.glb');
