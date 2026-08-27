import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Phone, Mail, Sparkles, MessageCircleHeart } from 'lucide-react';

import flo4 from '../images/flo4.png';
import flo from '../images/flo.png';

// [x] 5. Update src/app/(public)/home/TrackingPromoSection.tsx redesign.
// [/] 6. Update src/app/(public)/home/ContactSection.tsx redesign.

export function ContactSection() {
  const handleWhatsAppClick = () => {
    const message = encodeURIComponent("¡Hola Aura Nova! Tengo una duda y me gustaría pedirles más información.");
    window.open(`https://wa.me/51950482596?text=${message}`, '_blank');
  };

  return (
    <section id="contacto" className="py-12 md:py-16 lg:py-20 relative">
      
      {/* Immersive Background Images */}
      <div className="absolute top-0 right-0 w-[400px] opacity-30 pointer-events-none translate-x-1/3 -translate-y-1/4 animate-spin-slow mix-blend-multiply">
        <Image src={flo4} alt="" width={400} height={400} />
      </div>
      
      <div className="absolute bottom-20 left-10 w-[200px] opacity-40 pointer-events-none animate-float-delayed mix-blend-multiply">
        <Image src={flo} alt="" width={200} height={200} />
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        {/* The Invitation Card (Now text only without the heavy container) */}
        <div className="py-10 md:py-16 relative overflow-hidden group text-center flex flex-col items-center">
          
          
          <h2 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold text-brown mb-4 md:mb-6 leading-none">
            ¿Tienes alguna <br/><span className="italic font-light text-rose">duda?</span>
          </h2>
          
          <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mb-6 md:mb-8" />
          
          <p className="text-brown/70 text-base md:text-xl mb-10 md:mb-12 max-w-xl mx-auto leading-relaxed font-serif italic">
            Estamos aquí para ayudarte. Si tienes consultas sobre nuestros productos, envíos o tiempos de preparación, escríbenos directamente.
          </p>
          
          <button 
            onClick={handleWhatsAppClick}
            className="group/btn relative inline-flex items-center justify-center px-6 md:px-8 py-3 md:py-4 font-serif text-base md:text-lg italic text-white transition-all duration-300 ease-in-out bg-[#25D366] rounded-full hover:bg-[#1ebe57] shadow-lg shadow-[#25D366]/20 hover:shadow-xl hover:shadow-[#25D366]/40 hover:-translate-y-1 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-in-out"></div>
            <span className="relative flex items-center gap-3">
              <MessageCircleHeart className="w-5 h-5" />
              Preguntar por WhatsApp
            </span>
          </button>
        </div>

        {/* Minimal Footer Contact Info */}
        <div className="mt-20 flex flex-col items-center">
          <div className="w-full max-w-md flex items-center justify-center gap-4 mb-8">
            <div className="h-px bg-sage/20 flex-1" />
            <span className="text-xs uppercase tracking-widest text-brown/50 font-semibold px-4">Conéctate</span>
            <div className="h-px bg-sage/20 flex-1" />
          </div>
          
          <div className="flex justify-center gap-6 mb-10">
            <a 
              href="https://www.instagram.com/auranova122?igsh=bGsxamJ5bTgwdzhu" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center w-12 h-12 bg-white/50 rounded-full text-sage hover:text-rose hover:bg-white transition-all shadow-sm border border-white hover:scale-110"
              aria-label="Instagram"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </a>
            <a 
              href="https://www.tiktok.com/@aura.nova40?_r=1&_t=ZS-9937jDsFvbV" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center w-12 h-12 bg-white/50 rounded-full text-sage hover:text-brown hover:bg-white transition-all shadow-sm border border-white hover:scale-110"
              aria-label="TikTok"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.48 6.28 6.28 0 001.82-4.49V8.76a8.26 8.26 0 004.82 1.55V6.86a4.84 4.84 0 01-1.06-.17z"/>
              </svg>
            </a>
          </div>
          
          <div className="flex justify-center gap-8 text-sage/80 text-sm font-serif italic">
            <a href="mailto:auranova1606@gmail.com" className="flex items-center gap-2 hover:text-brown transition-colors">
              <Mail size={16} />
              auranova1606@gmail.com
            </a>
            <span className="flex items-center gap-2">
              <Phone size={16} />
              950 482 596
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
