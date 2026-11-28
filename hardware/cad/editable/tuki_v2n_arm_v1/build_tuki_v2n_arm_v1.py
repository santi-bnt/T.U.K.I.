"""Generate a provisional, parametric V2N/A1 Mini arm and electronics pod.

All dimensions are millimetres. This is a new design iteration. It does not
load, rewrite, or replace the printed V2N hand/rack STLs or the active web GLB.
Run with CadQuery 2.8+: python build_tuki_v2n_arm_v1.py
"""
from __future__ import annotations

import json
from pathlib import Path

import cadquery as cq


ROOT = Path(__file__).resolve().parents[4]
CAD_OUT = Path(__file__).resolve().parent / "generated"
FOREARM_OUT = ROOT / "hardware" / "printables" / "forearm" / "v2n-arm-v1"
ELECTRONICS_OUT = ROOT / "hardware" / "printables" / "electronics-drawer" / "v2n-arm-v1"

# Design envelope. The forearm/base/collar interfaces between new parts are
# defined here. The top palm bolt pattern is intentionally left unset until the
# already-printed V2N palm is measured at its actual mating face.
P = {
    "print_volume_mm": [180.0, 180.0, 180.0],
    "forearm_length_mm": 110.0,
    "forearm_bottom_section_mm": [58.0, 48.0],  # x width, y depth
    "forearm_top_section_mm": [50.0, 40.0],
    "forearm_wall_mm": 3.0,
    "forearm_seam_rail_mm": [10.0, 6.0],  # x thickness, y depth
    "forearm_seam_hole_diameter_mm": 3.4,  # M3 clearance; new interface only
    "forearm_seam_z_mm": [14.0, 42.0, 70.0, 96.0],
    "forearm_rib_width_mm": 2.0,
    "forearm_rib_depth_mm": 2.4,
    "forearm_rib_thickness_mm": 2.0,
    "forearm_rib_z_mm": [29.0, 55.0, 81.0],
    "new_joint_hole_diameter_mm": 3.4,
    "new_joint_bolt_centres_x_mm": [-22.0, 22.0],
    "new_joint_bolt_centres_y_mm": [-17.0, 17.0],
    "wrist_collar_height_mm": 32.0,
    "wrist_collar_bottom_mm": [64.0, 54.0],
    "wrist_collar_top_mm": [44.0, 36.0],
    "wrist_collar_wall_mm": 3.0,
    "wrist_channel_mm": [24.0, 18.0],
    "palm_bolt_pattern_mm": None,  # no verified centres/holes; do not guess
    "palm_mating_datum_mm": None,  # measure against the already-printed palm
    "electronics_base_mm": [112.0, 82.0, 158.0],  # x width, y depth, z length
    "electronics_wall_mm": 3.0,
    "electronics_corner_radius_mm": 5.0,
    "electronics_service_opening_mm": [98.0, 138.0],  # x width, z height
    "electronics_service_end_margin_mm": 10.0,
    "usb_cutout_enabled": False,
    "usb_cutout_width_mm": None,
    "usb_cutout_height_mm": None,
    "usb_cutout_center_on_panel_mm": None,
    "pcb_model": "NXP FRDM-RW612 outline envelope, not a fitted board",
    "pcb_outline_mm": [55.0, 130.0],  # NXP manual; x width, z length
    "pcb_component_depth_mm": 18.0,  # provisional envelope; confirm on real board
    "pcb_center_x_mm": -17.5,
    "pcb_center_y_mm": -23.5,
    "regulator_envelope_mm": [30.0, 20.0, 40.0],  # provisional x, y, z
    "regulator_center_mm": [30.0, 15.0, 79.0],
    "cable_chute_center_y_mm": 0.0,
    "cable_chute_mm": [24.0, 18.0],
    "electronics_carrier_mm": [68.0, 2.8, 142.0],  # x, y thickness, z
    "electronics_carrier_center_x_mm": -17.5,
    "electronics_carrier_center_y_mm": -34.5,
    "electronics_carrier_center_z_mm": 79.0,
    "carrier_tie_slot_centres_x_mm": [-31.0, 31.0],
    "carrier_tie_slot_centres_z_mm": [17.0, 141.0],
    "carrier_tie_slot_mm": [2.4, 10.0],
}


def box(width: float, depth: float, height: float, x: float = 0.0,
        y: float = 0.0, z: float = 0.0) -> cq.Workplane:
    """Create a centered rectangular solid at an assembly coordinate."""
    return cq.Workplane("XY").box(width, depth, height).translate((x, y, z))


