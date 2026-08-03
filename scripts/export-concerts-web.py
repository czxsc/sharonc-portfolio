#!/usr/bin/env python3
"""Size the concert photos down into the shipped tree.

Run with `python3 scripts/export-concerts-web.py` (needs Pillow).

Same masters/exports split as export-little-wonder-web.py: the phone
originals live under assets/_source/hobby/music/concerts/, the webp
exports beside them in assets/hobby/music/concerts/ are what content.js
imports and Vite bundles. Unlike the Little Wonder masters these stay
committed - they are only ~11 MB, they are already in the history, and
gitignoring them now would leave no copy in the repo at all.

One rule instead of per-file jobs: long edge 1400px. The carousel panel
opens to roughly 580x340 CSS px, so that is a comfortable 2x on both
axes for the landscape shots and the one portrait (sunkis) alike.
Everything here is an opaque photo, so it all flattens to RGB.
"""
from PIL import Image, ImageOps
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'src/assets/_source/hobby/music/concerts')
OUT = os.path.join(ROOT, 'src/assets/hobby/music/concerts')
LONG_EDGE = 1400
QUALITY = 82

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    for name in sorted(os.listdir(SRC)):
        if not name.lower().endswith(('.jpg', '.jpeg', '.png')):
            continue
        im = Image.open(os.path.join(SRC, name))
        # Phone shots carry an EXIF orientation tag that the browser
        # honours and Pillow does not; webp drops the tag, so the
        # rotation has to be baked into the pixels before saving or the
        # portrait ones ship on their side.
        im = ImageOps.exif_transpose(im).convert('RGB')
        before = im.size
        im.thumbnail((LONG_EDGE, LONG_EDGE), Image.LANCZOS)
        out = os.path.join(OUT, os.path.splitext(name)[0] + '.webp')
        im.save(out, 'WEBP', quality=QUALITY, method=6)
        print(f'{name:20s} {str(before):14s} -> {im.size!s:12s}'
              f'  {os.path.getsize(out)//1024:4d} KB')
