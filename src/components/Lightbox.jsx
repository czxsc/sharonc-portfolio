import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './Lightbox.css';

/* ------------------------------------------------------------------
   Click an image to see it bigger, for the ones set small beside others.
   Wrap the image in <Zoomable items={...} at={i}>, where `items` is every
   picture it sits with: the viewer steps through those, so a before and
   after can be flipped between at full size, which is the comparison the
   pair was there to make.

   An item is { src, alt?, label? }. The image grows out of the thumbnail it
   was opened from and goes back to it. Thumbnails are often cropped, so the
   viewer always shows the whole picture.
   ------------------------------------------------------------------ */

const OpenContext = createContext(null);

const GLIDE = 'cubic-bezier(0.45, 0, 0.15, 1)'; // --ease-glide
const OPEN_MS = 460;
const CLOSE_MS = 300;
const STEP_MS = 340;

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* As big as the window allows, leaving room for the controls and caption. A
   small crop grows to at most 2x, since past that it's only showing blur. */
function fit(nw, nh) {
  // clientWidth rather than innerWidth, which counts the scrollbar's gutter
  const vw = document.documentElement.clientWidth;
  const vh = window.innerHeight;
  const narrow = vw <= 700;
  const maxW = vw - (narrow ? 24 : 176);
  const maxH = vh - (narrow ? 190 : 120);
  const s = Math.min(maxW / nw, maxH / nh, Math.min(2, Math.max(1, 1280 / nw)));
  return { w: Math.round(nw * s), h: Math.round(nh * s) };
}