def cylinder(radius: float, length: float, start: tuple[float, float, float],
             direction: tuple[float, float, float]) -> cq.Solid:
    return cq.Solid.makeCylinder(radius, length, cq.Vector(*start), cq.Vector(*direction))


def as_workplane(shape: cq.Shape) -> cq.Workplane:
    return cq.Workplane("XY").newObject([shape])


def rectangular_ring(width: float, depth: float, height: float,
                     inner_width: float, inner_depth: float,
                     center_z: float) -> cq.Workplane:
    outer = box(width, depth, height, z=center_z)
    inner = box(inner_width, inner_depth, height + 2.0, z=center_z)
    return outer.cut(inner)


def bolt_centres() -> list[tuple[float, float]]:
    return [(x, y) for x in P["new_joint_bolt_centres_x_mm"]
            for y in P["new_joint_bolt_centres_y_mm"]]


def cut_vertical_holes(part: cq.Workplane, centres: list[tuple[float, float]],
                       diameter: float, z0: float, length: float) -> cq.Workplane:
    result = part.val()
    for x, y in centres:
        result = result.cut(cylinder(diameter / 2.0, length,
                                     (x, y, z0), (0.0, 0.0, 1.0)))
    return as_workplane(result)


def section_at(z: float) -> tuple[float, float]:
    ratio = z / P["forearm_length_mm"]
    bottom = P["forearm_bottom_section_mm"]
    top = P["forearm_top_section_mm"]
    return (bottom[0] + (top[0] - bottom[0]) * ratio,
            bottom[1] + (top[1] - bottom[1]) * ratio)


def build_forearm_halves() -> tuple[cq.Workplane, cq.Workplane]:
    length = P["forearm_length_mm"]
    wall = P["forearm_wall_mm"]
    bottom_w, bottom_d = P["forearm_bottom_section_mm"]
    top_w, top_d = P["forearm_top_section_mm"]

    outer = (cq.Workplane("XY").rect(bottom_w, bottom_d)
             .workplane(offset=length).rect(top_w, top_d).loft(combine=True))
    inner = (cq.Workplane("XY").workplane(offset=-1.0)
             .rect(bottom_w - 2 * wall, bottom_d - 2 * wall)
             .workplane(offset=length + 2.0)
             .rect(top_w - 2 * wall, top_d - 2 * wall).loft(combine=True))
    shell = outer.cut(inner)

    # Three closed cross-ribs strengthen the thin shell while keeping a
    # continuous central opening for wiring. The rib openings remain large.
    for rib_z in P["forearm_rib_z_mm"]:
        width, depth = section_at(rib_z)
        inner_w = width - 2 * wall
        inner_d = depth - 2 * wall
        rib = rectangular_ring(inner_w + 1.0, inner_d + 1.0,
                               P["forearm_rib_thickness_mm"],
                               inner_w - 2 * P["forearm_rib_width_mm"],
                               inner_d - 2 * P["forearm_rib_width_mm"],
                               rib_z)
        shell = shell.union(rib)

    # Structural end collars connect only the new forearm and new base/cuff.
    # Their bolt pattern is a new design datum, not a V2N palm interface.
    flange_w, flange_d = 64.0, 54.0
    bore_w, bore_d = P["wrist_channel_mm"]
    for center_z in (2.0, length - 2.0):
        shell = shell.union(rectangular_ring(
            flange_w, flange_d, 4.0, bore_w, bore_d, center_z))

    # Longitudinal seam rails provide screw land without closing the cable path.
    rail_w, rail_d = P["forearm_seam_rail_mm"]
    for y in (-17.0, 17.0):
        shell = shell.union(box(rail_w, rail_d, length - 12.0,
                                0.0, y, length / 2.0))

    # Reinforcement lands have horizontal M3 clearance holes through both halves.
    for z in P["forearm_seam_z_mm"]:
        for y in (-17.0, 17.0):
            shell = shell.cut(cylinder(
                P["forearm_seam_hole_diameter_mm"] / 2.0,
                14.0, (-7.0, y, z), (1.0, 0.0, 0.0)))
    shell = cut_vertical_holes(shell, bolt_centres(),
                               P["new_joint_hole_diameter_mm"], -1.0,
                               length + 2.0)

    left_clip = box(60.0, 100.0, length + 20.0,
                    x=-30.0, z=length / 2.0)
    right_clip = box(60.0, 100.0, length + 20.0,
                     x=30.0, z=length / 2.0)
    return shell.intersect(left_clip), shell.intersect(right_clip)


