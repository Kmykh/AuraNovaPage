"use client";

import React from 'react';
import Image from 'next/image';
import { CalendarHeart, MessageCircle } from 'lucide-react';
import { useBusinessSettings } from '@/hooks/use-info';
import { Reveal } from '@/components/motion/Reveal';
import { BotanicalSprig } from '@/components/motion/BotanicalSprig';

import flo4 from '../images/flo4.png';
import flo2 from '../images/flo2.png';

const QUOTE = 'Cada detalle florece con una intención.';

/** Frase de la marca palabra por palabra y el aviso de que todo se hace por pedido. */
export function PromiseSection() {
  const { data: settings } = useBusinessSettings();
  const whatsapp = (settings?.whatsappNumber || '51950482596').replace(/\D/g, '');

  return (
    <section className="relative z-10 overflow-hidden px-4 py-20 md:py-28">
      <div className="pointer-events-none absolute -right-24 -top-16 w-[340px] animate-spin-slow opacity-40 mix-blend-multiply md:w-[460px]">
        <Image src={flo4} alt="" width={460} height={460} style={{ width: 'auto', height: 'auto' }} />
      </div>
      <div className="pointer-events-none absolute -bottom-20 -left-16 w-[240px] animate-float-gentle-reverse opacity-30 mix-blend-multiply md:w-[320px]">
        <Image src={flo2} alt="" width={320} height={320} style={{ width: 'auto', height: 'auto' }} />
      </div>

      <div className="relative mx-auto max-w-4xl text-center">
        <h2 aria-label={QUOTE} className="font-serif text-4xl font-semibold leading-tight text-[#4a3933] sm:text-5xl lg:text-6xl">
          {QUOTE.split(' ').map((word, i) => (
            <Reveal as="span" key={i} delay={i * 90} className="mr-[0.25em] inline-block">
              <span aria-hidden className={word.startsWith('intención') ? 'italic text-[#c06b7d]' : ''}>{word}</span>
            </Reveal>
          ))}
        </h2>
        <Reveal delay={700}>
          <BotanicalSprig className="mx-auto mt-6 h-10 w-48" />
          <p className="mx-auto mt-6 max-w-2xl font-serif text-xl italic leading-relaxed text-[#887870] md:text-2xl">
            Pequeños detalles, flores y elementos pensados para acompañar momentos que merecen ser recordados.
          </p>
        </Reveal>

        <Reveal delay={900} variant="scale" className="mx-auto mt-12 max-w-2xl">
          <div className="flex flex-col items-center gap-4 rounded-[2rem] border border-[#e8c98a]/50 bg-white/80 p-6 text-left shadow-[0_24px_50px_-34px_rgba(74,57,51,0.5)] backdrop-blur sm:flex-row sm:p-7">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#fdf3f4] text-[#c06b7d]">
              <CalendarHeart className="h-7 w-7" strokeWidth={1.6} />
            </span>
            <div className="flex-1 text-center sm:text-left">
              <p className="font-serif text-xl font-bold text-[#4a3933]">Lo hacemos por pedido</p>
              <p className="mt-1 text-sm leading-relaxed text-[#887870]">
                Cada diseño se prepara con anticipación y el tiempo depende de lo que elijas. Si es para una fecha especial, pídelo con tiempo o consúltanos.
              </p>
            </div>
            <a
              href={`https://wa.me/${whatsapp}?text=${encodeURIComponent('Hola Aura Nova, ¿cuánto tiempo toma preparar un pedido? Lo necesito para el ')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#4a3933] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#3a2d28]"
            >
              <MessageCircle className="h-4 w-4" /> Consultar tiempos
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
