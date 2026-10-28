"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { CreditCard, Gift, ShoppingBag, Sparkles } from 'lucide-react';

import flo1 from '../images/flo1.png';
import flo4 from '../images/flo4.png';

const steps = [
  {
    num: '01',
    icon: Sparkles,
    title: 'Elige tu detalle',
    desc: 'Explora nuestro catálogo y encuentra el detalle que deseas regalar.',
  },
  {
    num: '02',
    icon: ShoppingBag,
    title: 'Realiza tu pedido',
    desc: 'Selecciona tu detalle y completa los datos necesarios para coordinar tu pedido.',
  },
  {
    num: '03',
    icon: CreditCard,
    title: 'Confirma reserva',
    desc: 'Paga en la web con tarjeta o Yape: un adelanto del 50% o el total.',
  },
  {
    num: '04',
    icon: Gift,
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
        <Image src={flo1} alt="" width={200} height={200}  style={{ width: 'auto', height: 'auto' }} />
      </div>
      <div className="absolute bottom-10 left-0 w-[150px] opacity-40 pointer-events-none animate-float-gentle-reverse mix-blend-multiply -translate-x-1/4">
        <Image src={flo4} alt="" width={150} height={150}  style={{ width: 'auto', height: 'auto' }} />
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
          
          {/* Línea que se dibuja al aparecer (computadora) */}
          <div className="absolute left-[12%] right-[12%] top-10 hidden h-px bg-gold/15 lg:block">
            <div className={`h-full origin-left bg-gradient-to-r from-[#e9a4b4] via-gold to-[#e9a4b4] transition-transform duration-[1800ms] ease-out ${isVisible ? 'scale-x-100' : 'scale-x-0'}`} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`relative flex flex-col items-center text-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${index * 150 + 200}ms` }}
              >
                {/* Ícono con su número */}
                <div className="group relative z-10 mb-6 flex h-20 w-20 items-center justify-center rounded-[1.75rem] border border-gold/30 bg-white shadow-[0_18px_30px_-20px_rgba(74,57,51,0.5)] transition-all duration-500 hover:-translate-y-1 hover:rotate-3 hover:border-gold">
                  <step.icon className="h-8 w-8 text-[#b08a4e] transition-transform duration-500 group-hover:scale-110" strokeWidth={1.5} />
                  <span className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#4a3933] font-serif text-xs font-bold text-[#e8c98a] shadow">{step.num}</span>
                </div>

                <h3 className="mb-3 font-serif text-xl font-semibold text-brown">{step.title}</h3>
                <p className="max-w-[16rem] px-4 text-sm leading-relaxed text-sage">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
