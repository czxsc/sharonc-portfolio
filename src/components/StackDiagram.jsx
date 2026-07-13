import { useState } from 'react';
import './StackDiagram.css';

/* ------------------------------------------------------------------
   Interactive system-architecture stack (references/architecture_ref
   .jpg): an isometric pile of translucent plates, one plate per tool,
   grouped by layer. Hovering (or tapping / focusing) a group spreads
   its plates apart and swaps the card on the right to that group's
   tooling; everything else dims. Pure transform/opacity, so the
   motion stays on the compositor.

   Data shape (content.js → section.stack):
   { title, hint, flow: [{title, note}],
     groups: [{ name, tone, tools: [{name, note}] }] }
   ------------------------------------------------------------------ */

// plate spacing (px): resting pitch, spread pitch inside the hovered
// group, and the breathing room that opens around it
const GAP = 13;
const GAP_HOT = 30;
const PAD = 22;
const PLATE_H = 150; // projected diamond height, keeps the pile centered
const SCENE_H = 440;

export default function StackDiagram({ stack }) {
  const [hot, setHot] = useState(null); // hovered/selected group index

  // lay the plates out top → bottom; positions transition in CSS
  const plates = [];
  let y = 0;
  stack.groups.forEach((g, gi) => {
    if (hot === gi && gi !== 0) y += PAD;
    g.tools.forEach(() => {
      plates.push({ gi, y, tone: g.tone });
      y += hot === gi ? GAP_HOT : GAP;
    });
    if (hot === gi) y += PAD;
  });
  const offset = Math.max(0, (SCENE_H - PLATE_H - y) / 2);

  const group = hot != null ? stack.groups[hot] : null;

  return (
    <div
      className="sd"
      onPointerLeave={(e) => {
        // a touch pointer "leaves" right after tapping — keep the pick
        if (e.pointerType !== 'touch') setHot(null);
      }}
    >
      {/* legend */}
      <div className="sd-legend">
        <p className="sd-label">The stack · top → bottom</p>
        <ul>
          {stack.groups.map((g, gi) => (
            <li key={g.name}>
              <button
                type="button"
                className={`sd-key ${hot === gi ? 'is-hot' : ''}`}
                style={{ '--c': g.tone }}
                onPointerEnter={() => setHot(gi)}
                onFocus={() => setHot(gi)}
                onClick={() => setHot(hot === gi ? null : gi)}
                aria-pressed={hot === gi}
              >
                <span className="sd-swatch" aria-hidden="true" />
                <span className="sd-key-text">
                  {g.name}
                  <small>{g.tools.length} layers</small>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* isometric pile — bottom plates first so the upper ones paint
          in front; decorative, the legend is the accessible control */}
      <div
        className={`sd-scene ${hot != null ? 'has-hot' : ''}`}
        style={{ height: SCENE_H }}
        aria-hidden="true"
      >
        {plates
          .map((p, i) => (
            <div
              key={i}
              className={`sd-plate ${p.gi === hot ? 'is-hot' : ''}`}
              style={{ '--c': p.tone, '--y': `${offset + p.y}px` }}
              onPointerEnter={() => setHot(p.gi)}
            />
          ))
          .reverse()}
      </div>

      {/* detail card */}
      <aside className="sd-card" aria-live="polite">
        <p className="sd-label">The architecture</p>
        {group ? (
          <div className="sd-card-body" key={group.name} style={{ '--c': group.tone }}>
            <h3>{group.name}</h3>
            <p className="sd-hint">
              {group.tools.length} layers · top to bottom
            </p>
            <ul>
              {group.tools.map((t) => (
                <li key={t.name}>
                  <strong>{t.name}</strong>
                  <span>{t.note}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="sd-card-body" key="default">
            <h3>{stack.title}</h3>
            <p className="sd-hint">{stack.hint}</p>
            <ul>
              {stack.flow.map((f) => (
                <li key={f.title}>
                  <strong>{f.title}</strong>
                  <span>{f.note}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>
    </div>
  );
}
