#!/usr/bin/env python3
"""Size the masters down into web/, which is the only thing Vite bundles.

The masters in this folder are ~80 MB and gitignored; web/ is ~800 KB and
committed. Re-run after adding or replacing a master.

Widths are per-kind, not global: a concept sheet has to stay legible
enough to read the handwriting in its margins, a tile only ever renders
about 300px wide. The tilesets carry real transparency (they sit on the
page's paper colour, not on a panel) so they keep their alpha - the
backgrounds are all fully opaque and flatten to RGB safely.
"""
from PIL import Image
import os

os.chdir(os.path.dirname(os.path.abspath(__file__)))
QUALITY = 82

JOBS = [
    # (master, width, keep_alpha)
    ('Early_grass.png', 1600, False),          # prop/ground sheet, small labels
    ('grassy_tile.png', 700, True),            # renders ~300px, 2x for retina
    ('intermittent_tile.png', 700, True),
    ('crystal_tile.png', 700, True),
    ('biolum_tile.png', 700, True),
]

if __name__ == '__main__':
    os.makedirs('web', exist_ok=True)
    for name, width, alpha in JOBS:
        im = Image.open(name)
        im = im.convert('RGBA' if alpha else 'RGB')
        im.thumbnail((width, 10_000), Image.LANCZOS)
        out = 'web/' + name.lower().replace('.png', '.webp')
        im.save(out, 'WEBP', quality=QUALITY, method=6)
        print(f'{name:26s} -> {out:34s} {im.size}  {os.path.getsize(out)//1024:4d} KB'
              f'{"  (alpha)" if alpha else ""}')
