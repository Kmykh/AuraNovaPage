"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLiveAdmin } from '@/hooks/use-live-signalr';
import { AuthSession } from '@/lib/auth-storage';
import { 
  Radio, Wifi, WifiOff, ExternalLink, ShieldAlert, 
  CheckCircle2, AlertCircle, Info, Sparkles 
} from 'lucide-react';
import { NewFeatureBadge } from '@/components/admin/shared/NewFeatureBadge';

export default function TransmisionPage() {
  const {
    isConnected,
    error,
    setError,
    liveText,
    setLiveText,
    isLiveActive,
    streamLiveText,
    toggleLiveStream,
  } = useLiveAdmin();

  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    setCurrentRole(AuthSession.getRole());
  }, []);

  // Activar / Desactivar Live
  const handleToggle = async () => {
    setIsToggling(true);
    try {
      await toggleLiveStream(!isLiveActive);
    } finally {
      setIsToggling(false);
    }
  };

  // Guardar o emitir texto de aviso
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setLiveText(text);
    streamLiveText(text);
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* ─── ENCABEZADO ─── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4a3933] to-[#2d221e] flex items-center justify-center shadow-lg border border-[#c8a96b]/30">
            <Radio size={24} className="text-[#c8a96b]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-brown flex items-center gap-2">
              Aviso de Live
              <NewFeatureBadge label="LIVE" size="sm" />
            </h1>
            <p className="text-sage text-sm">
              Activa o desactiva el aviso de transmisión en vivo para tus clientes
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

      {/* ─── ALERTA DE ERROR / NO AUTORIZADO ─── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-red-800 space-y-2 animate-in fade-in duration-300">
          <div className="flex items-center gap-2 font-bold text-sm text-red-700">
            <AlertCircle size={18} className="text-red-600 shrink-0" />
            <span>Atención: {error}</span>
          </div>
          <p className="text-xs text-red-600/90 leading-relaxed pl-6">
            Tu sesión actual tiene el rol: <strong className="font-mono bg-red-100 px-1.5 py-0.5 rounded">{currentRole || 'Desconocido'}</strong>.
            En tu backend en C# (<code className="font-mono text-[11px]">LiveBroadcastController.cs</code> o <code className="font-mono text-[11px]">LiveHub.cs</code>), 
            asegúrate de colocar <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-red-200">[Authorize(Roles = &quot;Admin,SuperAdmin&quot;)]</code> o simplemente <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-red-200">[Authorize]</code> para que no te bloquee.
          </p>
        </div>
      )}

      {/* ─── CARD PRINCIPAL: ACTIVADOR DEL LIVE ─── */}
      <div className="bg-white p-6 sm:p-8 rounded-[28px] shadow-sm border border-sage/15 space-y-6">
        
        {/* Interruptor gigante */}
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
                  {isLiveActive ? '🔴 EN VIVO AHORA (Activo)' : '⚪ APAGADO (Fuera del aire)'}
                </span>
              </div>
              <p className="text-xs text-sage leading-relaxed max-w-md">
                {isLiveActive 
                  ? 'Tus clientes están viendo el aviso "¡Estamos en Vivo!" en la tienda con el botón para ver la transmisión.' 
                  : 'El aviso está oculto. La tienda funciona normalmente sin notificaciones de directo.'}
              </p>
            </div>

            {/* Switch Toggle */}
            <button
              onClick={handleToggle}
              disabled={isToggling}
              className={`relative inline-flex h-10 w-20 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${
                isLiveActive 
                  ? 'bg-red-500 focus:ring-red-400' 
                  : 'bg-stone-300 focus:ring-stone-400'
              }`}
              aria-label="Prender o apagar aviso de live"
            >
              <span
                className={`pointer-events-none inline-block h-9 w-9 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${
                  isLiveActive ? 'translate-x-10' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Mensaje opcional del Live */}
        <div className="space-y-2 pt-2">
          <label htmlFor="liveCustomText" className="block text-xs font-bold uppercase tracking-wider text-brown">
            Mensaje del aviso (opcional)
          </label>
          <input
            id="liveCustomText"
            type="text"
            value={liveText}
            onChange={handleTextChange}
            placeholder="Ej: ¡Acompáñanos en directo con ofertas exclusivas!"
            className="w-full bg-[#FAFAFA] border border-sage/20 rounded-xl px-4 py-3 text-sm text-brown focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold"
          />
          <p className="text-[11px] text-sage">
            Si lo dejas vacío, mostrará el mensaje predeterminado: <em>&ldquo;Acompáñanos ahora mismo en nuestra transmisión en directo.&rdquo;</em>
          </p>
        </div>

        {/* Acceso rápido a la tienda */}
        <div className="pt-4 border-t border-sage/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-sage">
            <CheckCircle2 size={15} className="text-emerald-600" />
            <span>Cambios sincronizados al instante.</span>
          </div>

          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#c8a96b] hover:text-brown transition-colors"
          >
            <span>Ver cómo se ve en la tienda</span>
            <ExternalLink size={13} />
          </Link>
        </div>

      </div>

      {/* ─── AYUDA PARA TU CÓDIGO C# ─── */}
      <div className="bg-[#FAF8F5] p-6 rounded-2xl border border-[#c8a96b]/30 space-y-3">
        <div className="flex items-center gap-2 text-brown font-serif font-bold text-sm">
          <ShieldAlert size={16} className="text-[#c8a96b]" />
          <span>¿Por qué salía &quot;No estoy autorizado&quot;?</span>
        </div>
        <p className="text-xs text-brown/80 leading-relaxed">
          Si en tu backend pusiste <code className="bg-white px-1.5 py-0.5 rounded border border-stone-200 font-mono">[Authorize(Roles = &quot;SuperAdmin&quot;)]</code>, 
          cualquier usuario con rol <code className="bg-white px-1.5 py-0.5 rounded border border-stone-200 font-mono">&quot;Admin&quot;</code> es rechazado con error 403.
        </p>
        <p className="text-xs text-brown/80 leading-relaxed">
          Para que funcione para todos tus administradores, en tu <code className="font-mono font-bold text-[11px]">LiveBroadcastController.cs</code> pon:
        </p>
        <pre className="bg-[#2a1d19] text-[#e4c98c] p-3 rounded-xl text-xs font-mono overflow-x-auto">
{`[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,SuperAdmin")] // <-- Permite tanto Admin como SuperAdmin
public class LiveBroadcastController : ControllerBase
{
    // ...
}`}
        </pre>
      </div>

    </div>
  );
}
