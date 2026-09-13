"use client";

import React, { useCallback } from 'react';
import Link from 'next/link';
import { useLiveAdmin } from '@/hooks/use-live-signalr';
import { 
  Radio, Wifi, WifiOff, Send, Sparkles, 
  Tv2, VideoOff, ExternalLink, Settings, ShieldCheck, Eye
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
    isTikTokActive: isLiveActive,
    tikTokUsername,
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

  // Toggle Estado de Transmisión En Vivo
  const handleLiveStreamToggle = useCallback(() => {
    toggleTikTokLive(!isLiveActive, null);
  }, [isLiveActive, toggleTikTokLive]);

  return (
    <div className="space-y-8 max-w-5xl">
      {/* ─── HEADER ─── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#4a3933] to-[#2d221e] flex items-center justify-center shadow-lg border border-[#c8a96b]/30">
            <Radio size={22} className="text-[#c8a96b]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-brown flex items-center gap-2">
              Consola de Transmisión
              <NewFeatureBadge label="LIVE" size="sm" />
            </h1>
            <p className="text-sage text-sm">
              Controla el estado en vivo de la tienda y comunica anuncios en tiempo real
            </p>
          </div>
        </div>

        {/* Indicador de conexión SignalR */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide border shadow-sm ${
          isConnected 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
            : 'bg-rose-50 border-rose-200 text-rose-600'
        }`}>
          {isConnected ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <Wifi size={14} />
              <span>Sincronizado en tiempo real</span>
            </>
          ) : (
            <>
              <WifiOff size={14} />
              <span>Desconectado del Hub</span>
            </>
          )}
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* ─── COLUMNA PRINCIPAL (2 cols) ─── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Card: Interruptor de Estado En Vivo / Fuera del Aire */}
          <div className="bg-white p-6 sm:p-8 rounded-[28px] shadow-sm border border-sage/15 relative overflow-hidden">
            <div 
              className={`absolute top-0 right-0 w-48 h-48 rounded-bl-full pointer-events-none transition-all duration-500 ${
                isLiveActive 
                  ? 'bg-gradient-to-br from-red-500/10 to-transparent' 
                  : 'bg-gradient-to-br from-stone-500/5 to-transparent'
              }`} 
            />

            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${
                  isLiveActive 
                    ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                    : 'bg-stone-100 text-stone-500 border border-stone-200'
                }`}>
                  {isLiveActive ? <Radio size={20} className="animate-pulse" /> : <VideoOff size={20} />}
                </div>
                <div>
                  <h2 className="font-serif font-bold text-lg sm:text-xl text-brown">
                    Estado de la Tienda
                  </h2>
                  <p className="text-xs text-sage">
                    Determina qué aviso ven tus clientes en la web
                  </p>
                </div>
              </div>

              {/* Estado badge */}
              <div className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase border ${
                isLiveActive 
                  ? 'bg-red-50 border-red-200 text-red-600' 
                  : 'bg-stone-100 border-stone-200 text-stone-500'
              }`}>
                {isLiveActive ? '🔴 En Directo' : 'Fuera del Aire'}
              </div>
            </div>

            {/* Gran botón de activación / desactivación */}
            <div className={`p-5 rounded-2xl border transition-all duration-300 ${
              isLiveActive 
                ? 'bg-red-500/5 border-red-500/20' 
                : 'bg-[#FAFAFA] border-sage/15'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-brown flex items-center gap-2">
                    {isLiveActive ? (
                      <>
                        <span className="text-red-500">● Transmisión Activada</span>
                      </>
                    ) : (
                      <>
                        <span className="text-stone-500">○ Transmisión Inactiva</span>
                      </>
                    )}
                  </p>
                  <p className="text-xs text-sage leading-relaxed max-w-md">
                    {isLiveActive 
                      ? 'Los clientes en tu tienda ven la notificación flotante "🔴 EN VIVO" con el enlace para unirse al directo.' 
                      : 'Los clientes ven la notificación "FUERA DEL AIRE", informando que no hay un directo en este momento.'}
                  </p>
                </div>

                <button
                  onClick={handleLiveStreamToggle}
                  disabled={!isConnected}
                  className={`relative inline-flex h-9 w-16 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${
                    isLiveActive 
                      ? 'bg-red-500 focus:ring-red-400' 
                      : 'bg-stone-300 focus:ring-stone-400'
                  }`}
                  aria-label="Cambiar estado de transmisión"
                >
                  <span
                    className={`pointer-events-none inline-block h-8 w-8 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${
                      isLiveActive ? 'translate-x-7' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Canal vinculado de transmisión */}
            <div className="mt-5 pt-5 border-t border-sage/10 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-sage">
                <Tv2 size={15} className="text-[#c8a96b]" />
                <span>Canal / Usuario configurado:</span>
                <span className="font-bold text-brown font-mono">
                  {tikTokUsername ? `@${tikTokUsername}` : '@aura.nova40'}
                </span>
              </div>

              <Link 
                href="/admin/configuracion" 
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#c8a96b] hover:text-[#4a3933] transition-colors"
              >
                <Settings size={13} />
                <span>Gestionar en Ajustes</span>
              </Link>
            </div>
          </div>

          {/* Card: Texto en Vivo / Anuncio en tiempo real */}
          <div className="bg-white p-6 sm:p-8 rounded-[28px] shadow-sm border border-sage/15 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#c8a96b]/10 to-transparent rounded-bl-full pointer-events-none" />
            
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-[#c8a96b]/15 text-[#4a3933] flex items-center justify-center shrink-0 border border-[#c8a96b]/25">
                <Send size={18} className="text-[#c8a96b]" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-lg sm:text-xl text-brown">
                  Anuncio en Vivo
                </h2>
                <p className="text-xs text-sage">
                  Escribe un mensaje que tus clientes verán en tiempo real arriba
                </p>
              </div>
              
              <div className="ml-auto flex items-center gap-3 bg-[#FAFAFA] border border-sage/15 px-3 py-1.5 rounded-full">
                <span className={`text-[11px] font-bold ${isLiveTextActive ? 'text-red-500' : 'text-sage'}`}>
                  {isLiveTextActive ? 'COMPUERTA ABIERTA' : 'CERRADO'}
                </span>
                <button
                  onClick={handleLiveTextToggle}
                  disabled={!isConnected}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none ${
                    isLiveTextActive 
                      ? 'bg-red-500' 
                      : 'bg-stone-300'
                  } disabled:opacity-50`}
                  aria-label="Abrir o cerrar compuerta de texto"
                >
                  <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${
                    isLiveTextActive ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>

            <textarea
              value={liveText}
              onChange={handleTextChange}
              placeholder="Escribe aquí un anuncio importante (ej: ¡20% de descuento durante el directo!)..."
              rows={4}
              className={`w-full bg-[#FAFAFA] border rounded-2xl px-5 py-4 text-brown font-serif text-base placeholder:text-sage/50 placeholder:italic focus:outline-none focus:ring-2 transition-all resize-none ${
                isLiveTextActive 
                  ? 'border-red-300 focus:ring-red-200 focus:border-red-300' 
                  : 'border-sage/15 focus:ring-gold/30 focus:border-gold/30 opacity-70'
              }`}
              disabled={!isConnected || !isLiveTextActive}
            />

            <p className="mt-3 text-xs text-sage/70">
              <Sparkles size={12} className="inline mr-1 text-[#c8a96b]" />
              {isLiveTextActive 
                ? "La compuerta está abierta. Cada palabra que escribas se refleja instantáneamente en la tienda." 
                : "Abre la compuerta para transmitir. Si está cerrada, ningún cambio de texto se enviará a los clientes."}
            </p>

            {/* Vista previa del banner */}
            {liveText.trim() && (
              <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#4a3933] to-[#2d221e] text-[#faf7f2] border border-[#c8a96b]/30 shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                  </span>
                  <p className="text-[10px] uppercase tracking-widest text-[#c8a96b] font-bold">
                    Vista previa del anuncio en la tienda
                  </p>
                </div>
                <p className="text-sm font-serif italic text-stone-100">
                  {liveText}
                  <span className="inline-block w-[2px] h-3.5 bg-[#c8a96b] ml-1 animate-pulse align-middle" />
                </p>
              </div>
            )}
          </div>

        </div>

        {/* ─── COLUMNA LATERAL (1 col): Vista Previa & Guía ─── */}
        <div className="space-y-6">

          {/* Vista previa de cómo lo ve el cliente */}
          <div className="bg-white p-6 rounded-[28px] shadow-sm border border-sage/15 space-y-4">
            <h3 className="font-serif font-bold text-brown flex items-center gap-2 text-base">
              <Eye size={18} className="text-[#c8a96b]" /> 
              Vista Previa en Tienda
            </h3>
            
            <p className="text-xs text-sage leading-relaxed">
              Así es exactamente como se visualiza el widget flotante para tus visitantes en este momento:
            </p>

            {/* Mockup del widget según el estado actual */}
            <div className="p-4 rounded-2xl bg-stone-100 border border-stone-200/80 flex flex-col items-center justify-center">
              <div className="w-full max-w-[280px] bg-[#221815] text-[#faf7f2] rounded-2xl p-4 shadow-xl border border-[#c8a96b]/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {isLiveActive ? (
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                      </span>
                    ) : (
                      <span className="h-2.5 w-2.5 rounded-full bg-stone-400" />
                    )}
                    <span className={`text-[10px] font-black uppercase tracking-wider ${
                      isLiveActive ? 'text-red-400' : 'text-[#c8a96b]'
                    }`}>
                      {isLiveActive ? '🔴 EN VIVO' : 'FUERA DEL AIRE'}
                    </span>
                  </div>

                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-white/10 text-stone-300">
                    Aura Nova
                  </span>
                </div>

                <p className="text-xs font-serif italic text-stone-200 mb-3">
                  {isLiveActive 
                    ? '¡Acompáñanos en directo y descubre novedades!' 
                    : 'Actualmente no hay transmisión en vivo activa.'}
                </p>

                {isLiveActive && (
                  <div className="w-full py-1.5 rounded-lg bg-gradient-to-r from-[#c8a96b] to-[#e4c98c] text-[#221815] font-bold text-[10px] text-center uppercase tracking-wider">
                    Ver transmisión en vivo ↗
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 text-[11px] text-sage">
              <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
              <span>Sincronización instantánea en todos los dispositivos.</span>
            </div>
          </div>

          {/* Guía rápida y recomendaciones */}
          <div className="bg-[#FAF8F5] p-6 rounded-[28px] border border-[#c8a96b]/20 space-y-3">
            <h4 className="font-serif font-bold text-brown text-sm flex items-center gap-1.5">
              <Sparkles size={15} className="text-[#c8a96b]" />
              ¿Cómo funciona?
            </h4>
            
            <ul className="text-xs text-brown/80 space-y-2.5 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-[#c8a96b] font-bold">•</span>
                <span>
                  <strong>Cuando vas a emitir:</strong> Activa el interruptor en esta pantalla. Los clientes verán la notificación elegante de que estás en vivo.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#c8a96b] font-bold">•</span>
                <span>
                  <strong>Al terminar tu directo:</strong> Apaga el interruptor para que el aviso vuelva a &quot;Fuera del Aire&quot;.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#c8a96b] font-bold">•</span>
                <span>
                  <strong>Anuncios en vivo:</strong> Puedes transmitir avisos de texto instantáneos mientras estás en directo abriendo la compuerta.
                </span>
              </li>
            </ul>

            <div className="pt-2">
              <Link
                href="/"
                target="_blank"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4a3933] hover:text-[#c8a96b] transition-colors"
              >
                <span>Visitar tienda pública</span>
                <ExternalLink size={12} />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
