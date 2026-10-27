"use client";

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, X } from 'lucide-react';

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  /** Botones fijos abajo (siempre visibles aunque el formulario sea largo) */
  footer?: React.ReactNode;
}

/**
 * Panel para crear o editar sin perder de vista la lista: a la derecha en computadora y
 * como hoja que sube desde abajo en el celular. Se cierra con Esc o tocando afuera.
 */
export function SidePanel({ isOpen, onClose, title, subtitle, icon: Icon, children, footer }: SidePanelProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-end sm:items-stretch" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Cerrar" onClick={onClose} className="absolute inset-0 bg-brown/30 backdrop-blur-[2px] animate-in fade-in duration-200" />
      <div className="relative flex max-h-[92vh] w-full flex-col rounded-t-[28px] bg-[#FDFCFA] shadow-2xl animate-in slide-in-from-bottom-8 duration-300 sm:max-h-none sm:w-[460px] sm:rounded-none sm:rounded-l-[28px] sm:slide-in-from-right-8">
        {/* Asa para el celular */}
        <span className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-sage/25 sm:hidden" aria-hidden />
        <header className="flex items-start gap-3 border-b border-sage/10 px-5 pb-4 pt-3 sm:px-6 sm:pt-6">
          {Icon && <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gold/10 text-gold"><Icon size={20} /></span>}
          <div className="min-w-0 flex-1">
            <h2 className="font-serif text-xl font-bold text-brown">{title}</h2>
            {subtitle && <p className="text-xs text-sage">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-sage hover:bg-sage/10 hover:text-brown" aria-label="Cerrar panel">
            <X size={18} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {footer && <footer className="border-t border-sage/10 bg-white px-5 py-4 sm:px-6">{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
}

/** Pie fijo del panel: "Seguir creando" (al crear) + Cancelar + guardar, en una sola línea. */
export function PanelActions({ saving, label, onCancel, onSave, keepOpen, onKeepOpen }: {
  saving: boolean; label: string; onCancel: () => void; onSave: () => void;
  /** Solo al crear: deja el panel abierto y limpio para cargar varios seguidos */
  keepOpen?: boolean; onKeepOpen?: (value: boolean) => void;
}) {
  return (
    <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 border-t border-sage/10 bg-white px-5 py-4 sm:rounded-bl-[28px] sm:px-6">
      {onKeepOpen ? (
        <label className="mr-auto inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-sage">
          <input type="checkbox" checked={!!keepOpen} onChange={e => onKeepOpen(e.target.checked)} className="h-4 w-4 accent-[#4a3933]" />
          Seguir creando
        </label>
      ) : <span className="mr-auto" />}
      <button type="button" onClick={onCancel} className="rounded-xl px-3 py-2.5 text-sm font-semibold text-sage hover:text-brown">Cancelar</button>
      <button type="button" onClick={onSave} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-brown px-5 py-2.5 text-sm font-semibold text-white hover:bg-brown/90 disabled:opacity-60">
        {saving && <Loader2 size={15} className="animate-spin" />} {label}
      </button>
    </div>
  );
}

/** Etiqueta + campo + ayuda, igual en todos los formularios del panel. */
export function PanelField({ label, hint, error, htmlFor, children }: {
  label: string; hint?: React.ReactNode; error?: string | null; htmlFor?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-sage">{label}</label>
      {children}
      {error ? <p className="mt-1.5 text-xs font-semibold text-rose-600">{error}</p> : hint ? <p className="mt-1.5 text-xs text-sage">{hint}</p> : null}
    </div>
  );
}

export const panelInput =
  'w-full rounded-xl border border-sage/20 bg-white px-3.5 py-2.5 text-sm text-brown outline-none transition placeholder:text-sage/50 focus:border-gold focus:ring-2 focus:ring-gold/20';

/** Montos rápidos + campo libre; 0 se muestra como "Gratis". */
export function CostPicker({ value, onChange, presets, id }: { value: string; onChange: (v: string) => void; presets: number[]; id?: string }) {
  const current = parseFloat(value);
  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {presets.map(amount => {
          const active = !isNaN(current) && current === amount && value !== '';
          return (
            <button
              key={amount}
              type="button"
              onClick={() => onChange(amount.toFixed(2))}
              className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                active ? 'border-brown bg-brown text-white' : 'border-sage/20 bg-white text-[#6b5a50] hover:border-gold/60'
              }`}
            >
              {amount === 0 ? 'Gratis' : `S/ ${amount}`}
            </button>
          );
        })}
      </div>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-sage">S/</span>
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={value}
          onChange={e => /^\d{0,4}([.,]\d{0,2})?$/.test(e.target.value) && onChange(e.target.value.replace(',', '.'))}
          placeholder="0.00"
          className={`${panelInput} pl-10 font-bold`}
        />
      </div>
    </div>
  );
}
