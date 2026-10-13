"use client";

import React from 'react';
import { BadgePercent, Timer, TrendingUp } from 'lucide-react';
import { ProductResponse } from '@/types/products';
import { formatCurrency, formatStageName } from '@/lib/formatters';
import { useNow } from '@/hooks/use-now';

/** "2 d 5 h", "5 h 20 min", "12 min" */
export function formatRemaining(ms: number): string {
  const minutes = Math.max(0, Math.floor(ms / 60_000));
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = minutes % 60;
  if (days > 0) return `${days} d ${hours} h`;
  if (hours > 0) return `${hours} h ${mins} min`;
  return `${Math.max(mins, 1)} min`;
}

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', timeZone: 'America/Lima' });

/** Campaña activa en el detalle: ahorro, cuánto dura este precio y cómo cambia en las siguientes etapas. */
export function CampaignBanner({ product }: { product: ProductResponse }) {
  const now = useNow();
  if (!product.isCampaignActive) return null;

  const savings = product.price - product.effectivePrice;
  const percent = product.price > 0 ? Math.round((savings / product.price) * 100) : 0;
  const endsAt = product.campaignStageEndsAt ? new Date(product.campaignStageEndsAt).getTime() : null;
  const remaining = endsAt && now ? endsAt - now : null;
  const stages = [...(product.campaignStages ?? [])].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const currentIndex = stages.findIndex(s => s.isCurrent);
  const next = currentIndex >= 0 ? stages[currentIndex + 1] : undefined;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#8f2d3b]/15 bg-gradient-to-br from-[#fff5f6] via-[#fffaf7] to-[#fdf3e7] p-4 sm:p-5">
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#d38b8b]/15 blur-2xl" />

      <div className="relative flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#8f2d3b]">
            {product.campaignName ?? 'Campaña especial'}
          </p>
          <p className="mt-0.5 font-serif text-lg font-bold text-[#4a3933]">
            {formatStageName(product.campaignStageName)}
          </p>
        </div>
        {savings > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#8f2d3b] px-3 py-1.5 text-xs font-bold text-white shadow-sm">
            <BadgePercent className="h-3.5 w-3.5" /> Ahorras {formatCurrency(savings)} ({percent}%)
          </span>
        )}
      </div>

      {(remaining !== null && remaining > 0) || next ? (
        <div className="relative mt-3 flex flex-col gap-1.5 text-xs text-[#6b4f45] sm:flex-row sm:flex-wrap sm:gap-x-5">
          {remaining !== null && remaining > 0 && (
            <span className="inline-flex items-center gap-1.5 font-semibold">
              <Timer className="h-3.5 w-3.5 text-[#8f2d3b]" />
              Este precio termina en {formatRemaining(remaining)}
            </span>
          )}
          {next && next.price !== product.effectivePrice && (
            <span className="inline-flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-[#c8a96b]" />
              Desde el {shortDate(next.startDate)}: {formatCurrency(next.price)}
            </span>
          )}
        </div>
      ) : null}

      {stages.length > 1 && (
        <ol className="relative mt-4 grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(stages.length, 4)}, minmax(0, 1fr))` }}>
          {stages.slice(0, 4).map((stage, index) => {
            const past = currentIndex >= 0 && index < currentIndex;
            return (
              <li
                key={`${stage.name}-${stage.startDate}`}
                className={`rounded-xl border px-2.5 py-2 text-center ${
                  stage.isCurrent
                    ? 'border-[#8f2d3b]/40 bg-white shadow-sm'
                    : past ? 'border-transparent bg-white/40 opacity-50' : 'border-[#e8dcdc] bg-white/60'
                }`}
              >
                <p className={`truncate text-[10px] font-bold uppercase tracking-wider ${stage.isCurrent ? 'text-[#8f2d3b]' : 'text-[#887870]'}`}>
                  {formatStageName(stage.name)}
                </p>
                <p className={`font-serif text-sm font-bold ${past ? 'line-through text-[#887870]' : 'text-[#4a3933]'}`}>
                  {formatCurrency(stage.price)}
                </p>
                <p className="text-[10px] text-[#887870]">{shortDate(stage.startDate)}</p>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
