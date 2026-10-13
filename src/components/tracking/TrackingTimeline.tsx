"use client";

import React from 'react';
import {
  ClipboardCheck, FileText, CreditCard, Receipt, BadgeCheck, Flower2, Gift, Truck, Building2, PackageCheck, Ban, XCircle,
} from 'lucide-react';
import { TrackingTimelineEvent } from '@/types/tracking';
import { getOrderStatusDescription } from '@/lib/tracking-helpers';
import { statusName } from '@/lib/tracking-progress';

const EVENT_ICONS: Record<string, React.ElementType> = {
  WaitingQuote: ClipboardCheck,
  QuoteReady: FileText,
  WaitingPayment: CreditCard,
  PaymentRejected: XCircle,
  PaymentReported: Receipt,
  PaymentConfirmed: BadgeCheck,
  Preparing: Flower2,
  Ready: Gift,
  Shipped: Truck,
  DeliveredToAgency: Building2,
  Delivered: PackageCheck,
  Cancelled: Ban,
};

function eventLabel(event: TrackingTimelineEvent): string {
  return event.label === 'DeliveredToAgency' ? 'Entregado a la agencia' : event.label;
}

export function TrackingTimeline({ events }: { events: TrackingTimelineEvent[] }) {
  // El más reciente primero: es lo que el cliente quiere ver
  const ordered = [...(events ?? [])].reverse();
  if (ordered.length === 0) return null;

  return (
    <section className="rounded-[1.75rem] border border-[#e8dcdc]/70 bg-white p-5 shadow-[0_10px_30px_-12px_rgba(200,169,107,0.18)] sm:p-7">
      <h3 className="font-serif text-lg font-bold text-[#4a3933] sm:text-xl">Historial de tu pedido</h3>
      <p className="mt-0.5 text-xs text-[#887870]">Cada cambio queda registrado aquí.</p>

      <ol className="mt-6">
        {ordered.map((event, index) => {
          const name = statusName(event.status);
          const Icon = EVENT_ICONS[name] ?? ClipboardCheck;
          const isLatest = index === 0;
          const isLast = index === ordered.length - 1;
          const isNegative = name === 'Cancelled' || name === 'PaymentRejected';
          const date = event.createdAt ? new Date(event.createdAt) : null;

          return (
            <li key={`${name}-${event.createdAt}-${index}`} className="relative flex gap-4">
              {/* Conector */}
              {!isLast && <span className="absolute left-5 top-11 h-[calc(100%-2.25rem)] w-px bg-gradient-to-b from-[#e8dcdc] to-transparent" />}

              <div
                className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  isNegative
                    ? 'bg-[#fdf0f0] text-[#c06b6b]'
                    : isLatest
                      ? 'bg-gradient-to-br from-[#c8a96b] to-[#b08a4e] text-white shadow-md shadow-[#c8a96b]/30'
                      : 'bg-[#faf7f2] text-[#b08a4e]'
                }`}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
              </div>

              <div className={`flex-1 ${isLast ? 'pb-0' : 'pb-6'}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                  <p className={`text-sm font-bold sm:text-base ${isLatest ? 'text-[#4a3933]' : 'text-[#5e4a42]'}`}>
                    {eventLabel(event)}
                    {isLatest && (
                      <span className="ml-2 rounded-full bg-[#c8a96b]/15 px-2 py-0.5 align-middle text-[10px] font-bold uppercase tracking-wider text-[#b08a4e]">
                        Ahora
                      </span>
                    )}
                  </p>
                  {date && (
                    <time className="text-xs font-medium text-[#887870]" dateTime={event.createdAt}>
                      {date.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })} ·{' '}
                      {date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                    </time>
                  )}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-[#887870] sm:text-sm">
                  {event.description || getOrderStatusDescription(event.status)}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
