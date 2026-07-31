import { Fragment } from 'react';
import './DesignBoard.css';

/* ------------------------------------------------------------------
   DesignBoard — the panels that carry the portfolio case study's design
   half (ProjectPage section.designBoard): the wall of references the
   site was picked from, and the guidelines that came out of it, set as
   a brand-book card.

   The card is drawn in the site's own type and colour rather than
   screenshotted, so it stays honest when the tokens move — the
   specimens ARE the fonts they name.

   Either half may stand alone. The reference wall belongs to the
   process section and the card to the style guide one section down, so
   a board with only a `card` drops to a single column and lays its
   blocks out in a row instead (see `.db.is-solo`).

   Data shape (content.js → section.designBoard):
   { reference?: { src, label, alt },
     card?: { label,
              palette: [{ hex, name, share }],
              type: [{ family, role, size, font, weight? }],
              rules?: [{ name, value }] },
     caption }
   ------------------------------------------------------------------ */

export default function DesignBoard({ board }) {
  const { reference, card } = board;
  return (
    <figure className={`db ${reference && card ? '' : 'is-solo'}`}>
      {reference && (
        <div className="db-col">
          <span className="db-label">{reference.label}</span>
          <img
            className="db-ref"
            src={reference.src}
            alt={reference.alt}
            loading="lazy"
          />
        </div>
      )}

      {card && (
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
                    <dt style={{ fontFamily: t.font, fontWeight: t.weight }}>
                      {t.family}
                    </dt>
                    <dd className="db-role">{t.role}</dd>
                    <dd className="db-size">{t.size}</dd>
                  </Fragment>
                ))}
              </dl>
            </div>

            {/* The rest of the guide: radii, the spacing base, and the two
                motion numbers. These have no specimen worth drawing at card
                size, and writing them out is what makes the card a style
                guide rather than a palette-and-type strip.

                Name over value rather than beside it. This is the narrowest
                of the three columns and the values are the longest strings
                on the card, so a name/value pair on one line either forced
                the value to wrap mid-list or pushed it past the column. */}
            {card.rules && (
              <div className="db-block">
                <span className="db-block-label">System</span>
                <dl className="db-rules">
                  {card.rules.map((r) => (
                    <div className="db-rule" key={r.name}>
                      <dt>{r.name}</dt>
                      <dd>{r.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>
      )}

      {board.caption && <figcaption>{board.caption}</figcaption>}
    </figure>
  );
}
