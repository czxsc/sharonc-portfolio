import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { projects } from '../data/content.js';
import { projectIndexFromPath } from '../routes.js';
import { ArrowRight } from './Doodles.jsx';
import ProjectPage from './ProjectPage.jsx';
import SetType from './SetType.jsx';
import { ProjectCover } from './SheetWindow.jsx';
import './Work.css';

const MARK_H = 18; // px — height of the espresso tick that tracks the list

/* How long the pointer has to rest on a row before the picture commits
   to it. Below the ~150ms where a delay starts to register, and long
   enough that rows merely crossed on the way somewhere else never reach
   the frame at all — running the cursor down the list is one journey,
   not six. The row and the tick don't wait for this; they're cheap and
   they're meant to track the cursor. */
const DWELL_MS = 110;

/* Premium easing (see the motion notes on .preview-item): symmetric,
   no overshoot, nothing that reads as a bounce. */
const EASE = 'cubic-bezier(0.4, 0, 0.2, 1)';
const EASE_SETTLE = 'cubic-bezier(0.16, 1, 0.3, 1)'; // long tail on the scale

/* disciplines worth a filter button — tags shared by 2+ projects
   (singletons like Autonomous Systems would just re-sort one row) */
const TAGS = (() => {
  const counts = new Map();
  projects.forEach((p) =>
    p.category.split(' · ').forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1))
  );
  return [...counts.keys()]
    .filter((t) => counts.get(t) >= 2)
    .sort((a, b) => counts.get(b) - counts.get(a));
})();

const matches = (i, tag) => projects[i].category.split(' · ').includes(tag);

/* `previewRef` mirrors `shown` for SheetFlip, whose card has to wear
   the same cover the frame is showing or the hand-off would change
   project as well as element. A ref, not state lifted into App: this
   changes on every hover, and re-rendering the page for it would
   re-run the About section's scroll transforms.
   `flight` is false only under reduced motion, where no card exists. */
