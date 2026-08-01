import { useEffect, useRef, useState } from 'react';
import { hobbies } from '../data/content.js';
import HobbyPage from './HobbyPage.jsx';
import SetType from './SetType.jsx';
import laptopImg from '../assets/play/laptop.webp';
import coffeeImg from '../assets/play/coffee.webp';
import controllerImg from '../assets/play/controller.webp';
import headphonesImg from '../assets/play/headphones.webp';
import sketchbookImg from '../assets/play/sketchbook.webp';
import f0 from '../assets/play/cat_push_bag/f0.webp';
import f1 from '../assets/play/cat_push_bag/f1.webp';
import f2 from '../assets/play/cat_push_bag/f2.webp';
import f3 from '../assets/play/cat_push_bag/f3.webp';
import f4 from '../assets/play/cat_push_bag/f4.webp';
import f5 from '../assets/play/cat_push_bag/f5.webp';
import f6 from '../assets/play/cat_push_bag/f6.webp';
import f7 from '../assets/play/cat_push_bag/f7.webp';
import './Play.css';

/* ------------------------------------------------------------------
   The knock used to be the gif itself (cat_push_bag.gif, since deleted),
   bookended by stills. That can't hold sync: a gif's clock starts on
   decode, not on the render that set its src, and a browser re-showing
   an already-cached animated image picks up wherever the shared clock
   happens to be — so on a second visit it would resume mid-fall, wrap,
   and freeze on an arbitrary frame while the spill fired on its own
   schedule.

   So we own the clock. The gif's frames are unpacked to webp (frames 6
   and 7 of the original were byte-identical, hence 8 files for 9
   frames) and stepped through here, which makes the spill land on an
   actual frame rather than near one.
   ------------------------------------------------------------------ */
const FRAMES = [f0, f1, f2, f3, f4, f5, f6, f7];
// when each frame gives way to the next, ms — the original gif delays
// (130, 130, 130, 390, 130, 650+130, 130), last frame held indefinitely
const FRAME_END = [130, 260, 390, 780, 910, 1690, 1820];
const LAST = FRAMES.length - 1;
const SPILL_FRAME = 6; // the bag tips on this one — let go of the items with it

const imgMap = {
  laptop: laptopImg,
  coffee: coffeeImg,
  controller: controllerImg,
  headphones: headphonesImg,
  sketchbook: sketchbookImg,
};

/* ------------------------------------------------------------------
   Shelf layout.

   What spills out of the bag comes to rest ON something: one hairline
   runs from under the tote to the edge of the section, every object
   sits its own bottom edge on it, and each object's name hangs off the
   underside of the line directly below it. Objects alone on paper read
   as clip art — the line and the labels are what make it a shelf.

   Every number below is a percentage of the scene's own width, and
   .bag-scene is a size container, so `1cqw` turns each one into
   length. That is the whole reason the old --k fudge factor is gone:
   the composition is defined once and scales exactly, and the entry
   offsets keep pointing at the bag's mouth at any width.

     x   the object's left edge — and its label's, and the left end of
         the stretch of shelf it owns. One number, because the column
         IS the object's footprint: the espresso tick that lights on
         hover then measures out exactly the thing you are pointing at.
     s   object width (the files are trimmed to their own edges by
         scripts/trim-play-cutouts.py, so this IS the visible size)
     ar  the file's own height ÷ width — the two numbers that follow
         are what turn a column width into the drawn object's real
         footprint, which is what the hover wash and the contact point
         have to be measured against
     hg  the share of that height taken by something thin dangling
         below the object proper (only the sketchbook has one: its
         bookmark ribbon). Left out, it would be the ribbon's tip
         standing on the shelf with the book floating above it
     r   resting tilt, deg; pivoted on the contact point, not the
         centre, so the tilt reads as "set down at an angle" rather
         than "sinking through the shelf"
     fy  where the object waits before the spill: up at the bag's
         mouth. fx is derived from the mouth's x, below.
     row which shelf it lands on (mobile splits into two; desktop is
         one, so every desktop row is 0)

   `mob` overrides the lot below 760px, where five objects can't share
   a phone's width — see the reorganised two-shelf layout there.
   ------------------------------------------------------------------ */

/* The bag's mouth, in scene-width percent. Both numbers are read off
   the last frame of the knock — the tote's opening sits at ~0.76 of
   the drawing's width — so they track --cat-w in the stylesheet. */
const MOUTH_X = 24;
const MOUTH_X_MOB = 39.5;

