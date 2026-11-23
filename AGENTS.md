# TUKI repository instructions

Before any code, product, or design change, read `docs/PROJECT_SPEC.md` and `docs/ARCHITECTURE.md`. For visual work also read `docs/DESIGN_SYSTEM.md`; for CAD/digital-twin work read `docs/CAD_ASSEMBLY.md` and `docs/DIGITAL_TWIN.md`; for hardware print changes read `hardware/README.md` and `hardware/PRINTING_CHECKLIST.md`.

## Mandatory repository boundaries

- Website changes, source, tests, and web assets belong under `web/`. `web/` is the independently installable Vercel Root Directory.
- Printable mechanical parts belong under `hardware/printables/{hand,forearm,electronics-drawer}/`.
- Editable CAD and its parametric source belong under `hardware/cad/editable/`. Non-current reference iterations must stay outside active print/CAD folders and be labelled as archived.
- Future NXP controller firmware belongs under `firmware/nxp/`; it is documentation only until explicitly requested.
- Camera-based interaction is the intended future input direction. Camera capture and vision interpretation are not implemented; the current browser simulation must work independently. Do not add hardware control or firmware unless explicitly requested.
- Do not redesign TUKI, rebuild the website, or implement firmware as part of a targeted CAD cleanup.

## Source of truth and behavior

- `docs/PROJECT_SPEC.md` is the product behavior source of truth. The supplied current CAD and `hardware/README.md` define the physical print manifest.
- `web/public/models/tuki-v2n.glb` is the sole authoritative model loaded by the website. Homepage and Studio must share it through `TukiDigitalTwin`; never add a second page-specific hand model or reintroduce a procedural hand.
- Vercel project Root Directory is `web`; the standalone app needs no environment variables, database, or physical hardware.
- Check `docs/ASSET_LICENSES.md` before staging or releasing models, print files, renders, or editable CAD. For V2N, record the owner's provenance statement and release direction separately from technical evidence and third-party permissions. Do not treat missing historical source files alone as a release blocker; hold assets only for a concrete unresolved rights concern. Do not publish historical Shapekit-derived assets until their CC BY-NC 4.0 use is cleared.
- Preserve its five logical actuators (`thumb`, `index`, `middle`, `ring`, `pinky`), five `CLOSE_*` animation clips, and existing motion API. Use only the V2N manual pose rig at runtime; keep enclosure-view state separate from normalized finger pose.
- Treat STL beds as manufacturing layouts, not assembled transforms. Do not compose old reference GLBs or V1–V5 versions into the active model. Do not change geometry or transforms without documenting the source and validation.
- Do not claim physical fit, print success, calibrated servo motion, electronics clearance, or hardware capability unless measured or physically tested. V2N physical assembly and drawer fit remain unvalidated.

## Development rules

- Keep controls, normalized pose, simulator adapter, and 3D rendering separated. No hardware adapter implementation until requested.
- Keep keyboard access, visible focus, reduced-motion support, and non-WebGL fallback.
- Never add duplicate controls or a second implementation of existing feature logic.
- When changing CAD, update the print manifest, checklist, CAD assembly, digital-twin notes, and changelog together. Preserve supplied source geometry.
- When changing the model or renderer, check node names and all five clips and verify independent articulation. Update the model check and documentation together.
- After changes, run from `web/`: `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build`. Report exactly which commands were run and their outcomes.
- Before a Vercel release, verify the Root Directory, all three routes, required public assets, and HTTPS-dependent browser features; report any checks that could not run.
- Keep `CHANGELOG.md` current. Never let documentation say a capability is implemented if it is not.
