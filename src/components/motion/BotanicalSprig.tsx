import React from 'react';

/** Rama botánica en línea dorada (ilustración propia en SVG) para adornar títulos y tarjetas. */
export function BotanicalSprig({ className = '', color = '#c8a96b' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 160 60" fill="none" className={className} aria-hidden>
      <path d="M6 44C40 40 70 30 100 22C120 16 140 14 154 16" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      {[
        [30, 39, -30], [52, 33, -25], [74, 27, -20], [96, 22, -15], [118, 18, -10],
      ].map(([x, y, r], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
          <path d="M0 0C4 -9 13 -12 18 -10C14 -4 7 0 0 0Z" fill={color} fillOpacity="0.18" stroke={color} strokeWidth="1" />
          <path d="M0 0C3 7 11 11 16 9C13 3 6 0 0 0Z" fill={color} fillOpacity="0.12" stroke={color} strokeWidth="1" />
        </g>
      ))}
      <g transform="translate(150 16)">
        {[0, 72, 144, 216, 288].map(a => (
          <ellipse key={a} cx="0" cy="-5" rx="2.6" ry="5" transform={`rotate(${a})`} fill="#e9a4b4" fillOpacity="0.55" stroke="#d38b8b" strokeWidth="0.6" />
        ))}
        <circle r="2" fill={color} />
      </g>
    </svg>
  );
}

/** Flor pequeña de cinco pétalos: separador de la cinta y viñetas. */
export function FlowerGlyph({ className = '', color = '#c8a96b' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      {[0, 72, 144, 216, 288].map(a => (
        <ellipse key={a} cx="12" cy="7" rx="3.2" ry="5" transform={`rotate(${a} 12 12)`} fill={color} fillOpacity="0.85" />
      ))}
      <circle cx="12" cy="12" r="2.4" fill="#fff8ec" />
    </svg>
  );
}
