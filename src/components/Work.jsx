import { projects } from '../data/content.js';
import { ArrowRight } from './Doodles.jsx';
import './Work.css';

export default function Work() {
  return (
    <section id="work" className="section work">
      <div className="container">
        <div className="section-head reveal">
          <span className="folio">03</span>
          <h2>Selected Work</h2>
          <p className="head-note">
            A few projects, each treated as a small case study.
          </p>
        </div>

        <div className="work-list">
          {projects.map((p, i) => (
            <article
              key={p.name}
              className={`project ${i % 2 === 1 ? 'is-reversed' : ''}`}
            >
              <a
                className="project-cover img-reveal"
                href={p.links.study}
                aria-label={`${p.name} — read the case study`}
                style={{
                  '--t1': p.tone[0],
                  '--t2': p.tone[1],
                }}
              >
                <span className="project-ghost" aria-hidden="true">
                  {p.index}
                </span>
                <span className="project-cover-name" aria-hidden="true">
                  {p.name}
                </span>
                <span className="project-cover-meta">
                  <span>Case study</span>
                  <span>{p.year}</span>
                </span>
              </a>

              <div className="project-info reveal">
                <span className="project-index">Feature {p.index}</span>
                <h3 className="project-name">{p.name}</h3>
                <p className="project-tagline">{p.tagline}</p>
                <p className="project-desc">{p.description}</p>

                <dl className="project-meta">
                  <div>
                    <dt>Role</dt>
                    <dd>{p.role}</dd>
                  </div>
                  <div>
                    <dt>Stack</dt>
                    <dd className="project-stack">
                      {p.stack.map((s) => (
                        <span key={s}>{s}</span>
                      ))}
                    </dd>
                  </div>
                </dl>

                <a className="project-link" href={p.links.study}>
                  <span className="ulink">Read the case study</span>
                  <ArrowRight size={18} className="project-arrow" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
