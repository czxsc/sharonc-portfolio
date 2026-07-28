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

          <header className="hp-head">
            <div>
              <p className="eyebrow">Off the clock</p>
              <h1>{hobby.title}</h1>
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
   together), a pull-quote for the piano aside, then the concert
   carousel opened up wider as the closing, most visual moment. */
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
        </div>

        {receipt && (
          <figure className="hpm-receipt">
            <img src={receipt.src} alt={receipt.caption || ''} loading="lazy" />
            {receipt.caption && <figcaption>{receipt.caption}</figcaption>}
          </figure>
        )}
      </div>

      {quote && (
        <blockquote className="hpm-quote">
          {quote.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </blockquote>
      )}

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
   hold both without turning into two unrelated lists stacked up. They
   run as facing columns instead: reading carries the weight (more of
   it, set larger), watching sits offset and quieter across a hairline,
   and a margin note in the gutter ties the one pair that belongs to
   each other. Blocks are picked by `id` — both halves are `kind: list`,
   so kind can't tell them apart. */
function StoriesBlocks({ blocks }) {
  const by = Object.fromEntries(blocks.map((b) => [b.id, b]));
  const { read, watched, thread, close } = by;
  const count = (n) => String(n).padStart(2, '0');

  return (
    <div className="hp-stories">
      <p className="hps-tally">
        <span>
          <b>{count(read.items.length)}</b> read
        </span>
        <span aria-hidden="true">·</span>
        <span>
          <b>{count(watched.items.length)}</b> watched
        </span>
      </p>

      <section className="hps-read">
        <h2 className="hpb-label">
          <span>{read.title}</span>
        </h2>
        <ul className="hps-list">
          {read.items.map((it) => (
            <li key={it.name}>
              {/* a bookmark slipped in at the row's edge on hover */}
              <span className="hps-ribbon" aria-hidden="true" />
              <span className="hps-title">{it.name}</span>
              <span className="hps-by">{it.meta}</span>
              <span className="hps-note">{it.note}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="hps-watch">
        <h2 className="hpb-label">
          <span>{watched.title}</span>
        </h2>
        <ul className="hps-list">
          {watched.items.map((it) => (
            <li key={it.name}>
              <span className="hps-tag">{it.meta}</span>
              <span className="hps-title">{it.name}</span>
              <span className="hps-note">{it.note}</span>
            </li>
          ))}
        </ul>

        {thread && (
          <p className="hps-thread">
            <svg className="hps-thread-arrow" viewBox="0 0 40 34" aria-hidden="true">
              <path
                d="M37 2c-6 12-16 22-29 26M8 20l-4 8 9 2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {thread.body}
          </p>
        )}
      </section>

      {close && (
        <div className="hps-close">
          {close.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      )}
    </div>
  );
}

/* Gaming, like music, gets a composition rather than stacked blocks.
   The through-line is that every genre she sticks with is one that
   waits for you to think, so the page reads as taste first (stance →
   the three → what's loaded now → the shelf and the queue) and ends on
   the machine that runs it all. Blocks are picked by `id` because
   there are four lists and `kind` can't tell them apart. */
function GamingBlocks({ blocks }) {
  const by = Object.fromEntries(blocks.map((b) => [b.id, b]));
  const { how, faves, now, shelf, queue, build } = by;

  return (
    <div className="hp-gaming">
      {how && (
        <section className="hpg-col hpg-stance">
          <h2 className="hpb-label">
            <span>{how.title}</span>
          </h2>
          {how.body.map((p, i) => (
            <p className="hpb-p" key={i}>
              {p}
            </p>
          ))}

          <ul className="hpg-genres">
            {how.genres.map((g) => (
              <li key={g.name}>
                <span className="hpg-genre-name">{g.name}</span>
                <span className="hpg-genre-meta">{g.meta}</span>
              </li>
            ))}
          </ul>

          {how.aside && (
            <p className="hpg-aside">
              <svg className="hpg-aside-arrow" viewBox="0 0 40 34" aria-hidden="true">
                <path
                  d="M37 2c-6 12-16 22-29 26M8 20l-4 8 9 2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {how.aside}
            </p>
          )}
        </section>
      )}

      {faves && (
        <section className="hpg-col">
          <h2 className="hpb-label">
            <span>{faves.title}</span>
          </h2>
          <ul className="hpg-faves">
            {faves.items.map((it) => (
              <li key={it.name}>
                <span className="hpg-fave-name">{it.name}</span>
                <span className="hpg-fave-meta">{it.meta}</span>
                <span className="hpg-fave-note">{it.note}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {now && (
        <section className="hpg-col">
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

      {(shelf || queue) && (
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
      )}

      {build && <BuildMap block={build} />}
    </div>
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
        {block.hint && <span className="hpg-hint">{block.hint}</span>}
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
