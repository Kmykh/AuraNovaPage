"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronDown, PackageSearch } from 'lucide-react';
import { FallingPetals } from '@/components/motion/FallingPetals';
import { FlowerGlyph } from '@/components/motion/BotanicalSprig';

import flo from '../images/flo.png';
import flo1 from '../images/flo1.png';
import flo2 from '../images/flo2.png';
import flowera from '../images/flowera.png';

/** Para quién es el detalle: la última palabra va cambiando. */
const RECIPIENTS = ['mamá', 'tu amor', 'tu mejor amiga', 'papá', 'alguien especial'];
const TITLE = 'Aura Nova';

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [recipient, setRecipient] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setRecipient(i => (i + 1) % RECIPIENTS.length), 2600);
    return () => clearInterval(timer);
  }, []);

  // Las flores grandes siguen un poco al mouse (sin volver a pintar React)
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const node = sectionRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    node.style.setProperty('--mx', `${((e.clientX - rect.left) / rect.width - 0.5).toFixed(3)}`);
    node.style.setProperty('--my', `${((e.clientY - rect.top) / rect.height - 0.5).toFixed(3)}`);
  };

  const scrollDown = () => {
    window.scrollBy({ top: window.innerHeight * 0.85, behavior: 'smooth' });
  };

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative flex min-h-[calc(100vh-4rem)] w-full flex-col items-center justify-center overflow-hidden bg-[#faf7f2] pb-20 pt-28 [--mx:0] [--my:0]"
    >
      {/* Halo de color detrás del título */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[38rem] w-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(233,164,180,0.22),rgba(232,201,138,0.12)_45%,transparent_70%)] blur-2xl" />

      <FallingPetals className="z-10" />

      {/* Flores grandes con un leve movimiento al mover el mouse */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Tres capas: aparecer, seguir al mouse y flotar (cada una con su propio transform) */}
        <div className="absolute -left-14 top-[3%] z-10 w-[170px] opacity-0 mix-blend-multiply animate-[fade-in-up_1.2s_ease-out_0.2s_forwards] md:-left-20 md:top-[8%] md:w-[480px] lg:w-[580px]">
          <div className="transition-transform duration-700 ease-out" style={{ transform: 'translate3d(calc(var(--mx) * -36px), calc(var(--my) * -26px), 0)' }}>
            <Image priority src={flo1} alt="" width={580} height={580} className="animate-float-gentle object-contain" style={{ width: 'auto', height: 'auto' }} />
          </div>
        </div>
        <div className="absolute -right-12 bottom-[9%] z-10 w-[160px] opacity-0 mix-blend-multiply animate-[fade-in-up_1.2s_ease-out_0.4s_forwards] md:-right-20 md:bottom-auto md:top-[18%] md:w-[430px] lg:w-[530px]">
          <div className="transition-transform duration-700 ease-out" style={{ transform: 'translate3d(calc(var(--mx) * 30px), calc(var(--my) * 22px), 0)' }}>
            <Image priority src={flowera} alt="" width={530} height={530} className="animate-float-gentle-reverse object-contain" style={{ width: 'auto', height: 'auto' }} />
          </div>
        </div>
        <div className="absolute bottom-24 left-[22%] w-14 animate-butterfly opacity-70 mix-blend-multiply">
          <Image src={flo} alt="" width={56} height={56} style={{ width: 'auto', height: 'auto' }} />
        </div>
        <div className="absolute right-[26%] top-28 w-12 animate-float opacity-60 mix-blend-multiply">
          <Image src={flo2} alt="" width={48} height={48} style={{ width: 'auto', height: 'auto' }} />
        </div>
      </div>

      <div className="relative z-20 mx-auto flex max-w-5xl flex-col items-center px-4 text-center sm:px-6">
        <p className="mb-5 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.35em] text-[#c06b7d] opacity-0 animate-[fade-in-up_0.9s_ease-out_0.6s_forwards] md:text-xs">
          <span className="h-px w-8 bg-[#c06b7d]/40" /> Detalles que hablan de ti <span className="h-px w-8 bg-[#c06b7d]/40" />
        </p>

        {/* Título letra por letra */}
        <h1 aria-label={TITLE} className="relative mb-2 font-serif text-[4.2rem] font-bold leading-none tracking-tighter text-[#4a3933] sm:text-[6rem] md:text-[8rem] lg:text-[10rem]">
          {TITLE.split('').map((char, i) => (
            <span
              key={i}
              aria-hidden
              className="inline-block opacity-0"
              style={{ animation: `fade-in-up 0.9s cubic-bezier(0.16,1,0.3,1) ${0.8 + i * 0.06}s forwards` }}
            >
              {char === ' ' ? ' ' : char}
            </span>
          ))}
        </h1>

        <div className="my-5 h-[2px] w-24 bg-gradient-to-r from-transparent via-[#c8a96b] to-transparent opacity-0 animate-[fade-in-up_0.8s_ease-out_1.5s_forwards]" />

        {/* Para quién: la palabra cambia */}
        <h2 className="mb-5 font-serif text-2xl font-semibold italic text-[#728f66] opacity-0 animate-[fade-in-up_0.9s_ease-out_1.6s_forwards] sm:text-3xl lg:text-4xl">
          Detalles hechos a mano para{' '}
          <span className="relative inline-block min-w-[6ch] text-left text-[#c06b7d] [perspective:600px]">
            <span key={recipient} className="inline-block animate-word-in">{RECIPIENTS[recipient]}</span>
            <span className="absolute -bottom-1 left-0 h-[2px] w-full bg-gradient-to-r from-[#e9a4b4] to-transparent" />
          </span>
        </h2>

        <p className="mb-10 max-w-xl text-base font-light leading-relaxed text-[#887870] opacity-0 animate-[fade-in-up_0.9s_ease-out_1.8s_forwards] sm:text-lg">
          Flores eternas y regalos pensados para celebrar, sorprender y hacer sentir especial a quien más quieres.
        </p>

        <div className="flex w-full flex-col gap-3 opacity-0 animate-[fade-in-up_0.9s_ease-out_2s_forwards] sm:w-auto sm:flex-row">
          <Link
            href="/productos"
            className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-[#4a3933] px-8 py-3.5 font-serif text-lg text-white shadow-lg shadow-[#4a3933]/25 transition hover:-translate-y-0.5"
          >
            {/* Brillo que cruza el botón */}
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <span className="relative flex items-center gap-2">
              Explorar catálogo <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
          <Link
            href="/seguimiento"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#4a3933]/25 bg-white/50 px-8 py-3.5 font-serif text-lg text-[#4a3933] backdrop-blur transition hover:border-[#c8a96b] hover:bg-white"
          >
            <PackageSearch size={18} /> Ver mi pedido
          </Link>
        </div>

        <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-semibold text-[#887870] opacity-0 animate-[fade-in-up_0.9s_ease-out_2.2s_forwards]">
          {['Hecho a mano en Huancayo', 'Envíos a todo el Perú', 'Paga con Yape o tarjeta'].map((item, i) => (
            <li key={item} className="flex items-center gap-4">
              {i > 0 && <FlowerGlyph className="h-3.5 w-3.5" color="#e9a4b4" />}
              {item}
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={scrollDown}
        className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-1 text-[10px] font-bold uppercase tracking-[0.3em] text-[#b08a4e] opacity-0 animate-[fade-in-up_0.9s_ease-out_2.6s_forwards]"
        aria-label="Ver más"
      >
        Descubre
        <ChevronDown className="h-5 w-5 animate-bounce" />
      </button>
    </section>
  );
}
