# Architecture

## Monorepo boundaries

The independently installable Next.js application and its runtime assets are in `web/`. Vercel Root Directory is `web`. Mechanical printables and editable CAD stay in `hardware/`; `firmware/nxp/` remains documentation only. Camera capture and vision interpretation are future work.

## Application flow

Controls, gesture presets, number poses, games, voice commands, and motion playback produce normalized `HandPose` values in `web/src/lib/motion.ts`. Studio passes that state through `TukiDigitalTwin` to `HandScene`, then `CadHand` adapts the English finger keys to the Spanish V2N rig keys consumed by `TukiV2NHand`. Simon Says and Rock Paper Scissors keep their game rules in their corresponding `web/src/lib/` modules.

`TukiV2NHand` clones the cached GLTF scene for independent rendering. The manual rig applies normalized closure to named joint nodes; the included animation clips are retained in the GLB but are not played simultaneously with manual joint rotations. Enclosure view state remains separate from finger pose. The simulator has no physical hardware adapter.

`web/src/lib/i18n.ts` contains the website's English and Spanish copy. Motion sequences use versioned JSON stored in the current browser profile. Speech input uses browser SpeechRecognition when available; camera capture is not implemented.

## Shared V2N model

TUKI V2N es un prototipo mecánico CAD con visualización 3D interactiva y control independiente simulado de cinco dedos. No se ha validado la mano física ni la tensión real de los tendones. La cámara es una dirección de desarrollo futura; no está implementada.

`web/public/models/tuki-v2n.glb` is the sole model loaded locally by the website. Home and Studio share it through `TukiDigitalTwin` → `HandScene` → `CadHand` → `TukiV2NHand`. It retains the V2N hand and diagonal five-SG90 rack, while the former V2K-reused forearm/case group is replaced by CAD generated from `hardware/cad/editable/tuki_v2n_arm_v1/build_tuki_v2n_arm_v1.py`. The new model's arm nodes are `ForearmLeft`, `ForearmRight`, `WristCollar_PalmInterfacePending`, `ElectronicsBase`, `ServiceCover_USB_Pending`, and `ElectronicsCarrier`, grouped under `FOREARM_V2N_ARM_V1`. The historical V2N generator and exact V2K engineering input remain unavailable. The GLB preserves five finger joint chains and clips `CLOSE_PULGAR`, `CLOSE_INDICE`, `CLOSE_MEDIO`, `CLOSE_ANULAR`, and `CLOSE_MENIQUE`.

Finger values range from 0 (open) to 1 (closed). `web/src/lib/tuki-v2n-rig.ts` clamps inputs and applies manual rotations using each joint's captured base quaternion. The GLB has a 0.001 root transform to convert CAD millimetres to glTF metres. Do not alter that transform or joint definitions without documenting and validating the model change.

The Exterior, Interior, and Exploded controls change only the displayed assembly nodes and visual offsets. They do not assert a measured palm interface, USB-C opening, electronics fit, or physical validation of the assembly/tendon mechanism. CAMA_00/CAMA_01 and the printed hand remain unmodified.

## Assets and verification

The previous V2K-related arm meshes were removed from the active GLB. The replacement arm has a reproducible parametric source, and the two current preview images were recaptured from the running viewer. The owner declares the retained V2N design project-developed with AI assistance and directed public-release preparation; the targeted review found no concrete third-party mesh/resource in the active GLB or previews, so these assets are prepared for staging. This statement is distinct from external authorization and does not certify absolute design independence. Historical Shapekit-derived prototype files remain excluded from `web/public/`; credits and the conditional NonCommercial question remain in `docs/ASSET_LICENSES.md`. STL manufacturing beds are not assembled transforms. Preserve the boundaries between `web/`, `hardware/`, `firmware/nxp/`, and `docs/`.

Run `node scripts/check-tuki-model.mjs` from `web/` to check embedded resources, new arm nodes, all five independent manual finger poses, and the five independent glTF clips. Run the four npm checks from `web/`. These checks do not replace browser QA, physical validation, or licensing review.
