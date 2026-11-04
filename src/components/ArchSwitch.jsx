import { useLayoutEffect, useRef, useState } from 'react';
import { createArchStage } from './archStage.js';
import './ArchSwitch.css';

/* ------------------------------------------------------------------
   One architecture diagram with two sides, and an arrow beside it to cross
   between them. Each side's boxes are laid out by hand in the data: where a
   box sits is the argument the diagram is making, and there are only ever
   a dozen of them. The motion between the two lives in archStage.js.

   The words swap with it. Both versions are always in the page, stacked in
   one grid cell, so the section keeps the height of the taller one and
   switching never moves anything below it.

   The drawing's labels are too small to read at phone width, so each side
   is also written out as `steps`: shown there in its place, and what a
   screen reader gets everywhere else.

   Data shape (story block):
   { kind: 'architecture', id, nav, box: { width, top, height },
     views: [{ id, label, title, text, carry, legend, steps, alt,
               arch: { nodes: [{ id, x, y, w, h, title, sub?, outside? }],
                       edges: [{ from, to, d, label?, lx?, ly?, anchor? }] } }] }

   `carry` is the node on this side that stands for the whole other side.
   `outside` is a box beyond the system being drawn, shown dashed. Exactly
   two views, and both share `box` so the panel never changes size.
   ------------------------------------------------------------------ */
export default function ArchSwitch({ block }) {
  const { id, views, box } = block;
  const [view, setView] = useState(0);
  const svgRef = useRef(null);
  const stageRef = useRef(null);

  useLayoutEffect(() => {
    const stage = createArchStage(svgRef.current, views);
    stageRef.current = stage;
    return () => stage.stop();
  }, [views]);

  const [switched, setSwitched] = useState(false);

  const show = (next) => {
    setView(next);
    setSwitched(true);
    stageRef.current?.go(next);
  };

  const other = views[1 - view];

  /* Arrow keys on this control steer this control. Left alone they'd reach
     ProjectPage's handler and page away to the next project, which checks
     defaultPrevented for exactly this. */
  const onKeyDown = (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    show(e.key === 'ArrowRight' ? 1 : 0);
  };

  const panes = (render, props) => (
    <div {...props} className={`ar-stack ${props?.className ?? ''}`}>
      {views.map((v, i) => (
        <div key={v.id} className={`ar-pane ${i === view ? 'is-on' : ''}`} aria-hidden={i !== view}>
          {render(v)}
        </div>
      ))}
    </div>
  );

  return (
    <div className={`ar ${view ? 'is-back' : ''}`}>
      {panes(
        (v) => (
          <>
            <h3 className="st-block-title">{v.title}</h3>
            <p className="st-text">{v.text}</p>
          </>
        ),
        { id, className: 'st-anchor', tabIndex: -1 }
      )}

      <div className="ar-stage">
        <figure className="af" aria-label={views[view].alt}>
          <svg
            ref={svgRef}
            className="af-map"
            viewBox={`0 ${box.top} ${box.width} ${box.height}`}
            aria-hidden="true"
          >
            {/* lines under boxes under words, whichever side is showing */}
            {views.map((v, vi) =>
              v.arch.edges.map((e, i) => (
                <g key={e.d} data-edge={`${vi}:${i}`} visibility="hidden">
                  <path d={e.d} className="af-edge" />
                  <path d="M-5.5,-4 L0,0 L-5.5,4" className="af-head" />
                  {e.label && (
                    <text
                      x={e.lx}
                      y={e.ly}
                      textAnchor={e.anchor ?? 'middle'}
                      className="af-edge-label"
                    >
                      {e.label}
                    </text>
                  )}
                </g>
              ))
            )}
            {views.map((v, vi) =>
              v.arch.nodes.map((n, i) => (
                <g key={n.id} data-box={`${vi}:${i}`} visibility="hidden">
                  <rect rx="10" className="af-box" />
                  <rect rx="10" className="af-box is-dashed" />
                </g>
              ))
            )}
            {views.map((v, vi) =>
              v.arch.nodes.map((n, i) => (
                <g key={n.id} data-label={`${vi}:${i}`} visibility="hidden" textAnchor="middle">
                  <text className="af-title">{n.title}</text>
                  {n.sub && <text className="af-sub">{n.sub}</text>}
                </g>
              ))
            )}
          </svg>

          {panes((v) => <p className="af-legend">{v.legend}</p>)}
          {panes((v) => (
            <ol className="af-steps">
              {v.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          ))}
        </figure>

        {/* The label names where it goes, the same reasoning as the project
            arrows: a bare arrow says there's more, but never what. */}
        <button
          type="button"
          className="ar-go"
          onClick={() => show(1 - view)}
          onKeyDown={onKeyDown}
          aria-label={`Show the ${other.label.toLowerCase()} architecture`}
        >
          <span className="ar-go-ring" aria-hidden="true">
            <svg viewBox="0 0 16 16">
              <path
                d="M2.5 8h11M9 3.5 13.5 8 9 12.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="ar-go-label" key={other.id} aria-hidden="true">
            {other.label}
          </span>
        </button>
      </div>

      {/* says what changed for anyone not watching it change. Empty until the
          first press, so it stays quiet as the page loads. */}
      <p className="ar-status" role="status">
        {switched && `Showing the ${views[view].label.toLowerCase()} architecture`}
      </p>
    </div>
  );
}
