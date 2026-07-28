import { useLayoutEffect, useRef } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useReducedMotion,
} from 'motion/react';
import Hero from './Hero.jsx';
import { about, experience, meta, stack } from '../data/content.js';
import './HeroPourTransition.css';

/* ==================================================================
   Scroll choreography.

   The runway (.pour) is 265vh tall (see CSS); the stage stays pinned
   for the first 165vh of it (265vh − 100vh viewport). Every timing
   below is a fraction (0 → 1) of that pinned distance.

   The last window closes at 0.80, which is the point: the remaining
   0.20 (~33vh of scroll) is HOLD — the fully-set About sitting still
   while you read it. An earlier cut of this ran the last entrance to
   0.86 of a shorter runway and the section was only assembled for
   ~18vh before it slid away, which is most of why it never invited
   anyone to stop.

   TUNE: shift these windows to re-time the sequence. Keep them in
   order and slightly overlapping — the overlap is what makes the
   pour read as one continuous gesture instead of four steps. Keep
   the last one ending well before 1.0 to preserve the hold.
   ================================================================== */
const T = {
  cupTilt: [0.03, 0.15], // cup rotates into the pour
  stream: [0.15, 0.24], // stream falls only once the cup is fully tilted
  rise: [0.22, 0.6], // fill rises the moment the stream lands — no
  //                    horizontal run, so nothing depends on frame width.
  //                    Finishes before the statement lands, so the display
  //                    type sets onto settled liquid rather than a moving
  //                    surface — only the top rule ghosts in early.
  rule: [0.42, 0.52], // top hairline draws across; folio labels arrive
  greet: [0.46, 0.56], // "Hello, I'm Sharon!" — the small italic line
  set: [0.5, 0.72], // the statement, three lines cascading out of their masks
  ink: [0.65, 0.77], // marks stroke under software / AI / design, in reading
  //                    order and only once their line has finished setting
  note: [0.64, 0.74], // the supporting aside, alongside the ink
  rail: [0.66, 0.78], // experience timeline draws down
  colophon: [0.74, 0.81], // toolkit strip closes the composition
};

const CUP_MAX_TILT = -42; // deg — final pouring angle of the cup
const HERO_INERT_AT = 0.46; // hero unfocusable once mostly submerged. Kept
//                             just ahead of the point where the About
//                             overlay starts intercepting clicks (T.rule[1]),
//                             so the two never both own the pointer.

/* ------------------------------------------------------------------
   Pour / frame geometry.

   The liquid frame is NOT full-bleed: it spans from just left of the
   tilted cup's lip (where the pour lands) to a bit past the portrait.
   measure() computes both edges plus the spout height and writes them
   as CSS vars on the stage. Values must stay in sync with the CSS
   noted on each constant.
   ------------------------------------------------------------------ */
const STREAM_W = 6; // px — .pour-stream width
const STREAM_INSET = 36; // px — frame's left edge sits this far left of the stream
const STREAM_GAP = 4; // px — stream centreline this far left of the tilted cup's
//                       box: close enough to read as pouring from the lip
const SPOUT_DROP = 8; // px — stream starts this far below the computed lip
//                       height, tucking it under the tilted rim
const FRAME_RIGHT_PAD = 56; // px — frame extends this far past the portrait
const HERO_STACK_MAX = 941; // px — below this the hero reflows (cup moves to the
//                             top right); the frame stays full-width there

/* Cup-lip geometry: the rim corner of the Coffee doodle (viewBox 24×24,
   rim at 4,9), rotated by the full pour tilt about the CSS
   transform-origin (30% 74%), plus the lean translate(-5px, 8px) —
   used for the spout HEIGHT only; the stream's x position is a fixed
   gap left of the cup's box so the pour distance never varies. */
const LIP_FX = 4 / 24;
const LIP_FY = 9 / 24;
const TILT_ORIGIN_FX = 0.3;
const TILT_ORIGIN_FY = 0.74;
const TILT_SHIFT_X = -5;
const TILT_SHIFT_Y = 8;

