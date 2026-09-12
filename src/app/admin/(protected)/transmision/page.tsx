"use client";

import React, { useCallback } from 'react';
import { useLiveAdmin } from '@/hooks/use-live-signalr';
import { 
  Radio, Wifi, WifiOff, Eye, Heart, MessageCircle, 
  Send, Tv, MonitorOff, Sparkles
} from 'lucide-react';
import { NewFeatureBadge } from '@/components/admin/shared/NewFeatureBadge';

export default function TransmisionPage() {
  const {
    isConnected,
    error,
    liveText,
    setLiveText,
    isLiveTextActive,
    toggleLiveText,
    isTikTokActive,
    tikTokUsername,
    setTikTokUsername,
    viewerCount,
    totalLikes,
    comments,
    streamLiveText,
    toggleTikTokLive,
  } = useLiveAdmin();

  // Emitir cada pulsación de tecla al backend
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setLiveText(text);
    streamLiveText(text);
  }, [setLiveText, streamLiveText]);

  // Toggle Live Text
  const handleLiveTextToggle = useCallback(() => {
    toggleLiveText(!isLiveTextActive);
  }, [isLiveTextActive, toggleLiveText]);

  // Toggle TikTok
  const handleTikTokToggle = useCallback(() => {
    toggleTikTokLive(!isTikTokActive, '@AuraNova_Oficial');
  }, [isTikTokActive, toggleTikTokLive]);

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center shadow-md">
            <Radio size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-brown flex items-center gap-2">
              Consola de Transmisión
              <NewFeatureBadge label="LIVE" size="sm" />
            </h1>
            <p className="text-sage text-sm">Transmite mensajes y gestiona el directo de TikTok</p>
          </div>
        </div>

        {/* Indicador de conexión */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${
          isConnected 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
            : 'bg-red-50 border-red-200 text-red-600'
        }`}>
          {isConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
          {isConnected ? 'Hub conectado' : 'Desconectado'}
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* ─── COLUMNA PRINCIPAL ─── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Card: Texto en Vivo */}
          <div className="bg-white p-6 sm:p-8 rounded-[24px] shadow-sm border border-sage/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/5 to-transparent rounded-bl-full pointer-events-none" />
            
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <Send size={16} className="text-red-500" />
              </div>
              <h2 className="font-serif font-bold text-lg text-brown mr-auto">Anuncio en Vivo</h2>
              
              <div className="flex items-center gap-4 bg-[#FAFAFA] border border-sage/15 px-3 py-1.5 rounded-full">
                <span className={`text-xs font-bold ${isLiveTextActive ? 'text-red-500' : 'text-sage'}`}>
                  {isLiveTextActive ? 'COMPUERTA ABIERTA' : 'CERRADO'}
                </span>
                <button
                  onClick={handleLiveTextToggle}
                  disabled={!isConnected}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                    isLiveTextActive 
                      ? 'bg-red-500 focus:ring-red-400' 
                      : 'bg-sage/30 focus:ring-sage'
                  } disabled:opacity-50`}
                >
                  <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${
                    isLiveTextActive ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>

            <textarea
              value={liveText}
              onChange={handleTextChange}
              placeholder="Escribe aquí y los clientes lo verán en tiempo real..."
              rows={4}
              className={`w-full bg-[#FAFAFA] border rounded-2xl px-5 py-4 text-brown font-serif text-base placeholder:text-sage/50 placeholder:italic focus:outline-none focus:ring-2 transition-all resize-none ${
                isLiveTextActive ? 'border-red-300 focus:ring-red-200 focus:border-red-300' : 'border-sage/15 focus:ring-gold/30 focus:border-gold/30 opacity-60'
              }`}
              disabled={!isConnected || !isLiveTextActive}
            />

            <p className="mt-3 text-xs text-sage/60">
              <Sparkles size={12} className="inline mr-1 text-gold" />
              {isLiveTextActive 
                ? "La compuerta está ABIERTA. Lo que escribas se transmitirá instantáneamente." 
                : "Abre la compuerta para transmitir. Si está cerrada, el frontend no mandará nada."}
            </p>

            {/* Preview de cómo se ve */}
            {liveText.trim() && (
              <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-[#4a3933] via-[#5c4a42] to-[#4a3933] text-[#faf7f2]">
                <p className="text-[10px] uppercase tracking-widest text-[#c8a96b] font-bold mb-1">Vista previa del banner público</p>
                <p className="text-sm font-serif italic">
                  {liveText}
                  <span className="inline-block w-[2px] h-3.5 bg-[#c8a96b] ml-0.5 animate-pulse align-text-bottom" />
                </p>
              </div>
            )}
          </div>

          {/* Card: Control TikTok */}
          <div className="bg-white p-6 sm:p-8 rounded-[24px] shadow-sm border border-sage/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-500/5 to-cyan-500/5 rounded-bl-full pointer-events-none" />
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff0050]/10 to-[#00f2ea]/10 flex items-center justify-center">
                {isTikTokActive ? <Tv size={16} className="text-[#ff0050]" /> : <MonitorOff size={16} className="text-sage" />}
              </div>
              <h2 className="font-serif font-bold text-lg text-brown">TikTok Live</h2>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              {/* Toggle */}
              <button
                onClick={handleTikTokToggle}
                disabled={!isConnected}
                className={`relative w-14 h-8 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isTikTokActive 
                    ? 'bg-gradient-to-r from-[#ff0050] to-[#00f2ea] focus:ring-[#ff0050]' 
                    : 'bg-sage/30 focus:ring-sage'
                } disabled:opacity-50`}
              >
                <span className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${
                  isTikTokActive ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>

              <span className={`text-sm font-bold ${isTikTokActive ? 'text-[#ff0050]' : 'text-sage'}`}>
                {isTikTokActive ? '🔴 EN DIRECTO' : 'Apagado'}
              </span>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-[#FAFAFA] border border-sage/15">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-brown">Usuario Fijo</p>
                  <p className="text-sm font-mono text-sage mt-1">@AuraNova_Oficial</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff0050]/10 to-[#00f2ea]/10 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-brown">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.52a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.71a8.24 8.24 0 0 0 4.76 1.52V6.78a4.83 4.83 0 0 1-1-.09z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── COLUMNA LATERAL ─── */}
        <div className="space-y-6">

          {/* Stats Card */}
          <div className="bg-white p-6 rounded-[24px] shadow-sm border border-sage/10">
            <h3 className="font-serif font-bold text-brown mb-5 flex items-center gap-2">
              <Eye size={16} className="text-gold" /> Estadísticas en Vivo
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#FAFAFA] rounded-2xl p-4 text-center border border-sage/8">
                <Eye size={20} className="mx-auto text-sage/50 mb-2" />
                <p className="text-2xl font-serif font-bold text-brown tabular-nums">{viewerCount.toLocaleString()}</p>
                <p className="text-[10px] uppercase tracking-widest text-sage font-bold mt-1">Espectadores</p>
              </div>
              <div className="bg-[#FAFAFA] rounded-2xl p-4 text-center border border-sage/8">
                <Heart size={20} className="mx-auto text-[#ff0050]/50 mb-2" />
                <p className="text-2xl font-serif font-bold text-brown tabular-nums">{totalLikes.toLocaleString()}</p>
                <p className="text-[10px] uppercase tracking-widest text-sage font-bold mt-1">Likes</p>
              </div>
            </div>
          </div>

          {/* Chat de Comentarios */}
          <div className="bg-white p-6 rounded-[24px] shadow-sm border border-sage/10">
            <h3 className="font-serif font-bold text-brown mb-4 flex items-center gap-2">
              <MessageCircle size={16} className="text-gold" /> 
              Chat de TikTok
              <span className="ml-auto text-xs text-sage/50 font-normal">{comments.length}</span>
            </h3>

            <div className="h-72 overflow-y-auto space-y-2.5 pr-1">
              {comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-sage/40 text-sm">
                  <MessageCircle size={28} className="mb-2 opacity-30" />
                  <p>Sin comentarios aún</p>
                </div>
              ) : (
                comments.map((c, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 px-3 py-2 rounded-xl hover:bg-[#FAFAFA] transition-colors">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#ff0050]/20 to-[#00f2ea]/20 flex items-center justify-center shrink-0 text-[10px] font-bold text-brown overflow-hidden">
                      {c.userAvatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.userAvatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        c.username.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[11px] font-bold text-brown">{c.username}</span>
                      <p className="text-xs text-sage break-words">{c.comment}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
