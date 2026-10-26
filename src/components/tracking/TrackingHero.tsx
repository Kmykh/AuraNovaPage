"use client";

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight, Building2, Check, CheckCircle2, ClipboardCheck, CreditCard, Flower2, Gift, Store, Truck,
} from 'lucide-react';
import { PublicTrackingResponse } from '@/types/tracking';
import { formatCurrency } from '@/lib/formatters';
import {
  buildMilestones, currentMilestoneIndex, deliveryTypeName, MilestoneKey, statusCopy, statusName, timeAgo,
} from '@/lib/tracking-progress';

const MILESTONE_ICONS: Record<MilestoneKey, React.ElementType> = {
  received: ClipboardCheck,
  payment: CreditCard,
  workshop: Flower2,
  onTheWay: Truck,
  delivered: Gift,
};

function onTheWayIcon(deliveryType: string): React.ElementType {
  if (deliveryType === 'MeetingPoint') return Store;
  if (deliveryType === 'NationalShipping') return Building2;
  return Truck;
}

/** Cuánto se pagó y cuánto falta, con el botón para pagar si corresponde. */
function PaymentStrip({ tracking, status }: { tracking: PublicTrackingResponse; status: string }) {
  const total = tracking.costs?.total ?? null;
  const paid = tracking.costs?.amountPaid ?? 0;
  const due = tracking.costs?.balanceDue ?? (total != null ? Math.max(0, total - paid) : 0);
  const payHref = tracking.orderId ? `/pago/${tracking.orderId}` : null;
  if (status === 'Cancelled' || total == null || total <= 0) return null;

  if (paid > 0 && due <= 0) {
    return (
      <div className="flex items-center gap-2.5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        <CheckCircle2 className="h-5 w-5 shrink-0" />
        <span><strong>Pagado por completo</strong> · {formatCurrency(paid)}</span>
      </div>
    );
  }

  const waiting = paid <= 0;
  if (waiting && !['WaitingPayment', 'PaymentReported'].includes(status)) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#c8a96b]/30 bg-[#fffbf3] px-4 py-3">
      <div className="text-sm text-[#6b5a50]">
        {waiting ? (
          <><strong className="text-[#4a3933]">Pendiente de pago</strong> · {formatCurrency(total)}</>
        ) : (
          <>Pagaste {formatCurrency(paid)} · <strong className="text-[#4a3933]">te falta {formatCurrency(due)}</strong></>
        )}
        <span className="mt-0.5 block text-xs text-[#887870]">
          {waiting
            ? 'Con tarjeta o Yape: el 50% de adelanto o el total.'
            : status === 'Ready'
              ? '¡Ya está listo! Paga el saldo y lo entregamos.'
              : 'Lo pagas antes de la entrega; te avisamos cuando esté listo.'}
        </span>
      </div>
      {payHref && status !== 'PaymentReported' && (
        <Link href={payHref} className="inline-flex items-center gap-1.5 rounded-full bg-[#4a3933] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#3a2d28]">
          {waiting ? 'Ir a pagar' : 'Pagar el saldo'} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

export function TrackingHero({ tracking }: { tracking: PublicTrackingResponse }) {
  const status = statusName(tracking.status);
  const deliveryType = deliveryTypeName(tracking.deliveryType);
  const isCustom = !!tracking.isCustomOrder;
  const isCancelled = status === 'Cancelled';

  const milestones = buildMilestones(isCustom, deliveryType);
  const current = currentMilestoneIndex(status);
  const copy = statusCopy(status, deliveryType, isCustom);

  const lastUpdate = tracking.timeline?.length ? tracking.timeline[tracking.timeline.length - 1].createdAt : undefined;
  const updatedAgo = timeAgo(lastUpdate);
  // El paso actual cuenta como "a medio camino" para que la barra avance con cada estado
  const progress = isCancelled ? 0 : status === 'Delivered' ? 100 : Math.round(((current + 0.5) / milestones.length) * 100);

  return (
    <section className="rounded-[2rem] border border-[#ece3da] bg-white p-5 shadow-[0_24px_50px_-36px_rgba(74,57,51,0.45)] sm:p-8">
      {/* Estado principal */}
      <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#b08a4e]">
        {isCustom ? 'Pedido personalizado' : 'Pedido'} · {tracking.orderCode}
      </p>
      <h2 className={`mt-2 font-serif text-3xl font-bold leading-tight sm:text-4xl ${isCancelled ? 'text-stone-500' : 'text-[#4a3933]'}`}>{copy.title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#6b5a50] sm:text-base">{copy.message}</p>
      {updatedAgo && <p className="mt-2 text-xs text-[#a3958c]">Última actualización {updatedAgo}</p>}

      <div className="mt-5">
        <PaymentStrip tracking={tracking} status={status} />
      </div>

      {/* Progreso */}
      {!isCancelled && (
        <div className="mt-8">
          <div className="relative h-1 w-full overflow-hidden rounded-full bg-[#f1e9e4]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#4a3933] to-[#c8a96b] transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <ol className="mt-5 grid grid-cols-5 gap-1">
            {milestones.map((milestone, index) => {
              const done = index < current || status === 'Delivered';
              const active = index === current && status !== 'Delivered';
              const Icon = milestone.key === 'onTheWay' ? onTheWayIcon(deliveryType) : MILESTONE_ICONS[milestone.key];

              return (
                <li key={milestone.key} className="flex flex-col items-center text-center">
                  <span
                    className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-500 sm:h-11 sm:w-11 ${
                      done
                        ? 'bg-[#4a3933] text-white'
                        : active
                          ? 'bg-[#fdf8ee] text-[#8f6d28] ring-2 ring-[#c8a96b]'
                          : 'border border-[#e8dcdc] text-[#c4b8af]'
                    }`}
                  >
                    {done ? <Check className="h-4 w-4" strokeWidth={3} /> : <Icon className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.8} />}
                  </span>
                  <span className={`mt-2 text-[10px] font-semibold leading-tight sm:text-xs ${done || active ? 'text-[#4a3933]' : 'text-[#b7a9a0]'}`}>
                    {milestone.label}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </section>
  );
}
