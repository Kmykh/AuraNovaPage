import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Logo } from '../shared/Logo';
import { Globe, Mail, Heart } from 'lucide-react';

import muroromano from '../../app/(public)/images/muroromano.png';
import estatuo from '../../app/(public)/images/estatuo.png';
import flortallo from '../../app/(public)/images/flortallo.png';
import nube2 from '../../app/(public)/images/nube2.png';

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#faf7f2] pt-12 md:pt-16 pb-6 border-t border-sage/10">
      
      {/* ─── Composición Griega Sutil y Limpia ─── */}
      <div className="absolute inset-0 pointer-events-none mix-blend-multiply overflow-hidden">
        
        {/* Columna Romana (Izquierda) */}
        <div className="absolute bottom-0 md:-bottom-10 -left-6 md:-left-4 w-32 md:w-56 h-[90%] md:h-full opacity-[0.25]" 
             style={{ maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)', WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)' }}>
          <Image src={muroromano} alt="" fill className="object-cover object-center" />
        </div>
        
        {/* Estatua Clásica (Derecha) */}
        <div className="absolute bottom-0 md:-bottom-4 -right-6 md:right-0 w-40 md:w-[320px] h-[90%] md:h-full opacity-[0.20]"
             style={{ maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 75%)', WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 75%)' }}>
          <Image src={estatuo} alt="" fill className="object-contain object-center" />
        </div>

      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Bloque Principal del Footer */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8 relative">
          
          {/* Brand Col */}
          <div className="md:col-span-5 flex flex-col items-center md:items-start text-center md:text-left bg-white/40 md:bg-transparent p-6 md:p-0 rounded-2xl md:rounded-none backdrop-blur-sm md:backdrop-blur-none border border-white/50 md:border-none shadow-sm md:shadow-none">
            <Link href="/" className="inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-md mb-4 transition-transform hover:scale-105">
              <Logo className="text-3xl md:text-4xl" />
            </Link>
            <p className="text-sm md:text-base text-brown/90 max-w-sm font-serif italic leading-relaxed">
              Detalles hechos con mucho cariño, pensados para celebrar, sorprender y hacer sentir especial a alguien.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="flex items-center justify-center w-10 h-10 bg-white/70 text-brown hover:text-white hover:bg-gold transition-all duration-300 rounded-full shadow-sm hover:shadow-md hover:-translate-y-1" aria-label="Web">
                <Globe size={18} />
              </a>
              <a href="mailto:auranova1606@gmail.com" className="flex items-center justify-center w-10 h-10 bg-white/70 text-brown hover:text-white hover:bg-gold transition-all duration-300 rounded-full shadow-sm hover:shadow-md hover:-translate-y-1" aria-label="Email">
                <Mail size={18} />
              </a>
            </div>
          </div>

          {/* Spacer */}
          <div className="hidden md:block md:col-span-1"></div>

          {/* Links Col 1 */}
          <div className="md:col-span-3 flex flex-col items-center md:items-start text-center md:text-left pt-2">
            <h3 className="text-xs font-bold text-brown tracking-[0.25em] uppercase mb-4 flex items-center">
              <span className="w-6 h-px bg-gold/60 mr-3 hidden md:block"></span> Explorar
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/productos" className="text-sm font-medium text-sage hover:text-gold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold rounded-sm flex items-center group">
                  <span className="w-0 h-[2px] bg-gold transition-all duration-300 group-hover:w-4 mr-0 group-hover:mr-2 rounded-full"></span> Catálogo
                </Link>
              </li>
              <li>
                <Link href="/seguimiento" className="text-sm font-medium text-sage hover:text-gold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold rounded-sm flex items-center group">
                  <span className="w-0 h-[2px] bg-gold transition-all duration-300 group-hover:w-4 mr-0 group-hover:mr-2 rounded-full"></span> Seguir Pedido
                </Link>
              </li>
              <li>
                <Link href="/nosotros" className="text-sm font-medium text-sage hover:text-gold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold rounded-sm flex items-center group">
                  <span className="w-0 h-[2px] bg-gold transition-all duration-300 group-hover:w-4 mr-0 group-hover:mr-2 rounded-full"></span> Nosotros
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Col 2 */}
          <div className="md:col-span-3 flex flex-col items-center md:items-start text-center md:text-left pt-2">
            <h3 className="text-xs font-bold text-brown tracking-[0.25em] uppercase mb-4 flex items-center">
              <span className="w-6 h-px bg-gold/60 mr-3 hidden md:block"></span> Atención
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/contacto" className="text-sm font-medium text-sage hover:text-gold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold rounded-sm flex items-center group">
                  <span className="w-0 h-[2px] bg-gold transition-all duration-300 group-hover:w-4 mr-0 group-hover:mr-2 rounded-full"></span> Contacto
                </Link>
              </li>
              <li>
                <Link href="/terminos" className="text-sm font-medium text-sage hover:text-gold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold rounded-sm flex items-center group">
                  <span className="w-0 h-[2px] bg-gold transition-all duration-300 group-hover:w-4 mr-0 group-hover:mr-2 rounded-full"></span> Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link href="/privacidad" className="text-sm font-medium text-sage hover:text-gold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold rounded-sm flex items-center group">
                  <span className="w-0 h-[2px] bg-gold transition-all duration-300 group-hover:w-4 mr-0 group-hover:mr-2 rounded-full"></span> Política de Privacidad
                </Link>
              </li>
            </ul>
          </div>

        </div>
        
        {/* Línea Divisoria Inferior y Copyright */}
        <div className="pt-6 border-t border-gold/30 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs md:text-sm text-sage font-medium flex items-center tracking-wide">
            &copy; {currentYear} Aura Nova. Creado con <Heart size={14} className="mx-1.5 text-[#d38b8b] fill-[#d38b8b]/20" /> en Perú.
          </p>
          <div className="flex gap-4">
            <span className="text-sm md:text-base text-gold font-serif italic tracking-widest">El arte de regalar</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
