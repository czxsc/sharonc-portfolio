import './ZoneStudy.css';
import { useRef, useState } from 'react';

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
     items:  [{ id, name, tone, wipe, note,
                palette: ['#rrggbb'], art: { [panelId]: src } }] }
   ------------------------------------------------------------------ */

/* Two paintings are never on screen together. The grades look like one
   composition but they aren't registered to it — the drawing carried on
   between colourings, so lines sit a few pixels apart from layer to
   layer. Any overlap puts that on display: a crossfade between them
   doesn't read as a hue rotating, it reads as the picture shifting
   under itself, which is the opposite of the claim the panel makes.

   So the panel dips instead. Each grade carries its own opaque field in
   its own colour, and a switch hands over between the two fields: the
   outgoing layer closes behind its colour, the incoming layer rises
   already covered by its own, and only then does that field open onto
   the new painting. What you see is old painting → old colour → new
   colour → new painting, and the misregistration has nowhere to show.

   All of it is opacity on elements that are mounted once — no timers,
   no scheduled swap, nothing to tear down, and no direction anywhere in
   it. Selecting a layer re-points a set of opacity targets and CSS
   carries each from wherever it currently is, so running the tabs
   faster than the dip just re-aims them mid-flight. */

export default function ZoneStudy({ zones }) {
  const [active, setActive] = useState(0);
  const zone = zones.items[active];
  const tabRefs = useRef([]);

  /* These are announced as tabs, so they have to behave like tabs: one
     stop in the page's tab order, and ←/→/Home/End to move between
     them. Without this a screen-reader user is told to use the arrow
     keys and nothing happens. Focus follows selection — selection is
     instant, only the grade takes a beat to settle — so arrowing
     through the layers costs nothing. */
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

      {/* Nothing here is keyed or rebuilt across a switch — the grid,
          the cells and all sixteen images are mounted once and stay
          put, so there is no layout to hold still. It holds still
          because nothing ever moves. The captions and the frames sit
          above the dip and never leave, which is what keeps the switch
          reading as one panel being re-graded. */}
      <div
        className="lwz-grid"
        id="lwz-panel"
        role="tabpanel"
        aria-labelledby={`lwz-tab-${zone.id}`}
      >
        {zones.panels.map((p, i) => (
          <div className={`lwz-cell is-${p.id}`} key={p.id} style={{ '--i': i }}>
            {zones.items.map((z, zi) => (
              <div
                key={z.id}
                className={`lwz-layer ${zi === active ? 'is-on' : ''}`}
                style={{ '--wipe': z.wipe }}
              >
                <img
                  src={z.art[p.id]}
                  /* one description per cell: the grade on show owns
                     it, the three behind it are the same panel in
                     other grades and would only repeat themselves */
                  alt={zi === active ? `${z.name} — ${p.label}` : ''}
                  aria-hidden={zi === active ? undefined : 'true'}
                  draggable="false"
                />
                {/* the layer's own colour, held over its own painting */}
                <span className="lwz-veil" aria-hidden="true" />
              </div>
            ))}
            <span className="lwz-cap">{p.label}</span>
          </div>
        ))}
      </div>

      <figcaption className="lwz-foot">
        {/* The ramp re-grades in place on the same sweep as the panels
            above it: six swatches transitioning colour, no remount, so
            the strip reads as the same instrument being re-tuned
            rather than a new strip arriving. The hex settles after. */}
        <ol className="pp-palette" aria-label={`${zone.name} palette`}>
          {zone.palette.map((c, i) => (
            <li key={i} style={{ '--c': c, '--i': i }}>
              <span className="pp-swatch" aria-hidden="true" />
              <code key={c}>{c.replace('#', '')}</code>
            </li>
          ))}
        </ol>
        <p className="lwz-note" key={zone.id}>
          {zone.note}
        </p>
      </figcaption>
    </figure>
  );
}
