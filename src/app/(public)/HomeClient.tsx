"use client";

import React from 'react';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';
import { HeroSection } from './home/HeroSection';
import nube2 from './images/nube2.png';
import { AboutSection } from './home/AboutSection';
import { FeaturedProductsSection } from './home/FeaturedProductsSection';
import { HowItWorksSection } from './home/HowItWorksSection';
import { DeliveryMethodsSection } from './home/DeliveryMethodsSection';
import { PaymentInfoSection } from './home/PaymentInfoSection';
import { FloralDetailsSection } from './home/FloralDetailsSection';
import { ImportantInfoSection } from './home/ImportantInfoSection';
import { TrackingPromoSection } from './home/TrackingPromoSection';
import { ContactSection } from './home/ContactSection';
import { PersonalizedGiftsSection } from './home/PersonalizedGiftsSection';
import flo from './images/flo.png';
import flo1 from './images/flo1.png';
import flo2 from './images/flo2.png';
import flo4 from './images/flo4.png';
import flo5 from './images/flo5.png';
import flo6 from './images/flo6.png';
import muroromano from './images/muroromano.png';
import angeles from './images/angeles.png';
import flortallo from './images/flortallo.png';

/* ─── Reusable cloud divider component ─── */
function CloudDivider({ flip = false, slower = false }: { flip?: boolean; slower?: boolean }) {
  return (
    <div className={`w-full relative z-30 pointer-events-none h-28 md:h-44 overflow-hidden cloud-mask -my-14 md:-my-20 ${flip ? 'transform rotate-180' : ''}`}>
      <div className={`w-[120%] h-full ${slower ? 'animate-cloud-slow' : 'animate-cloud'} -ml-[10%]`}>
        <Image src={nube2} alt="" className="w-full h-full object-cover object-center opacity-50 mix-blend-multiply" />
      </div>
    </div>
  );
}

/* ─── Decorative floating flower ─── */
function FloatingFlower({ src, className }: { src: any; className: string }) {
  return (
    <div className={`absolute pointer-events-none mix-blend-multiply ${className}`}>
      <Image src={src} alt="" className="w-full h-full object-contain" />
    </div>
  );
}

