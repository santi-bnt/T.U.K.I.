# Architecture

## Monorepo boundaries

**Active web model update (2026-11-26):** Home and Studio load `/models/tuki-v2n-v4-r1.glb` through the shared `TukiV2NV4R1Hand`. Technology uses a still captured from this same GLB. It combines the owner-supplied V2N hand, V4 R1 STEP geometry and five nominal SG90 references. Earlier V2Y/V2N GLBs remain inactive backups; a prior procedural prototype is not used by active pages and is not part of this deployment. The active model is visual-only and does not establish physical fit or collision-free movement.

The independently installable Next.js application and its runtime assets are in `web/`. Vercel Root Directory is `web`. Manufacturing CAD and firmware are outside this website deployment. Browser camera tracking is opt-in and only changes the digital-twin simulation; it is not a hardware input path.

## Application flow

Controls, gesture presets, number poses, games, voice commands, motion playback, and Camera Tracking produce normalized `HandPose` values in `web/src/lib/motion.ts`. Studio passes that state through `TukiDigitalTwin` to `HandScene`, then `CadHand` adapts the English finger keys to the Spanish rig keys consumed by `TukiV2NV4R1Hand`. Simon Says and Rock Paper Scissors keep their game rules in their corresponding `web/src/lib/` modules.

`TukiV2NV4R1Hand` clones the cached GLTF scene for independent rendering. The manual rig interpolates each named joint from its neutral quaternion to the endpoint in its `CLOSE_*` clip. It does not run an `AnimationMixer` concurrently. Enclosure view state remains separate from normalized finger pose. This website has no physical hardware adapter. Model nodes and validation are in `docs/TUKI_R1_WEB_ASSEMBLY.md`.

`web/src/lib/i18n.ts` contains the website's English and Spanish copy. Motion sequences use versioned JSON stored in the current browser profile. Speech input uses browser SpeechRecognition when available.

In Studio, `CameraTracking` requests `getUserMedia` only after the user presses Start. It offers enumerated cameras after permission, draws the 21 landmarks on the local preview, and transfers downsized `ImageBitmap` frames to `web/src/workers/hand-tracking.worker.ts`. The worker runs MediaPipe Hand Landmarker and returns landmarks only. `web/src/lib/hand-tracking.ts` estimates five raw flexion values and applies independently configurable per-finger One Euro filtering, dead zones and normalized speed limits, optional two-point hand calibration, timestamp validation, stale-frame rejection, and loss/recovery handling.

All Studio sources submit through `web/src/lib/motion-controller.ts`. The controller owns one `HandPose` and enforces a fixed source priority: manual > gesture/voice > game > sequence > camera. A mode change explicitly activates its source; a higher-priority source can preempt a lower one, and a camera stream that loses ownership stops itself. Accepted poses update the existing simulation adapter and emit a version-1 `TUKI-MOCK` packet. `MockCommunicationAdapter` simulates delay, receive acknowledgement, validation failures, packet loss, transport errors, and disconnection entirely in memory. Its normalized packet is a simulator contract, not the physical ESP32 UART protocol; no real connection is opened.

Camera Tracking diagnostics subscribe to the same controller snapshot, showing original and filtered values, settings, speed cap, tracking state, FPS, approximate inference and mock-link latency, and recent packet events. Switching tabs or pressing Stop releases the camera stream and closes the model. Camera frames are not sent to TUKI's server; model/WASM assets are fetched from Google and jsDelivr, and MediaPipe documents that it sends usage/performance metrics to Google. `getUserMedia` requires explicit permission and a secure context (HTTPS or localhost). Real camera-device execution remains unverified until tested on an actual webcam or phone.

## Previous V2N model snapshot (historical)

TUKI V2N es un prototipo mecánico CAD con visualización 3D interactiva y control independiente simulado de cinco dedos. No se ha validado la mano física ni la tensión real de los tendones. La cámara es una dirección de desarrollo futura; no está implementada.

The backup `web/public/models/tuki-v2n.glb` is not loaded by the active site. Its previous enclosure description and provenance notes are retained here as historical context; the active web visual reinterpretation is documented above and in `docs/TUKI_WEB_VISUAL_MODEL.md`.

Finger values range from 0 (open) to 1 (closed). `web/src/lib/tuki-v2n-rig.ts` clamps inputs and applies manual rotations using each joint's captured base quaternion. The GLB has a 0.001 root transform to convert CAD millimetres to glTF metres. Do not alter that transform or joint definitions without documenting and validating the model change.

The Exterior, Interior, and Exploded controls change only the displayed assembly nodes and visual offsets. They do not assert a measured palm interface, USB-C opening, electronics fit, or physical validation of the assembly/tendon mechanism. CAMA_00/CAMA_01 and the printed hand remain unmodified.

## Assets and verification

The active GLB and its immediate inputs are documented in `docs/TUKI_R1_WEB_ASSEMBLY.md`; the targeted asset review and historical attribution are in `docs/ASSET_LICENSES.md`. No external resource URI or identifiable third-party mesh dependency was found in the assembled GLB and reviewed generation record. That finding is not a legal certification or proof of physical fit. Manufacturing assets are outside this website deployment.

Run `node scripts/check-tuki-model.mjs` from `web/` to check embedded resources, V4 R1 scene nodes, scale, all 14 finger joints, five clips, and SG90 groups. Run the four npm checks from `web/`. These checks do not replace browser QA, physical validation, or licensing review.
