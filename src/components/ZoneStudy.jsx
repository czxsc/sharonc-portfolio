import { useEffect, useRef, useState } from 'react';
import './ZoneStudy.css';

/* ------------------------------------------------------------------
   Zone study — the background system for Little Wonder in one panel.

   Sixteen backgrounds were never sixteen paintings. Four compositions
   were painted once (a wide corridor, two squares, a tall nexus), then
   curve-graded into each layer's palette. The panel is built to make
   exactly that legible: switching layers holds the layout perfectly
   still and changes only the colour, which is the argument the section
   is making — you can see it faster than you can read it.

   Data shape (content.js → section.zones):
   { label,
     panels: [{ id, label }],           // shared across every layer
     items:  [{ id, name, tone, note,
                palette: ['#rrggbb'], art: { [panelId]: src } }] }
   ------------------------------------------------------------------ */

export default function ZoneStudy({ zones }) {
  const [active, setActive] = useState(0);
  const zone = zones.items[active];
  const tabRefs = useRef([]);

  /* These are announced as tabs, so they have to behave like tabs: one
     stop in the page's tab order, and ←/→/Home/End to move between
     them. Without this a screen-reader user is told to use the arrow
     keys and nothing happens. Focus follows selection, which is the
     right pattern here — switching is instant and has no cost. */
  const step = (i) => {
    const n = zones.items.length;
    const next = (i + n) % n;
    setActive(next);
    tabRefs.current[next]?.focus();
  };
  const onKeyDown = (e) => {
    const keys = {
      ArrowRight: () => step(active + 1),
      ArrowLeft: () => step(active - 1),
      Home: () => step(0),
      End: () => step(zones.items.length - 1),
    };
    if (keys[e.key]) {
      e.preventDefault();
      keys[e.key]();
    }
  };

  /* The swap only reads as a re-grade if the new art is on screen the
     instant the old art leaves. Decoding mid-fade would turn it into
     two pictures dissolving — the exact reading this panel exists to
     rule out — so every layer is warmed once on mount. All sixteen
     together are smaller than a single one of the source PNGs. */
  useEffect(() => {
    zones.items.forEach((z) => {
      Object.values(z.art).forEach((src) => {
        new Image().src = src;
      });
    });
  }, [zones]);

  return (
    <figure className="lwz">
      <div className="lwz-head">
        <p className="lwz-label">{zones.label}</p>
        <div
          className="lwz-tabs"
          role="tablist"
          aria-label={zones.label}
          onKeyDown={onKeyDown}
        >
          {zones.items.map((z, i) => (
            <button
              key={z.id}
              type="button"
              role="tab"
              id={`lwz-tab-${z.id}`}
              aria-selected={i === active}
              aria-controls="lwz-panel"
              // roving tabindex: the group is one tab stop, arrows move inside
              tabIndex={i === active ? 0 : -1}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              className={`lwz-tab ${i === active ? 'is-active' : ''}`}
              /* the dot is a step out of the layer's own ramp, so the
                 control is a swatch of the thing it selects — picked
                 per layer rather than by index, since Overgrown and
                 Intermittent share a ramp and need distinct dots */
              style={{ '--c': z.tone }}
              onClick={() => setActive(i)}
            >
              <span className="lwz-dot" aria-hidden="true" />
              {z.name}
            </button>
          ))}
        </div>
      </div>

      {/* key replays the cross-fade on every switch; the grid itself
          never moves, which is the point. The id is stable across
          switches so the tabs' aria-controls stays valid — it is one
          panel being re-graded, not four panels. */}
      <div
        className="lwz-grid"
        key={zone.id}
        id="lwz-panel"
        role="tabpanel"
        aria-labelledby={`lwz-tab-${zone.id}`}
      >
        {zones.panels.map((p) => (
          <div className={`lwz-cell is-${p.id}`} key={p.id}>
            <img src={zone.art[p.id]} alt={`${zone.name} — ${p.label}`} />
            <span className="lwz-cap">{p.label}</span>
          </div>
        ))}
      </div>

      <figcaption className="lwz-foot">
        <ol className="pp-palette" aria-label={`${zone.name} palette`}>
          {zone.palette.map((c) => (
            <li key={c} style={{ '--c': c }}>
              <span className="pp-swatch" aria-hidden="true" />
              <code>{c.replace('#', '')}</code>
            </li>
          ))}
        </ol>
        <p className="lwz-note">{zone.note}</p>
      </figcaption>
    </figure>
  );
}
