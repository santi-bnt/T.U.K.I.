# TUKI

TUKI (Tendon-Driven Universal Kinetic Interface) is a five-finger robotic-hand project with an interactive browser simulation and a developing mechanical prototype. The active web twin combines the V2N articulated hand, the supplied V4 R1 assembly, and five nominal SG90 references. It is a visual model, not proof of physical fit, servo mounting, tendon routing, or electronics clearance. Earlier V2Y/V2N GLBs remain inactive backups; the prior procedural prototype is not used by active pages.

La web muestra el ensamblaje visual V2N + V4 R1 con control independiente simulado de cinco dedos. Studio incluye seguimiento opcional de la flexión mediante la cámara del navegador; no controla servos. No se han validado el ajuste físico, los tendones ni las posiciones nominales de los SG90.

## Repository areas

- `web/` — standalone Next.js app, tests, and public website assets.
- `hardware/` — manufacturing notes; CAD and print artifacts are maintained separately from this web release.
- `firmware/nxp/` — future controller documentation. This website does not connect to firmware or physical hardware.
- `docs/` — project requirements, architecture, CAD notes, digital twin, and asset provenance.

## Run locally

Requirements: Node.js 20.19+ or 22.12+ and npm (the test toolchain uses Vite 8).

```powershell
cd web
npm ci
npm run dev
```

Open `http://localhost:3000`. The site works without a database, environment variables, or connected hardware. Camera permission is requested only when Camera Tracking is started in Studio; localhost is treated as a secure context.

## Deploy to Vercel

Import the repository as a Next.js project and set **Root Directory** to `web`. Use the repository's npm scripts and lockfile; no environment variables or backend services are required. Production is served over HTTPS. Browser speech recognition varies by browser and requires microphone permission. Camera Tracking requires camera permission and an internet connection to fetch the MediaPipe model and WebAssembly runtime; video frames stay in the browser, while MediaPipe documents sending usage/performance metrics to Google.

The project owner states that V2N was developed by the project team from scratch with AI-assisted parametric CAD and directs preparation of the active GLB and previews for public release. The V2K-related enclosure meshes were replaced by new parametric geometry. The targeted review found no concrete Shapekit mesh/resource in the current GLB or previews; this is not an absolute independence certification. Review [asset licenses and provenance](docs/ASSET_LICENSES.md) and the [per-file V2N manifest](docs/V2N_MANIFIESTO_PROCEDENCIA.md). Earlier Shapekit-derived prototypes have a separate CC BY-NC 4.0 history; those historical assets are not loaded by the active website.

## Website functionality

Home and Studio use the shared visual assembly `web/public/models/tuki-v2n-v4-r1.glb` through `TukiDigitalTwin`; Technology uses a still from that same model. It combines the V2N hand, V4 R1 STEP assembly and five nominal SG90 references. It is a web visual, not fabrication geometry or proof of fit. The earlier procedural `tuki-web-visual.glb` remains an inactive backup. Studio retains five normalized controls, gesture presets, number poses, Simon Says, Rock Paper Scissors, browser voice where supported, motion recording/playback, and optional MediaPipe camera tracking. Camera input updates the existing `HandPose` simulation only. The V2N rig interpolates the five preserved `CLOSE_*` clip endpoints without running an `AnimationMixer` concurrently. Details and limits: [`docs/TUKI_R1_WEB_ASSEMBLY.md`](docs/TUKI_R1_WEB_ASSEMBLY.md).

To use it, open Studio, choose **Camera tracking**, then press **Start tracking** and grant camera permission. Camera choices appear after permission. The diagnostics show each raw estimate and filtered value; choose a finger to adjust its independent One Euro settings, dead zone, and normalized speed cap. Optional **Capture open/closed** samples only rescale simulation input. Use the MOCK controls to inject latency, packet loss, transport errors, or a disconnected controller, then press **Stop camera** to release the stream. Source priority is manual > gesture/voice > game > sequence > camera; selecting a Studio mode explicitly activates it again. No serial, network, ESP32, or servo connection is made.

## Hardware status

The V4 R1 assembly shown on the website is a web visualization. Its nominal servo references, hand-to-wrist interface, clearances, tendon paths, printability, and physical operation have not been validated by assembling the parts. See the [hardware notes](hardware/README.md), [printing checklist](hardware/PRINTING_CHECKLIST.md), and [CAD assembly notes](docs/CAD_ASSEMBLY.md). Manufacturing CAD and print outputs are kept separate from the web model.

## Hardware boundary

Camera Tracking, controls, and games operate only in the browser simulation. The website does not send commands to an ESP32, NXP board, or servos.

## Verification

From `web/`, run `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build`. Run `node scripts/check-tuki-model.mjs` for the local GLB integrity check. The supplied migration package includes an additional strict release checker; these automated checks do not replace browser QA, physical validation, or licensing review.

Start with [AGENTS.md](AGENTS.md), the [project specification](docs/PROJECT_SPEC.md), [architecture](docs/ARCHITECTURE.md), and [digital-twin notes](docs/DIGITAL_TWIN.md).
