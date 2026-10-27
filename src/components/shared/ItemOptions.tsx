"use client";

import React from 'react';
import { Flower2, Lightbulb, Mail, Sparkles } from 'lucide-react';
import { ColorSwatch } from './ColorSwatch';
import { colorLabel, itemAccessories } from '@/lib/product-options';
import { ItemAccessory } from '@/types/products';

interface ItemOptionsProps {
  colors?: string[];
  flowers?: string[];
  /** Accesorios elegidos; sin la lista se usan hasLights/hasButterfly (pedidos y carritos anteriores) */
  accessories?: ItemAccessory[] | null;
  hasLights?: boolean;
  hasButterfly?: boolean;
  hasPhraseCard?: boolean;
  phraseText?: string | null;
  /** Muestra el texto de la dedicatoria debajo de las opciones */
  showPhrase?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

const chip = {
  sm: 'gap-1 rounded-full px-2 py-0.5 text-[10px]',
  md: 'gap-1.5 rounded-full px-2.5 py-1 text-xs',
};

/** Lo que el cliente eligió para un producto: colores con su muestra, flores y extras. */
export function ItemOptions({
  colors = [], flowers = [], accessories, hasLights, hasButterfly, hasPhraseCard, phraseText, showPhrase = false, size = 'sm', className = '',
}: ItemOptionsProps) {
  const swatch = size === 'sm' ? 10 : 12;
  const extras = itemAccessories({ accessories, hasLights, hasButterfly });
  const hasAny = colors.length || flowers.length || extras.length || hasPhraseCard;
  if (!hasAny) return null;

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-1.5">
        {colors.map(color => (
          <span key={`c-${color}`} className={`inline-flex items-center border border-[#e8dcdc] bg-white font-medium text-[#4a3933] ${chip[size]}`}>
            <ColorSwatch name={color} size={swatch} />
            {colorLabel(color)}
          </span>
        ))}
        {flowers.map(flower => (
          <span key={`f-${flower}`} className={`inline-flex items-center bg-[#fdf5f5] font-medium text-[#9c5365] ${chip[size]}`}>
            <Flower2 size={swatch} /> {flower}
          </span>
        ))}
        {extras.map(accessory => (
          <span key={`a-${accessory.key}`} className={`inline-flex items-center bg-[#fdf8ee] font-semibold text-[#8c6d36] ${chip[size]}`}>
            {accessory.key.startsWith('luces') ? <Lightbulb size={swatch} />
              : accessory.key.startsWith('mariposa') ? <span aria-hidden>🦋</span>
              : <Sparkles size={swatch} />}
            {accessory.name}
          </span>
        ))}
        {hasPhraseCard && (
          <span className={`inline-flex items-center bg-[#f1f5f2] font-semibold text-[#4f755b] ${chip[size]}`}>
            <Mail size={swatch} /> Tarjeta
          </span>
        )}
      </div>
      {showPhrase && hasPhraseCard && phraseText && (
        <p className={`mt-2 rounded-xl border-l-2 border-[#c8a96b] bg-[#faf7f2] px-3 py-2 font-serif italic text-[#5e4a42] ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
          “{phraseText}”
        </p>
      )}
    </div>
  );
}
