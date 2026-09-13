"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLiveAdmin } from '@/hooks/use-live-signalr';
import { AuthSession } from '@/lib/auth-storage';
import { 
  Radio, Wifi, WifiOff, ExternalLink, ShieldAlert, 
  CheckCircle2, AlertCircle, Send, Sparkles, Settings
} from 'lucide-react';
import { NewFeatureBadge } from '@/components/admin/shared/NewFeatureBadge';

export default function TransmisionPage() {
  const {
    isConnected,
    error,
    liveText,
    setLiveText,
    isLiveActive,
    tikTokUsername,
    streamLiveText,
    toggleLiveStream,
  } = useLiveAdmin();

  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  useEffect(() => {
    setCurrentRole(AuthSession.getRole());
  }, []);

  useEffect(() => {
    if (liveText) {
      setMessageInput(liveText);
    }
  }, [liveText]);

  // Activar / Desactivar Live
  const handleToggle = async () => {
    setIsToggling(true);
    try {
      await toggleLiveStream(!isLiveActive);
    } finally {
      setIsToggling(false);
    }
  };

  // Transmitir mensaje
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    streamLiveText(messageInput);
    setSentSuccess(true);
    setTimeout(() => setSentSuccess(false), 2500);
  };

  const username = tikTokUsername ? tikTokUsername.replace(/^@/, '') : 'aura.nova40';

  return (
    <div className="space-y-8 max-w-3xl">
      {/* ─── ENCABEZADO ─── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#ff0050] to-[#00f2ea] flex items-center justify-center shadow-lg shadow-[#ff0050]/20">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.52a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.71a8.24 8.24 0 0 0 4.76 1.52V6.78a4.83 4.83 0 0 1-1-.09z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-brown flex items-center gap-2">
              Aviso de TikTok LIVE
              <NewFeatureBadge label="LIVE" size="sm" />
            </h1>
            <p className="text-sage text-sm">
              Activa o desactiva el aviso de transmisión y envía anuncios a tus clientes
            </p>
          </div>
        </div>

        {/* Estado de conexión */}
        <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border ${
          isConnected 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
            : 'bg-amber-50 border-amber-200 text-amber-700'
        }`}>
          {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
          <span>{isConnected ? 'Tiempo real conectado' : 'Modo HTTP'}</span>
        </div>
      </div>

      {/* ─── ALERTA DE ERROR / AUTORIZACIÓN ─── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-red-800 space-y-2 animate-in fade-in duration-300">
          <div className="flex items-center gap-2 font-bold text-sm text-red-700">
            <AlertCircle size={18} className="text-red-600 shrink-0" />
            <span>Atención: {error}</span>
          </div>
          <p className="text-xs text-red-600/90 leading-relaxed pl-6">
            Rol actual: <strong className="font-mono bg-red-100 px-1.5 py-0.5 rounded">{currentRole || 'Desconocido'}</strong>.
            En tu backend C#, agrega <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-red-200">[Authorize(Roles = &quot;Admin,SuperAdmin&quot;)]</code>.
          </p>
        </div>
      )}

      {/* ─── CARD PRINCIPAL: ACTIVADOR DEL LIVE ─── */}
      <div className="bg-white p-6 sm:p-8 rounded-[28px] shadow-sm border border-sage/15 space-y-6">
        
        {/* Interruptor maestro */}
        <div className={`p-6 rounded-2xl border transition-all duration-300 ${
          isLiveActive 
            ? 'bg-red-500/5 border-red-500/30 shadow-sm' 
            : 'bg-stone-50 border-stone-200/80'
        }`}>
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                {isLiveActive ? (
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-80" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                  </span>
                ) : (
                  <span className="h-3 w-3 rounded-full bg-stone-400" />
                )}
                <span className={`text-sm font-extrabold uppercase tracking-wider ${
                  isLiveActive ? 'text-red-600' : 'text-stone-600'
                }`}>
                  {isLiveActive ? '🔴 EN VIVO EN TIKTOK (Aviso Visible)' : '⚪ APAGADO (Aviso Oculto)'}
                </span>
              </div>
              <p className="text-xs text-sage leading-relaxed max-w-md">
                {isLiveActive 
                  ? 'Tus clientes están viendo el aviso "EN VIVO EN TIKTOK" en la tienda con el botón directo a tu transmisión.' 
                  : 'El aviso está oculto. La tienda funciona normalmente.'}
              </p>
            </div>

            {/* Switch Toggle */}
            <button
              onClick={handleToggle}
              disabled={isToggling}
              className={`relative inline-flex h-10 w-20 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${
                isLiveActive 
                  ? 'bg-gradient-to-r from-[#ff0050] to-[#00f2ea] focus:ring-red-400' 
                  : 'bg-stone-300 focus:ring-stone-400'
              }`}
              aria-label="Prender o apagar aviso de TikTok Live"
            >
              <span
                className={`pointer-events-none inline-block h-9 w-9 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${
                  isLiveActive ? 'translate-x-10' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Cuenta vinculada */}
        <div className="p-4 rounded-xl bg-[#FAFAFA] border border-sage/15 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-brown">Usuario de TikTok:</span>
            <span className="font-mono text-[#ff0050] font-bold">@{username}</span>
          </div>
          <Link 
            href="/admin/configuracion" 
            className="inline-flex items-center gap-1 font-semibold text-[#c8a96b] hover:text-[#4a3933] transition-colors"
          >
            <Settings size={13} />
            <span>Cambiar usuario</span>
          </Link>
        </div>

        {/* Formulario de Mensaje del Live */}
        <form onSubmit={handleSendMessage} className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <label htmlFor="messageInput" className="block text-xs font-bold uppercase tracking-wider text-brown">
              Mensaje o Anuncio en Vivo
            </label>
            {sentSuccess && (
              <span className="text-xs text-emerald-600 font-bold animate-in fade-in flex items-center gap-1">
                <CheckCircle2 size={13} /> ¡Mensaje transmitido!
              </span>
            )}
          </div>
          
          <div className="flex gap-2">
            <input
              id="messageInput"
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Ej: ¡Aprovecha 20% OFF en todos los ramos durante este live!"
              className="flex-1 bg-[#FAFAFA] border border-sage/20 rounded-xl px-4 py-3 text-sm text-brown focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brown text-white font-bold text-xs uppercase tracking-wider hover:bg-brown/90 transition-all shrink-0"
            >
              <Send size={14} />
              <span>Transmitir</span>
            </button>
          </div>

          <p className="text-[11px] text-sage">
            Este mensaje aparece dentro de la tarjeta flotante de TikTok LIVE para todos los clientes en la tienda.
          </p>
        </form>

        {/* Acceso rápido a la tienda */}
        <div className="pt-4 border-t border-sage/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-sage">
            <CheckCircle2 size={15} className="text-emerald-600" />
            <span>Sincronización instantánea con la tienda.</span>
          </div>

          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#ff0050] hover:text-brown transition-colors"
          >
            <span>Ver cómo se ve en la tienda</span>
            <ExternalLink size={13} />
          </Link>
        </div>

      </div>
    </div>
  );
}
