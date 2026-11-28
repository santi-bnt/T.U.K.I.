"""Reproducible 2D screening for the V4 diagonal pulley layout.

This checks pulley-disk clearance in the rack's XY plane only. It is not a
CAD solid collision test, a tangent-wrap solver, a friction analysis, or proof
that a tendon guide is printable/mountable. Dimensions are taken from the V4
parametric source and remain nominal until measured on the physical assembly.
"""

from __future__ import annotations

import json
import math
from pathlib import Path


PULLEY_CENTERS_MM = [
    (-30.0, -168.0),
    (-15.0, -137.0),
    (0.0, -106.0),
    (15.0, -75.0),
    (30.0, -44.0),
]
PULLEY_DIAMETER_MM = 28.0
TENDON_DIAMETER_MM = 1.6  # Nominal only; source radius is 0.8 mm.
GUIDE_TARGET_X_MM = [-27.0, -13.0, 0.0, 13.0, 27.0]
EXISTING_GUIDE_Y_MM = -32.0
SUGGESTED_CLEAR_GUIDE_Y_MM = -20.0


def point_segment_distance(point: tuple[float, float], start: tuple[float, float],
                           end: tuple[float, float]) -> float:
    """Return the 2D distance from a point to a finite line segment."""
    dx = end[0] - start[0]
    dy = end[1] - start[1]
    length_squared = dx * dx + dy * dy
    if length_squared == 0:
        return math.dist(point, start)
    t = ((point[0] - start[0]) * dx + (point[1] - start[1]) * dy) / length_squared
    t = max(0.0, min(1.0, t))
    closest = (start[0] + t * dx, start[1] + t * dy)
    return math.dist(point, closest)


def screen_tangent(side: int) -> dict[str, object]:
    """Screen straight tangent rays; side is +1 or -1 along X."""
    radius = PULLEY_DIAMETER_MM / 2
    tendon_radius = TENDON_DIAMETER_MM / 2
    lanes = []
    ray_clearances = []

    for index, (center_x, center_y) in enumerate(PULLEY_CENTERS_MM):
        lane_x = center_x + side * radius
        lanes.append(lane_x)
        nearest_other = math.inf
        for other_index, other_center in enumerate(PULLEY_CENTERS_MM):
            if other_index == index:
                continue
            # Ray extends from the pulley toward increasing Y (toward wrist).
            start = (lane_x, center_y)
            end = (lane_x, 10_000.0)
            center_distance = point_segment_distance(other_center, start, end)
            nearest_other = min(nearest_other, center_distance)
        ray_clearances.append(nearest_other - radius - tendon_radius)

    return {
        "side_x": side,
        "tangent_lanes_x_mm": [round(x, 3) for x in lanes],
        "minimum_clearance_to_other_pulley_disks_mm": round(min(ray_clearances), 3),
        "per_tendon_clearance_mm": [round(x, 3) for x in ray_clearances],
        "projected_clearance_pass": min(ray_clearances) >= 0,
    }


def nearest_pulley_at_guide(x: float, y: float) -> tuple[int, float]:
    distances = [math.dist((x, y), center) for center in PULLEY_CENTERS_MM]
    nearest = min(range(len(distances)), key=distances.__getitem__)
    return nearest, distances[nearest]


def main() -> None:
    radius = PULLEY_DIAMETER_MM / 2
    tendon_radius = TENDON_DIAMETER_MM / 2
    guide_results = []
    for index, lane_x in enumerate(GUIDE_TARGET_X_MM):
        pulley_index, center_distance = nearest_pulley_at_guide(
            lane_x, EXISTING_GUIDE_Y_MM
        )
        clearance = center_distance - radius - tendon_radius
        guide_results.append({
            "tendon_index": index,
            "guide_x_mm": lane_x,
            "nearest_pulley_index": pulley_index,
            "center_distance_mm": round(center_distance, 3),
            "clearance_with_nominal_tendon_mm": round(clearance, 3),
            "projected_overlap": clearance < 0,
        })

    # Axis pitch and adjacent pulley edge clearance.
    adjacent = []
    for first, second in zip(PULLEY_CENTERS_MM, PULLEY_CENTERS_MM[1:]):
        center_spacing = math.dist(first, second)
        adjacent.append({
            "center_spacing_mm": round(center_spacing, 3),
            "nominal_edge_gap_mm": round(center_spacing - PULLEY_DIAMETER_MM, 3),
        })

    result = {
        "scope": "XY screening only; not 3D CAD/solid or physical validation",
        "pulley_diameter_mm": PULLEY_DIAMETER_MM,
        "tendon_diameter_assumption_mm": TENDON_DIAMETER_MM,
        "plus_x_tangent": screen_tangent(+1),
        "minus_x_tangent": screen_tangent(-1),
        "adjacent_pulley_spacing": adjacent,
        "existing_guide_y_mm": EXISTING_GUIDE_Y_MM,
        "existing_guide_lanes": guide_results,
        "suggested_guide_plane_y_mm": SUGGESTED_CLEAR_GUIDE_Y_MM,
        "suggested_guide_plane_reason": (
            "Y=-20 is 10 mm beyond the top pulley disk's nominal +Y edge at Y=-30; "
            "it still requires full CAD routing, guide mounting, and 3D clearance checks."
        ),
    }
    output = Path(__file__).with_name("v4_tendon_layout_screen.json")
    output.write_text(json.dumps(result, indent=2), encoding="utf-8")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