def build_wrist_collar() -> cq.Workplane:
    height = P["wrist_collar_height_mm"]
    bottom_w, bottom_d = P["wrist_collar_bottom_mm"]
    top_w, top_d = P["wrist_collar_top_mm"]
    wall = P["wrist_collar_wall_mm"]

    # A smooth tapered fairing hides the arm-to-palm transition. Its top face
    # is intentionally blank until the printed V2N palm's mating datum is measured.
    outer = (cq.Workplane("XY").workplane(offset=4.0).rect(bottom_w, bottom_d)
             .workplane(offset=height - 4.0).rect(top_w, top_d).loft(combine=True))
    inner = (cq.Workplane("XY").workplane(offset=-1.0)
             .rect(bottom_w - 2 * wall, bottom_d - 2 * wall)
             .workplane(offset=height + 2.0)
             .rect(top_w - 2 * wall, top_d - 2 * wall).loft(combine=True))
    collar = outer.cut(inner)

    # New bottom interface mates only to the new forearm flange. The palm top
    # remains unperforated until its printed mating datum is measured.
    collar = collar.union(rectangular_ring(
        bottom_w, bottom_d, 4.0, P["wrist_channel_mm"][0],
        P["wrist_channel_mm"][1], 2.0))

    # Bottom bolt pattern matches the new forearm top flange only.
    collar = cut_vertical_holes(collar, bolt_centres(),
                                P["new_joint_hole_diameter_mm"], -1.0, 6.0)

    # No palm holes are emitted while the V2N printed palm datum is unresolved.
    palm_pattern = P["palm_bolt_pattern_mm"]
    if palm_pattern:
        collar = cut_vertical_holes(collar, palm_pattern,
                                    P["new_joint_hole_diameter_mm"],
                                    height - 4.0, 6.0)
    return collar


def build_electronics_base() -> tuple[cq.Workplane, cq.Workplane, cq.Workplane]:
    width, depth, height = P["electronics_base_mm"]
    wall = P["electronics_wall_mm"]
    inner_w, inner_d = width - 2 * wall, depth - 2 * wall
    outer = cq.Workplane("XY").box(width, depth, height).edges("|Z").fillet(
        P["electronics_corner_radius_mm"]).translate((0.0, 0.0, height / 2.0))
    cavity = box(inner_w, inner_d, height - 2 * wall, z=height / 2.0)
    body = outer.cut(cavity)

    # Large +Y service opening makes the board, regulator and cable route reachable.
    service_w, service_h = P["electronics_service_opening_mm"]
    service_margin = P["electronics_service_end_margin_mm"]
    opening = box(service_w, wall + 4.0, height - 2 * service_margin,
                  y=depth / 2.0 - wall / 2.0, z=height / 2.0)
    body = body.cut(opening)

    # Cable throat is deliberately offset behind the board envelope. It joins
    # the hollow forearm to the electronics bay without a moving cable panel.
    throat_w, throat_d = P["cable_chute_mm"]
    throat = box(throat_w, throat_d, wall + 8.0,
                 y=P["cable_chute_center_y_mm"], z=height - wall / 2.0)
    body = body.cut(throat)

    # New base-to-arm bolt pattern. These holes belong only to this new design.
    top_ring = rectangular_ring(64.0, 54.0, 4.0, throat_w, throat_d,
                                height - 2.0)
    top_ring = cut_vertical_holes(top_ring, bolt_centres(),
                                  P["new_joint_hole_diameter_mm"],
                                  height - 5.0, 6.0)
    body = body.union(top_ring)
    body = cut_vertical_holes(body, bolt_centres(),
                               P["new_joint_hole_diameter_mm"],
                               height - 5.0, 6.0)

    # The removable-by-screw cover is fixed in use (not a sliding drawer) and
    # is also the USB panel. The connector opening remains parameter-gated.
    cover_w = width - 8.0
    cover_h = height - 2 * service_margin + 4.0
    cover_t = 3.0
    cover = box(cover_w, cover_t, cover_h,
                y=depth / 2.0 + 0.8, z=height / 2.0)
    cover_hole_x = [-cover_w / 2 + 7.0, cover_w / 2 - 7.0]
    cover_hole_z = [service_margin + 4.0, height - service_margin - 4.0]
    for x in cover_hole_x:
        for z in cover_hole_z:
            boss = cylinder(4.2, wall,
                            (x, depth / 2.0 - wall, z), (0.0, 1.0, 0.0))
            body = body.union(as_workplane(boss))
            pilot = cylinder(1.35, wall + 1.0,
                             (x, depth / 2.0 - wall - 0.5, z),
                             (0.0, 1.0, 0.0))
            body = body.cut(as_workplane(pilot))
            cover = cover.cut(cylinder(1.7, cover_t + 2.0,
                                       (x, depth / 2.0 - 1.0, z), (0.0, 1.0, 0.0)))
    cutout = P["usb_cutout_center_on_panel_mm"]
    cutout_w, cutout_h = P["usb_cutout_width_mm"], P["usb_cutout_height_mm"]
    if P["usb_cutout_enabled"] and cutout and cutout_w and cutout_h:
        usb = box(cutout_w, cover_t + 2.0, cutout_h,
                  x=cutout[0], y=depth / 2.0 + 0.8, z=height / 2.0 + cutout[1])
        cover = cover.cut(usb)

    # Universal carrier with tie slots: independent of unverified PCB holes.
    carrier_w, carrier_t, carrier_h = P["electronics_carrier_mm"]
    carrier = box(carrier_w, carrier_t, carrier_h,
                  x=P["electronics_carrier_center_x_mm"],
                  y=P["electronics_carrier_center_y_mm"],
                  z=P["electronics_carrier_center_z_mm"])
    slot_w, slot_h = P["carrier_tie_slot_mm"]
    for x_off in P["carrier_tie_slot_centres_x_mm"]:
        for z in P["carrier_tie_slot_centres_z_mm"]:
            slot = box(slot_w, carrier_t + 2.0, slot_h,
                       x=P["pcb_center_x_mm"] + x_off,
                       y=P["electronics_carrier_center_y_mm"], z=z)
            carrier = carrier.cut(slot)

    return body, cover, carrier


