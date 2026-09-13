"use client";

import React, { useState, useEffect } from 'react';
import { useLivePublic } from '@/hooks/use-live-signalr';
import { ExternalLink, X, Radio } from 'lucide-react';

/**
 * Componente público que muestra el aviso y mensaje de TikTok LIVE
 * Visible en toda la tienda cuando la transmisión está activa o cuando hay un anuncio en vivo.
 */
export function LiveOverlay() {
  const {
    liveText,
    isLiveActive,
    tikTokUsername,
  } = useLivePublic();

  const [isDismissed, setIsDismissed] = useState(false);

  // Si cambia el estado de live o llega un nuevo mensaje, restauramos la visibilidad
  useEffect(() => {
    if (isLiveActive || (liveText && liveText.trim())) {
      setIsDismissed(false);
    }
  }, [isLiveActive, liveText]);

  const hasLiveMessage = Boolean(liveText && liveText.trim());
  const shouldShow = (isLiveActive || hasLiveMessage) && !isDismissed;

  if (!shouldShow) return null;

  const username = tikTokUsername ? tikTokUsername.replace(/^@/, '') : 'aura.nova40';
  const tikTokUrl = `https://www.tiktok.com/@${username}/live`;

  return (
    <aside 
      aria-label="Aviso de transmisión en vivo en TikTok" 
      className="fixed top-20 sm:top-24 left-1/2 -translate-x-1/2 w-[94%] sm:w-auto z-[75] max-w-[520px] animate-in slide-in-from-top-4 fade-in duration-300 font-sans"
    >
      <div className="bg-[#1c1310]/95 text-white backdrop-blur-2xl p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] border-2 border-[#ff0050]/40 relative overflow-hidden">
        
        {/* Luces decorativas de TikTok (cyan y magenta) */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#ff0050]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#00f2ea]/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-start gap-3.5 relative z-10">
          
          {/* Logo animado de TikTok + punto rojo pulsante */}
          <div className="flex flex-col items-center shrink-0 mt-0.5">
            <div className="w-10 h-10 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-center relative shadow-inner">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.52a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.71a8.24 8.24 0 0 0 4.76 1.52V6.78a4.83 4.83 0 0 1-1-.09z"/>
              </svg>
              {/* Badge LIVE rojo sobre el icono */}
              <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-80" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
              </span>
            </div>
          </div>

          {/* Contenido */}
          <div className="flex-1 min-w-0 pr-1">
            
            {/* Header del aviso */}
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] font-black uppercase tracking-wider">
                <Radio size={12} className="animate-pulse" />
                EN VIVO EN TIKTOK
              </span>
              <span className="text-[11px] font-mono text-[#00f2ea] font-semibold">
                @{username}
              </span>
            </div>

            {/* Mensaje del Live */}
            <div className="mt-1.5">
              {hasLiveMessage ? (
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-sm font-serif italic text-[#faf7f2] leading-snug break-words">
                    &ldquo;{liveText}&rdquo;
                  </p>
                </div>
              ) : (
                <p className="text-xs text-stone-200 leading-relaxed font-medium">
                  ¡Aura Nova está transmitiendo en directo en TikTok! Acompáñanos ahora mismo para ver promociones y lanzamientos exclusivos.
                </p>
              )}
            </div>

            {/* Botón para ir al directo */}
            <div className="mt-3">
              <a
                href={tikTokUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#ff0050] to-[#00f2ea] text-white font-extrabold text-xs shadow-lg shadow-[#ff0050]/20 hover:scale-105 active:scale-95 transition-all"
              >
                <span>Ver en TikTok LIVE</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>

          {/* Botón de cerrar */}
          <button
            onClick={() => setIsDismissed(true)}
            className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0"
            title="Cerrar aviso"
            aria-label="Cerrar aviso de live"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
