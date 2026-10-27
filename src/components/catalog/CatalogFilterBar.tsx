"use client";

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowUpDown, Check, Flame, Flower2, Gift, LayoutGrid, Search, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import { Category } from '@/types/categories';
import { getImageUrl } from '@/lib/formatters';

export type CatalogSort = 'recomendados' | 'precio-asc' | 'precio-desc' | 'nuevos';
export type CatalogAudience = '' | 'Chicas' | 'Chicos' | 'Unisex';

export const SORTS: { value: CatalogSort; label: string }[] = [
  { value: 'recomendados', label: 'Recomendados' },
  { value: 'nuevos', label: 'Lo más nuevo' },
  { value: 'precio-asc', label: 'Menor precio' },
  { value: 'precio-desc', label: 'Mayor precio' },
];

export const AUDIENCES: { value: CatalogAudience; label: string; emoji: string }[] = [
  { value: '', label: 'Todos', emoji: '✨' },
  { value: 'Chicas', label: 'Para ella', emoji: '🌷' },
  { value: 'Chicos', label: 'Para él', emoji: '🌻' },
  { value: 'Unisex', label: 'Unisex', emoji: '💐' },
];

export interface CategoryChip {
  category: Category;
  count: number;
  imageUrl: string | null;
}

interface CatalogFilterBarProps {
  categories: CategoryChip[];
  campaign: { name: string; count: number; imageUrl: string | null } | null;
  category: string;
  campaignOnly: boolean;
  audience: CatalogAudience;
  sort: CatalogSort;
  query: string;
  resultCount: number;
  onCategory: (slug: string) => void;
  onCampaign: () => void;
  onAudience: (value: CatalogAudience) => void;
  onSort: (value: CatalogSort) => void;
  onQuery: (value: string) => void;
  onClear: () => void;
}

function categoryIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes('ramo')) return Gift;
  if (lower.includes('flor')) return Flower2;
  return Sparkles;
}

