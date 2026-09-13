"use client";

import React, { useState } from 'react';
import { Radio, ChevronDown, ChevronUp, X, ExternalLink, Sparkles, Tv2, VideoOff } from 'lucide-react';

interface LiveStatusWidgetProps {
  isActive: boolean;
  tikTokUsername?: string | null;
}

export function LiveStatusWidget({
  isActive,
  tikTokUsername,
}: LiveStatusWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const liveUrl = tikTokUsername 
    ? `https://www.tiktok.com/@${tikTokUsername}/live` 
    : 'https://www.tiktok.com/@aura.nova40';

  return (
    <div className="fixed bottom-6 right-6 z-[55] flex flex-col items-end gap-2 font-sans select-none animate-in slide-in-from-bottom-4 fade-in duration-500">
      
      {/* ─── CARD EXPANDIDA ─── */}
      {isExpanded && (
        <div className="w-[320px] sm:w-[360px] bg-[#221815]/95 backdrop-blur-2xl text-[#faf7f2] rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] border border-[#c8a96b]/30 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-2 duration-300">
          
          {/* Fondo decorativo de luz ambiental */}
          <div 
            className={`absolute -top-12 -right-12 w-36 h-36 rounded-full blur-3xl pointer-events-none ${
              isActive ? 'bg-red-500/20' : 'bg-[#c8a96b]/15'
            }`} 
          />

          {/* Header */}
          <div className="relative z-10 px-5 pt-4 pb-3 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isActive 
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                  : 'bg-white/10 text-stone-400 border border-white/10'
              }`}>
                {isActive ? <Radio size={16} className="animate-pulse" /> : <VideoOff size={15} />}
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-white tracking-wide">
                  Aura Nova Live
                </h4>
                <p className="text-[10px] uppercase tracking-widest text-[#c8a96b] font-semibold">
                  {isActive ? 'Transmisión Oficial' : 'Canal de Directos'}
                </p>
              </div>
            </div>

            <button 
              onClick={() => setIsExpanded(false)}
              className="text-stone-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Minimizar aviso"
            >
              <ChevronDown size={18} />
            </button>
          </div>

          {/* Cuerpo */}
          <div className="relative z-10 p-5 space-y-4">
            {isActive ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                  </span>
                  <span className="text-xs font-bold tracking-wider uppercase text-red-400">
                    Estamos en directo ahora
                  </span>
                </div>

                <p className="text-sm font-serif italic text-stone-200 leading-relaxed">
                  &ldquo;Acompáñanos en vivo para conocer nuestras últimas piezas, promociones exclusivas y charlar con nosotros.&rdquo;
                </p>

                {/* Botón para ver la transmisión */}
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#c8a96b] to-[#e4c98c] hover:from-[#d6b779] hover:to-[#edd69f] text-[#221815] font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#c8a96b]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Tv2 size={15} />
                  <span>Ver transmisión en vivo</span>
                  <ExternalLink size={13} className="opacity-75 ml-0.5" />
                </a>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-stone-500" />
                  <span className="text-xs font-semibold tracking-wider uppercase text-stone-400">
                    Fuera del aire
                  </span>
                </div>

                <p className="text-sm text-stone-300 leading-relaxed">
                  Actualmente no tenemos ninguna transmisión en vivo activa. ¡Te esperamos muy pronto en nuestro próximo directo!
                </p>

                <div className="bg-white/5 rounded-xl p-3 border border-white/5 flex items-center gap-3">
                  <Sparkles size={16} className="text-[#c8a96b] shrink-0" />
                  <p className="text-xs text-stone-300">
                    Síguenos en nuestras redes para enterarte de cuándo iniciamos el directo.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ─── BOTÓN / PÍLDORA FLOTANTE (ESTADO COMPACTO) ─── */}
      <div className="flex items-center gap-2">
        
        {/* Píldora principal */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-full backdrop-blur-xl border shadow-xl transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] ${
            isActive
              ? 'bg-[#221815]/95 text-white border-red-500/40 shadow-red-950/40 hover:border-red-500'
              : 'bg-[#221815]/90 text-stone-200 border-[#c8a96b]/25 shadow-black/30 hover:border-[#c8a96b]/50'
          }`}
          aria-label={isActive ? 'Aviso: En Vivo activo' : 'Aviso: Fuera del aire'}
        >
          {/* Indicador luminoso */}
          <div className="flex items-center justify-center shrink-0">
            {isActive ? (
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
              </span>
            ) : (
              <span className="h-2.5 w-2.5 rounded-full bg-stone-400" />
            )}
          </div>

          {/* Texto de estado */}
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <span className={`text-[11px] font-black uppercase tracking-wider leading-none ${
                isActive ? 'text-red-400' : 'text-[#c8a96b]'
              }`}>
                {isActive ? '🔴 EN VIVO' : 'FUERA DEL AIRE'}
              </span>
            </div>
            <span className="text-[10px] text-stone-300 font-medium leading-tight">
              {isActive ? 'Aura Nova en directo' : 'Transmisión offline'}
            </span>
          </div>

          {/* Icono abrir/cerrar */}
          <div className="text-stone-400 ml-1">
            {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </div>
        </button>

        {/* Botón para cerrar o descartar */}
        <button
          onClick={() => setIsDismissed(true)}
          className="w-8 h-8 rounded-full bg-[#221815]/80 backdrop-blur text-stone-400 hover:text-white hover:bg-[#221815] flex items-center justify-center border border-white/10 transition-colors shadow-md"
          title="Ocultar aviso"
          aria-label="Cerrar widget de transmisión"
        >
          <X size={14} />
        </button>
      </div>

    </div>
  );
}
