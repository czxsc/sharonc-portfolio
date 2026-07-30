import { useEffect, useRef, useState } from 'react';
import { projects } from '../data/content.js';
import { ExperienceSheet, ProjectCover } from './SheetWindow.jsx';
import './SheetFlip.css';

/* ==================================================================
   SheetFlip — About's experience window turns over into Work's
   project preview.

   One virtual card, two real hosts. The card is a fixed-position
   element carrying both faces of the sheet; the experience window in
   About and the preview frame in Work are its endpoints. Scroll
   drives it out of one and into the other, turning it 180° on the way,
   and the two hosts hide themselves while it is in the air. Nothing is
   ever visible twice.

   Why the flip earns its keep here rather than being an effect:
   the two faces are different SHAPES (a tall 403×349 window and a
   wide 760×451 frame at 1440px). Morphing between them would either
   distort type or pop. But a card turning on its Y axis passes through
   90°, where it has zero width and no visible area at all — so the
   shape change is concentrated there (see FLIP_HALF) and every frame
   in which either face is legible has that face at very nearly its
   natural proportions. The turn is what makes the morph free.
   ================================================================== */

/* ------------------------------------------------------------------
   Choreography. Every number below is a fraction of the flight, which
   runs from A (the About stage releasing its pin) to B (the preview
   frame reaching its landing height) — both measured, see measure().

   TUNE: the ordering is what matters. The turn finishes well before
   the travel does, so the last third of the flight is the project
   window — already the right way up — gliding into its slot. Then the
   travel finishes before the hand-off, so the card is geometrically
   identical to the real frame, and motionless relative to it, for a
   beat before they swap. That gap is why the swap can't be seen.
   ------------------------------------------------------------------ */
const ROT = [0.06, 0.52]; // the 180° turn
const TRAVEL_END = 0.74; // position + shape settled; locked to the frame after
const SWAP = 0.85; // card out, real frame in — inside the locked stretch
const FLIP_HALF = 0.16; // half-width of the shape morph around the 90° sliver
const EPS = 0.004; // below this the card is still the About composition

const SAG = 0.07; // downward arc mid-flight, as a fraction of the descent.
//                    The card is nearly parked in the viewport for the whole
//                    flight (the descent and the scroll distance are within
//                    ~10% of each other at desktop sizes), so without this it
//                    reads as pinned. A little sag reads as carried.
const Z_BACK = 90; // px — how far the card recedes at the mid-turn. Read
//                    against the scene's `perspective` in SheetFlip.css;
//                    change one and look at the other.
const TILT_Z = -1.6; // deg — a hair off-square in the air. Nothing is ever
//                      machined on this site; see the layout principles.
const SETTLE = 0.46; // Where the card comes to rest, as a fraction of the
//                      viewport down to the frame's top — and the number
//                      that sets how long the flight is (see measure()).
//                      Bigger settles EARLIER in the scroll, with Work
//                      only partly risen rather than squared up on the
//                      page: the reader arrives to find the preview
//                      already seated and the section still coming up
//                      under it, rather than watching it chase the
//                      layout into place.
//
//                      TUNE: this is the only knob that moves the settle
//                      point, and it moves it 1:1. The card locks to the
//                      frame at TRAVEL_END, which works out to scroll
//                      position (frame's document top − settle) — the
//                      TRAVEL_END term cancels — so raising SETTLE by N
//                      viewport-fractions settles exactly N·vh px of
//                      scroll earlier and changes nothing else.
//                      TRAVEL_END only splits the flight between
//                      travelling and sitting still; it can't move where
//                      the sitting starts.
const SETTLE_PAD = 24; // px of viewport to keep under the settled card

const clamp01 = (t) => (t < 0 ? 0 : t > 1 ? 1 : t);
const lerp = (a, b, t) => a + (b - a) * t;
const easeInOutSine = (t) => 0.5 - 0.5 * Math.cos(Math.PI * t);
/* smootherstep, not smoothstep: its second derivative vanishes at both
   ends too, so the shape morph starts and stops without a detectable
   kink on either side of the sliver. */
const smootherstep = (t) => t * t * t * (t * (6 * t - 15) + 10);

/* θ = 90° — where the card is edge-on and the faces swap. */
const FLIP_MID = ROT[0] + (ROT[1] - ROT[0]) * 0.5;

/* The vertical translation an element is currently carrying, so a rect
   taken through it can be corrected back to laid-out position.

   The About window is the problem this solves: it rides the section's
   scroll ramp (`--rv` on .pour-rail), so at the moment we measure it
   may be up to 16px above where it comes to rest, and a rect would
   report the animated position rather than the resting one the flight
   has to interpolate towards.

   The obvious fix — sum offsetTop up the tree, which ignores
   transforms — is the one this replaces: offsetTop is integer-rounded,
   and the resulting sub-pixel error put the landing 0.42px above the
   frame it was supposed to become. On a hand-off whose entire job is
   to be invisible, half a pixel of vertical slip is the tell. Rects
   are sub-pixel exact, and exactly one ancestor here is ever
   transformed, so correcting for it by hand is both cheaper and more
   accurate than avoiding rects altogether. */
