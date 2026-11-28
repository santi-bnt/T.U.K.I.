# TUKI hardware and print manifest

## Selección actual para imprimir: TUKI V4 R1

La lista única de archivos para la siguiente impresión está en [`imprimir/`](../imprimir/LEEME.md), en la raíz. Contiene solo los STL seleccionados de R1, empieza con tres cupones y marca los ensayos físicos pendientes. No selecciones piezas por las listas históricas que siguen en este README. La mano/palma y los dedos previamente impresos se conservan; no se repiten.

El paquete consolidado original se archivó localmente bajo `.local-private/root-archives/source-zips/`; el directorio `imprimir/` contiene las copias de STL extraídas y revisadas. La geometría pasó auditoría CAD, no laminado ni pruebas físicas. Consulta el [informe R1](../docs/TUKI_V4_REPARACION_R1.md).

## Inventarios anteriores (referencia histórica)

Los inventarios siguientes describen V2N/V6 y no son la lista de impresión V4 R1.

## V4 mechanical prototype

The pre-R1 V4 candidate and its CAD review are recorded in the [mechanical review](../docs/TUKI_V4_MECHANICAL_REVIEW.md). The corrected R1 print selection is listed only in the root [`imprimir/`](../imprimir/LEEME.md) folder; use the [assembly guide](../docs/TUKI_V4_ASSEMBLY_GUIDE.md) for bench checks.

## Current V2N/A1 Mini arm redesign — preliminary

The user's mechanical reference is V2N/A1 Mini. The already-printed `CAMA_00` test coupons and `CAMA_01` palm/thumb/index pieces are preserved; this iteration does not overwrite or alter the supplied hand, finger, rack, or SG90 parts. New parametric source, assembly preview, report, and STEP files are under [`cad/editable/tuki_v2n_arm_v1/`](cad/editable/tuki_v2n_arm_v1/README.md). New forearm/collar STLs are under `printables/forearm/v2n-arm-v1/`; electronics housing parts are under `printables/electronics-drawer/v2n-arm-v1/`.

The concept uses a tapered hollow forearm in two bolted halves with three internal cross-ribs and a clear cable channel, a tapered structural wrist collar, and a thicker removable electronics base. Five SG90s stay in the existing hand rack. The FRDM-RW612 reference envelope uses the published 130 × 55 mm PCB outline; board component height, exact regulator, carrier mounting, connector orientation, cable strain relief, strength and fit still require confirmation. No battery volume is reserved. The USB-C opening is deliberately disabled until the actual board-port position and plug clearance are measured; the fixed screw-on service cover remains a configurable panel.

All six preliminary STLs pass single-component watertight edge checks and fit within the 180 × 180 × 180 mm A1 Mini build volume. These are design/mesh checks only, not print or assembly validation. The palm-to-collar pattern is blank and unverified, so do not treat the new pieces as compatible with the printed palm until the mating face is measured. Keep this preliminary set outside the established print manifest until a physical fit review is complete.

## Current design and status

The legacy inventory below records the prior V6 print design for reference. V2N/A1 Mini is the current hand reference; the V2N arm v1 above is a separate preliminary redesign, not a validated replacement print manifest. The V6 drawer remains a conceptual/test-print revision. Its mounting, electronics/connector clearance, and sliding tolerances were not physically validated.

The supplied hand and forearm STLs are print-bed layouts in nominal millimeters with Z up. Preserve the provided bed arrangement; do not interpret those coordinates as installed assembly transforms. The two V6 drawer `_PARA_IMPRIMIR.stl` files are individually oriented print parts. Do not print their `_ENSAMBLE.stl` equivalents in addition.

## Required printable inventory

Print one of each current bed/part listed below. Combined beds contain multiple disconnected pieces; print the whole file once.

