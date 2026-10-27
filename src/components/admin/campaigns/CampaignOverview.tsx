"use client";

import React, { useState } from 'react';
import { AlertTriangle, CalendarDays, CheckCircle2 } from 'lucide-react';
import { CampaignResponse } from '@/types/campaigns';
import { formatCurrency } from '@/lib/formatters';

type Tab = 'general' | 'stages' | 'products';

const fmt = (iso: string) => new Date(iso).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
const DAY = 86_400_000;

/** Días de calendario que cubre una etapa (una etapa de un solo día cuenta 1). */
const daysBetween = (start: string, end: string) =>
  Math.max(1, Math.round((new Date(end).setHours(0, 0, 0, 0) - new Date(start).setHours(0, 0, 0, 0)) / DAY) + 1);

const DOTS = ['bg-[#c8a96b]', 'bg-[#b07474]', 'bg-[#6b8f71]', 'bg-[#6b7fb0]', 'bg-[#a07ab0]'];

/** Resumen real de la campaña: cronograma de sus etapas, precios por etapa y lo que falta para vender. */
export function CampaignOverview({ campaign, onGoTo }: { campaign: CampaignResponse; onGoTo: (tab: Tab) => void }) {
  // Hora fija al abrir la página (el estado de cada etapa no cambia mientras se mira)
  const [now] = useState(() => Date.now());
  const stages = [...campaign.stages].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  const current = stages.find(s => s.isActive && new Date(s.startDate).getTime() <= now && now <= new Date(s.endDate).getTime());
  const start = new Date(campaign.startDate).getTime();
  const end = new Date(campaign.endDate).getTime();
  const progress = Math.min(100, Math.max(0, ((now - start) / Math.max(1, end - start)) * 100));

  // Lo que conviene revisar antes de vender
  const missingPrices = campaign.products.filter(p => stages.some(s => !p.stagePrices.some(sp => sp.campaignStageId === s.id)));
  const issues: { text: string; tab: Tab }[] = [];
  if (!campaign.isActive) issues.push({ text: 'La campaña está pausada: los clientes ven los precios normales.', tab: 'general' });
  if (stages.length === 0) issues.push({ text: 'No tiene etapas: agrega al menos una con sus fechas.', tab: 'stages' });
  if (campaign.products.length === 0) issues.push({ text: 'No tiene productos: agrega los que van con precio especial.', tab: 'products' });
  if (missingPrices.length > 0) {
    issues.push({
      text: `${missingPrices.length === 1 ? '1 producto no tiene' : `${missingPrices.length} productos no tienen`} precio en alguna etapa: ahí se vende a precio normal.`,
      tab: 'products',
    });
  }
  const outside = stages.filter(s => new Date(s.startDate).getTime() < start - DAY || new Date(s.endDate).getTime() > end + DAY);
  if (outside.length > 0) issues.push({ text: `La etapa "${outside[0].name}" sale de las fechas de la campaña.`, tab: 'stages' });

  return (
    <div className="space-y-8">
      {/* Resumen */}
      <div className="flex flex-col gap-5 rounded-[22px] border border-sage/15 bg-[#FAF9F6] p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
        <div className="min-w-0">
          <p className="text-sm leading-relaxed text-[#5c564d] whitespace-pre-wrap">{campaign.description || 'Sin descripción.'}</p>
          {current && (
            <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Hoy rige: {current.name}
            </p>
          )}
        </div>
        <div className="shrink-0 rounded-2xl border border-sage/15 bg-white p-4 sm:min-w-[15rem]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-sage">Vigencia</p>
          <p className="mt-1 flex items-center gap-2 text-sm font-bold text-brown">
            <CalendarDays size={16} className="text-[#c8a96b]" /> {fmt(campaign.startDate)} – {fmt(campaign.endDate)}
          </p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-sage/15" aria-hidden>
            <div className="h-full rounded-full bg-[#c8a96b]" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-1 text-[11px] text-sage">
            {now < start ? `Empieza en ${Math.ceil((start - now) / DAY)} días` : now > end ? 'Terminada' : `Quedan ${Math.max(0, Math.ceil((end - now) / DAY))} días`}
          </p>
        </div>
      </div>

      {/* Antes de vender */}
      {issues.length > 0 ? (
        <div className="rounded-[22px] border border-amber-200 bg-amber-50/60 p-5">
          <p className="mb-2 flex items-center gap-2 text-sm font-bold text-amber-800"><AlertTriangle size={16} /> Revisa antes de vender</p>
          <ul className="space-y-1.5 text-sm text-amber-900">
            {issues.map(issue => (
              <li key={issue.text} className="flex flex-wrap items-baseline gap-x-2">
                <span>• {issue.text}</span>
                {issue.tab !== 'general' && (
                  <button type="button" onClick={() => onGoTo(issue.tab)} className="text-xs font-bold underline underline-offset-2">
                    {issue.tab === 'stages' ? 'Ir a etapas' : 'Ir a productos'}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          <CheckCircle2 size={16} /> Todo listo: cada producto tiene su precio en cada etapa.
        </p>
      )}

      {/* Cronograma */}
      <div>
        <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-sage">Cronograma</h4>
        {stages.length === 0 ? (
          <p className="text-sm text-sage">Sin etapas todavía.</p>
        ) : (
          <ol className="space-y-2">
            {stages.map((stage, index) => {
              const s = new Date(stage.startDate).getTime();
              const e = new Date(stage.endDate).getTime();
              const status = !stage.isActive ? 'Pausada' : now > e ? 'Terminada' : now >= s ? 'En curso' : 'Próxima';
              const days = daysBetween(stage.startDate, stage.endDate);
              return (
                <li
                  key={stage.id}
                  className={`flex flex-wrap items-center gap-x-4 gap-y-1 rounded-2xl border px-4 py-3 ${status === 'En curso' ? 'border-emerald-200 bg-emerald-50/40' : 'border-sage/15 bg-white'}`}
                >
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${DOTS[index % DOTS.length]}`} />
                  <span className="min-w-0 flex-1 font-bold text-brown">{stage.name}</span>
                  <span className="text-sm text-[#6b5a50]">
                    {days === 1 ? `${fmt(stage.startDate)} · todo el día` : `${fmt(stage.startDate)} – ${fmt(stage.endDate)} · ${days} días`}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    status === 'En curso' ? 'bg-emerald-100 text-emerald-800'
                      : status === 'Próxima' ? 'bg-sky-50 text-sky-700'
                      : 'bg-sage/15 text-sage'
                  }`}>{status}</span>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {/* Precios por etapa */}
      {campaign.products.length > 0 && stages.length > 0 && (
        <div>
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-sage">Precios por etapa</h4>
          <div className="overflow-x-auto rounded-2xl border border-sage/15">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="bg-[#FAF9F6] text-[11px] uppercase tracking-wider text-sage">
                <tr>
                  <th className="px-4 py-3 font-bold">Producto</th>
                  <th className="px-4 py-3 font-bold">Normal</th>
                  {stages.map(stage => <th key={stage.id} className="px-4 py-3 font-bold">{stage.name}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-sage/10">
                {campaign.products.map(product => (
                  <tr key={product.id}>
                    <td className="px-4 py-3 font-semibold text-brown">{product.productName}</td>
                    <td className="px-4 py-3 text-sage">{formatCurrency(product.productBasePrice)}</td>
                    {stages.map(stage => {
                      const price = product.stagePrices.find(sp => sp.campaignStageId === stage.id)?.price;
                      if (price === undefined) return <td key={stage.id} className="px-4 py-3 text-xs italic text-amber-700">Sin precio</td>;
                      const diff = product.productBasePrice > 0 ? Math.round((1 - price / product.productBasePrice) * 100) : 0;
                      return (
                        <td key={stage.id} className="px-4 py-3">
                          <span className="font-bold text-brown">{formatCurrency(price)}</span>
                          {diff !== 0 && (
                            <span className={`ml-1.5 rounded px-1 text-[10px] font-bold ${diff > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'}`}>
                              {diff > 0 ? `-${diff}%` : `+${-diff}%`}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
