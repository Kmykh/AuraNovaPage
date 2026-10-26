"use client";

import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Check, Download, ImagePlus, Loader2, Lock, RefreshCw, Trash2, X } from 'lucide-react';
import { CardArt, ThemeSwatch } from '@/components/card/CardArt';
import {
  CARD_FONTS, CARD_THEMES, CardDesign, MAX_CARD_TEXT, QUICK_PHRASES, downloadCard, prepareCardPhoto,
} from '@/lib/card-design';

interface CardDesignerModalProps {
  value: CardDesign;
  onChange: (value: CardDesign) => void;
  onClose: () => void;
  onSave: () => void;
  productName?: string;
}

function Section({ number, title, hint, children }: { number: number; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex items-baseline gap-2.5">
        <span className="font-serif text-2xl font-bold leading-none text-[#c8a96b]">{String(number).padStart(2, '0')}</span>
        <div>
          <h3 className="text-sm font-bold text-[#4a3933]">{title}</h3>
          {hint && <p className="text-xs text-[#887870]">{hint}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

const inputClass =
  'w-full rounded-xl border border-[#e8dcdc] bg-white px-3.5 py-2.5 text-sm text-[#4a3933] outline-none transition placeholder:text-[#b7a9a0] focus:border-[#c8a96b] focus:ring-4 focus:ring-[#c8a96b]/15';

/**
 * Editor de la tarjeta con dedicatoria: diseño (o foto propia), mensaje y letra, con la vista previa
 * exacta de lo que se imprime. Todo a la vista, sin pasos plegables.
 */
export function PhraseCardModal({ value, onChange, onClose, onSave, productName }: CardDesignerModalProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [isPreparingPhoto, setIsPreparingPhoto] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const set = <K extends keyof CardDesign>(key: K, field: CardDesign[K]) => onChange({ ...value, [key]: field });

  // Escape cierra y la página de atrás no se desplaza mientras el editor está abierto
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const choosePhoto = async (file: File | undefined) => {
    if (!file) return;
    setIsPreparingPhoto(true);
    try {
      const photo = await prepareCardPhoto(file);
      onChange({ ...value, theme: 'foto', photo });
    } catch (error) {
      toast.error('No pudimos usar esa foto', { description: error instanceof Error ? error.message : undefined });
    } finally {
      setIsPreparingPhoto(false);
    }
  };

  const download = async () => {
    if (!value.text.trim()) {
      toast.error('Escribe tu mensaje primero');
      return;
    }
    setIsDownloading(true);
    try {
      await downloadCard(value, `Tarjeta_${productName ?? 'Aura_Nova'}`);
    } catch {
      toast.error('No se pudo descargar la tarjeta.');
    } finally {
      setIsDownloading(false);
    }
  };

  const remaining = MAX_CARD_TEXT - value.text.length;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#2b201c]/60 backdrop-blur-sm sm:items-center sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Diseña tu tarjeta"
        className="relative flex max-h-[94dvh] w-full max-w-5xl flex-col overflow-hidden rounded-t-[2rem] bg-[#fcfaf7] shadow-2xl animate-in slide-in-from-bottom-4 duration-300 sm:rounded-[2rem]"
        onClick={e => e.stopPropagation()}
      >
        {/* Encabezado */}
        <header className="flex items-start justify-between gap-4 border-b border-[#efe6dd] px-5 py-4 sm:px-8 sm:py-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#c8a96b]">Tarjeta con dedicatoria</p>
            <h2 className="font-serif text-2xl font-bold text-[#4a3933] sm:text-3xl">Diseña tu tarjeta</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-[#887870] transition hover:bg-[#4a3933]/5 hover:text-[#4a3933]" aria-label="Cerrar">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="grid flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-[1.1fr_1fr]">
          {/* Vista previa */}
          <div className="border-b border-[#efe6dd] bg-[radial-gradient(circle_at_30%_20%,#fffdf8,#f4ece1)] p-5 sm:p-8 lg:sticky lg:top-0 lg:self-start lg:border-b-0 lg:border-r">
            <CardArt design={value} />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-[#887870]">
              <span>Así se imprime · tamaño postal horizontal</span>
              <button
                type="button"
                onClick={download}
                disabled={isDownloading}
                className="inline-flex items-center gap-1.5 font-semibold text-[#8f6d28] hover:text-[#4a3933] disabled:opacity-50"
              >
                {isDownloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />} Descargar PNG
              </button>
            </div>
          </div>

          {/* Controles */}
          <div className="space-y-7 p-5 sm:p-8">
            <Section number={1} title="Elige el diseño" hint="O usa una foto tuya de fondo.">
              <div className="grid grid-cols-3 gap-2.5">
                {CARD_THEMES.filter(t => t.id !== 'foto').map(theme => {
                  const selected = value.theme === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => set('theme', theme.id)}
                      aria-pressed={selected}
                      className={`group rounded-2xl p-1.5 text-left transition ${selected ? 'bg-white ring-2 ring-[#c8a96b] shadow-sm' : 'hover:bg-white'}`}
                    >
                      <ThemeSwatch themeId={theme.id} />
                      <span className={`mt-1.5 flex items-center justify-between gap-1 px-0.5 text-[11px] leading-tight ${selected ? 'font-bold text-[#4a3933]' : 'text-[#6b5a50]'}`}>
                        {theme.name}
                        {selected && <Check className="h-3 w-3 shrink-0 text-[#c8a96b]" />}
                      </span>
                    </button>
                  );
                })}

                {/* Foto propia */}
                <button
                  type="button"
                  onClick={() => (value.photo ? set('theme', 'foto') : fileInput.current?.click())}
                  disabled={isPreparingPhoto}
                  aria-pressed={value.theme === 'foto'}
                  className={`group rounded-2xl p-1.5 text-left transition ${value.theme === 'foto' ? 'bg-white ring-2 ring-[#c8a96b] shadow-sm' : 'hover:bg-white'}`}
                >
                  {value.photo ? (
                    <ThemeSwatch themeId="foto" photo={value.photo} />
                  ) : (
                    <span className="flex aspect-[16/10] w-full flex-col items-center justify-center gap-0.5 rounded-lg border-2 border-dashed border-[#c8a96b]/50 bg-[#fffdf8] text-[#b08a4e]">
                      {isPreparingPhoto ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                    </span>
                  )}
                  <span className={`mt-1.5 flex items-center justify-between gap-1 px-0.5 text-[11px] leading-tight ${value.theme === 'foto' ? 'font-bold text-[#4a3933]' : 'text-[#6b5a50]'}`}>
                    {isPreparingPhoto ? 'Preparando…' : value.photo ? 'Tu foto' : 'Subir tu foto'}
                    {value.theme === 'foto' && <Check className="h-3 w-3 shrink-0 text-[#c8a96b]" />}
                  </span>
                </button>
              </div>

              <input
                ref={fileInput}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic"
                className="hidden"
                onChange={e => { void choosePhoto(e.target.files?.[0]); e.target.value = ''; }}
              />

              {value.photo && (
                <div className="flex flex-wrap items-center gap-3 rounded-xl bg-white px-3 py-2 text-xs text-[#6b5a50]">
                  <button type="button" onClick={() => fileInput.current?.click()} className="inline-flex items-center gap-1 font-semibold text-[#8f6d28] hover:text-[#4a3933]">
                    <RefreshCw className="h-3 w-3" /> Cambiar foto
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange({ ...value, photo: null, theme: value.theme === 'foto' ? 'marfil' : value.theme })}
                    className="inline-flex items-center gap-1 font-semibold text-[#887870] hover:text-[#c06b6b]"
                  >
                    <Trash2 className="h-3 w-3" /> Quitar
                  </button>
                  <span className="flex items-center gap-1 text-[11px] text-[#887870]">
                    <Lock className="h-3 w-3" /> Solo la usamos para imprimir tu tarjeta.
                  </span>
                </div>
              )}
            </Section>

            <Section number={2} title="Escribe tu mensaje" hint="Para y De son opcionales.">
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-[11px] font-semibold text-[#887870]">Para</span>
                  <input className={inputClass} value={value.to} maxLength={40} onChange={e => set('to', e.target.value)} placeholder="Mi amor, Mamá, Sofía…" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[11px] font-semibold text-[#887870]">De</span>
                  <input className={inputClass} value={value.from} maxLength={40} onChange={e => set('from', e.target.value)} placeholder="Tu nombre o firma" />
                </label>
              </div>
              <label className="block">
                <span className="mb-1 flex justify-between text-[11px] font-semibold text-[#887870]">
                  Mensaje
                  <span className={remaining < 20 ? 'text-[#c06b6b]' : ''}>{remaining}</span>
                </span>
                <textarea
                  className={`${inputClass} h-24 resize-none leading-relaxed`}
                  value={value.text}
                  maxLength={MAX_CARD_TEXT}
                  onChange={e => set('text', e.target.value)}
                  placeholder="Escribe las palabras que quieres que lea…"
                />
              </label>
              <div className="flex flex-wrap gap-1.5">
                <span className="self-center text-[11px] text-[#887870]">Ideas:</span>
                {QUICK_PHRASES.map(phrase => (
                  <button
                    key={phrase.label}
                    type="button"
                    title={phrase.text}
                    onClick={() => set('text', phrase.text)}
                    className="rounded-full border border-[#e8dcdc] bg-white px-2.5 py-1 text-[11px] font-medium text-[#6b5a50] transition hover:border-[#c8a96b] hover:text-[#4a3933]"
                  >
                    {phrase.label}
                  </button>
                ))}
              </div>
            </Section>

            <Section number={3} title="Elige la letra">
              <div className="grid grid-cols-3 gap-2">
                {CARD_FONTS.map(font => {
                  const selected = value.font === font.id;
                  return (
                    <button
                      key={font.id}
                      type="button"
                      onClick={() => set('font', font.id)}
                      aria-pressed={selected}
                      className={`rounded-xl border px-3 py-2.5 text-left transition ${
                        selected ? 'border-[#4a3933] bg-[#4a3933] text-white' : 'border-[#e8dcdc] bg-white text-[#4a3933] hover:border-[#4a3933]/40'
                      }`}
                    >
                      <span className={`block text-base ${font.css}`}>{font.label}</span>
                      <span className={`block text-[10px] ${selected ? 'text-white/70' : 'text-[#887870]'}`}>{font.hint}</span>
                    </button>
                  );
                })}
              </div>
            </Section>
          </div>
        </div>

        {/* Acciones siempre visibles */}
        <footer className="flex items-center justify-end gap-2 border-t border-[#efe6dd] bg-white/80 px-5 py-3 backdrop-blur sm:px-8">
          <button type="button" onClick={onClose} className="rounded-full px-4 py-2.5 text-sm font-semibold text-[#887870] hover:text-[#4a3933]">
            Cancelar
          </button>
          <button
            type="button"
            onClick={onSave}
            className="inline-flex items-center gap-2 rounded-full bg-[#4a3933] px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-[#3a2d28]"
          >
            <Check className="h-4 w-4" /> Guardar tarjeta
          </button>
        </footer>
      </div>
    </div>
  );
}
