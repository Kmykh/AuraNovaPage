"use client";

import React from 'react';
import { ColorSwatch } from '@/components/shared/ColorSwatch';
import { accessoryPriceLabel, itemAccessories, itemColors, colorLabel, itemFlowers } from '@/lib/product-options';
import { ItemAccessory } from '@/types/products';

interface TicketOptionItem {
  selectedColors?: string[];
  selectedFlowerTypes?: string[];
  selectedPrimaryColor?: string;
  selectedSecondaryColor?: string;
  selectedFlowerType?: string;
  selectedFlowerColor?: string;
  accessories?: ItemAccessory[];
  hasLights?: boolean;
  hasButterfly?: boolean;
}

/** Líneas del ticket: cada color con su muestra, cada flor y cada accesorio (con su precio) por separado. */
export function TicketOptionLines({ item }: { item: TicketOptionItem }) {
  const colors = itemColors(item);
  const flowers = itemFlowers(item);
  const accessories = itemAccessories(item);
  return (
    <>
      {colors.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span>• {colors.length === 1 ? 'Color' : 'Colores'}:</span>
          {colors.map(color => (
            <span key={color} className="inline-flex items-center gap-1 font-semibold">
              <ColorSwatch name={color} size={8} /> {colorLabel(color)}
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
      {accessories.map(accessory => (
        <div key={accessory.key}>
          • {accessory.name} <span className="text-[#887870]">({accessoryPriceLabel(accessory.price).toLowerCase()})</span>
        </div>
      ))}
    </>
  );
}
