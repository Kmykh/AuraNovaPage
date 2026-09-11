"use client";

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCategories } from '@/hooks/use-categories';
import { useProducts } from '@/hooks/use-products';
import {
  Users,
  Heart,
  Crown,
  Infinity,
  LayoutGrid,
  Flower2,
  Gift,
  Box,
  Gem,
  Tag,
  Flame,
} from 'lucide-react';

function getCategoryIcon(name: string, slug: string) {
  const lower = `${name} ${slug}`.toLowerCase();
  if (lower.includes('flor')) return Flower2;
  if (lower.includes('ramo')) return Gift;
  if (lower.includes('macet')) return Box;
  if (lower.includes('accesori') || lower.includes('joya')) return Gem;
  return Tag;
}

export function CatalogFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: categories } = useCategories();
  const { data: products } = useProducts();
  
  const currentCategorySlug = searchParams.get('category') || '';
  const currentAudience = searchParams.get('audience') || '';
  const isCampaignOnly = searchParams.get('coleccion') === 'campana';

  const hasCampaignProducts = products?.some(p => p.isCampaignActive);

  const handleCategoryChange = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('coleccion');
    if (slug === currentCategorySlug) {
      params.delete('category');
    } else {
      params.set('category', slug);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleAudienceChange = (aud: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (aud === currentAudience) {
      params.delete('audience');
    } else {
      params.set('audience', aud);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleCampaignToggle = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (isCampaignOnly) {
      params.delete('coleccion');
    } else {
      params.set('coleccion', 'campana');
      params.delete('category');
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="w-full flex items-center justify-between gap-2 overflow-x-auto scrollbar-none py-0.5">
      
      {/* ── Grupo 1: Audiencia (Iconos con expansión al hover y tipografía font-serif refinada) ── */}
      <div className="flex items-center gap-1.5 shrink-0">
        
        {/* Todos */}
        <button
          type="button"
          onClick={() => handleAudienceChange('')}
          title="Todos los públicos"
          className={`group/pill flex items-center h-8 px-2.5 rounded-full text-xs font-serif transition-all duration-300 active:scale-95 shrink-0 ${
            currentAudience === ''
              ? 'bg-[#4a3933] text-white font-bold shadow-xs'
              : 'text-stone-700 hover:text-stone-900 bg-stone-100/70 hover:bg-stone-200/70'
          }`}
        >
          <Users size={14} className="shrink-0 transition-transform duration-300 group-hover/pill:scale-110" />
          <span
            className={`transition-all duration-300 overflow-hidden whitespace-nowrap text-xs font-serif ${
              currentAudience === ''
                ? 'max-w-[100px] opacity-100 ml-1.5 font-bold'
                : 'max-w-0 opacity-0 group-hover/pill:max-w-[100px] group-hover/pill:opacity-100 group-hover/pill:ml-1.5 font-medium'
            }`}
          >
            Todos
          </span>
        </button>

        {/* Chicas */}
        <button
          type="button"
          onClick={() => handleAudienceChange('Chicas')}
          title="Para Chicas"
          className={`group/pill flex items-center h-8 px-2.5 rounded-full text-xs font-serif transition-all duration-300 active:scale-95 shrink-0 ${
            currentAudience === 'Chicas'
              ? 'bg-[#b85d6d] text-white font-bold shadow-xs'
              : 'text-[#9e4453] bg-rose-50/80 hover:bg-rose-100/90 border border-rose-200/50'
          }`}
        >
          <Heart size={14} className={`shrink-0 transition-transform duration-300 group-hover/pill:scale-110 ${currentAudience === 'Chicas' ? 'fill-current' : ''}`} />
          <span
            className={`transition-all duration-300 overflow-hidden whitespace-nowrap text-xs font-serif ${
              currentAudience === 'Chicas'
                ? 'max-w-[100px] opacity-100 ml-1.5 font-bold'
                : 'max-w-0 opacity-0 group-hover/pill:max-w-[100px] group-hover/pill:opacity-100 group-hover/pill:ml-1.5 font-medium'
            }`}
          >
            Chicas
          </span>
        </button>

        {/* Chicos */}
        <button
          type="button"
          onClick={() => handleAudienceChange('Chicos')}
          title="Para Chicos"
          className={`group/pill flex items-center h-8 px-2.5 rounded-full text-xs font-serif transition-all duration-300 active:scale-95 shrink-0 ${
            currentAudience === 'Chicos'
              ? 'bg-[#3b6685] text-white font-bold shadow-xs'
              : 'text-[#2b5878] bg-sky-50/80 hover:bg-sky-100/90 border border-sky-200/50'
          }`}
        >
          <Crown size={14} className="shrink-0 transition-transform duration-300 group-hover/pill:scale-110" />
          <span
            className={`transition-all duration-300 overflow-hidden whitespace-nowrap text-xs font-serif ${
              currentAudience === 'Chicos'
                ? 'max-w-[100px] opacity-100 ml-1.5 font-bold'
                : 'max-w-0 opacity-0 group-hover/pill:max-w-[100px] group-hover/pill:opacity-100 group-hover/pill:ml-1.5 font-medium'
            }`}
          >
            Chicos
          </span>
        </button>

        {/* Unisex */}
        <button
          type="button"
          onClick={() => handleAudienceChange('Unisex')}
          title="Para Todos / Unisex"
          className={`group/pill flex items-center h-8 px-2.5 rounded-full text-xs font-serif transition-all duration-300 active:scale-95 shrink-0 ${
            currentAudience === 'Unisex'
              ? 'bg-[#4e755b] text-white font-bold shadow-xs'
              : 'text-[#42644d] bg-emerald-50/80 hover:bg-emerald-100/90 border border-emerald-200/50'
          }`}
        >
          <Infinity size={14} className="shrink-0 transition-transform duration-300 group-hover/pill:scale-110" />
          <span
            className={`transition-all duration-300 overflow-hidden whitespace-nowrap text-xs font-serif ${
              currentAudience === 'Unisex'
                ? 'max-w-[100px] opacity-100 ml-1.5 font-bold'
                : 'max-w-0 opacity-0 group-hover/pill:max-w-[100px] group-hover/pill:opacity-100 group-hover/pill:ml-1.5 font-medium'
            }`}
          >
            Unisex
          </span>
        </button>
      </div>

      {/* Separador fino */}
      <div className="h-5 w-px bg-stone-200/80 shrink-0 mx-0.5" />

      {/* ── Grupo 2: Categorías (Con tipografía font-serif elegante y animación) ── */}
      <div className="flex items-center gap-1.5 shrink-0">
        
        {/* Todas las Secciones */}
        <button
          type="button"
          onClick={() => handleCategoryChange('')}
          title="Todas las categorías"
          className={`group/pill flex items-center h-8 px-2.5 rounded-full text-xs font-serif transition-all duration-300 active:scale-95 shrink-0 ${
            currentCategorySlug === '' && !isCampaignOnly
              ? 'bg-[#4a3933] text-white font-bold shadow-xs'
              : 'text-stone-700 hover:text-stone-900 bg-stone-100/70 hover:bg-stone-200/70'
          }`}
        >
          <LayoutGrid size={14} className="shrink-0 transition-transform duration-300 group-hover/pill:scale-110" />
          <span
            className={`transition-all duration-300 overflow-hidden whitespace-nowrap text-xs font-serif ${
              currentCategorySlug === '' && !isCampaignOnly
                ? 'max-w-[120px] opacity-100 ml-1.5 font-bold'
                : 'max-w-0 opacity-0 group-hover/pill:max-w-[120px] group-hover/pill:opacity-100 group-hover/pill:ml-1.5 font-medium'
            }`}
          >
            Todas
          </span>
        </button>

        {/* Categorías dinámicas */}
        {categories?.map((cat) => {
          const IconComponent = getCategoryIcon(cat.name, cat.slug);
          const isSelected = currentCategorySlug === cat.slug;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryChange(cat.slug)}
              title={cat.name}
              className={`group/pill flex items-center h-8 px-2.5 rounded-full text-xs font-serif transition-all duration-300 active:scale-95 shrink-0 ${
                isSelected
                  ? 'bg-[#4a3933] text-white font-bold shadow-xs'
                  : 'text-stone-700 hover:text-stone-900 bg-stone-100/70 hover:bg-stone-200/70'
              }`}
            >
              <IconComponent size={14} className="shrink-0 transition-transform duration-300 group-hover/pill:scale-110" />
              <span
                className={`transition-all duration-300 overflow-hidden whitespace-nowrap text-xs font-serif ${
                  isSelected
                    ? 'max-w-[140px] opacity-100 ml-1.5 font-bold'
                    : 'max-w-0 opacity-0 group-hover/pill:max-w-[140px] group-hover/pill:opacity-100 group-hover/pill:ml-1.5 font-medium'
                }`}
              >
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Grupo 3: Preventa (Ícono y palabra 'Preventa' SIEMPRE VISIBLES) ── */}
      {hasCampaignProducts && (
        <div className="shrink-0 ml-auto pl-1">
          <button
            type="button"
            onClick={handleCampaignToggle}
            title="Colección Preventa"
            className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-serif font-bold uppercase tracking-wider transition-all duration-300 active:scale-95 shrink-0 ${
              isCampaignOnly
                ? 'bg-[#8f2d3b] text-white shadow-sm ring-2 ring-rose-300'
                : 'text-[#8f2d3b] bg-rose-50/90 hover:bg-rose-100/90 border border-rose-200/70'
            }`}
          >
            <Flame size={14} className={`shrink-0 ${isCampaignOnly ? 'fill-current text-white' : 'text-[#8f2d3b]'}`} />
            <span>Preventa</span>
          </button>
        </div>
      )}

    </div>
  );
}
