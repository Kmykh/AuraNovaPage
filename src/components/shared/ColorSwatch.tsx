"use client";

import React from 'react';
import { useCustomizationOptions } from '@/hooks/use-customization-options';
import { colorBackground, isLightColor } from '@/lib/product-options';

interface ColorSwatchProps {
  name: string;
  size?: number;
  className?: string;
}

/** Círculo con el color real de la paleta (el nombre queda como texto accesible). */
export function ColorSwatch({ name, size = 14, className = '' }: ColorSwatchProps) {
  const { options } = useCustomizationOptions();
  const light = isLightColor(name, options.colors);
  return (
    <span
      role="img"
      aria-label={name}
      title={name}
      className={`inline-block shrink-0 rounded-full ${light ? 'ring-1 ring-inset ring-black/15' : 'ring-1 ring-inset ring-black/5'} ${className}`}
      style={{ width: size, height: size, background: colorBackground(name, options.colors) }}
    />
  );
}
