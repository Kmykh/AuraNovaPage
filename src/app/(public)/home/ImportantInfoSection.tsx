import React from 'react';
import Image from 'next/image';
import { Sparkles, Clock, Calendar, Heart } from 'lucide-react';

import flo5 from '../images/flo5.png';
import flo6 from '../images/flo6.png';

export function ImportantInfoSection() {
  return (
    <section className="py-12 md:py-16 lg:py-20 relative overflow-hidden">

      {/* Decorative flowers */}
      <div className="absolute -top-10 -left-10 w-[250px] md:w-[350px] opacity-30 pointer-events-none animate-float-gentle mix-blend-multiply">
        <Image src={flo5} alt="" width={350} height={350} />
      </div>
      <div className="absolute -bottom-10 -right-10 w-[200px] md:w-[300px] opacity-40 pointer-events-none animate-float-delayed mix-blend-multiply">
        <Image src={flo6} alt="" width={300} height={300} />
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center">

        <div className="w-full py-10 md:py-16 text-center relative z-10 flex flex-col items-center">
          <h2 className="font-serif text-4xl md:text-6xl font-bold text-brown mb-8 leading-tight tracking-tight">
            Información <span className="italic font-light text-sage">Importante</span>
          </h2>

          <p className="text-xl md:text-2xl text-brown/80 mb-8 leading-relaxed max-w-2xl mx-auto font-serif italic">
            Nuestros productos se realizan por pedido y con anticipación. El tiempo de preparación puede variar según el diseño elegido.
          </p>

          <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent mx-auto my-8 opacity-60" />

          <p className="text-sm md:text-base font-medium text-sage/80 uppercase tracking-[0.2em]">
            Recomendamos consultar previamente el tiempo de preparación.
          </p>
        </div>
      </div>
    </section>
  );
}
