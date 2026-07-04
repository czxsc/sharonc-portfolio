/* Small hand-drawn line icons. Inherit color via currentColor; keep sparse. */

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export function Coffee({ size = 24, ...p }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...p}>
      <g {...base}>
        <path d="M4 9h12v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" />
        <path d="M16 10h2.5a2.5 2.5 0 0 1 0 5H16" />
        <path d="M7 3c0 1.4 1.2 1.4 1.2 2.8M11 3c0 1.4 1.2 1.4 1.2 2.8" />
      </g>
    </svg>
  );
}

export function Cat({ size = 24, ...p }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...p}>
      <g {...base}>
        <path d="M5 10 4 5l3.4 2.4a7.5 7.5 0 0 1 9.2 0L20 5l-1 5v4a5 5 0 0 1-5 5h-4a5 5 0 0 1-5-5z" />
        <path d="M9.5 12h.01M14.5 12h.01" />
        <path d="M12 14.5v1M9.5 16h5" />
        <path d="M4 14H1.5M4 15.5 1.8 16.6M20 14h2.5M20 15.5l2.2 1.1" />
      </g>
    </svg>
  );
}

export function Piano({ size = 24, ...p }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...p}>
      <g {...base}>
        <rect x="3" y="6" width="18" height="12" rx="1.5" />
        <path d="M7 6v7M11 6v7M15 6v7M9 6v4.5M13 6v4.5M17 6v4.5" />
      </g>
    </svg>
  );
}

export function Camera({ size = 24, ...p }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...p}>
      <g {...base}>
        <path d="M3 8h3l1.5-2h9L18 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
        <circle cx="12" cy="13" r="3.4" />
      </g>
    </svg>
  );
}

export function Plane({ size = 24, ...p }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...p}>
      <g {...base}>
        <path d="M21 4 3 11.5l6 2.2M21 4l-4 15-4.5-6.3M21 4 9 13.7v5l3.5-4.7" />
      </g>
    </svg>
  );
}

export function Pencil({ size = 24, ...p }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...p}>
      <g {...base}>
        <path d="M15 4.5 19.5 9 8 20.5l-5 1 1-5z" />
        <path d="M13 6.5 17.5 11" />
      </g>
    </svg>
  );
}

export function Sparkle({ size = 24, ...p }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...p}>
      <g {...base}>
        <path d="M12 3c.4 4.6 1.4 5.6 6 6-4.6.4-5.6 1.4-6 6-.4-4.6-1.4-5.6-6-6 4.6-.4 5.6-1.4 6-6z" />
      </g>
    </svg>
  );
}

export function ArrowDown({ size = 24, ...p }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...p}>
      <g {...base}>
        <path d="M12 4v15M6 13.5l6 6 6-6" />
      </g>
    </svg>
  );
}

export function ArrowRight({ size = 20, ...p }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...p}>
      <g {...base}>
        <path d="M4 12h15M13 6l6 6-6 6" />
      </g>
    </svg>
  );
}