function Viewer({ view, onClosed }) {
  const { items, origin } = view;
  const [at, setAt] = useState(view.at);
  const [box, setBox] = useState(null); // the size of the picture on show, once it's loaded
  const rootRef = useRef(null);
  const picRef = useRef(null);
  const closeRef = useRef(null);
  const closing = useRef(false);
  const arrived = useRef(false);
  const step = useRef(0); // which way the last step went
  const rest = useRef(null); // the picture's place when nothing is moving it
  const item = items[at];
  const many = items.length > 1;

  const thumb = () => (origin.querySelector('img') ?? origin).getBoundingClientRect();
  // the transform that lays the picture over the thumbnail, centre to centre
  const overThumb = () => {
    const from = thumb();
    const to = rest.current;
    const dx = from.left + from.width / 2 - (to.left + to.width / 2);
    const dy = from.top + from.height / 2 - (to.top + to.height / 2);
    return `translate(${dx}px, ${dy}px) scale(${from.width / to.width})`;
  };

  /* Everything behind stops taking focus, and focus comes in here. Restored
     before focus goes back, since focusing into an inert subtree is silently
     ignored. */
  const page = useRef(document.querySelector('.pp'));
  useEffect(() => {
    const behind = page.current;
    const html = document.documentElement;
    behind?.setAttribute('inert', '');
    html.classList.add('lb-open');
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      behind?.removeAttribute('inert');
      html.classList.remove('lb-open');
    };
  }, []);

  const close = () => {
    if (closing.current) return;
    closing.current = true;
    document.documentElement.classList.remove('lb-open');
    const finish = () => {
      page.current?.removeAttribute('inert');
      origin.focus({ preventScroll: true });
      onClosed();
    };
    const pic = picRef.current;
    if (reduceMotion() || !pic || !rest.current) {
      finish();
      return;
    }
    const opts = { duration: CLOSE_MS, easing: GLIDE, fill: 'both' };
    rootRef.current.animate([{ opacity: 1 }, { opacity: 0 }], opts);
    // from wherever it is now, in case this interrupts the opening
    const now = getComputedStyle(pic).transform;
    pic.getAnimations().forEach((a) => a.cancel());
    const home = at === view.at; // stepped away, there's no thumbnail to return to
    const flight = pic.animate(
      [{ transform: now === 'none' ? 'none' : now }, { transform: home ? overThumb() : 'none' }],
      opts
    );
    flight.finished.then(finish, finish);
  };

  const go = (d) => {
    if (!many || closing.current) return;
    step.current = d;
    setAt((i) => (i + d + items.length) % items.length);
  };

  /* First refusal on the keys. The case study listens on window for Esc (close)
     and the arrows (next project), so this listens on the way down, and stops
     them there. They'd otherwise close or page the whole study behind it. */
  const handlers = useRef({});
  useEffect(() => {
    handlers.current = { close, go };
  });
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') handlers.current.close();
      else if (e.key === 'ArrowLeft') handlers.current.go(-1);
      else if (e.key === 'ArrowRight') handlers.current.go(1);
      else return;
      e.preventDefault();
      e.stopPropagation();
    };
    // browser back closes the study, and this has to go with it
    const onPop = () => handlers.current.close();
    const onResize = () => {
      const pic = picRef.current;
      if (pic?.naturalWidth) setBox({ src: pic.getAttribute('src'), ...fit(pic.naturalWidth, pic.naturalHeight) });
    };
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('popstate', onPop);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const ready = box?.src === item.src;

  // arrivals, once the picture has a size to arrive at
  useLayoutEffect(() => {
    const pic = picRef.current;
    if (!ready || !pic) return;
    rest.current = pic.getBoundingClientRect();
    const first = !arrived.current;
    const moved = step.current;
    arrived.current = true;
    step.current = 0;
    if (reduceMotion() || closing.current) return;
    if (first) {
      rootRef.current.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: OPEN_MS * 0.7,
        easing: 'linear',
        fill: 'backwards',
      });
      pic.animate([{ transform: overThumb() }, { transform: 'none' }], {
        duration: OPEN_MS,
        easing: GLIDE,
        fill: 'backwards',
      });
    } else if (moved) {
      pic.animate(
        [
          { opacity: 0, transform: `translateX(${moved * 28}px)` },
          { opacity: 1, transform: 'none' },
        ],
        { duration: STEP_MS, easing: GLIDE, fill: 'backwards' }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, box?.w, box?.h, at]);

  return createPortal(
    <div
      className="lb"
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <figure className="lb-figure" style={{ width: ready ? box.w : undefined }}>
        <img
          key={item.src}
          ref={picRef}
          className="lb-img"
          src={item.src}
          alt={item.alt || item.label || ''}
          draggable="false"
          style={{
            width: ready ? box.w : undefined,
            height: ready ? box.h : undefined,
            visibility: ready ? 'visible' : 'hidden',
          }}
          onLoad={(e) => {
            const { naturalWidth: nw, naturalHeight: nh } = e.currentTarget;
            setBox({ src: item.src, ...fit(nw, nh) });
          }}
        />
        {(item.label || many) && (
          <figcaption className="lb-caption">
            <span>{item.label}</span>
            {many && (
              <span className="lb-count">
                {at + 1} / {items.length}
              </span>
            )}
          </figcaption>
        )}
      </figure>

      <button ref={closeRef} type="button" className="lb-btn lb-close" aria-label="Close" onClick={close}>
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      {many && (
        <>
          <button type="button" className="lb-btn lb-prev" aria-label="Previous image" onClick={() => go(-1)}>
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button type="button" className="lb-btn lb-next" aria-label="Next image" onClick={() => go(1)}>
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </>
      )}
    </div>,
    document.body
  );
}

export function LightboxProvider({ children }) {
  const [view, setView] = useState(null);
  return (
    <OpenContext.Provider value={setView}>
      {children}
      {view && <Viewer key={view.origin ? 'open' : 'none'} view={view} onClosed={() => setView(null)} />}
    </OpenContext.Provider>
  );
}

/* A real button, so it can be tabbed to and pressed. With no children it's an
   empty hit area, for a picture made of stacked layers (ZoneStudy). */
export function Zoomable({ items, at = 0, className = '', children }) {
  const open = useContext(OpenContext);
  const item = items[at];
  return (
    <button
      type="button"
      className={`zoom ${className}`}
      aria-haspopup="dialog"
      aria-label={`View larger${item.label || item.alt ? `: ${item.label || item.alt}` : ''}`}
      onClick={(e) => open?.({ items, at, origin: e.currentTarget })}
    >
      {children}
      <i className="zoom-hint" aria-hidden="true">
        <svg viewBox="0 0 16 16">
          <path
            d="M9.5 2.5h4v4M13.5 2.5 9 7M6.5 13.5h-4v-4M2.5 13.5 7 9"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </i>
    </button>
  );
}
