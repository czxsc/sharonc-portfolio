import { useLayoutEffect, useRef, useState } from 'react';
import { projects } from '../data/content.js';
import { ArrowRight } from './Doodles.jsx';
import ProjectPage from './ProjectPage.jsx';
import SectionSeam from './SectionSeam.jsx';
import SetType from './SetType.jsx';
import './Work.css';

const MARK_H = 18; // px — height of the espresso tick that tracks the list

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

export default function Work() {
  const [active, setActive] = useState(0);
  const [openIndex, setOpenIndex] = useState(null); // case study overlay
  const [origin, setOrigin] = useState(null); // preview rect the overlay grows from
  const [order, setOrder] = useState(projects.map((_, i) => i));
  const [hoverTag, setHoverTag] = useState(null); // previewed via hover/focus
  const [pinTag, setPinTag] = useState(null); // clicked: sorted + held lit
  const btnRefs = useRef([]);
  const rowRefs = useRef([]);
  const markRef = useRef(null);
  const frameRef = useRef(null);
  const flipFrom = useRef(null); // row tops captured just before a sort
  const prevPos = useRef(0); // previewed row's position last time round

  // hover previews over an existing pin; second click clears both
  const litTag = hoverTag ?? pinTag;

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
    setActive(next[0]); // preview follows the row that just surfaced
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

  /* Which way the eye just travelled, handed to the preview as the
     direction its cover should wipe in from: move down the list and
     the new cover opens upward from the bottom edge, meeting you.
     Written as CSS vars rather than state — nothing here needs a
     re-render, and the class change and the direction must land in
     the same frame or the outgoing cover wipes the wrong way. */
  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const pos = order.indexOf(active);
    const dir = pos < prevPos.current ? -1 : 1; // ties keep the downward read
    prevPos.current = pos;
    frame.style.setProperty('--dir', dir);
    frame.style.setProperty('--ct', dir > 0 ? '100%' : '0%');
    frame.style.setProperty('--cb', dir > 0 ? '0%' : '100%');
  }, [active, order]);

  const rowState = (i) =>
    litTag ? (matches(i, litTag) ? 'is-lit' : 'is-faded') : '';

  /* The case study opens *out of* the preview frame, so hand the
     overlay the rect it should grow from. Measured at click time —
     the page behind is frozen from here on, so it stays valid for the
     return trip too. */
  const openProject = (i) => {
    setActive(i);
    setOpenIndex(i);
    const r = frameRef.current?.getBoundingClientRect();
    setOrigin(r ? { top: r.top, left: r.left, width: r.width, height: r.height } : null);
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
    else setActive(i);
  };

  const closeProject = () => {
    const i = openIndex;
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
        <SectionSeam folio="02 — WORK" note={`${projects.length} selected`} />

        <div className="section-head">
          <SetType as="h2" lines="Projects" />
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
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
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

          {/* preview — stacked covers, wiped in the direction the
              selection just moved (see the --dir effect above) */}
          <div className="work-preview reveal" aria-hidden="true">
            <div className="work-frame" ref={frameRef}>
              {projects.map((p, i) => (
                <div
                  key={p.name}
                  className={`preview-item ${i === active ? 'is-active' : ''}`}
                  style={{ '--t1': p.tone[0], '--t2': p.tone[1] }}
                >
                  <div className="preview-bar">
                    <span className="preview-dots"><i /><i /><i /></span>
                    <span className="preview-url">{p.name.toLowerCase().replace(/\s+/g, '')}.app</span>
                  </div>
                  <div className="preview-body">
                    <img className="preview-img" src={p.image} alt="" />
                    <div className="preview-label">
                      <span className="preview-blurb">{p.blurb}</span>
                      <span className="preview-meta">{p.tech.join(' · ')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {openIndex !== null && (
        <ProjectPage
          index={openIndex}
          origin={origin}
          onNavigate={setOpenIndex}
          onClose={closeProject}
        />
      )}
    </section>
  );
}
