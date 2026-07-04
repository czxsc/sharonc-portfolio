import { hero, meta } from '../data/content.js';
import { Coffee, ArrowDown } from './Doodles.jsx';
import portrait from '../assets/portrait_tailless.png';
import catAnim from '../assets/cat_animation.gif';
import './Hero.css';

export default function Hero() {
  return (
    <section id="top" className="hero" aria-label="Introduction">
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
            <img
              className="hero-portrait-img"
              src={portrait}
              alt={`${meta.name}, illustrated portrait`}
            />
            <img className="hero-cat-anim" src={catAnim} alt="" aria-hidden="true" />
            <figcaption className="hero-hand">say hi&nbsp;→</figcaption>
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
