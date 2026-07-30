import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { projects } from '../data/content.js';
import { useOverlayPage } from '../hooks/useOverlayPage.js';
import StackDiagram from './StackDiagram.jsx';
import FlowDiagram from './FlowDiagram.jsx';
import ArchMap from './ArchMap.jsx';
import ZoneStudy from './ZoneStudy.jsx';
import DesignBoard from './DesignBoard.jsx';
import SetType from './SetType.jsx';
import './ProjectPage.css';

/* ------------------------------------------------------------------
   Full-screen project case study (layout modeled on dousanmiao.com's
   case pages): title + status pill, hero media, intro with link
   chips, labeled meta rows, then the case sections.

   The case study doesn't appear over the index — it opens *out of*
   it. `getOrigin` reports the preview shot the reader was already
   looking at, and the hero image travels from there to its place on
   the page while the rest of the article sets around it (see
   flyHero). Closing puts it back where it came from, so the index is
   where you left it rather than somewhere you return to.

   ← / → (buttons or arrow keys) move between projects without
   closing; the single history entry from useOverlayPage still means
   one browser-back closes the whole thing.
   ------------------------------------------------------------------ */

const CLOSE_MS = 480; // covers the reverse flight + the fade behind it
const OPEN_MS = 620;
const BACK_MS = 420;
const FLIP_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
// the fades that hide the index end of the flight (see flyHero)
const HANDOFF_OUT_MS = 110;
const HANDOFF_BACK_MS = 150;
const STEPS = 16; // sampled keyframes — see frameAt

/* Where an `object-fit` image actually paints inside its element box.

   The box and the picture are two different rectangles: `cover`
   scales the picture until it fills the box and lets the overflow be
   clipped, so the painted rect is the larger one and object-position
   decides which part of it the box keeps. That distinction is the
   whole reason the transition used to break — the index crops the
   shot top-anchored into a 16:9.5 window body and the case hero
   crops it centred into a 21:9 band, so the two ends were showing
   *different regions of the same photograph*, and no transform can
   turn one crop into the other: scaling an element scales its clip
   along with its content.

   `fit` and `position` are used values of object-fit and
   object-position. object-position resolves to a `<len-or-%>` pair;
   only the percentage form is meaningful as an alignment fraction,
   and percentages are all this site uses (plus the keywords, which
   compute to them). Anything else falls back to centred. */
function paintedRect(box, nw, nh, { fit, position }) {
  const [x, y] = (position || '50% 50%').split(' ');
  const frac = (v, d) => (v?.endsWith('%') ? parseFloat(v) / 100 : d);
  const s =
    fit === 'contain'
      ? Math.min(box.width / nw, box.height / nh)
      : Math.max(box.width / nw, box.height / nh);
  const w = nw * s;
  const h = nh * s;
  return {
    left: box.left + (box.width - w) * frac(x, 0.5),
    top: box.top + (box.height - h) * frac(y, 0.5),
    width: w,
    height: h,
  };
}

const lerp = (a, b, u) => a + (b - a) * u;
const lerpRect = (a, b, u) => ({
  left: lerp(a.left, b.left, u),
  top: lerp(a.top, b.top, u),
  width: lerp(a.width, b.width, u),
  height: lerp(a.height, b.height, u),
});

/* Fly the hero between the index preview and its laid-out place.

   A clone does the travelling rather than the hero itself, because
   the two ends disagree about more than position: different box
   proportions, different crops, and — for `page.hero.fit` projects —
   a different fit mode entirely. The clone is a plain clip box with
   a plainly-sized picture inside it, which makes both of those
   animatable when the real elements' `object-fit` is not.

   Two rectangles are interpolated, not one: the clip box (B) and the
   painted picture (R). The picture keeps its own proportions the
   whole way — R0 and R1 share the natural aspect ratio, so every
   step between them does too — while the box changes shape around
   it. That is what reads as one photograph being re-cropped rather
   than two photographs swapping.

   The two transforms are nested, so linearly interpolating both ends
   would still bend the picture's aspect a couple of percent
   mid-flight. Sampling the exact geometry at STEPS points and
   letting the timing function ride over the top removes that; the
   keyframes are geometry, the easing is time.

   `origin` comes from Work.getFrameRect: the preview image's box,
   its natural size, and its crop alignment. */
