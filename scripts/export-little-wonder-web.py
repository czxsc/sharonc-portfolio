#!/usr/bin/env python3
"""Size the Little Wonder masters down into the shipped tree.

Run with `python3 scripts/export-little-wonder-web.py` (needs Pillow).

The masters live under assets/_source/projects/little-wonder/, are ~80 MB
and gitignored; the exports beside them in assets/projects/little-wonder/
are ~800 KB, committed, and the only thing Vite bundles. The two trees
mirror each other file for file, so each job is one relative path.
Re-run after adding or replacing a master.

Widths are per-kind, not global: a concept sheet has to stay legible
enough to read the handwriting in its margins, a tile only ever renders
about 300px wide. The tilesets carry real transparency (they sit on the
page's paper colour, not on a panel) so they keep their alpha - the
backgrounds are all fully opaque and flatten to RGB safely.
"""
from PIL import Image
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'src/assets/_source/projects/little-wonder')
OUT = os.path.join(ROOT, 'src/assets/projects/little-wonder')
QUALITY = 82

JOBS = [
    # (path relative to both trees, width, keep_alpha)
    ('concept/grass.png', 1600, False),        # prop/ground sheet, small labels
    ('zones/overgrown/tile.png', 700, True),   # renders ~300px, 2x for retina
    ('zones/intermittent/tile.png', 700, True),
    ('zones/crystal/tile.png', 700, True),
    ('zones/biolum/tile.png', 700, True),
]

if __name__ == '__main__':
    for name, width, alpha in JOBS:
        im = Image.open(os.path.join(SRC, name))
        im = im.convert('RGBA' if alpha else 'RGB')
        im.thumbnail((width, 10_000), Image.LANCZOS)
        out = os.path.join(OUT, name.replace('.png', '.webp'))
        os.makedirs(os.path.dirname(out), exist_ok=True)
        im.save(out, 'WEBP', quality=QUALITY, method=6)
        print(f'{name:28s} -> {os.path.relpath(out, ROOT):58s} {im.size}'
              f'  {os.path.getsize(out)//1024:4d} KB{"  (alpha)" if alpha else ""}')
