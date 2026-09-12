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

  // Toggle TikTok
  const handleTikTokToggle = useCallback(() => {
    if (isTikTokActive) {
      toggleTikTokLive(false, null);
    } else {
      toggleTikTokLive(true, tikTokUsername || '@AuraNova_Oficial');
    }
  }, [isTikTokActive, tikTokUsername, toggleTikTokLive]);

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
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                <Send size={16} className="text-red-500" />
              </div>
              <h2 className="font-serif font-bold text-lg text-brown">Texto en Vivo</h2>
              {liveText.trim() && (
                <span className="ml-auto flex items-center gap-1.5 text-xs text-red-500 font-medium">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Emitiendo
                </span>
              )}
            </div>

            <textarea
              value={liveText}
              onChange={handleTextChange}
              placeholder="Escribe aquí y los clientes lo verán en tiempo real..."
              rows={4}
              className="w-full bg-[#FAFAFA] border border-sage/15 rounded-2xl px-5 py-4 text-brown font-serif text-base placeholder:text-sage/50 placeholder:italic focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/30 transition-all resize-none"
              disabled={!isConnected}
            />

            <p className="mt-3 text-xs text-sage/60">
              <Sparkles size={12} className="inline mr-1 text-gold" />
              Cada letra que escribas se transmite instantáneamente a todos los visitantes de la web.
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
                className={`relative w-16 h-9 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isTikTokActive 
                    ? 'bg-gradient-to-r from-[#ff0050] to-[#00f2ea] focus:ring-[#ff0050]' 
                    : 'bg-sage/20 focus:ring-sage'
                } disabled:opacity-50`}
              >
                <span className={`absolute top-1 w-7 h-7 bg-white rounded-full shadow-md transition-transform duration-300 ${
                  isTikTokActive ? 'translate-x-8' : 'translate-x-1'
                }`} />
              </button>

              <span className={`text-sm font-bold ${isTikTokActive ? 'text-[#ff0050]' : 'text-sage'}`}>
                {isTikTokActive ? '🔴 EN DIRECTO' : 'Apagado'}
              </span>
            </div>

            {/* Campo para el username de TikTok */}
            <div className="mt-5">
              <label className="block text-xs font-bold uppercase tracking-widest text-brown mb-2">
                Usuario de TikTok
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sage font-mono">@</span>
                <input
                  type="text"
                  value={tikTokUsername.replace(/^@/, '')}
                  onChange={(e) => setTikTokUsername(e.target.value.replace(/^@/, ''))}
                  placeholder="AuraNova_Oficial"
                  className="flex-1 bg-[#FAFAFA] border border-sage/15 rounded-xl px-4 py-2.5 text-sm text-brown placeholder:text-sage/40 focus:outline-none focus:ring-2 focus:ring-gold/30 transition-all"
                  disabled={isTikTokActive || !isConnected}
                />
              </div>
              {isTikTokActive && (
                <p className="mt-2 text-xs text-sage/60">
                  Desactiva el directo para cambiar el nombre de usuario.
                </p>
              )}
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
