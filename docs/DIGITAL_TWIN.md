# TUKI digital twin

This document describes the browser visualization. Manufacturing revisions and physical validation are tracked separately and are not inferred from the web model.

**Active model update (2026-11-26):** `web/public/models/tuki-v2n-v4-r1.glb` is loaded through the shared `TukiDigitalTwin` -> `HandScene` -> `CadHand` -> `TukiV2NV4R1Hand` path. It combines the owner-supplied V2N hand GLB, 24 V4 R1 STEP solids and five detailed nominal SG90 references. The model retains 14 finger joints and five clips. Interior animates the supplied R1 hinge pivots; Exploded uses display-only transforms. Neither verifies physical fit or full motion clearance. Provenance, scene structure and limits are recorded in `docs/TUKI_R1_WEB_ASSEMBLY.md`.

**V2Y PRO visual update (historical backup, 2026-11-24):** The owner-supplied package adds 81 decorative nodes for door liners/ribs, backplates, nominal servo details, and a conceptual PCB with connectors. A structural comparison found every pre-existing node transform and mesh position array unchanged from `tuki-v2y-visual.glb`; all five finger clips and named joints remain present. Door decoration is parented to the corresponding moving door nodes so it follows the existing hinge animation. The PCB is not the NXP board and does not represent measured dimensions, holes, wiring, or fit. This presentation-only variant adds no printable parts and does not validate physical clearances.

## Camera-driven simulation

**Camera flexion estimator and diagnostic update (2026-11-27):** Landmark coordinates are corrected using the active video aspect ratio before angle and distance calculations. The four long fingers combine PIP/DIP bend with fingertip-to-wrist distance normalized by wrist-to-middle-MCP palm length. The thumb combines its strongest MCP/IP bend with tip-to-palm-center opposition, also normalized by palm length. These are heuristic browser-simulation features, not a classifier or physical measurement. The panel exposes detected, calibrated, filtered and controller values; thumb angles/opposition/segment lengths; and per-finger calibration range. The user can tag recent numeric landmark frames as open, partial or closed and download JSON locally; no images/video are included or uploaded. `docs/CAMERA_TRACKING_DIAGNOSIS.md` records why the reported controller values cannot yet identify the failing stage and why no new detector constants were selected without real samples. Reaching a detector/calibration endpoint may bypass One Euro smoothing, but still moves through the configured speed limit; the deadband cannot trap the output short of 0 or 1. Session resets retain filter settings and captured calibration. Synthetic landmark and GLB tests cover these stages, but webcam/phone behavior and real fist landmarks still require testing on physical cameras.

Studio's Camera Tracking mode requests access only after the user starts it. MediaPipe Hand Landmarker detects 21 landmarks in a Web Worker. The helper combines joint bend with hand-relative fingertip/opposition distances, then applies independently configurable One Euro filters, a dead zone, a normalized speed cap, timestamp validation, stale-frame rejection, and filter re-seeding after tracking loss. Optional per-finger open/closed captures rescale simulation values only; each finger reports whether its measured span is sufficient, and insufficient fingers remain on the uncalibrated estimate. Calibration does not measure human joints or SG90 positions. Diagnostics display detected, calibrated, filtered, and controller values; thumb geometry; filter settings; tracking state; FPS; approximate inference latency; and mock packet events. The local preview shows landmarks and a clear searching/lost state. Camera switching uses devices exposed by the browser after permission. Stopping or leaving the mode stops all video tracks and closes the landmarker. Frames remain in the browser and are not uploaded by TUKI. The MediaPipe WASM runtime and model are fetched from jsDelivr and Google when activated; MediaPipe documents usage/performance metrics sent to Google. This is an approximate flexion estimate, not semantic gesture recognition or physical control. HTTPS (or localhost during development) and browser camera permission are required.

All Studio inputs pass through `web/src/lib/motion-controller.ts`, which owns one `HandPose` and uses the priority order manual > gesture/voice > game > sequence > camera. An explicitly selected Studio mode can reactivate its source. The in-memory version-1 packet schema is `{ protocol: "TUKI-MOCK", version, sequence, timestampMs, pose: { thumb, index, middle, ring, pinky }, tracking: { state, valid } }`; tracking states are `idle`, `searching`, `tracking`, `lost`, and `stopped`. It simulates delay, receipt, invalid commands, out-of-order packets, packet loss, transport errors, and disconnection without network or hardware access. This simulator package is not the ESP32 UART protocol. Real webcam/phone operation remains untested.

## V2Y hinged-door mesh clearance review (historical backup, 2026-11-24)

The browser pivots use the supplied V2Y CAD hinge axes: the forearm door is at X=-48.5 mm, Z=15 mm; the electronics door is at X=-62 mm, Z=27 mm. Both axes run along CAD Y. These values match the `UPPER_HINGE_*` and `HINGE_*` definitions and the Y-directed hinge barrels in the supplied parametric source; no axis adjustment was justified.