const LAYOUT = [
  // Stories — first out, and the one that lands nearest the tote. Flat
  // on its face and the widest silhouette of the five, so it carries
  // more weight than its number suggests and is set a size below it
  { x: 32, s: 9.3, ar: 0.835, r: -2.4, fy: -7, mob: { x: 50, s: 19.5, r: -2.4, fy: -11, row: 1 } },
  // Drink making — the smallest thing on the shelf by some way. Its
  // label is the longest, which is why it gets the widest gap after it
  { x: 46.5, s: 5, ar: 1.277, r: 1.8, fy: -7, mob: { x: 74, s: 10, r: 1.8, fy: -11, row: 1 } },
  { x: 60, s: 8, ar: 0.912, r: -1.8, fy: -7, mob: { x: 2, s: 21, r: -1.8, fy: -45, row: 0 } },
  { x: 72.5, s: 6.6, ar: 1.157, r: 2.6, fy: -7, mob: { x: 33, s: 17, r: 2.6, fy: -45, row: 0 } },
  // Art — the sketchbook ends the shelf, the largest thing on it. It
  // is also the object that used to vanish into the paper, which the
  // contact shadow fixes
  { x: 85, s: 10.2, ar: 0.889, hg: 0.23, r: -1.4, fy: -7, mob: { x: 62, s: 24, r: -1.4, fy: -45, row: 0 } },
];

// how many shelves the mobile layout needs — drives the extra rule
const MOB_ROWS = 1 + Math.max(...LAYOUT.map((c) => c.mob.row));

/* ------------------------------------------------------------------
   The hover wash.

   It used to be a circle 112% of the column's width, which meant its
   size tracked one edge of a cut-out rather than the cut-out: the
   coffee cup (tall, narrow) got a disc smaller than itself while the
   sticker-covered laptop (wide, flat) got one half again bigger than
   the object inside it, and side by side they read as different
   effects rather than the same one.

   So it is measured off the drawn object instead — the geometric mean
   of its width and its body height, which is a fair single number for
   "how big is this thing" whichever way it is proportioned — and then
   pulled halfway toward the average of the five. Halfway, because
   neither extreme is right: sized purely per object the discs vary as
   much as the objects do, and one shared size would swallow the coffee
   cup whole. The result is a family that reads as one effect while
   still admitting the sketchbook is bigger than the espresso glass.
   ------------------------------------------------------------------ */
const DOT_BLEND = 0.5; // 0 = each object's own size, 1 = one size for all
const DOT_K = 1.34; // how far the disc stands off the object it sits behind

const bodyH = (c, s) => s * c.ar * (1 - (c.hg ?? 0)); // minus what dangles
const massOf = (c, s) => Math.sqrt(s * bodyH(c, s));
const dotSizes = (widthOf) => {
  const m = LAYOUT.map((c) => massOf(c, widthOf(c)));
  const mean = m.reduce((a, b) => a + b, 0) / m.length;
  return m.map((v) => DOT_K * (v + (mean - v) * DOT_BLEND));
};
const DOTS_D = dotSizes((c) => c.s);
const DOTS_M = dotSizes((c) => c.mob.s);

/* One object's custom properties, both layouts at once.

   Note the -d suffix on the desktop set: these arrive as inline style,
   which outranks every stylesheet rule, so a media query can't be the
   thing that overrides them. Both layouts are handed over under names
   nothing reads directly, and Play.css picks which one --x, --s and
   the rest resolve to. */
const slotVars = (i) => {
  const c = LAYOUT[i % LAYOUT.length];
  const j = i % LAYOUT.length;
  return {
    '--x-d': c.x,
    '--s-d': c.s,
    '--r-d': `${c.r}deg`,
    '--fx-d': MOUTH_X - (c.x + c.s / 2), // travel back to the mouth
    '--fy-d': c.fy,
    '--row-d': 0,
    // sunk by whatever hangs below the object, so it is the object that
    // stands on the shelf and the ribbon that drapes over the edge
    '--dy-d': c.s * c.ar * (c.hg ?? 0),
    '--dot-d': DOTS_D[j],
    '--x-m': c.mob.x,
    '--s-m': c.mob.s,
    '--r-m': `${c.mob.r}deg`,
    '--fx-m': MOUTH_X_MOB - (c.mob.x + c.mob.s / 2),
    '--fy-m': c.mob.fy,
    '--row-m': c.mob.row,
    '--dy-m': c.mob.s * c.ar * (c.hg ?? 0),
    '--dot-m': DOTS_M[j],
    '--i': i,
  };
};

