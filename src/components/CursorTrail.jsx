import './CursorTrail.css';

/* ------------------------------------------------------------------
   CursorTrail — the cursor's versions, laid out as a matrix rather
   than a row of drawings.

   The whole argument is legibility, so the marks are useless on their
   own: each version is shown on both grounds it had to survive, paper
   and the espresso pool. Read a column and you see which passes went
   missing on dark ground, read a row and you see whether resting and
   hovering looked any different.

   Two things are deliberate. The marks are the real cursor files at
   their real size, 32px, because "the drawing closes up at cursor
   size" is a claim the reader should be able to check rather than
   take on trust. And the grounds are quoted hexes, not tokens, so the
   record still says what it said if the palette moves later or the
   page is read in dark theme.

   Data shape (content.js → section.cursorTrail). The copy keys
   (label / title / problem / solution) are read by PassCopy, which
   renders them above this figure so they sit in the body flow like
   the compare pairs' own:
   { title, hint,
     grounds: [{ id, label, color }],
     stages: [{ id, name, current?, note,
                marks: { <groundId>: { rest, link } } }],   // { src }
     caption }

   `showTitle` is false when a PassCopy head is standing above this
   figure. Both read `title` off the same object, so without it the
   heading would print twice.
   ------------------------------------------------------------------ */

const STATES = [
  ['rest', 'at rest'],
  ['link', 'over a link'],
];

export default function CursorTrail({ trail, showTitle = true }) {
  const { grounds, stages } = trail;
  return (
    <figure className="ct">
      <div className="ct-head">
        {showTitle && trail.title && <h3>{trail.title}</h3>}
        {trail.hint && <p className="ct-hint">{trail.hint}</p>}
      </div>

      {/* the ground labels sit once, over the columns they name; each
          row repeats them only once the grid has stacked (see the CSS) */}
      <div className="ct-cols" aria-hidden="true">
        <span />
        <div className="ct-grounds">
          {grounds.map((g) => (
            <span className="ct-col-label" key={g.id}>
              {g.label}
            </span>
          ))}
        </div>
      </div>

      <ol className="ct-rows">
        {stages.map((st) => (
          <li className={`ct-row ${st.current ? 'is-current' : ''}`} key={st.id}>
            <div className="ct-rail">
              <p className="ct-name">
                <span className="ct-num">{st.id}</span>
                {st.name}
                {st.current && <span className="ct-tag">Current</span>}
              </p>
              <p className="ct-note">{st.note}</p>
            </div>

            <div className="ct-grounds">
              {grounds.map((g) => (
                <div className="ct-ground" key={g.id}>
                  <span className="ct-ground-label" aria-hidden="true">
                    {g.label}
                  </span>
                  <div className="ct-swatch" style={{ background: g.color }}>
                    {STATES.map(([key, label]) => (
                      <img
                        className="ct-mark"
                        key={key}
                        src={st.marks[g.id][key].src}
                        alt={`${st.name}, ${label}, ${g.label.toLowerCase()}`}
                        loading="lazy"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </li>
        ))}
      </ol>

      {trail.caption && <figcaption>{trail.caption}</figcaption>}
    </figure>
  );
}
