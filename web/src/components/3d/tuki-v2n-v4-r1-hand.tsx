"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Material, MathUtils, Mesh, Vector3, type Object3D } from "three";
import type { ThreeElements } from "@react-three/fiber";
import { resetTukiPose, setTukiPose, verifyTukiV2NRig } from "@/lib/tuki-v2n-rig";
import type { TukiFinger } from "@/lib/tuki-v2n-rig";
import type { EnclosureMode } from "./tuki-digital-twin";

export type TukiV2NClosure = Partial<Record<TukiFinger, number>>;

type Props = Omit<ThreeElements["group"], "children"> & {
  closure?: TukiV2NClosure;
  mode?: EnclosureMode;
};

const MODEL_URL = "/models/tuki-v2n-v4-r1.glb";
const INTERIOR_DOOR_ANGLE = MathUtils.degToRad(-105);
const DOOR_PIVOTS = [
  "R1_BISAGRA_SUPERIOR_EJE_Y",
  "R1_BISAGRA_INFERIOR_EJE_Y",
] as const;

// Los desplazamientos son exclusivos de la vista explicativa; no representan
// una secuencia de montaje ni modifican las piezas de fabricación.
const EXPLODED_OFFSETS: Record<string, Vector3> = {
  R1_CARCASA_ANTEBRAZO: new Vector3(-14, 0, 0),
  R1_BASE_GABINETE: new Vector3(14, 0, 0),
  R1_MUNECA_5_GUIAS: new Vector3(0, 12, 0),
  R1_CUBIERTA_TRANSICION: new Vector3(0, 0, 10),
  R1_PLACA_M3_5_SG90: new Vector3(0, 0, 16),
  R1_5_SG90_NOMINALES: new Vector3(0, 0, -18),
  R1_POLEA_01: new Vector3(0, 0, 23),
  R1_POLEA_02: new Vector3(0, 0, 23),
  R1_POLEA_03: new Vector3(0, 0, 23),
  R1_POLEA_04: new Vector3(0, 0, 23),
  R1_POLEA_05: new Vector3(0, 0, 23),
  ...Object.fromEntries(Array.from({ length: 10 }, (_, index) => [
    `R1_ABRAZADERA_M3_${String(index + 1).padStart(2, "0")}`,
    new Vector3(0, 0, 16),
  ])),
};

const REQUIRED_ASSEMBLY_NODES = [
  "R1_CARCASA_ANTEBRAZO",
  "R1_PUERTA_ANTEBRAZO",
  "R1_PLACA_M3_5_SG90",
  "R1_MUNECA_5_GUIAS",
  "R1_BASE_GABINETE",
  "R1_PUERTA_GABINETE",
  "R1_CUBIERTA_TRANSICION",
  "R1_PASADOR_SUPERIOR",
  "R1_PASADOR_INFERIOR",
  ...Array.from({ length: 10 }, (_, index) => `R1_ABRAZADERA_M3_${String(index + 1).padStart(2, "0")}`),
  ...Array.from({ length: 5 }, (_, index) => `R1_POLEA_${String(index + 1).padStart(2, "0")}`),
  ...Array.from({ length: 5 }, (_, index) => `R1_SG90_${String(index + 1).padStart(2, "0")}_REFERENCIA`),
] as const;

type TransformSnapshot = {
  name: string;
  object: Object3D;
  position: Vector3;
  rotation: Object3D["rotation"];
};

