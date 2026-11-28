# Changelog

## Unreleased — Camera Tracking diagnostics for fist closure

- Added separate detected, per-finger calibrated, filtered, and controller pose readouts, plus thumb joint angles, palm opposition, and segment lengths.
- Added local JSON capture of labeled open, partial, and closed landmark samples. Exports contain numeric landmarks and pose stages only; they do not contain or upload camera images/video.
- Calibration now records each finger independently and reports when its measured open/closed span is below the minimum. Added a numeric GLB test comparing thumb `HandPose = 1` with `CLOSE_PULGAR`.
- Documented the current evidence: the reported controller values do not identify the reducing stage without real landmark samples; no new detector thresholds were selected.

## Unreleased — ensamblaje visual web TUKI V2N + V4 R1

- Sustituido el modelo procedural activo por el ensamblaje GLB V2N + V4 R1 suministrado, con cinco referencias SG90, antebrazo, puertas, gabinete, muñeca y poleas. Home y Studio comparten el mismo modelo; Technology usa capturas del visor.
- Adaptados Exterior, Interior y Exploded a los nombres y pivotes de bisagra reales del GLB. Exploded usa desplazamientos solo de presentación y las puertas abren alrededor de sus pivotes del ensamblaje.
- El rig mantiene `HandPose` y las cinco articulaciones independientes. La flexión interpola hacia los extremos de los clips `CLOSE_*` del propio GLB; Camera Tracking, prioridades de fuente, juegos, voz y transporte MOCK siguen en su arquitectura existente.
- Añadido un verificador estructural del nuevo GLB y capturas de navegador de exterior, interior y poses abierta/cerrada. El archivo GLB de origen se conserva byte a byte; las normales ausentes se calculan solo en geometrías clonadas para render.
- La visualización no valida encajes, colisiones físicas, recorrido de tendones ni dimensiones reales de los SG90. No se modificaron CAD, STL, STEP, firmware ni archivos de impresión.

## Historical — procedural web visual model (superseded 2026-11-26)

- Earlier iteration generated `web/public/models/tuki-web-visual.glb` from web-only procedural geometry and used it as the presentation model. The active site now uses the supplied V2N + V4 R1 assembly described above.
- That iteration retained normalized `HandPose`, five independent fingers, and five `CLOSE_*` clips, and corrected the procedural model's thumb pivot and viewer-only door pivots.
- Its before/after, open/fist, interior, exploded, and camera-view captures remain under `docs/visual-review/` as historical review artifacts.
- The procedural asset is not fabrication geometry. No CAD, STL, STEP, firmware, or physical validation was changed or claimed in that iteration.

## Unreleased — digital twin pose and presentation review

- Camera flexion now maps typical 90° human finger-joint bends to full normalized closure; the controller still forwards the accepted five-finger pose unchanged.
- Added GLB-backed checks for each finger and simultaneous poses at 0%, 25%, 50%, 75%, and 100%; the full pose is compared with the supplied `CLOSE_*` clips.
- Improved the web-only TUKI render by generating crease-aware normals for the hand's normal-free CAD meshes, applying satin polymer materials and local studio environment lighting, and focusing the Camera Tracking view on the hand.
- Camera Tracking now keeps the camera preview and digital hand visible together on desktop and mobile. No GLB, CAD, STL, firmware, or physical geometry changed.

## Unreleased — Camera Tracking simulation

- Added configurable per-finger One Euro filtering, a dead zone and normalized speed limit; validates poses and frame timestamps, drops stale/out-of-order data, and re-seeds filters after tracking loss.
- Added optional open/closed camera-to-simulation calibration, raw/filtered value diagnostics, filter controls, tracking/FPS/latency display, and a bounded monitor of mock controller packet events.
- Added `HandMotionController` as Studio's sole `HandPose` owner with fixed source priorities, and an in-memory version-1 MOCK packet adapter that simulates acknowledgements, invalid commands, ordering, delay, loss, errors, and disconnects without real connectivity.
- Camera frames are not uploaded or sent to physical hardware. Updated docs to distinguish simulation calibration from physical servo calibration and record that real webcam/phone operation is still untested.

## V4 mechanical work

- Added a root `imprimir/` selection for V4 R1: three first-print coupons, corrected structural pieces, ten M3 clamps, the pulley candidate, and the hinge-pin/cap bed. Older hand-print beds remain untouched; historical package ZIPs and root-level imported STL files were moved to the ignored local archive, not deleted.

- Added the R1 coaxial hinge bore cuts and the local M3-05 nut relief. The maintenance sequence frees T1 before using the left access.

- Consolidated the supplied D8 access, M3 clamp, hinge pin and thread-passage
  patches with wrist 03. The initial pre-R1 CAD audit identified hinge pin
  interference, a mounting nut overlap and a tool path across the first tendon.

