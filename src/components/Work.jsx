import { useRef, useState } from 'react';
import { projects } from '../data/content.js';
import { ArrowRight } from './Doodles.jsx';
import ProjectPage from './ProjectPage.jsx';
import './Work.css';

export default function Work() {
  const [active, setActive] = useState(0);
  const [openIndex, setOpenIndex] = useState(null); // case study overlay
  const btnRefs = useRef([]);

  const openProject = (i) => {
    setActive(i);
    setOpenIndex(i);
  };

  const closeProject = () => {
    const i = openIndex;
    setOpenIndex(null);
    setActive(i);
    // after the overlay unmounts and #root sheds `inert` — a focus()
    // into an inert subtree is silently ignored
    requestAnimationFrame(() =>
      btnRefs.current[i]?.focus({ preventScroll: true })
    );
  };

  return (
    <section id="work" className="section work">
      <div className="container">
        <div className="section-head reveal">
          <h2>Selected Work</h2>
          <p className="head-note">Hover to preview — click a project for the case study.</p>
        </div>

        <div className="work-gallery reveal">
          {/* list */}
          <ol className="work-list">
            {projects.map((p, i) => (
              <li key={p.name} className="work-row">
                <button
                  type="button"
                  ref={(el) => (btnRefs.current[i] = el)}
                  className={`work-item ${i === active ? 'is-active' : ''}`}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => openProject(i)}
                  aria-label={`Open ${p.name} case study`}
                >
                  <span className="work-index">{p.index}</span>
                  <span className="work-name">{p.name}</span>
                  <ArrowRight size={15} className="work-arrow" />
                </button>
              </li>
            ))}
          </ol>

          {/* preview — stacked covers crossfade */}
          <div className="work-preview" aria-hidden="true">
            <div className="work-frame">
              {projects.map((p, i) => (
                <div
                  key={p.name}
                  className={`preview-item ${i === active ? 'is-active' : ''}`}
                  style={{ '--t1': p.tone[0], '--t2': p.tone[1] }}
                >
                  <div className="preview-bar">
                    <span className="preview-dots"><i /><i /><i /></span>
                    <span className="preview-url">{p.name.toLowerCase().replace(/\s+/g, '')}.app</span>
                  </div>
                  <div className="preview-body">
                    <img className="preview-img" src={p.image} alt="" />
                    <div className="preview-label">
                      <span className="preview-blurb">{p.blurb}</span>
                      <span className="preview-meta">{p.tech.join(' · ')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {openIndex !== null && (
        <ProjectPage
          index={openIndex}
          onNavigate={setOpenIndex}
          onClose={closeProject}
        />
      )}
    </section>
  );
}
