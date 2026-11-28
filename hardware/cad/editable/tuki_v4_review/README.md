# TUKI V4 mechanical review workspace

## Current STEP workflow

Run from the repository root in a regular PowerShell terminal with the working
CadQuery environment selected. If using the verified temporary install instead
of a virtual environment, set `$env:PYTHONPATH = Join-Path $env:LOCALAPPDATA 'Temp\tuki-cad-audit-deps'` for that shell.

```powershell
$zip = '.local-private/root-archives/source-zips/TUKI_V4_ANTEBRAZO_ANCHO_5_SG90_DIAGONAL_PROTOTIPO.zip'
$scripts = 'hardware/cad/editable/tuki_v4_review'
python "$scripts/audit_v4.py" $zip .local-private/v4-audit-local
python "$scripts/revise_v4.py" $zip .local-private/v4-audit-local/baseline.json .local-private/v4-routing-local
```

Choose a fresh destination for the second command. Share `baseline.json`
and `routing.json`, plus any console traceback if either run aborts. The
revision script is the editable overlay for the supplied wrist STEP. See the
[mechanical report](../../../../docs/TUKI_V4_MECHANICAL_REVIEW.md).

## Previous XY review

This folder records a conservative mechanical review of the V4 package. The
uploaded ZIP, its seven STL files, seven per-part STEP files, and assembled
STEP remain the source snapshot. The current STEP workflow above exports
the revised prototype to a separate local folder.

## Reproducible check

Run from this folder:

```powershell
python check_v4_tendon_layout.py
```

The script writes `v4_tendon_layout_screen.json`. It compares nominal pulley
disks and straight tendon centerlines in XY only. It does not prove tangent
wrap, a bend radius, friction, guide mounting, Z clearance, servo/cable
clearance, or a moving-door collision result.

## Candidate correction direction

The source V4 generator sets all tangent sides to `+X`. That is incompatible
with the supplied diagonal centers: the outgoing line enters the following
Ø28 pulley disk. The screen supports changing the initial exit side to `-X`.
Keep the five strands parallel at their left tangent lanes until they have
passed the complete pulley array. Only then fan them out, in the same left-to-
right order, through a separately mounted, radiused guide toward the wrist.

The old guide blocks at Y=-32 and Y=-68 are not part of the seven supplied
STLs and their positions are not a validated routed path. The screen shows a
projected conflict between the outer guide lane and the top pulley. Y=-20 is a
candidate clearance plane for a new fan-out guide, not an approved final datum.
Regenerate and collision-check the full CAD before manufacturing any guide or
changing the rack plate.

For staged fit checks see `docs/TUKI_V4_ASSEMBLY_GUIDE.md`.
