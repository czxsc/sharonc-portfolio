import { Fragment } from 'react';
import './DesignBoard.css';

/* ------------------------------------------------------------------
   DesignBoard — the two panels that open the portfolio case study
   (ProjectPage section.designBoard): the wall of references the site
   was picked from, and the guidelines that came out of it, set as a
   brand-book card.

   The pair is the point: a page of everybody else's work, then the one
   card it collapsed into. The card is drawn in the site's own type and
   colour rather than screenshotted, so it stays honest when the tokens
   move — the specimens ARE the fonts they name.

   Data shape (content.js → section.designBoard):
   { reference: { src, label, alt },
     card: { label,
             palette: [{ hex, name, share }],
             type: [{ family, role, size, font, weight?, set? }] },
     caption }
   ------------------------------------------------------------------ */

export default function DesignBoard({ board }) {
  const { reference, card } = board;
  return (
    <figure className="db">
      <div className="db-col">
        <span className="db-label">{reference.label}</span>
        <img
          className="db-ref"
          src={reference.src}
          alt={reference.alt}
          loading="lazy"
        />
      </div>

      <div className="db-col">
        <span className="db-label">{card.label}</span>
        <div className="db-card">
          <div className="db-block">
            <span className="db-block-label">Palette</span>
            {/* One bar, cut at the shares the colours are actually used
                at, rather than five equal chips: the strip should say
                that the site is nearly all paper and ink and that the
                accents are trim. Names sit in the legend under it —
                a 4% segment has no room to carry its own label. */}
            <div className="db-bar" aria-hidden="true">
              {card.palette.map((c) => (
                <span
                  key={c.hex}
                  style={{ '--c': c.hex, flexGrow: c.share }}
                />
              ))}
            </div>
            <ul className="db-legend">
              {card.palette.map((c) => (
                <li key={c.hex}>
                  <span className="db-chip" style={{ '--c': c.hex }} />
                  <span className="db-legend-name">{c.name}</span>
                  <code>{c.hex.replace('#', '')}</code>
                </li>
              ))}
            </ul>
          </div>

          <div className="db-block">
            <span className="db-block-label">Type</span>
            {/* dt / dd / dd straight into the list, no row wrappers: one
                grid across all four rows is what lines the roles and the
                sizes up into columns. */}
            <dl className="db-type">
              {card.type.map((t) => (
                <Fragment key={t.family}>
                  <dt
                    style={{
                      fontFamily: t.font,
                      fontSize: t.set,
                      fontWeight: t.weight,
                      // the hand is only ever set lowercase — its capitals are
                      // short enough to read as a different face entirely
                      textTransform: t.lower ? 'lowercase' : undefined,
                    }}
                  >
                    {t.family}
                  </dt>
                  <dd className="db-role">{t.role}</dd>
                  <dd className="db-size">{t.size}</dd>
                </Fragment>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {board.caption && <figcaption>{board.caption}</figcaption>}
    </figure>
  );
}
