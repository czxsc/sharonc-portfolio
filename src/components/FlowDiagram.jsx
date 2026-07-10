import { useState } from 'react';
import './FlowDiagram.css';

/* ------------------------------------------------------------------
   FlowDiagram — layered request-flow architecture (ProjectPage
   section.flow; DPK case study). Each layer is a band of file /
   function chips; between bands, labeled channels animate the two
   directions of traffic (commands down, status up). Hovering,
   tapping, or focusing a chip swaps the side card to that file's
   sends & listens and lights up its kin — the chips in other layers
   that serve the same feature. Transform/opacity only; the traffic
   dots hide under reduced motion (arrowheads still carry direction).

   Data shape (content.js → section.flow):
   { title, hint,
     journey: [{ title, note }],            // default card: the round trip
     layers: [{ id, name, file, note, tone, terminal?,
                rows: [{ label?, nodes: [{ id, label, feature: [...],
                  detail: { summary, points: [{ tag, text }] } }] }] }],
     channels: [{ via, down, up }] }        // one per gap between layers
   ------------------------------------------------------------------ */

const TAG_GLYPH = { sends: '↓ ', listens: '↑ ' }; // ↓ ↑

export default function FlowDiagram({ flow }) {
  const [active, setActive] = useState(null); // { node, layer } | null

  const isKin = (node) =>
    node.feature.includes('all') ||
    active.node.feature.includes('all') ||
    node.feature.some((f) => active.node.feature.includes(f));

  const chipState = (node) => {
    if (!active) return '';
    if (node === active.node) return 'is-active';
    return isKin(node) ? 'is-kin' : 'is-dim';
  };

  return (
    <div
      className={`fd ${active ? 'has-active' : ''}`}
      onPointerLeave={(e) => {
        // a touch pointer "leaves" right after tapping — keep the pick
        if (e.pointerType !== 'touch') setActive(null);
      }}
      onClick={(e) => {
        // tapping the background (not a chip) returns the default card
        if (!e.target.closest('.fd-chip')) setActive(null);
      }}
    >
      <div className="fd-scene">
        {flow.layers.map((layer, li) => (
          <div key={layer.id}>
            <section
              className={`fd-layer ${layer.terminal ? 'is-terminal' : ''}`}
              style={{ '--c': layer.tone }}
            >
              <header className="fd-layer-head">
                <span className="fd-swatch" aria-hidden="true" />
                <h3>{layer.name}</h3>
                <code>{layer.file}</code>
                <p>{layer.note}</p>
              </header>
              {layer.rows?.map((row, ri) => (
                <div className="fd-row" key={ri}>
                  {row.label && (
                    <span className="fd-row-label">{row.label}</span>
                  )}
                  <div className="fd-chips">
                    {row.nodes.map((node) => (
                      <button
                        key={node.id}
                        type="button"
                        className={`fd-chip ${chipState(node)}`}
                        onPointerEnter={(e) => {
                          // touch selects via click; enter would undo it
                          if (e.pointerType !== 'touch')
                            setActive({ node, layer });
                        }}
                        onFocus={() => setActive({ node, layer })}
                        // select-only: focus fires before click, so a
                        // toggle here would undo its own tap
                        onClick={() => setActive({ node, layer })}
                        aria-pressed={active?.node === node}
                      >
                        {node.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </section>

            {li < flow.layers.length - 1 && (
              <div className="fd-channel">
                <span className="fd-pipe fd-pipe-down" aria-hidden="true">
                  <i />
                  <i />
                </span>
                <div className="fd-channel-text">
                  <span className="fd-via">{flow.channels[li].via}</span>
                  <span className="fd-dir">↓ {flow.channels[li].down}</span>
                  <span className="fd-dir">↑ {flow.channels[li].up}</span>
                </div>
                <span className="fd-pipe fd-pipe-up" aria-hidden="true">
                  <i />
                  <i />
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* detail card: selected file's sends & listens, or the default
          round-trip walkthrough */}
      <aside className="fd-card" aria-live="polite">
        <p className="fd-label">The architecture</p>
        {active ? (
          <div
            className="fd-card-body"
            key={active.node.id}
            style={{ '--c': active.layer.tone }}
          >
            <p className="fd-crumb">{active.layer.name}</p>
            <h3>
              <code>{active.node.label}</code>
            </h3>
            <p className="fd-summary">{active.node.detail.summary}</p>
            <ul>
              {active.node.detail.points.map((p, i) => (
                <li key={i}>
                  <span className={`fd-tag fd-tag--${p.tag}`}>
                    {TAG_GLYPH[p.tag] || ''}
                    {p.tag}
                  </span>
                  <span className="fd-point">{p.text}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="fd-card-body" key="default">
            <h3>{flow.title}</h3>
            <p className="fd-hint">{flow.hint}</p>
            <ol className="fd-steps">
              {flow.journey.map((s, i) => (
                <li key={s.title}>
                  <span className="fd-step-num">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="fd-step-text">
                    <strong>{s.title}</strong>
                    <span>{s.note}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </aside>
    </div>
  );
}
