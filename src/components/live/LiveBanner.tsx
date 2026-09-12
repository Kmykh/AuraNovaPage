"use client";

import React from 'react';

interface LiveBannerProps {
  text: string;
  isConnected: boolean;
}

export function LiveBanner({ text, isConnected }: LiveBannerProps) {
  if (!text || !text.trim()) return null;

  return (
    <div className="fixed bottom-6 left-6 sm:bottom-8 sm:left-8 z-[60] max-w-[320px] pointer-events-none animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-br from-[#4a3933] to-[#5c4a42] text-[#faf7f2] pointer-events-auto p-4 sm:p-5 rounded-2xl shadow-2xl border border-white/10 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#c8a96b]/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-start gap-3.5 relative z-10">
          {/* Indicador de emisión en vivo */}
          <div className="flex flex-col items-center gap-1 shrink-0 mt-1">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
               <span className="text-[10px] uppercase tracking-wider font-bold text-[#c8a96b]">
                 ANUNCIO EN VIVO
               </span>
               {!isConnected && (
                 <span className="text-[9px] text-red-300/60">
                   (reconectando)
                 </span>
               )}
            </div>
            
            {/* Texto del Admin */}
            <p className="text-sm font-serif italic tracking-wide text-white/95 leading-snug break-words">
              {text}
              <span className="inline-block w-[2px] h-3.5 bg-[#c8a96b] ml-1 animate-pulse align-middle" />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