export function HomeClient() {
  return (
    <div className="flex flex-col w-full overflow-hidden bg-[#faf7f2] relative">
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes slideCloud {
          0% { transform: translateX(0); }
          50% { transform: translateX(-8%); }
          100% { transform: translateX(0); }
        }
        @keyframes slideCloudSlow {
          0% { transform: translateX(0); }
          50% { transform: translateX(5%); }
          100% { transform: translateX(0); }
        }
        .animate-cloud {
          animation: slideCloud 25s ease-in-out infinite;
        }
        .animate-cloud-slow {
          animation: slideCloudSlow 35s ease-in-out infinite;
        }
        .cloud-mask {
          mask-image: linear-gradient(to bottom, transparent 0%, transparent 15%, black 40%, black 60%, transparent 85%, transparent 100%);
          -webkit-mask-image: linear-gradient(to bottom, transparent 0%, transparent 15%, black 40%, black 60%, transparent 85%, transparent 100%);
        }
        .vignette-mask {
          mask-image: radial-gradient(ellipse at center, black 30%, transparent 75%);
          -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 75%);
        }
        .column-mask {
          mask-image: linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%);
          -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%);
        }
      `}} />

      {/* ══════════════ HERO ══════════════ */}
      <HeroSection />

      {/* ── Cloud after Hero ── */}
      <CloudDivider />

      {/* ══════════════ HUANCAYO ORIGIN (MARCA WANKA) ══════════════ */}
      <section className="relative w-full z-10 py-16 md:py-24 px-6 overflow-hidden">
        {/* Decoraciones sutiles de fondo para la sección de origen */}
        <FloatingFlower src={muroromano} className="top-0 left-0 w-32 md:w-56 opacity-[0.12] column-mask" />
        <FloatingFlower src={angeles} className="bottom-0 right-0 w-40 md:w-72 opacity-[0.08] -rotate-12 vignette-mask" />

        <div className="max-w-4xl mx-auto text-center relative z-10 bg-white/40 backdrop-blur-md md:bg-transparent md:backdrop-blur-none p-8 md:p-0 rounded-3xl md:rounded-none shadow-sm md:shadow-none border border-white/50 md:border-none">
          <p className="font-sans text-xs md:text-sm tracking-[0.4em] uppercase text-[#c8a96b] font-bold mb-4 flex justify-center items-center gap-3">
            <span className="w-8 h-[1px] bg-[#c8a96b]/50"></span>
            Orgullo Local
            <span className="w-8 h-[1px] bg-[#c8a96b]/50"></span>
          </p>
          <h2 className="font-serif text-5xl md:text-7xl text-[#4a3933] mb-6 font-light tracking-tight">
            Somos marca <span className="font-serif italic text-[#c8a96b] font-normal tracking-wide">Wanka</span>
          </h2>
          <p className="font-sans text-sm md:text-lg text-[#887870] leading-relaxed max-w-2xl mx-auto mb-10 font-medium">
            Aura Nova es más que una florería; es un sello de identidad creado con pasión en el corazón de los Andes. Nos dedicamos a diseñar experiencias únicas y a transformar tus emociones en detalles majestuosos. Porque cada arreglo lleva impregnado el arte, la dedicación y el espíritu vibrante de nuestra tierra.
          </p>
          <div className="flex justify-center items-center gap-4">
            <div className="w-16 md:w-32 h-[1px] bg-gradient-to-r from-transparent via-[#c8a96b]/60 to-transparent"></div>
            <Sparkles className="text-[#c8a96b] w-6 h-6 animate-pulse" />
            <div className="w-16 md:w-32 h-[1px] bg-gradient-to-r from-transparent via-[#c8a96b]/60 to-transparent"></div>
          </div>
        </div>
      </section>

      {/* ══════════════ FEATURES TYPOGRAPHY ══════════════ */}
      <div className="w-full relative z-10 flex flex-wrap justify-center gap-10 md:gap-24 px-6 text-center py-10 md:py-14 overflow-hidden">
        <FloatingFlower src={flo} className="top-0 left-4 w-20 md:w-28 opacity-15 rotate-45 animate-float-gentle" />
        <FloatingFlower src={flo4} className="bottom-0 right-8 w-24 md:w-36 opacity-10 -rotate-12 animate-float-delayed" />

        <div className="flex flex-col items-center">
          <h3 className="font-serif text-2xl md:text-4xl italic text-[#c8a96b] mb-2 tracking-wide">Regalos Únicos</h3>
          <p className="font-sans text-[10px] md:text-xs tracking-[0.2em] uppercase text-[#887870] font-bold">Seleccionados con amor</p>
        </div>
        <div className="flex flex-col items-center">
          <h3 className="font-serif text-2xl md:text-4xl italic text-[#c8a96b] mb-2 tracking-wide">Hechos con Cariño</h3>
          <p className="font-sans text-[10px] md:text-xs tracking-[0.2em] uppercase text-[#887870] font-bold">Cada detalle importa</p>
        </div>
        <div className="flex flex-col items-center">
          <h3 className="font-serif text-2xl md:text-4xl italic text-[#c8a96b] mb-2 tracking-wide">Envíos Seguros</h3>
          <p className="font-sans text-[10px] md:text-xs tracking-[0.2em] uppercase text-[#887870] font-bold">Llegamos a donde estés</p>
        </div>
      </div>

      {/* ── Cloud transition ── */}
      <CloudDivider flip slower />

      {/* ══════════════ ABOUT ══════════════ */}
      {/* Internal: flo2 left-center (40%), flo2 right visual (100%) */}
      <div className="relative">
        <FloatingFlower src={flo5} className="-top-10 right-0 w-40 md:w-56 opacity-8 rotate-12 translate-x-1/4" />
        <AboutSection />
      </div>

      {/* ── Cloud transition ── */}
      <CloudDivider />

      {/* ══════════════ PRODUCTS ══════════════ */}
      {/* Internal: flo1 top-right (40%) */}
      <div className="relative">
        <FloatingFlower src={flortallo} className="bottom-10 left-0 w-36 md:w-52 opacity-15 -translate-x-1/3 vignette-mask" />
        <FeaturedProductsSection />
      </div>

      {/* ── Cloud transition ── */}
      <CloudDivider flip slower />

      {/* ══════════════ PERSONALIZED GIFTS ══════════════ */}
      <div className="relative">
        <FloatingFlower src={flo6} className="top-1/2 right-0 w-40 md:w-64 opacity-10 -translate-y-1/2 translate-x-1/4 vignette-mask" />
        <PersonalizedGiftsSection />
      </div>

      {/* ── Cloud transition ── */}
      <CloudDivider flip slower />

      {/* ══════════════ HOW IT WORKS ══════════════ */}
      {/* Internal: flo1 top-right (40%), flo4 bottom-left (40%) */}
      <div className="relative">
        <FloatingFlower src={muroromano} className="top-1/2 left-0 w-64 md:w-[28rem] opacity-70 -translate-y-1/2 -translate-x-1/3 column-mask" />
        <HowItWorksSection />
      </div>

      {/* ── Cloud transition ── */}
      <CloudDivider />

      {/* ══════════════ DELIVERY ══════════════ */}
      {/* Internal: flo4 top-left (40%), flo bottom-right (60%) */}
      <div className="relative">
        <FloatingFlower src={angeles} className="top-1/2 right-0 w-64 md:w-[32rem] opacity-75 -translate-y-1/2 translate-x-1/4 vignette-mask animate-float-gentle" />
        <DeliveryMethodsSection />
      </div>

      {/* ── Cloud transition ── */}
      <CloudDivider flip slower />

      {/* ══════════════ FLORAL DETAILS ══════════════ */}
      {/* Internal: flo4 top-right (40%), flo2 bottom-left (30%) */}
      <FloralDetailsSection />

      {/* ── Cloud transition ── */}
      <CloudDivider />

      {/* ══════════════ IMPORTANT INFO ══════════════ */}
      {/* Internal: flo5 top-left (30%), flo6 bottom-right (40%) */}
      <div className="relative">
        <FloatingFlower src={flortallo} className="top-1/2 right-0 w-36 md:w-52 opacity-12 -translate-y-1/2 translate-x-1/3 vignette-mask" />
        <ImportantInfoSection />
      </div>

      {/* ── Cloud transition ── */}
      <CloudDivider flip slower />

      {/* ══════════════ TRACKING PROMO ══════════════ */}
      {/* Internal: flo1+flo4+flowera in visual composition */}
      <div className="relative">
        <FloatingFlower src={muroromano} className="bottom-0 left-0 w-48 md:w-72 opacity-50 -translate-x-1/3 translate-y-1/4 column-mask" />
        <TrackingPromoSection />
      </div>

      {/* ── Cloud before Contact ── */}
      <CloudDivider />

      {/* ══════════════ CONTACT ══════════════ */}
      {/* Internal: flo4 top-right (30%), flo bottom-left (40%) */}
      <div className="relative">
        <FloatingFlower src={angeles} className="top-0 left-1/2 w-56 md:w-80 opacity-50 -translate-x-1/2 -translate-y-1/4 vignette-mask" />
        <ContactSection />
      </div>
    </div>
  );
}
