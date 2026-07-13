import { useEffect, useRef, useState } from 'react';
import { hobbies } from '../data/content.js';
import HobbyPage from './HobbyPage.jsx';
import laptopImg from '../assets/laptop.webp';
import bookImg from '../assets/book.webp';
import coffeeImg from '../assets/coffee.webp';
import controllerImg from '../assets/controller.webp';
import headphonesImg from '../assets/headphones.webp';
import sketchbookImg from '../assets/sketchbook.webp';
import bagGif from '../assets/cat_push_bag.gif';
import bagStart from '../assets/cat_push_bag_start.png';
import bagEnd from '../assets/cat_push_bag_end.png';
import './Play.css';

/* ------------------------------------------------------------------
   The gif loops forever on its own, so it's bookended by stills:
   first-frame still → (scrolled into view) the gif itself → swap to a
   last-frame still just before the loop wraps. Both stills are
   extracted from the gif (src/assets/cat_push_bag_*.png).
   ------------------------------------------------------------------ */
const GIF_TOTAL_MS = 2470; // 19 frames × 130ms — from the gif metadata
const KNOCK_MS = 1900; // ~frame 15: the bag is visibly down; spill starts
const END_SWAP_MS = GIF_TOTAL_MS - 90; // freeze just before the loop wraps

const imgMap = {
  laptop: laptopImg,
  book: bookImg,
  coffee: coffeeImg,
  controller: controllerImg,
  headphones: headphonesImg,
  sketchbook: sketchbookImg,
};

/* Scatter layout (scrapbook flat-lay, see references/whats_in_bag_ref.jpg):
   x/y — final position, % of the scene box
   r/s — resting rotation (deg) and item width (px)
   fx/fy — entry offset in px back toward the tipped bag's mouth
           (desktop scale; CSS multiplies by --k on small screens) */
const SCATTER = [
  { x: 48, y: 12, r: -7, s: 150, fx: -118, fy: 284 },
  { x: 62, y: 44, r: 8, s: 128, fx: -290, fy: 140 },
  { x: 49, y: 60, r: -5, s: 112, fx: -142, fy: 60 },
  { x: 76, y: 12, r: 10, s: 132, fx: -437, fy: 295 },
  { x: 87, y: 44, r: -9, s: 118, fx: -565, fy: 120 },
  { x: 68, y: 72, r: 6, s: 116, fx: -354, fy: -20 },
];

export default function Play() {
  const sceneRef = useRef(null);
  const [phase, setPhase] = useState('idle'); // idle → playing → done
  const [spilled, setSpilled] = useState(false);
  const phaseRef = useRef(phase); // observers outlive renders
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  const resetTimerRef = useRef(null);
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

  /* Drives the knock off `phase` itself rather than the gif's onLoad —
     an <img>'s load event only fires when its src attribute actually
     changes, and a quick scroll-past-and-back can flip phase
     idle→playing→idle→playing fast enough that intermediate renders
     never commit, so the src is left unchanged and no load event ever
     fires. Keying off `phase` sidesteps that entirely: React guarantees
     the effect (re)runs whenever phase settles on 'playing', and its
     cleanup cancels the timers the instant phase moves on. */
  useEffect(() => {
    if (phase !== 'playing') return;
    const knock = setTimeout(() => setSpilled(true), KNOCK_MS);
    const done = setTimeout(() => setPhase('done'), END_SWAP_MS);
    return () => {
      clearTimeout(knock);
      clearTimeout(done);
    };
  }, [phase]);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    // warm the HTTP cache WITHOUT an <img> preload — browsers sync
    // same-URL gif animations, so a hidden preloader would already
    // have run the clock down before the visible copy appears
    fetch(bagGif, { cache: 'force-cache' }).catch(() => {});

    // play when the scene reaches the middle band of the viewport
    // (rootMargin shrinks the trigger area to the central 20%), so the
    // moment isn't missed while the section is still near the fold
    const trigger = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || phaseRef.current !== 'idle') return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          setPhase('done'); // skip straight to the aftermath
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

  const src =
    phase === 'playing' ? bagGif : phase === 'done' ? bagEnd : bagStart;

  return (
    <section id="play" className="section play">
      <div className="container">
        <div className="section-head reveal">
          <h2>Off the Clock</h2>
          <p className="head-note">Dabbling in a bit of everything.</p>
        </div>

        <div
          ref={sceneRef}
          className={`bag-scene ${spilled ? 'is-spilled' : ''}`}
        >
          <img
            className="bag-gif"
            src={src}
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
