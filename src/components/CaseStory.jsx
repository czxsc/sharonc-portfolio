import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import ArchSwitch from './ArchSwitch.jsx';
import Walkthrough from './Walkthrough.jsx';
import { useInViewPlayback, useLoopToggle } from '../hooks/useVideoPlayback.js';
import './CaseStory.css';

/* ------------------------------------------------------------------
   The visual-first case study, for projects that define `page.story`.
   The idea is a ratio: a few sentences, then something to look at, with
   a rail at the side so nobody has to read in order to find their
   place. Longer text is kept for where it earns it, which is the
   reasoning behind a decision, how the thing is built, and the takeaways.

   Data shape (page.story):
   [{ id, label, eyebrow, title, text?, blocks: [block] }]

   Every block may have `id` and `nav`, which give it an entry in the
   rail under its group, plus `title` and `text`. By `kind`:
     part         a labelled divider between runs of blocks
     video        { video, poster, ratio?, alt }
     trio         { items: [{ icon, title, text }] }  three icon cards
     pair         { items: [{ src, alt }] }  two screens side by side
     compare      { before, after }
                  a side is { src | video, label, alt? }. Screens are 16:10
                  unless they say `ratio`, which holds a cut's own shape
                  while it loads. Without it the page grows mid-scroll and
                  a rail jump lands short.
     columns      { columns: [{ title, items: [{ name, note }] }] }
     architecture see ArchSwitch.jsx
     reflections  { items: [{ title, text }], closer?: { gif, still, width, height } }
   ------------------------------------------------------------------ */

const reduceMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// how hard the rail's dot is pulled toward its target; about 0.4s to arrive
const DOT_PULL = 15;

/* ---------- the rail ----------
   Where the reader is, worked out from the scroll container rather than
   an IntersectionObserver: "the last heading above this line" has one
   answer at every scroll position, including in the gaps between
   sections where an observer would report nothing at all. */