function flyHero(fig, origin, { reverse = false } = {}) {
  const img = fig?.querySelector('img');
  const { nw, nh } = origin || {};
  if (!fig || !img || !nw || !nh) return null;

  const B1 = img.getBoundingClientRect();
  const B0 = origin.box;
  if (!B1.width || !B1.height || !B0?.width || !B0?.height) return null;

  const cs = getComputedStyle(img);
  const R1 = paintedRect(B1, nw, nh, {
    fit: cs.objectFit,
    position: cs.objectPosition,
  });
  const R0 = paintedRect(B0, nw, nh, origin);

  /* Both transforms are written in the clone's own coordinates with
     the origin at its top-left corner, which keeps them to a
     translate and a scale each and the algebra to two lines. */
  const frameAt = (u) => {
    const B = lerpRect(B0, B1, u);
    const R = lerpRect(R0, R1, u);
    const sx = B.width / B1.width;
    const sy = B.height / B1.height;
    return {
      box: `translate(${B.left - B1.left}px, ${B.top - B1.top}px) scale(${sx}, ${sy})`,
      // undo the box's scale, then place the picture where this step
      // wants it: the composition of the two lands on R exactly
      pic:
        `translate(${(R.left - B.left) / sx - (R1.left - B1.left)}px, ` +
        `${(R.top - B.top) / sy - (R1.top - B1.top)}px) ` +
        `scale(${R.width / sx / R1.width}, ${R.height / sy / R1.height})`,
    };
  };

  // u runs index → hero; the return trip plays the same geometry back
  const steps = Array.from({ length: STEPS + 1 }, (_, i) => frameAt(i / STEPS));
  if (reverse) steps.reverse();

  const clone = document.createElement('div');
  clone.setAttribute('aria-hidden', 'true');
  clone.style.cssText = `
    position:fixed; left:${B1.left}px; top:${B1.top}px;
    width:${B1.width}px; height:${B1.height}px;
    overflow:hidden; border-radius:${cs.borderRadius};
    transform-origin:0 0; will-change:transform;
    pointer-events:none; z-index:320; contain:paint;`;

  const pic = document.createElement('img');
  pic.src = img.currentSrc || img.src;
  pic.alt = '';
  pic.style.cssText = `
    position:absolute; left:${R1.left - B1.left}px; top:${R1.top - B1.top}px;
    width:${R1.width}px; height:${R1.height}px;
    transform-origin:0 0; will-change:transform;`;
  clone.appendChild(pic);
  document.body.appendChild(clone);

  // the real hero would otherwise sit at the destination for the
  // whole flight, under a clone that is only just arriving
  img.style.visibility = 'hidden';

  const opts = {
    duration: reverse ? BACK_MS : OPEN_MS,
    easing: FLIP_EASE,
    fill: 'both',
  };
  const plays = [
    clone.animate(steps.map((s) => ({ transform: s.box })), opts),
    pic.animate(steps.map((s) => ({ transform: s.pic })), opts),
  ];
  const flight = plays[0];

  /* The index end of the flight isn't only the picture: a scrim and
     the blurb sit over the preview shot, and the clone covers them
     the instant it appears. Fading the clone through that end — in
     as it leaves, out as it lands — turns what would be a pop into
     the label lifting off and settling back. It costs nothing at the
     other end, where the clone and the hero are the same pixels.

     Shorter on the way out than on the way back: leaving, the paper
     is already washing in behind the clone, and a slow fade would
     read as the picture briefly going pale. */
  clone.animate(
    reverse ? [{ opacity: 1 }, { opacity: 0 }] : [{ opacity: 0 }, { opacity: 1 }],
    {
      duration: reverse ? HANDOFF_BACK_MS : HANDOFF_OUT_MS,
      delay: reverse ? Math.max(0, BACK_MS - HANDOFF_BACK_MS) : 0,
      easing: 'linear',
      fill: 'both',
    }
  );

  let landed = false;
  const land = () => {
    if (landed) return;
    landed = true;
    // order matters: unhide first, remove second, one paint for both
    img.style.visibility = '';
    clone.remove();
  };
  flight.finished.then(land, () => {});
  // for an unmount mid-flight: nothing left to hand off to, so drop
  // the clone rather than leave it parked on the body
  return () => {
    plays.forEach((a) => a.cancel());
    land();
  };
}

