# V2N release verification

This checklist records release gates for the V2N web migration. A passing static checker does not establish legal permission, browser behavior, physical fit, or safe hardware operation.

## Historical CAD audit (2026-11-23)

This section records the state of the supplied CAD packages at that audit date; it is not the current assessment of the active web assets. The GLB matched supplied V2N STL output triangles and embedded its buffer. Historic V2N/V2K source gaps and the A1 Mini physical-fit questions remain traceability/physical-validation limits. The current targeted release review and owner statement below supersede the earlier image-origin and rights status.

## Current release assessment (2026-11-23)

**Technical status: READY WITH HISTORICAL SOURCE-TRACEABILITY RESERVATION.** The active GLB replaces the old V2K forearm/case meshes with new parametric arm geometry; missing historic generators are not needed by the web build and are not treated as a release blocker. **Owner statement: RECORDED.** On 2026-11-23, the owner stated that V2N was developed from scratch by the project team using parametric CAD with AI assistance and directed release preparation. This is an owner declaration, not third-party authorization or independent proof of every design decision. A targeted review found no concrete third-party mesh/resource in the three current web assets. **QA status: PASSED FOR RELEASE SCOPE.** Home, Studio, Technology, desktop/mobile layouts, model request, five independent manual poses, gesture/number controls, Simon Says, Rock Paper Scissors, motion capture/playback, and enclosure modes were checked; voice was not invoked with microphone permission/browser speech services.

## Asset and provenance gates

- [x] Record the project owner's authorship/provenance statement and direction to prepare V2N assets for public release.
- [x] Review the active GLB and two current preview images for concrete third-party resources; none were identified. This does not certify absolute independence.
- [x] Keep historical Shapekit-derived GLBs and renders out of `web/public/`; only current V2N assets are staged.
- [x] Review all active files under `web/public/`; remember that these files are downloadable after deployment.
- [x] Keep hardware STL/STEP manufacturing files out of the web-release staging set.

## Model and application checks

- [x] Run the supplied `scripts/check_tuki_v2n_release.py --repo <repo> --strict` from the migration package directory (passed in the previous audit; the script is not a legal review).
- [x] From `web/`, run `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` (all passed on 2026-11-23).
- [x] Run `node scripts/check-tuki-model.mjs` to verify embedded resources, replacement nodes, scale, five independent manual poses, and five clips.
- [x] In a browser, inspect Home, Studio, and Technology at desktop and mobile sizes.
- [x] Exercise five independent finger controls, gesture presets, Simon Says, Rock Paper Scissors, motion capture, and Exterior/Interior/Exploded modes.
- [x] Inspect voice compatibility handling. This browser exposes `SpeechRecognition` and reports a secure context on localhost; microphone permission and speech recognition were not invoked or tested. Production uses HTTPS.
- [x] Confirm the interface does not claim camera capture, vision gesture recognition, physical actuation, or hardware connectivity is implemented.
- [x] Check the three routes, navigation, and required public asset requests in the local browser; no missing assets or broken in-app navigation were observed.

## Deployment

Use Next.js with Vercel Root Directory `web`; no environment variables or external service are required. The owner directed preparation of the three web assets. Their current inclusion in staging is recorded by the final Git status, not presumed by this document. No commit, push, or deployment has been performed. The historic source gaps remain documented but are not blockers for this web release.

TUKI V2N es un prototipo mecánico CAD con visualización 3D interactiva y control independiente simulado de cinco dedos. No se ha validado la mano física ni la tensión real de los tendones. La cámara es una dirección de desarrollo futura; no está implementada.
