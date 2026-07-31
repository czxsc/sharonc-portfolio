import { useState } from 'react';
import './CodeMap.css';

/* ------------------------------------------------------------------
   CodeMap — how a codebase is organized, drawn as a technical
   elevation rather than a pile of plates.

   The point the diagram has to make is that the tiers are not four
   equal boxes: the surface is split into two parallel families
   (sections and overlay pages), and everything below it runs the
   full width because it is shared by all of them. So depth reads
   downward, width reads as reach, and a foundation that spans the
   drawing is literally drawn spanning it.

   Files are the only interactive part. Hovering (or focusing) one
   prints what it owns into the caption rail at the bottom, which is
   height-reserved so nothing under the diagram moves.

   The last tier can set `base`, which draws it as ground: a tinted
   band bled to the card's edges instead of another stratum. That one
   holds the dependencies rather than files we wrote, and the band is
   what says so without a second legend.

   Data shape (content.js → section.codeMap):
   { title, hint, stats: [{value, label}],
     tiers: [{ id, name, note, base?, groups: [{ name?, items: [{name, note}] }] }] }
   ------------------------------------------------------------------ */

export default function CodeMap({ map }) {
  const [hot, setHot] = useState(null); // the file being read

  return (
    <div
      className={`cm ${hot ? 'has-hot' : ''}`}
      onPointerLeave={(e) => {
        // a touch pointer "leaves" immediately after tapping — keep the pick
        if (e.pointerType !== 'touch') setHot(null);
      }}
    >
      <div className="cm-head">
        <h3>{map.title}</h3>
        {map.stats?.length > 0 && (
          <dl className="cm-stats">
            {map.stats.map((s) => (
              <div key={s.label}>
                <dt>{s.value}</dt>
                <dd>{s.label}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      <div className="cm-body">
        {map.tiers.map((tier) => (
          <section
            className={`cm-tier ${tier.base ? 'is-base' : ''}`}
            key={tier.id}
          >
            <div className="cm-rail">
              <span className="cm-num" aria-hidden="true">
                {tier.id}
              </span>
              <h4>{tier.name}</h4>
              <p>{tier.note}</p>
            </div>

            <div
              className={`cm-groups ${tier.groups.length > 1 ? 'is-split' : ''}`}
            >
              {tier.groups.map((g, gi) => (
                <div
                  className={`cm-group ${g.name ? 'is-boxed' : ''}`}
                  key={g.name || gi}
                >
                  {g.name && <p className="cm-group-name">{g.name}</p>}
                  <ul className="cm-items">
                    {g.items.map((it) => (
                      <li key={it.name}>
                        <button
                          type="button"
                          className={`cm-item ${hot?.name === it.name ? 'is-hot' : ''}`}
                          onPointerEnter={() => setHot(it)}
                          onFocus={() => setHot(it)}
                          onClick={() => setHot(hot?.name === it.name ? null : it)}
                          aria-pressed={hot?.name === it.name}
                        >
                          {it.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* height-reserved so reading a file never moves the page */}
      <p className="cm-caption" aria-live="polite">
        {hot ? (
          <>
            <strong>{hot.name}</strong>
            <span>{hot.note}</span>
          </>
        ) : (
          <span className="cm-hint">{map.hint}</span>
        )}
      </p>
    </div>
  );
}