The actual V2Y GLB meshes were swept in Interior from 0° to -108° and in Exploded from 0° to -95° at 0.25° increments. Triangle-surface intersection checks flagged contact along mating seams: the forearm door/collar seam at Y=-28 mm, the forearm door/transition-cover seam at Y=-145 mm, and the electronics-door/cabinet lower edge at Y=-244 mm (Z≈20 mm) when closed. The upper seam contact appears within 0° to -31.75° against the collar and 0° to -20.75° against the transition cover in Interior. In Exploded, the offset transition cover produces seam-contact flags over sampled poses from -8.75° to -95°.

To distinguish surface contact from penetration, the sweep also tested mesh vertices and triangle-centroid samples with a three-direction point-in-solid check. No sample was found more than 0.01 mm inside the opposing mesh; maximum sampled volumetric penetration was 0.000 mm. The 34-mesh sweep found no surface intersections between either door and the servo proxies, servo board, tendon guides, or the other door. The upper and lower door Y extents retain a 6 mm gap, which is unchanged by rotation about Y.

These are sampled checks of the rendered GLB, not an exact CAD B-rep collision proof, tolerance analysis, or physical clearance test. The zero-gap seam contacts remain visible in the mesh and may need manufacturing clearance in printed parts. No GLB, CAD, STL, servo layout, or USB-C geometry was changed for this review.

## Previous V2N model snapshot (historical)

The V2N GLB is retained as a backup and is not loaded by active pages. Current model paths and controls are described in the active-model update above.

TUKI V2N es un prototipo mecánico CAD con visualización 3D interactiva y control independiente simulado de cinco dedos. No se ha validado la mano física ni la tensión real de los tendones. La cámara es una dirección de desarrollo futura; no está implementada.

The current GLB keeps the V2N palm, fingers, diagonal five-SG90 rack, servo placeholders, and pulley meshes, and replaces the uncertain V2K forearm/case subsystem with six meshes from a new local parametric arm proposal. Its assembly groups are `FOREARM_V2N_ARM_V1`, `ForearmLeft`, `ForearmRight`, `WristCollar_PalmInterfacePending`, `ElectronicsBase`, `ServiceCover_USB_Pending`, and `ElectronicsCarrier`. The former meshes `ACOPLE_MUNECA`, `RIOSTRA_IZQUIERDA`, `RIOSTRA_DERECHA`, `CARCASA_ANTEBRAZO`, `TAPA_ANTEBRAZO`, `MARCO_CAJON`, `CAJON_USB_C`, and `GUIA_CINCO_TENDONES` are absent from the active GLB. The parametric source and manufacturing files for the separate forearm proposal remain local and are not included in this web-release staging. This records the mesh-generation path locally, not a legal guarantee of independence.

The former V2N-only previews and provenance notes belong to the earlier website snapshot. The active model and its browser captures are documented in `docs/TUKI_R1_WEB_ASSEMBLY.md`. Historical rights and source evidence remain in `docs/ASSET_LICENSES.md` and `docs/V2N_MANIFIESTO_PROCEDENCIA.md`.

## Rig and animation

The five logical controls remain `thumb`, `index`, `middle`, `ring`, and `pinky` in the application. `CadHand` maps them to `PULGAR`, `INDICE`, `MEDIO`, `ANULAR`, and `MENIQUE`. The V2N rig uses two thumb joints and three joints on each other finger: `FINGER_PULGAR_01/02`, `FINGER_INDICE_01/02/03`, `FINGER_MEDIO_01/02/03`, `FINGER_ANULAR_01/02/03`, and `FINGER_MENIQUE_01/02/03`.

Each value is normalized: 0 means open and 1 means closed. `web/src/lib/tuki-v2n-rig.ts` clamps values, stores each joint base quaternion and interpolates toward its corresponding `CLOSE_*` clip endpoint. The runtime does not play an `AnimationMixer` concurrently.

## Assembly view controls

- **Exterior:** shows the V4 R1 shell, cabinet, wrist and both doors closed.
- **Interior:** rotates both R1 hinge parents to reveal the plate and five nominal SG90 reference models.
- **Exploded:** opens the doors and applies display-only offsets to selected assembly parts.

The active door pivots and axes come from the supplied V4 R1 assembly GLB. These controls change only the browser scene; they do not alter CAD or establish physical opening clearance, assembly, palm fit, electronics clearance, USB-C access, cable routing, or calibrated motion. See `docs/TUKI_R1_WEB_ASSEMBLY.md` for the visual-only boundary.

## Previous V2N assets and change procedure (historical)

This section describes the prior V2N web-release snapshot and its preview images. Those files remain historical assets and are not used by the active site. Its provenance assessment is retained for context; the current model path and its separate source review are recorded at the top of this document and in `docs/TUKI_R1_WEB_ASSEMBLY.md`. The older Shapekit-derived GLB and render remain excluded from the active website; historical attribution remains in `docs/ASSET_LICENSES.md`.

The V2N/A1 arm v1 CAD assembly described in the previous website snapshot is not part of the active V4 R1 model. The current visual assembly is documented at the top of this file.

Before changing the GLB, preserve the named joints, five clips, and root scale; verify independent manual articulation and clips with `node scripts/check-tuki-model.mjs`. Keep print beds separate from assembled transforms. Do not claim print success, physical fit, servo calibration, tendon tension, or hardware capability without measurements or physical testing.