- Added reproducible STEP interference and door checks, plus a parametric prototype wrist with negative-X tendon routing and local export. Assembly and printing remain subject to the V4 physical checks.

## Unreleased — firmware inicial ESP32 + FRDM-KL25Z

- Añadidos proyectos PlatformIO para ESP32 Dev y aplicación C para importar en un proyecto base MCUXpresso SDK de FRDM-KL25Z. UART2↔UART1 comparte un parser ASCII estricto y el ESP32 ofrece consola USB; la API HTTP local Wi-Fi es opcional y requiere credenciales/token locales excluidos de Git.
- Añadido driver de cinco canales TPM0 a 50 Hz, configuración de límites/inversión por dedo, interpolación limitada, watchdog y política de comunicación: desarmado al inicio, PWM bajo en DISARM o timeout, sin afirmar corte de alimentación. Todos los servos siguen deshabilitados hasta calibración/configuración explícita.
- El host test del parser está incluido. No se compilaron ni cargaron los firmwares ni se probaron UART, servos o Wi-Fi físicamente: faltan PlatformIO, MCUXpresso SDK/toolchain y las placas en el entorno.

## Unreleased — V2Y PRO visual presentation

- Integrated the owner-supplied V2Y PRO GLB. It adds web-only door liners, backplates, visual servo details, and a conceptual electronics-board placeholder while preserving the existing V2Y mechanical meshes, hinge parents, five finger joints, and five clips.
- Kept Exterior, Interior, and Exploded controls, five finger controls, games, voice input, and the existing camera transition. Increased the Canvas pixel-ratio cap to improve detail on high-density displays.
- The PRO model is about 16% larger on disk and has about 13% more vertices than the prior visual GLB. Actual low-end mobile hardware performance remains unmeasured; see `docs/DIGITAL_TWIN.md` for the visual-only electronics limitations.
- Typecheck, lint, 11 unit tests, production build, and both GLB validators pass. No CAD, STL, or firmware files were changed.

## Unreleased — V2Y articulated enclosure doors

- Updated the shared V2Y digital-twin component so the forearm and electronics-cabinet doors stay visible and rotate around hinge pivots in Interior and Exploded modes; Exterior keeps them closed.
- Preserved the active V2Y GLB, the V2N articulated-hand rig, its five independent finger controls, and existing games and voice controls. Added reduced-motion handling for the door transition.
- Door movement is a browser visualization based on hinge coordinates supplied with the patch. Browser appearance does not certify physical clearance; the servo and support meshes remain simplified visual references.
- TypeScript, ESLint, 11 unit tests, production build, and the V2Y model checker pass. A 0.25° sweep of the actual GLB plus point-in-solid mesh sampling found mating-surface contact at the collar/cover seams but no sampled volumetric penetration greater than 0.01 mm; no door/servo, door/board, or door/door intersection was found. This does not certify print tolerances or physical clearance. No GLB, CAD, or STL was changed; no push or production deployment was performed.

## Unreleased - V2Y primary web model

- Integrated the owner-supplied V2Y GLB and exterior/interior renders as the website's primary digital twin. Home and Studio share the V2Y component; Technology describes the V2Y forearm and cabinet while retaining historical Shapekit attribution.
- Preserved the V2N GLB as a backup and retained its five-finger pose API, five embedded `CLOSE_*` clips, gestures, number poses, games, voice input, and motion recording/playback.
- Added V2Y asset provenance and physical-validation limitations. No CAD/STL, ZIP, firmware, or V2T/V2W/V2X/V2Y manufacturing file was added to the release changes.
- Typecheck, lint, unit tests, build, and V2Y GLB validation pass. No push or production deployment was performed.


## Unreleased — V2N owner provenance statement and release staging

- Recorded the owner's statement that TUKI V2N was developed from scratch by the project team using parametric CAD with AI assistance, and their direction to prepare the current web assets for public release. This is distinguished from independent proof and third-party authorization.
- Rechecked only the active GLB and its two current previews: no external GLB resources or concrete Shapekit/third-party mesh evidence were found. The V2K shell/tapa concern remains resolved by replacement; historic generator absence is recorded as traceability context, not a release blocker.
- Updated the visible Technology statement and licensing/release notes. The current GLB and renders are prepared for staging; Vercel uses `web` as Root Directory.
- Re-ran the production build and GLB rig check. No commit, push, or deployment was performed.
- Updated Vitest to 4.1.12 and constrained the PostCSS 8 dependency to patched versions after the staged lockfile audit found vulnerable versions. In the clean release copy, `npm audit` reports zero vulnerabilities; typecheck, lint, 11 unit tests, production build, and GLB checks pass. The supported local test environment is Node.js 20.19+ or 22.12+.

