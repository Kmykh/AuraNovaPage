"use client";

import React, { useState } from 'react';
import { ExternalLink, X, Flame, ChevronDown, ChevronUp } from 'lucide-react';

interface TikTokLiveNoticeProps {
  isActive: boolean;
  tikTokUsername: string | null;
}

export function TikTokLiveNotice({
  isActive,
  tikTokUsername,
}: TikTokLiveNoticeProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // Al activarse el live, restauramos la visibilidad automáticamente
  React.useEffect(() => {
    if (isActive) {
      setIsDismissed(false);
      setIsExpanded(true);
    }
  }, [isActive]);

  if (!isActive || isDismissed) return null;

  const username = tikTokUsername ? tikTokUsername.replace(/^@/, '') : 'aura.nova40';
  const liveUrl = `https://www.tiktok.com/@${username}/live`;

  return (
    <div className="fixed bottom-6 right-6 z-[55] flex flex-col items-end gap-2 animate-in slide-in-from-bottom-4 fade-in duration-500 font-sans select-none">
      
      {/* Tarjeta expandida del aviso */}
      {isExpanded && (
        <div className="w-[300px] sm:w-[330px] bg-[#1a1412]/95 text-white backdrop-blur-2xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-2 border-[#ff0050]/50 p-4 relative overflow-hidden animate-in zoom-in-95 duration-200">
          
          {/* Luces decorativas */}
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#ff0050]/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-[#00f2ea]/15 rounded-full blur-2xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between gap-2 mb-2.5 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-black/60 border border-white/10 flex items-center justify-center text-white">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.52a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.71a8.24 8.24 0 0 0 4.76 1.52V6.78a4.83 4.83 0 0 1-1-.09z"/>
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-white text-xs font-black tracking-wide">TikTok LIVE</span>
                  <span className="bg-red-500 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full animate-pulse leading-normal">
                    ¡EN VIVO!
                  </span>
                </div>
                <span className="text-white/60 text-[10px] font-mono leading-none">@{username}</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsExpanded(false)}
                className="text-stone-400 hover:text-white p-1 rounded transition-colors"
                title="Minimizar aviso"
                aria-label="Minimizar aviso"
              >
                <ChevronDown size={16} />
              </button>
              <button
                onClick={() => setIsDismissed(true)}
                className="text-stone-400 hover:text-white p-1 rounded transition-colors"
                title="Cerrar aviso"
                aria-label="Cerrar aviso"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Mensaje de oferta y transmisión */}
          <div className="space-y-2 mb-3 relative z-10">
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
              <Flame size={14} className="animate-bounce text-[#ff0050]" />
              <span>¡Ofertas y descuentos en directo!</span>
            </div>
            <p className="text-xs text-stone-300 leading-snug">
              Estamos transmitiendo en vivo por TikTok. Únete ahora para ver promociones exclusivas y responder a tus pedidos.
            </p>
          </div>

          {/* Botón directo a la transmisión */}
          <a
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-[#ff0050] to-[#00f2ea] text-white font-black text-xs shadow-md shadow-[#ff0050]/20 hover:scale-[1.02] active:scale-[0.98] transition-all relative z-10"
          >
            <span>Ir al TikTok LIVE</span>
            <ExternalLink size={13} />
          </a>
        </div>
      )}

      {/* Píldora compacta / botón flotante */}
      {!isExpanded && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-[#1a1412]/95 backdrop-blur-xl border border-[#ff0050]/40 shadow-lg text-white hover:scale-105 transition-transform"
            aria-label="Expandir aviso de TikTok Live"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-80" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <span className="text-xs font-bold text-red-400">🔴 EN LIVE TIKTOK</span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold">¡OFERTAS!</span>
            <ChevronUp size={14} className="text-stone-400" />
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            className="w-7 h-7 rounded-full bg-[#1a1412]/80 text-stone-400 hover:text-white flex items-center justify-center border border-white/10 transition-colors"
            title="Cerrar aviso"
            aria-label="Cerrar aviso"
          >
            <X size={13} />
          </button>
        </div>
      )}

    </div>
  );
}
