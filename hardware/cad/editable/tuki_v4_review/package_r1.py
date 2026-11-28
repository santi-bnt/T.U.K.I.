"""Package the V4 R1 audit output without mixing old and repaired STL/STEP."""

import argparse
from collections import Counter
from hashlib import sha256
import json
from pathlib import Path
import shutil
import struct
from zipfile import ZIP_DEFLATED, ZipFile


def mesh_inventory(data):
    count, = struct.unpack_from("<I", data, 80)
    if len(data) != 84 + count * 50:
        raise ValueError("Unexpected binary STL size")
    vertices = set()
    edges = Counter()
    for record in struct.iter_unpack("<12fH", data[84:]):
        triangle = [tuple(round(c, 4) for c in record[i:i + 3]) for i in (3, 6, 9)]
        vertices.update(triangle)
        for first, second in zip(triangle, triangle[1:] + triangle[:1]):
            edges[tuple(sorted((first, second)))] += 1
    dimensions = [round(max(axis) - min(axis), 4) for axis in zip(*vertices)]
    nonmanifold = sum(n != 2 for n in edges.values())
    if max(dimensions) > 180 or nonmanifold:
        raise ValueError(f"STL rejected: {dimensions}, bad edges: {nonmanifold}")
    return {"dimensions_mm": dimensions, "non_manifold_or_boundary_edges": nonmanifold}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("audit_folder", type=Path)
    parser.add_argument("final_zip", type=Path)
    parser.add_argument("backup_zip", type=Path)
    args = parser.parse_args()
    folder = args.audit_folder
    report = json.loads((folder / "VALIDACION/integracion.json").read_text(encoding="utf8"))
    if report["boolean_errors"]:
        raise ValueError("Resolve CAD operation errors before packaging")
    files = {p.relative_to(folder).as_posix(): p.read_bytes() for p in folder.rglob("*") if p.is_file()}
    script_dir = Path(__file__).resolve().parent
    for name in ("integrate_patches.py", "repair_interfaces.py", "package_r1.py"):
        files["CAD/" + name] = (script_dir / name).read_bytes()
    docs = script_dir.parents[3] / "docs"
    for name in ("TUKI_V4_REPARACION_R1.md", "TUKI_V4_ASSEMBLY_GUIDE.md"):
        files[name] = (docs / name).read_bytes()

    inventory = {}
    with ZipFile(args.final_zip) as old:
        for name, data in sorted(files.items()):
            if not name.endswith(".stl"):
                continue
            inventory[name] = {**mesh_inventory(data), "quantity": 5 if "POLEA_28" in name else 1}
        for name in inventory:
            if "_R1.stl" not in name and old.read(name) != files[name]:
                raise ValueError(f"Unplanned STL change: {name}")
        for name in files:
            if name.endswith(".step") and name in old.namelist() and "ENSAMBLADO" not in name:
                if old.read(name) != files[name]:
                    raise ValueError(f"Unplanned STEP change: {name}")

    revised = [name for name in inventory if name.endswith("_R1.stl")]
    if len(revised) != 4 or len(inventory) != 22:
        raise ValueError("Unexpected print inventory")
    files["VALIDACION/stl_inventario.json"] = json.dumps(inventory, indent=2).encode()
    files["VALIDACION/sha256.json"] = json.dumps(
        {name: sha256(content).hexdigest() for name, content in sorted(files.items())},
        indent=2).encode()

    temp_zip = args.final_zip.with_suffix(".tmp")
    with ZipFile(temp_zip, "x", ZIP_DEFLATED, compresslevel=6) as bundle:
        for name, data in sorted(files.items()):
            bundle.writestr(name, data)
    with ZipFile(temp_zip) as bundle:
        if bundle.testzip() or set(bundle.namelist()) != set(files):
            raise ValueError("ZIP integrity verification failed")
        if any(bundle.read(name) != data for name, data in files.items()):
            raise ValueError("ZIP data verification failed")
    with args.backup_zip.open("xb") as backup, args.final_zip.open("rb") as original:
        shutil.copyfileobj(original, backup)
    temp_zip.replace(args.final_zip)
    print(args.final_zip, len(files), sha256(args.final_zip.read_bytes()).hexdigest())


if __name__ == "__main__":
    main()
