# TUKI V2N + V4 R1 web assembly

## Active visual asset

The website's shared 3D model is `web/public/models/tuki-v2n-v4-r1.glb`, extracted from the owner-supplied `TUKI_R1_ENSAMBLE_VISUAL_COMPLETO.zip`. Its SHA-256 is `55c746ef29692cee5f396ea87b913e4be105c60d591f93ac3925af380f5caeb3`.

The supplied assembly process combines three inputs:

- The V2N hand GLB from the owner's V2N web migration package. It retains the 15 hand meshes, 14 named finger joints and five `CLOSE_*` clips. The owner's statement and prior file-level evidence are recorded separately in `ASSET_LICENSES.md`.
- The 24-solid V4 R1 assembly STEP from `TUKI_V4_FINAL_A1_MINI.zip`, triangulated in assembly coordinates. No STEP, STL or editable CAD file was changed by this web integration.
- The detailed SG90 reference GLB from the owner's electronics reference package. Its parametric source builds nominal component geometry from reference dimensions; these are not measured SG90 units.

The resulting GLB embeds one binary buffer and has no external textures or resource URIs. It contains 243 nodes, 96 mesh definitions reused by 204 scene mesh instances, the 24 R1 solids, five SG90 references, five pulley meshes, ten M3 clamp meshes and 14 animated finger joints. The root matrix scales CAD millimetres by 0.001 to glTF metres. The shared checker is `web/scripts/check-tuki-v2n-v4-r1.mjs`, also called by `node scripts/check-tuki-model.mjs`.

## Runtime and view modes

Home and Studio share the GLB through `TukiDigitalTwin` -> `HandScene` -> `CadHand` -> `TukiV2NV4R1Hand`. Technology uses a still rendered from that same GLB to preserve the lightweight architecture-page preview. Studio's existing `HandPose`, Camera Tracking, filters, controller arbitration and in-memory MOCK transport remain the sole motion path.

The manual rig reads each `CLOSE_*` clip's final joint quaternions and interpolates from the neutral pose. It does not run an `AnimationMixer` on top of manual control. Exterior leaves both named hinge pivots closed. Interior rotates both R1 door pivots around their supplied Y axes to expose the five servo references. Exploded adds viewer-only offsets to selected groups. Those transforms are visual explanation states, not measured assembly steps or proof of collision-free physical motion.

Preview captures under `docs/visual-review/` document the actual browser render. The site previews use captures in `web/public/images/tuki-v4-r1-exterior.png` and `web/public/images/tuki-v4-r1-interior.png`.

## What is and is not verified

Verified from the supplied files: node hierarchy, embedded asset data, millimetre-to-metre root scale, 14 hand joints, all five clips, each clip's joint tracks, five nominal SG90 reference groups and R1 component node names. Automated tests exercise each finger separately and together at 0, 0.25, 0.5, 0.75 and 1, matching the supplied clip endpoints.

Not verified: V2N palm-to-R1 wrist physical fit, dimensions of the user's SG90 units, servo-body or cable clearance, actual door collision through the whole motion path, electronics fit, tendon tension, physical assembly, mobile-device frame rate, or servo calibration. Generic electronics references in the source ZIP are deliberately omitted because the user's exact board, battery and converter dimensions are unconfirmed.

The component source and package identify the model as visual reference only. The root ZIPs are source materials and must not be staged as website assets. Historical Shapekit credits remain in `ASSET_LICENSES.md`; this record does not claim legal certification or third-party authorization.
