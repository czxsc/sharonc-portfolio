#!/usr/bin/env python3
"""Trim the Play flat-lay cutouts to their own edges.

The five objects in the tote-bag spill came out of a background remover,
which pads every result to a square-ish canvas. The padding differs per
file — the laptop carried 214px of empty above it, the sketchbook 288 —
so `width: 130px` in CSS meant five different apparent sizes, and no two
objects could share a baseline. Play.css now rests them all on one shelf
rule, which only works if the bottom of the file IS the bottom of the
object.

Originals are moved to src/assets/_source/play/ on first run; the trimmed
webp is written back over the imported path so nothing in the app changes
but the framing. Re-running is a no-op once trimmed (the bbox is already
the full canvas), and it always re-trims from _source when that exists,
so the script stays idempotent.

    python3 scripts/trim-play-cutouts.py
"""

from pathlib import Path
import shutil

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src/assets/play"
KEEP = ROOT / "src/assets/_source/play"

# Alpha below this is matting fringe, not object. Trimming on a bare
# getbbox() would keep a halo of near-transparent pixels that the eye
# can't see but the layout can — the sketchbook's ribbon leaves a faint
# 40px tail that would push its baseline off the shelf.
ALPHA_FLOOR = 12
BLEED = 2  # px kept outside the bbox so the trim never nicks an edge


def trim(path: Path) -> None:
    kept = KEEP / path.name
    if not kept.exists():
        KEEP.mkdir(parents=True, exist_ok=True)
        shutil.copy2(path, kept)

    im = Image.open(kept).convert("RGBA")
    mask = im.getchannel("A").point(lambda v: 255 if v >= ALPHA_FLOOR else 0)
    box = mask.getbbox()
    if box is None:
        print(f"  {path.name}: fully transparent, skipped")
        return

    l, t, r, b = box
    l, t = max(0, l - BLEED), max(0, t - BLEED)
    r, b = min(im.width, r + BLEED), min(im.height, b + BLEED)
    out = im.crop((l, t, r, b))
    out.save(path, "WEBP", quality=88, method=6)
    print(f"  {path.name}: {im.size} -> {out.size}")


def main() -> None:
    print(f"trimming {SRC.relative_to(ROOT)}")
    for f in sorted(SRC.glob("*.webp")):
        trim(f)


if __name__ == "__main__":
    main()
