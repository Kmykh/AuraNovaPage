import React from 'react';

/** Colores de la marca: rosa acuarela, rubor, dorado y crema. */
const COLORS = ['#e9a4b4', '#f4c7cf', '#e8c98a', '#d38b8b', '#f7dde2'];

/** Siempre las mismas posiciones (sin azar en cada carga: igual en servidor y navegador). */
const PETALS = Array.from({ length: 14 }, (_, i) => ({
  left: (i * 37 + 11) % 100,
  size: 10 + ((i * 7) % 12),
  duration: 11 + ((i * 5) % 9),
  delay: -((i * 13) % 17),
  drift: ((i % 2 ? 1 : -1) * (30 + ((i * 11) % 50))),
  color: COLORS[i % COLORS.length],
  opacity: 0.55 + ((i * 3) % 4) / 10,
  shape: i % 3,
}));

/** Pétalo dibujado en SVG (tres formas para que no se vean iguales). */
function Petal({ shape, color }: { shape: number; color: string }) {
  const paths = [
    'M12 2C17 7 18 15 12 22C6 15 7 7 12 2Z',
    'M4 18C4 9 11 3 20 4C21 13 14 20 4 18Z',
    'M12 3C18 5 21 12 15 20C11 22 6 19 5 14C4 9 7 4 12 3Z',
  ];
  return (
    <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden>
      <defs>
        <radialGradient id={`petal-${shape}-${color.slice(1)}`} cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
          <stop offset="60%" stopColor={color} />
          <stop offset="100%" stopColor={color} stopOpacity="0.8" />
        </radialGradient>
      </defs>
      <path d={paths[shape]} fill={`url(#petal-${shape}-${color.slice(1)})`} />
      <path d={paths[shape]} fill="none" stroke={color} strokeOpacity="0.5" strokeWidth="0.6" />
    </svg>
  );
}

/** Pétalos que caen meciéndose detrás del contenido. Decorativo: se oculta a lectores y no recibe clics. */
export function FallingPetals({ className = '' }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      {PETALS.map((p, i) => (
        <span
          key={i}
          className="absolute top-0 block will-change-transform"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            animation: `petal-fall ${p.duration}s linear ${p.delay}s infinite`,
            ['--petal-drift' as string]: `${p.drift}px`,
            ['--petal-opacity' as string]: p.opacity,
          }}
        >
          <Petal shape={p.shape} color={p.color} />
        </span>
      ))}
    </div>
  );
}
