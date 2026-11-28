# Decision log

## 2026-11-21 — V2N shared web model

Use `web/public/models/tuki-v2n.glb` for Home and Studio through the shared twin. Map the existing normalized controls to the V2N joints using the manual rig; retain all five glTF clips without playing them concurrently. The owner states that V2N was developed by the project team from scratch with AI-assisted parametric CAD and directed public-release preparation. A targeted review found no concrete third-party material in the active GLB or two previews. Record the statement separately from technical evidence; it is not third-party authorization or proof of absolute independence. Missing CAD history remains a traceability reservation, not a blocker by itself. Physical validation remains incomplete.

The 2026-11-19 V6 model decision below is historical and superseded for the active website model.

## 2026-11-19 — App Router with client-isolated 3D

Use Next.js App Router, React, and R3F. Public product narrative remains server-renderable while the Studio loads WebGL as a client experience.

## 2026-11-19 — One shared V6 CAD model

Use `web/public/models/tuki.glb` for Home, Studio, and technical visualization. It preserves the five articulated Shapekit finger clips and includes the V6 horizontal drawer visualization. Do not reintroduce a procedural hand or page-specific model. The enclosure fit is unvalidated; selecting this visual asset does not establish a physical assembly.

## 2026-11-19 — Normalized simulation interface

Represent each digit as a normalized 0–1 flexion value. Physical mapping is unknown, so do not expose or imply calibrated servo angles. Keep the simulation adapter separate and reserve typed boundaries for any future device integration.

## 2026-11-19 — Browser-local sequence persistence

No backend is needed for the first phase. Versioned local storage provides browser-local authoring while remaining replaceable later.

## Monorepo and camera-led interaction

Deploy the independent Next.js project from `web/`. Reserve `firmware/nxp/` for future hand-controller code. Camera tracking is an optional browser simulation input implemented in Studio; it estimates finger flexion from MediaPipe landmarks and shares the existing normalized pose path. Keep manual simulation independent. Semantic camera gesture recognition, calibrated motion, and physical device control remain out of scope.

## Single-owner pose and MOCK packet boundary (2026-11-26)

Studio inputs submit through `HandMotionController`, which arbitrates one normalized pose with a fixed priority: manual > gesture/voice > game > sequence > camera. Explicitly selecting a mode can reactivate its source. Accepted values are recorded by an in-memory `TUKI-MOCK` v1 adapter for transport diagnostics; packet delay/loss/error/disconnect simulation does not open a socket, serial port, or hardware path. Keep this DTO separate from the future ESP32 wire protocol until physical calibration and integration are explicitly designed.
