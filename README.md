# TUKI

TUKI (Tendon-Driven Universal Kinetic Interface) is a five-finger robotic-hand project with an interactive browser simulation and a developing mechanical prototype. The active V2N GLB preserves the hand and five-SG90 rack with its current forearm visualization. The historic V2N generator and exact V2K forearm input were not recovered; the old V2K-related enclosure meshes have been removed from the active model. Manufacturing CAD and print files for the separate forearm proposal are not part of this web release.

TUKI V2N es un prototipo mecánico CAD con visualización 3D interactiva y control independiente simulado de cinco dedos. No se ha validado la mano física ni la tensión real de los tendones. La cámara es una dirección de desarrollo futura; no está implementada.

## Repository areas

- `web/` — standalone Next.js app, tests, and public website assets.
- `hardware/printables/` — local manufacturing files, organized by hand, forearm, and electronics drawer.
- `hardware/cad/editable/` — editable CAD and parametric sources.
- `firmware/nxp/` — future controller documentation only.
- `docs/` — project requirements, architecture, CAD notes, digital twin, and asset provenance.

## Run locally

Requirements: Node.js 20.19+ or 22.12+ and npm (the test toolchain uses Vite 8).

```powershell
cd web
npm ci
npm run dev
```

Open `http://localhost:3000`. The site works without a database, environment variables, camera, or connected hardware.

## Deploy to Vercel

Import the repository as a Next.js project and set **Root Directory** to `web`. Use the repository's npm scripts and lockfile; no environment variables or external services are required. Production is served over HTTPS. Browser speech recognition varies by browser and requires microphone permission; camera capture and vision recognition are not implemented.

The project owner states that V2N was developed by the project team from scratch with AI-assisted parametric CAD and directs preparation of the active GLB and previews for public release. The V2K-related enclosure meshes were replaced by new parametric geometry. The targeted review found no concrete Shapekit mesh/resource in the current GLB or previews; this is not an absolute independence certification. Review [asset licenses and provenance](docs/ASSET_LICENSES.md) and the [per-file V2N manifest](docs/V2N_MANIFIESTO_PROCEDENCIA.md). Earlier Shapekit-derived prototypes have a separate CC BY-NC 4.0 history; those historical assets are not loaded by the active website.

## Website functionality

Home and Studio use the same `web/public/models/tuki-v2n.glb` through the shared digital-twin component. Studio includes five normalized finger controls, gesture presets, number poses, Simon Says, Rock Paper Scissors, browser voice commands where supported, and local motion recording, playback, import, and export. Finger motion is simulated; no physical device is connected.

## Hardware status

V2N depicts a five-finger hand and diagonal rack for five SG90 servos with a preliminary forearm, wrist collar, electronics base, and service cover. The palm pattern and USB-C cut-out are pending measurement; no fit is claimed. The physical assembly, printing, servo mounting, tendon tension, and electronics clearances have not been validated. See the [hardware notes](hardware/README.md), [printing checklist](hardware/PRINTING_CHECKLIST.md), and [CAD assembly notes](docs/CAD_ASSEMBLY.md). Manufacturing CAD and print outputs are kept outside the web-release staging set.

## Verification

From `web/`, run `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build`. Run `node scripts/check-tuki-model.mjs` for the local GLB integrity check. The supplied migration package includes an additional strict release checker; these automated checks do not replace browser QA, physical validation, or licensing review.

Start with [AGENTS.md](AGENTS.md), the [project specification](docs/PROJECT_SPEC.md), [architecture](docs/ARCHITECTURE.md), and [digital-twin notes](docs/DIGITAL_TWIN.md).
