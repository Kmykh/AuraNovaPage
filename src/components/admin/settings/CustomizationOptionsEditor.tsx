"use client";

import React, { useState } from 'react';
import { Palette, Plus, Save, Trash2, Loader2 } from 'lucide-react';
import { ColorOption } from '@/types/products';
import { useAdminCustomizationOptions, useUpdateCustomizationOptions } from '@/hooks/use-customization-options';
import { ApiProblemDetails } from '@/lib/api-errors';
import { toast } from 'sonner';

/** Paleta de colores y tipos de flor del negocio: lo que se ofrece al crear productos. */
export function CustomizationOptionsEditor() {
  const { data, isLoading } = useAdminCustomizationOptions();
  if (isLoading || !data) {
    return <div className="h-40 animate-pulse rounded-[24px] bg-sage/10" />;
  }
  // Se monta con los datos ya cargados: el formulario parte de lo guardado
  return <EditorForm initialColors={data.colors} initialFlowers={data.flowerTypes} />;
}

function EditorForm({ initialColors, initialFlowers }: { initialColors: ColorOption[]; initialFlowers: string[] }) {
  const { mutate: save, isPending } = useUpdateCustomizationOptions();
  const [colors, setColors] = useState<ColorOption[]>(initialColors);
  const [flowers, setFlowers] = useState<string[]>(initialFlowers);
  const [newFlower, setNewFlower] = useState('');

  const updateColor = (index: number, patch: Partial<ColorOption>) =>
    setColors(prev => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)));

  const addFlower = () => {
    const name = newFlower.trim();
    if (!name || flowers.some(f => f.toLowerCase() === name.toLowerCase())) return;
    setFlowers(prev => [...prev, name]);
    setNewFlower('');
  };

  const handleSave = () => {
    save({ colors: colors.filter(c => c.name.trim()), flowerTypes: flowers }, {
      onError: (error) => {
        toast.error(error instanceof ApiProblemDetails && error.detail ? error.detail : 'No se pudieron guardar las opciones.');
      },
    });
  };

  return (
    <section className="mx-auto mt-8 max-w-6xl rounded-[24px] border border-sage/15 bg-white p-5 shadow-sm sm:p-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-gold"><Palette size={20} /></span>
          <div>
            <h2 className="text-lg font-bold text-brown">Opciones de personalización</h2>
            <p className="text-xs text-sage">Colores (con su muestra) y flores que podrás activar en cada producto. Cada opción va por separado.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-[#c8a96b] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#b09355] disabled:opacity-60"
        >
          {isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Guardar opciones
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-sage">Colores ({colors.length})</h3>
          <ul className="space-y-2">
            {colors.map((color, index) => (
              <li key={index} className="flex items-center gap-2">
                {color.hex === 'multicolor' ? (
                  <span
                    className="h-9 w-10 shrink-0 rounded-lg ring-1 ring-black/10"
                    style={{ background: 'conic-gradient(from 45deg, #ef4444, #facc15, #22c55e, #3b82f6, #d946ef, #ef4444)' }}
                    title="Multicolor"
                  />
                ) : (
                  <input
                    type="color"
                    value={color.hex}
                    onChange={e => updateColor(index, { hex: e.target.value })}
                    className="h-9 w-10 shrink-0 cursor-pointer rounded-lg border border-sage/20 bg-white p-0.5"
                    aria-label={`Color de ${color.name}`}
                  />
                )}
                <input
                  type="text"
                  value={color.name}
                  maxLength={40}
                  onChange={e => updateColor(index, { name: e.target.value.replace(/,/g, '') })}
                  className="flex-1 rounded-lg border border-sage/20 bg-[#FAF9F6] px-3 py-2 text-sm text-brown outline-none focus:border-gold focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setColors(prev => prev.filter((_, i) => i !== index))}
                  className="rounded-lg p-2 text-sage hover:bg-rose-50 hover:text-rose-600"
                  aria-label={`Quitar ${color.name}`}
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setColors(prev => [...prev, { name: '', hex: '#d38b8b' }])}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-sage/30 px-3 py-2 text-xs font-semibold text-brown hover:border-gold"
          >
            <Plus size={14} /> Agregar color
          </button>
          <p className="mt-2 text-[11px] text-sage">Cambiar un nombre no modifica los productos que ya lo usan: revisa sus colores después.</p>
        </div>

        <div>
          <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-sage">Tipos de flor ({flowers.length})</h3>
          <div className="flex flex-wrap gap-2">
            {flowers.map(flower => (
              <span key={flower} className="inline-flex items-center gap-1.5 rounded-full border border-sage/20 bg-[#FAF9F6] py-1 pl-3 pr-1.5 text-xs font-medium text-brown">
                {flower}
                <button
                  type="button"
                  onClick={() => setFlowers(prev => prev.filter(f => f !== flower))}
                  className="rounded-full p-0.5 text-sage hover:bg-rose-50 hover:text-rose-600"
                  aria-label={`Quitar ${flower}`}
                >
                  <Trash2 size={12} />
                </button>
              </span>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={newFlower}
              maxLength={40}
              onChange={e => setNewFlower(e.target.value.replace(/,/g, ''))}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addFlower(); } }}
              placeholder="Nueva flor"
              className="flex-1 rounded-lg border border-sage/20 bg-[#FAF9F6] px-3 py-2 text-sm outline-none focus:border-gold focus:bg-white"
            />
            <button type="button" onClick={addFlower} className="inline-flex items-center gap-1 rounded-lg border border-sage/20 px-3 py-2 text-xs font-semibold text-brown hover:bg-sage/10">
              <Plus size={14} /> Agregar
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