| Category | File | Qty | Contents / nominal dimensions | Notes |
|---|---|---:|---|---|
| Hand | `printables/hand/01_CAMA_MANO_Y_ESTRUCTURA_SG90_12p6x24p1.stl` | 1 bed | Palm with integrated wrist plus modified SG90 support frame; 168.966 × 149.700 × 41.700 mm overall; 2 connected components | Print-bed layout. Does not include the five purchased servos. |
| Hand | `printables/hand/02_CAMA_DEDOS_Y_5_POLEAS.stl` | 1 bed | 14 finger segments and 5 spool/pulley pieces; 162.486 × 124 × 15 mm overall; 19 connected components | Print this combined bed once; do not duplicate the individual pieces from the visualization model. |
| Forearm | `printables/forearm/03_CAMA_ANTEBRAZO_CARCASA.stl` | 1 | Enclosed forearm shell; 122.7 × 161 × 86 mm | Original bed orientation retained; installed fit is not verified. |
| Forearm | `printables/forearm/04_CAMA_ANTEBRAZO_TAPA.stl` | 1 | Forearm cover; 122.7 × 153 × 45.7 mm | Original bed orientation retained; verify fit before use. |
| Drawer | `printables/electronics-drawer/01_MARCO_FIJO_CAJON_USB_C_V6_PARA_IMPRIMIR.stl` | 1 | Fixed frame; 112 × 78 × 40 mm | STEP source is in `cad/editable/`. Roof is oriented to the bed per V6 source notes. |
| Drawer | `printables/electronics-drawer/02_CAJON_DESLIZANTE_USB_C_V6_PARA_IMPRIMIR.stl` | 1 | Removable sliding tray/front; 111 × 79.5 × 34.8 mm | Contains the rounded 21 × 12 mm nominal cable pass-through in the moving front. Verify against the actual molded cable plug. |
| Optional test | `printables/electronics-drawer/03_TEST_AGUJERO_USB_C_21x12.stl` | 1 optional | 40 × 22 × 3 mm opening coupon | Test the real cable/connector before printing the full tray. It is not a connector mount. |

The hand geometry is represented by the two combined print beds above. The 14 segments cover two thumb pieces and three pieces for each other finger. These beds do not provide tendons, hinge pins, fasteners, wiring, or motors. Five SG90 servos are purchased components, not printed components. Confirm all additional hardware against the Shapekit assembly instructions and the parts physically on hand before printing or assembly; do not assume the repository includes them.

## Editable sources and archived designs

- `cad/editable/01_MARCO_FIJO_CAJON_USB_C_V6.step` — fixed frame.
- `cad/editable/02_CAJON_DESLIZANTE_USB_C_V6.step` — sliding tray.
- `cad/editable/03_TEST_AGUJERO_USB_C_21x12.step` — optional USB passage coupon.
- `cad/editable/build_drawer_v6.py` — parametric CadQuery source for the V6 drawer, with integration export noted as dependent on its V5 GLB source.
- The supplied hand, forearm, and cover beds have no STEP equivalents in this repository; their STL beds are the only supplied geometry sources.
- `archive/cad-iterations/` contains superseded reference GLBs, prior previews, legacy box print beds, and non-printing assembly-coordinate drawer exports. They are not part of the active manifest. Do not add them to a print job or the current web scene.

## Assembly notes

1. Print the palm/wrist/support bed and finger/pulley bed. Separate each bed component and identify the 14 finger links and five spools before assembly.
2. Assemble the Shapekit tendon-driven digits and pulleys using the source design instructions. Confirm pin, tendon, fastener, and routing requirements independently; these items are not supplied by these STL beds.
3. Install five SG90 servos in the modified support structure, one planned logical actuator per finger. Servo orientation, horns, cable routing, and calibrated motion must be verified on the actual mechanism; the web's normalized values are not servo angles.
4. Fit the forearm shell and cover to the wrist/support only after checking the real mating geometry and all tendon/servo clearances. The provided print beds do not define a shared installed transform.
5. Assemble the V6 fixed drawer frame and removable tray from their STEP/STL pair. Its CAD depicts the USB-C cable opening on the moving front and a removable sliding tray. It is not a USB receptacle or data connection.
6. The drawer is visually placed under the forearm in the digital twin as a V6 concept. Verify mounting, fastener access, full sliding travel, forearm clearance, cable slack, and electronics dimensions physically before installing it. Disconnect a cable before removing the tray.

## Validated and unvalidated details

The V6 technical report records each print-ready drawer mesh as a single watertight, positive-volume component and checks the CAD tray/frame intersection at several simulated openings. This is a geometry check, not a print or fit test. The source specifies a nominal 21 × 12 mm rounded opening (R2.5) in the sliding tray; the actual connector fit is untested. No print temperatures, material choice, supports, tolerances, structural strength, mounted fit, electronics envelope, or physical assembly have been established here. The drawer's proposed mounting slots have not been verified against the forearm.

Shapekit-derived geometry is attributed in [Digital Twin](../docs/DIGITAL_TWIN.md) and subject to CC BY-NC 4.0. The project owner reports that the custom enclosure/drawer CAD is original TUKI work. The print/CAD files remain local and are not part of the web deployment; see [asset licensing and release status](../docs/ASSET_LICENSES.md) before publishing them or the mixed web model.