function prepareRenderResources(root: Object3D): { materials: Set<Material>; geometries: Set<Mesh["geometry"]> } {
  const materialsById = new Map<string, Material>();
  const geometriesById = new Map<string, Mesh["geometry"]>();
  root.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    object.castShadow = true;
    object.receiveShadow = true;
    const sourceGeometry = object.geometry;
    const sourceNormals = sourceGeometry.getAttribute("normal");
    if (!sourceNormals || sourceNormals.count !== sourceGeometry.getAttribute("position").count) {
      let renderGeometry = geometriesById.get(sourceGeometry.uuid);
      if (!renderGeometry) {
        const computedGeometry = sourceGeometry.clone();
        computedGeometry.deleteAttribute("normal");
        computedGeometry.computeVertexNormals();
        geometriesById.set(sourceGeometry.uuid, computedGeometry);
        renderGeometry = computedGeometry;
      }
      object.geometry = renderGeometry;
    }
    const sources = Array.isArray(object.material) ? object.material : [object.material];
    const copies = sources.map((source) => {
      const cached = materialsById.get(source.uuid);
      if (cached) return cached;
      const copy = source.clone();
      if ("envMapIntensity" in copy) copy.envMapIntensity = 1;
      materialsById.set(source.uuid, copy);
      return copy;
    });
    object.material = Array.isArray(object.material) ? copies : copies[0];
  });
  return {
    materials: new Set(materialsById.values()),
    geometries: new Set(geometriesById.values()),
  };
}

/** Renderiza el GLB V2N + V4 R1 y conduce sus juntas desde HandPose normalizado. */
export function TukiV2NV4R1Hand({ closure = {}, mode = "exterior", ...groupProps }: Props) {
  const { scene, animations } = useGLTF(MODEL_URL);
  const reducedMotion = useRef(false);
  const model = useMemo(() => {
    const clone = scene.clone(true);
    const missingJoints = verifyTukiV2NRig(clone);
    if (missingJoints.length) {
      throw new Error(`TUKI V2N + V4 R1: faltan articulaciones ${missingJoints.join(", ")}`);
    }
    for (const name of REQUIRED_ASSEMBLY_NODES) {
      if (!clone.getObjectByName(name)) throw new Error(`TUKI V2N + V4 R1: falta el nodo ${name}`);
    }
    const requiredClips = ["CLOSE_PULGAR", "CLOSE_INDICE", "CLOSE_MEDIO", "CLOSE_ANULAR", "CLOSE_MENIQUE"];
    for (const name of requiredClips) {
      if (!animations.some((clip) => clip.name === name)) throw new Error(`TUKI V2N + V4 R1: falta el clip ${name}`);
    }
    return clone;
  }, [animations, scene]);
  const resources = useMemo(() => prepareRenderResources(model), [model]);

  useEffect(() => () => {
    resources.materials.forEach((material) => material.dispose());
    resources.geometries.forEach((geometry) => geometry.dispose());
  }, [resources]);

  const transforms = useMemo<TransformSnapshot[]>(() => {
    const names = [...DOOR_PIVOTS, ...Object.keys(EXPLODED_OFFSETS)];
    return names.map((name) => {
      const object = model.getObjectByName(name);
      if (!object) throw new Error(`TUKI V2N + V4 R1: falta el transform ${name}`);
      return {
        name,
        object,
        position: object.position.clone(),
        rotation: object.rotation.clone(),
      };
    });
  }, [model]);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => { reducedMotion.current = preference.matches; };
    updatePreference();
    preference.addEventListener("change", updatePreference);
    return () => preference.removeEventListener("change", updatePreference);
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
    }, animations);
  }, [animations, model, thumb, index, middle, ring, pinky]);

  useEffect(() => {
    for (const transform of transforms) {
      transform.object.position.copy(transform.position);
      transform.object.rotation.copy(transform.rotation);
      if (mode === "exploded") {
        const offset = EXPLODED_OFFSETS[transform.name];
        if (offset) transform.object.position.add(offset);
      }
    }
  }, [mode, transforms]);

  useFrame((_, delta) => {
    const target = mode === "exterior" ? 0 : INTERIOR_DOOR_ANGLE;
    const dt = Math.min(Math.max(delta, 0), 0.05);
    for (const name of DOOR_PIVOTS) {
      const transform = transforms.find((entry) => entry.name === name);
      if (!transform) continue;
      const angle = reducedMotion.current
        ? target
        : MathUtils.damp(transform.object.rotation.y, transform.rotation.y + target, 8, dt);
      transform.object.rotation.set(transform.rotation.x, angle, transform.rotation.z);
    }
  });

  return <group {...groupProps}><primitive object={model} /></group>;
}

useGLTF.preload(MODEL_URL);
