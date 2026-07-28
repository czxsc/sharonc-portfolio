import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useOverlayPage } from '../hooks/useOverlayPage.js';
import './HobbyPage.css';

/* ------------------------------------------------------------------
   Full-screen hobby mini-page, revealed by an iris that grows from the
   clicked item (see Play.jsx). The iris is two transform-scaled circle
   elements — scale stays on the compositor, so the growth is smooth
   where an animated clip-path would repaint every frame. The tone
   circle leads, the page-ground circle follows (a brief colored rim,
   as in motion.dev's "curtains" iris), then the content fades in
   above them. Closing reverses the pair; overlay plumbing (scroll
   lock, Esc, browser back, focus) lives in useOverlayPage.
   ------------------------------------------------------------------ */

// must cover the CSS transition durations + stagger in HobbyPage.css
const CLOSE_MS = 720;

// radius that covers the viewport from the iris origin
const coverRadius = ({ x, y }) =>
  Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  ) + 24;

export default function HobbyPage({ hobby, img, origin, onClose }) {
  const [radius, setRadius] = useState(() => coverRadius(origin));
  const backRef = useRef(null);
  const { state, requestClose } = useOverlayPage({
    slug: hobby.slug,
    closeMs: CLOSE_MS,
    onClose,
    focusRef: backRef,
  });

  // keep the open iris covering the viewport if the window grows
  useEffect(() => {
    const onResize = () => setRadius(coverRadius(origin));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [origin]);

  // the iris circles, sized to cover the viewport from the click point
  const circleStyle = {
    left: origin.x - radius,
    top: origin.y - radius,
    width: radius * 2,
    height: radius * 2,
  };

  return createPortal(
    <div
      className={`hp ${state === 'open' ? 'is-open' : ''} ${
        state === 'closing' ? 'is-closing' : ''
      }`}
      style={{ '--tone': hobby.tone }}
    >
      <div className="hp-circle hp-circle-tone" style={circleStyle} aria-hidden="true" />
      <div className="hp-circle hp-circle-page" style={circleStyle} aria-hidden="true" />
      <div
        className="hp-scroll"
        role="dialog"
        aria-modal="true"
        aria-label={hobby.title}
        data-lenis-prevent
      >
        <div className="hp-page">
          <button ref={backRef} className="hp-back" onClick={requestClose}>
            <span className="hp-back-ring" aria-hidden="true">
              <svg viewBox="0 0 16 16" fill="none" strokeWidth="1.6">
                <path d="M10.5 3 5.5 8l5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            Back
          </button>

          {/* a masthead rather than a stacked title block: the tagline
              sits beside the name instead of under it, so the whole
              header costs one band of height and the content below it
              starts inside the first screen */}
          <header className="hp-head">
            {/* name and tagline travel as one unit: they keep their own
                baseline pairing, and the unit as a whole centres against
                the icon instead of hanging off its bottom edge */}
            <div className="hp-head-text">
              <div className="hp-head-id">
                <p className="eyebrow">Off the clock</p>
                <h1>{hobby.title}</h1>
              </div>
              <p className="hp-tagline">{hobby.page.tagline}</p>
            </div>
            <img className="hp-icon" src={img} alt="" />
          </header>

          {hobby.slug === 'music' ? (
            <MusicBlocks blocks={hobby.page.blocks} />
          ) : hobby.slug === 'gaming' ? (
            <GamingBlocks blocks={hobby.page.blocks} />
          ) : hobby.slug === 'stories' ? (
            <StoriesBlocks blocks={hobby.page.blocks} />
          ) : (
            <div className="hp-blocks">
              {hobby.page.blocks.map((b, i) => (
                <Block key={i} block={b} />
              ))}
            </div>
          )}

          <footer className="hp-foot">
            <button className="ulink hp-foot-back" onClick={requestClose}>
              ← Back to the bag
            </button>
          </footer>
        </div>
      </div>
    </div>,
    document.body
  );
}

function Block({ block }) {
  return (
    <section className="hpb">
      {block.title && (
        <h2 className="hpb-label">
          <span>{block.title}</span>
        </h2>
      )}

      {block.kind === 'text' &&
        block.body.map((p, i) => (
          <p className="hpb-p" key={i}>
            {p}
          </p>
        ))}

      {block.kind === 'list' && (
        <ul className="hpb-list">
          {block.items.map((it) => (
            <li key={it.name}>
              <span className="hpb-name">{it.name}</span>
              {it.meta && <span className="hpb-meta">{it.meta}</span>}
              {it.note && <span className="hpb-note">{it.note}</span>}
            </li>
          ))}
        </ul>
      )}

      {block.kind === 'specs' && (
        <dl className="hpb-specs">
          {block.rows.map((r) => (
            <div key={r.label}>
              <dt>{r.label}</dt>
              <dd>{r.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {block.kind === 'gallery' && (
        <div className="hpb-gallery">
          {block.items.map((it) => (
            <figure className="hp-frame" key={it.caption}>
              {it.src ? (
                <img src={it.src} alt={it.caption} loading="lazy" />
              ) : (
                <div className="hp-ph" role="img" aria-label={`${it.caption} — image coming soon`}>
                  soon
                </div>
              )}
              <figcaption>{it.caption}</figcaption>
            </figure>
          ))}
        </div>
      )}

      {block.kind === 'carousel' && (
        <Carousel items={block.items} direction={block.direction} />
      )}

      {block.kind === 'image' && (
        <figure className={`hp-accent ${block.align === 'right' ? 'hp-accent-right' : ''}`}>
          <img src={block.src} alt={block.caption || ''} loading="lazy" />
          {block.caption && <figcaption>{block.caption}</figcaption>}
        </figure>
      )}
    </section>
  );
}

/* Music gets its own composition rather than the generic stacked
   blocks: a tracklist beside the Receiptify slip (the two belong
   together), then the concert carousel opened up wider as the
   closing, most visual moment. The piano pull-quote closes the
   tracklist column instead of taking a band of its own — the slip is
   printed tall, so the column beside it has the height to spare and
   the carousel starts that much sooner. */
function MusicBlocks({ blocks }) {
  const list = blocks.find((b) => b.kind === 'list');
  const receipt = blocks.find((b) => b.kind === 'image');
  const quote = blocks.find((b) => b.kind === 'text');
  const carousel = blocks.find((b) => b.kind === 'carousel');

  return (
    <div className="hp-music">
      <div className="hpm-top">
        <div className="hpm-tracks">
          <h2 className="hpb-label">
            <span>{list.title}</span>
            <span className="hpm-eq" aria-hidden="true">
              <i /><i /><i />
            </span>
          </h2>
          <ol className="hpm-tracklist">
            {list.items.map((it, i) => (
              <li key={it.name}>
                <span className="hpm-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="hpm-info">
                  <span className="hpm-name">{it.name}</span>
                  {it.meta && <span className="hpm-meta">{it.meta}</span>}
                </span>
                {it.note && <span className="hpm-note">{it.note}</span>}
              </li>
            ))}
          </ol>

          {quote && (
            <blockquote className="hpm-quote">
              {quote.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </blockquote>
          )}
        </div>

        {receipt && (
          <figure className="hpm-receipt">
            <img src={receipt.src} alt={receipt.caption || ''} loading="lazy" />
            {receipt.caption && <figcaption>{receipt.caption}</figcaption>}
          </figure>
        )}
      </div>

      {carousel && (
        <section className="hpm-live">
          <h2 className="hpb-label">
            <span>{carousel.title}</span>
          </h2>
          <Carousel items={carousel.items} direction={carousel.direction} />
        </section>
      )}
    </div>
  );
}

/* Stories — books and screens on one page, so the composition has to
   hold both without turning into two unrelated lists stacked up. The
   reading half leads as a shelf of taped-in jackets: the covers are
   the content, so each one carries only its title, its author and its
   year. Watching follows underneath as three columns, each led by a
   die-cut sticker of the show — outlined in white, stuck on at an
   angle, so that half of the page reads as picked out by hand rather
   than as the shelf's list a second time. Only the two section labels
   carry rules; nothing else here is divided.
   Blocks are picked by `id` rather than kind. */
function StoriesBlocks({ blocks }) {
  const by = Object.fromEntries(blocks.map((b) => [b.id, b]));
  const { read, watched } = by;

  return (
    <div className="hp-stories">
      <section className="hps-read">
        <h2 className="hpb-label">
          <span>{read.title}</span>
        </h2>
        {/* laid out rather than gridded: the jackets sit at slightly
            different rotations and heights, so the row reads as pinned
            up by hand and not as six cells of a table */}
        <ul className="hps-shelf">
          {read.items.map((it) => (
            <li key={it.name}>
              <figure className="hps-book">
                <span className="hps-tape" aria-hidden="true" />
                <img src={it.src} alt={`${it.name} — cover`} loading="lazy" />
                <figcaption>
                  <span className="hps-title">{it.name}</span>
                  {/* author and year sit at opposite ends of the card,
                      and drop to two lines rather than breaking around
                      a separator when the name is a long one */}
                  <span className="hps-by">
                    <span>{it.by}</span>
                    <span>{it.year}</span>
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </section>

      <section className="hps-watch">
        <h2 className="hpb-label">
          <span>{watched.title}</span>
        </h2>
        {/* the sticker holds its own column to the left of everything
            the row says, centred against the whole text block rather
            than against any one line of it */}
        <ul className="hps-shows">
          {watched.items.map((it) => (
            <li key={it.name}>
              <span className="hps-sticker">
                <img src={it.src} alt={`${it.name} — sticker`} loading="lazy" />
              </span>
              <span className="hps-show-body">
                <span className="hps-tag">{it.meta}</span>
                <span className="hps-title">{it.name}</span>
                <span className="hps-note">{it.note}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

/* Gaming, like music, gets a composition rather than stacked blocks.
   The machine opens the page: tagline, a line of genre tags, then the
   annotated build photo, which is the only saturated image here and
   the strongest thing on it. The lists follow underneath in bands of
   paired columns — the three beside what's loaded now, then the shelf
   beside the queue — so what would have been five stacked sections is
   two. Blocks are picked by `id` because there are four lists and
   `kind` can't tell them apart. */
function GamingBlocks({ blocks }) {
  const by = Object.fromEntries(blocks.map((b) => [b.id, b]));
  const { genres, faves, now, shelf, queue, build } = by;

  return (
    <div className="hp-gaming">
      {/* one line of tags rather than a list of rows — the genres are a
          shape of taste, not six lines of reading. Sits directly under
          the tagline it qualifies, at the page's own left edge so it
          lines up with the photo below it. */}
      {genres && (
        <p className="hpg-genres">
          <span className="hpg-genres-lead">{genres.lead}</span>
          {genres.items.map((g) => (
            <span className="hpg-tag" key={g}>
              {g}
            </span>
          ))}
        </p>
      )}

      {build && <BuildMap block={build} />}

      <div className="hpg-col hpg-band">
        {faves && <FavesList block={faves} />}

        {now && (
          <section>
            <h2 className="hpb-label">
              <span>{now.title}</span>
            </h2>
            <ul className="hpb-list">
              {now.items.map((it) => (
                <li key={it.name}>
                  <span className="hpb-name">{it.name}</span>
                  {it.meta && <span className="hpb-meta">{it.meta}</span>}
                  {it.note && <span className="hpb-note">{it.note}</span>}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* the two short lists pair off in a band of their own — neither
          carries notes, so they stay shallow beside each other. Same
          template as the band above so the columns line up. */}
      <div className="hpg-col hpg-band">
        {shelf && (
          <section>
            <h2 className="hpb-label">
              <span>{shelf.title}</span>
            </h2>
            <ul className="hpg-shelf">
              {shelf.items.map((it) => (
                <li key={it.name}>
                  <span className="hpg-shelf-name">{it.name}</span>
                  {it.meta && <span className="hpg-shelf-meta">{it.meta}</span>}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* the only genuinely ordered list on the page, so it's the
            only one that gets numbers */}
        {queue && (
          <section>
            <h2 className="hpb-label">
              <span>{queue.title}</span>
            </h2>
            <ol className="hpg-queue">
              {queue.items.map((it, i) => (
                <li key={it.name}>
                  <span className="hpg-queue-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="hpg-queue-name">{it.name}</span>
                  {it.note && <span className="hpg-queue-note">{it.note}</span>}
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    </div>
  );
}

/* A favourite carrying a `shot` lets you look into the save file: hover
   the row and the photo rides beside the cursor, trailing it by a frame
   or two so it reads as paper being carried rather than pinned to the
   pointer. Keyboard and touch have no cursor to follow, so there the
   same photo parks beside the row instead. Titles with no shot stay
   plain text — the other two can land whenever their screenshots do. */
const PEEK_LAG = 0.16; // per-frame approach to the cursor
const PEEK_GAP = 28; // cursor-to-card breathing room
const PEEK_EDGE = 16; // keep the card off the viewport edges
const PEEK_OUT_MS = 200; // matches the fade-out in HobbyPage.css

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function FavesList({ block }) {
  const [peek, setPeek] = useState(null); // { item, anchored } | null
  const [leaving, setLeaving] = useState(false);
  const cardRef = useRef(null);
  const target = useRef({ x: 0, y: 0 }); // where the card wants to be
  const pos = useRef({ x: 0, y: 0 }); // where it currently is
  const cursor = useRef({ x: 0, y: 0 });
  const anchor = useRef(null); // row rect, for the no-cursor case
  const outTimer = useRef(0);

  useEffect(() => () => clearTimeout(outTimer.current), []);

  const size = () => {
    const el = cardRef.current;
    return { w: el ? el.offsetWidth : 480, h: el ? el.offsetHeight : 300 };
  };

  // beside the cursor, flipping to its left when the right edge is close
  const aimAtCursor = () => {
    const { x, y } = cursor.current;
    const { w, h } = size();
    const fitsRight = x + PEEK_GAP + w < window.innerWidth - PEEK_EDGE;
    target.current = {
      x: fitsRight ? x + PEEK_GAP : x - PEEK_GAP - w,
      y: clamp(y - h / 2, PEEK_EDGE, window.innerHeight - h - PEEK_EDGE),
    };
  };

  // beside the row, same flip rule
  const aimAtRow = () => {
    const r = anchor.current;
    if (!r) return;
    const { w, h } = size();
    const fitsRight = r.right + PEEK_GAP + w < window.innerWidth - PEEK_EDGE;
    target.current = {
      x: fitsRight
        ? r.right + PEEK_GAP
        : clamp(r.left - PEEK_GAP - w, PEEK_EDGE, window.innerWidth - w - PEEK_EDGE),
      y: clamp(r.top - 12, PEEK_EDGE, window.innerHeight - h - PEEK_EDGE),
    };
  };

  const show = (item, anchored) => {
    clearTimeout(outTimer.current);
    setLeaving(false);
    setPeek({ item, anchored });
  };

  const hide = () => {
    if (!peek || leaving) return;
    setLeaving(true);
    outTimer.current = setTimeout(() => {
      setPeek(null);
      setLeaving(false);
    }, PEEK_OUT_MS);
  };

  // place the card the moment it exists, so it never flashes at 0,0
  useEffect(() => {
    if (!peek || !cardRef.current) return;
    if (peek.anchored) aimAtRow();
    else aimAtCursor();
    pos.current = { ...target.current };
    cardRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [peek]);

  // the trailing follow — a plain lerp toward the cursor, transform only
  useEffect(() => {
    if (!peek || peek.anchored) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame = 0;
    const step = () => {
      const p = pos.current;
      const t = target.current;
      if (reduced) {
        p.x = t.x;
        p.y = t.y;
      } else {
        p.x += (t.x - p.x) * PEEK_LAG;
        p.y += (t.y - p.y) * PEEK_LAG;
      }
      if (cardRef.current) {
        cardRef.current.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [peek]);

  // a parked card would drift away from its row on scroll
  useEffect(() => {
    if (!peek?.anchored) return;
    const onScroll = () => hide();
    window.addEventListener('scroll', onScroll, { capture: true, passive: true });
    return () => window.removeEventListener('scroll', onScroll, { capture: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [peek]);

  return (
    <section>
      <h2 className="hpb-label">
        <span>{block.title}</span>
      </h2>
      <ul className="hpg-faves">
        {block.items.map((it) => (
          <li
            key={it.name}
            className={it.shot ? 'has-shot' : ''}
            onPointerEnter={(e) => {
              if (!it.shot || e.pointerType !== 'mouse') return;
              cursor.current = { x: e.clientX, y: e.clientY };
              show(it, false);
            }}
            onPointerMove={(e) => {
              if (!it.shot || e.pointerType !== 'mouse') return;
              cursor.current = { x: e.clientX, y: e.clientY };
              if (peek && !peek.anchored) aimAtCursor();
            }}
            onPointerLeave={(e) => {
              if (e.pointerType === 'mouse') hide();
            }}
          >
            {it.shot ? (
              <button
                type="button"
                className="hpg-fave-name hpg-fave-peek-btn"
                /* touch has no hover — tap parks the photo beside the row */
                onPointerUp={(e) => {
                  if (e.pointerType === 'mouse') return;
                  if (peek?.item === it && peek.anchored) {
                    hide();
                    return;
                  }
                  anchor.current = e.currentTarget.getBoundingClientRect();
                  show(it, true);
                }}
                onFocus={(e) => {
                  anchor.current = e.currentTarget.getBoundingClientRect();
                  show(it, true);
                }}
                onBlur={hide}
                aria-label={`${it.name}. Screenshot: ${it.shot.alt}`}
              >
                {it.name}
              </button>
            ) : (
              <span className="hpg-fave-name">{it.name}</span>
            )}
            <span className="hpg-fave-meta">{it.meta}</span>
            <span className="hpg-fave-note">{it.note}</span>
          </li>
        ))}
      </ul>

      {peek &&
        createPortal(
          <div className="hpg-peek" ref={cardRef} aria-hidden="true">
            <figure className={`hpg-peek-card ${leaving ? 'is-out' : ''}`}>
              <img src={peek.item.shot.src} alt="" />
              {peek.item.shot.caption && <figcaption>{peek.item.shot.caption}</figcaption>}
            </figure>
          </div>,
          document.body
        )}
    </section>
  );
}

/* The build photo, annotated. Each visible part has a marker pinned at
   a percentage position on the image, so the markers track the photo at
   any width without measuring. Markers are the focusable control (the
   ledger rows mirror them on hover); parts that aren't in the shot get
   no marker at all rather than a guessed one. */
function BuildMap({ block }) {
  const [active, setActive] = useState(null); // part label | null
  const pinned = block.parts.filter((p) => p.x != null && p.y != null);

  return (
    <section
      className={`hpg-build ${active ? 'has-active' : ''}`}
      onPointerLeave={(e) => {
        // a touch pointer "leaves" straight after the tap — keep the pick
        if (e.pointerType !== 'touch') setActive(null);
      }}
    >
      <h2 className="hpb-label hpg-build-label">
        <span>{block.title}</span>
        {block.link && (
          <a
            className="hpg-hint ulink"
            href={block.link.href}
            target="_blank"
            rel="noreferrer"
          >
            {block.link.label}
            <svg viewBox="0 0 12 12" aria-hidden="true">
              <path
                d="M3.5 8.5 8.5 3.5M4.5 3.5h4v4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        )}
      </h2>

      <div className="hpg-build-grid">
        <figure className="hpg-photo">
          {/* markers are pinned against the frame, not the figure, so
              the caption below can't shift their percentages */}
          <div className="hpg-frame">
            <img src={block.src} alt={block.alt} loading="lazy" />

            {pinned.map((p) => (
              <button
                type="button"
                key={p.label}
                className={`hpg-marker ${active === p.label ? 'is-active' : ''}`}
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
                data-side={p.x > 55 ? 'left' : 'right'}
                onMouseEnter={() => setActive(p.label)}
                onFocus={() => setActive(p.label)}
                onBlur={() => setActive(null)}
                onClick={() => setActive(active === p.label ? null : p.label)}
                aria-pressed={active === p.label}
                aria-label={`${p.label}: ${p.value}`}
              >
                <span className="hpg-marker-ring" aria-hidden="true" />
                <span className="hpg-chip" aria-hidden="true">
                  {p.label}
                </span>
              </button>
            ))}
          </div>

          {block.caption && <figcaption>{block.caption}</figcaption>}
        </figure>

        <dl className="hpg-ledger">
          {block.parts.map((p) => {
            const hasMarker = p.x != null && p.y != null;
            return (
              <div
                key={p.label}
                className={`hpg-row ${active === p.label ? 'is-active' : ''} ${
                  hasMarker ? '' : 'is-unpinned'
                }`}
                /* a row with nothing to point at clears the photo
                   rather than leaving the last marker lit */
                onMouseEnter={() => setActive(hasMarker ? p.label : null)}
              >
                <dt>{p.label}</dt>
                <dd>
                  {p.value}
                  {p.note && <span className="hpg-row-note">{p.note}</span>}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}

/* hover (or tap, for touch) to expand a strip of images — view-only,
   nothing to link to, so each panel is a button rather than an anchor */
function Carousel({ items, direction = 'horizontal' }) {
  const [active, setActive] = useState(0);

  return (
    <div className={`hpb-carousel ${direction === 'vertical' ? 'is-vertical' : ''}`}>
      {items.map((it, i) => (
        <button
          type="button"
          key={it.caption}
          className={`hpb-carousel-panel ${i === active ? 'is-active' : ''}`}
          onMouseEnter={() => setActive(i)}
          onFocus={() => setActive(i)}
          onClick={() => setActive(i)}
          aria-pressed={i === active}
          aria-label={it.caption}
        >
          <img src={it.src} alt={it.caption} loading="lazy" />
          <span className="hpb-carousel-caption" aria-hidden="true">
            {it.caption}
          </span>
        </button>
      ))}
    </div>
  );
}
