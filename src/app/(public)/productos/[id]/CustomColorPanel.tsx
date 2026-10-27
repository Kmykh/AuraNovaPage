"use client";

import React, { useState } from 'react';
import { Check, Palette, X } from 'lucide-react';
import { ColorOption } from '@/types/products';
import { EXTRA_TONES, CUSTOM_COLOR_NAME_MAX, cleanCustomColorName, customColorValue, isLightColor } from '@/lib/product-options';

interface CustomColorPanelProps {
  /** Colores que el producto ya ofrece: no se repiten en la paleta extra */
  offered: string[];
  palette: ColorOption[];
  onUse: (value: string) => void;
  onClose: () => void;
}

const normalize = (value: string) => value.trim().toLocaleLowerCase('es');

/**
 * "Otro color": el cliente elige un tono de la paleta extra o crea el suyo con el selector,
 * le pone nombre y se agrega como "A pedido". El taller confirma si no tiene ese tono exacto.
 */
export function CustomColorPanel({ offered, palette, onUse, onClose }: CustomColorPanelProps) {
  const tones = EXTRA_TONES.filter(t => !offered.some(o => normalize(o) === normalize(t.name)));
  const [hex, setHex] = useState('');
  const [name, setName] = useState('');
  const [fromPalette, setFromPalette] = useState<string | null>(null);

  const pickTone = (tone: ColorOption) => {
    setHex(tone.hex);
    setName(tone.name);
    setFromPalette(tone.name);
  };

  const pickOwn = (value: string) => {
    setHex(value);
    setFromPalette(null);
    // Si venía de la paleta, el nombre ya no corresponde
    if (!name || EXTRA_TONES.some(t => t.name === name)) setName('');
  };

  const ready = /^#[0-9a-f]{6}$/i.test(hex) && name.trim().length > 0;
  const light = hex ? isLightColor(customColorValue(name || 'x', hex), palette) : false;

  return (
    <div className="mt-4 rounded-2xl border border-[#ece3da] bg-[#fdfbf8] p-4 animate-in fade-in slide-in-from-top-1 duration-200">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[#4a3933]">¿No ves tu color?</p>
          <p className="mt-0.5 text-xs leading-relaxed text-[#887870]">Elige un tono o crea el tuyo. Si no tenemos ese tono exacto, te escribimos antes de prepararlo.</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Cerrar" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#887870] hover:bg-white hover:text-[#4a3933]">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-5 gap-x-1.5 gap-y-2.5 sm:grid-cols-7">
        {tones.map(tone => {
          const active = fromPalette === tone.name;
          return (
            <button key={tone.name} type="button" onClick={() => pickTone(tone)} aria-pressed={active} className="group flex flex-col items-center gap-1">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full transition ${active ? 'scale-105 ring-2 ring-[#c8a96b] ring-offset-2 ring-offset-[#fdfbf8]' : 'ring-1 ring-black/10 group-hover:ring-[#c8a96b]/60'}`}
                style={{ background: tone.hex }}
              >
                {active && <Check className={`h-3.5 w-3.5 ${isLightColor(customColorValue(tone.name, tone.hex)) ? 'text-[#4a3933]' : 'text-white'}`} strokeWidth={3} />}
              </span>
              <span className={`text-center text-[10px] leading-tight ${active ? 'font-bold text-[#4a3933]' : 'text-[#887870]'}`}>{tone.name}</span>
            </button>
          );
        })}
        {/* Cualquier otro tono con el selector del sistema */}
        <label className="group flex cursor-pointer flex-col items-center gap-1">
          <span className={`relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full transition ${hex && !fromPalette ? 'scale-105 ring-2 ring-[#c8a96b] ring-offset-2 ring-offset-[#fdfbf8]' : 'ring-1 ring-black/10 group-hover:ring-[#c8a96b]/60'}`}
            style={{ background: hex && !fromPalette ? hex : 'conic-gradient(from 90deg, #ef4444, #facc15, #22c55e, #3b82f6, #d946ef, #ef4444)' }}>
            <Palette className="h-4 w-4 text-white drop-shadow" />
            <input type="color" value={hex || '#c8a96b'} onChange={e => pickOwn(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" aria-label="Elegir mi propio tono" />
          </span>
          <span className={`text-center text-[10px] leading-tight ${hex && !fromPalette ? 'font-bold text-[#4a3933]' : 'text-[#887870]'}`}>Mi tono</span>
        </label>
      </div>

      {hex && (
        <div className="mt-4 flex flex-col gap-3 border-t border-[#efe6dd] pt-4 sm:flex-row sm:items-end">
          <label className="block flex-1">
            <span className="mb-1.5 block text-xs font-bold text-[#887870]">Nombre del color</span>
            <span className="flex h-11 items-center gap-2.5 rounded-xl border border-[#e8dcdc] bg-white px-3 focus-within:border-[#c8a96b] focus-within:ring-4 focus-within:ring-[#c8a96b]/15">
              <span className={`h-6 w-6 shrink-0 rounded-full ${light ? 'ring-1 ring-inset ring-black/15' : ''}`} style={{ background: hex }} />
              <input
                value={name}
                onChange={e => { setName(cleanCustomColorName(e.target.value)); setFromPalette(null); }}
                maxLength={CUSTOM_COLOR_NAME_MAX}
                placeholder="Ej. Verde menta"
                className="min-w-0 flex-1 bg-transparent text-sm text-[#4a3933] outline-none placeholder:text-[#b7a9a0]"
              />
            </span>
          </label>
          <button
            type="button"
            disabled={!ready}
            onClick={() => onUse(customColorValue(name, hex))}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#4a3933] px-5 text-sm font-bold text-white transition hover:bg-[#3a2d28] disabled:opacity-40"
          >
            <Check className="h-4 w-4" /> Usar este color
          </button>
        </div>
      )}
    </div>
  );
}
