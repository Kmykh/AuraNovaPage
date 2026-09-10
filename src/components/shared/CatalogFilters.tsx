"use client";

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCategories } from '@/hooks/use-categories';

export function CatalogFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: categories } = useCategories();
  
  const currentCategorySlug = searchParams.get('category') || '';
  const currentAudience = searchParams.get('audience') || '';
  
  const handleCategoryChange = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug === currentCategorySlug) {
      params.delete('category'); // Toggle off
    } else {
      params.set('category', slug);
    }
    router.push(`?${params.toString()}`);
  };

  const handleAudienceChange = (aud: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (aud === currentAudience) {
      params.delete('audience'); // Toggle off
    } else {
      params.set('audience', aud);
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-3 mb-6 items-center max-w-4xl mx-auto px-4">
      {/* Category filters */}
      {categories && categories.length > 0 && (
        <div className="flex items-center justify-center flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.slug)}
              className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                currentCategorySlug === cat.slug 
                  ? 'bg-brown text-white shadow-md transform scale-105' 
                  : 'bg-white/60 text-brown border border-sage/20 hover:bg-white hover:border-gold/50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}
      
      {/* Audience filters */}
      <div className="flex items-center justify-center flex-wrap gap-2 mt-1">
        <span className="text-[10px] sm:text-[11px] uppercase tracking-widest text-sage/80 mr-1 font-semibold hidden sm:inline-block">Para:</span>
        {['Chicos', 'Chicas', 'Unisex'].map(aud => (
          <button
            key={aud}
            onClick={() => handleAudienceChange(aud)}
            className={`px-4 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
              currentAudience === aud 
                ? 'bg-gold text-white shadow-sm' 
                : 'bg-transparent text-sage border border-sage/30 hover:border-gold hover:text-gold'
            }`}
          >
            {aud}
          </button>
        ))}
      </div>
    </div>
  );
}
