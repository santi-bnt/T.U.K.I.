# TUKI print preparation checklist

Complete this list before sending jobs to a printer. This is a file and geometry audit, not a physical assembly validation.

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
