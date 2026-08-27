"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

import flo1 from '../images/flo1.png';
import flo4 from '../images/flo4.png';

const steps = [
  {
    num: '01',
    title: 'Elige tu detalle',
    desc: 'Explora nuestro catálogo y encuentra el detalle que deseas regalar.',
  },
  {
    num: '02',
    title: 'Realiza tu pedido',
    desc: 'Selecciona tu detalle y completa los datos necesarios para coordinar tu pedido.',
  },
  {
    num: '03',
    title: 'Confirma reserva',
    desc: 'Para reservar solicitamos un adelanto del 50% mediante Yape o Plin.',
  },
  {
    num: '04',
    title: 'Recibe o recoge',
    desc: 'Elige entre delivery, punto de encuentro o envío a otras ciudades.',
  }
];

export function HowItWorksSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) setIsVisible(true); },
      { threshold: 0.15 }
    );
    const section = document.getElementById('how-it-works-timeline');
    if (section) observer.observe(section);
    return () => { if (section) observer.unobserve(section); };
  }, []);

  return (
    <section id="how-it-works-timeline" className="py-12 md:py-16 lg:py-20 relative">
      
      {/* Decorative flowers */}
      <div className="absolute top-20 -right-10 w-[200px] opacity-40 pointer-events-none animate-float-gentle mix-blend-multiply">
        <Image src={flo1} alt="" width={200} height={200} />
      </div>
      <div className="absolute bottom-10 left-0 w-[150px] opacity-40 pointer-events-none animate-float-gentle-reverse mix-blend-multiply -translate-x-1/4">
        <Image src={flo4} alt="" width={150} height={150} />
      </div>

      <div className="mx-auto max-w-7xl px-6 sm:px-8 relative z-10">
        <div className={`text-center mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="uppercase tracking-[0.3em] text-[11px] font-semibold text-gold mb-4 block">Paso a paso</span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-brown mb-6">
            ¿Cómo realizar tu compra?
          </h2>
          <div className="w-16 h-px bg-gold/40 mx-auto" />
        </div>

        {/* Horizontal Timeline */}
        <div className="relative mt-12">
          
          {/* Connector Line (Desktop) */}
          <div className="hidden lg:block absolute top-8 left-12 right-12 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`relative flex flex-col items-center text-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${index * 150 + 200}ms` }}
              >
                {/* Number Circle */}
                <div className="w-16 h-16 rounded-full bg-cream border border-gold/30 flex items-center justify-center mb-6 shadow-sm relative z-10 group hover:scale-110 hover:border-gold transition-all duration-500">
                  <span className="font-serif text-2xl text-gold font-bold">{step.num}</span>
                  {/* Outer glowing ring on hover */}
                  <div className="absolute inset-0 rounded-full border border-gold/20 scale-125 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                
                <h3 className="font-serif text-xl font-semibold text-brown mb-3">{step.title}</h3>
                <p className="text-sage text-sm leading-relaxed px-4">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
