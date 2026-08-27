import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, ArrowRight } from 'lucide-react';

import estatuo from '../images/estatuo.png';
import flo4 from '../images/flo4.png';
import flo1 from '../images/flo1.png';

export function TrackingPromoSection() {
  return (
    <section className="py-12 md:py-16 lg:py-20 relative overflow-hidden">

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Visual Composition Left Side */}
          <div className="relative h-[400px] md:h-[500px] w-full flex items-center justify-center">
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-gold/10 via-rose/5 to-transparent rounded-full blur-3xl scale-90 animate-pulse" />

            {/* The Classical Statue */}
            <div className="relative w-[280px] md:w-[400px] h-[350px] md:h-[480px] flex items-center justify-center mix-blend-multiply vignette-mask z-20">
              <Image src={estatuo} alt="Estatua clásica elegante" fill className="object-contain drop-shadow-2xl animate-float-gentle" />
            </div>

            {/* Subtle supporting flowers */}
            <div className="absolute top-10 right-0 w-[120px] md:w-[160px] opacity-30 animate-float drop-shadow-xl z-10 mix-blend-multiply rotate-45">
              <Image src={flo1} alt="" width={160} height={160} className="object-contain" />
            </div>

            <div className="absolute bottom-10 left-0 w-[140px] md:w-[180px] animate-float-delayed drop-shadow-lg z-30 opacity-40 mix-blend-multiply">
              <Image src={flo4} alt="" width={180} height={180} className="object-contain -rotate-12" />
            </div>
          </div>

          {/* Text Content Right Side */}
          <div className="flex flex-col justify-center items-center md:items-start text-center md:text-left">

            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-brown leading-tight">
              ¿Ya realizaste <br /><span className="italic font-light text-gold">tu pedido?</span>
            </h2>

            <div className="w-16 h-[2px] bg-gradient-to-r from-gold/50 to-transparent mb-8" />

            <p className="text-sage text-lg lg:text-xl mb-10 leading-relaxed font-serif italic max-w-lg">
              Consulta el estado de tu pedido en cualquier momento y asegúrate de que esa sorpresa especial llegue a tiempo.
            </p>

            <Link href="/seguimiento" tabIndex={-1} className="group relative inline-flex items-center justify-center px-8 py-3.5 font-serif text-lg italic text-brown transition-all duration-300 ease-in-out bg-white rounded-full border border-gold/30 hover:border-gold hover:bg-gold/5 shadow-[0_4px_20px_-5px_rgba(200,169,107,0.3)] hover:shadow-[0_8px_25px_-5px_rgba(200,169,107,0.4)]">
              <span className="relative flex items-center gap-3">
                Consultar mi pedido
                <ArrowRight size={18} className="transition-transform duration-300 ease-out group-hover:translate-x-1.5 text-gold" />
              </span>
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
