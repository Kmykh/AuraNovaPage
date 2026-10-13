"use client";

import React, { useState } from 'react';
import { CalendarHeart, PartyPopper, Wallet, Link2, ExternalLink, Download, X, Images, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatLongDate } from '@/lib/tracking-progress';

export interface CustomOrderBrief {
  orderCode: string;
  referenceImageUrl?: string | null;
  referenceImages?: string[];
  referenceLinks?: string[];
  desiredDate?: string | null;
  occasion?: string | null;
  budgetRange?: string | null;
}

function daysUntil(isoDate: string): number {
  const target = new Date(`${isoDate}T12:00:00`);
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

function linkLabel(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    if (host.includes('pinterest') || host === 'pin.it') return 'Pinterest';
    if (host.includes('tiktok')) return 'TikTok';
    if (host.includes('instagram')) return 'Instagram';
    return host;
  } catch {
    return 'Enlace';
  }
}

/** Fotos, enlaces y datos del encargo que el cliente envió en un pedido personalizado. */
export function CustomOrderBriefPanel({ brief }: { brief: CustomOrderBrief }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<number | null>(null);

  const images = brief.referenceImages?.length
    ? brief.referenceImages
    : brief.referenceImageUrl ? [brief.referenceImageUrl] : [];
  const links = brief.referenceLinks ?? [];
  const remaining = brief.desiredDate ? daysUntil(brief.desiredDate) : null;

  const download = async (url: string, index: number) => {
    setDownloading(index);
    try {
      const response = await fetch(url, { mode: 'cors' });
      const blob = await response.blob();
      const href = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = href;
      anchor.download = `Referencia_${brief.orderCode}_${index + 1}.webp`;
      anchor.click();
      URL.revokeObjectURL(href);
    } catch {
      // Si el navegador bloquea la descarga, se abre la imagen para guardarla manualmente
      window.open(url, '_blank', 'noopener,noreferrer');
      toast.info('Abrimos la imagen en otra pestaña para que la guardes.');
    } finally {
      setDownloading(null);
    }
  };

  const hasDetails = brief.desiredDate || brief.occasion || brief.budgetRange;

  return (
    <div className="space-y-4">
      {hasDetails && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {brief.desiredDate && (
            <div className={`rounded-xl border p-3 ${remaining !== null && remaining <= 2 ? 'border-[#d38b8b]/50 bg-[#fdf0f0]' : 'border-[#c8a96b]/25 bg-[#fdf8ee]'}`}>
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#887870]">
                <CalendarHeart className="h-3.5 w-3.5 text-[#c8a96b]" /> Lo necesita
              </span>
              <p className="mt-1 text-sm font-bold text-[#4a3933]">{formatLongDate(brief.desiredDate)}</p>
              {remaining !== null && (
                <p className={`text-[11px] font-semibold ${remaining <= 2 ? 'text-[#c06b6b]' : 'text-[#8c6d36]'}`}>
                  {remaining < 0 ? 'Fecha pasada' : remaining === 0 ? '¡Es hoy!' : remaining === 1 ? 'Mañana' : `En ${remaining} días`}
                </p>
              )}
            </div>
          )}
          {brief.occasion && (
            <div className="rounded-xl border border-[#d38b8b]/25 bg-[#fdf5f5] p-3">
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#887870]">
                <PartyPopper className="h-3.5 w-3.5 text-[#d38b8b]" /> Ocasión
              </span>
              <p className="mt-1 text-sm font-bold text-[#4a3933]">{brief.occasion}</p>
            </div>
          )}
          {brief.budgetRange && (
            <div className="rounded-xl border border-sage/15 bg-[#FAFAFA] p-3">
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#887870]">
                <Wallet className="h-3.5 w-3.5 text-[#c8a96b]" /> Presupuesto
              </span>
              <p className="mt-1 text-sm font-bold text-[#4a3933]">{brief.budgetRange}</p>
            </div>
          )}
        </div>
      )}

      {images.length > 0 && (
        <div>
          <span className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#887870]">
            <Images className="h-3.5 w-3.5" /> Fotos de referencia ({images.length})
          </span>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {images.map((url, index) => (
              <div key={url} className="group relative aspect-square overflow-hidden rounded-xl border border-[#c8a96b]/25 bg-white">
                <button type="button" onClick={() => setPreview(url)} className="h-full w-full" title="Ampliar">
                  {/* URL firmada y temporal: se muestra tal cual */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Referencia ${index + 1}`} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                </button>
                <button
                  type="button"
                  onClick={() => download(url, index)}
                  className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-[#4a3933]/85 px-2.5 py-1 text-[10px] font-bold text-white shadow transition hover:bg-[#4a3933]"
                  title="Descargar"
                >
                  {downloading === index ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3 text-[#c8a96b]" />}
                  Descargar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {links.length > 0 && (
        <div>
          <span className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#887870]">
            <Link2 className="h-3.5 w-3.5" /> Enlaces de inspiración
          </span>
          <ul className="flex flex-wrap gap-2">
            {links.map((link) => (
              <li key={link}>
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#c8a96b]/30 bg-white px-3 py-1.5 text-xs font-semibold text-[#4a3933] transition hover:border-[#c8a96b]"
                >
                  {linkLabel(link)} <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {preview && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-stone-900/80 p-4 backdrop-blur-sm" onClick={() => setPreview(null)}>
          <button className="absolute right-4 top-4 rounded-full bg-white/15 p-2 text-white hover:bg-white/25" aria-label="Cerrar">
            <X className="h-5 w-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Referencia ampliada" className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl" />
        </div>
      )}
    </div>
  );
}
