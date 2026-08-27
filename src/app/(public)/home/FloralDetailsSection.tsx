import React from 'react';
import Image from 'next/image';
import { Leaf } from 'lucide-react';

import flo2 from '../images/flo2.png';
import flo4 from '../images/flo4.png';

export function FloralDetailsSection() {
  return (
    <section className="py-16 md:py-20 lg:py-24 relative">
      {/* Decorative floral elements */}
      <div className="absolute top-0 right-0 opacity-40 pointer-events-none translate-x-1/4 -translate-y-1/4 animate-spin-slow mix-blend-multiply">
        <Image src={flo4} alt="" width={400} height={400} />
      </div>
      
      <div className="absolute bottom-0 left-0 opacity-30 pointer-events-none -translate-x-1/4 translate-y-1/4 animate-float-gentle-reverse mix-blend-multiply">
        <Image src={flo2} alt="" width={300} height={300} />
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-brown mb-10 leading-tight">
          Cada detalle florece con una intención.
        </h2>
        <div className="w-24 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent mx-auto mb-10" />
        <p className="text-sage text-lg md:text-xl lg:text-2xl leading-relaxed max-w-3xl mx-auto italic font-serif opacity-90">
          &quot;Pequeños detalles, flores y elementos pensados para acompañar momentos que merecen ser recordados.&quot;
        </p>
      </div>
    </section>
  );
}