def board_reference() -> tuple[cq.Workplane, cq.Workplane]:
    """Non-printable, dimensioned/provisional component envelopes for the view."""
    pcb_w, pcb_l = P["pcb_outline_mm"]
    pcb = box(pcb_w, P["pcb_component_depth_mm"], pcb_l,
              x=P["pcb_center_x_mm"], y=P["pcb_center_y_mm"],
              z=P["electronics_base_mm"][2] / 2.0)
    reg_w, reg_d, reg_h = P["regulator_envelope_mm"]
    reg_x, reg_y, reg_z = P["regulator_center_mm"]
    regulator = box(reg_w, reg_d, reg_h, x=reg_x, y=reg_y, z=reg_z)
    return pcb, regulator


def print_orientations(parts: dict[str, cq.Workplane]) -> dict[str, cq.Workplane]:
    # Broad longitudinal split faces lie on the build plate for the arm halves.
    left = parts["forearm_left"].rotate((0, 0, 0), (0, 1, 0), 90)
    right = parts["forearm_right"].rotate((0, 0, 0), (0, 1, 0), -90)
    left = normalize_to_bed(left)
    right = normalize_to_bed(right)

    # The electronics pod is laid on its service opening to keep the cavity free
    # of internal support. The access cover and carrier print flat.
    body = normalize_to_bed(
        parts["electronics_base"].rotate((0, 0, 0), (1, 0, 0), -90))
    cover = normalize_to_bed(
        parts["electronics_service_cover"].rotate((0, 0, 0), (1, 0, 0), -90))
    carrier = normalize_to_bed(
        parts["electronics_carrier"].rotate((0, 0, 0), (1, 0, 0), -90))

    return {
        "forearm_left": left,
        "forearm_right": right,
        "electronics_base": body,
        "electronics_service_cover": cover,
        "electronics_carrier": carrier,
        "wrist_collar": normalize_to_bed(parts["wrist_collar"]),
    }


def normalize_to_bed(part: cq.Workplane) -> cq.Workplane:
    """Translate a print-oriented part so its minimum X/Y/Z is at the origin."""
    bb = part.val().BoundingBox()
    return part.translate((-bb.xmin, -bb.ymin, -bb.zmin))


