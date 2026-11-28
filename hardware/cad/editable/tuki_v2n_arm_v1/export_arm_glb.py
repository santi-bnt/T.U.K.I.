"""Export the new parametric arm assembly as a self-contained GLB preview.

This exports only geometry created by build_tuki_v2n_arm_v1.py. It does not
read the V2N hand, any Shapekit meshes, or printable bed layouts.
"""

from argparse import ArgumentParser
from pathlib import Path

import cadquery as cq

from build_tuki_v2n_arm_v1 import (
    CAD_OUT,
    build_electronics_base,
    build_forearm_halves,
    build_wrist_collar,
)


def main() -> None:
    parser = ArgumentParser(description=__doc__)
    parser.add_argument(
        "--output",
        type=Path,
        default=CAD_OUT / "tuki_v2n_arm_v1.glb",
        help="Output GLB path (default: the CAD generated/ directory).",
    )
    args = parser.parse_args()
    args.output.parent.mkdir(parents=True, exist_ok=True)

    forearm_left, forearm_right = build_forearm_halves()
    collar = build_wrist_collar()
    electronics_base, service_cover, electronics_carrier = build_electronics_base()

    assembly = cq.Assembly(name="TUKI_V2N_ARM_V1_PARAMETRIC_CANDIDATE")
    assembly.add(electronics_base, name="ElectronicsBase")
    assembly.add(service_cover, name="ServiceCover_USB_Pending")
    assembly.add(electronics_carrier, name="ElectronicsCarrier")
    assembly.add(forearm_left, name="ForearmLeft", loc=cq.Location(cq.Vector(0, 0, 158)))
    assembly.add(forearm_right, name="ForearmRight", loc=cq.Location(cq.Vector(0, 0, 158)))
    assembly.add(collar, name="WristCollar_PalmInterfacePending", loc=cq.Location(cq.Vector(0, 0, 268)))
    assembly.export(str(args.output), exportType="GLTF")
    print(f"Wrote new parametric arm preview: {args.output} ({args.output.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