export default function Work({ previewRef, flight = false }) {
  /* A case study can be arrived at directly (/dishcovery). It is the
     same overlay either way — the URL only decides whether it is
     already up on the first frame, and the index behind it starts on
     that project rather than on the first one, so closing returns to
     the row it would have been opened from. */
  const [entry] = useState(projectIndexFromPath); // linked-to project, or null
  const [deep, setDeep] = useState(entry !== null); // true until that first close

  const [active, setActive] = useState(entry ?? 0); // the row under the cursor
  const [shown, setShown] = useState(entry ?? 0); // the cover the frame has settled on
  const [openIndex, setOpenIndex] = useState(entry); // case study overlay
  const [order, setOrder] = useState(projects.map((_, i) => i));
  const [hoverTag, setHoverTag] = useState(null); // previewed via hover/focus
  const [pinTag, setPinTag] = useState(null); // clicked: sorted + held lit
  const btnRefs = useRef([]);
  const rowRefs = useRef([]);
  const markRef = useRef(null);
  const frameRef = useRef(null);
  const itemRefs = useRef([]); // the stacked covers
  const flipFrom = useRef(null); // row tops captured just before a sort
  const dwellRef = useRef(null);
  const zRef = useRef(1); // stacking counter — see the frame effect below
  const lastShown = useRef(0);

  // hover previews over an existing pin; second click clears both
  const litTag = hoverTag ?? pinTag;

  /* Pointing at a row: the row lights now, the picture waits to see
     whether you meant it. */
  const previewRow = (i) => {
    setActive(i);
    clearTimeout(dwellRef.current);
    dwellRef.current = setTimeout(() => setShown(i), DWELL_MS);
  };
  /* A press, a tap, a filter click — the choice is already deliberate,
     so there's nothing left for the dwell to establish. */
  const showNow = (i) => {
    clearTimeout(dwellRef.current);
    setActive(i);
    setShown(i);
  };
  useEffect(() => () => clearTimeout(dwellRef.current), []);

  const pickTag = (tag) => {
    flipFrom.current = new Map(
      order.map((i) => [i, rowRefs.current[i]?.getBoundingClientRect().top])
    );
    if (pinTag === tag) {
      // second click: drop the highlight, restore the original order
      setPinTag(null);
      setHoverTag(null);
      setOrder(projects.map((_, i) => i));
      return;
    }
    const next = [
      ...order.filter((i) => matches(i, tag)),
      ...order.filter((i) => !matches(i, tag)),
    ];
    setPinTag(tag);
    setOrder(next);
    showNow(next[0]); // preview follows the row that just surfaced
  };

  // FLIP: slide rows from their pre-sort spots into the new order
  useLayoutEffect(() => {
    const from = flipFrom.current;
    flipFrom.current = null;
    if (!from) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    for (const [i, top] of from) {
      const el = rowRefs.current[i];
      if (!el || top == null) continue;
      const dy = top - el.getBoundingClientRect().top;
      if (dy) {
        el.animate(
          [{ transform: `translateY(${dy}px)` }, { transform: 'none' }],
          { duration: 520, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
        );
      }
    }
  }, [order]);

  /* The tick that tracks the list.
     A row lighting up is a state change; a marker sliding to it is a
     movement, and movement is what makes running down the index feel
     like moving a bookmark rather than toggling six buttons. Driven
     off offsetTop (layout position) rather than a rect, so a sort's
     FLIP transforms mid-flight can't drag it off course. */
  useLayoutEffect(() => {
    const row = rowRefs.current[active];
    const mark = markRef.current;
    if (!row || !mark) return;
    const y = row.offsetTop + row.offsetHeight / 2 - MARK_H / 2;
    mark.style.transform = `translateY(${y}px)`;
  }, [active, order]);

  /* ---- the frame changing project -------------------------------
     A crossfade is the obvious answer and it's the one that flashed:
     two stacked panels dissolving through each other are both partly
     transparent at the halfway mark, so the frame's dark ground shows
     between them — a dip, on every single change.

     So nothing here dissolves *out*. Every cover is opaque all the
     time and the only question is which is on top: the incoming one
     fades up over the one it replaces, which stays whole underneath
     until it's completely covered. There is no midpoint where you can
     see through to the ground, and therefore no flash.

     That leaves interruption, which on a hover-driven list is the
     normal case and not the edge case. These are Web Animations, not
     CSS transitions, and they are deliberately never cancelled: a
     cover deposed halfway through its own arrival keeps right on
     going to opaque underneath its replacement. Nothing snaps back,
     nothing reverses, nothing has a direction to be caught travelling
     the wrong way in. Run the list at any speed and the worst you get
     is a soft stack of blooms.

     Three layers, in the order they read:
       primary   the cover arrives                    (480ms)
       secondary the shot develops out of its tone    (720ms)
       ambient   the frame settles inward, and the
                 copy lands last                      (900ms / 440ms)
     --------------------------------------------------------------- */
  useLayoutEffect(() => {
    if (previewRef) previewRef.current = shown;
    const el = itemRefs.current[shown];
    if (!el) return;
    // Recency stacking. Whatever was on screen a moment ago is the
    // thing directly beneath the incoming cover — which is the whole
    // premise above, and it can't be left to DOM order.
    el.style.zIndex = ++zRef.current;

    const from = lastShown.current;
    lastShown.current = shown;
    if (from === shown) return; // first paint, or a re-render that changed nothing
    // Under an open case study the frame changes project without
    // animating: nobody can see it happen, and the closing flight has
    // to land on a box that has stopped moving.
    if (openIndex !== null) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const img = el.querySelector('.preview-img');
    const label = el.querySelector('.preview-label');

    el.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 480,
      easing: EASE,
    });
    // always inward, never from a direction the last input chose
    el.animate([{ transform: 'scale(1.02)' }, { transform: 'scale(1)' }], {
      duration: 900,
      easing: EASE_SETTLE,
    });
    // the tone establishes first and the screenshot resolves out of
    // it — a print developing rather than a slide changing
    img?.animate(
      [{ opacity: 0.42 }, { opacity: 0.42, offset: 0.24 }, { opacity: 1 }],
      { duration: 720, easing: EASE }
    );
    label?.animate(
      [
        { opacity: 0, transform: 'translateY(10px)' },
        { opacity: 1, transform: 'none' },
      ],
      { duration: 440, delay: 160, easing: EASE, fill: 'backwards' }
    );
  }, [shown, openIndex, previewRef]);

  const rowState = (i) =>
    litTag ? (matches(i, litTag) ? 'is-lit' : 'is-faded') : '';

  /* Where the case study grows out of, and returns to: the preview
     shot the reader was already looking at.

     A function rather than a rect captured on open, because the two
     flights happen at different times and only one of them can trust
     a stale measurement. The return has to land on wherever the
     frame is *now* — after a scroll restore, a resize, a filter sort
     that reflowed the list beside it. Measuring live costs one
     getBoundingClientRect per flight and can't drift.

     What's reported is the <img> box, not the frame: the frame
     includes the faux window bar, and half the reason the old
     transition landed wrong was that it aimed the picture at a box
     ~34px taller than the one the picture is actually in. The
     natural size and crop alignment travel with it — the flight has
     to reproduce *this* crop (top-anchored cover) at its far end,
     and it can't read those off an image it doesn't have. */
  const getFrameRect = useCallback(() => {
    const img = frameRef.current?.querySelector('.preview-item.is-active img');
    const r = img?.getBoundingClientRect();
    if (!r?.width || !img.naturalWidth) return null;
    const cs = getComputedStyle(img);
    return {
      box: { top: r.top, left: r.left, width: r.width, height: r.height },
      nw: img.naturalWidth,
      nh: img.naturalHeight,
      fit: cs.objectFit,
      position: cs.objectPosition,
    };
  }, []);

  /* Opening and paging both move the index behind the overlay, not
     just the overlay. Nobody sees it happen — the page is covered —
     but it's what the reader returns to, and it's what the closing
     flight lands in: page ←/← to a third project and close, and the
     picture settles into a frame already showing that project rather
     than dissolving into a different one. */
  const openProject = (i) => {
    showNow(i); // the flight grows out of this frame — no pending dwell
    setOpenIndex(i);
  };

  // desktop hover already previews a row before it's clicked, so a mouse
  // click always lands on an already-active row and opens straight away.
  // Touch has no hover: a tap here is the first the row's heard from the
  // user, so let that tap preview it (crossfade the image up top) and
  // require a second tap — now on an already-active row — to commit.
  // Keyboard focus sets `active` the same way hover does, so Enter on a
  // tabbed-to row still opens on the first press.
  const pressRow = (i) => {
    if (active === i) openProject(i);
    else showNow(i); // the tap itself is the dwell
  };

  /* Where the index belongs behind a case study that was linked to
     rather than opened: at Work, with the preview frame the closing
     flight is about to land in sitting a third of the way down the
     viewport.

     That third is not arbitrary. The frame is hidden until SheetFlip's
     card has finished its own flight and handed over (see SheetFlip),
     and this is comfortably past the point where the card has locked
     onto the frame's geometry — so whichever of the two is showing
     when the overlay dissolves, it is the same picture in the same
     place, and the returning hero lands on it either way. */
  const workLanding = useCallback(() => {
    const el = frameRef.current;
    if (!el) return 0;
    const top = el.getBoundingClientRect().top + window.scrollY;
    return Math.max(0, Math.round(top - window.innerHeight * 0.3));
  }, []);

  const closeProject = () => {
    const i = openIndex;
    setDeep(false); // the URL got us here once; not again
    setOpenIndex(null);
    setActive(i);
    // after the overlay unmounts and #root sheds `inert` — a focus()
    // into an inert subtree is silently ignored
    requestAnimationFrame(() =>
      btnRefs.current[i]?.focus({ preventScroll: true })
    );
  };

  return (
    <section id="work" className="section work">
      <div className="container">
        <div className="section-head">
          <SetType as="h2" lines="Work" />
          <div
            className="work-filters reveal"
            style={{ '--reveal-delay': '0.22s' }}
            role="group"
            aria-label="Sort projects by discipline"
          >
            {TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                className={`work-filter ${pinTag === tag ? 'is-on' : ''}`}
                onMouseEnter={() => setHoverTag(tag)}
                onMouseLeave={() =>
                  setHoverTag((t) => (t === tag ? null : t))
                }
                onFocus={() => setHoverTag(tag)}
                onBlur={() => setHoverTag((t) => (t === tag ? null : t))}
                onClick={() => pickTag(tag)}
                aria-pressed={pinTag === tag}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="work-gallery">
          {/* list — rows set line by line, in the order they read */}
          <ol className="work-list reveal">
            {/* the tick rides in the gutter the active row's indent
                opens up, so the two moves are one gesture */}
            <span className="work-mark" ref={markRef} aria-hidden="true" />
            {order.map((i, pos) => {
              const p = projects[i];
              return (
                <li
                  key={p.name}
                  className="work-row"
                  style={{ '--i': pos }}
                  ref={(el) => (rowRefs.current[i] = el)}
                >
                  <button
                    type="button"
                    ref={(el) => (btnRefs.current[i] = el)}
                    className={`work-item ${i === active ? 'is-active' : ''} ${rowState(i)}`}
                    onMouseEnter={() => previewRow(i)}
                    onFocus={() => previewRow(i)}
                    onClick={() => pressRow(i)}
                    aria-label={
                      i === active
                        ? `Open ${p.name} case study`
                        : `Preview ${p.name}`
                    }
                  >
                    <span className="work-index">{p.index}</span>
                    <span className="work-name">{p.name}</span>
                    <span className="work-cat">{p.category}</span>
                    <ArrowRight size={15} className="work-arrow" />
                  </button>
                </li>
              );
            })}
          </ol>

          {/* preview — a stack of opaque covers; the one on top is the
              one you see, and arrivals fade up over it (see the frame
              effect above).

              No `.reveal` when SheetFlip is running: the frame's
              entrance IS the card landing in it, and a reveal here
              would both double that and translate the box the flight
              measured its landing from. */}
          <div
            className={`work-preview${flight ? '' : ' reveal'}`}
            aria-hidden="true"
          >
            <div className="work-frame" ref={frameRef}>
              {projects.map((p, i) => (
                <div
                  key={p.name}
                  ref={(el) => (itemRefs.current[i] = el)}
                  className={`preview-item ${i === shown ? 'is-active' : ''}`}
                  style={{ '--t1': p.tone[0], '--t2': p.tone[1] }}
                >
                  <ProjectCover project={p} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {openIndex !== null && (
        <ProjectPage
          index={openIndex}
          getOrigin={getFrameRect}
          deep={deep}
          landing={workLanding}
          onNavigate={openProject}
          onClose={closeProject}
        />
      )}
    </section>
  );
}
