"use client";

import React, { useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { ColorOption } from '@/types/products';
import { useAdminCustomizationOptions, useUpdateCustomizationOptions } from '@/hooks/use-customization-options';
import { DEFAULT_COLORS, DEFAULT_FLOWER_TYPES, colorBackground } from '@/lib/product-options';

interface ProductOptionsPickerProps {
  colors: string[];
  flowers: string[];
  onColorsChange: (colors: string[]) => void;
  onFlowersChange: (flowers: string[]) => void;
  disabled?: boolean;
}

const toggle = (list: string[], value: string) =>
  list.includes(value) ? list.filter(v => v !== value) : [...list, value];

/**
 * Colores y flores que ofrece el producto, elegidos de la paleta del negocio (cada uno es una opción,
 * nunca texto con comas). Lo nuevo se agrega a la paleta y queda disponible para todos los productos.
 */
export function ProductOptionsPicker({ colors, flowers, onColorsChange, onFlowersChange, disabled }: ProductOptionsPickerProps) {
  const { data } = useAdminCustomizationOptions();
  const { mutateAsync: saveOptions, isPending: isSavingPalette } = useUpdateCustomizationOptions();

  const palette: ColorOption[] = data?.colors ?? DEFAULT_COLORS;
  const flowerOptions = data?.flowerTypes ?? DEFAULT_FLOWER_TYPES;

  // Opciones antiguas del producto que no están en la paleta: se muestran para poder quitarlas
  const extraColors = colors.filter(c => !palette.some(p => p.name.toLowerCase() === c.toLowerCase()));
  const extraFlowers = flowers.filter(f => !flowerOptions.some(o => o.toLowerCase() === f.toLowerCase()));

  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#d38b8b');
  const [newFlower, setNewFlower] = useState('');

  const addColor = async () => {
    const name = newColorName.trim();
    if (!name) return;
    if (name.includes(',')) {
      toast.error('Agrega un color a la vez (sin comas).');
      return;
    }
    if (!palette.some(p => p.name.toLowerCase() === name.toLowerCase())) {
      try {
        await saveOptions({ colors: [...palette, { name, hex: newColorHex }], flowerTypes: flowerOptions });
      } catch {
        toast.error('No se pudo guardar el color en la paleta.');
        return;
      }
    }
    if (!colors.includes(name)) onColorsChange([...colors, name]);
    setNewColorName('');
  };

  const addFlower = async () => {
    const name = newFlower.trim();
    if (!name) return;
    if (name.includes(',')) {
      toast.error('Agrega un tipo de flor a la vez (sin comas).');
      return;
    }
    if (!flowerOptions.some(f => f.toLowerCase() === name.toLowerCase())) {
      try {
        await saveOptions({ colors: palette, flowerTypes: [...flowerOptions, name] });
      } catch {
        toast.error('No se pudo guardar la flor en la lista.');
        return;
      }
    }
    if (!flowers.includes(name)) onFlowersChange([...flowers, name]);
    setNewFlower('');
  };

  return (
    <div className="space-y-5">
      {/* Colores */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-sage">Colores que puede elegir el cliente</span>
          <div className="flex items-center gap-2 text-[11px]">
            <button type="button" disabled={disabled} onClick={() => onColorsChange(palette.map(p => p.name))} className="font-semibold text-gold hover:underline">Todos</button>
            <span className="text-sage/40">·</span>
            <button type="button" disabled={disabled} onClick={() => onColorsChange([])} className="font-semibold text-sage hover:underline">Ninguno</button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {[...palette.map(p => p.name), ...extraColors].map(name => {
            const selected = colors.includes(name);
            return (
              <button
                key={name}
                type="button"
                disabled={disabled}
                onClick={() => onColorsChange(toggle(colors, name))}
                aria-pressed={selected}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  selected ? 'border-brown bg-brown text-white shadow-sm' : 'border-sage/20 bg-white text-brown/80 hover:border-gold/60'
                }`}
              >
                <span className="h-3.5 w-3.5 shrink-0 rounded-full ring-1 ring-black/10" style={{ background: colorBackground(name, palette) }} />
                {name}
                {selected && <Check size={12} className="text-gold" />}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            type="color"
            value={newColorHex}
            onChange={e => setNewColorHex(e.target.value)}
            disabled={disabled}
            className="h-8 w-10 cursor-pointer rounded-lg border border-sage/20 bg-white p-0.5"
            aria-label="Color nuevo"
          />
          <input
            type="text"
            value={newColorName}
            onChange={e => setNewColorName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); void addColor(); } }}
            maxLength={40}
            disabled={disabled}
            placeholder="Nuevo color (ej. Verde menta)"
            className="min-w-[180px] flex-1 rounded-lg border border-sage/20 bg-white px-3 py-1.5 text-xs outline-none focus:border-gold"
          />
          <button
            type="button"
            onClick={() => void addColor()}
            disabled={disabled || isSavingPalette || !newColorName.trim()}
            className="inline-flex items-center gap-1 rounded-lg border border-sage/20 bg-white px-3 py-1.5 text-xs font-semibold text-brown hover:bg-sage/10 disabled:opacity-40"
          >
            <Plus size={12} /> Agregar a la paleta
          </button>
        </div>
      </div>

      {/* Flores */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-sage">Tipos de flor</span>
          <button type="button" disabled={disabled} onClick={() => onFlowersChange([])} className="text-[11px] font-semibold text-sage hover:underline">Ninguno</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {[...flowerOptions, ...extraFlowers].map(name => {
            const selected = flowers.includes(name);
            return (
              <button
                key={name}
                type="button"
                disabled={disabled}
                onClick={() => onFlowersChange(toggle(flowers, name))}
                aria-pressed={selected}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  selected ? 'border-gold bg-gold text-white shadow-sm' : 'border-sage/20 bg-white text-brown/80 hover:border-gold/60'
                }`}
              >
                {name}
                {selected && <Check size={12} />}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <input
            type="text"
            value={newFlower}
            onChange={e => setNewFlower(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); void addFlower(); } }}
            maxLength={40}
            disabled={disabled}
            placeholder="Nueva flor (ej. Ranúnculos)"
            className="flex-1 rounded-lg border border-sage/20 bg-white px-3 py-1.5 text-xs outline-none focus:border-gold"
          />
          <button
            type="button"
            onClick={() => void addFlower()}
            disabled={disabled || isSavingPalette || !newFlower.trim()}
            className="inline-flex items-center gap-1 rounded-lg border border-sage/20 bg-white px-3 py-1.5 text-xs font-semibold text-brown hover:bg-sage/10 disabled:opacity-40"
          >
            <Plus size={12} /> Agregar a la lista
          </button>
        </div>
      </div>
    </div>
  );
}
