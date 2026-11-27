# TUKI Project Specification

## Identity and current status

**Current web-model update (2026-11-26):** Home and Studio share `web/public/models/tuki-v2n-v4-r1.glb`, an owner-supplied visual assembly combining the V2N hand geometry, V4 R1 STEP assembly and five nominal SG90 references. Technology uses a preview captured from this same GLB. The model retains 14 finger joints, five `CLOSE_*` clips and the existing normalized `HandPose` API. It is a visual assembly, not manufacturing data or proof of physical fit. The earlier procedural `tuki-web-visual.glb` and prior V2Y/V2N models remain inactive backups. See `docs/TUKI_R1_WEB_ASSEMBLY.md`, `docs/DIGITAL_TWIN.md`, and `docs/ASSET_LICENSES.md`.

TUKI means Tendon-Driven Universal Kinetic Interface. It is a five-finger robotic-hand engineering project with an independently usable browser simulator and a developing mechanical prototype.

La web utiliza un ensamblaje visual V2N + V4 R1 y control independiente simulado de cinco dedos. Studio ofrece seguimiento opcional de flexión mediante la cámara del navegador; no controla servos. No se han validado el ajuste físico, los tendones ni las posiciones nominales de los SG90.

The preceding V2N release provenance paragraph is historical. Current asset provenance and limitations are summarized in the update above and in `docs/ASSET_LICENSES.md`.

## Implemented in the website

- The Next.js app is isolated in `web/`; Vercel Root Directory is `web`.
- Home and Studio share one 3D model through `TukiDigitalTwin` → `HandScene` → `CadHand` → `TukiV2NV4R1Hand`. Technology uses a still captured from this same model.
- Five normalized finger controls, gesture presets, number poses, Simon Says, Rock Paper Scissors, browser speech recognition where supported, browser-local motion capture/playback, and opt-in MediaPipe camera tracking are implemented as simulation features.
- Camera Tracking uses 21 hand landmarks to estimate five independent finger-flexion values. Inference runs in a Web Worker; camera frames are not uploaded by TUKI. The MediaPipe runtime/model are fetched from Google and jsDelivr, and MediaPipe documents usage/performance metrics sent to Google. Camera access requires HTTPS or localhost and explicit browser permission.
- `HandMotionController` is the single Studio pose owner for camera, manual controls, gestures, voice, games, and sequence playback. Priority is manual > gesture/voice > game > sequence > camera; an explicitly selected Studio mode may activate its source again. Lower-priority updates are rejected while a higher-priority source owns the pose.
- Camera flexion passes through independently configurable per-finger One Euro filters, dead zones, and normalized-units-per-second rate limits. Invalid, stale (>250 ms), and out-of-order samples are rejected; tracking loss is reported after the 650 ms grace interval, and recovery re-seeds filters from the held pose.
- Optional open/closed hand captures calibrate only the camera-to-normalized-simulation mapping. They do not measure human joint angles, convert to SG90 degrees, or calibrate the physical mechanism.
- Every accepted source update can be recorded by the in-memory `TUKI-MOCK` version-1 command adapter. Packets include a sequence, monotonic timestamp, five normalized values, and tracking state/validity. The adapter simulates latency, packet loss, errors, and disconnects without opening a network, serial, or hardware connection.
- Studio diagnostics show detected, calibrated, filtered and controller values separately; thumb angles/opposition/segment lengths; per-finger calibration span; filter settings; tracking state; FPS; approximate latency; MOCK packet events; and no-hardware status. The user may locally export labeled numeric landmarks and pipeline values for open, partial and closed poses; the file contains no image or video and is not uploaded.
- The model keeps five logical actuators (`thumb`, `index`, `middle`, `ring`, `pinky`), 14 V2N finger joints, and its five `CLOSE_*` clips. Runtime interpolates the supplied clip endpoint quaternions from the normalized pose; it does not play an `AnimationMixer` concurrently.
- Exterior, Interior, and Exploded are viewer modes. Interior rotates the two R1 door pivot nodes; Exploded applies visual-only offsets. Neither mode proves physical hinge clearance, palm fit, hardware fit, or electronics clearance.
- The site works without connected hardware, camera access, a database, or environment variables.

## Planned or not validated

Camera capture and MediaPipe inference have not been validated with a physical webcam or phone in this environment. Camera flexion remains an approximate joint-angle heuristic. The open/closed calibration only rescales this estimate for the visual simulation. Semantic gesture classification from camera, physical servo actuation, calibrated tendon mapping, and website-to-hardware communication are not implemented; the MOCK adapter is not a UART implementation. Tactile sensing, validated grasping, and physical movement limits are also unverified. Voice recognition depends on browser support, microphone permission, and browser speech services; production use requires HTTPS. Physical firmware is not part of this website release.

## Physical design boundaries

The active web twin shows the V2N hand with the supplied V4 R1 visual assembly. Manufacturing files are separate from the website; the web GLB is not a source for fabrication. Physical fit between the hand, wrist, enclosure, nominal servo models, tendon paths, and electronics is not established by the visual scene. Follow the hardware notes for manufacturing records and their validation status.

## Repository boundaries

- `web/`: website source, tests, and public deployment assets.
- Manufacturing CAD and print assets are outside the website deployment and require a separate review before redistribution.
- Physical firmware is not required by the site and is not connected to the browser simulation.
- `docs/`: project requirements, architecture, twin, provenance, and release checks.

## Deployment

Use the Next.js preset on Vercel with Root Directory `web`. The app uses its existing npm scripts and requires no environment variables. Follow `README.md` and `docs/V2N_VERIFICACION_DESPLIEGUE.md`; do not publish until the asset provenance and licensing review is complete.
