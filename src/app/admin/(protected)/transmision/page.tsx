"use client";

import React, { useCallback } from 'react';
import Link from 'next/link';
import { useLiveAdmin } from '@/hooks/use-live-signalr';
import { ExternalLink, Eye, Flame, Loader2, MessageSquareText, Radio, Settings, Tv, X } from 'lucide-react';

const MAX_TEXT = 160;

/** Mensajes listos para tocar durante el directo. */
const TEMPLATES = [
  '¡Estamos en vivo en TikTok! Entra y pide tu ramo 🌷',
  'Solo durante el live: 10% de descuento en ramos',
  'Envío gratis hoy en Huancayo',
  '¡Últimas unidades! Pide la tuya antes que se agoten',
];

export default function TransmisionPage() {
  const {
    isConnected,
    liveText,
    setLiveText,
    isLiveTextActive,
    toggleLiveText,
    isTikTokActive,
    tikTokUsername,
    streamLiveText,
    toggleTikTokLive,
    error,
  } = useLiveAdmin();

  // Cada letra llega a la tienda al instante (efecto de "escribiendo en vivo")
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value.slice(0, MAX_TEXT);
    setLiveText(text);
    streamLiveText(text);
  }, [setLiveText, streamLiveText]);

  // Una plantilla se publica completa y enciende el mensaje si estaba apagado
  const publish = useCallback((text: string) => {
    if (!isLiveTextActive) toggleLiveText(true);
    streamLiveText(text);
  }, [isLiveTextActive, toggleLiveText, streamLiveText]);

  // Apagar también borra el texto: así el aviso desaparece de la tienda
  const setMessageOn = useCallback((on: boolean) => {
    if (on) {
      toggleLiveText(true);
      return;
    }
    streamLiveText('');
    toggleLiveText(false);
  }, [toggleLiveText, streamLiveText]);

  const username = tikTokUsername ? tikTokUsername.replace(/^@/, '') : 'aura.nova40';
  const showingText = isLiveTextActive && liveText.trim().length > 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-2 font-serif text-2xl font-bold text-brown">
            <Radio className="text-gold" /> Transmisión en vivo
          </h1>
          <p className="mt-1 text-sage">Avisa en la tienda que estás en TikTok y muestra un mensaje a quien la visita.</p>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-2 self-start rounded-full border px-3.5 py-1.5 text-sm font-semibold sm:self-auto ${
            isConnected ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'
          }`}
        >
          {isConnected ? <span className="h-2 w-2 rounded-full bg-emerald-500" /> : <Loader2 size={14} className="animate-spin" />}
          {isConnected ? 'Conectado a la tienda' : 'Conectando…'}
        </span>
      </div>

      {!isConnected && (
        <p className="rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-sm text-amber-800">
          Sin conexión con la tienda: los cambios no llegarán a tus clientes. Si no conecta en unos segundos, recarga la página.
        </p>
      )}
      {isConnected && error && (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          No se pudo cambiar el estado del directo. Intenta de nuevo en unos segundos.
        </p>
      )}

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          {/* 1. Directo de TikTok */}
          <section className={`rounded-[24px] border p-5 shadow-sm transition sm:p-6 ${isTikTokActive ? 'border-[#ff0050]/30 bg-gradient-to-br from-white to-[#fff4f7]' : 'border-sage/10 bg-white'}`}>
            <div className="flex items-start gap-4">
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${isTikTokActive ? 'bg-gradient-to-br from-[#ff0050] to-[#00f2ea] text-white' : 'bg-sage/10 text-sage'}`}>
                <Tv size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-sage">Paso 1</p>
                <h2 className="font-serif text-lg font-bold text-brown">¿Estás en vivo en TikTok?</h2>
                <p className="mt-0.5 text-sm text-sage">
                  {isTikTokActive
                    ? 'La tienda muestra un aviso con el botón para entrar a tu directo.'
                    : 'Enciéndelo cuando empieces el live; apágalo al terminar.'}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isTikTokActive}
                aria-label="Directo de TikTok"
                onClick={() => toggleTikTokLive(!isTikTokActive, username)}
                disabled={!isConnected}
                className={`relative mt-1 h-8 w-14 shrink-0 rounded-full transition disabled:opacity-50 ${isTikTokActive ? 'bg-gradient-to-r from-[#ff0050] to-[#00f2ea]' : 'bg-sage/30'}`}
              >
                <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${isTikTokActive ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-[#FAFAFA] px-4 py-3 text-sm">
              <span className="text-sage">Cuenta: <strong className="font-mono text-brown">@{username}</strong></span>
              <Link href="/admin/configuracion" className="inline-flex items-center gap-1 text-xs font-semibold text-sage hover:text-brown">
                <Settings size={13} /> Cambiar en Configuración
              </Link>
            </div>
          </section>

          {/* 2. Mensaje en la tienda */}
          <section className="rounded-[24px] border border-sage/10 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-4">
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${isLiveTextActive ? 'bg-brown text-[#e8c98a]' : 'bg-sage/10 text-sage'}`}>
                <MessageSquareText size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-sage">Paso 2 · opcional</p>
                <h2 className="font-serif text-lg font-bold text-brown">Mensaje en la tienda</h2>
                <p className="mt-0.5 text-sm text-sage">Aparece arriba en la web y se actualiza mientras escribes.</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isLiveTextActive}
                aria-label="Mensaje en la tienda"
                onClick={() => setMessageOn(!isLiveTextActive)}
                disabled={!isConnected}
                className={`relative mt-1 h-8 w-14 shrink-0 rounded-full transition disabled:opacity-50 ${isLiveTextActive ? 'bg-brown' : 'bg-sage/30'}`}
              >
                <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${isLiveTextActive ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <div className="mt-4">
              <textarea
                value={liveText}
                onChange={handleTextChange}
                placeholder={isLiveTextActive ? 'Escribe tu mensaje…' : 'Enciende el mensaje para escribir'}
                rows={3}
                maxLength={MAX_TEXT}
                disabled={!isConnected || !isLiveTextActive}
                className="w-full resize-none rounded-2xl border border-sage/15 bg-[#FAFAFA] px-4 py-3 font-serif text-base text-brown outline-none transition placeholder:italic placeholder:text-sage/50 focus:border-gold focus:bg-white focus:ring-2 focus:ring-gold/20 disabled:opacity-60"
              />
              <div className="mt-1 flex items-center justify-between text-xs text-sage">
                {showingText ? (
                  <button type="button" onClick={() => setMessageOn(false)} className="inline-flex items-center gap-1 font-semibold hover:text-rose-600">
                    <X size={13} /> Quitar de la tienda
                  </button>
                ) : <span />}
                <span>{liveText.length}/{MAX_TEXT}</span>
              </div>
            </div>

            <div className="mt-4">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-sage">Mensajes rápidos</p>
              <div className="flex flex-wrap gap-2">
                {TEMPLATES.map(template => (
                  <button
                    key={template}
                    type="button"
                    onClick={() => publish(template)}
                    disabled={!isConnected}
                    className={`rounded-full border px-3 py-1.5 text-left text-xs font-medium transition disabled:opacity-50 ${
                      liveText === template ? 'border-gold bg-gold/10 text-brown' : 'border-sage/20 bg-white text-[#6b5a50] hover:border-gold/50'
                    }`}
                  >
                    {template}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Lo que ve el cliente ahora */}
        <aside className="space-y-4 rounded-[24px] border border-sage/10 bg-white p-5 shadow-sm lg:sticky lg:top-4">
          <h3 className="flex items-center gap-2 font-serif text-base font-bold text-brown">
            <Eye size={16} className="text-gold" /> Lo que ve el cliente ahora
          </h3>

          <div>
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-sage">Arriba de la tienda</p>
            {showingText ? (
              <div className="rounded-2xl border-2 border-[#c8a96b]/30 bg-gradient-to-br from-[#4a3933] to-[#5c4a42] p-3.5 text-[#faf7f2]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#c8a96b]">Anuncio en vivo</p>
                <p className="mt-1 break-words font-serif text-sm italic">{liveText}</p>
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed border-sage/25 px-3 py-3 text-xs text-sage">No se muestra ningún mensaje.</p>
            )}
          </div>

          <div>
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-sage">Esquina inferior</p>
            {isTikTokActive ? (
              <div className="space-y-2 rounded-xl border border-[#ff0050]/40 bg-[#1a1412] p-3.5 text-white shadow-xl">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-[11px] font-black">
                    TikTok LIVE <span className="rounded-full bg-red-500 px-1 text-[8px] font-bold">¡EN VIVO!</span>
                  </span>
                  <span className="truncate font-mono text-[10px] text-stone-400">@{username}</span>
                </div>
                <p className="flex items-center gap-1 text-[11px] font-bold text-amber-400">
                  <Flame size={12} className="text-[#ff0050]" /> ¡Ofertas y descuentos en directo!
                </p>
                <div className="rounded-lg bg-gradient-to-r from-[#ff0050] to-[#00f2ea] py-1.5 text-center text-[10px] font-bold">Ir al TikTok LIVE ↗</div>
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed border-sage/25 px-3 py-3 text-xs text-sage">El aviso de TikTok está apagado.</p>
            )}
          </div>

          <Link href="/" target="_blank" className="inline-flex items-center gap-1 text-xs font-bold text-[#ff0050] hover:text-brown">
            Abrir la tienda <ExternalLink size={12} />
          </Link>
        </aside>
      </div>
    </div>
  );
}
