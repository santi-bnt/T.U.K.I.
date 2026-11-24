# TUKI digital twin

**Active model update (2026-11-24):** `web/public/models/tuki-v2y-visual.glb` is the model loaded by Home and Studio through `TukiDigitalTwin` -> `HandScene` -> `CadHand` -> `TukiV2YHand`. The earlier `tuki-v2y.glb` and V2N GLB remain as inactive backups. V2Y includes the same five independently controlled V2N finger chains and five `CLOSE_*` clips; controls still use manual rotations. The Exterior/Interior/Exploded modes operate V2Y enclosure nodes. Its cabinet, USB-C passage, board and SG90 meshes are visual proposals, not evidence of physical fit or working hardware. The older V2N-specific notes below are retained as historical release documentation.

**V2Y visual presentation update (2026-11-24):** The active viewer now loads `web/public/models/tuki-v2y-visual.glb`. It preserves the V2Y shell, doors, wrist, board, guides, finger meshes, rig and five animation clips; the nominal SG90 and pulley presentation gains visual faceplates, labels, fasteners and hubs. This is a presentation-only model variant and does not change printable geometry or establish real SG90 fit. In Studio, Interior and Exploded trigger a brief three-quarter camera move; OrbitControls remain available after the transition. The previous `tuki-v2y.glb` remains in `web/public/models/` as a local project backup and is no longer the active model.

## V2Y hinged-door mesh clearance review (2026-11-24)

The browser pivots use the supplied V2Y CAD hinge axes: the forearm door is at X=-48.5 mm, Z=15 mm; the electronics door is at X=-62 mm, Z=27 mm. Both axes run along CAD Y. These values match the `UPPER_HINGE_*` and `HINGE_*` definitions and the Y-directed hinge barrels in the supplied parametric source; no axis adjustment was justified.

The actual V2Y GLB meshes were swept in Interior from 0° to -108° and in Exploded from 0° to -95° at 0.25° increments. Triangle-surface intersection checks flagged contact along mating seams: the forearm door/collar seam at Y=-28 mm, the forearm door/transition-cover seam at Y=-145 mm, and the electronics-door/cabinet lower edge at Y=-244 mm (Z≈20 mm) when closed. The upper seam contact appears within 0° to -31.75° against the collar and 0° to -20.75° against the transition cover in Interior. In Exploded, the offset transition cover produces seam-contact flags over sampled poses from -8.75° to -95°.

To distinguish surface contact from penetration, the sweep also tested mesh vertices and triangle-centroid samples with a three-direction point-in-solid check. No sample was found more than 0.01 mm inside the opposing mesh; maximum sampled volumetric penetration was 0.000 mm. The 34-mesh sweep found no surface intersections between either door and the servo proxies, servo board, tendon guides, or the other door. The upper and lower door Y extents retain a 6 mm gap, which is unchanged by rotation about Y.

These are sampled checks of the rendered GLB, not an exact CAD B-rep collision proof, tolerance analysis, or physical clearance test. The zero-gap seam contacts remain visible in the mesh and may need manufacturing clearance in printed parts. No GLB, CAD, STL, servo layout, or USB-C geometry was changed for this review.

## Previous V2N model snapshot (historical)

The V2N GLB is retained as a backup and is not loaded by active pages. Current model paths and controls are described in the active-model update above.

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
