import { useState } from 'react';
import './ArchMap.css';

/* ------------------------------------------------------------------
   ArchMap — interactive class/file dependency diagram (references/
   diagram_ex.png): boxes grouped into colored zones, with arrows
   showing which class depends on which. Hovering, tapping, or
   focusing a node lights up its neighbors and dims the rest; the
   side card fills in with that node's role plus what it depends on
   / is depended on by (derived straight from the edge list, so it
   never needs hand-authoring). Positions are laid out on a small
   integer grid (col/row) rather than measured from the DOM, so the
   whole thing scales fluidly with the container's aspect-ratio
   instead of needing JS layout/resize handling.

   Data shape (content.js → section.archMap):
   { title, hint,
     zones: [{ id, name, tone, note, colStart, colEnd, rowStart, rowEnd }],
     nodes: [{ id, zone, label, col, row, count?,
                detail: { summary, points?: [{ text }] } }],
     edges: [{ from, to }] }
   ------------------------------------------------------------------ */

export default function ArchMap({ map }) {
  const [active, setActive] = useState(null); // node id | null

  const cols = Math.max(
    ...map.zones.map((z) => z.colEnd),
    ...map.nodes.map((n) => n.col)
  );
  const rows = Math.max(
    ...map.zones.map((z) => z.rowEnd),
    ...map.nodes.map((n) => n.row)
  );
  const cellW = 100 / cols;
  const cellH = 100 / rows;

  const nodeById = Object.fromEntries(map.nodes.map((n) => [n.id, n]));
  const center = (n) => ({
    x: (n.col - 1) * cellW + cellW / 2,
    y: (n.row - 1) * cellH + cellH / 2,
  });

  const isEdgeLit = (e) => active && (e.from === active || e.to === active);
  const isNodeLit = (id) =>
    id === active ||
    map.edges.some(
      (e) =>
        (e.from === active && e.to === id) ||
        (e.to === active && e.from === id)
    );

  const activeNode = active ? nodeById[active] : null;
  const activeZone = activeNode ? map.zones.find((z) => z.id === activeNode.zone) : null;
  const usesLabels = active
    ? map.edges.filter((e) => e.from === active).map((e) => nodeById[e.to]?.label)
    : [];
  const usedByLabels = active
    ? map.edges.filter((e) => e.to === active).map((e) => nodeById[e.from]?.label)
    : [];

  return (
    <div
      className={`am ${active ? 'has-active' : ''}`}
      onPointerLeave={(e) => {
        // a touch pointer "leaves" right after tapping — keep the pick
        if (e.pointerType !== 'touch') setActive(null);
      }}
      onClick={(e) => {
        if (!e.target.closest('.am-node')) setActive(null);
      }}
    >
      <div className="am-scene-wrap">
        <div className="am-scene" style={{ aspectRatio: `${cols} / ${rows}` }}>
          {map.zones.map((z) => (
            <div
              key={z.id}
              className="am-zone"
              style={{
                '--c': z.tone,
                left: `${(z.colStart - 1) * cellW}%`,
                top: `${(z.rowStart - 1) * cellH}%`,
                width: `${(z.colEnd - z.colStart + 1) * cellW}%`,
                height: `${(z.rowEnd - z.rowStart + 1) * cellH}%`,
              }}
            >
              <span className="am-zone-label">{z.name}</span>
            </div>
          ))}

          {/* edges: percentage-unit viewBox lines up 1:1 with the
              node/zone percentage positions above, so no measuring */}
          <svg
            className="am-edges"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <marker
                id="am-arrow"
                viewBox="0 0 10 10"
                refX="8.5"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M0,0 L10,5 L0,10 z" fill="var(--ink-faint)" />
              </marker>
            </defs>
            {map.edges.map((e, i) => {
              const a = nodeById[e.from];
              const b = nodeById[e.to];
              if (!a || !b) return null;
              const p1 = center(a);
              const p2 = center(b);
              const mx = (p1.x + p2.x) / 2;
              const d = `M ${p1.x} ${p1.y} C ${mx} ${p1.y}, ${mx} ${p2.y}, ${p2.x} ${p2.y}`;
              const lit = isEdgeLit(e);
              return (
                <path
                  key={i}
                  d={d}
                  className={`am-edge ${lit ? 'is-kin' : ''} ${
                    active && !lit ? 'is-dim' : ''
                  }`}
                  markerEnd="url(#am-arrow)"
                />
              );
            })}
          </svg>

          {map.nodes.map((n) => {
            const zone = map.zones.find((z) => z.id === n.zone);
            const lit = isNodeLit(n.id);
            return (
              <button
                key={n.id}
                type="button"
                className={`am-node ${n.id === active ? 'is-active' : ''} ${
                  active && n.id !== active && lit ? 'is-kin' : ''
                } ${active && !lit ? 'is-dim' : ''}`}
                style={{
                  '--c': zone?.tone,
                  left: `${(n.col - 1) * cellW}%`,
                  top: `${(n.row - 1) * cellH}%`,
                  width: `${cellW}%`,
                  height: `${cellH}%`,
                }}
                onPointerEnter={(e) => {
                  if (e.pointerType !== 'touch') setActive(n.id);
                }}
                onFocus={() => setActive(n.id)}
                onClick={() => setActive(active === n.id ? null : n.id)}
                aria-pressed={active === n.id}
              >
                <span className="am-node-label">{n.label}</span>
                {n.count && <span className="am-node-count">{n.count}</span>}
              </button>
            );
          })}
        </div>
      </div>

      <aside className="am-card" aria-live="polite">
        <p className="am-label">The dependency map</p>
        {activeNode ? (
          <div className="am-card-body" key={activeNode.id} style={{ '--c': activeZone?.tone }}>
            <p className="am-crumb">{activeZone?.name}</p>
            <h3>{activeNode.label}</h3>
            <p className="am-summary">{activeNode.detail.summary}</p>
            {activeNode.detail.points && (
              <ul className="am-points">
                {activeNode.detail.points.map((p, i) => (
                  <li key={i}>{p.text}</li>
                ))}
              </ul>
            )}
            {(usesLabels.length > 0 || usedByLabels.length > 0) && (
              <div className="am-deps">
                {usesLabels.length > 0 && (
                  <div>
                    <span className="am-dep-tag am-dep-tag--uses">depends on</span>
                    <p>{usesLabels.join(', ')}</p>
                  </div>
                )}
                {usedByLabels.length > 0 && (
                  <div>
                    <span className="am-dep-tag am-dep-tag--used">used by</span>
                    <p>{usedByLabels.join(', ')}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="am-card-body" key="default">
            <h3>{map.title}</h3>
            <p className="am-hint">{map.hint}</p>
            <ul className="am-zone-legend">
              {map.zones.map((z) => (
                <li key={z.id} style={{ '--c': z.tone }}>
                  <span className="am-zone-swatch" aria-hidden="true" />
                  <span>
                    <strong>{z.name}</strong>
                    <span>{z.note}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>
    </div>
  );
}