/* small stroke icons for section.points tiles (pain-point summaries) */
const POINT_ICONS = {
  freeze: (
    <>
      <path d="M12 3.5 2.5 20h19L12 3.5z" />
      <path d="M12 10v4.5" />
      <circle cx="12" cy="17.4" r="0.4" fill="currentColor" />
    </>
  ),
  platform: (
    <>
      <path d="M4.5 6h15v9.5h-15z" />
      <path d="M2.5 18.5h19" />
    </>
  ),
  guide: (
    <>
      <path d="M12 6.5C10 5 7.5 4.5 5 4.5v13c2.5 0 5 .5 7 2 2-1.5 4.5-2 7-2v-13c-2.5 0-5 .5-7 2z" />
      <path d="M12 6.5v13" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="13.5" r="7" />
      <path d="M12 13.5v-4" />
      <path d="M9.5 3h5" />
    </>
  ),
  scope: (
    <>
      <path d="M4 9V5h4" />
      <path d="M20 9V5h-4" />
      <path d="M4 15v4h4" />
      <path d="M20 15v4h-4" />
    </>
  ),
  performance: (
    <>
      <path d="M13 3 5 14h5l-1 7 8-11h-5l1-7z" />
    </>
  ),
  identity: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M15 9l-2 6-6 2 2-6z" />
    </>
  ),
  team: (
    <>
      <circle cx="9" cy="10" r="3.2" />
      <circle cx="15" cy="10" r="3.2" />
      <path d="M4.5 19c.6-3 2.6-4.7 4.9-4.7" />
      <path d="M19.5 19c-.6-3-2.6-4.7-4.9-4.7" />
    </>
  ),
};

