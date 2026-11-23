# TUKI digital twin

## Active model and source of truth

The website loads only `web/public/models/tuki-v2n.glb`. Home and Studio share the same model through `TukiDigitalTwin` → `HandScene` → `CadHand` → `TukiV2NHand`. Do not add a page-specific model or recreate the hand procedurally.

TUKI V2N es un prototipo mecánico CAD con visualización 3D interactiva y control independiente simulado de cinco dedos. No se ha validado la mano física ni la tensión real de los tendones. La cámara es una dirección de desarrollo futura; no está implementada.

The current GLB keeps the V2N palm, fingers, diagonal five-SG90 rack, servo placeholders, and pulley meshes, and replaces the uncertain V2K forearm/case subsystem with six meshes from a new local parametric arm proposal. Its assembly groups are `FOREARM_V2N_ARM_V1`, `ForearmLeft`, `ForearmRight`, `WristCollar_PalmInterfacePending`, `ElectronicsBase`, `ServiceCover_USB_Pending`, and `ElectronicsCarrier`. The former meshes `ACOPLE_MUNECA`, `RIOSTRA_IZQUIERDA`, `RIOSTRA_DERECHA`, `CARCASA_ANTEBRAZO`, `TAPA_ANTEBRAZO`, `MARCO_CAJON`, `CAJON_USB_C`, and `GUIA_CINCO_TENDONES` are absent from the active GLB. The parametric source and manufacturing files for the separate forearm proposal remain local and are not included in this web-release staging. This records the mesh-generation path locally, not a legal guarantee of independence.

The legacy active GLB and its prior preview images were kept as local-only backups before replacement; they are excluded from the release. The current exterior/interior previews were captured from the running site with the new GLB loaded. The current GLB retains its 0.001 root scale to convert CAD millimetres to glTF metres. The old V2K CAD generator input is still missing; exact facet comparison found no matching facets against the local Shapekit reference meshes, but this heuristic cannot rule out design derivation. See `docs/ASSET_LICENSES.md` and `docs/V2N_MANIFIESTO_PROCEDENCIA.md`.

## Rig and animation

The five logical controls remain `thumb`, `index`, `middle`, `ring`, and `pinky` in the application. `CadHand` maps them to `PULGAR`, `INDICE`, `MEDIO`, `ANULAR`, and `MENIQUE`. The V2N rig uses two thumb joints and three joints on each other finger: `FINGER_PULGAR_01/02`, `FINGER_INDICE_01/02/03`, `FINGER_MEDIO_01/02/03`, `FINGER_ANULAR_01/02/03`, and `FINGER_MENIQUE_01/02/03`.

Each value is normalized: 0 means open and 1 means closed. `web/src/lib/tuki-v2n-rig.ts` clamps values, stores each joint's original quaternion, and applies closure rotations. The GLB also preserves the clips `CLOSE_PULGAR`, `CLOSE_INDICE`, `CLOSE_MEDIO`, `CLOSE_ANULAR`, and `CLOSE_MENIQUE`; runtime uses manual pose control and does not apply those clips at the same time.

## Assembly view controls

- **Exterior:** shows the two arm halves, wrist collar, service cover, and electronics base; the internal servo reference geometry and carrier are hidden.
- **Interior:** hides the arm shell, collar, and cover to show the V2N servo rack, SG90 placeholders, and the new electronics carrier.
- **Exploded:** shows the assembly groups with presentation offsets on the arm halves, collar, service cover, and base.

These are viewer-only visibility and transform changes. They do not alter the source CAD or establish physical assembly, palm interface fit, electronics clearance, USB-C access, cable routing, or motion. The collar's palm pattern is intentionally pending measurement. The USB-C cut-out is disabled until the actual board port is measured. Existing CAMA_00/CAMA_01 and printed hand parts were not modified.

## Assets and change procedure

The local site uses `web/public/images/tuki-v2n-exterior.png` and `web/public/images/tuki-v2n-interior.png` for static views; both were recaptured from the running viewer using the current GLB. The owner declares the V2N model project-developed with AI-assisted parametric CAD and has directed public-release preparation. The targeted review found no concrete third-party mesh/resource in the current GLB or these images; they are prepared for staging. This is not independent proof of every design decision or third-party authorization. Missing historical V2N/V2K source files limit traceability but do not alone establish infringement. The older Shapekit-derived GLB and render are not loaded or served from `web/public/`; historical attribution remains in `docs/ASSET_LICENSES.md`.

The new V2N/A1 arm v1 CAD assembly is a provisional engineering output under `hardware/cad/editable/tuki_v2n_arm_v1/`; its meshes now appear in the active website GLB. It does not modify the already printed hand parts or CAMA_00/CAMA_01. The palm interface, electronics placement, USB-C opening, and physical fit remain unvalidated; the CAD display is a visual assembly proposal only.

Before changing the GLB, preserve the named joints, five clips, and root scale; verify independent manual articulation and clips with `node scripts/check-tuki-model.mjs`. Keep print beds separate from assembled transforms. Do not claim print success, physical fit, servo calibration, tendon tension, or hardware capability without measurements or physical testing.