/* Hand-drawn wave crests — ONE period in a 1440 × 110 box, rendered
   twice side by side (2880 viewBox) so the CSS translateX(-50%) loop
   wraps seamlessly. Start and end heights match for the same reason.
   Crest spacing is deliberately irregular — even spacing would read
   as a sine wave. */
const WAVE_FRONT =
  'M0 64 C58 50 118 82 190 66 C262 52 330 84 412 66 C494 50 562 84 650 66 ' +
  'C740 50 812 82 900 64 C990 48 1062 80 1150 64 C1240 50 1312 80 1382 65 ' +
  'C1406 60 1426 61 1440 64 L1440 110 L0 110 Z';
const WAVE_BACK =
  'M0 50 C80 36 152 66 242 52 C332 38 402 70 502 52 C602 36 672 68 772 50 ' +
  'C872 34 942 64 1042 50 C1142 36 1212 66 1312 50 C1372 41 1412 45 1440 50 ' +
  'L1440 110 L0 110 Z';

/* Convection in the pool.

   Four soft lobes drifting and deforming under the surface, so the
   espresso reads as a body of liquid rather than a rectangle of
   paint. Each lobe is a radial gradient whose softness lives in its
   colour stops — no `filter: blur()` anywhere, which matters because
   this runs underneath a scroll-scrubbed pinned stage and a
   full-frame blur would have to re-rasterise every frame. Transforms
   only: the whole layer stays on the compositor.

   Periods are deliberately non-harmonic (9 / 13 / 11 / 17 / 15s) so
   the composite never visibly loops, and the negative delays start
   each lobe mid-cycle so the field is already in motion on first
   paint instead of easing out of a shared pose.

   DOM order is paint order and it matters: the two dark masses go
   down first and the crema rides over them, which is the way round
   the real thing settles. The grain is last so it lies over the
   whole field — and it lives in here, inside the same clip, rather
   than on .pour-body, so it can never paint above the liquid line
   either. */
function LiquidFlow() {
  return (
    <div className="pour-flow" aria-hidden="true">
      {/* the lobes are wrapped so the top-edge fade can be masked onto
          them as a group WITHOUT putting a mask on .pour-flow itself —
          a mask there would make it a stacking context and cut the
          grain's screen blend off from the fill beneath it */}
      <div className="pour-lobes">
        <span className="pour-lobe pour-lobe-c" />
        <span className="pour-lobe pour-lobe-e" />
        <span className="pour-lobe pour-lobe-a" />
        <span className="pour-lobe pour-lobe-b" />
        <span className="pour-lobe pour-lobe-d" />
      </div>
      <span className="pour-grain" />
    </div>
  );
}

/* 0 → 1 across `range`, shaped by an ease-out — the scrub supplies
   position, the curve supplies weight. Matches --ease-set closely
   enough that scrubbed and transition-driven entrances agree. */
const clamp01 = (t) => (t < 0 ? 0 : t > 1 ? 1 : t);
const easeOut = (t) => 1 - (1 - t) ** 3;

function useRamp(p, [a, b]) {
  return useTransform(p, (v) => easeOut(clamp01((v - a) / (b - a))));
}

/* about.statement, pre-parsed once: *word* becomes an inked mark,
   numbered left→right across the whole block so the strokes draw in
   reading order rather than restarting on each line. */
let markCount = 0;
const STATEMENT = about.statement.map((line) =>
  line.split('*').map((text, i) => (i % 2 ? { text, mark: markCount++ } : { text }))
);

/* One word, underlined by hand.

   The squiggle is a single stroke in a 100×8 box stretched to the
   word's width (preserveAspectRatio="none"), so it fits any measure;
   non-scaling-stroke keeps the nib a constant weight through the
   stretch. pathLength="1" normalises the path so the draw is just
   dashoffset 1 → 0 — no measuring, no layout read. */
function Mark({ text, index }) {
  return (
    <span className="pour-mark" style={{ '--mi': index }}>
      {text}
      <svg
        className="pour-mark-ink"
        viewBox="0 0 100 8"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M1 5.2 C14 2 27 6.9 40 4.3 S67 1.7 80 4.9 S95 6.5 99 3.4"
          pathLength="1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </span>
  );
}

