"use client";

import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

interface NewFeatureBadgeProps {
  releaseDate?: string; // Formato YYYY-MM-DD
  daysDuration?: number; // 4 días
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

// Fecha de inicio de las novedades: 11 de Septiembre de 2026
const DEFAULT_RELEASE_DATE = '2026-09-11';
const DEFAULT_DURATION_DAYS = 4;

export function isFeatureActive(releaseDate = DEFAULT_RELEASE_DATE, days = DEFAULT_DURATION_DAYS): boolean {
  try {
    const release = new Date(releaseDate).getTime();
    const expiry = release + (days * 24 * 60 * 60 * 1000);
    return Date.now() <= expiry;
  } catch {
    return true;
  }
}

export function NewFeatureBadge({
  releaseDate = DEFAULT_RELEASE_DATE,
  daysDuration = DEFAULT_DURATION_DAYS,
  label = 'NUEVO',
  size = 'sm',
  className = ''
}: NewFeatureBadgeProps) {
  const [active, setActive] = useState(true);

  useEffect(() => {
    setActive(isFeatureActive(releaseDate, daysDuration));
  }, [releaseDate, daysDuration]);

  if (!active) return null;

  return (
    <span 
      className={`
        inline-flex items-center gap-1 font-bold uppercase tracking-wider rounded-full shadow-2xs select-none
        bg-gradient-to-r from-[#d4af37] via-[#c8a96b] to-[#b89759] text-white
        border border-white/40 animate-pulse
        ${size === 'sm' ? 'text-[9px] px-2 py-0.5' : 'text-[10px] px-2.5 py-1'}
        ${className}
      `}
      title="Función agregada recientemente (activo por 4 días)"
    >
      <Sparkles className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
      <span>{label}</span>
    </span>
  );
}
