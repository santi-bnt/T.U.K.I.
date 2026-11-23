'use client';

import { useEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import type { ThreeElements } from '@react-three/fiber';
import { resetTukiPose, setTukiPose, verifyTukiV2NRig, type TukiFinger } from '@/lib/tuki-v2n-rig';
import type { EnclosureMode } from './tuki-digital-twin';

export type TukiV2NPose = Partial<Record<TukiFinger, number>>;

type Props = Omit<ThreeElements['group'], 'children'> & {
  /** Closure values [0,1]. Defaults to open. */
  closure?: TukiV2NPose;
  /** Which enclosure details are visible in the existing viewer controls. */
  mode?: EnclosureMode;
};

/**
 * Renderable for the TUKI V2N digital twin. Use the same component in Home and Studio.
 * Does not drive physical motors or simulate cable tension.
 *
 * Connect existing slider/game state to `closure`. If the app's finger labels are
 * in another language/order, adapt them explicitly in the parent component.
 */
export function TukiV2NHand({ closure = {}, mode = 'exterior', ...groupProps }: Props) {
  const { scene } = useGLTF('/models/tuki-v2n.glb');
  // The GLTF loader returns a cached scene. Clone it so Homepage and Studio
  // never mutate each other's finger transforms.
  const model = useMemo(() => {
    const copy = scene.clone(true);
    const missing = verifyTukiV2NRig(copy);
    if (missing.length) {
      throw new Error(`TUKI V2N: missing rig nodes: ${missing.join(', ')}`);
    }
    return copy;
  }, [scene]);

  const p = closure.PULGAR ?? 0;
  const i = closure.INDICE ?? 0;
  const m = closure.MEDIO ?? 0;
  const a = closure.ANULAR ?? 0;
  const q = closure.MENIQUE ?? 0;

  const enclosureParts = useMemo(() => {
    const names = [
      'ForearmLeft',
      'ForearmRight',
      'WristCollar_PalmInterfacePending',
      'ServiceCover_USB_Pending',
      'ElectronicsBase',
      'ElectronicsCarrier',
      'ACTUACION',
      'SERVOS_NOMINALES',
    ];
    return names.map((name) => {
      const object = model.getObjectByName(name);
      if (!object) throw new Error(`TUKI V2N: missing assembly node ${name}`);
      return { name, object, rest: object.position.clone() };
    });
  }, [model]);

  useEffect(() => {
    resetTukiPose(model);
    setTukiPose(model, { PULGAR: p, INDICE: i, MEDIO: m, ANULAR: a, MENIQUE: q });
  }, [model, p, i, m, a, q]);

  useEffect(() => {
    enclosureParts.forEach(({ name, object, rest }) => {
      const outerShell = [
        'ForearmLeft',
        'ForearmRight',
        'WristCollar_PalmInterfacePending',
        'ServiceCover_USB_Pending',
      ].includes(name);
      const internalMechanism =
        name === 'ACTUACION' || name === 'SERVOS_NOMINALES' || name === 'ElectronicsCarrier';
      object.visible = mode === 'exterior'
        ? !internalMechanism
        : mode === 'interior'
          ? !outerShell && name !== 'ElectronicsBase'
          : true;

      // The GLB stores the assembly in millimetres under a 0.001 root scale.
      // These small local offsets separate the panels only in the exploded view.
      object.position.copy(rest);
      if (mode === 'exploded' && name === 'ForearmLeft') object.position.x -= 12;
      if (mode === 'exploded' && name === 'ForearmRight') object.position.x += 12;
      if (mode === 'exploded' && name === 'WristCollar_PalmInterfacePending') object.position.y += 10;
      if (mode === 'exploded' && name === 'ServiceCover_USB_Pending') object.position.x += 18;
      if (mode === 'exploded' && name === 'ElectronicsBase') object.position.z += 18;
    });
  }, [enclosureParts, mode]);

  return <group {...groupProps}><primitive object={model} /></group>;
}

useGLTF.preload('/models/tuki-v2n.glb');