const translateY = (el) => {
  if (!el) return 0;
  const t = getComputedStyle(el).transform;
  if (!t || t === 'none') return 0;
  try {
    return new DOMMatrixReadOnly(t).f;
  } catch {
    return 0;
  }
};

export default function SheetFlip({ previewRef }) {
  const placeRef = useRef(null);
  const cardRef = useRef(null);
  const frontRef = useRef(null);
  const geom = useRef(null);
  const phase = useRef(null); // 'before' | 'flying' | 'after'
  /* Which project the back face wears. It has to be whichever cover
     the real frame is currently showing, or the hand-off at SWAP would
     change project as well as element — visible as a flash. Mirrored
     through a ref that Work writes to, so hovering the list doesn't
     re-render the page. */
  const [face, setFace] = useState(0);
  const faceRef = useRef(0);

  useEffect(() => {
    const place = placeRef.current;
    const card = cardRef.current;
    const front = frontRef.current;
    if (!place || !card || !front) return;

    /* The two hosts. Queried rather than passed as refs: they live in
       sibling sections that have no reason to know about each other,
       and this file is the only place that couples them. */
    const hosts = () => ({
      src: document.querySelector('.pour-rail .sheet'),
      dst: document.querySelector('#work .work-frame'),
    });

    /* Endpoint geometry, in document space.

       Neither endpoint moves during the flight, which is what makes
       this measurable once instead of every frame:

       - The About window is inside a sticky stage that has ALREADY
         finished sticking by the time the flight starts, so from A
         onwards its document position is A + its offset inside the
         stage, and stays there.
       - The preview frame is in normal flow.

       So a per-frame rect read would buy nothing and cost a forced
       layout inside a scroll handler. */
    const measure = () => {
      const pour = document.querySelector('.pour');
      const stage = pour?.querySelector('.pour-stage');
      const { src, dst } = hosts();
      if (!pour || !stage || !src || !dst) return (geom.current = null);

      const sy = window.scrollY;
      const sr = src.getBoundingClientRect();
      const dr = dst.getBoundingClientRect();
      if (!sr.width || !dr.width) return (geom.current = null);

      const vh = window.innerHeight;
      // the scroll at which the stage stops being pinned
      const A = pour.getBoundingClientRect().top + sy + pour.offsetHeight - vh;

      /* The window's resting offset inside the stage, with the scroll
         ramp's translate taken back out. Past A the stage has finished
         sticking, so from then on that offset is a fixed document
         position — which is what makes this measurable once rather
         than re-read every frame. */
      const ramp = translateY(src.closest('.pour-rail'));
      const s0 = {
        w: sr.width,
        h: sr.height,
        cx: sr.left + sr.width / 2,
        cy:
          A +
          (sr.top - stage.getBoundingClientRect().top - ramp) +
          sr.height / 2,
      };
      /* The frame is in normal flow and, while the flight is running,
         carries no reveal transform (see Work.jsx) — so its rect is
         already its resting geometry. */
      const dTop = dr.top + sy;
      const d0 = {
        w: dr.width,
        h: dr.height,
        cx: dr.left + dr.width / 2,
        cy: dTop + dr.height / 2,
      };

      /* How long the flight is, derived rather than chosen.

         The one thing that actually has to be true is that the card is
         comfortably ON SCREEN at the moment it stops moving — it locks
         to the frame at TRAVEL_END and then simply scrolls with the
         page, so wherever it settles is where the reader studies it.
         Solving for that is what fixes the whole family of viewport
         bugs here: the About runway is measured in vh while Work's
         internal layout is driven by width, so on a short screen the
         frame sits much further down the section relative to the
         viewport, and any fixed choice of flight length either flings
         the card off the bottom of the screen or leaves it chasing the
         layout long after the reader has arrived.

         So: pick the settle height first — SETTLE of the viewport, or
         as low as the card can sit and still clear the bottom edge,
         whichever is higher up the page — and solve for the flight
         length that puts the card there at TRAVEL_END. */
      const settle = Math.max(
        80,
        Math.min(SETTLE * vh, vh - SETTLE_PAD - d0.h)
      );
      const span = Math.max(vh * 0.6, (dTop - settle - A) / TRAVEL_END);
      const B = A + span;

      // the front face renders at ITS natural size and is counter-scaled
      // into the card's box, so the paper window is never distorted at
      // the point where the card's box still matches it
      front.style.width = `${s0.w}px`;
      front.style.height = `${s0.h}px`;
      front.style.transform = `scale(${d0.w / s0.w}, ${d0.h / s0.h})`;
      place.style.width = `${d0.w}px`;
      place.style.height = `${d0.h}px`;

      return (geom.current = { A, span, B, s0, d0 });
    };

    /* Who owns the card's box right now. Written straight to the DOM:
       three elements' visibility, changed a handful of times per
       flight, is not worth a render.

       'off' is the failure state, and it hands BOTH windows back
       rather than picking an end of the flight to pretend we're at —
       if the geometry can't be measured, the one guarantee worth
       keeping is that neither section is left with a hole in it. */
    const setPhase = (next) => {
      if (phase.current === next) return;
      phase.current = next;
      const { src, dst } = hosts();
      const showSrc = next === 'before' || next === 'off';
      const showDst = next === 'after' || next === 'off';
      if (src) src.style.visibility = showSrc ? '' : 'hidden';
      if (dst) dst.style.visibility = showDst ? '' : 'hidden';
      place.style.visibility = next === 'flying' ? 'visible' : 'hidden';
    };

    const apply = () => {
      const g = geom.current;
      if (!g) return setPhase('off');
      const y = window.scrollY;
      const s = clamp01((y - g.A) / g.span);

      if (s <= EPS) return setPhase('before');
      if (s >= SWAP) return setPhase('after');
      setPhase('flying');

      // the back face wears whatever cover the frame is showing
      const want = previewRef?.current ?? 0;
      if (want !== faceRef.current) {
        faceRef.current = want;
        setFace(want);
      }

      /* travel — near-linear on purpose.

         The descent (s0.cy → d0.cy) and the flight's scroll distance
         are close to equal, so a linear travel leaves the card almost
         stationary in the viewport while the page moves a full screen
         past it. That parked quality is the whole illusion: the card
         is the fixed point and the site scrolls around it. SAG bends
         it just enough to read as weight rather than a pin. */
      const t = clamp01(s / TRAVEL_END);
      const pe = t + SAG * Math.sin(Math.PI * t);

      /* the turn, and the shape morph hidden inside it */
      const r = clamp01((s - ROT[0]) / (ROT[1] - ROT[0]));
      const th = 180 * easeInOutSine(r);
      const ge = smootherstep(
        clamp01((s - (FLIP_MID - FLIP_HALF)) / (2 * FLIP_HALF))
      );

      const w = lerp(g.s0.w, g.d0.w, ge);
      const h = lerp(g.s0.h, g.d0.h, ge);
      const left = lerp(g.s0.cx, g.d0.cx, pe) - w / 2;
      const top = lerp(g.s0.cy, g.d0.cy, pe) - y - h / 2;

      const turn = Math.sin(Math.PI * r); // 0 → 1 → 0 across the turn
      /* Off the page and back down onto it.

         Keyed to TRAVEL_END, not to SWAP, and that is load-bearing:
         everything this drives — the tilt, the lift shadow — has to
         be back at zero by the time the travel locks, or the card
         spends the locked stretch still settling and is not actually
         congruent with the frame it is about to be swapped for. At
         0.2° a 760px card is ~3px out at the corners, which is
         exactly the kind of tell this whole hand-off exists to avoid. */
      const air = Math.sin(Math.PI * t);

      place.style.transform =
        `translate3d(${left.toFixed(2)}px, ${top.toFixed(2)}px, 0) ` +
        `scale(${(w / g.d0.w).toFixed(5)}, ${(h / g.d0.h).toFixed(5)})`;
      card.style.transform =
        `translateZ(${(-Z_BACK * turn).toFixed(2)}px) ` +
        `rotate(${(TILT_Z * air).toFixed(3)}deg) ` +
        `rotateY(${th.toFixed(3)}deg)`;
      place.style.setProperty('--air', air.toFixed(3));
    };

    const remeasure = () => {
      measure();
      apply();
    };

    remeasure();
    /* the hero's entrance translates the cup for ~1.5s and web fonts
       can swap in late; both move the About window. Same re-measure
       schedule the pour itself uses. */
    const t1 = setTimeout(remeasure, 900);
    const t2 = setTimeout(remeasure, 1900);

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        apply();
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', remeasure);

    /* Either host can change size without the viewport changing — a
       filter sort reflows the list beside the frame, and the frame is
       bottom-aligned to it; a late font changes the timeline's height.
       Watching the boxes catches what 'resize' misses. */
    const ro = 'ResizeObserver' in window ? new ResizeObserver(remeasure) : null;
    if (ro) {
      const { src, dst } = hosts();
      [src, dst, document.querySelector('.work-list')].forEach(
        (el) => el && ro.observe(el)
      );
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', remeasure);
      ro?.disconnect();
      // hand both hosts back before unmounting
      const { src, dst } = hosts();
      if (src) src.style.visibility = '';
      if (dst) dst.style.visibility = '';
    };
  }, [previewRef]);

  const p = projects[face] ?? projects[0];

  return (
    <div className="sheet-flight" ref={placeRef} aria-hidden="true">
      {/* contact shadow. A flat sibling of the card rather than a
          box-shadow on it: re-rasterising a 60px blur under a 760px
          box every frame is the one thing in here that would actually
          cost something, and opacity + scale on a pre-painted gradient
          stays on the compositor. */}
      <span className="sheet-flight-shade" />
      <div className="sheet-flight-card" ref={cardRef}>
        <div className="sheet-face sheet-face-front" ref={frontRef}>
          <ExperienceSheet />
        </div>
        <div className="sheet-face sheet-face-back">
          <div className="work-frame">
            <div
              className="preview-item"
              style={{ '--t1': p.tone[0], '--t2': p.tone[1] }}
            >
              <ProjectCover project={p} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
