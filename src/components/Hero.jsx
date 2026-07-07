import { hero, meta } from '../data/content.js';
import { Coffee, ArrowDown } from './Doodles.jsx';
import portrait from '../assets/portrait_tailless.png';
import catAnim from '../assets/cat_animation.gif';
import './Hero.css';

/* Slowly spinning role wheel behind the portrait (see references/
   wheel_ref.jpg): three words on a circular path with diamond
   separators, and a static hand-drawn coffee bean at the hub. The
   ring path starts at 12 o'clock, so words center at 16.6/50/83.3%
   and diamonds sit at the 0/120/240° thirds between them. */
function RoleWheel() {
  return (
    <svg className="hero-wheel" viewBox="0 0 200 200" aria-hidden="true">
      <defs>
        <path
          id="wheel-arc"
          d="M100 26 A74 74 0 0 1 100 174 A74 74 0 0 1 100 26"
          fill="none"
        />
      </defs>

      <g className="hero-wheel-ring">
        <text className="hero-wheel-text" textAnchor="middle">
          <textPath href="#wheel-arc" startOffset="16.66%">ENGINEER</textPath>
          <textPath href="#wheel-arc" startOffset="50%">DESIGNER</textPath>
          <textPath href="#wheel-arc" startOffset="83.33%">PROGRAMMER</textPath>
        </text>
        {[0, 120, 240].map((a) => (
          <path
            key={a}
            className="hero-wheel-mark"
            d="M100 18.8 L102.8 22 L100 25.2 L97.2 22 Z"
            transform={`rotate(${a} 100 100)`}
          />
        ))}
      </g>

      {/* coffee bean hub — static while the ring turns */}
      <g className="hero-wheel-bean" transform="rotate(-32 100 100)">
        <ellipse cx="100" cy="100" rx="8.5" ry="12.5" />
        <path d="M100 88.5 C95.5 95 104.5 105 100 111.5" />
      </g>
    </svg>
  );
}

export default function Hero() {
  // #top lives on the pour wrapper (HeroPourTransition) so the nav logo
  // returns to the real page top even while the hero is pinned
  return (
    <section className="hero" aria-label="Introduction">
      <div className="container hero-grid">
        {/* margin column — folio + note */}
        <div className="hero-margin">
          <p className="eyebrow hero-anim" style={{ '--i': 0 }}>
            {hero.eyebrow}
          </p>
          <p className="hero-note hero-anim" style={{ '--i': 5 }}>
            <span aria-hidden="true">↳ </span>
            {hero.marginNote.split('\n').map((l, i) => (
              <span key={i} className="hero-note-line">
                {l}
              </span>
            ))}
            <Coffee size={30} className="hero-doodle" />
          </p>
        </div>

        {/* main column — name + lead */}
        <div className="hero-main">
          <h1 className="hero-name">
            {hero.nameLines.map((line, i) => (
              <span
                key={line}
                className="hero-name-line hero-anim"
                style={{ '--i': 1 + i }}
              >
                {line}
              </span>
            ))}
          </h1>
          <p className="hero-lead hero-anim" style={{ '--i': 3 }}>
            {hero.lead}
          </p>
          <div className="hero-cta hero-anim" style={{ '--i': 4 }}>
            <a href="#work" className="btn btn-primary">
              View selected work
            </a>
            <a href={`mailto:${meta.email}`} className="ulink hero-email">
              {meta.email}
            </a>
          </div>
        </div>

        {/* side column — portrait */}
        <div className="hero-side">
          <figure className="hero-portrait hero-anim" style={{ '--i': 2 }}>
            <RoleWheel />
            <img
              className="hero-portrait-img"
              src={portrait}
              alt={`${meta.name}, illustrated portrait`}
            />
            <img className="hero-cat-anim" src={catAnim} alt="" aria-hidden="true" />
          </figure>
        </div>
      </div>

      <a href="#about" className="hero-scroll" aria-label="Scroll to about">
        <ArrowDown size={18} />
        <span>scroll</span>
      </a>
    </section>
  );
}