## Unreleased — V2N arm replacement and release verification

- Replaced the old V2K-reused forearm/case subsystem in the active web GLB with six parts generated by the new CadQuery V2N/A1 Mini arm source. Removed `ACOPLE_MUNECA`, the two struts, old shell/lid/drawer meshes, and `GUIA_CINCO_TENDONES`; preserved the V2N palm, five-finger meshes, rack, servo proxies, pulleys, and five animation clips.
- Added a repeatable parametric-arm GLB exporter and a merge script. Rebuilt the active model from the locally preserved private hand GLB plus the generated arm; compared all 309 mesh bounds/transforms and all five clips against the first candidate. The model check now executes the actual application rig code and verifies that each manual finger pose moves its own joints only.
- Recaptured exterior and interior Studio previews from the rebuilt model and documented current asset hashes and per-node provenance. Earlier model/previews remain local-only backups outside the release.
- At that review point, source traceability and the owner's clarification had not been updated; the newest entry records the current owner declaration and asset review. No legal independence or physical fit is claimed.
- Left printed hand parts and CAMA_00/CAMA_01 unchanged. No commit, push, or deployment was performed.

## Unreleased — V2N/A1 Mini arm v1 concept

- Added a new parametric CadQuery source and generated assembly STEP, auxiliary GLB, PNG view, and six preliminary STL pieces for a tapered hollow forearm, bolted halves, tapered wrist collar, electronics base, service cover, and board carrier.
- Left CAMA_00/CAMA_01 and all existing V2N hand, rack, finger, firmware, and active web-model files untouched. No battery is reserved; the USB-C opening and palm bolt pattern remain unset pending measurements.
- Audited the new STL meshes for one connected watertight component each and confirmed each generated print orientation fits within 180 × 180 × 180 mm. Physical printing, fit, electronics placement, load strength, and cable clearance are not validated.
- Documented the V2N arm as a separate preliminary set, not an approved replacement for the existing print manifest or web digital twin.

## Historical status before owner statement — TUKI V2N web model integration (2026-11-22)

TUKI V2N es un prototipo mecánico CAD con visualización 3D interactiva y control independiente simulado de cinco dedos. No se ha validado la mano física ni la tensión real de los tendones. La cámara es una dirección de desarrollo futura; no está implementada.

- Routed Home and Studio through the shared V2N model and mapped the existing five normalized controls to its named finger joints.
- Preserved the five V2N glTF animation clips; runtime uses manual joint rotations so the clips are not applied concurrently.
- Reconnected Exterior, Interior, and Exploded viewer modes to V2N enclosure nodes and replaced old public render references with the supplied V2N previews.
- Removed the old Shapekit-derived GLB and render from `web/public/` after replacing active references; kept historical provenance in licensing documentation.
- Recorded that V2N asset redistribution rights and possible derivation questions remain unresolved. No commit, push, or deployment is authorized by this change.
- Audited supplied V2J, V2K, V2N and latest A1 Mini ZIPs: matched 277,484 GLB triangles to supplied V2N STL meshes; confirmed selected finger and forearm parts reuse internal V2J/V2K outputs. The V2N parametric generator/assembly STEP and a V2K input source are missing; the A1 package identifies the previously printed original Shapekit shell/lid and leaves V2N fit pending. Kept publication of the GLB/images on hold.
- Updated the active implementation and release limitations in README, project specification, architecture, and digital-twin documentation.
- Added a per-file V2N provenance manifest and updated the visible Technology credits with source-traceability limits and direct Shapekit/license links. Redistribution rights remain pending owner confirmation; no deployment was performed.
- Reviewed Home, Studio, and Technology at desktop and mobile sizes. Exercised five independent finger sliders, enclosure modes, gesture preset, Simon Says, Rock Paper Scissors, and motion capture in the browser; browser voice input was not tested.

## 0.3.3 — Direct product entry

- Removed the oversized Home hero with the giant TUKI wordmark, introduction copy, duplicate logo typography, and hero-only digital twin scene.
- Kept the compact TUKI navigation logo and moved the existing CAD product story directly beneath navigation with reduced top spacing.
- Removed unused hero-only styles and entrance animations; retained the movement story's own accessible scroll reveal.
- Verified the Home opening at desktop and mobile viewport sizes.

## 0.3.2 â€” Feature grid and Rock Paper Scissors

- Expanded Homeâ€™s â€œBuilt for curiosityâ€ grid from six to seven capabilities and balanced it as a centered 4+3 desktop layout with responsive two-column layouts.
- Replaced abstract marks with feature-specific visuals: the authoritative TUKI CAD render, independent finger-control tracks, browser voice waveform, pose timeline, Simon sequence, finger-count scale, and three game shapes.
- Added a playable Rock Paper Scissors mode to Studio. Its Home card opens the game directly; it maps the selected move onto the existing shared digital-twin gesture state and tests outcome logic.
- Updated the product specification and design-system guidance for the feature layout and game behavior.

