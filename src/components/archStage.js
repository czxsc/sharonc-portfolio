/* ------------------------------------------------------------------
   The motion between the two architecture diagrams.

   The idea it's acting out: to the backend, the whole frontend is one box
   (the browser), and to the frontend, the whole backend is one box (the
   storage API). So a diagram doesn't swap for the other one. It collapses
   into the box it is over there, that box slides out to its place, and the
   other diagram grows around it.

   One switch, in order:
     1. the arrows fade
     2. every box gathers in the middle and the pile takes the new label
     3. it slides to its place, softening into that box's dashed style
     4. the other boxes settle in, nearest first
     5. the arrows draw themselves between them, head leading the line

   A single timeline rather than CSS transitions, because all of this is one
   event: each frame is worked out from the time alone (see paint), so the
   resting state is just the end of the timeline, and a press mid-flight only
   has to run the clock backwards to undo exactly what's been done so far. It
   only runs while a switch is playing.

   Three things keep it fluid rather than a list of steps. Boxes travel on
   --ease-glide, a soft start and a long settle. They travel on a slight arc
   instead of along a ruler. And the beats overlap, so each move is already
   easing into motion as the last one comes to rest and nothing stops dead in
   the middle. Lines are drawn on --ease-rule, as they are across the site.

   It sets the rects' x, y, width and height rather than transforms. Boxes
   change proportions on the way, which a scale would do to their corners too,
   and children of an SVG don't get a compositor layer anyway, so a transform
   here would repaint just the same. None of it touches page layout.
   ------------------------------------------------------------------ */

const bezier = (x1, y1, x2, y2) => {
  const at = (a, b, u) => ((1 - 3 * b + 3 * a) * u + (3 * b - 6 * a)) * u * u + 3 * a * u;
  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let lo = 0;
    let hi = 1;
    let u = x;
    for (let i = 0; i < 20; i++) {
      const v = at(x1, x2, u);
      if (Math.abs(v - x) < 2e-4) break;
      if (v < x) lo = u;
      else hi = u;
      u = (lo + hi) / 2;
    }
    return at(y1, y2, u);
  };
};
const rule = bezier(0.65, 0, 0.35, 1); // --ease-rule
const glide = bezier(0.45, 0, 0.15, 1); // --ease-glide
const soft = bezier(0.4, 0, 0.6, 1); // for fades: no hard start or stop

// The beats, in ms from the press. They overlap on purpose (see above).
const FADE_FOR = 260; // the arrows fade
const GATHER_END = 920; // every box has met in the middle
const GATHER_MIN = 560; // how long the nearest box's trip takes...
const GATHER_SPAN = 220; // ...and how much longer the farthest box's does
const LABEL_OUT = 220; // a box's words clear as it sets off
const LABEL_AT = 760; // the pile takes its new label
const LABEL_FOR = 320;
const SHIFT_AT = 1000; // the pile slides out to its place
const SHIFT_FOR = 680;
const FILL_AT = 1400; // the other boxes start to appear
const FILL_SWEEP = 520; // how long until the farthest one starts
const NODE_FOR = 500;
const DRIFT = 22; // how far a box travels as it settles, in diagram units
const EDGE_LAG = 60; // an arrow starts just after both its ends are there
const DRAW_FOR = 440;
const TOTAL = FILL_AT + FILL_SWEEP + EDGE_LAG + DRAW_FOR;
const REWIND = 2; // how much faster a switch plays backwards when it's called off

const GATHER_ARC = 0.12; // how far a gathering box bows out, as a share of its trip
const SHIFT_LIFT = 18; // how far the pile rises mid-slide, in diagram units
const MERGED_W = 176;

const clamp = (v) => Math.max(0, Math.min(1, v));
const lerp = (a, b, u) => a + (b - a) * u;
const between = (a, b, u) => ({
  x: lerp(a.x, b.x, u),
  y: lerp(a.y, b.y, u),
  w: lerp(a.w, b.w, u),
  h: lerp(a.h, b.h, u),
});
const centre = (r) => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 });
const gap = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

const set = (el, name, value) => el.setAttribute(name, value);
const show = (el, on) => set(el, 'visibility', on ? 'visible' : 'hidden');

