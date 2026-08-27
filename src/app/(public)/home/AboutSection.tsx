"use client";

import React from 'react';
import Image from 'next/image';
import { HeartHandshake, Gift, Flower2 } from 'lucide-react';

import flo2 from '../images/flo2.png';

export function AboutSection() {
  return (
    <section id="conoce-aura-nova" className="py-12 md:py-16 lg:py-20 relative">

      {/* Decorative semi-transparent flower */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/4 w-[250px] md:w-[400px] opacity-40 pointer-events-none animate-spin-slow mix-blend-multiply">
        <Image src={flo2} alt="" width={400} height={400} />
      </div>

      <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          {/* Left — Text Content */}
          <div>
            <span className="uppercase tracking-[0.3em] text-[11px] font-semibold text-gold mb-4 block">Nuestra esencia</span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-brown mb-8 leading-tight">
              Más que un regalo, un momento especial.
            </h2>
            <p className="text-sage text-lg leading-relaxed mb-12">
              En Aura Nova creamos detalles pensados para convertir momentos especiales en recuerdos.
              Cada propuesta está preparada con cuidado para ayudarte a expresar aquello que a veces
              las palabras no alcanzan a decir.
            </p>

            <div className="space-y-6 md:space-y-8 pl-2 md:pl-4 border-l border-gold/20">
              <div>
                <h3 className="font-serif text-lg font-medium text-brown mb-1">Hecho con cariño</h3>
                <p className="text-sage text-sm leading-relaxed">Cada componente es preparado con atención a los detalles.</p>
              </div>

              <div>
                <h3 className="font-serif text-lg font-medium text-brown mb-1">Diseñado para sorprender</h3>
                <p className="text-sage text-sm leading-relaxed">Presentaciones delicadas que deslumbran desde el primer instante.</p>
              </div>

              <div>
                <h3 className="font-serif text-lg font-medium text-brown mb-1">Pensado para cada ocasión</h3>
                <p className="text-sage text-sm leading-relaxed">Arreglos y cajas ideales para cumpleaños, aniversarios o porque sí.</p>
              </div>
            </div>
          </div>

          {/* Right — Visual composition */}
          <div className="relative flex items-center justify-center">
            <div className="relative w-full max-w-md">
              {/* Background glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-rose/10 to-sage/10 rounded-full blur-3xl scale-110" />

              {/* Main flower image */}
              <div className="relative w-full aspect-square flex items-center justify-center">
                <Image src={flo2} alt="Flor de cerezo acuarela" width={400} height={400} className="drop-shadow-xl animate-float-gentle" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