## 0.3.1 â€” Featured digital twin card

- Reworked the Web digital twin item in the shared architecture diagram into a responsive featured layout with grouped status, title, description, actual TUKI preview, and a working Launch Studio link.
- Kept the simulation as a separately selectable architecture component and preserved the distinction from the proposed physical hardware path.
- Re-rendered the Intelligence section's model still from the shared GLB at 2x resolution (2020 Ã— 1344) and removed the embedded hero controls and labels from that image.
- Removed the repeated architecture summary beneath â€œOne idea. Two paths.â€ so the interactive diagram carries that explanation.
- Replaced the earlier duplicated architecture stories with a concise camera-led concept on Home and a four-stage interactive path on Technology.
- Updated the project architecture to the intended camera input â†’ vision interpretation â†’ web digital twin â†’ future robotic hand direction, with implemented and planned stages clearly labeled.

## 0.3.0 â€” Editorial product storytelling

- Rebalanced the Home movement story into a copy-and-product-render composition using a static view sourced from the authoritative TUKI GLB.
- Replaced the small Home architecture preview and Technology flow with a shared, interactive architecture visualization that clearly separates planned hardware integration from the implemented browser simulation.
- Added scroll-triggered reveals, keyboard-selectable component details, and responsive layouts for desktop, tablet, and mobile.
- Captured before/after section screenshots in `docs/visual-review/` and documented the storytelling patterns and reduced-motion behavior.

## 0.2.0 â€” Repository and V6 asset organization

- Organized the current print manifest under `hardware/printables/` and the supplied drawer STEP/CadQuery sources under `hardware/cad/editable/`.
- Archived non-current V2â€“V5 assemblies, legacy modular-box beds, print-coordinate duplicates, previews, and old model-generation helpers outside active web and manufacturing paths. Removed exact duplicate GLBs after SHA-256 comparison.
- Promoted the V6 articulated hand and horizontal drawer GLB to `web/public/models/tuki.glb`; Home and Studio share this model.
- Updated the renderer and model check for V6 drawer nodes while retaining all five finger clips and the existing centralized pose API.
- Added a single printing manifest/checklist and documented unverified drawer mounting, electronics clearance, and cable fit.
- Updated repository instructions, product specification, architecture, CAD assembly, digital-twin, design-system, and README documentation to reflect current structure and status.

## 0.1.0 â€” Web simulation foundation

- Established the Next.js application under `web/` with Home, Studio, Technology, localization, normalized hand simulation, gestures, games, voice recognition support, and local sequence authoring.
- Added the shared articulated CAD viewer, simulation-only interaction boundary, and documentation for the future NXP controller.

## 0.3.4 - Vercel preparation and release audit

- Documented Vercel deployment with `web/` as Root Directory, default Next.js build settings, no environment variables, and no hardware dependency.
- Audited tracked, untracked, ignored, duplicate, and archived assets; kept the active V6 model and animation source intact. Added Playwright scratch logs to `.gitignore` without deleting them.
- Recorded Shapekit CC BY-NC 4.0 attribution and unresolved redistribution rights for custom enclosure/drawer assets. Public release of the mixed active GLB remains gated on permission.
- Clarified camera and microphone behavior, HTTPS deployment, browser-dependent speech processing, and implementation limits. Added a favicon and more specific speech error handling.
- Production checks: typecheck, lint, unit tests, and Next.js build pass. Browser viewport review was blocked because the computer-use browser host was unavailable.

## 0.3.5 - Credits and licensing review

- Added a visible Shapekit credit and direct links to the original hand model and CC BY-NC 4.0 license on Technology.
- Recorded the project owner's provenance statement for the TUKI forearm enclosure and horizontal drawer, distinct from Shapekit-derived hand and SG90 mounting adaptations.
- Assessed the non-monetized CV-linked portfolio against the license's NonCommercial definition. The professional-advantage interpretation remains uncertain; public release is held pending written permission or legal clearance.
# Visual presentation update (2026-11-24)

- Added a V2Y viewer GLB variant with more detailed nominal SG90 and pulley visuals. The V2Y enclosure, hand geometry, finger rig, and five clips remain intact; no printable CAD/STL was changed.
- Added a three-quarter camera transition for the Studio Interior and Exploded modes and tuned their lighting for better visibility. The user can orbit normally after the transition.
- Kept `tuki-v2y.glb` as a backup. The active viewer now loads `tuki-v2y-visual.glb`.
- These servo models remain visual proxies; physical servo fit and electronics layout are not validated.