export function StoryRail({ story, scrollRef }) {
  const groups = useMemo(
    () =>
      story.map((g) => ({
        id: g.id,
        label: g.label,
        items: g.blocks.filter((b) => b.nav),
      })),
    [story]
  );
  const [active, setActive] = useState(story[0].id);
  const navRef = useRef(null);
  const listRef = useRef(null);
  const dotRef = useRef(null);
  const dotState = useRef({ x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, raf: 0, last: 0, placed: false });
  // set while a rail click is scrolling, so the dot goes straight to the
  // section asked for instead of calling at every one on the way past
  const jumping = useRef(false);
  const jumpTimer = useRef(0);

  useEffect(() => {
    const box = scrollRef.current;
    if (!box) return;
    const ids = groups.flatMap((g) => [g.id, ...g.items.map((b) => b.id)]);
    let frame = 0;
    const measure = () => {
      frame = 0;
      if (jumping.current) return;
      const line = window.innerHeight * 0.35;
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    /* The jump is over once the scroll settles, or the moment the reader
       takes the wheel back. Nothing re-measures here: landing on a section
       shouldn't move the dot off the one that was clicked. */
    const endJump = () => {
      jumping.current = false;
      clearTimeout(jumpTimer.current);
    };
    box.addEventListener('scroll', onScroll, { passive: true });
    box.addEventListener('scrollend', endJump);
    box.addEventListener('wheel', endJump, { passive: true });
    box.addEventListener('touchstart', endJump, { passive: true });
    measure();
    return () => {
      box.removeEventListener('scroll', onScroll);
      box.removeEventListener('scrollend', endJump);
      box.removeEventListener('wheel', endJump);
      box.removeEventListener('touchstart', endJump);
      cancelAnimationFrame(frame);
      clearTimeout(jumpTimer.current);
    };
  }, [groups, scrollRef]);

  /* One dot travelling the list, the same idea as the site's main nav (see
     Nav.jsx): it stretches along its path, so a long trip reads as further
     than a short one. Nav.jsx plays a fixed animation per change, which is
     fine for four stops. Here scrolling can change the target several times
     a second, and restarting from the last stop each time made the dot hop.
     So this is a critically damped spring chasing the current target. A new
     target only changes where it's headed, never where it is or how fast
     it's going, and the stretch comes straight from its speed. */
  useLayoutEffect(() => {
    const s = dotState.current;
    const draw = (stretch) => {
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${s.x}px, ${s.y}px) scaleY(${1 + stretch})`;
      }
    };
    const tick = (now) => {
      const dt = Math.min((now - s.last) / 1000, 1 / 30);
      s.last = now;
      s.vx += (DOT_PULL * DOT_PULL * (s.tx - s.x) - 2 * DOT_PULL * s.vx) * dt;
      s.vy += (DOT_PULL * DOT_PULL * (s.ty - s.y) - 2 * DOT_PULL * s.vy) * dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      const settled =
        Math.abs(s.tx - s.x) + Math.abs(s.ty - s.y) < 0.1 && Math.abs(s.vx) + Math.abs(s.vy) < 2;
      if (settled) {
        Object.assign(s, { x: s.tx, y: s.ty, vx: 0, vy: 0, raf: 0 });
        draw(0);
        return;
      }
      draw(Math.min(Math.abs(s.vy) / 150, 2.4));
      s.raf = requestAnimationFrame(tick);
    };
    const place = (animate) => {
      const list = listRef.current;
      const link = list?.querySelector('.st-rail-link.is-active');
      if (!link) return;
      const l = list.getBoundingClientRect();
      const r = link.getBoundingClientRect();
      if (!r.height) return; // a sub-item hidden in the narrow strip
      s.tx = link.closest('.st-rail-sub') ? 12 : 0;
      s.ty = r.top - l.top + r.height / 2 - 2.5;
      if (!animate || !s.placed || reduceMotion()) {
        cancelAnimationFrame(s.raf);
        Object.assign(s, { x: s.tx, y: s.ty, vx: 0, vy: 0, raf: 0, placed: true });
        draw(0);
      } else if (!s.raf) {
        s.last = performance.now();
        s.raf = requestAnimationFrame(tick);
      }
    };

    place(true);
    const onResize = () => place(false);
    window.addEventListener('resize', onResize);
    // Once only: this promise has long since resolved on any later section
    // change, so hooking it every time would snap the dot on every move.
    if (!s.fontsHooked) {
      s.fontsHooked = true;
      document.fonts?.ready.then(() => place(false));
    }
    return () => window.removeEventListener('resize', onResize);
  }, [active]);
  useEffect(() => {
    const s = dotState.current;
    return () => cancelAnimationFrame(s.raf);
  }, []);

  /* In the narrow strip there are more parts than fit across, so the
     current one is kept in view. */
  useEffect(() => {
    const nav = navRef.current;
    if (!nav || nav.scrollWidth <= nav.clientWidth) return;
    const link = nav.querySelector('li.is-current > .st-rail-link');
    if (!link) return;
    nav.scrollTo({
      left: link.offsetLeft - (nav.clientWidth - link.offsetWidth) / 2,
      behavior: reduceMotion() ? 'auto' : 'smooth',
    });
  }, [active]);

  /* Links rather than buttons, since each one is a place on the page.
     Focus follows the jump, so a keyboard reader carries on from the
     section they asked for rather than from the rail. */
  const jump = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    jumping.current = true;
    clearTimeout(jumpTimer.current);
    jumpTimer.current = setTimeout(() => {
      jumping.current = false; // for browsers without a scrollend event
    }, 1600);
    setActive(id);
    el.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
    el.focus({ preventScroll: true });
  };

  const inGroup = (g) => active === g.id || g.items.some((b) => b.id === active);

  return (
    <nav className="st-rail" aria-label="On this page" ref={navRef}>
      <div className="st-rail-list" ref={listRef}>
        <span className="st-rail-dot" ref={dotRef} aria-hidden="true" />
        <ol>
          {groups.map((g) => (
            <li key={g.id} className={inGroup(g) ? 'is-current' : ''}>
              <a
                href={`#${g.id}`}
                className={`st-rail-link ${active === g.id ? 'is-active' : ''}`}
                aria-current={active === g.id ? 'location' : undefined}
                onClick={(e) => jump(e, g.id)}
              >
                {g.label}
              </a>
              {g.items.length > 0 && (
                <ol className="st-rail-sub">
                  {g.items.map((b) => (
                    <li key={b.id}>
                      <a
                        href={`#${b.id}`}
                        className={`st-rail-link ${active === b.id ? 'is-active' : ''}`}
                        aria-current={active === b.id ? 'location' : undefined}
                        onClick={(e) => jump(e, b.id)}
                      >
                        {b.nav}
                      </a>
                    </li>
                  ))}
                </ol>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}

/* ---------- the story ---------- */
export function StoryBody({ story }) {
  return story.map((g) => (
    <section className="st-group" key={g.id}>
      <header>
        <p className="st-eyebrow">{g.eyebrow}</p>
        <h2 id={g.id} className="st-anchor st-title" tabIndex={-1}>
          {g.title}
        </h2>
        {g.text && <p className="st-text">{g.text}</p>}
      </header>
      {g.blocks.map((b, i) => (
        <Block block={b} key={b.id ?? b.title ?? i} />
      ))}
    </section>
  ));
}

function Block({ block: b }) {
  if (b.kind === 'part') {
    return (
      <h3 id={b.id} className="st-anchor st-part" tabIndex={-1}>
        {b.title}
      </h3>
    );
  }
  return (
    <div className="st-block">
      {b.title && (
        <h3 id={b.id} className="st-anchor st-block-title" tabIndex={b.id ? -1 : undefined}>
          {b.title}
        </h3>
      )}
      {b.text && <p className="st-text">{b.text}</p>}
      {b.kind === 'video' && (
        <Walkthrough
          media={{ video: b.video, src: b.poster, ratio: b.ratio, label: b.alt }}
          className="st-video"
        />
      )}
      {b.kind === 'trio' && <Trio items={b.items} />}
      {b.kind === 'pair' && <Pair items={b.items} />}
      {b.kind === 'compare' && (b.before.video ? <RecordedPair b={b} /> : <ScreenPair b={b} />)}
      {b.kind === 'columns' && <Columns columns={b.columns} />}
      {b.kind === 'architecture' && <ArchSwitch block={b} />}
      {b.kind === 'reflections' && <Reflections items={b.items} closer={b.closer} />}
    </div>
  );
}

/* Pixel art, so it's sized to a whole multiple of its 32px grid in CSS and
   never smoothed. Decorative: the heading beside it says what it means. */
function Trio({ items }) {
  return (
    <ul className="st-trio">
      {items.map((it) => (
        <li key={it.title}>
          <img className="st-trio-icon" src={it.icon} alt="" loading="lazy" width="32" height="32" />
          <h3>{it.title}</h3>
          <p>{it.text}</p>
        </li>
      ))}
    </ul>
  );
}

function Pair({ items }) {
  return (
    <div className="st-compare">
      {items.map((it) => (
        <img key={it.src} src={it.src} alt={it.alt} loading="lazy" />
      ))}
    </div>
  );
}

function ScreenPair({ b }) {
  return (
    <figure className="st-compare">
      {[b.before, b.after].map((side) => (
        <div className="st-compare-side" key={side.label}>
          <span className="st-tag">{side.label}</span>
          <img
            src={side.src}
            alt={side.alt ?? ''}
            loading="lazy"
            style={side.ratio ? { aspectRatio: side.ratio } : undefined}
          />
        </div>
      ))}
    </figure>
  );
}

/* Two recordings that play as a set. They don't loop on their own: the
   shorter one holds its last frame until the longer one finishes and both
   restart together, so every pass lines up like the first. */
function RecordedPair({ b }) {
  const [playing, toggle] = useLoopToggle();
  const ref = useInViewPlayback(playing);
  return (
    <figure className="st-compare" ref={ref}>
      {[b.before, b.after].map((side) => (
        <div className="st-compare-side" key={side.label}>
          <span className="st-tag">{side.label}</span>
          <video
            src={side.video}
            muted
            playsInline
            preload="metadata"
            aria-label={side.label}
            onClick={toggle}
          />
        </div>
      ))}
      <button type="button" className="pp-video-toggle" onClick={toggle}>
        {playing ? 'Pause' : 'Play'}
      </button>
    </figure>
  );
}

function Columns({ columns }) {
  return (
    <div className="st-columns">
      {columns.map((c) => (
        <div className="st-column" key={c.title}>
          <h4>{c.title}</h4>
          <ul>
            {c.items.map((it) => (
              <li key={it.name}>
                <strong>{it.name}</strong>
                <span>{it.note}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/* `closer` is a small moving sprite to end the page on. A <picture> because a
   GIF can't be paused: under reduced motion the browser takes the still. */
function Reflections({ items, closer }) {
  return (
    <div className="st-closing">
      <ul className="st-reflections">
        {items.map((it) => (
          <li key={it.title}>
            <h3>{it.title}</h3>
            <p>{it.text}</p>
          </li>
        ))}
      </ul>
      {closer && (
        <picture className="st-closer">
          <source srcSet={closer.gif} media="(prefers-reduced-motion: no-preference)" />
          <img src={closer.still} alt="" width={closer.width} height={closer.height} loading="lazy" />
        </picture>
      )}
    </div>
  );
}
