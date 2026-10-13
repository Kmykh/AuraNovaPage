"use client";

import React from 'react';
import { ColorSwatch } from '@/components/shared/ColorSwatch';
import { itemColors, itemFlowers } from '@/lib/product-options';

interface TicketOptionItem {
  selectedColors?: string[];
  selectedFlowerTypes?: string[];
  selectedPrimaryColor?: string;
  selectedSecondaryColor?: string;
  selectedFlowerType?: string;
  selectedFlowerColor?: string;
}

/** Líneas del ticket: cada color con su muestra y cada flor por separado. */
export function TicketOptionLines({ item }: { item: TicketOptionItem }) {
  const colors = itemColors(item);
  const flowers = itemFlowers(item);
  return (
    <>
      {colors.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span>• {colors.length === 1 ? 'Color' : 'Colores'}:</span>
          {colors.map(color => (
            <span key={color} className="inline-flex items-center gap-1 font-semibold">
              <ColorSwatch name={color} size={8} /> {color}
            </span>
          ))}
        </div>
      )}
      {flowers.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span>• {flowers.length === 1 ? 'Flor' : 'Flores'}:</span>
          {flowers.map(flower => (
            <span key={flower} className="font-semibold">{flower}</span>
          ))}
        </div>
      )}
    </>
  );
}
