"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { MapPin, Map, Plane } from 'lucide-react';

import flo4 from '../images/flo4.png';
import flo from '../images/flo.png';

const shippingOptions = [
  {
    icon: <MapPin size={28} strokeWidth={1.5} />,
    title: "Delivery Local",
    description: "Te lo llevamos a tu puerta en Huancayo. El costo depende de tu zona y lo ves antes de pagar.",
    badge: "Popular"
  },
  {
    icon: <Map size={28} strokeWidth={1.5} />,
    title: "Puntos de Encuentro",
    description: "Recógelo en un punto conocido de la ciudad, en el horario que coordinemos contigo.",
    badge: "Económico"
  },
  {
    icon: <Plane size={28} strokeWidth={1.5} />,
    title: "Envíos Nacionales",
    description: "Llegamos a todo el Perú por Shalom u Olva. El flete lo pagas al recoger en la agencia.",
    badge: "Todo el país"
  }
];

export function DeliveryMethodsSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );
    
    const section = document.getElementById('shipping-marketing-section');
    if (section) observer.observe(section);
    
    return () => {
      if (section) observer.unobserve(section);
    };
  }, []);

  return (
    <section id="shipping-marketing-section" className="py-12 md:py-16 lg:py-20 relative">
      
      {/* Decorative Flowers */}
      <div className="absolute top-10 -left-16 w-[200px] opacity-40 pointer-events-none animate-float-gentle mix-blend-multiply">
        <Image src={flo4} alt="" width={200} height={200}  style={{ width: 'auto', height: 'auto' }} />
      </div>
      
      <div className="absolute bottom-10 right-10 w-[80px] opacity-60 pointer-events-none animate-butterfly mix-blend-multiply">
        <Image src={flo} alt="" width={80} height={80}  style={{ width: 'auto', height: 'auto' }} />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className={`text-center max-w-2xl mx-auto mb-20 transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <span className="uppercase tracking-[0.3em] text-[11px] font-semibold text-gold mb-4 block">Entregas</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-brown mb-6">
            Llegamos donde nos necesites
          </h2>
          <div className="w-16 h-px bg-gold/40 mx-auto mb-6" />
          <p className="text-sage text-lg">
            Te ofrecemos diferentes alternativas para que tu regalo perfecto llegue siempre a tiempo y seguro.
          </p>
        </div>

        {/* Tres formas de entrega en arcos */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {shippingOptions.map((option, index) => (
            <div 
              key={index} 
              className={`group relative flex flex-col items-center overflow-hidden rounded-b-[2rem] rounded-t-[5rem] md:rounded-t-[10rem] border border-[#ece3da] bg-white/75 px-6 pb-8 pt-10 text-center backdrop-blur transition-all duration-700 hover:-translate-y-2 hover:border-[#c8a96b]/60 hover:shadow-[0_30px_50px_-30px_rgba(74,57,51,0.5)] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              {/* Brillo dorado en el borde superior */}
              <span className="absolute inset-x-10 top-0 h-[3px] rounded-full bg-[linear-gradient(90deg,transparent,#e8c98a,#e9a4b4,#e8c98a,transparent)] bg-[length:200%_100%] animate-shimmer" />
              {/* Badge */}
              <div className="mb-6 bg-white/50 backdrop-blur-sm text-gold border border-gold/20 text-[10px] uppercase tracking-widest font-bold px-4 py-1.5 rounded-full">
                {option.badge}
              </div>

              {/* Icon Container */}
              <div className="w-16 h-16 mb-6 rounded-full bg-white flex items-center justify-center text-brown group-hover:scale-110 group-hover:text-gold transition-all duration-500 shadow-sm border border-sage/5">
                {option.icon}
              </div>
              
              <h3 className="text-xl font-serif font-medium text-brown mb-4 group-hover:text-gold transition-colors duration-300">
                {option.title}
              </h3>
              
              <p className="text-sage text-sm leading-relaxed px-4">
                {option.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
