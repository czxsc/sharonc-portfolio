import { stack, education, experience } from '../data/content.js';
import { Sparkle } from './Doodles.jsx';
import './Craft.css';

export default function Craft() {
  return (
    <section id="craft" className="section craft">
      <div className="container">
        <div className="section-head reveal">
          <h2>Craft &amp; Experience</h2>
          <p className="head-note">The tools I reach for — and where I&rsquo;ve put them to work.</p>
        </div>

        <div className="craft-grid">
          {/* left — toolkit + education */}
          <div className="craft-toolkit reveal">
            <p className="col-label">Toolkit</p>
            <ul className="chips">
              {stack.map((it) => (
                <li key={it}>{it}</li>
              ))}
            </ul>

            <p className="col-label edu-label">Education</p>
            <ul className="edu-list">
              {education.map((e) => (
                <li key={e.school} className="edu-item">
                  <span className="edu-school">
                    <Sparkle size={13} className="edu-mark" />
                    {e.school}
                  </span>
                  <span className="edu-detail">{e.detail}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* right — experience */}
          <div className="craft-exp">
            <p className="col-label reveal">Experience</p>
            <ol className="exp-list">
              {experience.map((e, i) => (
                <li
                  key={e.org}
                  className="exp-item reveal"
                  style={{ '--reveal-delay': `${i * 0.06}s` }}
                >
                  <span className="exp-date">{e.date}</span>
                  <h4 className="exp-org">{e.org}</h4>
                  <span className="exp-role">{e.role}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
