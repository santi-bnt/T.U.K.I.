# Camera interaction integration

## Direction and current status

Camera-based interaction is the intended input direction for TUKI. The current web application does not request camera permission, capture camera frames, or perform visual gesture recognition. The web digital twin is implemented as an independent browser simulation controlled through the existing Studio controls and supported browser voice recognition.

## Intended stages

1. **Camera input:** browser-based image capture, after a future implementation explicitly requests user permission.
2. **Vision interpretation:** detect an agreed set of gestures and map them to normalized `HandPose` values.
3. **Web digital twin:** apply those values through the existing shared motion state and renderer. The simulator already works independently of a camera.
4. **Future robotic hand integration:** physical execution would require validated mechanical limits, servo calibration, controller firmware, and a separate approved integration phase.

## Requirements before camera implementation

- Define supported browsers, camera permission behavior, and a clear no-camera fallback.
- Choose and document the vision/runtime approach before adding capture or recognition dependencies.
- Keep raw camera frames local to the browser unless a separately reviewed product requirement changes that boundary.
- Map recognized gestures to the existing normalized `HandPose` API; do not add a competing motion state.
- Clearly label recognition confidence and unsupported conditions; never imply physical motion from simulated recognition.

Camera interaction remains planned. The Studio must continue to work without camera permission or camera hardware.
