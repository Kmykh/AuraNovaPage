"use client";

import React from 'react';

interface LiveBannerProps {
  text: string;
  isConnected: boolean;
}

export function LiveBanner({ text, isConnected }: LiveBannerProps) {
  if (!text || !text.trim()) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] pointer-events-none animate-in slide-in-from-top duration-500">
      <div className="w-full bg-gradient-to-r from-[#4a3933] via-[#5c4a42] to-[#4a3933] text-[#faf7f2] pointer-events-auto">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-center gap-3">
          
          {/* Indicador de emisión en vivo */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#c8a96b]">
              EN VIVO
            </span>
          </div>

          {/* Separador */}
          <div className="w-px h-4 bg-white/20 shrink-0" />

          {/* Texto del Admin */}
          <p className="text-sm sm:text-base font-serif italic tracking-wide truncate max-w-2xl">
            {text}
            <span className="inline-block w-[2px] h-4 bg-[#c8a96b] ml-0.5 animate-pulse align-text-bottom" />
          </p>

          {/* Estado de conexión (debug sutil) */}
          {!isConnected && (
            <span className="text-[9px] text-red-300/60 shrink-0 ml-2">
              reconectando...
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