export default function ProjectPage({ index, getOrigin, onNavigate, onClose }) {
  const project = projects[index];
  const page = project.page;
  const backRef = useRef(null);
  const scrollRef = useRef(null);
  const heroRef = useRef(null);
  const flownRef = useRef(false); // the flight is the *opening*, not a page change
  const [dir, setDir] = useState(0); // which way ←/→ last moved
  const { state, requestClose } = useOverlayPage({
    slug: project.slug,
    closeMs: CLOSE_MS,
    onClose,
    focusRef: backRef,
  });

  const reduce =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Outbound flight, once, before paint. The teardown is only ever
     reached by an unmount mid-flight — closing that fast has to take
     the clone with it. */
  const abortRef = useRef(null);
  useLayoutEffect(() => {
    if (reduce || flownRef.current || !getOrigin) return () => abortRef.current?.();
    flownRef.current = true;
    abortRef.current = flyHero(heroRef.current, getOrigin());
    return () => abortRef.current?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Return flight — measured fresh, not replayed from the outbound.
     useOverlayPage has just put the page behind back where the
     reader left it, so asking now is what makes the image land in
     the preview frame it came out of rather than wherever that frame
     happened to be a scroll ago.

     Three ways out of it: the reader scrolled the hero off screen,
     or scrolled the preview frame off screen, or the frame is no
     longer measurable. The first two are journeys nobody can watch
     that only delay the close. Each falls back to the plain fade. */
  const flying = useRef(false);
  useLayoutEffect(() => {
    if (state !== 'closing' || reduce || !getOrigin || flying.current) return;
    const fig = heroRef.current;
    if (!fig) return;
    const r = fig.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) return;
    const to = getOrigin();
    const b = to?.box;
    if (!b || b.top + b.height < 0 || b.top > window.innerHeight) return;
    flying.current = true;
    abortRef.current = flyHero(fig, to, { reverse: true });
  }, [state, getOrigin, reduce]);

  // which toggle.sections branch is showing (page.toggle.options[0] by
  // default); only meaningful for projects that define page.toggle
  const [view, setView] = useState(page.toggle?.options[0]?.id);

  // the list wraps, so there is always a project in both directions
  const adjacent = (d) => projects[(index + d + projects.length) % projects.length];
  const go = (d) => {
    setDir(d);
    onNavigate((index + d + projects.length) % projects.length);
  };

  // fresh case study starts from the top, and the toggle resets to its
  // default branch — the article itself doesn't remount, so this state
  // wouldn't otherwise reset when paging between projects
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'instant' });
    setView(page.toggle?.options[0]?.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  // arrow keys page between projects
  useEffect(() => {
    const onKey = (e) => {
      /* Widgets inside the page that steer with ←/→ get first refusal:
         they preventDefault, and their handlers sit below window, so
         they have already run by the time this one does. Without this,
         arrowing through the zone tablist pages to the next project
         out from under the reader. */
      if (e.defaultPrevented) return;
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  return createPortal(
    <div
      className={`pp ${state === 'open' ? 'is-open' : ''} ${
        state === 'closing' ? 'is-closing' : ''
      } ${getOrigin ? 'has-flight' : ''}`}
      style={{ '--page-dir': dir }}
    >
      <div
        className="pp-scroll"
        ref={scrollRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${project.name} — case study`}
        data-lenis-prevent
      >
        {/* key remounts the article per project so the entrance rise
            replays when paging with the arrows */}
        <article
          className={`pp-page ${dir ? 'is-paged' : ''}`}
          key={project.slug}
        >
          <div className="pp-topbar">
            <button ref={backRef} className="pp-back" onClick={requestClose}>
              <span className="pp-back-ring" aria-hidden="true">
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M10.5 3 5.5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              Back
            </button>

            {/* projects split between two angles (e.g. code / design)
                define page.toggle; the sections above and
                page.sectionsAfter below stay fixed while the run of
                sections in between swaps with this control. Sitting in
                the sticky topbar keeps it (and the swapped content
                just below it) in view while scrolled through the case
                study, instead of requiring a scroll back up. */}
            <div className="pp-topbar-end">
              {page.toggle && (
                <div className="pp-toggle" role="tablist" aria-label="Breakdown">
                  {page.toggle.options.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      role="tab"
                      aria-selected={view === opt.id}
                      className={`pp-toggle-btn ${view === opt.id ? 'is-active' : ''}`}
                      onClick={() => setView(opt.id)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Paging lives here rather than floating over the page:
                  the reader leaves a case study by the Back button at
                  the other end of this bar, so the two things they can
                  do with the page as a whole sit in the same band. The
                  labels name the destination — an unlabelled pair of
                  arrows says a project is next but never which. */}
              <nav className="pp-nav" aria-label="More projects">
                <button
                  className="pp-nav-btn"
                  onClick={() => go(-1)}
                  aria-label={`Previous project: ${adjacent(-1).name}`}
                >
                  <svg viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  className="pp-nav-btn"
                  onClick={() => go(1)}
                  aria-label={`Next project: ${adjacent(1).name}`}
                >
                  <svg viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>

          <header className="pp-head">
            <div className="pp-head-text">
              <SetType as="h1" lines={project.name} />
              <p className="pp-subtitle">{page.subtitle}</p>
            </div>
            <span className="pp-status" data-status={page.status}>
              {page.status}
            </span>
          </header>

          {/* page.hero can override the crop: { fit: true } shows the
              whole image, { position: 'top' } keeps the top edge */}
          <Media
            media={{ src: project.image, ...page.hero }}
            className="pp-hero"
            alt={`${project.name} preview`}
            figRef={heroRef}
          />

          <div className="pp-intro">
            <p>{page.intro}</p>
            {page.links?.length > 0 && (
              <div className="pp-links">
                {page.links.map((l) => (
                  <a
                    key={l.label}
                    className="pp-chip"
                    href={l.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {l.label}
                    <svg viewBox="0 0 12 12" aria-hidden="true">
                      <path d="M3.5 8.5 8.5 3.5M4.5 3.5h4v4" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                ))}
              </div>
            )}
          </div>

          <dl className="pp-meta">
            {page.meta.map((m) => (
              <div key={m.label}>
                <dt>{m.label}</dt>
                <dd>{m.value}</dd>
              </div>
            ))}
          </dl>

          {page.sections.map((s) => (
            <Section s={s} key={s.heading} />
          ))}

          {/* key={view} replays the fade/rise whenever the toggle above
              switches branches */}
          {page.toggle && (
            <div className="pp-toggle-body" key={view}>
              {page.toggle.sections[view]?.map((s) => (
                <Section s={s} key={s.heading} />
              ))}
            </div>
          )}

          {page.sectionsAfter?.map((s) => (
            <Section s={s} key={s.heading} />
          ))}
        </article>
      </div>
    </div>,
    document.body
  );
}

/* one case-study section: heading, body copy, then whichever optional
   blocks the data provides (designBoard / points / subs / facts /
   stack / flow / archMap / zones / tiles / compare / media / gallery).

   `imagesFirst` lifts media + gallery to just under the body. The early
   sections read "here is what we made -> here is the work -> here is
   where it fell short", and with pictures pinned to the bottom the
   shortfalls landed before the reader had seen the thing they are about. */
function Section({ s }) {
  const pictures = (
    <>
      {s.media && <Media media={s.media} className="pp-panel" alt="" />}
      {s.gallery && (
        <div className="pp-gallery">
          {s.gallery.map((g) => (
            <Media key={g.caption} media={g} className="pp-panel" alt="" />
          ))}
        </div>
      )}
    </>
  );
  return (
    <section className="pp-section">
      <h2>{s.heading}</h2>
      {s.body.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
      {s.imagesFirst && pictures}
      {s.designBoard && <DesignBoard board={s.designBoard} />}
      {s.points && (
        <div className="pp-points">
          {s.points.map((pt) => (
            <div className="pp-point" key={pt.text}>
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {POINT_ICONS[pt.icon]}
              </svg>
              <p>{pt.text}</p>
            </div>
          ))}
        </div>
      )}
      {s.subs && (
        <div className="pp-subs">
          {s.subs.map((sub) => (
            <div className="pp-sub" key={sub.title}>
              <h3>{sub.title}</h3>
              <p>{sub.text}</p>
            </div>
          ))}
        </div>
      )}
      {s.facts && (
        <div className="pp-facts">
          {s.facts.map((f) => (
            <div className="pp-fact" key={f.title}>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      )}
      {s.stack && <StackDiagram stack={s.stack} />}
      {s.flow && <FlowDiagram flow={s.flow} />}
      {s.archMap && <ArchMap map={s.archMap} />}
      {s.zones && <ZoneStudy zones={s.zones} />}
      {/* the four graded tilesets, laid out so the shared grey rock
          reads across the row — same argument as ZoneStudy, one floor
          up. No panel behind them: they are cut-out art with real
          transparency and they sit on the paper.

          `cutouts` is the same row for drawings that DON'T share a
          ratio (the portfolio's hand-drawn assets): they're matched on
          height and sat on a common baseline instead. */}
      {s.tiles && (
        <figure className={`pp-tiles ${s.tiles.cutouts ? 'is-cutouts' : ''}`}>
          <ol>
            {s.tiles.items.map((t) => (
              <li key={t.label}>
                <img src={t.src} alt={`${t.label} tileset`} loading="lazy" />
                <span>{t.label}</span>
              </li>
            ))}
          </ol>
          {s.tiles.caption && <figcaption>{s.tiles.caption}</figcaption>}
        </figure>
      )}
      {s.compare && (
        <figure className="pp-compare">
          <div className="pp-compare-grid">
            {[s.compare.before, s.compare.after].map((c) => (
              <div className="pp-compare-item" key={c.label}>
                <span className="pp-compare-label">{c.label}</span>
                <img
                  src={c.src}
                  alt=""
                  loading="lazy"
                  style={{
                    objectPosition: c.position,
                    objectFit: c.fit ? 'contain' : undefined,
                  }}
                />
              </div>
            ))}
          </div>
          {s.compare.caption && <figcaption>{s.compare.caption}</figcaption>}
        </figure>
      )}
      {!s.imagesFirst && pictures}
    </section>
  );
}

/* media panel: real image when given, labeled placeholder otherwise;
   media.fit shows the whole image at its own ratio instead of the
   21:9 crop (for screenshots that crop badly) */
function Media({ media, className, alt, figRef }) {
  return (
    <figure
      ref={figRef}
      className={`pp-media ${className} ${media.fit ? 'is-fit' : ''}`}
    >
      {media.src ? (
        <img
          src={media.src}
          alt={alt}
          loading="lazy"
          style={media.position ? { objectPosition: media.position } : undefined}
        />
      ) : (
        <div className="pp-media-ph">media — coming soon</div>
      )}
      {media.caption && <figcaption>{media.caption}</figcaption>}
    </figure>
  );
}
