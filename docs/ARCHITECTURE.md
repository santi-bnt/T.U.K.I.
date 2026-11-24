# Architecture

## Monorepo boundaries

**Active web model update (2026-11-23):** Home and Studio load `/models/tuki-v2y.glb` through `TukiV2YHand`. The V2N GLB is preserved as a backup. V2Y keeps the V2N manual finger rig and clips while adding V2Y enclosure-view nodes; these nodes do not represent physical validation. The detailed previous V2N architecture below is historical unless it describes shared application behavior.

The independently installable Next.js application and its runtime assets are in `web/`. Vercel Root Directory is `web`. Mechanical printables and editable CAD stay in `hardware/`; `firmware/nxp/` remains documentation only. Camera capture and vision interpretation are future work.

## Application flow

Controls, gesture presets, number poses, games, voice commands, and motion playback produce normalized `HandPose` values in `web/src/lib/motion.ts`. Studio passes that state through `TukiDigitalTwin` to `HandScene`, then `CadHand` adapts the English finger keys to the Spanish V2N rig keys consumed by `TukiV2YHand`. Simon Says and Rock Paper Scissors keep their game rules in their corresponding `web/src/lib/` modules.

`TukiV2YHand` clones the cached GLTF scene for independent rendering. The manual rig applies normalized closure to named joint nodes; the five animation clips are retained in the GLB but are not played simultaneously with manual joint rotations. Enclosure view state remains separate from finger pose. The simulator has no physical hardware adapter.

`web/src/lib/i18n.ts` contains the website's English and Spanish copy. Motion sequences use versioned JSON stored in the current browser profile. Speech input uses browser SpeechRecognition when available; camera capture is not implemented.

## Previous V2N model snapshot (historical)

TUKI V2N es un prototipo mecánico CAD con visualización 3D interactiva y control independiente simulado de cinco dedos. No se ha validado la mano física ni la tensión real de los tendones. La cámara es una dirección de desarrollo futura; no está implementada.

The backup `web/public/models/tuki-v2n.glb` is not loaded by the active site. Its previous enclosure description and provenance notes are retained here as historical context; the current V2Y assembly is documented above and in `docs/TUKI_V2Y_WEB_MIGRATION.md`.

Finger values range from 0 (open) to 1 (closed). `web/src/lib/tuki-v2n-rig.ts` clamps inputs and applies manual rotations using each joint's captured base quaternion. The GLB has a 0.001 root transform to convert CAD millimetres to glTF metres. Do not alter that transform or joint definitions without documenting and validating the model change.

The Exterior, Interior, and Exploded controls change only the displayed assembly nodes and visual offsets. They do not assert a measured palm interface, USB-C opening, electronics fit, or physical validation of the assembly/tendon mechanism. CAMA_00/CAMA_01 and the printed hand remain unmodified.

## Assets and verification

The previous V2K-related arm meshes were removed from the active GLB. The replacement arm has a reproducible parametric source, and the two current preview images were recaptured from the running viewer. The owner declares the retained V2N design project-developed with AI assistance and directed public-release preparation; the targeted review found no concrete third-party mesh/resource in the active GLB or previews, so these assets are prepared for staging. This statement is distinct from external authorization and does not certify absolute design independence. Historical Shapekit-derived prototype files remain excluded from `web/public/`; credits and the conditional NonCommercial question remain in `docs/ASSET_LICENSES.md`. STL manufacturing beds are not assembled transforms. Preserve the boundaries between `web/`, `hardware/`, `firmware/nxp/`, and `docs/`.

Run `node scripts/check-tuki-model.mjs` from `web/` to check embedded resources, new arm nodes, all five independent manual finger poses, and the five independent glTF clips. Run the four npm checks from `web/`. These checks do not replace browser QA, physical validation, or licensing review.
