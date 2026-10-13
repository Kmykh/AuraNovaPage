"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Package, MapPin, Store, Truck, Building2, CalendarHeart, PartyPopper, Wallet, Link2, ExternalLink, Images, X, Receipt,
} from 'lucide-react';
import { PublicTrackingResponse } from '@/types/tracking';
import { formatCurrency, getImageUrl } from '@/lib/formatters';
import { getDeliveryTypeLabel } from '@/lib/tracking-helpers';
import { deliveryTypeName, formatLongDate } from '@/lib/tracking-progress';

const cardClass = 'rounded-[1.75rem] border border-[#e8dcdc]/70 bg-white p-5 shadow-[0_10px_30px_-12px_rgba(200,169,107,0.18)] sm:p-7';

function SectionTitle({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-2.5 font-serif text-lg font-bold text-[#4a3933] sm:text-xl">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fdf5f5] text-[#d38b8b]">
        <Icon className="h-[18px] w-[18px]" />
      </span>
      {children}
    </h3>
  );
}

export function TrackingOrderSummary({ tracking, onOpenTicket }: { tracking: PublicTrackingResponse; onOpenTicket: () => void }) {
  const costs = tracking.costs;
  const items = tracking.items ?? [];

  return (
    <section className={cardClass}>
      <div className="flex items-center justify-between gap-3">
        <SectionTitle icon={Package}>Tu pedido</SectionTitle>
        <button
          onClick={onOpenTicket}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#c8a96b]/40 px-3.5 py-1.5 text-xs font-bold text-[#8c6d36] transition hover:bg-[#fdf8ee]"
        >
          <Receipt className="h-3.5 w-3.5" /> Ver ticket
        </button>
      </div>

      {items.length > 0 ? (
        <ul className="mt-5 divide-y divide-[#f1e9e4]">
          {items.map((item, index) => (
            <li key={`${item.productName}-${index}`} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-[#e8dcdc]/60 bg-[#faf7f2]">
                {item.imageUrl ? (
                  <Image src={getImageUrl(item.imageUrl)} alt={item.productName} fill sizes="64px" className="object-cover" />
                ) : (
                  <Package className="absolute inset-0 m-auto h-6 w-6 text-[#d38b8b]/50" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-[#4a3933] sm:text-base">{item.productName}</p>
                <p className="text-xs text-[#887870]">Cantidad: {item.quantity}</p>
              </div>
              {item.unitPrice != null && (
                <span className="shrink-0 text-sm font-bold text-[#4a3933]">{formatCurrency(item.unitPrice * item.quantity)}</span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-[#887870]">
          {tracking.isCustomOrder ? 'Diseño personalizado según tus referencias.' : 'Sin productos registrados.'}
        </p>
      )}

      {costs && (
        <dl className="mt-5 space-y-2 rounded-2xl bg-[#faf7f2] p-4 text-sm">
          {costs.subtotal > 0 && (
            <div className="flex justify-between text-[#887870]"><dt>Productos</dt><dd>{formatCurrency(costs.subtotal)}</dd></div>
          )}
          {costs.customizationCost > 0 && (
            <div className="flex justify-between text-[#887870]"><dt>Personalización</dt><dd>{formatCurrency(costs.customizationCost)}</dd></div>
          )}
          {costs.deliveryCost != null && costs.deliveryCost > 0 && (
            <div className="flex justify-between text-[#887870]"><dt>Entrega</dt><dd>{formatCurrency(costs.deliveryCost)}</dd></div>
          )}
          <div className="flex justify-between border-t border-[#e8dcdc] pt-2 text-base font-bold text-[#4a3933]">
            <dt>Total</dt>
            <dd>{costs.total != null ? formatCurrency(costs.total) : 'Por cotizar'}</dd>
          </div>
        </dl>
      )}
    </section>
  );
}

function linkLabel(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    if (host.includes('pinterest') || host === 'pin.it') return 'Pinterest';
    if (host.includes('tiktok')) return 'TikTok';
    if (host.includes('instagram')) return 'Instagram';
    if (host.includes('facebook') || host === 'fb.watch') return 'Facebook';
    return host;
  } catch {
    return 'Enlace';
  }
}

export function TrackingCustomBrief({ tracking }: { tracking: PublicTrackingResponse }) {
  const [preview, setPreview] = useState<string | null>(null);
  const images = tracking.referenceImages?.length
    ? tracking.referenceImages
    : tracking.referenceImageUrl ? [tracking.referenceImageUrl] : [];
  const links = tracking.referenceLinks ?? [];
  // "para el viernes, 16 de octubre": va en minúscula dentro de la frase
  const desiredDate = tracking.desiredDate ? formatLongDate(tracking.desiredDate).toLowerCase() : null;

  if (!tracking.isCustomOrder) return null;
  if (!images.length && !links.length && !tracking.customizationNotes && !desiredDate && !tracking.occasion) return null;

  return (
    <section className={cardClass}>
      <SectionTitle icon={Images}>Tu idea</SectionTitle>

      {(desiredDate || tracking.occasion || tracking.budgetRange) && (
        <div className="mt-5 flex flex-wrap gap-2">
          {tracking.occasion && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fdf5f5] px-3 py-1.5 text-xs font-semibold text-[#b56f6f]">
              <PartyPopper className="h-3.5 w-3.5" /> {tracking.occasion}
            </span>
          )}
          {desiredDate && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fdf8ee] px-3 py-1.5 text-xs font-semibold text-[#8c6d36]">
              <CalendarHeart className="h-3.5 w-3.5" /> Para el {desiredDate}
            </span>
          )}
          {tracking.budgetRange && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f3f0ea] px-3 py-1.5 text-xs font-semibold text-[#6b5a50]">
              <Wallet className="h-3.5 w-3.5" /> {tracking.budgetRange}
            </span>
          )}
        </div>
      )}

      {tracking.customizationNotes && (
        <blockquote className="mt-5 rounded-2xl border-l-4 border-[#c8a96b] bg-[#faf7f2] px-4 py-3 text-sm italic leading-relaxed text-[#5e4a42]">
          “{tracking.customizationNotes}”
        </blockquote>
      )}

      {images.length > 0 && (
        <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-5">
          {images.map((url, index) => (
            <button
              key={url}
              onClick={() => setPreview(url)}
              className="group relative aspect-square overflow-hidden rounded-2xl border border-[#e8dcdc]/70 bg-[#faf7f2]"
            >
              {/* URL firmada y temporal: se muestra tal cual, sin pasar por el optimizador */}
              <Image src={url} alt={`Referencia ${index + 1}`} fill unoptimized className="object-cover transition duration-500 group-hover:scale-105" />
            </button>
          ))}
        </div>
      )}

      {links.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {links.map((link) => (
            <li key={link}>
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#e8dcdc] px-3 py-1.5 text-xs font-semibold text-[#5e4a42] transition hover:border-[#c8a96b] hover:text-[#8c6d36]"
              >
                <Link2 className="h-3.5 w-3.5" /> {linkLabel(link)} <ExternalLink className="h-3 w-3 opacity-60" />
              </a>
            </li>
          ))}
        </ul>
      )}

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/80 p-4 backdrop-blur-sm" onClick={() => setPreview(null)}>
          <button className="absolute right-4 top-4 rounded-full bg-white/15 p-2 text-white hover:bg-white/25" aria-label="Cerrar">
            <X className="h-5 w-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Referencia ampliada" className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl" />
        </div>
      )}
    </section>
  );
}

export function TrackingDeliveryCard({ tracking }: { tracking: PublicTrackingResponse }) {
  const type = deliveryTypeName(tracking.deliveryType);
  const delivery = tracking.delivery;
  const shipping = tracking.nationalShippingDetails;
  const Icon = type === 'MeetingPoint' ? Store : type === 'NationalShipping' ? Building2 : Truck;

  const place =
    type === 'MeetingPoint' ? delivery?.meetingPointName
    : type === 'Delivery' ? [delivery?.deliveryZoneName, delivery?.deliveryAddress].filter(Boolean).join(' · ')
    : [delivery?.district, delivery?.province, delivery?.department].filter(Boolean).join(', ');

  return (
    <section className={cardClass}>
      <SectionTitle icon={Icon}>Entrega</SectionTitle>
      <div className="mt-4 flex items-start gap-3 rounded-2xl bg-[#faf7f2] p-4">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#c8a96b]" />
        <div className="min-w-0">
          <p className="text-sm font-bold text-[#4a3933]">{getDeliveryTypeLabel(tracking.deliveryType)}</p>
          {place && <p className="mt-0.5 text-sm text-[#887870]">{place}</p>}
        </div>
      </div>

      {shipping?.provider && (
        <div className="mt-3 rounded-2xl border border-[#c8a96b]/30 bg-[#fdf8ee] p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-[#8c6d36]">Agencia: {shipping.provider}</p>
          {shipping.trackingCode && (
            <p className="mt-1.5 text-sm text-[#5e4a42]">
              Código de la agencia:{' '}
              <span className="rounded-md bg-white px-2 py-0.5 font-mono font-bold text-[#4a3933]">{shipping.trackingCode}</span>
            </p>
          )}
          {shipping.proofUrl && (
            <a href={shipping.proofUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#8c6d36] underline underline-offset-2">
              Ver constancia de envío <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      )}
    </section>
  );
}
