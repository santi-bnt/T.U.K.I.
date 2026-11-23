# TUKI Project Specification

## Identity and current status

TUKI means Tendon-Driven Universal Kinetic Interface. It is a five-finger robotic-hand engineering project with an independently usable browser simulator and a developing mechanical prototype.

TUKI V2N es un prototipo mecánico CAD con visualización 3D interactiva y control independiente simulado de cinco dedos. No se ha validado la mano física ni la tensión real de los tendones. La cámara es una dirección de desarrollo futura; no está implementada.

The local active web model is `web/public/models/tuki-v2n.glb`. It keeps the V2N hand/rack/servo/pulley geometry and replaces the historically V2K-reused forearm/case meshes with a source-traceable parametric arm. The owner states that V2N was developed by the project team from scratch with parametric CAD and AI assistance, and has directed public-release preparation. The historic generators remain unavailable, so the complete design history is not independently reconstructible; this is a traceability limit, not a release blocker by itself. The targeted review found no concrete Shapekit mesh/resource incorporated in the active GLB or its two current previews. The site does not load historical Shapekit-derived assets. See `docs/ASSET_LICENSES.md` and `docs/V2N_MANIFIESTO_PROCEDENCIA.md` for evidence and limits.

## Implemented in the website

- The Next.js app is isolated in `web/`; Vercel Root Directory is `web`.
- Home and Studio share one 3D model through `TukiDigitalTwin` → `HandScene` → `CadHand` → `TukiV2NHand`.
- Five normalized finger controls, gesture presets, number poses, Simon Says, Rock Paper Scissors, browser speech recognition where supported, and browser-local motion capture/playback are implemented as simulation features.
- The model keeps five logical actuators (`thumb`, `index`, `middle`, `ring`, `pinky`), its five `CLOSE_*` glTF clips, and the named V2N finger joints. Runtime pose control uses the V2N rig's manual rotations; the glTF clips are preserved but are not played at the same time.
- Exterior, Interior, and Exploded are viewer presentation modes only. They do not change the source CAD or establish a measured palm interface, hardware fit, or electronics clearance.
- The site works without connected hardware, camera access, a database, or environment variables.

## Planned or not validated

Camera capture and gesture interpretation, physical servo actuation, calibrated tendon mapping, firmware communication, tactile sensing, validated grasping, and physical movement limits are not implemented by the website. Voice recognition depends on browser support, microphone permission, and browser speech services; production use requires HTTPS.

## Physical design boundaries

V2N represents a five-finger hand, a diagonal rack for five SG90 servos, and the new V2N/A1 arm v1 visual proposal. The arm has an unperforated palm interface and a USB panel whose cut-out remains disabled pending measurements; it does not modify printed hand parts or CAMA_00/CAMA_01. Assembly, print success, physical fit, servo mounting, electronics clearance, tendon tension, and motion under load have not been validated. See `hardware/README.md`, `hardware/PRINTING_CHECKLIST.md`, and `docs/CAD_ASSEMBLY.md` for the separate local manufacturing records.

## Repository boundaries

- `web/`: website source, tests, and public deployment assets.
- `hardware/printables/`: reviewed local manufacturing files; do not add them to website assets.
- `hardware/cad/editable/`: editable CAD and parametric sources; redistribution must be reviewed separately.
- `firmware/nxp/`: future controller documentation only in this phase.
- `docs/`: project requirements, architecture, twin, provenance, and release checks.

## Deployment

Use the Next.js preset on Vercel with Root Directory `web`. The app uses its existing npm scripts and requires no environment variables. Follow `README.md` and `docs/V2N_VERIFICACION_DESPLIEGUE.md`; do not publish until the asset provenance and licensing review is complete.
