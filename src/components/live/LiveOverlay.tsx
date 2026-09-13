"use client";

import React, { useState } from 'react';
import { useLivePublic } from '@/hooks/use-live-signalr';
import { Radio, ExternalLink, X } from 'lucide-react';

/**
 * Aviso flotante ultra-limpio para los clientes cuando la tienda está en directo.
 * Si no estás en vivo, no muestra absolutamente nada en la tienda.
 */
export function LiveOverlay() {
  const {
    liveText,
    isLiveActive,
    tikTokUsername,
  } = useLivePublic();

  const [isDismissed, setIsDismissed] = useState(false);

  // Si no está en vivo o el usuario lo cerró, no mostramos nada
  if (!isLiveActive || isDismissed) return null;

  const liveUrl = tikTokUsername 
    ? `https://www.tiktok.com/@${tikTokUsername}/live` 
    : 'https://www.tiktok.com/@aura.nova40';

  return (
    <aside aria-label="Aviso de transmisión en vivo" className="fixed top-24 left-1/2 -translate-x-1/2 w-[92%] sm:w-auto z-[70] max-w-[500px] animate-in slide-in-from-top-6 fade-in duration-500">
      <div className="bg-[#2a1d19]/95 text-[#faf7f2] backdrop-blur-xl p-4 sm:p-5 rounded-2xl shadow-[0_20px_50px_rgba(42,29,25,0.45)] border border-[#c8a96b]/40 relative overflow-hidden">
        
        {/* Resplandor decorativo */}
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-red-500/15 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-start gap-3.5 relative z-10">
          {/* Indicador pulsante EN VIVO */}
          <div className="flex items-center justify-center shrink-0 mt-0.5">
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-80" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500" />
            </span>
          </div>

          {/* Contenido del aviso */}
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-red-400 flex items-center gap-1.5">
                <Radio size={13} className="animate-pulse" />
                ¡ESTAMOS EN VIVO!
              </span>
            </div>
            
            <p className="text-sm font-serif italic text-white/95 leading-snug break-words">
              {liveText && liveText.trim() 
                ? liveText 
                : 'Acompáñanos ahora mismo en nuestra transmisión en directo.'}
            </p>

            {/* Enlace para ver el directo */}
            <div className="mt-3">
              <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#c8a96b] to-[#dfb775] text-[#221815] font-bold text-xs hover:scale-105 active:scale-95 transition-all shadow-md shadow-[#c8a96b]/20"
              >
                <span>Ver transmisión</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {/* Botón cerrar */}
          <button
            onClick={() => setIsDismissed(true)}
            className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0"
            aria-label="Cerrar aviso de live"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
