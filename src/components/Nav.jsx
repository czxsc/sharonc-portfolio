import { useEffect, useState } from 'react';
import { nav, meta } from '../data/content.js';
import { useActiveSection } from '../hooks/useActiveSection.js';
import catMark from '../assets/catmark.png';
import './Nav.css';

const ids = nav.map((n) => n.id);

export default function Nav() {
  const active = useActiveSection(ids);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`nav ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="nav-inner container">
        <a href="#top" className="nav-mark" aria-label={`${meta.name} — home`}>
          <img src={catMark} className="nav-mark-cat" alt="" aria-hidden="true" />
          <span className="nav-mark-name">Sharon Chen</span>
          <span className="nav-mark-role">{meta.role}</span>
        </a>

        <nav className="nav-links" aria-label="Sections">
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
