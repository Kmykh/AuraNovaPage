"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

import angeles from '../images/angeles.png';
import flo5 from '../images/flo5.png';
import flortallo from '../images/flortallo.png';

export function PersonalizedGiftsSection() {
  return (
    <section className="relative w-full z-10 py-14 md:py-20 px-6 overflow-hidden">

      {/* Decorative floating elements */}
      <div className="absolute top-0 right-0 w-32 md:w-48 opacity-[0.07] -rotate-6 pointer-events-none mix-blend-multiply">
        <Image src={angeles} alt="" width={200} height={200} />
      </div>
      <div className="absolute bottom-0 left-0 w-28 md:w-40 opacity-[0.10] rotate-12 pointer-events-none mix-blend-multiply animate-float-gentle">
        <Image src={flo5} alt="" width={160} height={160} />
      </div>
      <div className="absolute top-1/2 right-[8%] w-16 md:w-24 opacity-[0.06] pointer-events-none mix-blend-multiply -translate-y-1/2">
        <Image src={flortallo} alt="" width={100} height={100} />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">

        {/* Tagline */}
        <p className="font-sans text-xs md:text-sm tracking-[0.4em] uppercase text-[#c8a96b] font-bold mb-4 flex justify-center items-center gap-3">
          <span className="w-8 h-[1px] bg-[#c8a96b]/50" />
          Tu guía, nuestras manos
          <span className="w-8 h-[1px] bg-[#c8a96b]/50" />
        </p>

        {/* Headline */}
        <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl text-center text-[#4a3933] mb-4 font-light tracking-tight leading-[1.15]">
          Lo viste en{' '}
          <span className="font-serif italic text-[#c8a96b] font-normal tracking-wide">Pinterest</span>,{' '}
          <span className="font-serif italic text-[#c8a96b] font-normal tracking-wide">TikTok</span>{' '}
          o{' '}
          <span className="font-serif italic text-[#c8a96b] font-normal tracking-wide">Instagram</span>
        </h2>

        {/* Subtitle */}
        <p className="font-sans text-sm md:text-base text-[#887870] leading-relaxed max-w-xl mx-auto text-center mb-10 font-medium">
          Mándanos la foto o cuéntanos tu idea y nuestro equipo lo hará realidad. Cada regalo es único, como quien lo recibe.
        </p>

        {/* 3 steps — horizontal row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-10">
          <div className="flex items-start gap-4">
            <span className="w-9 h-9 rounded-full border border-[#c8a96b]/30 text-[#c8a96b] font-serif text-base italic flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
            <div>
              <h3 className="font-serif text-base md:text-lg text-[#4a3933] font-semibold mb-0.5">Comparte tu inspiración</h3>
              <p className="text-[#887870] text-xs md:text-sm leading-relaxed">Una captura, un pin o un reel — cualquier idea sirve.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <span className="w-9 h-9 rounded-full border border-[#c8a96b]/30 text-[#c8a96b] font-serif text-base italic flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
            <div>
              <h3 className="font-serif text-base md:text-lg text-[#4a3933] font-semibold mb-0.5">Nosotros lo diseñamos</h3>
              <p className="text-[#887870] text-xs md:text-sm leading-relaxed">Te cotizamos sin compromiso con los mejores materiales.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <span className="w-9 h-9 rounded-full border border-[#c8a96b]/30 text-[#c8a96b] font-serif text-base italic flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
            <div>
              <h3 className="font-serif text-base md:text-lg text-[#4a3933] font-semibold mb-0.5">Sorprendes a quien quieres</h3>
              <p className="text-[#887870] text-xs md:text-sm leading-relaxed">Un regalo que nadie más tendrá, hecho solo para ti.</p>
            </div>
          </div>
        </div>

        {/* CTA — typographic link */}
        <div className="flex justify-center">
          <Link href="/personalizado" className="group inline-flex items-center gap-4 px-8 py-3 rounded-full cursor-pointer hover:bg-[#c8a96b]/10 hover:scale-105 hover:shadow-lg hover:shadow-[#c8a96b]/10 transition-all duration-300">
            <div className="w-10 md:w-16 h-[1px] bg-gradient-to-r from-transparent to-[#c8a96b]/60 group-hover:w-20 md:group-hover:w-28 group-hover:to-[#c8a96b] transition-all duration-500" />
            <span className="font-serif text-lg md:text-xl italic text-[#c8a96b] group-hover:text-[#4a3933] transition-colors duration-300">
              Quiero mi regalo personalizado
            </span>
            <svg className="w-4 h-4 text-[#c8a96b] group-hover:text-[#4a3933] group-hover:translate-x-2 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <div className="w-10 md:w-16 h-[1px] bg-gradient-to-l from-transparent to-[#c8a96b]/60 group-hover:w-20 md:group-hover:w-28 group-hover:to-[#c8a96b] transition-all duration-500" />
          </Link>
        </div>

        {/* Bottom ornament */}
        <div className="flex justify-center items-center gap-4 mt-8">
          <div className="w-12 md:w-24 h-[1px] bg-gradient-to-r from-transparent via-[#c8a96b]/40 to-transparent" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#c8a96b]/30" />
          <div className="w-12 md:w-24 h-[1px] bg-gradient-to-r from-transparent via-[#c8a96b]/40 to-transparent" />
        </div>

      </div>
    </section>
  );
}
