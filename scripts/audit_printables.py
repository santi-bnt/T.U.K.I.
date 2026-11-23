"""Dependency-free structural audit of active binary STL print files."""
from collections import Counter
import json
import math
from pathlib import Path
import struct

ROOT = Path(__file__).resolve().parents[1]
PRINTS = ROOT / "hardware" / "printables"


def read_stl(path):
    data = path.read_bytes()
    if len(data) < 84:
        raise ValueError(f"{path}: truncated STL header")
    count, = struct.unpack_from("<I", data, 80)
    if len(data) != 84 + 50 * count:
        raise ValueError(f"{path}: invalid binary STL length")
    faces = []
    for i in range(count):
        row = struct.unpack_from("<12fH", data, 84 + 50 * i)
        points = tuple(tuple(row[j:j + 3]) for j in (3, 6, 9))
        if not all(math.isfinite(value) for point in points for value in point):
            raise ValueError(f"{path}: non-finite vertex at triangle {i}")
        faces.append(points)
    return faces


def edge_key(a, b):
    return tuple(sorted((tuple(round(x, 5) for x in a), tuple(round(x, 5) for x in b))))


def audit(path):
    faces = read_stl(path)
    points = [point for face in faces for point in face]
    bounds = [[round(min(p[axis] for p in points), 3) for axis in range(3)],
              [round(max(p[axis] for p in points), 3) for axis in range(3)]]
    edges = Counter(edge_key(a, b) for face in faces for a, b in zip(face, face[1:] + face[:1]))
    parents = list(range(len(faces)))
    edge_faces = {}
    for index, face in enumerate(faces):
        for a, b in zip(face, face[1:] + face[:1]):
            key = edge_key(a, b)
            if key in edge_faces:
                other = edge_faces[key]
                left, right = index, other
                while parents[left] != left:
                    left = parents[left]
                while parents[right] != right:
                    right = parents[right]
                parents[left] = right
            else:
                edge_faces[key] = index
    roots = set()
    for index in range(len(parents)):
        parent = index
        while parents[parent] != parent:
            parent = parents[parent]
        roots.add(parent)
    volume = 0.0
    for a, b, c in faces:
        volume += (a[0] * (b[1] * c[2] - b[2] * c[1])
                   + a[1] * (b[2] * c[0] - b[0] * c[2])
                   + a[2] * (b[0] * c[1] - b[1] * c[0])) / 6
    return {
        "file": path.relative_to(ROOT).as_posix(),
        "triangles": len(faces),
        "components": len(roots),
        "bounds_mm": bounds,
        "watertight_edge_check": all(count == 2 for count in edges.values()),
        "signed_volume_mm3": round(volume, 3),
    }, faces


def ray_hits_y(faces, x, z):
    """Count unique intersections along +Y at fixed X/Z in a print-oriented STL."""
    direction = (0.0, 1.0, 0.0)
    hits = []
    for face in faces:
        a, b, c = face
        e1 = tuple(b[i] - a[i] for i in range(3))
        e2 = tuple(c[i] - a[i] for i in range(3))
        cross = (direction[1] * e2[2] - direction[2] * e2[1],
                 direction[2] * e2[0] - direction[0] * e2[2],
                 direction[0] * e2[1] - direction[1] * e2[0])
        det = sum(e1[i] * cross[i] for i in range(3))
        if abs(det) < 1e-8:
            continue
        inv = 1 / det
        tvec = (x - a[0], -1.0 - a[1], z - a[2])
        u = sum(tvec[i] * cross[i] for i in range(3)) * inv
        if u < -1e-6 or u > 1 + 1e-6:
            continue
        q = (tvec[1] * e1[2] - tvec[2] * e1[1],
             tvec[2] * e1[0] - tvec[0] * e1[2],
             tvec[0] * e1[1] - tvec[1] * e1[0])
        v = sum(direction[i] * q[i] for i in range(3)) * inv
        if v < -1e-6 or u + v > 1 + 1e-6:
            continue
        t = sum(e2[i] * q[i] for i in range(3)) * inv
        if t >= 0:
            hits.append(t)
    unique = []
    for t in sorted(hits):
        if not unique or abs(t - unique[-1]) > 1e-4:
            unique.append(t)
    return unique


if __name__ == "__main__":
    paths = sorted(PRINTS.rglob("*.stl"))
    results = []
    faces_by_name = {}
    for path in paths:
        result, faces = audit(path)
        results.append(result)
        faces_by_name[path.name] = faces
    tray = faces_by_name["02_CAJON_DESLIZANTE_USB_C_V6_PARA_IMPRIMIR.stl"]
    # The print-bed translation moves the CAD x=32 mm opening center to
    # print x=87.5 mm; its CAD y=-19 mm maps to print z=17.3 mm.
    usb_center_hits = ray_hits_y(tray, 87.5, 17.3)
    solid_control_hits = ray_hits_y(tray, 32.0, 17.3)
    print(json.dumps({"files": results, "usb_passage_center_intersections": len(usb_center_hits),
                      "solid_control_intersections": len(solid_control_hits)}, indent=2))
    if not all(row["watertight_edge_check"] for row in results):
        raise SystemExit("At least one active STL has boundary/non-manifold edges")
    if len(usb_center_hits) != 2 or len(solid_control_hits) < 4:
        raise SystemExit("USB opening ray check failed: expected clear front passage and solid control point")
