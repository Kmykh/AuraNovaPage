import React from 'react';
import Image from 'next/image';
import { HandHeart, MapPin, Sparkles } from 'lucide-react';
import { Reveal } from '@/components/motion/Reveal';
import { BotanicalSprig, FlowerGlyph } from '@/components/motion/BotanicalSprig';

import flo1 from '../images/flo1.png';
import flo5 from '../images/flo5.png';
import estatuo from '../images/estatuo.png';

const PILLARS = [
  { icon: HandHeart, title: 'Armado a mano', text: 'Cada pétalo y cada lazo se coloca a mano, uno por uno.' },
  { icon: Sparkles, title: 'A tu manera', text: 'Elige colores, flores, accesorios y tu dedicatoria.' },
  { icon: MapPin, title: 'Desde Huancayo', text: 'Con el espíritu de nuestra tierra, a todo el Perú.' },
];

/** Origen de la marca: arco con la escultura y flores, y el texto con sus tres pilares. */
export function WankaSection() {
  return (
    <section className="relative z-10 overflow-hidden px-4 py-16 md:py-24">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Arco con imágenes */}
        <Reveal variant="left" className="relative mx-auto w-full max-w-sm lg:max-w-md">
          <div className="relative aspect-[4/5] overflow-hidden rounded-t-full border border-[#e8c98a]/50 bg-gradient-to-b from-[#fdf3ea] via-[#f8e9e3] to-[#f3e6d4] shadow-[0_40px_70px_-40px_rgba(74,57,51,0.55)]">
            {/* Marco interior dorado */}
            <div className="absolute inset-3 rounded-t-full border border-[#c8a96b]/40" />
            <div className="absolute inset-x-0 bottom-0 flex justify-center">
              <Image src={estatuo} alt="" width={420} height={520} className="w-[78%] object-contain mix-blend-multiply" style={{ height: 'auto' }} />
            </div>
            <div className="absolute -left-10 top-[12%] w-44 animate-float-gentle mix-blend-multiply">
              <Image src={flo1} alt="" width={180} height={180} style={{ width: 'auto', height: 'auto' }} />
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-36 animate-float-gentle-reverse mix-blend-multiply md:w-44">
            <Image src={flo5} alt="" width={180} height={180} style={{ width: 'auto', height: 'auto' }} />
          </div>
          {/* Sello */}
          <div className="absolute -left-3 bottom-10 flex h-24 w-24 animate-spin-slow items-center justify-center rounded-full bg-[#4a3933] text-[#e8c98a] shadow-xl md:-left-6">
            <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
              <defs><path id="sello" d="M50 50 m-36 0 a36 36 0 1 1 72 0 a36 36 0 1 1 -72 0" /></defs>
              <text fontSize="9" letterSpacing="1.6" fill="currentColor" fontWeight="700">
                <textPath href="#sello">HECHO EN HUANCAYO · AURA NOVA ·</textPath>
              </text>
            </svg>
            <FlowerGlyph className="h-7 w-7" color="#e8c98a" />
          </div>
        </Reveal>

        {/* Texto */}
        <div className="text-center lg:text-left">
          <Reveal>
            <p className="flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-[0.4em] text-[#c8a96b] lg:justify-start">
              <span className="h-px w-8 bg-[#c8a96b]/50" /> Orgullo local
            </p>
            <h2 className="mt-4 font-serif text-5xl font-light tracking-tight text-[#4a3933] md:text-6xl">
              Somos marca <span className="font-normal italic text-[#c8a96b]">Wanka</span>
            </h2>
            <BotanicalSprig className="mx-auto mt-3 h-8 w-40 lg:mx-0" />
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[#887870] md:text-lg lg:mx-0">
              Aura Nova nace en el corazón de los Andes. Transformamos tus emociones en detalles hechos a mano,
              con el arte, la dedicación y el espíritu vibrante de nuestra tierra.
            </p>
          </Reveal>

          <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {PILLARS.map((pillar, i) => (
              <Reveal as="li" key={pillar.title} delay={150 + i * 120} className="rounded-[1.5rem] border border-[#ece3da] bg-white/70 p-4 text-left backdrop-blur transition hover:-translate-y-1 hover:border-[#c8a96b]/50 hover:shadow-lg">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fdf8ee] text-[#b08a4e]"><pillar.icon size={18} /></span>
                <p className="mt-3 font-serif text-lg font-bold text-[#4a3933]">{pillar.title}</p>
                <p className="mt-1 text-sm text-[#887870]">{pillar.text}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
