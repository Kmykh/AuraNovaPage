"use client";

import React, { useCallback } from 'react';
import Link from 'next/link';
import { useLiveAdmin } from '@/hooks/use-live-signalr';
import { 
  Radio, Wifi, WifiOff, Send, Tv, MonitorOff, Sparkles, 
  ExternalLink, Eye, Flame, Settings
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
    streamLiveText,
    toggleTikTokLive,
  } = useLiveAdmin();

  // Emitir cada pulsación de tecla al backend en tiempo real
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setLiveText(text);
    streamLiveText(text);
  }, [setLiveText, streamLiveText]);

  // Toggle Compuerta de Texto en Vivo
  const handleLiveTextToggle = useCallback(() => {
    toggleLiveText(!isLiveTextActive);
  }, [isLiveTextActive, toggleLiveText]);

  // Toggle TikTok Live
  const handleTikTokToggle = useCallback(() => {
    toggleTikTokLive(!isTikTokActive, null);
  }, [isTikTokActive, toggleTikTokLive]);

  const username = tikTokUsername ? tikTokUsername.replace(/^@/, '') : 'aura.nova40';

  return (
    <div className="space-y-8 max-w-5xl">
      {/* ─── HEADER ─── */}
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
            <p className="text-sage text-sm">Transmite mensajes y activa el directo de TikTok en la tienda</p>
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
                  aria-label="Abrir o cerrar compuerta"
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

            {/* Preview de cómo se ve el banner */}
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
                aria-label="Activar o desactivar TikTok Live"
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
                  <p className="text-xs font-bold uppercase tracking-widest text-brown">Usuario En Uso</p>
                  <p className="text-sm font-mono text-sage mt-1">@{username}</p>
                </div>
                <Link 
                  href="/admin/configuracion" 
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff0050]/10 to-[#00f2ea]/10 flex items-center justify-center hover:scale-105 transition-transform"
                  title="Configurar en Ajustes"
                >
                  <Settings size={18} className="text-brown" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ─── COLUMNA LATERAL: Vista previa del aviso en la tienda ─── */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[24px] shadow-sm border border-sage/10 space-y-4">
            <h3 className="font-serif font-bold text-brown flex items-center gap-2 text-base">
              <Eye size={16} className="text-gold" /> Aviso en Esquina Inferior
            </h3>
            
            <p className="text-xs text-sage leading-relaxed">
              Así es como tus clientes ven el aviso flotante de TikTok Live con ofertas en la esquina inferior derecha:
            </p>

            {/* Mockup visual del aviso */}
            <div className="p-4 rounded-2xl bg-stone-100 border border-stone-200">
              <div className="w-full bg-[#1a1412] text-white rounded-xl p-3.5 shadow-xl border border-[#ff0050]/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-black text-white">TikTok LIVE</span>
                    <span className="bg-red-500 text-white text-[8px] font-bold px-1 rounded-full">
                      ¡EN VIVO!
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-stone-400">@{username}</span>
                </div>

                <div className="flex items-center gap-1 text-amber-400 text-[11px] font-bold">
                  <Flame size={12} className="text-[#ff0050]" />
                  <span>¡Ofertas y descuentos en directo!</span>
                </div>

                <p className="text-[10px] text-stone-300 leading-tight">
                  Estamos transmitiendo en vivo por TikTok. Únete para ver ofertas exclusivas.
                </p>

                <div className="w-full py-1.5 rounded-lg bg-gradient-to-r from-[#ff0050] to-[#00f2ea] text-white font-bold text-[10px] text-center">
                  Ir al TikTok LIVE ↗
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/"
                target="_blank"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#ff0050] hover:text-brown transition-colors"
              >
                <span>Ver tienda pública</span>
                <ExternalLink size={12} />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
