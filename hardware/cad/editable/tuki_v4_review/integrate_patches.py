"""Assemble the supplied V4 patches and record nominal solid interferences."""

import argparse
from io import BytesIO
from itertools import combinations
import json
import math
from pathlib import Path
from zipfile import ZipFile

import cadquery as cq

from audit_v4 import AXES, HINGES, WRIST_X, compare, cylinder, door_sweep, hardware
from revise_v4 import Z, route


PULLEY = "TUKI_POLEA_28MM_EJE_5MM_PASO_HILO_2MM_ANTICIERRE"
PINS = ["TUKI_V4_PASADOR_SUPERIOR_ANTEBRAZO_D3p0_L114",
        "TUKI_V4_PASADOR_INFERIOR_GABINETE_D3p0_L96"]
BED = "TUKI_V4_PLACA_2_PASADORES_8_TAPAS_A1_MINI"
COUPONS = ["CUPON_PASO_HILO_1p6_1p8_2p0",
           "CUPON_PRUEBA_SG90_DOS_ABRAZADERAS_M3", "TUKI_V4_TEST_AJUSTE_PASADOR_D3p0_L18"]
REPLACEMENTS = {"01": "01_ANTEBRAZO_ESTILIZADO_HUECO_ACCESOS_D8",
                "02": "02_PUERTA_ANTEBRAZO_ABATIBLE_ACCESOS_D8",
                "06": "06_PLACA_V4_DIAGONAL_5_SG90_M3"}


def read_entry(archive, filename):
    entry, = [x for x in archive.namelist() if Path(x).name == filename]
    return archive.read(entry)


def extract_inputs(delivery, baseline, out):
    imported = {}
    with ZipFile(delivery) as archive:
        for entry in archive.namelist():
            if not entry.endswith(".zip"):
                continue
            with ZipFile(BytesIO(archive.read(entry))) as patch:
                for name in patch.namelist():
                    file = Path(name)
                    if file.suffix in (".step", ".stl", ".py", ".json"):
                        if file.name in imported:
                            raise ValueError(f"Duplicate patch input: {file.name}")
                        imported[file.name] = patch.read(name)
    spec = json.loads(imported["AUDITORIA_M3.json"])["centros_huecos"]
    clips = ["ABRAZADERA_M3_" + entry["name"] for entry in spec]
    assert len(clips) == len(set(clips)) == 10
    names = dict(REPLACEMENTS)
    with ZipFile(baseline) as archive:
        for part in ("03", "04", "05", "10"):
            stem, = [Path(x).stem for x in archive.namelist()
                     if x.endswith(".stl") and Path(x).name.startswith(part + "_")]
            names[part] = stem
            for ext in (".stl", ".step"):
                imported[stem + ext] = read_entry(archive, stem + ext)
        for name in ("audit_v4.py", "revise_v4.py"):
            imported[name] = read_entry(archive, name)
    selections = {
        "STL": list(names.values()) + clips + [PULLEY, BED],
        "STEP": list(names.values()) + clips + [PULLEY] + PINS + ["TUKI_V4_TAPA_PRESION_AGUJERO_D2p95"],
        "PRUEBAS": COUPONS,
    }
    for directory, stems in selections.items():
        ext = ".step" if directory == "STEP" else ".stl"
        (out / directory).mkdir()
        for stem in stems:
            (out / directory / (stem + ext)).write_bytes(imported[stem + ext])
    (out / "CAD").mkdir()
    for name, data in imported.items():
        if name.endswith(".py"):
            (out / "CAD" / name).write_bytes(data)
    (out / "VALIDACION").mkdir()
    for name in ("AUDITORIA_M3.json", "VALIDACION_ACCESOS.json", "VERIFICACION.json",
                 "geometria.json", "ensayo_hilo_036.json"):
        (out / "VALIDACION" / name).write_bytes(imported[name])
    return names, spec, clips


