import { useLayoutEffect, useRef } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useReducedMotion,
} from 'motion/react';
import Hero from './Hero.jsx';
import { about, experience, stack } from '../data/content.js';
import './HeroPourTransition.css';

/* ==================================================================
   Scroll choreography.

   The runway (.pour) is 230vh tall (see CSS); the stage stays pinned
   for the first 130vh of it (230vh − 100vh viewport). Every timing
   below is a fraction (0 → 1) of that pinned distance.

   TUNE: shift these windows to re-time the sequence. Keep them in
   order and slightly overlapping — the overlap is what makes the
   pour read as one continuous gesture instead of four steps.
   ================================================================== */
const T = {
  cupTilt: [0.04, 0.18], // cup rotates into the pour
  stream: [0.18, 0.28], // stream falls only once the cup is fully tilted
  rise: [0.28, 0.84], // fill rises the moment the stream lands — no
  //                     horizontal run, so nothing depends on frame width
  heading: [0.58, 0.72], // "About" ghosts in as fill passes mid-viewport
  body: [0.66, 0.8], // lead + paragraphs, once the liquid is under them
  list: [0.72, 0.86], // experience + toolkit column arrives last
};

const CUP_MAX_TILT = -42; // deg — final pouring angle of the cup
const HERO_INERT_AT = 0.62; // hero unfocusable once mostly submerged

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

/* Shared About content — used over the liquid and in the
   reduced-motion static fallback. */
function AboutInk({ headStyle, bodyStyle, listStyle }) {
  return (
    <div className="pour-about-grid">
      {/* NOTE: opacity is driven via --op (see CSS) — motion v12.42 has a
          bug where plain style-value MotionValues (opacity, pointerEvents)
          never re-render on scroll, while transforms and CSS vars do. */}
      {/* title lives inside the left column so the Experience column
          top-aligns with it instead of hanging below the heading */}
      <div className="pour-about-main">
        <motion.h2 className="pour-about-title" style={headStyle}>
          Hello, I&rsquo;m Sharon!
        </motion.h2>
        <motion.div className="pour-about-body" style={bodyStyle}>
          <p className="pour-about-lead">{about.lead}</p>
          {about.body.map((p, i) => (
            <p key={i} className="pour-about-para">
              {p}
            </p>
          ))}
        </motion.div>
      </div>

      <motion.div className="pour-about-side" style={listStyle}>
        <p className="pour-side-label">Experience</p>
        <ol className="pour-exp-list">
          {experience.map((e) => (
            <li key={e.org} className="pour-exp-item">
              <span className="pour-exp-date">{e.date}</span>
              <span className="pour-exp-org">{e.org}</span>
              <span className="pour-exp-role">{e.role}</span>
            </li>
          ))}
        </ol>

        <p className="pour-side-label pour-toolkit-label">Toolkit</p>
        <ul className="pour-chips">
          {stack.map((it) => (
            <li key={it}>{it}</li>
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

  /* — About text — (linear on purpose: the scrub itself provides the
     easing; T's windows control how gradual each entrance feels) */
  const headOp = useTransform(p, T.heading, [0, 1]);
  const headY = useTransform(p, T.heading, [28, 0]);
  const bodyOp = useTransform(p, T.body, [0, 1]);
  const bodyLift = useTransform(p, T.body, [24, 0]);
  const listOp = useTransform(p, T.list, [0, 1]);
  const listLift = useTransform(p, T.list, [24, 0]);
  // overlay only intercepts clicks once it is actually visible
  const aboutPointer = useTransform(p, (v) =>
    v > T.heading[0] ? 'auto' : 'none'
  );


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
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', measure);
    };
  }, [reduce]);

  /* Reduced motion: no pin, no scrub — hero flows straight into a
     static espresso frame with the same About content. */
  if (reduce) {
    return (
      <div id="top" ref={wrapRef}>
        <Hero />
        <section id="about" className="pour-static" aria-label="About">
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
            <div className="pour-fill" />
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
              headStyle={{ '--op': headOp, y: headY }}
              bodyStyle={{ '--op': bodyOp, y: bodyLift }}
              listStyle={{ '--op': listOp, y: listLift }}
            />
          </div>
        </motion.section>
      </motion.div>

      {/* nav/anchor target — landing here means the fill is complete */}
      <div id="about" className="pour-anchor" aria-hidden="true" />
    </div>
  );
}
