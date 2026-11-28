"""Audit V4 STEP solids in assembly coordinates (mm) using CadQuery 2.8."""
import argparse
import hashlib
from itertools import combinations
import json
from pathlib import Path
from zipfile import ZipFile

import cadquery as cq


PART_IDS = ("01", "02", "03", "04", "05", "06", "10")
HINGES = {"02": (-61.5, 0, 21), "05": (-62, 0, 27)}
AXES = [(-30 + 15 * i, -168 + 31 * i) for i in range(5)]
WRIST_X = (-36, -25.5, -8.5, 9, 26.5)
MOUNTS = [(x, y) for y in (-185, -118, -64) for x in (-43, 43)]


def cylinder(radius, height, origin, direction=(0, 0, 1)):
    return cq.Solid.makeCylinder(radius, height, cq.Vector(*origin), cq.Vector(*direction))


def box(size, center):
    return cq.Workplane("XY").box(*size).translate(center).val()


def hardware():
    # Screening envelopes, in mm. Ear sizes, groove height and cables
    # are assumptions pending measurement on the five physical assemblies.
    for i, (x, y) in enumerate(AXES, 1):
        body_y = y - 5.25
        yield f"S{i}:body", box((12.2, 22.7, 23), (x, body_y, -21.2))
        ears = box((12.2, 32, 2), (x, body_y, -8.7))
        ears = ears.cut(box((12.2, 22.7, 4), (x, body_y, -8.7)))
        for dy in (-14.1, 14.1):
            ears = ears.cut(cylinder(1.1, 4, (x, body_y + dy, -11)))
        yield f"S{i}:ears", ears
        for side, dy in enumerate((-14.1, 14.1), 1):
            yield f"S{i}:head{side}", cylinder(2, 1.8, (x, body_y + dy, -7.7))
        yield f"S{i}:pulley", cylinder(14, 6, (x, y, 2.85))
        yield f"S{i}:cable", box((5, 10, 6), (x, body_y - 15, -27))
    for i, (x, y) in enumerate(MOUNTS, 1):
        yield f"M{i}:head", cylinder(3, 2.5, (x, y, -9.7))
        yield f"M{i}:driver", cylinder(3.5, 35, (x, y, -7.2))


def intersect(first, second):
    a, b = first.BoundingBox(), second.BoundingBox()
    if any(getattr(a, axis + "max") < getattr(b, axis + "min") or
           getattr(b, axis + "max") < getattr(a, axis + "min") for axis in "xyz"):
        return None
    common = first.intersect(second)
    volume = sum(s.Volume() for s in common.Solids())
    if volume <= 0.0001:
        return None
    return {"mm3": round(volume, 6), "center_xyz_mm": list(common.Center().toTuple())}


def compare(pairs, errors):
    records = []
    for key_a, a, key_b, b in pairs:
        try:
            overlap = intersect(a, b)
        except Exception as exc:
            errors.append({"pair": [key_a, key_b], "error": repr(exc)})
            continue
        if overlap:
            records.append({"pair": [key_a, key_b], **overlap})
    return records


def load(archive, out):
    parts = {}
    with ZipFile(archive) as source:
        for part in PART_IDS:
            entry, = [n for n in source.namelist()
                      if "STEP_7_PIEZAS/" in n and Path(n).name.startswith(part + "_")
                      and n.lower().endswith(".step")]
            filename = out / Path(entry).name
            filename.write_bytes(source.read(entry))
            parts[part] = cq.importers.importStep(str(filename)).val()
            if len(parts[part].Solids()) != 1 or not parts[part].isValid():
                raise ValueError(f"Invalid structural STEP: {filename}")
    return parts


def door_sweep(parts, proxies, step, angle, errors):
    collisions = []
    angles = sorted({0, angle, *range(0, angle, step)})
    fixed = {k: v for k, v in parts.items() if k not in HINGES}
    obstacles = {**fixed, **{k: v for k, v in proxies.items() if not k.endswith(":driver")}}
    for degrees in angles:
        moving = {door: parts[door].rotate(pivot, (pivot[0], 1, pivot[2]), -degrees)
                  for door, pivot in HINGES.items()}
        pairs = [(name, shape, k, obstacle) for name, shape in moving.items()
                 for k, obstacle in obstacles.items()]
        # Rotation preserves Y, so disjoint Y intervals also exclude collisions
        # for independently positioned doors. Otherwise sample all angle pairs.
        for hit in compare(pairs, errors):
            collisions.append({"open_deg": degrees, **hit})
    first, second = (parts[k].BoundingBox() for k in HINGES)
    gap = max(first.ymin - second.ymax, second.ymin - first.ymax)
    if gap <= 0:
        upper, lower = HINGES.items()
        for a in angles:
            upper_shape = parts[upper[0]].rotate(upper[1], (upper[1][0], 1, upper[1][2]), -a)
            for b in angles:
                lower_shape = parts[lower[0]].rotate(lower[1], (lower[1][0], 1, lower[1][2]), -b)
                for hit in compare([(upper[0], upper_shape, lower[0], lower_shape)], errors):
                    collisions.append({"upper_deg": a, "lower_deg": b, **hit})
    return {"sample_angles_deg": angles, "door_y_gap_mm": gap, "overlaps": collisions}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("archive", type=Path)
    parser.add_argument("out", type=Path)
    parser.add_argument("--step-deg", type=int, default=5)
    parser.add_argument("--open-deg", type=int, default=110)
    args = parser.parse_args()
    if not 1 <= args.step_deg <= args.open_deg <= 180:
        parser.error("Require 1 <= step-deg <= open-deg <= 180")
    args.out.mkdir(parents=True, exist_ok=True)
    parts = load(args.archive, args.out)
    proxies = dict(hardware())
    errors = []
    structural = compare(((a, sa, b, sb) for (a, sa), (b, sb) in
                          combinations(parts.items(), 2)), errors)
    proxy_pairs = ((a, sa, b, sb) for (a, sa), (b, sb) in combinations(
        {**parts, **proxies}.items(), 2) if b in proxies and
        a.split(":")[0] != b.split(":")[0] and
        not (a.endswith(":driver") and b.endswith(":driver")))
    report = {
        "archive_sha256": hashlib.sha256(args.archive.read_bytes()).hexdigest(),
        "threshold_mm3": 0.0001,
        "closed_structure": structural,
        "nominal_hardware_and_driver": compare(proxy_pairs, errors),
        "doors": door_sweep(parts, proxies, args.step_deg, args.open_deg, errors),
        "axis_aligned_print_dimensions_mm": {
            k: [s.BoundingBox().xlen, s.BoundingBox().ylen, s.BoundingBox().zlen]
            for k, s in parts.items()},
        "boolean_errors": errors,
        "physical_fit_established": False,
    }
    (args.out / "baseline.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    print("Baseline written", args.out / "baseline.json", "Boolean errors:", len(errors))


if __name__ == "__main__":
    main()
