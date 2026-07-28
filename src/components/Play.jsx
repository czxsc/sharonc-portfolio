import { useEffect, useRef, useState } from 'react';
import { hobbies } from '../data/content.js';
import HobbyPage from './HobbyPage.jsx';
import SetType from './SetType.jsx';
import laptopImg from '../assets/laptop.webp';
import coffeeImg from '../assets/coffee.webp';
import controllerImg from '../assets/controller.webp';
import headphonesImg from '../assets/headphones.webp';
import sketchbookImg from '../assets/sketchbook.webp';
import f0 from '../assets/cat_push_bag/f0.webp';
import f1 from '../assets/cat_push_bag/f1.webp';
import f2 from '../assets/cat_push_bag/f2.webp';
import f3 from '../assets/cat_push_bag/f3.webp';
import f4 from '../assets/cat_push_bag/f4.webp';
import f5 from '../assets/cat_push_bag/f5.webp';
import f6 from '../assets/cat_push_bag/f6.webp';
import f7 from '../assets/cat_push_bag/f7.webp';
import './Play.css';

/* ------------------------------------------------------------------
   The knock used to be the gif itself (src/assets/cat_push_bag.gif),
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

/* Scatter layout (scrapbook flat-lay, see references/whats_in_bag_ref.jpg):
   x/y — final position, % of the scene box
   r/s — resting rotation (deg) and item width (px)
   fx/fy — entry offset in px back toward the tipped bag's mouth
           (desktop scale; CSS multiplies by --k on small screens)
   One slot per hobby, in hobbies order. Two ride high, three stagger
   below — the gap that leaves at mid-right is deliberate, not a hole
   where a seventh thing used to be. */
const SCATTER = [
  { x: 47, y: 10, r: -7, s: 150, fx: -105, fy: 300 },
  { x: 47, y: 56, r: -5, s: 116, fx: -105, fy: 58 },
  { x: 70, y: 12, r: 10, s: 132, fx: -380, fy: 300 },
  { x: 84, y: 42, r: -9, s: 122, fx: -552, fy: 135 },
  { x: 63, y: 62, r: 6, s: 120, fx: -294, fy: 20 },
];

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
  const [active, setActive] = useState(null); // { hobby, index, origin }

  // iris origin = the item's center, in viewport coords
  const openHobby = (hobby, index) => {
    const rect = btnRefs.current[index].getBoundingClientRect();
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
          <ul className="bag-items">
            {hobbies.map((h, i) => {
              const c = SCATTER[i % SCATTER.length];
              return (
                <li
                  key={h.title}
                  className={`bag-item ${active?.index === i ? 'is-opened' : ''}`}
                  style={{
                    '--x': `${c.x}%`,
                    '--y': `${c.y}%`,
                    '--r': `${c.r}deg`,
                    '--s': `${c.s}px`,
                    '--fx': `${c.fx}px`,
                    '--fy': `${c.fy}px`,
                    '--i': i,
                    '--tone': h.tone,
                  }}
                >
                  <button
                    ref={(el) => (btnRefs.current[i] = el)}
                    className="bag-item-btn"
                    onClick={() => openHobby(h, i)}
                    aria-label={`${h.title} — ${h.note}`}
                    tabIndex={spilled ? 0 : -1}
                  >
                    <span className="bag-dot" aria-hidden="true" />
                    <img src={imgMap[h.icon]} alt="" />
                    <span className="bag-label" aria-hidden="true">
                      {h.title}
                    </span>
                  </button>
                </li>
              );
            })}
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
