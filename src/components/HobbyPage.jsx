import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { getLenis } from '../hooks/useLenis.js';
import './HobbyPage.css';

/* ------------------------------------------------------------------
   Full-screen hobby mini-page, revealed by an iris that grows from the
   clicked item (see Play.jsx). The iris is two transform-scaled circle
   elements — scale stays on the compositor, so the growth is smooth
   where an animated clip-path would repaint every frame. The tone
   circle leads, the page-ground circle follows (a brief colored rim,
   as in motion.dev's "curtains" iris), then the content fades in
   above them. Closing reverses the pair. Esc, the back buttons, and
   the browser back button all funnel through the same reverse.
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
  const [state, setState] = useState('enter'); // enter → open → closing
  const [radius, setRadius] = useState(() => coverRadius(origin));
  const backRef = useRef(null);
  const closingRef = useRef(false); // reverse animation underway
  const poppedRef = useRef(false); // our history entry already consumed
  const rafRef = useRef(0);
  const timerRef = useRef(0);

  const beginClose = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    setState('closing');
    timerRef.current = setTimeout(onClose, CLOSE_MS);
  };

  // canonical close: pop the history entry we pushed; popstate → beginClose
  const requestClose = () => {
    if (closingRef.current || poppedRef.current) return;
    poppedRef.current = true;
    history.back();
  };

  // expand on the frame after the closed clip-path has been committed
  useEffect(() => {
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = requestAnimationFrame(() => setState('open'));
    });
    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(timerRef.current);
    };
  }, []);

  // while open: page behind is inert and its scroll is paused
  useEffect(() => {
    const root = document.getElementById('root');
    getLenis()?.stop();
    root?.setAttribute('inert', '');
    document.documentElement.style.overflow = 'hidden';
    backRef.current?.focus({ preventScroll: true });
    return () => {
      root?.removeAttribute('inert');
      document.documentElement.style.overflow = '';
      getLenis()?.start();
    };
  }, []);

  // browser back closes the page instead of leaving the site
  useEffect(() => {
    if (!poppedRef.current && !closingRef.current) {
      history.pushState({ hobby: hobby.slug }, '');
    }
    const onPop = () => {
      poppedRef.current = true;
      beginClose();
    };
    const onKey = (e) => e.key === 'Escape' && requestClose();
    window.addEventListener('popstate', onPop);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

          <div className="hp-blocks">
            {hobby.page.blocks.map((b, i) => (
              <Block key={i} block={b} />
            ))}
          </div>

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
    </section>
  );
}
