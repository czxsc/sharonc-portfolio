#!/usr/bin/env python3
"""Re-grade the Overgrown cavern toward the Overgrown nexus.

The cavern master we still have is an older pass: its lit areas sit at
hue ~157 (mint/teal) while the nexus they are meant to sit beside is at
~82 (yellow-green), and it is the less saturated of the two (92 vs 131).
This applies the same kind of curve move the zone set was built on — a
global hue rotation plus a saturation gain — rather than a repaint.

DEG/SAT are the whole control surface. Measured candidates:
    -25 / 1.12  barely moved, still reads teal
    -35 / 1.18  <- in use: clearly yellow-green, rock keeps its cool depth
    -45 / 1.25  matches the nexus harder, cave starts reading olive
    -55 / 1.30  acid, loses the cave

Writes the graded master beside the original (the original is kept as
the master of record) and the shipped 1100px webp into web/.
"""

from PIL import Image

DEG = -35        # negative = toward yellow-green
SAT = 1.18       # saturation gain, clipped at 255
SRC = 'overgrown_cave2048.png'
GRADED = 'overgrown_cave2048_graded.png'
WEB = 'web/overgrown_cave2048.webp'
WIDTH = 1100     # squares export at 1100w, quality 82
QUALITY = 82


def grade(im, deg, sat):
    h, s, v = im.convert('HSV').split()
    d = int(round(deg / 360.0 * 255))
    h = h.point(lambda x: (x + d) % 256)
    s = s.point(lambda x: min(255, int(x * sat)))
    return Image.merge('HSV', (h, s, v)).convert('RGB')


if __name__ == '__main__':
    # the master is RGBA but fully opaque; flatten so HSV round-trips
    src = Image.open(SRC).convert('RGB')
    out = grade(src, DEG, SAT)
    out.save(GRADED)

    web = out.copy()
    web.thumbnail((WIDTH, WIDTH), Image.LANCZOS)
    web.save(WEB, 'WEBP', quality=QUALITY, method=6)
    print(f'{SRC} {src.size} -> {GRADED} + {WEB} {web.size} (hue {DEG}, sat x{SAT})')
