"use client";

import React, { useEffect, useState } from 'react';
import { Flower2, Smartphone, Gift } from 'lucide-react';

const steps = [
  {
    icon: <Flower2 size={32} strokeWidth={1.5} />,
    title: "1. Elige tu detalle",
    description: "Explora nuestro catálogo y personaliza el arreglo floral perfecto para esa persona especial."
  },
  {
    icon: <Smartphone size={32} strokeWidth={1.5} />,
    title: "2. Reserva rápida",
    description: "Asegura tu pedido de forma rápida abonando solo un 50% de adelanto directamente con Yape."
  },
  {
    icon: <Gift size={32} strokeWidth={1.5} />,
    title: "3. Entrega Mágica",
    description: "Nosotros nos encargamos del resto. Tu sorpresa llegará impecable y en el momento perfecto."
  }
];

export function PaymentInfoSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Simple intersection observer to trigger fade-in animation on scroll
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );
    
    const section = document.getElementById('how-it-works-section');
    if (section) observer.observe(section);
    
    return () => {
      if (section) observer.unobserve(section);
    };
  }, []);

  return (
    <section id="how-it-works-section" className="py-24 bg-[#FFFDF8] border-b border-sage/5 overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className={`text-center max-w-2xl mx-auto mb-16 transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-brown mb-4">
            ¿Cómo funciona?
          </h2>
          <p className="text-sage text-lg">
            Hacer sonreír a alguien nunca fue tan fácil y seguro.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          
          {/* Connecting Line (Desktop only) */}
          <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-transparent via-gold/30 to-transparent -z-10" />

          {steps.map((step, index) => (
            <div 
              key={index} 
              className={`group relative flex flex-col items-center text-center p-8 bg-white/60 backdrop-blur-sm rounded-3xl border border-sage/10 hover:border-gold/30 transition-all duration-700 hover:shadow-xl hover:shadow-gold/5 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              {/* Icon Container */}
              <div className="w-24 h-24 mb-6 rounded-full bg-cream flex items-center justify-center text-gold group-hover:scale-110 group-hover:bg-gold group-hover:text-white transition-all duration-500 shadow-sm relative z-10">
                {step.icon}
              </div>
              
              <h3 className="text-xl font-serif font-bold text-brown mb-3 group-hover:text-gold transition-colors duration-300">
                {step.title}
              </h3>
              
              <p className="text-sage text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
