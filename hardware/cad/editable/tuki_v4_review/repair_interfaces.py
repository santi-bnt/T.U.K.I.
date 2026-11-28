"""V4 local reliefs for obstructed hinge bores and the M3-05 nut."""

from audit_v4 import HINGES, compare, cylinder
from OCP.BRepAdaptor import BRepAdaptor_Surface
HINGE_PARTS = {"02": ("01", "02", -142, -28), "05": ("04", "05", -262, -166)}


def repair(parts, pins, errors):
    corrected = dict(parts)
    details = {"bores": {}, "nut_pocket": {}}
    for door, (body, leaf, y_min, y_max) in HINGE_PARTS.items():
        x, _, z = HINGES[door]
        for part in (body, leaf):
            original = parts[part]
            radius_faces = []
            for face in original.Faces():
                if face.geomType() != "CYLINDER":
                    continue
                surface = BRepAdaptor_Surface(face.wrapped).Cylinder()
                center = surface.Location()
                if abs(center.X() - x) < 1e-5 and abs(center.Z() - z) < 1e-5:
                    radius_faces.append(round(surface.Radius() * 2, 5))
            blockages = compare([
                (f"axial_{y}", cylinder(1.5, 1, (x, y, z), (0, 1, 0)), part, original)
                for y in range(y_min, y_max)
            ], errors)
            tool = cylinder(1.75, y_max - y_min + 2, (x, y_min - 1, z), (0, 1, 0))
            corrected[part] = original.cut(tool).clean()
            details["bores"][part] = {
                "retained_cylindrical_surfaces_original_diameters_mm": radius_faces,
                "axial_obstructions_original_1mm_slices": blockages,
                "new_cut_diameter_mm": 3.5,
                "nominal_radial_pin_clearance_mm": .25,
                "nominal_circular_barrel_wall_mm": 2.45,
                "axis_xz_mm": [x, z],
                "removed_mm3": original.Volume() - corrected[part].Volume(),
            }
    # The nut remains in the original M3 hole and is fitted before the plate
    # enters the housing. The relief only clears its complete installed volume.
    before = corrected["01"]
    corrected["01"] = before.cut(cylinder(3.65, 3.3, (36, -72, -16.2))).clean()
    details["nut_pocket"] = {"center_xy_mm": [36, -72], "diameter_mm": 7.3,
                             "z_range_mm": [-16.2, -12.9],
                             "removed_mm3": before.Volume() - corrected["01"].Volume()}
    for part in ("01", "02", "04", "05"):
        if not corrected[part].isValid() or len(corrected[part].Solids()) != 1:
            raise ValueError(f"Repair did not preserve a valid single solid: {part}")
    return corrected, details


def place_caps(cap):
    # The measured opening is at local Z=3.8. Leave its mouth 0.6 mm
    # outside the barrel face and engage the pin by 2.4 mm.
    caps = {}
    for door, (_, _, lo, hi) in HINGE_PARTS.items():
        x, _, z = HINGES[door]
        caps[f"cap_{door}_lo"] = cap.rotate((0, 0, 0), (1, 0, 0), -90).translate((x, lo - 1.4, z))
        caps[f"cap_{door}_hi"] = cap.rotate((0, 0, 0), (1, 0, 0), 90).translate((x, hi + 1.4, z))
    return caps