function place(n, r) {
  for (const rect of [n.solid, n.dash]) {
    set(rect, 'x', r.x);
    set(rect, 'y', r.y);
    set(rect, 'width', r.w);
    set(rect, 'height', r.h);
  }
  const c = centre(r);
  set(n.title, 'x', c.x);
  set(n.title, 'y', c.y + (n.sub ? -5 : 5));
  if (n.sub) {
    set(n.subEl, 'x', c.x);
    set(n.subEl, 'y', c.y + 15);
  }
}

// how solid or dashed a box looks, 0 being wholly its filled self
function dashed(n, amount) {
  set(n.solid, 'opacity', 1 - amount);
  set(n.dash, 'opacity', amount);
}

// A separate head rather than an SVG marker, which would sit at the far end
// of the line the whole time it was being drawn towards it.
function placeHead(e, q) {
  const l = e.len * q;
  const a = e.probe.getPointAtLength(Math.max(0, l - 1));
  const b = e.probe.getPointAtLength(Math.max(1, l));
  const tip = e.probe.getPointAtLength(l);
  const angle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
  set(e.head, 'transform', `translate(${tip.x} ${tip.y}) rotate(${angle})`);
}

function buildScene(svg, views) {
  const width = svg.viewBox.baseVal.width;

  const scene = views.map((v, vi) => {
    const nodes = v.arch.nodes.map((n, i) => {
      const box = svg.querySelector(`[data-box="${vi}:${i}"]`);
      const label = svg.querySelector(`[data-label="${vi}:${i}"]`);
      return {
        ...n,
        box,
        label,
        solid: box.children[0],
        dash: box.children[1],
        title: label.children[0],
        subEl: label.children[1],
      };
    });

    const carried = nodes.find((n) => n.id === v.carry);
    const home = centre(carried);
    const far = Math.max(...nodes.map((n) => gap(centre(n), home)));
    for (const n of nodes) {
      const c = centre(n);
      const d = gap(c, home);
      n.fillAt = FILL_AT + FILL_SWEEP * (d / far);
      n.dx = d ? (c.x - home.x) / d : 0;
      n.dy = d ? (c.y - home.y) / d : 0;
    }

    const edges = v.arch.edges.map((e, i) => {
      const g = svg.querySelector(`[data-edge="${vi}:${i}"]`);
      // measured on a copy, so it still works while the drawing is hidden
      const probe = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      probe.setAttribute('d', e.d);
      const len = probe.getTotalLength();
      const line = g.children[0];
      set(line, 'stroke-dasharray', `${len} ${len}`);
      const ends = [e.from, e.to].map((id) => nodes.find((n) => n.id === id).fillAt);
      return {
        g,
        line,
        head: g.children[1],
        label: g.children[2],
        probe,
        len,
        at: Math.max(...ends) + EDGE_LAG,
      };
    });

    return {
      carry: v.carry,
      nodes,
      edges,
      merged: { x: (width - MERGED_W) / 2, y: carried.y, w: MERGED_W, h: carried.h },
    };
  });

  // Farther boxes leave sooner, so they all arrive in the middle together.
  scene.forEach((view, vi) => {
    const meet = centre(scene[1 - vi].merged);
    const far = Math.max(...view.nodes.map((n) => gap(centre(n), meet)));
    for (const n of view.nodes) {
      const c = centre(n);
      const trip = gap(c, meet);
      n.gatherFor = GATHER_MIN + GATHER_SPAN * (trip / far);
      // sideways to its path, the same way round for every box, so they read
      // as one movement drawing in rather than each sliding off on its own
      n.bowX = trip ? ((meet.y - c.y) / trip) * trip * GATHER_ARC : 0;
      n.bowY = trip ? ((c.x - meet.x) / trip) * trip * GATHER_ARC : 0;
    }
  });

  return scene;
}

/* Everything on screen at `t` ms into the switch from one view to the other.
   Rest is the same call with t = Infinity. */
