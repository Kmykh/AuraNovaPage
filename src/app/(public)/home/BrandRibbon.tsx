import React from 'react';
import { FlowerGlyph } from '@/components/motion/BotanicalSprig';

const TOP = ['Flores eternas', 'Hecho a mano', 'Diseños a tu gusto', 'Tarjeta con dedicatoria', 'Luces y accesorios', 'Ramos artesanales'];
const BOTTOM = ['Delivery en Huancayo', 'Envíos a todo el Perú', 'Paga con Yape o tarjeta', 'Sigue tu pedido en línea', '50% de adelanto'];

function Row({ items, reverse, dark }: { items: string[]; reverse?: boolean; dark?: boolean }) {
  // La lista va dos veces: al llegar a la mitad vuelve al inicio sin que se note el corte
  const loop = [...items, ...items];
  return (
    <div className={`flex w-max ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'} motion-reduce:animate-none`}>
      {loop.map((item, i) => (
        <span key={i} className="flex items-center gap-6 px-6">
          <span className={`whitespace-nowrap font-serif text-2xl italic md:text-3xl ${dark ? 'text-[#fdf8ee]' : 'text-[#4a3933]'}`}>{item}</span>
          <FlowerGlyph className="h-5 w-5 shrink-0" color={dark ? '#e8c98a' : '#e9a4b4'} />
        </span>
      ))}
    </div>
  );
}

/** Dos cintas que se cruzan, con lo que hace especial a Aura Nova. */
export function BrandRibbon() {
  return (
    <section aria-label="Lo que ofrecemos" className="relative z-10 overflow-hidden py-12 md:py-16">
      <div className="-rotate-2 scale-105 bg-[#4a3933] py-4 shadow-[0_20px_40px_-24px_rgba(74,57,51,0.6)]">
        <Row items={TOP} dark />
      </div>
      <div className="-mt-3 rotate-1 scale-105 border-y border-[#e8c98a]/40 bg-[#fdf8ee]/95 py-3.5">
        <Row items={BOTTOM} reverse />
      </div>
    </section>
  );
}
