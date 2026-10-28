"use client";

import React from 'react';
import Image, { StaticImageData } from 'next/image';
import { HeroSection } from './home/HeroSection';
import nube2 from './images/nube2.png';
import { AboutSection } from './home/AboutSection';
import { FeaturedProductsSection } from './home/FeaturedProductsSection';
import { CampaignProductsSection } from './home/CampaignProductsSection';
import { HowItWorksSection } from './home/HowItWorksSection';
import { DeliveryMethodsSection } from './home/DeliveryMethodsSection';
import { WankaSection } from './home/WankaSection';
import { BrandRibbon } from './home/BrandRibbon';
import { PromiseSection } from './home/PromiseSection';
import { TrackingPromoSection } from './home/TrackingPromoSection';
import { ContactSection } from './home/ContactSection';
import { PersonalizedGiftsSection } from './home/PersonalizedGiftsSection';
import { YapeOnlineSection } from './home/YapeOnlineSection';
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
        <Image src={nube2} alt="" priority className="w-full h-full object-cover object-center opacity-50 mix-blend-multiply" />
      </div>
    </div>
  );
}

/* ─── Decorative floating flower ─── */
function FloatingFlower({ src, className }: { src: StaticImageData; className: string }) {
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

      {/* ══════════════ MARCA WANKA ══════════════ */}
      <WankaSection />

      {/* ══════════════ CINTA DE LA MARCA ══════════════ */}
      <BrandRibbon />

      {/* ══════════════ YAPE ONLINE ══════════════ */}
      <YapeOnlineSection />

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

      {/* ══════════════ CAMPAIGN PRODUCTS ══════════════ */}
      <CampaignProductsSection />

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
        <FloatingFlower src={muroromano} className="top-1/2 left-0 hidden w-[28rem] -translate-x-1/2 -translate-y-1/2 opacity-50 column-mask lg:block" />
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

      {/* ══════════════ LA PROMESA (frase + hecho por pedido) ══════════════ */}
      <PromiseSection />

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