/* Shared About content — used over the liquid and in the
   reduced-motion static fallback.

   Every group takes a single 0→1 ramp as `--rv` and derives its own
   opacity, travel and stagger from it in CSS (see the stylesheet).
   NOTE: it has to be a CSS var — motion v12.42 has a bug where plain
   style-value MotionValues (opacity, pointerEvents) never re-render
   on scroll, while transforms and CSS vars do. Unset, every --rv
   falls back to 1, which is what makes this markup double as the
   static reduced-motion version. */
function AboutInk({ ruleStyle, greetStyle, setStyle, inkStyle, noteStyle, railStyle, colophonStyle }) {
  return (
    <div className="pour-about-grid">
      {/* top rule: what this is, and the one fact worth reading first */}
      <motion.div className="pour-rule" style={ruleStyle}>
        <span className="pour-rule-label">About</span>
        <span className="pour-rule-line" aria-hidden="true" />
        <span className="pour-rule-label">{meta.status}</span>
      </motion.div>

      <div className="pour-about-main">
        <motion.h2 className="pour-greeting" style={greetStyle}>
          {about.greeting}
        </motion.h2>

        {/* the statement carries the largest type in the section — it's
            the idea, not the name, that earns the display size */}
        <motion.p className="pour-statement" style={{ ...setStyle, ...inkStyle }}>
          {STATEMENT.map((line, li) => (
            <span key={li} className="pour-set-line" style={{ '--i': li }}>
              <span className="pour-set-in">
                {line.map((chunk, ci) =>
                  chunk.mark === undefined ? (
                    <span key={ci}>{chunk.text}</span>
                  ) : (
                    <Mark key={ci} text={chunk.text} index={chunk.mark} />
                  )
                )}
              </span>
            </span>
          ))}
        </motion.p>

        <motion.p className="pour-note" style={noteStyle}>
          <span className="pour-note-turn" aria-hidden="true">
            ↳
          </span>
          {about.note}
        </motion.p>
      </div>

      {/* the list is chronological, so it gets a timeline rather than
          a stack of rows — the order is information here */}
      <motion.div className="pour-rail" style={railStyle}>
        <p className="pour-rail-label">Experience</p>
        <ol className="pour-exp">
          {experience.map((e, i) => (
            <li
              key={e.org}
              className={`pour-exp-item${e.date.includes('Present') ? ' is-now' : ''}`}
              style={{ '--i': i }}
            >
              <span className="pour-exp-dot" aria-hidden="true" />
              <span className="pour-exp-date">{e.date}</span>
              <span className="pour-exp-org">{e.org}</span>
              <span className="pour-exp-role">{e.role}</span>
            </li>
          ))}
        </ol>
      </motion.div>

      {/* toolkit as a printed colophon strip, not a cloud of chips */}
      <motion.div className="pour-colophon" style={colophonStyle}>
        <span className="pour-rule-label">Toolkit</span>
        <ul className="pour-tools">
          {stack.map((it, i) => (
            <li key={it} style={{ '--i': i }}>
              {it}
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}

export default function HeroPourTransition() {
  const reduce = useReducedMotion();
  const wrapRef = useRef(null);
  const stageRef = useRef(null);
  const frameRef = useRef(null);
  const heroRef = useRef(null);

  const { scrollYProgress: p } = useScroll({
    target: wrapRef,
    offset: ['start start', 'end end'],
  });

  /* — cup — */
  const cupTilt = useTransform(p, T.cupTilt, ['0deg', `${CUP_MAX_TILT}deg`]);
  const cupShift = useTransform(p, T.cupTilt, [0, 1]);

  /* — liquid — */
  const streamScale = useTransform(p, T.stream, [0, 1]);
  const bodyY = useTransform(p, T.rise, ['100%', '0%']);
  // NOTE: no rotate on the body — even a ~1deg tilt pivots around a
  // point far below the visible surface while the body is translated
  // down, shifting the whole liquid sideways off the frame edge.

  /* — About text —
     One ramp per group; each element derives opacity, travel and its
     own stagger slot from it in CSS. Eased here rather than left
     linear: a scrub gives you position, not weight, and type that
     arrives at a constant rate reads mechanical. easeOutCubic is the
     numeric twin of --ease-set, so scrubbed entrances and the site's
     transition-driven ones land the same way. */
  const ruleRv = useRamp(p, T.rule);
  const greetRv = useRamp(p, T.greet);
  const setRv = useRamp(p, T.set);
  const inkRv = useRamp(p, T.ink);
  const noteRv = useRamp(p, T.note);
  const railRv = useRamp(p, T.rail);
  const colophonRv = useRamp(p, T.colophon);
  // overlay only intercepts clicks once it is actually visible
  const aboutPointer = useTransform(p, (v) => (v > T.rule[1] ? 'auto' : 'none'));


  /* Hero links/buttons leave the tab order once submerged (and return
     when scrolling back up). Direct DOM write — no re-render. */
  useMotionValueEvent(p, 'change', (v) => {
    const el = heroRef.current;
    if (!el) return;
    const covered = v > HERO_INERT_AT;
    if (el.inert !== covered) el.inert = covered;
  });

  /* Frame + spout geometry. The stream's centreline sits a fixed gap
     left of the tilted cup at EVERY viewport, so the pour distance
     never varies and never overlaps the mug. Above HERO_STACK_MAX the
     frame's left edge follows the stream and its right edge sits a bit
     past the portrait; below it (hero stacked, cup top-right) the frame
     stays full-width but the stream still tracks the cup. Written as
     CSS vars on the stage; re-measured after the hero entrance
     animation settles and on resize. (All rects live inside the sticky
     stage, so pin offset cancels out.) */
  useLayoutEffect(() => {
    if (reduce) return;
    const stage = stageRef.current;
    const frame = frameRef.current;
    if (!stage || !frame) return;

    const measure = () => {
      const cup = stage.querySelector('.hero-doodle');
      const portrait = stage.querySelector('.hero-portrait');
      if (!cup) {
        // CSS fallbacks take over (full-width frame, default spout)
        stage.style.removeProperty('--frame-left');
        stage.style.removeProperty('--frame-right');
        stage.style.removeProperty('--spout-y');
        stage.style.removeProperty('--stream-x');
        return;
      }
      const s = stage.getBoundingClientRect();
      const c = cup.getBoundingClientRect();

      // stream centreline: fixed gap left of the cup's leaned box
      const streamX = c.left - s.left + TILT_SHIFT_X - STREAM_GAP;

      // lip HEIGHT at full tilt — mirror the .pour-stage .hero-doodle
      // transform (rotate about origin + lean) — sets where the stream
      // starts falling from
      const rad = (CUP_MAX_TILT * Math.PI) / 180;
      const ox = c.width * TILT_ORIGIN_FX;
      const oy = c.height * TILT_ORIGIN_FY;
      const dx = c.width * LIP_FX - ox;
      const dy = c.height * LIP_FY - oy;
      const lipY =
        c.top - s.top + oy + dx * Math.sin(rad) + dy * Math.cos(rad) +
        TILT_SHIFT_Y;

      let frameLeft;
      if (window.innerWidth < HERO_STACK_MAX) {
        // stacked hero: full-width frame (mirror the CSS clamp fallback)
        frameLeft = Math.min(22, Math.max(10, window.innerWidth * 0.016));
        stage.style.setProperty('--frame-right', `${frameLeft}px`);
      } else {
        frameLeft = Math.max(8, streamX - STREAM_W / 2 - STREAM_INSET);
        if (portrait) {
          const pRight = portrait.getBoundingClientRect().right - s.left;
          stage.style.setProperty(
            '--frame-right',
            `${Math.max(8, s.width - pRight - FRAME_RIGHT_PAD)}px`
          );
        }
      }
      stage.style.setProperty('--frame-left', `${frameLeft}px`);
      stage.style.setProperty(
        '--stream-x',
        `${streamX - STREAM_W / 2 - frameLeft}px`
      );
      const frameTop = frame.getBoundingClientRect().top - s.top;
      stage.style.setProperty('--spout-y', `${lipY + SPOUT_DROP - frameTop}px`);
    };

    measure();
    // hero entrance animation translates the cup for ~1.5s — re-measure after
    const t1 = setTimeout(measure, 800);
    const t2 = setTimeout(measure, 1800);
    window.addEventListener('resize', measure);

    // window 'resize' only fires for viewport changes — it misses the
    // portrait reflowing for any other reason (a layout token change,
    // a slow web font swapping in late, CSS hot-reloading in dev). The
    // portrait's own box is what --frame-right is measured from, so
    // watching it directly re-measures whenever it actually moves.
    const portraitEl = stage.querySelector('.hero-portrait');
    const ro = portraitEl && 'ResizeObserver' in window
      ? new ResizeObserver(measure)
      : null;
    ro?.observe(portraitEl);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', measure);
      ro?.disconnect();
    };
  }, [reduce]);

  /* Reduced motion: no pin, no scrub — hero flows straight into a
     static espresso frame with the same About content. */
  if (reduce) {
    return (
      <div id="top" ref={wrapRef}>
        <Hero />
        <section id="about" className="pour-static" aria-label="About">
          {/* the lobes hold their resting pose here (CSS turns the
              animation off), so the pool still has depth without
              anything moving */}
          <LiquidFlow />
          <div className="container">
            <AboutInk />
          </div>
        </section>
      </div>
    );
  }

  return (
    <div id="top" className="pour" ref={wrapRef}>
      <motion.div
        className="pour-stage"
        ref={stageRef}
        style={{ '--cup-tilt': cupTilt, '--cup-shift': cupShift }}
      >
        <div className="pour-hero" ref={heroRef}>
          <Hero />
        </div>

        {/* liquid layer — decorative; above the hero, below the text */}
        <div className="pour-frame" ref={frameRef} aria-hidden="true">
          {/* height (not scaleY) so the rounded caps aren't squashed
              while the stream is short; routed through a CSS var per
              the motion v12.42 scroll bug */}
          <motion.div
            className="pour-stream"
            style={{ '--stream-scale': streamScale }}
          />
          <motion.div className="pour-body" style={{ y: bodyY }}>
            <div className="pour-fill" />
            {/* Convection, clipped to exactly the fill's box. Its hard
                top edge lands 2px above the wave band's bottom, so the
                crests — which paint AFTER it — cover the join. That
                ordering is the whole fix for the tinted rectangle that
                used to hang above the liquid line: nothing in this
                layer can reach the transparent area over the crest,
                where you are seeing paper rather than coffee. */}
            <LiquidFlow />
            {/* two wave trains scrolling in opposite directions at
                different speeds — the surface reads as moving liquid,
                not a printed edge. Each svg holds two identical wave
                periods so the -50% translateX loop is seamless
                (second copy overlaps 1px to hide the seam). */}
            <div className="pour-surface">
              <svg
                className="pour-wave pour-wave-b"
                viewBox="0 0 2880 110"
                preserveAspectRatio="none"
              >
                <path d={WAVE_BACK} />
                <path d={WAVE_BACK} transform="translate(1439 0)" />
              </svg>
              <svg
                className="pour-wave pour-wave-f"
                viewBox="0 0 2880 110"
                preserveAspectRatio="none"
              >
                <path d={WAVE_FRONT} />
                <path d={WAVE_FRONT} transform="translate(1439 0)" />
              </svg>
            </div>
          </motion.div>
        </div>

        {/* About content, revealed over the liquid */}
        <motion.section
          className="pour-about"
          aria-label="About"
          style={{ '--pe': aboutPointer }}
        >
          <div className="container">
            <AboutInk
              ruleStyle={{ '--rv': ruleRv }}
              greetStyle={{ '--rv': greetRv }}
              setStyle={{ '--rv': setRv }}
              inkStyle={{ '--ink': inkRv }}
              noteStyle={{ '--rv': noteRv }}
              railStyle={{ '--rv': railRv }}
              colophonStyle={{ '--rv': colophonRv }}
            />
          </div>
        </motion.section>
      </motion.div>

      {/* nav/anchor target — landing here means the fill is complete */}
      <div id="about" className="pour-anchor" aria-hidden="true" />
    </div>
  );
}