def render_assembly_png(parts: dict[str, cq.Workplane], out_path: Path) -> None:
    """Create an exploded isometric reference image; it is not a fit proof."""
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    from mpl_toolkits.mplot3d.art3d import Poly3DCollection

    base_h = P["electronics_base_mm"][2]
    forearm_z = base_h
    collar_z = base_h + P["forearm_length_mm"]
    pcb, regulator = board_reference()
    # Pull the fixed service panel outward in this view so the electronics
    # envelopes and rear cable path are visible without changing the CAD fit.
    components = [
        (parts["electronics_base"], (0, 0, 0), "#a7b0b5"),
        (parts["electronics_service_cover"], (0, 26, 0), "#d0d5d7"),
        (parts["electronics_carrier"], (0, 0, 0), "#738b67"),
        (pcb, (0, 58, 0), "#168447"),
        (regulator, (0, 58, 0), "#e0a23f"),
        (parts["forearm_left"], (0, 0, forearm_z), "#c4c9cc"),
        (parts["forearm_right"], (0, 0, forearm_z), "#9ea8ad"),
        (parts["wrist_collar"], (0, 0, collar_z), "#d7d9da"),
    ]
    fig = plt.figure(figsize=(9, 11), dpi=150)
    ax = fig.add_subplot(111, projection="3d")
    all_points = []
    for part, offset, color in components:
        moved = part.val().moved(cq.Location(cq.Vector(*offset)))
        vertices, triangles = moved.tessellate(0.6)
        points = [vertex.toTuple() for vertex in vertices]
        all_points.extend(points)
        faces = [[points[index] for index in triangle] for triangle in triangles]
        ax.add_collection3d(Poly3DCollection(
            faces, facecolors=color, edgecolors=(0.05, 0.07, 0.08, 0.06),
            linewidths=0.06, alpha=0.96, zsort="average"))

    lows = [min(point[i] for point in all_points) for i in range(3)]
    highs = [max(point[i] for point in all_points) for i in range(3)]
    centres = [(lows[i] + highs[i]) / 2 for i in range(3)]
    spans = [highs[i] - lows[i] for i in range(3)]
    radius = max(spans) / 2
    ax.set_xlim(centres[0] - radius, centres[0] + radius)
    ax.set_ylim(centres[1] - radius, centres[1] + radius)
    ax.set_zlim(lows[2], highs[2])
    ax.set_box_aspect((spans[0], spans[1], spans[2]))
    ax.view_init(elev=16, azim=45)
    ax.set_axis_off()
    fig.suptitle("TUKI V2N/A1 Mini · arm redesign v1\nExploded electronics view · hand omitted, palm interface pending", fontsize=12)
    fig.tight_layout()
    fig.savefig(out_path, bbox_inches="tight", facecolor="white")
    plt.close(fig)


def assert_solid(name: str, part: cq.Workplane) -> None:
    shape = part.val()
    if not shape.isValid():
        raise ValueError(f"{name}: invalid B-rep")
    if len(shape.Solids()) != 1:
        raise ValueError(f"{name}: expected one connected solid; got {len(shape.Solids())}")


