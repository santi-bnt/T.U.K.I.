# CAD assembly and asset audit

> **V4 R1:** see the [hinge bore and M3 nut relief revision](TUKI_V4_REPARACION_R1.md) for the physical CAD and service sequence.

> **Print selection:** the root [`imprimir/`](../imprimir/LEEME.md) folder is the sole selected V4 R1 STL list. It contains three first-print coupons, the R1 structural parts, M3 clamps, pulley candidate, and hinge-pin/cap bed. It excludes CAD/STEP, old versions, and the already-printed hand/fingers.

> **Mechanical V4:** See [the V4 mechanical review](TUKI_V4_MECHANICAL_REVIEW.md) for the STEP audit and prototype wrist routing. The physical palm interface remains pending.

> **Scope note (updated 2026-11-23):** This inventory documents the supplied V6 manufacturing/CAD state and a separate local V2N/A1 Mini arm proposal. The active V2N website model includes its current visual forearm geometry; this web release does not include that proposal's editable CAD or manufacturing STL/STEP files and does not modify or validate printed parts, print beds, or physical assembly. Do not use the V6 source history below as provenance for V2N. See `docs/DIGITAL_TWIN.md` and `docs/ASSET_LICENSES.md` for the web model and its provenance.

> **V2N/A1 Mini arm v1 update (2026-11-23):** A local parametric preliminary arm/collar/electronics-base concept was created, and its six meshes are incorporated into the active web GLB. The CAD source and manufacturing outputs remain local and are excluded from this web-release staging. This concept does not modify or claim fit with the printed V2N hand beds. The palm mating face and USB-C opening remain unset pending direct measurements.

## Active source inventory

The new V2N arm v1 output is a separate prototype set and is not yet part of the validated/current print manifest. See the update note above before selecting print jobs.

| Active asset | Contents | Size / structure | Use |
|---|---|---|---|
| `hardware/printables/hand/01_CAMA_MANO_Y_ESTRUCTURA_SG90_12p6x24p1.stl` | Palm with integrated wrist and modified servo-support frame | 168.966 × 149.700 × 41.700 mm; 12,054 triangles; 2 edge-connected shells (8,954 and 3,100 triangles) | Print bed; supplied layout retained. |
| `hardware/printables/hand/02_CAMA_DEDOS_Y_5_POLEAS.stl` | Finger segments and five spool/pulley pieces | 162.486 × 124 × 15 mm; 34,878 triangles; 19 shells (14 links + 5 spools) | Print bed; supplied layout retained. |
| `hardware/printables/forearm/03_CAMA_ANTEBRAZO_CARCASA.stl` | Forearm enclosure shell | 122.7 × 161 × 86 mm; 9,830 triangles; 1 shell | Print bed. |
| `hardware/printables/forearm/04_CAMA_ANTEBRAZO_TAPA.stl` | Forearm cover | 122.7 × 153 × 45.7 mm; 2,256 triangles; 1 shell | Print bed. |
| `hardware/printables/electronics-drawer/01_MARCO_FIJO_CAJON_USB_C_V6_PARA_IMPRIMIR.stl` | V6 fixed drawer frame | 112 × 78 × 40 mm; 1,796 triangles; watertight per V6 report | Active print part. |
| `hardware/printables/electronics-drawer/02_CAJON_DESLIZANTE_USB_C_V6_PARA_IMPRIMIR.stl` | V6 sliding tray/front | 111 × 79.5 × 34.8 mm; 512 triangles; watertight per V6 report | Has nominal rounded 21 × 12 mm cable opening. |
| `hardware/printables/electronics-drawer/03_TEST_AGUJERO_USB_C_21x12.stl` | Opening fit coupon | 40 × 22 × 3 mm; 544 triangles; 1 shell | Optional cable-plug test. |

The V6 frame, tray, and coupon STEP files are under `hardware/cad/editable/`. No STEP source for the supplied hand, forearm, or cover was found; their STL print beds are the only supplied geometry source. Five SG90 bodies in the GLB are reference visuals, not additional printable items. Motors and small assembly hardware are not included in these STL files.

## Units, coordinate systems, and assembly limits

STL stores no unit or coordinate metadata. Supplied print-bed dimensions, the Shapekit source, and the V6 CAD notes support interpreting print layouts as millimeters and Z-up. Bed origins are independent. Preserve their print layout; it does not define installed assembly transforms.

The former V6 web GLB used meters and Y-up, with a Shapekit-derived hand and V6 drawer proposal; this is historical and is no longer loaded by the application. The active V2N GLB also renders in meters and Y-up, preserves the V2N hand and five finger clips, and uses the parametric arm v1 meshes. Neither the previous V6 render nor the current V2N visual assembly establishes measured interfaces, physical fit, or a mechanically validated assembly.

The V6 drawer has a fixed sleeve and removable slider. Viewer travel is 60 mm along the modeled Z axis. That travel and the source CAD intersection checks do not verify printed rails, stops, fasteners, fit, or clearance. The rounded 21 × 12 mm passage is in the moving tray/front; actual cable plug clearance is unknown.

## V6 generation and web integration

`hardware/cad/editable/build_drawer_v6.py` is the parametric drawer source. It writes STEP into `hardware/cad/editable/`, print-oriented STL into `hardware/printables/electronics-drawer/`, and patches the archived V5 hand/forearm GLB to produce `web/public/models/tuki.glb`. It uses temporary assembly-coordinate STL only during export. Five clips are `thumb`, `index`, `middle`, `ring`, and `pinky`.

Homepage and Studio use this same file. Named view nodes include `ExteriorShell`, `RemovableCover`, `Drawer_FixedSleeve`, `Drawer_Slider`, and `Drawer_RemovableTray`. Exterior shows the visual assembly; Interior hides the outer shell and cover; Exploded separates those pieces and pulls out the sliding tray. No physical hinge is represented. Keep enclosure state independent from finger motion.

## Superseded assets

Old V2–V5 GLBs, preview renders, legacy modular-box beds 05–07, non-printing drawer assembly-coordinate STL exports, and old model-generation helpers were moved to `hardware/archive/cad-iterations/`. They are not print requirements or active web assets. One second V6 GLB was removed after SHA-256 confirmed it byte-identical to the kept V6 asset. A root-level `hand.glb` is retained as an owner convenience copy; the application does not load it. See the archive README for the full itemized disposition.

## Open checks

- The active V2N website asset and its targeted provenance review are documented in `docs/ASSET_LICENSES.md`; the historical Shapekit-derived V6 model is not loaded or published from `web/public/`. The owner's V2N authorship declaration is recorded separately from independent evidence and third-party authorization.
- Measure wrist, forearm, and drawer mounting datums or provide an assembly CAD source.
- Verify actual SG90 placement, linkage/tendon routing, fasteners, and clearance.
- Check drawer mounting, printed slide fit, travel, cable passage/strain, and electronics volume on physical parts.
- Confirm controller, battery, and regulated supply size/placement and safety requirements.
- Do not describe a physical fit or motion as validated until it is tested on hardware.
