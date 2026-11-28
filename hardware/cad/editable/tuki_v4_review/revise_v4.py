"""Build and audit a provisional V4 wrist with integrated tendon channels."""
import argparse
import hashlib
from itertools import combinations
import json
import math
from pathlib import Path

import cadquery as cq

from audit_v4 import AXES, HINGES, WRIST_X, box, compare, hardware, load


Z = 5.85  # Nominal wrist entry and groove center. Measure actual installed pulleys.
FAN_START = -24
FAN_END = -5
TENDON_RADIUS = 0.8
BORE_RADIUS = 1.35


def route(x, y, exit_x, radius):
    """Sweep a circular profile through a straight exit and a tangent fan."""
    lane = x - 14 + (3 if x == AXES[0][0] else 0)
    b = cq.Vector(lane, FAN_START, Z)
    # Tangent from the negative-X side of the nominal winding circle to
    # the guide inlet. A tensioned free strand can follow this straight lead.
    dx, dy = lane - x, FAN_START - y
    distance_sq = dx * dx + dy * dy
    normal = 14 * math.sqrt(distance_sq - 14**2) / distance_sq
    a = cq.Vector(x + dx * 14**2 / distance_sq - dy * normal,
                  y + dy * 14**2 / distance_sq + dx * normal, Z)
    c, d = cq.Vector(exit_x, FAN_END, Z), cq.Vector(exit_x, 2, Z)
    slope = (b.x - a.x) / (b.y - a.y)
    edges = [cq.Edge.makeLine(a, b), smooth_offset(b, c, slope), cq.Edge.makeLine(c, d)]
    wire = cq.Wire.assembleEdges(edges)
    profile = cq.Wire.makeCircle(radius, a, b - a)
    return cq.Solid.sweep(profile, [], wire, makeSolid=True)


def smooth_offset(start, end, entry_slope):
    # Hermite curve with linear Y, preserving the entry and exit tangents.
    tangent = cq.Vector(0, (end.y - start.y) / 3, 0)
    return cq.Edge.makeBezier([start, start + tangent + cq.Vector(entry_slope * tangent.y, 0, 0),
                               end - tangent, end])


def revised_wrist(parts, bores):
    # The printed guide is integral with the wrist. Trim its roof to the outer
    # neck before joining so it cannot change the external assembly envelope.
    # The drill starts at the free-lumen entrance and exits at the wrist face.
    neck = parts["03"]
    web = box((97, 26, 17), (-1, -13, 11))
    # Trim the bridging web against the original outer envelope at each Y.
    # The upper limits are inside the CAD roof and still engage the web.
    limit = cq.Solid.makeLoft([
        cq.Wire.makePolygon([cq.Vector(x, y, z) for x, z in
                             [(-h, 2.5), (h, 2.5), (h, top), (-h, top)]], close=True)
        for y, h, top in [(-26, 48, 17.5), (-16, 44.5, 17.5),
                          (-8, 42, 16.2), (0, 41, 10.4)]
    ], ruled=True)
    wrist = neck.fuse(web.intersect(limit))
    for bore in bores:
        wrist = wrist.cut(bore)
    return wrist.clean()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("archive", type=Path)
    parser.add_argument("baseline", type=Path)
    parser.add_argument("out", type=Path)
    args = parser.parse_args()
    baseline = json.loads(args.baseline.read_text(encoding="utf-8"))
    if baseline["archive_sha256"] != hashlib.sha256(args.archive.read_bytes()).hexdigest():
        raise ValueError("Baseline does not belong to this archive")
    if baseline["boolean_errors"]:
        raise ValueError("Baseline has unresolved Boolean errors")
    args.out.mkdir(parents=True, exist_ok=False)
    parts = load(args.archive, args.out)
    provisional = {str(i): route(x, y, tx, TENDON_RADIUS)
                   for i, ((x, y), tx) in enumerate(zip(AXES, WRIST_X), 1)}
    bores = [route(x, y, tx, BORE_RADIUS) for (x, y), tx in zip(AXES, WRIST_X)]
    wrist = revised_wrist(parts, bores)
    obstacles = {**parts, **{k: v for k, v in hardware() if not k.endswith(":driver")}}
    errors = []
    pairs = [(f"T{i}", rope, k, solid) for i, rope in provisional.items()
             for k, solid in obstacles.items() if k != f"S{i}:pulley"]
    # Include each source pulley immediately after its nominal tangent zone.
    # The full coaxial source disk represents the groove as solid material.
    for i, ((x, y), tx) in enumerate(zip(AXES, WRIST_X), 1):
        region = box((200, 240, 40), (0, y + 126, Z))
        pairs.append((f"T{i}:after_wrap", provisional[str(i)].intersect(region),
                      f"S{i}:pulley", obstacles[f"S{i}:pulley"]))
    pairs.extend((f"T{i}", a, f"T{j}", b) for (i, a), (j, b) in
                 combinations(provisional.items(), 2))
    original_hits = compare(pairs, errors)
    parts["03"] = wrist
    final_hits = compare([(f"T{i}", rope, "03_revised", wrist)
                          for i, rope in provisional.items()], errors)
    solid_ok = wrist.isValid() and len(wrist.Solids()) == 1
    wrist_hits = compare([("03_revised", wrist, k, s) for k, s in parts.items()
                          if k != "03"], errors)
    remaining = [hit for hit in original_hits if hit["pair"][1] != "03"]
    # Compare the new material against every sampled door position.
    added = wrist.cut(obstacles["03"])
    door_hits = []
    for degrees in baseline["doors"]["sample_angles_deg"]:
        for key, pivot in HINGES.items():
            door = parts[key].rotate(pivot, (pivot[0], 1, pivot[2]), -degrees)
            for hit in compare([("wrist_added", added, key, door)] + [
                    (f"T{i}", rope, key, door) for i, rope in provisional.items()], errors):
                door_hits.append({"open_deg": degrees, **hit})
    report = {
        "wrist_valid_single_solid": solid_ok,
        "rope_center_z_mm_assumed": Z,
        "rope_radius_mm_assumed": TENDON_RADIUS,
        "channel_radius_mm": BORE_RADIUS,
        "minimum_fan_radius_mm_lanes_2_to_5": [
            round((FAN_END - FAN_START) ** 2 / (6 * abs(tx - x + 14 - (3 if x == -30 else 0))), 3)
            for (x, _), tx in list(zip(AXES, WRIST_X))[1:]],
        "original_obstacles": original_hits,
        "revised_wrist_vs_tendons": final_hits,
        "revised_wrist_vs_structure": wrist_hits,
        "doors_vs_tendons_or_added_material": door_hits,
        "boolean_errors": errors,
    }
    (args.out / "routing.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    if not solid_ok or remaining or final_hits or wrist_hits or door_hits or errors:
        print("Candidate has open CAD checks. See routing.json. No revised STL/STEP exported.")
        return 2
    name = args.out / "03_MUNECA_V4_GUIAS_PROTOTIPO"
    cq.exporters.export(wrist, str(name.with_suffix(".step")))
    cq.exporters.export(wrist, str(name.with_suffix(".stl")), tolerance=.08, angularTolerance=.14)
    assembly = cq.Assembly(name="TUKI_V4_GUIAS_PROTOTIPO")
    for part, solid in parts.items():
        assembly.add(solid, name="V4_" + part)
    assembly.export(str(args.out / "TUKI_V4_GUIAS_PROTOTIPO.step"))
    print("Prototype exported. See routing.json and baseline.json before manufacturing.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
