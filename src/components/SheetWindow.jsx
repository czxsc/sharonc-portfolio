import { experience } from '../data/content.js';
import './SheetWindow.css';

/* ==================================================================
   The window language — one object, two sides.

   Two things on this site are windows: the experience timeline in
   About, and the project previews in Work. They are deliberately the
   same object seen from opposite sides — paper stock with ink type on
   the espresso pool, espresso with light type on the paper page.
   SheetFlip turns one into the other on scroll, and the tonal
   inversion *is* the turn.

   Both faces of that flight render from the components in this file,
   so the card and the real sections can never drift apart: there is
   one implementation of each side, used twice.
   ================================================================== */

/* '2024 — Present' for the window's caption. Derived rather than
   written down, so adding a role can't leave a stale span behind. */
const SPAN = (() => {
  const years = experience.flatMap(
    (e) => e.date.match(/\d{4}/g)?.map(Number) ?? []
  );
  const open = experience.some((e) => e.date.includes('Present'));
  return `${Math.min(...years)} — ${open ? 'Present' : Math.max(...years)}`;
})();

/* The paper side: the experience timeline, as a window.

   The section label lives in the chrome bar rather than above the
   list, which is what pays for the bar — it adds a strip of framing
   without adding a line of copy.

   Every --rv here is the About section's scroll ramp (see
   HeroPourTransition). Unset it falls back to 1, which is what lets
   the same markup sit at rest inside the flight card and inside the
   reduced-motion fallback. */
export function ExperienceSheet() {
  return (
    <div className="sheet sheet-paper">
      <div className="sheet-bar">
        <span className="sheet-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <h3 className="sheet-name">Experience</h3>
        <span className="sheet-meta">{SPAN}</span>
      </div>
      <div className="sheet-body">
        <ol className="exp">
          {experience.map((e, i) => (
            <li
              key={e.org}
              className={`exp-item${e.date.includes('Present') ? ' is-now' : ''}`}
              style={{ '--i': i }}
            >
              <span className="exp-dot" aria-hidden="true" />
              <span className="exp-date">{e.date}</span>
              <span className="exp-org">{e.org}</span>
              <span className="exp-role">{e.role}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/* The espresso side: one project cover.

   Interior of a `.preview-item` — the stacked covers in Work and the
   flight card's back face both render this, so the hand-off at the
   end of the flight lands on identical pixels. Styling lives in
   Work.css, next to the frame it fills. */
export function ProjectCover({ project: p }) {
  return (
    <>
      <div className="preview-bar">
        <span className="preview-dots">
          <i />
          <i />
          <i />
        </span>
        <span className="preview-url">
          {p.name.toLowerCase().replace(/\s+/g, '')}.app
        </span>
      </div>
      <div className="preview-body">
        <img className="preview-img" src={p.image} alt="" />
        <div className="preview-label">
          <span className="preview-blurb">{p.blurb}</span>
          <span className="preview-meta">{p.tech.join(' · ')}</span>
        </div>
      </div>
    </>
  );
}