function paint(scene, fromI, toI, t) {
  const from = scene[fromI];
  const to = scene[toI];

  const fade = 1 - soft(clamp(t / FADE_FOR));
  for (const e of from.edges) {
    show(e.g, fade > 0);
    set(e.g, 'opacity', fade);
  }

  const gathered = t >= GATHER_END;
  for (const n of from.nodes) {
    show(n.box, !gathered);
    show(n.label, !gathered);
    if (gathered) continue;
    const leaves = GATHER_END - n.gatherFor;
    const u = clamp((t - leaves) / n.gatherFor);
    const p = glide(u);
    const r = between(n, to.merged, p);
    const bow = Math.sin(Math.PI * p);
    r.x += n.bowX * bow;
    r.y += n.bowY * bow;
    place(n, r);
    // a dashed box firms up on its way, so the pile reads as one card
    dashed(n, n.outside ? 1 - soft(clamp(u * 2.5)) : 0);
    set(n.box, 'opacity', 1);
    set(n.label, 'opacity', 1 - soft(clamp((t - leaves) / LABEL_OUT)));
  }

  for (const n of to.nodes) {
    if (n.id === to.carry) {
      show(n.label, t >= LABEL_AT);
      set(n.label, 'opacity', soft(clamp((t - LABEL_AT) / LABEL_FOR)));
      // takes over from the pile on the frame the pile lines up exactly
      show(n.box, gathered);
      set(n.box, 'opacity', 1);
      const p = glide(clamp((t - SHIFT_AT) / SHIFT_FOR));
      const r = between(to.merged, n, p);
      r.y -= SHIFT_LIFT * Math.sin(Math.PI * p);
      place(n, r);
      const soften = soft(clamp((t - SHIFT_AT - 150) / (SHIFT_FOR - 150)));
      dashed(n, n.outside ? soften : 0);
      continue;
    }
    const u = clamp((t - n.fillAt) / NODE_FOR);
    show(n.box, u > 0);
    show(n.label, u > 0);
    if (u <= 0) continue;
    const off = DRIFT * (1 - glide(u));
    const seen = soft(clamp(u * 1.4));
    place(n, { x: n.x - n.dx * off, y: n.y - n.dy * off, w: n.w, h: n.h });
    dashed(n, n.outside ? 1 : 0);
    set(n.box, 'opacity', seen);
    set(n.label, 'opacity', seen);
  }

  for (const e of to.edges) {
    const u = clamp((t - e.at) / DRAW_FOR);
    show(e.g, u > 0);
    if (u <= 0) continue;
    const q = rule(u);
    set(e.g, 'opacity', 1);
    set(e.line, 'stroke-dashoffset', e.len * (1 - q));
    placeHead(e, q);
    if (e.label) set(e.label, 'opacity', soft(clamp((u - 0.5) / 0.5)));
  }
}

export function createArchStage(svg, views) {
  const scene = buildScene(svg, views);
  let from = 1;
  let to = 0;
  let want = 0;
  let at = 0;
  let last = 0;
  let raf = 0;

  const settleOn = (view) => {
    from = 1 - view;
    to = view;
    paint(scene, from, to, Infinity);
  };

  const tick = (now) => {
    /* Not below zero: a frame's timestamp is when the frame began, which on a
       busy machine is often before the press that asked for it. And a switch
       is only over at the end it's actually heading for, so sitting at zero on
       its way out can't be mistaken for having been called off. */
    const dt = Math.max(0, Math.min(now - last, 50));
    last = now;
    const forward = want === to;
    at += forward ? dt : -dt * REWIND;
    paint(scene, from, to, at);
    if (forward ? at < TOTAL : at > 0) {
      raf = requestAnimationFrame(tick);
      return;
    }
    raf = 0;
    settleOn(forward ? to : from);
  };

  settleOn(0);

  return {
    go(next) {
      want = next;
      if (raf || next === to) return; // a running switch reads `want` every frame
      // nothing to watch: motion is off, or the drawing is hidden on a phone
      const still =
        window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
        svg.getBoundingClientRect().width === 0;
      if (still) {
        settleOn(next);
        return;
      }
      from = to;
      to = next;
      at = 0;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    },
    stop() {
      cancelAnimationFrame(raf);
      raf = 0;
    },
  };
}
