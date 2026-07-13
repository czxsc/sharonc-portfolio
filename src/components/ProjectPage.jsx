import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { projects } from '../data/content.js';
import { useOverlayPage } from '../hooks/useOverlayPage.js';
import StackDiagram from './StackDiagram.jsx';
import FlowDiagram from './FlowDiagram.jsx';
import ArchMap from './ArchMap.jsx';
import './ProjectPage.css';

/* ------------------------------------------------------------------
   Full-screen project case study (layout modeled on dousanmiao.com's
   case pages): title + status pill, hero media, intro with link
   chips, labeled meta rows, then the case sections. Professional
   registers only — a calm fade/rise, no iris.

   ← / → (buttons or arrow keys) move between projects without
   closing; the single history entry from useOverlayPage still means
   one browser-back closes the whole thing.
   ------------------------------------------------------------------ */

const CLOSE_MS = 300; // covers the .25s closing fade in ProjectPage.css

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

export default function ProjectPage({ index, onNavigate, onClose }) {
  const project = projects[index];
  const page = project.page;
  const backRef = useRef(null);
  const scrollRef = useRef(null);
  const { state, requestClose } = useOverlayPage({
    slug: project.slug,
    closeMs: CLOSE_MS,
    onClose,
    focusRef: backRef,
  });

  // which toggle.sections branch is showing (page.toggle.options[0] by
  // default); only meaningful for projects that define page.toggle
  const [view, setView] = useState(page.toggle?.options[0]?.id);

  const go = (dir) =>
    onNavigate((index + dir + projects.length) % projects.length);

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
      }`}
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
        <article className="pp-page" key={project.slug}>
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
          </div>

          <header className="pp-head">
            <div className="pp-head-text">
              <h1>{project.name}</h1>
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

      <button
        className="pp-close"
        onClick={requestClose}
        aria-label="Close case study"
      >
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      <nav className="pp-nav" aria-label="More projects">
        <button className="pp-nav-btn" onClick={() => go(-1)} aria-label="Previous project">
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button className="pp-nav-btn" onClick={() => go(1)} aria-label="Next project">
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </nav>
    </div>,
    document.body
  );
}

/* one case-study section: heading, body copy, then whichever optional
   blocks the data provides (points / subs / facts / stack / flow /
   compare / media / gallery) */
function Section({ s }) {
  return (
    <section className="pp-section">
      <h2>{s.heading}</h2>
      {s.body.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
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
      {s.media && <Media media={s.media} className="pp-panel" alt="" />}
      {s.gallery && (
        <div className="pp-gallery">
          {s.gallery.map((g) => (
            <Media key={g.caption} media={g} className="pp-panel" alt="" />
          ))}
        </div>
      )}
    </section>
  );
}

/* media panel: real image when given, labeled placeholder otherwise;
   media.fit shows the whole image at its own ratio instead of the
   21:9 crop (for screenshots that crop badly) */
function Media({ media, className, alt }) {
  return (
    <figure className={`pp-media ${className} ${media.fit ? 'is-fit' : ''}`}>
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
