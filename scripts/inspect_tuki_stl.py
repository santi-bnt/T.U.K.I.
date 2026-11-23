"""Inventory binary STL print beds by edge-connected shells."""
import argparse
import json
import struct
from pathlib import Path


def read_shells(path):
    data = path.read_bytes()
    count, = struct.unpack_from("<I", data, 80)
    if len(data) != 84 + 50 * count:
        raise ValueError(f"{path}: invalid binary STL length")
    parents = list(range(count))

    def root(i):
        while parents[i] != i:
            parents[i] = parents[parents[i]]
            i = parents[i]
        return i

    edges = {}
    triangles = []
    for i in range(count):
        row = struct.unpack_from("<12fH", data, 84 + 50 * i)
        vertices = tuple(tuple(row[j:j + 3]) for j in (3, 6, 9))
        triangles.append(vertices)
        for a, b in zip(vertices, vertices[1:] + vertices[:1]):
            edge = tuple(sorted((a, b)))
            previous = edges.setdefault(edge, i)
            parents[root(i)] = root(previous)

    groups = {}
    for i, triangle in enumerate(triangles):
        groups.setdefault(root(i), []).append(triangle)
    return list(groups.values())


def inspect(path):
    groups = read_shells(path)
    shells = []
    for group in groups:
        points = [point for triangle in group for point in triangle]
        bounds = [[round(fn(axis), 3) for axis in zip(*points)] for fn in (min, max)]
        shells.append({"triangles": len(group), "bounds": bounds})
    shells.sort(key=lambda shell: (-shell["triangles"], shell["bounds"]))
    return {"file": path.name, "triangles": sum(map(len, groups)), "shells": shells}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("directory", type=Path, nargs="?", default=Path("."))
    args = parser.parse_args()
    directory = args.directory if args.directory != Path(".") else Path(__file__).resolve().parents[1] / "hardware" / "printables"
    print(json.dumps([inspect(path) for path in sorted(directory.rglob("*.stl"))], indent=2))