def export_outputs(parts: dict[str, cq.Workplane]) -> dict:
    CAD_OUT.mkdir(parents=True, exist_ok=True)
    FOREARM_OUT.mkdir(parents=True, exist_ok=True)
    ELECTRONICS_OUT.mkdir(parents=True, exist_ok=True)

    destination = {
        "wrist_collar": (FOREARM_OUT, "01_wrist_collar_v1"),
        "forearm_left": (FOREARM_OUT, "02_forearm_left_v1"),
        "forearm_right": (FOREARM_OUT, "03_forearm_right_v1"),
        "electronics_base": (ELECTRONICS_OUT, "04_electronics_base_v1"),
        "electronics_service_cover": (ELECTRONICS_OUT, "05_electronics_service_cover_usb_panel_v1"),
        "electronics_carrier": (ELECTRONICS_OUT, "06_electronics_carrier_v1"),
    }
    report_parts = {}
    print_parts = print_orientations(parts)
    max_print = P["print_volume_mm"]

    for name, (folder, stem) in destination.items():
        part = parts[name]
        assert_solid(name, part)
        cq.exporters.export(part, str(CAD_OUT / f"{stem}.step"))
        oriented = print_parts[name]
        assert_solid(f"{name} print orientation", oriented)
        bb = oriented.val().BoundingBox()
        extents = [round(bb.xlen, 2), round(bb.ylen, 2), round(bb.zlen, 2)]
        if any(extents[i] > max_print[i] for i in range(3)):
            raise ValueError(f"{stem}: exceeds A1 Mini envelope: {extents}")
        cq.exporters.export(oriented, str(folder / f"{stem}.stl"),
                            tolerance=0.08, angularTolerance=0.12)
        report_parts[stem] = {
            "stl": str(folder / f"{stem}.stl"),
            "step": str(CAD_OUT / f"{stem}.step"),
            "print_extents_mm": extents,
            "valid_single_solid": True,
            "physical_fit_status": "not tested",
        }

    assembly = cq.Assembly(name="TUKI_V2N_Arm_V1_Concept")
    base_z = P["electronics_base_mm"][2]
    arm_z = base_z
    collar_z = base_z + P["forearm_length_mm"]
    assembly.add(parts["electronics_base"], name="ElectronicsBase", loc=cq.Location(), color=cq.Color(0.24, 0.28, 0.32))
    assembly.add(parts["electronics_service_cover"], name="FixedServiceCover_USB_CutoutPending", loc=cq.Location(), color=cq.Color(0.38, 0.43, 0.47))
    assembly.add(parts["electronics_carrier"], name="BoardCarrier_TieSlots", loc=cq.Location(), color=cq.Color(0.35, 0.52, 0.32))
    assembly.add(parts["forearm_left"], name="ForearmLeft", loc=cq.Location(cq.Vector(0, 0, arm_z)), color=cq.Color(0.68, 0.71, 0.72))
    assembly.add(parts["forearm_right"], name="ForearmRight", loc=cq.Location(cq.Vector(0, 0, arm_z)), color=cq.Color(0.55, 0.6, 0.63))
    assembly.add(parts["wrist_collar"], name="WristCollar_PalmPatternPending", loc=cq.Location(cq.Vector(0, 0, collar_z)), color=cq.Color(0.78, 0.8, 0.81))
    pcb, regulator = board_reference()
    assembly.add(pcb, name="FRDM_RW612_130x55_Envelope_Reference_NotPrint", loc=cq.Location(), color=cq.Color(0.12, 0.38, 0.22))
    assembly.add(regulator, name="Regulator_Envelope_Provisional_NotPrint", loc=cq.Location(), color=cq.Color(0.78, 0.48, 0.1))
    assembly.save(str(CAD_OUT / "00_tuki_v2n_arm_v1_assembly.step"), exportType="STEP")
    render_assembly_png(parts, CAD_OUT / "00_tuki_v2n_arm_v1_assembly.png")
    report = {
        "iteration": "V2N/A1 Mini arm architecture v1",
        "source": Path(__file__).name,
        "units": "mm",
        "a1_mini_build_volume_mm": max_print,
        "reference_board": {
            "model": P["pcb_model"],
            "published_pcb_outline_mm": P["pcb_outline_mm"],
            "height_and_connector_positions": "unconfirmed; envelope only",
            "reference": "NXP FRDM-RW612 Board User Manual UM12160, PCB 130 x 55 mm",
        },
        "unconfirmed": [
            "V2N palm mating datum and attachment-hole pattern; collar top face is unperforated",
            "actual regulator model/envelope and mounting points",
            "FRDM-RW612 component height, board orientation and USB-C connector position",
            "printed hand-to-collar fit, structural loads, cable strain relief and tolerances",
        ],
        "printed_bed_compatibility": {
            "CAMA_00": "test coupons only; new design does not alter or reuse them",
            "CAMA_01": "already-printed palm/thumb/index bed left untouched; its bed layout is not an assembly datum",
            "palm_to_collar": "not confirmed; collar top has no guessed hole pattern",
            "basis": "TUKI_A1_MINI_STL_REVISADOS_ORIENTACION_TORNILLOS.zip LEEME_PRIMERO.md",
        },
        "battery": "not reserved",
        "existing_hand": "unchanged; no V2N hand STL or active GLB is imported or overwritten",
        "usb_panel": "fixed screw-on service panel; USB opening intentionally disabled until measured",
        "assembly_step": str(CAD_OUT / "00_tuki_v2n_arm_v1_assembly.step"),
        "assembly_png_preview": str(CAD_OUT / "00_tuki_v2n_arm_v1_assembly.png"),
        "parts": report_parts,
    }
    return report


def main() -> None:
    print("Building the tapered forearm and wrist collar...", flush=True)
    left, right = build_forearm_halves()
    print("Building the electronics housing, service cover and carrier...", flush=True)
    body, cover, carrier = build_electronics_base()
    parts = {
        "wrist_collar": build_wrist_collar(),
        "forearm_left": left,
        "forearm_right": right,
        "electronics_base": body,
        "electronics_service_cover": cover,
        "electronics_carrier": carrier,
    }
    print("Validating solids and exporting final STEP/STL files and assembly view...", flush=True)
    report = export_outputs(parts)
    print(json.dumps(report, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
