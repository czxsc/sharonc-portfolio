"""Draws the coffee-bean cursors into public/.

Run with `python3 scripts/make-cursors.py` (needs Pillow) after changing
any number here. Two cursors, identical but for their colours:

  cream bean, espresso rim   idle
  espresso bean, cream rim   over anything clickable

Each bean is two draws: a fattened silhouette in the rim colour, then the
bean itself with its crease knocked out. The crease and the rim are both
that lower layer showing through. The rim is what makes either bean
legible on either ground the way a system arrow's white outline is — the
earlier latte-art cursor had no such rim and dissolved into dark photos.

Because both are legible everywhere, colour is free to carry the state,
which is why there is no second form. Earlier versions kept an outline
bean for the hover state and spent colour on the ground instead — sampled
per image, even — and the cursor ended up restyling itself several times
crossing a row of thumbnails. The pair below never changes for any reason
but hovering something you can click.

The two are the same drawing at the same angle, and both keep their tip on
the (4,4) hotspot, so hovering recolours the bean without moving it.
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
    """A gentle S along the long axis, sampled. Bows the same way round as
    the hub's — every bean on the site is the same bean, and the idle and
    hover cursors swap too often for a mirrored crease to pass as anything
    but a flicker."""
    return [
        place(t * span * a, -0.20 * bmid * math.sin(math.pi * t))
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


def bean(path, body, rim, deg=45.0, size=SIZE):
    """One solid bean: rim first, then the body with its crease knocked
    out of it, so the crease is the rim colour showing through."""
    px = size / SIZE  # 2x sheets scale line weights with everything else
    a, bmid = A * px, BMID * px
    th = math.radians(deg)
    kw = dict(size=size, cx=TIP * px + a * math.cos(th),
              cy=TIP * px + a * math.sin(th), a=a, bmid=bmid,
              bdelta=0.6 * px, theta=th, crease_w=2.0 * px)
    img = Image.new('RGBA', (size, size), body[:3] + (0,))
    img.paste(Image.new('RGBA', (size, size), rim), (0, 0),
              mask(grow=1.1 * px, crease=False, **kw))
    img.paste(Image.new('RGBA', (size, size), body), (0, 0), mask(**kw))
    img.save(path)
    print(f'{path}  {size}px  {deg:.0f}deg')


OUT = 'public'
for suffix, size in (('-sm', 32), ('', 64)):  # -sm is what the CSS uses
    bean(f'{OUT}/bean-cursor{suffix}.png', ESPRESSO, CREAM, size=size)
    bean(f'{OUT}/bean-cursor-light{suffix}.png', CREAM, ESPRESSO, size=size)
