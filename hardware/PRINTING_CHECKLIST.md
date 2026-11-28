# TUKI print preparation checklist

**Lista activa V4 R1:** utiliza únicamente los archivos de [`imprimir/`](../imprimir/LEEME.md), en la raíz del repositorio. Empieza con los tres cupones; el resto sigue pendiente de validación física. Las listas V2N/V6 de abajo son históricas y no deben combinarse con V4 R1.

For V4 R1, test the printed pin and cap fit, the M3-05 nut relief, and the sequence for freeing T1 during plate removal. Follow the [R1 report](../docs/TUKI_V4_REPARACION_R1.md).

## V4 prototype

- [ ] Complete the [V4 integration checks](../docs/TUKI_V4_ASSEMBLY_GUIDE.md), including the measured palm interface and hardware envelopes.
- [ ] Slice the wrist with guide axes predominantly vertical and confirm all bores remain clear without inaccessible supports. Validate a sample channel with the real tendon first.

Complete this list before sending jobs to a printer. This is a file and geometry audit, not a physical assembly validation.

## V2N/A1 Mini arm v1 — preliminary, separate from the existing hand beds

- [ ] Confirm that the already-printed `CAMA_00` test coupons and `CAMA_01` palm/thumb/index pieces remain unchanged. The new generator must not write into their source paths.
- [ ] Measure the actual palm-to-wrist mating face and enter its datum/hole pattern in `build_tuki_v2n_arm_v1.py`; the supplied collar top is intentionally blank.
- [ ] Confirm the exact FRDM-RW612 revision, connector orientation, component heights, and the regulator model/clearance. The 130 × 55 mm PCB outline is only a board-level envelope.
- [ ] Measure the USB-C port and molded plug, then configure and test the cover cutout. The exported cover has no USB-C hole yet.
- [ ] Verify that the new carrier, ribs, bolt seats, and service cover do not obstruct components or the continuous cable path.
- [ ] Slice each new STL separately in Bambu Studio and confirm the generated orientation, walls, supports, screw access, and A1 Mini envelope. CAD topology checks are not print validation.
- [ ] Trial-fit the collar, forearm halves, and electronics base without servos powered; inspect palm fit, cable routing, fasteners, and structural flex before committing to a final revision.
- [ ] Do not alter or reprint V2N hand parts, SG90 rack, fingers, or existing beds as part of this arm iteration.

## Right hand

- [ ] `printables/hand/01_CAMA_MANO_Y_ESTRUCTURA_SG90_12p6x24p1.stl` present; print 1 bed. Confirm the palm/wrist and servo frame are both present (2 connected shells).
- [ ] `printables/hand/02_CAMA_DEDOS_Y_5_POLEAS.stl` present; print 1 bed. Confirm all 19 pieces are present (14 finger links and 5 pulleys/spools).
- [ ] Verify part identity and count after separating each bed; do not print the 3D scene's visual meshes as extra parts.
- [ ] Confirm five SG90 servos, pins, tendons, horns, fasteners, and other assembly hardware are available separately. They are not included in the STL files.

## Forearm

- [ ] `printables/forearm/03_CAMA_ANTEBRAZO_CARCASA.stl` present; print 1 shell.
- [ ] `printables/forearm/04_CAMA_ANTEBRAZO_TAPA.stl` present; print 1 cover.
- [ ] Keep original print-bed orientation. Confirm wrist fit, servo clearance, cover alignment, and tendon routing on the physical parts before final assembly.

## Electronics drawer (V6)

- [ ] `printables/electronics-drawer/01_MARCO_FIJO_CAJON_USB_C_V6_PARA_IMPRIMIR.stl` present; print 1 frame.
- [ ] `printables/electronics-drawer/02_CAJON_DESLIZANTE_USB_C_V6_PARA_IMPRIMIR.stl` present; print 1 removable tray.
- [ ] Optional: print 1 `printables/electronics-drawer/03_TEST_AGUJERO_USB_C_21x12.stl` coupon and check the actual molded cable plug before printing the full tray.
- [ ] Confirm the nominal rounded 21 × 12 mm pass-through is in the movable tray/front. It is a cable passage, not a USB-C receptacle.
- [ ] Confirm frame, tray, and opening geometry in a slicer. No print settings, actual connector fit, or printed sliding tolerance are certified here.
- [ ] Do not print the archived `_ENSAMBLE.stl` drawer exports as well as the `_PARA_IMPRIMIR.stl` parts.
- [ ] Before mounting: check the proposed slots against real forearm holes, electronics and cable clearance, slide stroke, cable slack, and fastener access. These fits remain unvalidated.

## Final count and assembly gate

- [ ] Required print files: 6 total (2 hand beds + 2 forearm parts + 2 drawer parts).
- [ ] Optional USB opening coupon: 1.
- [ ] Archived modular box beds 05–07 and older assembly GLBs are not part of the V6 print manifest.
- [ ] Do not claim a successful physical assembly until the printed parts and complete hardware have been fitted and tested.
