import { useCallback, useLayoutEffect, useRef, useState } from 'react';
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
  const [order, setOrder] = useState(projects.map((_, i) => i));
  const [hoverTag, setHoverTag] = useState(null); // previewed via hover/focus
  const [pinTag, setPinTag] = useState(null); // clicked: sorted + held lit
  const btnRefs = useRef([]);
  const rowRefs = useRef([]);
  const markRef = useRef(null);
  const frameRef = useRef(null);
  const flipFrom = useRef(null); // row tops captured just before a sort

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
    setActive(i);
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

          {/* preview — stacked covers, the active one developing up
              through the ones behind it (see Work.css) */}
          <div className="work-preview reveal" aria-hidden="true">
            {/* `is-held`: while the overlay is up, the frame changes
                project without animating. Nobody can see a crossfade
                that happens under a full-screen page — but the
                closing flight has to land on this exact box, and a
                frame still easing into place is a box that has moved
                by the time the picture gets there. */}
            <div
              className={`work-frame ${openIndex !== null ? 'is-held' : ''}`}
              ref={frameRef}
            >
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
          getOrigin={getFrameRect}
          onNavigate={openProject}
          onClose={closeProject}
        />
      )}
    </section>
  );
}
