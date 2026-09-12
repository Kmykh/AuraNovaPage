"use client";

import React, { useState } from 'react';
import { Eye, Heart, ChevronDown, ChevronUp, MessageCircle, X } from 'lucide-react';
import type { TikTokComment } from '@/types/live';

interface TikTokLiveWidgetProps {
  isActive: boolean;
  tikTokUsername: string | null;
  viewerCount: number;
  totalLikes: number;
  comments: TikTokComment[];
}

export function TikTokLiveWidget({
  isActive,
  tikTokUsername,
  viewerCount,
  totalLikes,
  comments,
}: TikTokLiveWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (!isActive || isDismissed) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[55] flex flex-col items-end gap-2 animate-in slide-in-from-bottom-4 fade-in duration-500">
      
      {/* Panel de Chat expandible */}
      {isExpanded && (
        <div className="w-80 sm:w-96 bg-[#1a1a1a]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden animate-in slide-in-from-bottom-2 duration-300">
          
          {/* Header del Chat */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#ff0050]/20 to-[#00f2ea]/20 border-b border-white/10">
            <div className="flex items-center gap-2">
              {/* TikTok Icon SVG */}
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.52a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.71a8.24 8.24 0 0 0 4.76 1.52V6.78a4.83 4.83 0 0 1-1-.09z"/>
              </svg>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-bold">TikTok LIVE</span>
                  <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded animate-pulse">¡EN VIVO!</span>
                </div>
                {tikTokUsername && (
                  <span className="text-white/50 text-xs">@{tikTokUsername}</span>
                )}
              </div>
            </div>
            <button 
              onClick={() => setIsExpanded(false)} 
              className="text-white/50 hover:text-white transition-colors p-1"
              aria-label="Minimizar chat"
            >
              <ChevronDown size={18} />
            </button>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5 text-white/70 text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Eye size={13} />
                <span className="font-bold text-white">{viewerCount.toLocaleString()}</span>
                <span>viendo</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Heart size={13} className="text-[#ff0050]" />
                <span className="font-bold text-white">{totalLikes.toLocaleString()}</span>
              </div>
            </div>
            
            {/* Botón Visitar Directo */}
            <a 
              href={tikTokUsername ? `https://www.tiktok.com/@${tikTokUsername}/live` : 'https://www.tiktok.com'}
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-[#ff0050] to-[#00f2ea] text-white font-bold text-[10px] px-3 py-1 rounded-full hover:scale-105 active:scale-95 transition-transform"
            >
              Ir a la App
            </a>
          </div>

          {/* Lista de Comentarios */}
          <div className="h-64 overflow-y-auto px-3 py-2 space-y-2 scrollbar-thin scrollbar-thumb-white/10">
            {comments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-white/30 text-sm">
                <MessageCircle size={28} className="mb-2 opacity-40" />
                <p>Esperando comentarios...</p>
              </div>
            ) : (
              comments.map((c, idx) => (
                <div key={idx} className="flex items-start gap-2.5 group animate-in fade-in slide-in-from-bottom-1 duration-200">
                  {/* Avatar */}
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#ff0050] to-[#00f2ea] flex items-center justify-center shrink-0 overflow-hidden">
                    {c.userAvatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.userAvatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white text-[10px] font-bold">
                        {c.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-bold text-[#00f2ea] mr-1.5">{c.username}</span>
                    <span className="text-xs text-white/80 break-words">{c.comment}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Botón Flotante Principal */}
      <div className="flex items-center gap-2">
        {/* Pill con stats */}
        <div className="bg-[#1a1a1a]/90 backdrop-blur-xl rounded-full px-3 py-2 flex items-center gap-3 border border-white/10 shadow-lg">
          <div className="flex items-center gap-1 text-white/80 text-xs">
            <Eye size={13} />
            <span className="font-bold text-white tabular-nums">{viewerCount.toLocaleString()}</span>
          </div>
          <div className="w-px h-3 bg-white/15" />
          <div className="flex items-center gap-1 text-white/80 text-xs">
            <Heart size={13} className="text-[#ff0050]" />
            <span className="font-bold text-white tabular-nums">{totalLikes.toLocaleString()}</span>
          </div>
        </div>

        {/* Botón circular principal */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="relative w-14 h-14 rounded-full bg-gradient-to-br from-[#ff0050] to-[#00f2ea] shadow-lg shadow-[#ff0050]/30 flex items-center justify-center group hover:scale-105 active:scale-95 transition-transform"
          aria-label={isExpanded ? 'Minimizar TikTok Live' : 'Ver TikTok Live'}
        >
          {/* Anillo pulsante */}
          <span className="absolute inset-0 rounded-full border-2 border-[#ff0050]/50 animate-ping opacity-50" />
          
          {isExpanded ? (
            <ChevronDown size={22} className="text-white" />
          ) : (
            <ChevronUp size={22} className="text-white" />
          )}
          
          {/* Badge LIVE */}
          <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full leading-none shadow-md">
            LIVE
          </span>
        </button>

        {/* Botón cerrar */}
        <button
          onClick={() => setIsDismissed(true)}
          className="w-7 h-7 rounded-full bg-black/50 backdrop-blur text-white/50 hover:text-white hover:bg-black/70 flex items-center justify-center transition-colors"
          aria-label="Cerrar widget de TikTok"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
}
