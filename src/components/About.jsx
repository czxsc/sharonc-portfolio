import { about } from '../data/content.js';
import './About.css';

export default function About() {
  return (
    <section id="about" className="section about">
      <div className="container">
        <div className="section-head reveal">
          <h2>About</h2>
        </div>

        <div className="about-grid">
          <div className="about-body reveal">
            <p className="about-lead">{about.lead}</p>
            {about.body.map((p, i) => (
              <p key={i} className="about-para">
                {p}
              </p>
            ))}
          </div>

          <dl className="about-focus reveal" style={{ '--reveal-delay': '0.1s' }}>
            {about.focus.map((f) => (
              <div key={f.k} className="about-focus-row">
                <dt>{f.k}</dt>
                <dd>{f.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
