"use client";

import React from 'react';
import Link from 'next/link';

/**
 * Elegant inline link for catalog page — no generic icons.
 * Styled as a typographic accent, not a typical button.
 */
export function CustomOrderBanner() {
  return (
    <Link 
      href="/personalizado"
      className="group inline-flex items-center gap-3 relative"
    >
      {/* Decorative line */}
      <span className="w-6 h-[1.5px] bg-[#c8a96b]/50 group-hover:w-10 transition-all duration-300" />
      
      {/* Text */}
      <span className="font-serif italic text-[#c8a96b] text-sm md:text-base tracking-wide group-hover:text-[#b89759] transition-colors duration-300">
        ¿Buscas algo que no ves aquí?
      </span>
      
      {/* Subtle underline accent on hover */}
      <span className="text-[#4a3933] text-xs font-sans font-bold uppercase tracking-[0.2em] group-hover:tracking-[0.3em] transition-all duration-300 relative">
        Personalízalo
        <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#c8a96b] group-hover:w-full transition-all duration-500" />
      </span>
      
      {/* Decorative line */}
      <span className="w-6 h-[1.5px] bg-[#c8a96b]/50 group-hover:w-10 transition-all duration-300" />
    </Link>
  );
}