def lead_to_wrist(x, y, exit_x, groove_radius, lane_inset=0):
    """Preserve the guide centerline. Join it with a strand from the actual groove."""
    lane = x - 14 + (3 if x == AXES[0][0] else 0)
    mouth = cq.Vector(lane + lane_inset, -26, Z)
    dx, dy = mouth.x - x, mouth.y - y
    r = groove_radius
    distance_sq = dx * dx + dy * dy
    normal = r * math.sqrt(distance_sq - r*r) / distance_sq
    tangent = cq.Vector(x + dx*r*r/distance_sq - dy*normal,
                        y + dy*r*r/distance_sq + dx*normal, Z)
    delta = mouth - tangent
    strand = cq.Wire.makeCircle(.18, tangent, delta)
    return cq.Solid.sweep(strand, [], cq.Wire.assembleEdges([cq.Edge.makeLine(tangent, mouth)]),
                          makeSolid=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("delivery", type=Path)
    parser.add_argument("baseline_zip", type=Path)
    parser.add_argument("out", type=Path)
    parser.add_argument("--repair", action="store_true")
    args = parser.parse_args()
    out = args.out
    out.mkdir(parents=True, exist_ok=False)
    names, spec, clips = extract_inputs(args.delivery, args.baseline_zip, out)

    def load(name):
        shape = cq.importers.importStep(str(out / "STEP" / (name + ".step"))).val()
        if not shape.isValid() or len(shape.Solids()) != 1:
            raise ValueError(f"Invalid solid: {name}")
        return shape

    parts = {key: load(name) for key, name in names.items()}
    clamps = {key: load(key).rotate((0, 0, 0), (1, 0, 0), 180)
              .translate((0, 0, -3.9)) for key in clips}
    pins = {}
    for (door, pivot), name, start in zip(HINGES.items(), PINS, (-142, -262)):
        pins["pin_" + door] = load(name).rotate((0, 0, 0), (0, 0, 1), 90).translate(
            (pivot[0], start, pivot[2] - 1.5))
    errors = []
    repair_details = {}
    caps = {}
    if args.repair:
        from repair_interfaces import repair, place_caps
        parts, repair_details = repair(parts, pins, errors)
        caps = place_caps(load("TUKI_V4_TAPA_PRESION_AGUJERO_D2p95"))
        for key in ("01", "02", "04", "05"):
            old = names[key]
            stem = old + "_R1"
            cq.exporters.export(parts[key], str(out / "STEP" / (stem + ".step")))
            cq.exporters.export(parts[key], str(out / "STL" / (stem + ".stl")),
                                tolerance=.08, angularTolerance=.14)
            (out / "STEP" / (old + ".step")).unlink()
            (out / "STL" / (old + ".stl")).unlink()
    pulley = load(PULLEY)
    # Align the supplied pulley's radial bore height to the V4 guide plane.
    pulleys = {f"P{i}": pulley.translate((x, y, Z - 4.12))
               for i, (x, y) in enumerate(AXES, 1)}
    hardware_shapes = {k: s for k, s in hardware()
                       if k.endswith((":body", ":cable", ":ears")) or k.startswith("M")}
    drivers = {k: s for k, s in hardware_shapes.items() if k.endswith(":driver")}
    installed = {k: s for k, s in hardware_shapes.items() if k not in drivers}
    fasteners = {}
    for item in spec:
        name = item["name"]
        x, y = item["anchor"]
        fasteners[f"head_{name}"] = cylinder(2.85, 3, (x, y, -3.9))
        fasteners[f"shaft_{name}"] = cylinder(1.5, 12, (x, y, -15.9))
        fasteners[f"nut_{name}"] = cq.Workplane("XY").polygon(6, 6.35).extrude(2.4).translate(
            (x, y, -15.3)).val()
    objects = {**parts, **clamps, **pins, **pulleys, **installed, **fasteners}
    pairs = ((a, sa, b, sb) for (a, sa), (b, sb) in combinations(objects.items(), 2)
             if not (a.startswith("S") and a.split(":")[0] == b.split(":")[0])
             and not (a.startswith("shaft_") and b == "nut_" + a.removeprefix("shaft_")))
    static = compare(pairs, errors)
    obstacles = {**clamps, **pins, **pulleys, **installed, **fasteners, **caps}
    strands = {f"T{i}": lead_to_wrist(x, y, exit_x, 11.68)
               for i, ((x, y), exit_x) in enumerate(zip(AXES, WRIST_X), 1)}
    doors = door_sweep(parts, {**obstacles, **strands}, 5, 110, errors)
    tendon_hits = compare([(t, s, k, obj) for t, s in strands.items()
                           for k, obj in objects.items() if k != "P" + t[1:]], errors)
    route_hits = []
    if args.repair:
        guide_strands = {f"T{i}": route(x, y, exit_x, .18) for i, ((x, y), exit_x)
                         in enumerate(zip(AXES, WRIST_X), 1)}
        guide_strands = {k: s.intersect(cq.Workplane("XY").box(150, 28, 30)
                                       .translate((0, -12, Z)).val())
                         for k, s in guide_strands.items()}
        route_hits = compare([
            (t, s, k, obj) for t, s in guide_strands.items() for k, obj in objects.items()
        ] + [(a, sa, b, sb) for (a, sa), (b, sb) in combinations(strands.items(), 2)], errors)
    access = compare([(k, s, name, solid) for k, s in drivers.items() if k in ("M3:driver", "M4:driver")
                      for name, solid in {**parts, **clamps, **strands}.items()], errors)
    pin_insert = compare([(f"{key}_from_minus_Y_{offset}mm", solid.translate((0, -offset, 0)),
                           other, parts[other])
                          for key, solid in pins.items() for offset in range(0, 116, 5)
                          for other in ({"pin_02": ("01", "02"), "pin_05": ("04", "05")}[key])], errors)
    cap_hits = compare([(k, s, other, obj) for k, s in caps.items()
                        for other, obj in objects.items() if other != "pin_" + k[4:6]], errors)
    cap_engagement = compare([(k, s, "pin_" + k[4:6], pins["pin_" + k[4:6]])
                              for k, s in caps.items()], errors)
    clamp_tools = compare([(f"driver_{item['name']}", cylinder(3.5, 35, (*item["anchor"], -.9)),
                            k, s) for item in spec
                           for k, s in {**parts, **pulleys, **clamps}.items()
                           if k not in HINGES], errors)
    assembly = cq.Assembly(name="TUKI_V4_A1_MINI_CANDIDATO")
    for key, shape in {**parts, **clamps, **pins, **pulleys}.items():
        assembly.add(shape, name=f"pieza_{key}")
    assembly.export(str(out / "STEP" / "TUKI_V4_A1_MINI_ENSAMBLADO.step"))
    result = {
        "static_overlaps": static, "door_sweep": doors, "tendon_lead_overlaps": tendon_hits,
        "d8_driver_overlaps": access, "pin_insertion_overlaps_sampled": pin_insert,
        "clamp_tool_overlaps_doors_removed": clamp_tools,
        "guide_and_neighbor_thread_overlaps": route_hits,
        "retention_caps_closed_overlaps_excluding_press_fit": cap_hits,
        "retention_cap_press_fit_nominal_overlaps": cap_engagement,
        "d8_driver_overlaps_T1_removed_for_service": [r for r in access if "T1" not in r["pair"]],
        "minimum_nominal_z_clearance_M3_head_to_pulley_mm": round(1.73 - (-.9), 3),
        "repair": repair_details,
        "boolean_errors": errors, "assembly_printed_solids": 24,
        "nominal_groove_thread_center_radius_mm": 11.68,
        "pulley_rotation_at_static_check_deg": 0,
        "physical_validation": False,
    }
    (out / "VALIDACION" / "integracion.json").write_text(json.dumps(result, indent=2), encoding="utf8")
    print("Audit counts:", {k: len(v) for k, v in result.items() if isinstance(v, list)})


if __name__ == "__main__":
    main()
