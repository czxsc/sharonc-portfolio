import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { nav, meta } from '../data/content.js';
import { useActiveSection } from '../hooks/useActiveSection.js';
import catMark from '../assets/site/catmark.png';
import './Nav.css';

const ids = nav.map((n) => n.id);

export default function Nav() {
  const active = useActiveSection(ids);
  const [scrolled, setScrolled] = useState(false);
  const linksRef = useRef(null);
  const dotRef = useRef(null);
  const atRef = useRef(null); // where the dot currently is, in px
  const fontsRef = useRef(false); // late-font re-measure hooked up once

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* One filled dot travelling a row of empty ones, instead of four
     dots taking turns being filled. The links become stations and
     the marker moves between them, which is a truer picture of what
     scrolling is doing than four independent state changes.

     It stretches along its own path as it goes — a drop of ink
     pulled between two points — which is also what makes a long
     jump (About → Contact) read as further than a short one. */
  useLayoutEffect(() => {
    const place = (animate) => {
      const wrap = linksRef.current;
      const dot = dotRef.current;
      if (!wrap || !dot) return;
      const i = ids.indexOf(active);
      const station = wrap.querySelectorAll('.nav-link-idx')[i];
      if (!station) return; // stations are hidden at narrow widths

      const w = wrap.getBoundingClientRect();
      const s = station.getBoundingClientRect();
      const to = { x: s.left - w.left, y: s.top - w.top };
      const from = atRef.current;
      atRef.current = to;

      const at = (p, extra = '') => `translate(${p.x}px, ${p.y}px)${extra}`;
      dot.style.transform = at(to);

      if (!animate || !from || from.x === to.x) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
      // stretch in proportion to the distance travelled, capped so a
      // jump across the whole nav still reads as a dot
      const span = Math.min(Math.abs(to.x - from.x) / 26, 2.4);
      dot.animate(
        [
          { transform: at(from) },
          { transform: at(mid, ` scaleX(${1 + span})`), offset: 0.5 },
          { transform: at(to) },
        ],
        { duration: 480, easing: 'cubic-bezier(0.65, 0, 0.35, 1)' }
      );
    };

    place(true);
    const onResize = () => place(false);
    window.addEventListener('resize', onResize);
    // the mono face swapping in late moves every station under the
    // dot, and `resize` never fires for that. Hooked up once, not on
    // every section change — the promise only ever resolves once.
    if (!fontsRef.current) {
      fontsRef.current = true;
      document.fonts?.ready.then(() => place(false));
    }
    return () => window.removeEventListener('resize', onResize);
  }, [active]);

  return (
    <header className={`nav ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="nav-inner container">
        <a href="#top" className="nav-mark" aria-label={`${meta.name} — home`}>
          <img src={catMark} className="nav-mark-cat" alt="" aria-hidden="true" />
          <span className="nav-mark-name">Sharon Chen</span>
          <span className="nav-mark-role">{meta.role}</span>
        </a>

        <nav className="nav-links" aria-label="Sections" ref={linksRef}>
          <span className="nav-dot" ref={dotRef} aria-hidden="true" />
          {nav.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              className={`nav-link ${active === n.id ? 'is-active' : ''}`}
            >
              <span className="nav-link-idx" aria-hidden="true" />
              {n.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
