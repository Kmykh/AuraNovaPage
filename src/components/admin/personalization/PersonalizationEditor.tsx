"use client";

import React, { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  Check, Flower2, Lightbulb, Loader2, Palette, Plus, Save, Sparkles, Trash2, Undo2,
} from 'lucide-react';
import { AccessoryOption, ColorOption } from '@/types/products';
import { useAdminCustomizationOptions, useUpdateCustomizationOptions } from '@/hooks/use-customization-options';
import { ApiProblemDetails } from '@/lib/api-errors';
import { DEFAULT_ACCESSORIES, accessoryPriceLabel } from '@/lib/product-options';

type Tab = 'accesorios' | 'colores' | 'flores';

/** Precio como texto mientras se escribe ("1.5", "") y se convierte al guardar. */
type AccessoryDraft = Omit<AccessoryOption, 'price'> & { price: string; id: string };

const MAX_NAME = 40;
const MAX_PRICE = 1000;

/** Ideas para ramos artesanales: se agregan con un toque y luego se pone el precio. */
const SUGGESTIONS = [
  'Perlas', 'Lazo de satén', 'Corona', 'Glitter', 'Peluche mini', 'Chocolates', 'Globo', 'Foto polaroid', 'Mariposas', 'Luces LED',
];

const MULTICOLOR = 'conic-gradient(from 45deg, #ef4444, #facc15, #22c55e, #3b82f6, #d946ef, #ef4444)';

// La clave del backend es única; los nuevos aún no la tienen
const toDraft = (a: AccessoryOption, index: number): AccessoryDraft => ({ ...a, price: a.price ? String(a.price) : '0', id: a.key ?? `i${index}` });

/** Colores, flores y accesorios con precio: todo lo que el cliente puede elegir al armar su detalle. */
export function PersonalizationEditor() {
  const { data, isLoading } = useAdminCustomizationOptions();
  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <div className="h-12 w-72 animate-pulse rounded-2xl bg-sage/10" />
        <div className="h-96 animate-pulse rounded-[24px] bg-sage/10" />
      </div>
    );
  }
  // Se monta con los datos ya cargados: el formulario parte de lo guardado
  return (
    <EditorForm
      initialColors={data.colors}
      initialFlowers={data.flowerTypes}
      initialAccessories={data.accessories?.length ? data.accessories : DEFAULT_ACCESSORIES}
    />
  );
}

