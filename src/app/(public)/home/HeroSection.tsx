"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Sparkles, ArrowRight } from 'lucide-react';

import flo from '../images/flo.png';
import flo1 from '../images/flo1.png';
import flo2 from '../images/flo2.png';
import flo4 from '../images/flo4.png';
import flow1 from '../images/flow1.png';
import flowera from '../images/flowera.png';

export function HeroSection() {
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    const elem = document.getElementById('conoce-aura-nova');
    elem?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[calc(100vh-4rem)] w-full flex flex-col items-center justify-center pt-24 pb-16 overflow-hidden bg-[#faf7f2]">
      
      {/* Decorative Flowers */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        
        {/* Huge Pink Flowers (Left) */}
        <div className="absolute top-[10%] -left-10 md:-left-20 w-[300px] md:w-[500px] lg:w-[600px] opacity-0 animate-[fade-in-up_1s_ease-out_0.2s_forwards] mix-blend-multiply z-10">
          <Image src={flo1} alt="" width={600} height={600} className="object-contain drop-shadow-sm" />
        </div>
        
        {/* Huge Yellow Flower (Right) */}
        <div className="absolute top-[20%] -right-10 md:-right-20 w-[250px] md:w-[450px] lg:w-[550px] opacity-0 animate-[fade-in-up_1s_ease-out_0.4s_forwards] mix-blend-multiply z-10">
          <Image src={flowera} alt="" width={550} height={550} className="object-contain drop-shadow-sm" />
        </div>
        
        {/* Scattered small petals */}
        <div className="absolute top-32 left-[30%] w-12 opacity-0 animate-[fade-in-up_1s_ease-out_0.6s_forwards] mix-blend-multiply">
          <Image src={flo} alt="" width={50} height={50} className="object-contain rotate-45" />
        </div>
        <div className="absolute bottom-40 right-[25%] w-16 opacity-0 animate-[fade-in-up_1s_ease-out_0.8s_forwards] mix-blend-multiply">
          <Image src={flo2} alt="" width={60} height={60} className="object-contain -rotate-12" />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-20 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center mt-8">
        
        <span className="text-[10px] md:text-xs font-bold text-rose/80 uppercase tracking-[0.2em] mb-4 opacity-0 animate-[fade-in-up_1s_ease-out_1s_forwards]">
          DETALLES QUE HABLAN DE TI
        </span>
        
        <h1 className="font-serif text-[4rem] sm:text-[6rem] md:text-[8rem] lg:text-[10rem] font-bold text-[#4a3933] mb-4 leading-none tracking-tighter opacity-0 animate-[fade-in-up_1s_ease-out_1.2s_forwards] relative">
          Aura Nova
          <span className="absolute -top-4 -right-8 w-12 h-12 hidden md:block">
            <Image src={flo} alt="" width={50} height={50} className="object-contain" />
          </span>
        </h1>
        
        <div className="w-16 h-[2px] bg-[#c8a96b] my-6 opacity-0 animate-[fade-in-up_1s_ease-out_1.4s_forwards]" />
        
        <h2 className="text-2xl sm:text-3xl lg:text-4xl text-[#728f66] font-serif italic mb-6 font-semibold tracking-wide opacity-0 animate-[fade-in-up_1s_ease-out_1.6s_forwards]">
          Detalles hechos con mucho cariño.
        </h2>
        
        <p className="text-base sm:text-lg text-[#887870] mb-12 max-w-xl leading-relaxed font-light opacity-0 animate-[fade-in-up_1s_ease-out_1.8s_forwards]">
          Regalos pensados para celebrar, sorprender y hacer sentir especial a quien más quieres.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto opacity-0 animate-[fade-in-up_1s_ease-out_2s_forwards]">
          <Link href="/productos" tabIndex={-1} className="group relative inline-flex items-center justify-center px-8 py-3.5 font-serif text-lg text-white transition-all duration-300 ease-in-out bg-[#5a4840] rounded-full hover:bg-[#4a3933] shadow-md hover:shadow-lg overflow-hidden">
            <span className="relative flex items-center gap-2">
              Explorar Catálogo
              <ArrowRight size={18} className="transition-transform duration-300 ease-out group-hover:translate-x-1" />
            </span>
          </Link>
          
          <Link href="/seguimiento" tabIndex={-1} className="group relative inline-flex items-center justify-center px-8 py-3.5 font-serif text-lg text-[#5a4840] transition-all duration-300 ease-in-out bg-transparent border border-[#5a4840]/30 rounded-full hover:bg-[#5a4840]/5 shadow-sm overflow-hidden">
            <span className="relative flex items-center gap-2">
              Ver Seguimiento
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="13" x="4" y="4" rx="2" ry="2"/><path d="M4 11h16"/><path d="M8 15h.01"/><path d="M16 15h.01"/></svg>
            </span>
          </Link>
        </div>
        
      </div>
    </section>
  );
}
