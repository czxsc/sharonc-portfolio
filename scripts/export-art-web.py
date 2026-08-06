#!/usr/bin/env python3
"""Size the art-page masters down into the shipped tree.

Run with `python3 scripts/export-art-web.py` (needs Pillow; the phone
shot also needs GdkPixbuf, which ships with the desktop).

Masters live in assets/_source/hobby/art/ at 1-5 MB each; the exports
land in assets/hobby/art/ as webp and are the only thing Vite bundles.
Widths are per-piece: enough for the piece at 2x wherever it renders
widest, which for the small row is a phone holding one piece per screen,
and for the two concept sheets is half the wall on a desktop.

Pillow here has no HEIF plugin, so the one .heic off a phone is decoded
through GdkPixbuf and handed over in memory rather than shelling out to
a converter that may not be installed either.
"""
from PIL import Image
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'src/assets/_source/hobby/art')
OUT = os.path.join(ROOT, 'src/assets/hobby/art')
QUALITY = 82

# crop is (left, top, right, bottom) as fractions of the master, and only
# the phone shots need one. The paintings were photographed on a desk with
# a lot of it in frame, and a piece hanging at a quarter of the page's
# width can't spend that width on keyboard. Enough desk stays that they
# still read as photographs of a sketchbook rather than as flat scans.
# The gallery crops further at display time (see the `ratio` in
# content.js); these are only about what the photograph itself is of.
JOBS = [
    # (source file, width, crop)
    ('nyc_art.jpg', 1200, (0.01, 0.07, 0.99, 0.97)),  # spread, small row
    ('drinks_painting.jpg', 1100, None),
    ('goache_trail_painting.heic', 900, (0.18, 0.40, 1, 1)),
    # hung at about half its width, so it needs the extra to survive that
    ('littlewonder_concept.jpg', 1600, None),
    # the two pieces meant to be read into: half the wall each, and the
    # only ones here whose own labels have to hold up at that size
    ('concept_fish.png', 1600, None),
    ('concept_tech.png', 1600, None),
]


def load(path):
    """Open a master, decoding HEIF through GdkPixbuf when Pillow can't."""
    if not path.lower().endswith(('.heic', '.heif')):
        return Image.open(path)

    import gi
    gi.require_version('GdkPixbuf', '2.0')
    from gi.repository import GdkPixbuf

    pb = GdkPixbuf.Pixbuf.new_from_file(path)
    mode = 'RGBA' if pb.get_has_alpha() else 'RGB'
    # rows can be padded, so the buffer's own stride is passed to the raw
    # decoder rather than assuming width * channels
    return Image.frombytes(
        mode,
        (pb.get_width(), pb.get_height()),
        pb.get_pixels(),
        'raw',
        mode,
        pb.get_rowstride(),
    )


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    for name, width, crop in JOBS:
        im = load(os.path.join(SRC, name))
        # every piece sits on the page's paper colour as a solid print,
        # so alpha is flattened rather than carried
        im = im.convert('RGB')
        if crop:
            l, t, r, b = crop
            im = im.crop((round(l * im.width), round(t * im.height),
                          round(r * im.width), round(b * im.height)))
        im.thumbnail((width, 10_000), Image.LANCZOS)
        out = os.path.join(OUT, os.path.splitext(name)[0] + '.webp')
        im.save(out, 'webp', quality=QUALITY, method=6)
        print(f'{name:32} → {os.path.basename(out):32} {im.width}x{im.height}'
              f'  {os.path.getsize(out) / 1024:.0f} KB')