/** Tarjetas de categoría con foto (se desplazan con el dedo) y una barra fija con búsqueda, público y orden. */
export function CatalogFilterBar(props: CatalogFilterBarProps) {
  const { categories, campaign, category, campaignOnly, audience, sort, query, resultCount } = props;
  const [sheetOpen, setSheetOpen] = useState(false);
  const [text, setText] = useState(query);
  const typing = useRef<ReturnType<typeof setTimeout> | null>(null);

  // La URL se actualiza al dejar de escribir (no en cada letra)
  const changeText = (value: string) => {
    setText(value);
    if (typing.current) clearTimeout(typing.current);
    typing.current = setTimeout(() => props.onQuery(value.trim()), 250);
  };

  const activeCount = (audience ? 1 : 0) + (sort !== 'recomendados' ? 1 : 0);
  const hasFilters = !!(category || campaignOnly || audience || query || sort !== 'recomendados');
  const selectedCategory = categories.find(c => c.category.slug === category)?.category;

  // Fragmento: la barra queda fija mientras se recorren los productos (su contenedor es toda la página)
  return (
    <>
      {/* Categorías como tarjetas */}
      <div className="-mx-4 overflow-x-auto px-4 pb-1 pt-1.5 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
        <div className="flex snap-x gap-3 sm:flex-wrap sm:justify-center">
          <CategoryTile
            label="Todo"
            count={null}
            active={!category && !campaignOnly}
            onClick={() => props.onCategory('')}
            icon={<LayoutGrid className="h-6 w-6" />}
          />
          {campaign && (
            <CategoryTile
              label={campaign.name}
              count={campaign.count}
              active={campaignOnly}
              onClick={props.onCampaign}
              imageUrl={campaign.imageUrl}
              highlight
              icon={<Flame className="h-6 w-6" />}
            />
          )}
          {categories.map(({ category: cat, count, imageUrl }) => {
            const Icon = categoryIcon(cat.name);
            return (
              <CategoryTile
                key={cat.id}
                label={cat.name}
                count={count}
                active={category === cat.slug}
                onClick={() => props.onCategory(cat.slug)}
                imageUrl={imageUrl}
                icon={<Icon className="h-6 w-6" />}
              />
            );
          })}
        </div>
      </div>

      {/* Barra fija: búsqueda, público y orden */}
      <div className="sticky top-24 z-30">
        <div className="flex items-center gap-2 rounded-full border border-white/70 bg-white/85 p-1.5 shadow-[0_12px_30px_-18px_rgba(74,57,51,0.45)] backdrop-blur-xl">
          <label className="relative flex min-w-0 flex-1 items-center">
            <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-[#b7a9a0]" />
            <input
              type="search"
              value={text}
              onChange={e => changeText(e.target.value)}
              placeholder={selectedCategory ? `Buscar en ${selectedCategory.name}…` : 'Buscar rosas, girasoles, peluches…'}
              aria-label="Buscar en el catálogo"
              className="h-10 w-full rounded-full bg-transparent pl-10 pr-9 text-sm text-[#4a3933] outline-none placeholder:text-[#b7a9a0] [&::-webkit-search-cancel-button]:hidden"
            />
            {text && (
              <button type="button" onClick={() => changeText('')} className="absolute right-2 rounded-full p-1.5 text-[#887870] hover:bg-stone-100" aria-label="Borrar búsqueda">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </label>

          {/* Computadora: todo a la vista */}
          <div className="hidden items-center gap-1 rounded-full bg-[#f6f1ea] p-1 lg:flex" role="radiogroup" aria-label="Para quién">
            {AUDIENCES.map(a => (
              <button
                key={a.label}
                type="button"
                role="radio"
                aria-checked={audience === a.value}
                onClick={() => props.onAudience(a.value)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  audience === a.value ? 'bg-[#4a3933] text-white shadow-sm' : 'text-[#6b5a50] hover:text-[#4a3933]'
                }`}
              >
                <span aria-hidden className="mr-1">{a.emoji}</span>{a.label}
              </button>
            ))}
          </div>
          <label className="relative hidden lg:block">
            <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#887870]" />
            <select
              value={sort}
              onChange={e => props.onSort(e.target.value as CatalogSort)}
              aria-label="Ordenar"
              className="h-10 cursor-pointer appearance-none rounded-full bg-[#f6f1ea] pl-8 pr-4 text-xs font-semibold text-[#4a3933] outline-none"
            >
              {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </label>

          {/* Celular y tablet: un botón abre las opciones */}
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="relative inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-[#4a3933] px-4 text-xs font-bold text-white lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" /> Filtros
            {activeCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e8c98a] px-1 text-[10px] text-[#4a3933]">{activeCount}</span>
            )}
          </button>
        </div>

        {hasFilters && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5 px-2 text-xs">
            <span className="font-semibold text-[#887870]">{resultCount} {resultCount === 1 ? 'detalle' : 'detalles'}</span>
            {selectedCategory && <ActiveChip label={selectedCategory.name} onRemove={() => props.onCategory('')} />}
            {campaignOnly && campaign && <ActiveChip label={campaign.name} onRemove={props.onCampaign} />}
            {audience && <ActiveChip label={AUDIENCES.find(a => a.value === audience)!.label} onRemove={() => props.onAudience('')} />}
            {query && <ActiveChip label={`"${query}"`} onRemove={() => changeText('')} />}
            {sort !== 'recomendados' && <ActiveChip label={SORTS.find(s => s.value === sort)!.label} onRemove={() => props.onSort('recomendados')} />}
            <button type="button" onClick={() => { setText(''); props.onClear(); }} className="ml-1 font-bold text-[#b08a4e] hover:text-[#4a3933]">Limpiar todo</button>
          </div>
        )}
      </div>

      {sheetOpen && (
        <FilterSheet
          audience={audience}
          sort={sort}
          resultCount={resultCount}
          onAudience={props.onAudience}
          onSort={props.onSort}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </>
  );
}

function CategoryTile({ label, count, active, onClick, imageUrl, icon, highlight }: {
  label: string; count: number | null; active: boolean; onClick: () => void; imageUrl?: string | null; icon: React.ReactNode; highlight?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="group flex w-[5.5rem] shrink-0 snap-start flex-col items-center gap-2 text-center sm:w-24"
    >
      <span
        className={`relative flex h-[4.5rem] w-[4.5rem] items-center justify-center overflow-hidden rounded-[1.6rem] transition duration-300 sm:h-20 sm:w-20 ${
          active
            ? 'ring-[3px] ring-[#c8a96b] ring-offset-2 ring-offset-[#faf7f2]'
            : highlight ? 'ring-2 ring-[#e5a3ad] group-hover:ring-[#8f2d3b]' : 'ring-1 ring-[#e8dcdc] group-hover:ring-[#c8a96b]/60'
        } ${highlight ? 'bg-[#fdf0f2] text-[#8f2d3b]' : 'bg-white text-[#b08a4e]'}`}
      >
        {imageUrl ? (
          <Image src={getImageUrl(imageUrl)} alt="" fill sizes="80px" className="object-cover transition duration-500 group-hover:scale-110" />
        ) : icon}
        {highlight && (
          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-[#8f2d3b] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white">Oferta</span>
        )}
      </span>
      <span className="flex flex-col items-center">
        <span className={`line-clamp-2 text-[11px] font-semibold leading-tight sm:text-xs ${active ? 'text-[#4a3933]' : 'text-[#6b5a50]'}`}>{label}</span>
        {count !== null && <span className="mt-0.5 text-[10px] text-[#a3958c]">{count}</span>}
      </span>
    </button>
  );
}

function ActiveChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[#c8a96b]/40 bg-white py-0.5 pl-2.5 pr-1 font-semibold text-[#4a3933]">
      {label}
      <button type="button" onClick={onRemove} className="rounded-full p-0.5 text-[#887870] hover:bg-stone-100" aria-label={`Quitar ${label}`}>
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

/** Hoja de filtros en el celular: opciones grandes, fáciles de tocar. */
function FilterSheet({ audience, sort, resultCount, onAudience, onSort, onClose }: {
  audience: CatalogAudience; sort: CatalogSort; resultCount: number;
  onAudience: (v: CatalogAudience) => void; onSort: (v: CatalogSort) => void; onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end lg:hidden" role="dialog" aria-modal="true" aria-label="Filtros">
      <button type="button" aria-label="Cerrar" onClick={onClose} className="absolute inset-0 bg-[#4a3933]/30 backdrop-blur-[2px]" />
      <div className="relative w-full rounded-t-[2rem] bg-[#fdfbf8] px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
        <span className="mx-auto mb-4 block h-1.5 w-10 rounded-full bg-stone-300" aria-hidden />
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#b08a4e]">¿Para quién es?</p>
        <div className="grid grid-cols-2 gap-2">
          {AUDIENCES.map(a => (
            <button
              key={a.label}
              type="button"
              onClick={() => onAudience(a.value)}
              className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                audience === a.value ? 'border-[#4a3933] bg-[#4a3933] text-white' : 'border-[#e8dcdc] bg-white text-[#4a3933]'
              }`}
            >
              <span aria-hidden className="text-lg">{a.emoji}</span> {a.label}
              {audience === a.value && <Check className="ml-auto h-4 w-4 text-[#e8c98a]" />}
            </button>
          ))}
        </div>
        <p className="mb-2 mt-5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#b08a4e]">Ordenar por</p>
        <div className="grid grid-cols-2 gap-2">
          {SORTS.map(s => (
            <button
              key={s.value}
              type="button"
              onClick={() => onSort(s.value)}
              className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                sort === s.value ? 'border-[#c8a96b] bg-[#fdf8ee] text-[#4a3933]' : 'border-[#e8dcdc] bg-white text-[#6b5a50]'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <button type="button" onClick={onClose} className="mt-6 h-12 w-full rounded-full bg-[#4a3933] text-sm font-bold text-white">
          Ver {resultCount} {resultCount === 1 ? 'detalle' : 'detalles'}
        </button>
      </div>
    </div>
  );
}