export default function Play() {
  const sceneRef = useRef(null);
  const [phase, setPhase] = useState('idle'); // idle → playing → done
  const [frame, setFrame] = useState(0);
  const [spilled, setSpilled] = useState(false);
  const phaseRef = useRef(phase); // observers outlive renders
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  const resetTimerRef = useRef(null);
  const framePool = useRef(null); // decoded frames, kept alive (see below)
  const btnRefs = useRef([]); // to return focus after a mini-page closes
  const objRefs = useRef([]); // the hover wash — where the iris starts
  const [active, setActive] = useState(null); // { hobby, index, origin }

  /* iris origin = the centre of the hover wash, in viewport coords —
     the circle the iris is supposed to grow out of, so the two agree by
     construction rather than by two sets of numbers happening to
     match. (The button is the whole column, object + caption, so that
     the caption is part of the target; its centre would put the iris
     down in the text. The wash's own scale is about its centre, so an
     un-hovered one measures the same point as a hovered one.) */
  const openHobby = (hobby, index) => {
    const rect = objRefs.current[index].getBoundingClientRect();
    setActive({
      hobby,
      index,
      origin: {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      },
    });
  };

  const closeHobby = () => {
    const { index } = active;
    setActive(null);
    // after the overlay unmounts and #root sheds `inert` — a focus()
    // into an inert subtree is silently ignored
    requestAnimationFrame(() =>
      btnRefs.current[index]?.focus({ preventScroll: true })
    );
  };

  /* Playback. One rAF-driven clock rather than a chain of setTimeouts:
     the frame is a function of elapsed time, so a stalled main thread
     costs a frame instead of pushing everything after it late — and a
     backgrounded tab pauses rather than running the knock out of sight.
     Cleanup stops it the instant phase moves on. */
  useEffect(() => {
    if (phase !== 'playing') return;
    let raf = 0;
    const start = performance.now();
    const tick = (now) => {
      const t = now - start;
      let i = 0;
      while (i < FRAME_END.length && t >= FRAME_END[i]) i++;
      setFrame(i);
      if (i >= SPILL_FRAME) setSpilled(true);
      if (i < LAST) raf = requestAnimationFrame(tick);
      else setPhase('done'); // landed — hold the last frame
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    // fetch AND decode every frame up front, and hold the Image objects
    // for the page's life so nothing gets evicted: a decode landing
    // mid-knock would blank the swap and drop a frame
    framePool.current = FRAMES.map((src) => {
      const img = new Image();
      img.src = src;
      img.decode?.().catch(() => {});
      return img;
    });

    // play when the scene reaches the middle band of the viewport
    // (rootMargin shrinks the trigger area to the central 20%), so the
    // moment isn't missed while the section is still near the fold
    const trigger = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || phaseRef.current !== 'idle') return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          setPhase('done'); // skip straight to the aftermath
          setFrame(LAST);
          setSpilled(true);
          return;
        }
        setPhase('playing');
      },
      { rootMargin: '-40% 0px -40% 0px', threshold: 0 }
    );

    // once the scene is fully out of sight, rewind to the first-frame
    // still so scrolling back replays the whole knock. Debounced —
    // on lower-power hardware a busy main thread can make the observer
    // report a spurious one-frame "not intersecting" blip mid-scroll,
    // which would otherwise restart the whole knock (and visibly pop
    // the gif back to its first frame) even though the scene never
    // really left view
    const reset = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          clearTimeout(resetTimerRef.current);
          return;
        }
        resetTimerRef.current = setTimeout(() => {
          setPhase('idle');
          setFrame(0);
          setSpilled(false);
        }, 200);
      },
      { threshold: 0 }
    );

    trigger.observe(scene);
    reset.observe(scene);
    return () => {
      clearTimeout(resetTimerRef.current);
      trigger.disconnect();
      reset.disconnect();
    };
  }, []);

  return (
    <section id="play" className="section play">
      <div className="container">
        <div className="section-head">
          <SetType as="h2" lines="Play" />
          <p className="head-note reveal" style={{ '--reveal-delay': '0.24s' }}>
            Dabbling in a bit of everything.
          </p>
        </div>

        <div
          ref={sceneRef}
          className={`bag-scene ${spilled ? 'is-spilled' : ''}`}
        >
          <img
            className="bag-cat reveal"
            src={FRAMES[frame]}
            width="1000"
            height="702"
            alt="A drawn black cat knocking over a tote bag"
          />

          {/* the shelf everything lands on. Drawn rather than simply
              present: it arrives with the spill, left to right. */}
          <span className="bag-shelf" aria-hidden="true" />
          {MOB_ROWS > 1 && (
            <span className="bag-shelf bag-shelf-upper" aria-hidden="true" />
          )}

          <ul className="bag-items">
            {hobbies.map((h, i) => (
              <li
                key={h.title}
                className={`bag-item ${active?.index === i ? 'is-opened' : ''}`}
                style={{ ...slotVars(i), '--tone': h.tone }}
              >
                <button
                  ref={(el) => (btnRefs.current[i] = el)}
                  className="bag-item-btn"
                  onClick={() => openHobby(h, i)}
                  tabIndex={spilled ? 0 : -1}
                >
                  <span className="bag-obj">
                    <span className="bag-obj-in">
                      <span
                        className="bag-dot"
                        aria-hidden="true"
                        ref={(el) => (objRefs.current[i] = el)}
                      />
                      <img src={imgMap[h.icon]} alt="" />
                    </span>
                  </span>
                  <span className="bag-cap">
                    <span className="bag-cap-rule" aria-hidden="true" />
                    <span className="bag-title">{h.title}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {active && (
        <HobbyPage
          hobby={active.hobby}
          img={imgMap[active.hobby.icon]}
          origin={active.origin}
          onClose={closeHobby}
        />
      )}
    </section>
  );
}
