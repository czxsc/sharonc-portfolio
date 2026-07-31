"""Draws the cursor marks the repo has no file for.

The portfolio case study shows every version of the cursor at actual
size (src/components/CursorTrail.jsx). Most of the marks are the real
artifacts, copied into src/assets/projects/portfolio/cursors/:

  01-latte.png                    public/latte-cursor-sm.png
  03-bean.png / -cream.png        public/bean-cursor{,-light}-sm.png at c37a78d
  04-bean.png / -cream.png        public/bean-cursor{,-light}-sm.png, current

Three are drawn here, all from the numbers in make-cursors.py:

  02-bean.png         the plain solid bean between the latte art and the
                      four-cursor set. It was only ever a working state
                      and never got committed, so it is the same bean
                      with the rim dropped, its crease knocked straight
                      through to the ground since with no rim layer
                      underneath there is nothing else to reveal.

  03-outline{,-cream} the hover mark of that set, redrawn. The shipped
                      one sat up at 60deg and ran out of canvas at the
                      far end, which is a rendering accident rather than
                      anything the pass was about. These lean with every
                      other bean and clear the edges.

  01-latte-cream.png  the inverted latte art, retinted off pure white so
                      the pair reads as two inks of the same drawing
                      rather than a white sticker.

Run with `python3 scripts/make-cursor-history.py` (needs Pillow).
"""
import math
from PIL import Image, ImageDraw

SS = 8  # supersample factor; drawn big and boxed down

ESPRESSO = (63, 47, 34, 255)
CREAM = (242, 236, 226, 255)

TIP = 4.0   # hotspot, in cursor px
SIZE = 32   # the size browsers honour
A = 12.2    # long half-axis
BMID = 7.9  # short half-axis, before the round/flat asymmetry
BDELTA = 0.6
DEG = 45.0
CREASE_W = 2.0

OUT = 'src/assets/projects/portfolio/cursors'


def geometry(scale, theta):
    """Bean centre and its edge path, in supersampled coordinates."""
    a, bmid, bdelta = A * scale, BMID * scale, BDELTA * scale
    ct, st = math.cos(theta), math.sin(theta)
    cx, cy = TIP + a * ct, TIP + a * st

    def place(x, y):
        return ((cx + x * ct - y * st) * SS, (cy + x * st + y * ct) * SS)

    # the y radius eases from bmid+bdelta on the round side to
    # bmid-bdelta on the flat one, so the bean's asymmetry shows up
    # without a kink at the tips
    edge = []
    for i in range(720):
        phi = 2 * math.pi * i / 720
        s = math.sin(phi)
        edge.append(place(a * math.cos(phi), (bmid + bdelta * s) * s))
    return place, edge, a, bmid


def crease(place, a, bmid, span):
    """A gentle S along the long axis, bowing the way every bean on the
    site bows."""
    return [
        place(t * span * a, -0.20 * bmid * math.sin(math.pi * t))
        for t in (-1 + 2 * i / 399 for i in range(400))
    ]


def solid(path, body, scale=1.0):
    """The bean with no rim, its crease cut clean through it."""
    m = Image.new('L', (SIZE * SS, SIZE * SS), 0)
    d = ImageDraw.Draw(m)
    place, edge, a, bmid = geometry(scale, math.radians(DEG))
    d.polygon(edge, fill=255)
    # tapered to points, so the crease never cuts the silhouette
    for i, (px, py) in enumerate(crease(place, a, bmid, 0.84)):
        t = -1 + 2 * i / 399
        r = CREASE_W * scale * (1 - t * t) ** 0.45 * SS / 2
        if r > 0.2:
            d.ellipse((px - r, py - r, px + r, py + r), fill=0)

    img = Image.new('RGBA', (SIZE, SIZE), body[:3] + (0,))
    img.paste(Image.new('RGBA', (SIZE, SIZE), body), (0, 0),
              m.resize((SIZE, SIZE), Image.LANCZOS))
    img.save(f'{OUT}/{path}')
    print(f'{path}  solid  {scale:.2f}x')


def outline(path, body, scale=1.15):
    """The drawn bean: a constant-width stroke round the edge with the
    crease running tip to tip, both round-capped, as the hero's wheel hub
    draws it. A shade larger than the solid bean, which is as far as it
    goes while keeping its tip on the hotspot and clearing every edge."""
    m = Image.new('L', (SIZE * SS, SIZE * SS), 0)
    d = ImageDraw.Draw(m)
    place, edge, a, bmid = geometry(scale, math.radians(DEG))
    w = max(1, round(0.09 * 2 * bmid * SS))  # matches .hero-wheel-bean's 1.6/17
    d.line(edge + [edge[0]], fill=255, width=w, joint='curve')

    line = crease(place, a, bmid, 0.92)
    d.line(line, fill=255, width=w, joint='curve')
    for px, py in (line[0], line[-1]):  # round the caps
        d.ellipse((px - w / 2, py - w / 2, px + w / 2, py + w / 2), fill=255)

    img = Image.new('RGBA', (SIZE, SIZE), body[:3] + (0,))
    img.paste(Image.new('RGBA', (SIZE, SIZE), body), (0, 0),
              m.resize((SIZE, SIZE), Image.LANCZOS))
    # the whole point of the redraw is that nothing runs off the canvas,
    # so check it rather than trust the arithmetic. A couple of levels of
    # alpha in the border row is the resample's ringing, not the drawing.
    edge_alpha = max(img.crop(b).getchannel('A').getextrema()[1] for b in (
        (0, 0, SIZE, 1), (0, SIZE - 1, SIZE, SIZE),
        (0, 0, 1, SIZE), (SIZE - 1, 0, SIZE, SIZE)))
    assert edge_alpha < 12, f'{path} runs off the canvas ({edge_alpha})'
    img.save(f'{OUT}/{path}')
    print(f'{path}  outline  {scale:.2f}x  stroke {w / SS:.2f}px'
          f'  edge alpha {edge_alpha}')


def retint(path, src, tint=CREAM):
    """Recolour a drawing to one ink, keeping its own shading. The
    inverted latte art was pure white with a blue cast, which read as a
    sticker sitting on the page rather than as the cream half of a pair."""
    im = Image.open(src).convert('RGBA')
    out = im.copy()
    px = out.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, al = im.getpixel((x, y))
            l = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
            px[x, y] = (round(tint[0] * l), round(tint[1] * l),
                        round(tint[2] * l), al)
    out.save(f'{OUT}/{path}')
    print(f'{path}  retinted from {src}')


solid('02-bean.png', ESPRESSO)
outline('03-outline.png', ESPRESSO)
outline('03-outline-cream.png', CREAM)
retint('01-latte-cream.png', 'public/latte-cursor-light-sm.png')
