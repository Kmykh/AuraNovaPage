"use client";

import React, { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowRight, Check, Clock, Mail, MessageCircle, Receipt, Search, ShieldCheck, X } from 'lucide-react';
import { cleanTrackingInput, normalizeTrackingCode, TRACKING_LENGTH } from '@/lib/tracking-code';
import { forgetRecentTracking, parseRecent, readRecentRaw, subscribeRecent } from '@/lib/recent-tracking';
import { useBusinessSettings } from '@/hooks/use-info';
import { timeAgo } from '@/lib/tracking-progress';

import flo1 from '../../app/(public)/images/flo1.png';
import flo5 from '../../app/(public)/images/flo5.png';

/** "K7M3Q9XA" → "K7M3-Q9XA" mientras se escribe. */
function formatAsYouType(raw: string) {
  const clean = cleanTrackingInput(raw).slice(0, TRACKING_LENGTH);
  return clean.length > 4 ? `${clean.slice(0, 4)}-${clean.slice(4)}` : clean;
}

export function TrackingSearchForm({ invalidCode = false }: { invalidCode?: boolean }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState('');
  const [error, setError] = useState(invalidCode ? 'Ese código no es válido. Revísalo e inténtalo de nuevo.' : '');
  const { data: settings } = useBusinessSettings();

  // Pedidos vistos en este dispositivo (en el servidor no hay ninguno)
  const recentRaw = useSyncExternalStore(subscribeRecent, readRecentRaw, () => '');
  const recent = useMemo(() => parseRecent(recentRaw), [recentRaw]);

  const code = normalizeTrackingCode(value);
  const typedChars = cleanTrackingInput(value).length;
  const whatsapp = (settings?.whatsappNumber || '51950482596').replace(/\D/g, '');

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleChange = (raw: string) => {
    setError('');
    // Si pegan el enlace completo, se toma el código del final
    const fromLink = normalizeTrackingCode(raw);
    setValue(fromLink ?? formatAsYouType(raw));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) {
      setError('El código tiene 8 caracteres, por ejemplo K7M3-Q9XA.');
      return;
    }
    router.push(`/seguimiento/${code}`);
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full overflow-hidden bg-[#faf7f2] pb-20 pt-28 sm:pt-32">
      <div className="pointer-events-none absolute -left-24 top-1/3 w-[260px] opacity-50 mix-blend-multiply animate-float-gentle sm:w-[380px]">
        <Image src={flo1} alt="" width={380} height={380} style={{ width: 'auto', height: 'auto' }} />
      </div>
      <div className="pointer-events-none absolute -right-20 top-24 w-[220px] opacity-60 mix-blend-multiply animate-float-delayed sm:w-[320px]">
        <Image src={flo5} alt="" width={320} height={320} className="rotate-12" style={{ width: 'auto', height: 'auto' }} />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl px-4">
        <header className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#c8a96b]">Seguimiento</p>
          <h1 className="mt-2 font-serif text-4xl font-bold leading-tight text-[#4a3933] sm:text-6xl">
            ¿En qué va tu <span className="italic text-[#d38b8b]">pedido</span>?
          </h1>
          <p className="mt-3 text-base text-[#887870]">Escribe tu código de seguimiento y míralo al instante.</p>
        </header>

        <form onSubmit={handleSubmit} className="mt-8 rounded-[2rem] bg-white p-4 shadow-[0_24px_50px_-28px_rgba(211,139,139,0.45)] sm:p-5">
          <label htmlFor="tracking-code" className="sr-only">Código de seguimiento</label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className={`relative flex-1 rounded-2xl transition ${code ? 'ring-2 ring-emerald-300/70' : error ? 'ring-2 ring-[#d38b8b]/50' : ''}`}>
              <input
                id="tracking-code"
                ref={inputRef}
                value={value}
                onChange={e => handleChange(e.target.value)}
                placeholder="K7M3-Q9XA"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                maxLength={60}
                aria-invalid={!!error}
                className="h-16 w-full rounded-2xl bg-[#faf7f2] px-5 pr-14 text-center font-mono text-2xl font-bold tracking-[0.3em] text-[#4a3933] shadow-inner outline-none placeholder:text-[#d9cfc8] focus:bg-white focus:ring-4 focus:ring-[#d38b8b]/10 sm:text-left"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2">
                {code ? (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white"><Check size={16} strokeWidth={3} /></span>
                ) : (
                  <span className="text-[11px] font-bold text-[#c9bdb5]">{typedChars}/{TRACKING_LENGTH}</span>
                )}
              </span>
            </div>
            <button
              type="submit"
              className="inline-flex h-16 items-center justify-center gap-2 rounded-2xl bg-[#4a3933] px-7 text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-[#4a3933]/20 transition hover:-translate-y-0.5 hover:bg-[#3a2d28]"
            >
              <Search className="h-5 w-5" /> Ver pedido
            </button>
          </div>
          {error ? (
            <p className="mt-3 flex items-center gap-1.5 px-1 text-xs font-medium text-[#b56f6f]"><AlertCircle size={14} /> {error}</p>
          ) : (
            <p className="mt-3 flex items-center gap-1.5 px-1 text-xs text-[#887870]">
              <ShieldCheck size={14} className="text-[#c8a96b]" /> Solo quien tiene el código ve el pedido. También puedes pegar el enlace completo.
            </p>
          )}
        </form>

        {recent.length > 0 && (
          <section className="mt-6">
            <p className="mb-2 flex items-center gap-1.5 px-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#887870]">
              <Clock size={13} /> Tus pedidos en este dispositivo
            </p>
            <ul className="space-y-2">
              {recent.map(r => (
                <li key={r.code} className="group flex items-center gap-2 rounded-2xl border border-[#ece3da] bg-white/90 pr-2 transition hover:border-[#c8a96b]/50">
                  <button type="button" onClick={() => router.push(`/seguimiento/${r.code}`)} className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3 text-left">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fdf8ee] text-[#b08a4e]"><Receipt size={18} /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold text-[#4a3933]">Pedido {r.orderCode}</span>
                      <span className="block truncate text-xs text-[#887870]">
                        <span className="font-mono tracking-wider">{r.code}</span>{timeAgo(r.savedAt) && ` · visto ${timeAgo(r.savedAt)}`}
                      </span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-[#c8a96b] transition group-hover:translate-x-0.5" />
                  </button>
                  <button type="button" onClick={() => forgetRecentTracking(r.code)} className="rounded-full p-2 text-[#c4b8af] hover:bg-stone-100 hover:text-[#887870]" aria-label={`Olvidar el pedido ${r.orderCode} en este dispositivo`}>
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Dónde está el código */}
        <section className="mt-10">
          <h2 className="text-center font-serif text-2xl font-bold text-[#4a3933]">¿Dónde encuentro mi código?</h2>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <HelpCard icon={Receipt} title="Al terminar tu compra" text="Aparece en la pantalla de confirmación, junto a tu número de pedido." />
            <HelpCard icon={Mail} title="En tu correo" text="Te lo enviamos con un enlace directo a esta página." />
            <a
              href={`https://wa.me/${whatsapp}?text=${encodeURIComponent('Hola Aura Nova, no encuentro mi código de seguimiento. Mi número de pedido o celular es: ')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col gap-2 rounded-[1.5rem] border border-[#25D366]/30 bg-[#f1fbf5] p-4 transition hover:-translate-y-0.5 hover:border-[#25D366]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#25D366] text-white"><MessageCircle size={18} /></span>
              <span className="font-bold text-[#1f7a4a]">¿No lo encuentras?</span>
              <span className="text-xs text-[#3f6b52]">Escríbenos con tu número de pedido o tu celular y te lo enviamos.</span>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

function HelpCard({ icon: Icon, title, text }: { icon: React.ElementType; title: string; text: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-[1.5rem] border border-[#ece3da] bg-white/90 p-4">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fdf5f5] text-[#d38b8b]"><Icon size={18} /></span>
      <span className="font-bold text-[#4a3933]">{title}</span>
      <span className="text-xs text-[#887870]">{text}</span>
    </div>
  );
}
