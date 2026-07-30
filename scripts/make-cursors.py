"""Draws the coffee-bean cursors into public/.

Run with `python3 scripts/make-cursors.py` (needs Pillow) after changing
any number here. Four cursors, two axes:

  colour  espresso on light ground, cream on dark ground — chosen at
          runtime, either by theme or by sampling what's under the
          pointer (see src/hooks/useCursorContrast.js)
  form    idle is a solid bean leaning at 45deg; hover is the drawn
          outline bean, sitting up at 60deg and a quarter larger

Colour carries legibility, so form has to carry the interactive state —
hence a solid/outline switch rather than a colour change. Every bean
keeps its tip on the (4,4) hotspot, so the click point never moves
between the four.

The idle bean is two draws: a fattened silhouette in the contrast colour,
then the bean with its crease knocked out. The rim and the crease both
come from that lower layer, which is what makes the mark legible on any
ground the way a system arrow's white outline is — the earlier latte-art
cursor had no such rim and dissolved into dark photos.

The hover bean is the hero's role-wheel hub (.hero-wheel-bean: fill none,
stroke 1.6 on a 17-unit bean, so ~9% of the bean's width) redrawn at
cursor size, with the crease running tip to tip. No rim on this one: it
carries no fill for a rim to sit against, and doubling a hairline with a
second hairline is what made the earlier filled version read as a
badly-cut-out sticker.
"""
import math
from PIL import Image, ImageDraw

SS = 8  # supersample factor; everything is drawn big and boxed down

ESPRESSO = (63, 47, 34, 255)
CREAM = (242, 236, 226, 255)

TIP = 4.0  # hotspot, in cursor px — must match the CSS `4 4`
SIZE = 32  # canvas; the size browsers honour (Windows caps here)
A = 12.2   # long half-axis at 1x, giving a bean ~21px across
BMID = 7.9  # short half-axis, before the round/flat asymmetry


def geometry(cx, cy, a, bmid, bdelta, theta):
    """The bean's two paths, in supersampled canvas coordinates."""
    ct, st = math.cos(theta), math.sin(theta)

    def place(x, y):
        return ((cx + x * ct - y * st) * SS, (cy + x * st + y * ct) * SS)

    # the y radius eases from bmid+bdelta on the round side to
    # bmid-bdelta on the flat one, so a real bean's asymmetry shows up
    # without a kink at the tips
    edge = []
    for i in range(720):
        phi = 2 * math.pi * i / 720
        s = math.sin(phi)
        edge.append(place(a * math.cos(phi), (bmid + bdelta * s) * s))
    return place, edge


def crease_points(place, a, bmid, span):
    """A gentle S along the long axis, sampled."""
    return [
        place(t * span * a, 0.20 * bmid * math.sin(math.pi * t))
        for t in (-1 + 2 * i / 399 for i in range(400))
    ]


def mask(size, cx, cy, a, bmid, bdelta, theta, crease_w, grow=0.0,
         crease=True):
    """Alpha mask of the solid bean, drawn at SS and boxed down."""
    S = size * SS
    m = Image.new('L', (S, S), 0)
    d = ImageDraw.Draw(m)
    place, edge = geometry(cx, cy, a + grow, bmid + grow, bdelta, theta)
    d.polygon(edge, fill=255)

    if crease:
        # tapered to points, so the crease never cuts the silhouette
        for i, (px, py) in enumerate(crease_points(place, a, bmid, 0.84)):
            t = -1 + 2 * i / 399
            r = crease_w * (1 - t * t) ** 0.45 * SS / 2
            if r > 0.2:
                d.ellipse((px - r, py - r, px + r, py + r), fill=0)

    return m.resize((size, size), Image.LANCZOS)


def stroke_mask(size, cx, cy, a, bmid, bdelta, theta, stroke_w):
    """Alpha mask of the drawn bean — a real constant-width stroke around
    the edge, plus the crease from tip to tip, both round-capped, as the
    wheel hub's SVG draws it."""
    S = size * SS
    m = Image.new('L', (S, S), 0)
    d = ImageDraw.Draw(m)
    place, edge = geometry(cx, cy, a, bmid, bdelta, theta)
    w = max(1, round(stroke_w * SS))
    d.line(edge + [edge[0]], fill=255, width=w, joint='curve')

    crease = crease_points(place, a, bmid, 0.92)
    d.line(crease, fill=255, width=w, joint='curve')
    for px, py in (crease[0], crease[-1]):  # round the caps
        r = w / 2
        d.ellipse((px - r, py - r, px + r, py + r), fill=255)

    return m.resize((size, size), Image.LANCZOS)


def bean(path, body, rim=None, scale=1.0, deg=45.0, size=SIZE):
    """`rim=None` draws the outline bean; a colour draws the solid one."""
    px = size / SIZE  # 2x sheets scale line weights with everything else
    a, bmid = A * scale * px, BMID * scale * px
    th = math.radians(deg)
    kw = dict(size=size, cx=TIP * px + a * math.cos(th),
              cy=TIP * px + a * math.sin(th), a=a, bmid=bmid,
              bdelta=0.6 * scale * px, theta=th)
    img = Image.new('RGBA', (size, size), body[:3] + (0,))
    if rim:
        solid = dict(crease_w=2.0 * scale * px, **kw)
        img.paste(Image.new('RGBA', (size, size), rim), (0, 0),
                  mask(grow=1.1 * px, crease=False, **solid))
        img.paste(Image.new('RGBA', (size, size), body), (0, 0), mask(**solid))
    else:
        # ~9% of the bean's width, matching .hero-wheel-bean's 1.6/17
        img.paste(Image.new('RGBA', (size, size), body), (0, 0),
                  stroke_mask(stroke_w=0.09 * 2 * bmid, **kw))
    img.save(path)
    print(f'{path}  {size}px  {deg:.0f}deg  {scale:.2f}x'
          f'  {"solid" if rim else "outline"}')


# 1.25x is the largest the hover bean gets while keeping its tip on (4,4)
# and staying inside 32px — past that the far end clips.
OUT = 'public'
for suffix, size in (('-sm', 32), ('', 64)):  # -sm is what the CSS uses
    bean(f'{OUT}/bean-cursor{suffix}.png', ESPRESSO, CREAM, size=size)
    bean(f'{OUT}/bean-cursor-light{suffix}.png', CREAM, ESPRESSO, size=size)
    bean(f'{OUT}/bean-tap{suffix}.png', ESPRESSO, scale=1.25, deg=60,
         size=size)
    bean(f'{OUT}/bean-tap-light{suffix}.png', CREAM, scale=1.25, deg=60,
         size=size)