function EditorForm({ initialColors, initialFlowers, initialAccessories }: {
  initialColors: ColorOption[]; initialFlowers: string[]; initialAccessories: AccessoryOption[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const tab: Tab = tabParam === 'colores' || tabParam === 'flores' ? tabParam : 'accesorios';
  const setTab = (next: Tab) => router.replace(`/admin/personalizacion?tab=${next}`, { scroll: false });

  const { mutate: save, isPending } = useUpdateCustomizationOptions();
  const [colors, setColors] = useState<ColorOption[]>(initialColors);
  const [flowers, setFlowers] = useState<string[]>(initialFlowers);
  const [accessories, setAccessories] = useState<AccessoryDraft[]>(() => initialAccessories.map(toDraft));
  const [newFlower, setNewFlower] = useState('');
  // Lo último guardado, para saber si hay cambios pendientes
  const [saved, setSaved] = useState(() => snapshot(initialColors, initialFlowers, initialAccessories.map(toDraft)));

  const current = snapshot(colors, flowers, accessories);
  const dirty = current !== saved;

  const accessoryErrors = useMemo(() => validateAccessories(accessories), [accessories]);
  const firstError = Object.values(accessoryErrors)[0];

  const updateAccessory = (id: string, patch: Partial<AccessoryDraft>) =>
    setAccessories(prev => prev.map(a => (a.id === id ? { ...a, ...patch } : a)));

  const addAccessory = (name = '') => {
    if (name && accessories.some(a => a.name.trim().toLowerCase() === name.toLowerCase())) {
      toast.info(`"${name}" ya está en tu lista.`);
      return;
    }
    setAccessories(prev => [...prev, { id: `new-${Date.now()}`, name, price: '0', active: true }]);
  };

  const addFlower = () => {
    const name = newFlower.trim();
    if (!name || flowers.some(f => f.toLowerCase() === name.toLowerCase())) return;
    setFlowers(prev => [...prev, name]);
    setNewFlower('');
  };

  const reset = () => {
    setColors(initialColors);
    setFlowers(initialFlowers);
    setAccessories(initialAccessories.map(toDraft));
  };

  const handleSave = () => {
    if (firstError) {
      setTab('accesorios');
      toast.error('Revisa los accesorios', { description: firstError });
      return;
    }
    const request = {
      colors: colors.filter(c => c.name.trim()),
      flowerTypes: flowers,
      accessories: accessories
        .filter(a => a.name.trim())
        .map(a => ({ key: a.key, name: a.name.trim(), price: Math.round(parsePrice(a.price) * 100) / 100, active: a.active })),
    };
    save(request, {
      onSuccess: data => {
        // Los nuevos reciben su clave del backend
        const fresh = (data.accessories ?? []).map(toDraft);
        setAccessories(fresh);
        setColors(data.colors);
        setFlowers(data.flowerTypes);
        setSaved(snapshot(data.colors, data.flowerTypes, fresh));
      },
      onError: error => {
        toast.error(error instanceof ApiProblemDetails && error.detail ? error.detail : 'No se pudieron guardar los cambios.');
      },
    });
  };

  const activeAccessories = accessories.filter(a => a.active && a.name.trim());
  const tabs: { id: Tab; label: string; icon: React.ElementType; count: number }[] = [
    { id: 'accesorios', label: 'Accesorios', icon: Sparkles, count: accessories.length },
    { id: 'colores', label: 'Colores', icon: Palette, count: colors.length },
    { id: 'flores', label: 'Flores', icon: Flower2, count: flowers.length },
  ];

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500">
      <div>
        <h1 className="flex items-center gap-2 font-serif text-2xl font-bold text-brown">
          <Sparkles className="text-gold" /> Personalización
        </h1>
        <p className="mt-1 text-sage">Lo que tus clientes eligen al armar su detalle. En cada producto marcas cuáles ofrece.</p>
      </div>

      {/* Pestañas */}
      <div className="grid grid-cols-3 gap-1 rounded-2xl border border-sage/15 bg-white p-1 shadow-sm sm:inline-flex" role="tablist">
        {tabs.map(t => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-2 py-2.5 text-sm font-semibold transition sm:gap-2 sm:px-4 ${
                active ? 'bg-brown text-white shadow-sm' : 'text-sage hover:bg-cream/60 hover:text-brown'
              }`}
            >
              <t.icon size={16} className={`hidden sm:block ${active ? 'text-gold' : ''}`} />
              {t.label}
              <span className={`rounded-full px-1.5 text-[11px] ${active ? 'bg-white/15' : 'bg-sage/10'}`}>{t.count}</span>
            </button>
          );
        })}
      </div>

      {tab === 'accesorios' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_20rem]">
          <section className="rounded-[24px] border border-sage/15 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4">
              <h2 className="font-bold text-brown">Accesorios y su precio extra</h2>
              <p className="text-xs text-sage">El precio se suma a cada unidad. Con S/ 0 se muestra como incluido. Desactívalo si se te acabó: deja de mostrarse sin perderlo.</p>
            </div>

            {accessories.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-sage/25 px-4 py-8 text-center text-sm text-sage">
                Aún no tienes accesorios. Agrega uno o elige una idea de abajo.
              </p>
            ) : (
              <ul className="space-y-2.5">
                {accessories.map(accessory => {
                  const error = accessoryErrors[accessory.id];
                  return (
                    <li
                      key={accessory.id}
                      className={`rounded-2xl border p-3 transition ${accessory.active ? 'border-sage/15 bg-[#FAF9F6]' : 'border-dashed border-sage/25 bg-white opacity-70'}`}
                    >
                      <div className="grid grid-cols-[1fr_auto] items-center gap-2 sm:grid-cols-[1fr_8.5rem_auto_auto]">
                        <input
                          type="text"
                          value={accessory.name}
                          maxLength={MAX_NAME}
                          onChange={e => updateAccessory(accessory.id, { name: e.target.value.replace(/,/g, '') })}
                          placeholder="Nombre (ej. Perlas)"
                          aria-label="Nombre del accesorio"
                          autoFocus={!accessory.name && !accessory.key}
                          className="min-w-0 rounded-xl border border-sage/20 bg-white px-3 py-2.5 text-sm font-semibold text-brown outline-none focus:border-gold"
                        />
                        <button
                          type="button"
                          onClick={() => setAccessories(prev => prev.filter(a => a.id !== accessory.id))}
                          className="rounded-xl p-2.5 text-sage hover:bg-rose-50 hover:text-rose-600 sm:order-last"
                          aria-label={`Eliminar ${accessory.name || 'accesorio'}`}
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                        <label className="relative flex items-center">
                          <span className="pointer-events-none absolute left-3 text-xs font-bold text-sage">+ S/</span>
                          <input
                            type="number"
                            inputMode="decimal"
                            min={0}
                            max={MAX_PRICE}
                            step={0.5}
                            value={accessory.price}
                            onChange={e => updateAccessory(accessory.id, { price: e.target.value })}
                            aria-label={`Precio extra de ${accessory.name || 'accesorio'}`}
                            className="w-full rounded-xl border border-sage/20 bg-white py-2.5 pl-11 pr-3 text-sm font-bold text-brown outline-none focus:border-gold"
                          />
                        </label>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={accessory.active}
                          onClick={() => updateAccessory(accessory.id, { active: !accessory.active })}
                          className="inline-flex items-center justify-end gap-2 rounded-xl px-2 py-2 text-xs font-semibold text-sage"
                        >
                          <span className={`relative h-5 w-9 rounded-full transition ${accessory.active ? 'bg-emerald-500' : 'bg-sage/30'}`}>
                            <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${accessory.active ? 'left-[18px]' : 'left-0.5'}`} />
                          </span>
                          <span className={`w-14 text-left ${accessory.active ? 'text-emerald-700' : ''}`}>{accessory.active ? 'Activo' : 'Pausado'}</span>
                        </button>
                      </div>
                      {error && <p className="mt-1.5 px-1 text-xs font-semibold text-rose-600">{error}</p>}
                    </li>
                  );
                })}
              </ul>
            )}

            <button
              type="button"
              onClick={() => addAccessory()}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-dashed border-gold/50 px-4 py-2.5 text-sm font-semibold text-brown hover:border-gold hover:bg-gold/5"
            >
              <Plus size={16} /> Agregar accesorio
            </button>

            <div className="mt-6 border-t border-dashed border-sage/20 pt-4">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-sage">Ideas para ramos artesanales</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.filter(s => !accessories.some(a => a.name.trim().toLowerCase() === s.toLowerCase())).map(suggestion => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => addAccessory(suggestion)}
                    className="inline-flex items-center gap-1 rounded-full border border-sage/20 bg-white px-3 py-1.5 text-xs font-medium text-brown hover:border-gold"
                  >
                    <Plus size={12} /> {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Vista del cliente */}
          <aside className="h-fit rounded-[24px] border border-gold/25 bg-gradient-to-br from-[#fffdf8] to-[#faf4ea] p-5 lg:sticky lg:top-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">Así lo ve el cliente</p>
            <p className="mt-1 font-serif text-lg font-bold text-brown">Accesorios</p>
            <p className="text-xs text-sage">Opcional. Se suman al precio de cada unidad.</p>
            <div className="mt-4 space-y-2">
              {activeAccessories.length === 0 && <p className="text-xs text-sage">No hay accesorios activos: este paso no aparece.</p>}
              {activeAccessories.slice(0, 6).map((a, index) => (
                <div
                  key={a.id}
                  className={`flex items-center gap-3 rounded-2xl border p-3 ${index === 0 ? 'border-gold bg-[#fdf8ee]' : 'border-[#e8dcdc] bg-white'}`}
                >
                  <span className={`flex h-9 w-9 items-center justify-center rounded-full ${index === 0 ? 'bg-gold text-white' : 'bg-[#fdf8ee] text-gold'}`}>
                    {a.key?.startsWith('luces') ? <Lightbulb size={16} /> : a.key?.startsWith('mariposa') ? <span aria-hidden>🦋</span> : <Sparkles size={16} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-brown">{a.name}</span>
                    <span className="block text-xs text-sage">{accessoryPriceLabel(parsePrice(a.price))}</span>
                  </span>
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${index === 0 ? 'border-gold bg-gold text-white' : 'border-[#d9cfc8]'}`}>
                    {index === 0 && <Check size={12} strokeWidth={3} />}
                  </span>
                </div>
              ))}
              {activeAccessories.length > 6 && <p className="text-center text-xs text-sage">y {activeAccessories.length - 6} más</p>}
            </div>
          </aside>
        </div>
      )}

      {tab === 'colores' && (
        <section className="rounded-[24px] border border-sage/15 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4">
            <h2 className="font-bold text-brown">Paleta de colores</h2>
            <p className="text-xs text-sage">Con su muestra. El cliente también puede pedir otro tono con “Otro color”.</p>
          </div>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {colors.map((color, index) => (
              <li key={index} className="flex items-center gap-2 rounded-xl border border-sage/10 bg-[#FAF9F6] p-1.5">
                {color.hex === 'multicolor' ? (
                  <span className="h-9 w-10 shrink-0 rounded-lg ring-1 ring-black/10" style={{ background: MULTICOLOR }} title="Multicolor" />
                ) : (
                  <input
                    type="color"
                    value={color.hex}
                    onChange={e => setColors(prev => prev.map((c, i) => (i === index ? { ...c, hex: e.target.value } : c)))}
                    className="h-9 w-10 shrink-0 cursor-pointer rounded-lg border border-sage/20 bg-white p-0.5"
                    aria-label={`Muestra de ${color.name}`}
                  />
                )}
                <input
                  type="text"
                  value={color.name}
                  maxLength={MAX_NAME}
                  onChange={e => setColors(prev => prev.map((c, i) => (i === index ? { ...c, name: e.target.value.replace(/,/g, '') } : c)))}
                  className="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-2 py-2 text-sm text-brown outline-none focus:border-gold focus:bg-white"
                  aria-label="Nombre del color"
                />
                <button
                  type="button"
                  onClick={() => setColors(prev => prev.filter((_, i) => i !== index))}
                  className="rounded-lg p-2 text-sage hover:bg-rose-50 hover:text-rose-600"
                  aria-label={`Quitar ${color.name}`}
                >
                  <Trash2 size={15} />
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setColors(prev => [...prev, { name: '', hex: '#d38b8b' }])}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-dashed border-gold/50 px-4 py-2.5 text-sm font-semibold text-brown hover:border-gold hover:bg-gold/5"
          >
            <Plus size={16} /> Agregar color
          </button>
          <p className="mt-2 text-[11px] text-sage">Cambiar un nombre no modifica los productos que ya lo usan: revisa sus colores después.</p>
        </section>
      )}

      {tab === 'flores' && (
        <section className="rounded-[24px] border border-sage/15 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4">
            <h2 className="font-bold text-brown">Tipos de flor</h2>
            <p className="text-xs text-sage">Las que podrás activar en cada producto.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {flowers.map(flower => (
              <span key={flower} className="inline-flex items-center gap-1.5 rounded-full border border-sage/20 bg-[#FAF9F6] py-1.5 pl-3.5 pr-1.5 text-sm font-medium text-brown">
                <Flower2 size={13} className="text-[#9c5365]" /> {flower}
                <button
                  type="button"
                  onClick={() => setFlowers(prev => prev.filter(f => f !== flower))}
                  className="rounded-full p-1 text-sage hover:bg-rose-50 hover:text-rose-600"
                  aria-label={`Quitar ${flower}`}
                >
                  <Trash2 size={12} />
                </button>
              </span>
            ))}
          </div>
          <div className="mt-4 flex max-w-md gap-2">
            <input
              type="text"
              value={newFlower}
              maxLength={MAX_NAME}
              onChange={e => setNewFlower(e.target.value.replace(/,/g, ''))}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addFlower(); } }}
              placeholder="Nueva flor"
              className="min-w-0 flex-1 rounded-xl border border-sage/20 bg-[#FAF9F6] px-3 py-2.5 text-sm outline-none focus:border-gold focus:bg-white"
            />
            <button type="button" onClick={addFlower} className="inline-flex items-center gap-1 rounded-xl border border-sage/20 px-4 py-2.5 text-sm font-semibold text-brown hover:bg-sage/10">
              <Plus size={15} /> Agregar
            </button>
          </div>
        </section>
      )}

      {/* Guardar: siempre a la mano, se resalta cuando hay cambios */}
      <div className="sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sage/15 bg-white/95 px-4 py-3 shadow-[0_12px_32px_-16px_rgba(74,57,51,0.45)] backdrop-blur">
        <p className={`text-sm ${dirty ? 'font-semibold text-brown' : 'text-sage'}`}>
          {dirty ? 'Tienes cambios sin guardar.' : 'Todo está guardado.'}
        </p>
        <div className="flex gap-2">
          {dirty && (
            <button type="button" onClick={reset} disabled={isPending} className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-sage hover:bg-sage/10 hover:text-brown">
              <Undo2 size={15} /> Deshacer
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending || !dirty}
            className="inline-flex items-center gap-2 rounded-xl bg-[#c8a96b] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#b09355] disabled:opacity-50"
          >
            {isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}

const parsePrice = (value: string) => {
  const n = parseFloat(value.replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
};

/** Mismas reglas que el backend: nombre único y precio entre 0 y 1000. */
function validateAccessories(list: AccessoryDraft[]): Record<string, string> {
  const errors: Record<string, string> = {};
  const seen = new Set<string>();
  for (const a of list) {
    const name = a.name.trim();
    const price = parseFloat(a.price.replace(',', '.'));
    if (!name) errors[a.id] = 'Escribe un nombre o elimínalo.';
    else if (seen.has(name.toLowerCase())) errors[a.id] = `"${name}" está repetido.`;
    else if (a.price.trim() !== '' && (!Number.isFinite(price) || price < 0 || price > MAX_PRICE)) errors[a.id] = `El precio debe estar entre S/ 0 y S/ ${MAX_PRICE}.`;
    seen.add(name.toLowerCase());
  }
  return errors;
}

function snapshot(colors: ColorOption[], flowers: string[], accessories: AccessoryDraft[]) {
  return JSON.stringify([colors, flowers, accessories.map(a => [a.key, a.name.trim(), parsePrice(a.price), a.active])]);
}
