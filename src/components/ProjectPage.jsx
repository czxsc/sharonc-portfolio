import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { projects } from '../data/content.js';
import { useOverlayPage } from '../hooks/useOverlayPage.js';
import StackDiagram from './StackDiagram.jsx';
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

  const go = (dir) =>
    onNavigate((index + dir + projects.length) % projects.length);

  // fresh case study starts from the top
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'instant' });
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
          <button ref={backRef} className="pp-back" onClick={requestClose}>
            <span className="pp-back-ring" aria-hidden="true">
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M10.5 3 5.5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            Back
          </button>

          <header className="pp-head">
            <div className="pp-head-text">
              <h1>{project.name}</h1>
              <p className="pp-subtitle">{page.subtitle}</p>
            </div>
            <span className="pp-status">{page.status}</span>
          </header>

          <Media
            media={{ src: project.image }}
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
            <section className="pp-section" key={s.heading}>
              <h2>{s.heading}</h2>
              {s.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
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
              {s.media && <Media media={s.media} className="pp-panel" alt="" />}
            </section>
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

/* media panel: real image when given, labeled placeholder otherwise */
function Media({ media, className, alt }) {
  return (
    <figure className={`pp-media ${className}`}>
      {media.src ? (
        <img src={media.src} alt={alt} loading="lazy" />
      ) : (
        <div className="pp-media-ph">media — coming soon</div>
      )}
      {media.caption && <figcaption>{media.caption}</figcaption>}
    </figure>
  );
}
