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
    <div className="flex flex-col gap-4 mb-8">
      {/* Category filters */}
      {categories && categories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <span className="text-sm font-medium text-brown whitespace-nowrap mr-2">Categoría:</span>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.slug)}
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors border shadow-sm ${
                currentCategorySlug === cat.slug 
                  ? 'bg-gold text-white border-gold' 
                  : 'bg-white text-brown border-sage/30 hover:border-gold'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}
      
      {/* Audience filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <span className="text-sm font-medium text-brown whitespace-nowrap mr-2">Para quién:</span>
        {['Chicos', 'Chicas', 'Unisex'].map(aud => (
          <button
            key={aud}
            onClick={() => handleAudienceChange(aud)}
            className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors border shadow-sm ${
              currentAudience === aud 
                ? 'bg-sage text-white border-sage' 
                : 'bg-white text-brown border-sage/30 hover:border-sage'
            }`}
          >
            {aud}
          </button>
        ))}
      </div>
    </div>
  );
}
