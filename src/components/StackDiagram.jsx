import { useEffect, useRef, useState } from 'react';
import './StackDiagram.css';

/* ------------------------------------------------------------------
   Interactive system-architecture stack (references/architecture_ref
   .jpg): an isometric pile of plates, one plate per tool, grouped by
   layer. Hovering (or tapping / focusing) a group spreads its plates
   apart and swaps the card on the right to that group's tooling;
   the rest drain toward paper. Position is transform-only, so the
   spread stays on the compositor.

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
const SCENE_H = 520;
// matches the plate's transform transition, so a pick is only ever
// taken from a pile that has stopped moving
const SETTLE = 520;

// lay the plates out top → bottom for a given selection, and record
// the band each group occupies so the caller can pin one in place
function layout(groups, hotIdx) {
  const plates = [];
  const bands = [];
  let y = 0;
  groups.forEach((g, gi) => {
    if (hotIdx === gi && gi !== 0) y += PAD;
    const from = y;
    g.tools.forEach(() => {
      plates.push({ gi, y, tone: g.tone });
      y += hotIdx === gi ? GAP_HOT : GAP;
    });
    if (hotIdx === gi) y += PAD;
    bands.push((from + y) / 2);
  });
  return { plates, bands, total: y };
}

export default function StackDiagram({ stack }) {
  const [hot, setHot] = useState(null); // hovered/selected group index
  // held while the pile is gliding; plate hover is ignored until it
  // clears (see pickFromPlate)
  const moving = useRef(false);
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);

  /* Positions transition in CSS. The pile is centred on its RESTING
     height, and a spread group is then pinned so its own centre stays
     where it was at rest. Centring on the spread height instead moved
     every plate, including the one under the cursor — which handed a
     neighbouring group the pointer, whose spread moved everything
     back, and the two fought for it. Pinning means opening a group
     pushes its neighbours away and leaves the group itself still. */
  const rest = layout(stack.groups, null);
  const { plates, bands } = layout(stack.groups, hot);
  const base = Math.max(0, (SCENE_H - PLATE_H - rest.total) / 2);
  const offset = hot == null ? base : base + rest.bands[hot] - bands[hot];

  /* The legend is stationary, so it always gets its pick. The plates
     are not: they are still gliding for half a second after a change,
     and a plate sliding under a held cursor is not a new intent. So
     plate picks go quiet until the motion settles. */
  const pick = (gi) => {
    moving.current = true;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      moving.current = false;
    }, SETTLE);
    setHot(gi);
  };
  const pickFromPlate = (gi) => {
    if (gi === hot || moving.current) return;
    pick(gi);
  };

  const group = hot != null ? stack.groups[hot] : null;
  // longest list the card can ever hold, used to reserve its height
  const reserve = [stack.flow, ...stack.groups.map((g) => g.tools)].reduce((a, l) =>
    l.length > a.length ? l : a,
  );

  return (
    <div
      className="sd"
      onPointerLeave={(e) => {
        // a touch pointer "leaves" right after tapping — keep the pick
        if (e.pointerType === 'touch') return;
        // coming back in is a fresh intent, so it shouldn't wait
        moving.current = false;
        setHot(null);
      }}
    >
      {/* legend */}
      <div className="sd-legend">
        <p className="sd-label">The stack</p>
        <ul>
          {stack.groups.map((g, gi) => (
            <li key={g.name}>
              <button
                type="button"
                className={`sd-key ${hot === gi ? 'is-hot' : ''}`}
                style={{ '--c': g.tone }}
                onPointerEnter={() => pick(gi)}
                onFocus={() => pick(gi)}
                onClick={() => pick(hot === gi ? null : gi)}
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
              onPointerEnter={() => pickFromPlate(p.gi)}
            />
          ))
          .reverse()}
      </div>

      {/* detail card. The box used to grow by ~150px whenever a group
          with more tools than the last one was picked, which read as
          the whole diagram lurching. So the card reserves the tallest
          list it will ever hold: a hidden copy of it shares the body's
          grid cell, setting a floor no real state can exceed. Measured
          from the content rather than guessed, so it stays right when
          the copy changes. */}
      <aside className="sd-card" aria-live="polite">
        <p className="sd-label">The architecture</p>
        <div className="sd-card-stack">
          <div className="sd-card-body sd-card-ghost" aria-hidden="true">
            {/* the default head, which is the tallest (a two-line title
                and a hint), over the longest list any state can show */}
            <h3>{stack.title}</h3>
            <p className="sd-hint">{stack.hint}</p>
            <ul>
              {reserve.map((t) => (
                <li key={t.name}>
                  <strong>{t.name}</strong>
                  <span>{t.note}</span>
                </li>
              ))}
            </ul>
          </div>
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
        </div>
      </aside>
    </div>
  );
}
