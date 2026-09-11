"use client";

import React, { useState, useEffect } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Check, Info, HelpCircle } from 'lucide-react';
import { NewFeatureBadge, isFeatureActive } from './NewFeatureBadge';

interface NewFeatureExplanationProps {
  id: string; // ID único para recordar si el trabajador lo minimizó
  title: string;
  badgeLabel?: string;
  whatChanged: string;
  howToUse: string[];
  tips?: string;
  daysDuration?: number;
}

export function NewFeatureExplanation({
  id,
  title,
  badgeLabel = 'NUEVO',
  whatChanged,
  howToUse,
  tips,
  daysDuration = 4
}: NewFeatureExplanationProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`admin_feature_dismissed_${id}`);
      if (stored === 'true') {
        setIsDismissed(true);
      }
    }
  }, [id]);

  if (!isFeatureActive('2026-09-11', daysDuration)) {
    return null;
  }

  if (!isMounted) return null;

  if (isDismissed) {
    return (
      <div className="mb-4">
        <button
          type="button"
          onClick={() => {
            setIsDismissed(false);
            setIsOpen(true);
            localStorage.removeItem(`admin_feature_dismissed_${id}`);
          }}
          className="inline-flex items-center gap-2 text-xs font-semibold bg-[#faf7f2] hover:bg-[#f3ece2] text-[#4a3933] border border-[#c8a96b]/35 px-3 py-1.5 rounded-full shadow-2xs transition-all"
        >
          <NewFeatureBadge label={badgeLabel} size="sm" />
          <span>Ver guía de cambios: {title}</span>
          <ChevronDown className="w-3.5 h-3.5 text-[#c8a96b]" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-[#faf7f2] via-[#fffdfa] to-[#faf7f2] rounded-2xl border-2 border-[#c8a96b]/35 p-4 sm:p-5 shadow-sm mb-6 transition-all">
      {/* Cabecera de la Explicación */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#fdf6e7] text-[#c8a96b] border border-[#c8a96b]/40 flex items-center justify-center shrink-0 shadow-2xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-serif font-bold text-sm sm:text-base text-[#4a3933]">
                {title}
              </h4>
              <NewFeatureBadge label={badgeLabel} size="sm" />
            </div>
            <span className="text-[11px] text-[#887870] block">
              Guía de actualización para el equipo y trabajadores • Activo por 4 días
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 text-[#887870] hover:text-[#4a3933] hover:bg-white/80 rounded-lg transition-colors"
            title={isOpen ? 'Minimizar explicación' : 'Ver explicación'}
          >
            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Contenido Desplegable */}
      {isOpen && (
        <div className="mt-4 pt-3 border-t border-[#c8a96b]/20 space-y-3 text-xs text-[#4a3933]">
          
          {/* Qué cambió */}
          <div className="bg-white/80 p-3 rounded-xl border border-[#c8a96b]/20 space-y-1">
            <span className="font-bold text-[#8f6d28] uppercase text-[10px] tracking-wider block flex items-center gap-1">
              <Info className="w-3 h-3 text-[#c8a96b]" /> ¿Qué cambió en esta zona?
            </span>
            <p className="leading-relaxed text-[#5a4840]">
              {whatChanged}
            </p>
          </div>

          {/* Cómo usarlo */}
          <div className="space-y-1.5 pl-1">
            <span className="font-bold text-[#4a3933] uppercase text-[10px] tracking-wider block">
              ¿Cómo usarlo en tu trabajo diario?
            </span>
            <ul className="space-y-1 text-[#5a4840]">
              {howToUse.map((step, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#fdf6e7] text-[#c8a96b] border border-[#c8a96b]/30 flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="leading-tight">{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {tips && (
            <div className="bg-[#f2f8f3] border border-[#71a37c]/30 p-2.5 rounded-xl text-[11px] text-[#2d5736] flex items-center gap-2">
              <Check className="w-4 h-4 text-[#71a37c] shrink-0" />
              <span>{tips}</span>
            </div>
          )}

          {/* Botón de confirmación / ocultar */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => {
                setIsDismissed(true);
                localStorage.setItem(`admin_feature_dismissed_${id}`, 'true');
              }}
              className="text-[11px] font-bold uppercase tracking-wider text-[#887870] hover:text-[#4a3933] bg-white border border-[#c8a96b]/30 hover:bg-[#faf7f2] px-3.5 py-1.5 rounded-full transition-all shadow-2xs flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 text-[#71a37c]" />
              <span>Entendido, ocultar guía</span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
