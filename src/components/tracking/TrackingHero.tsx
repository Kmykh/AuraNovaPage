"use client";

import React from 'react';
import {
  Ban, Building2, Check, ClipboardCheck, CreditCard, Flower2, Gift, Store, Truck, X,
} from 'lucide-react';
import { PublicTrackingResponse } from '@/types/tracking';
import {
  buildMilestones, currentMilestoneIndex, deliveryTypeName, formatLongDate, MilestoneKey, statusCopy, statusName, timeAgo,
} from '@/lib/tracking-progress';
import { TrackingMoney, trackingPayment } from './TrackingMoney';

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

export function TrackingHero({ tracking }: { tracking: PublicTrackingResponse }) {
  const status = statusName(tracking.status);
  const deliveryType = deliveryTypeName(tracking.deliveryType);
  const isCustom = !!tracking.isCustomOrder;
  const isCancelled = status === 'Cancelled';

  const milestones = buildMilestones(isCustom, deliveryType);
  const current = currentMilestoneIndex(status);
  // Mientras Mercado Pago confirma un pago, no se invita a pagar de nuevo
  const copy = trackingPayment(tracking).state === 'processing'
    ? { title: 'Estamos confirmando tu pago', message: 'En cuanto Mercado Pago lo apruebe, tu pedido pasa al taller. Te avisamos por correo.' }
    : statusCopy(status, deliveryType, isCustom);

  if (isCancelled) return <CancelledHero tracking={tracking} isCustom={isCustom} deliveryType={deliveryType} />;

  const lastUpdate = tracking.timeline?.length ? tracking.timeline[tracking.timeline.length - 1].createdAt : undefined;
  const updatedAgo = timeAgo(lastUpdate);
  // El paso actual cuenta como "a medio camino" para que la barra avance con cada estado
  const progress = status === 'Delivered' ? 100 : Math.round(((current + 0.5) / milestones.length) * 100);

  return (
    <section className="rounded-[2rem] border border-[#ece3da] bg-white p-5 shadow-[0_24px_50px_-36px_rgba(74,57,51,0.45)] sm:p-8">
      {/* Estado principal */}
      <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#b08a4e]">
        {isCustom ? 'Pedido personalizado' : 'Pedido'} · {tracking.orderCode}
      </p>
      <h2 className="mt-2 font-serif text-3xl font-bold leading-tight text-[#4a3933] sm:text-4xl">{copy.title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#6b5a50] sm:text-base">{copy.message}</p>
      {updatedAgo && <p className="mt-2 text-xs text-[#a3958c]">Última actualización {updatedAgo}</p>}

      <div className="mt-5">
        <TrackingMoney tracking={tracking} />
      </div>

      {/* Progreso */}
      {(
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

/** Pedido cancelado: por qué, cuándo, en qué paso se detuvo y qué pasó con el dinero. */
function CancelledHero({ tracking, isCustom, deliveryType }: { tracking: PublicTrackingResponse; isCustom: boolean; deliveryType: string }) {
  const timeline = tracking.timeline ?? [];
  const cancelEvent = [...timeline].reverse().find(e => e.kind === 'cancelled' || statusName(e.status) === 'Cancelled');
  const reason = cancelEvent?.description?.startsWith('Motivo:') ? cancelEvent.description.slice('Motivo:'.length).trim() : null;
  // Último paso que alcanzó antes de cancelarse (los eventos de pago y devolución no cuentan)
  const lastStep = [...timeline].reverse().find(e =>
    statusName(e.status) !== 'Cancelled' && e.kind !== 'refund' && e.kind !== 'rejection' && statusName(e.status) !== 'Refunded');
  const stoppedAt = lastStep ? currentMilestoneIndex(statusName(lastStep.status)) : 0;
  const milestones = buildMilestones(isCustom, deliveryType);
  const payment = trackingPayment(tracking);

  const subtitle = payment.state === 'refunded'
    ? 'Ya te devolvimos tu dinero. Abajo tienes el detalle.'
    : payment.state === 'refund_pending'
      ? 'Te devolveremos lo que pagaste. Aquí verás cuando esté hecho.'
      : 'No se te cobró nada por este pedido.';

  return (
    <section className="rounded-[2rem] border border-[#ecd9d9] bg-white p-5 shadow-[0_24px_50px_-36px_rgba(74,57,51,0.45)] sm:p-8">
      <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#b07474]">
        {isCustom ? 'Pedido personalizado' : 'Pedido'} · {tracking.orderCode}
      </p>
      <div className="mt-3 flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fdf0f0] text-[#c06b6b]">
          <Ban className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <h2 className="font-serif text-3xl font-bold leading-tight text-[#4a3933] sm:text-4xl">Pedido cancelado</h2>
          <p className="mt-1 text-sm text-[#6b5a50] sm:text-base">
            {cancelEvent?.createdAt && <>El {formatLongDate(cancelEvent.createdAt, false).toLowerCase()}. </>}
            {subtitle}
          </p>
        </div>
      </div>

      {reason && (
        <p className="mt-4 rounded-2xl border-l-4 border-[#d9a5a5] bg-[#fdf7f7] px-4 py-3 text-sm text-[#5e4a42]">
          <span className="font-bold text-[#4a3933]">Motivo:</span> {reason}
        </p>
      )}

      <div className="mt-5">
        <TrackingMoney tracking={tracking} />
      </div>

      {/* Hasta dónde llegó */}
      <ol className="mt-7 grid grid-cols-5 gap-1" aria-label="Hasta dónde llegó el pedido">
        {milestones.map((milestone, index) => {
          const done = index < stoppedAt;
          const stopped = index === stoppedAt;
          return (
            <li key={milestone.key} className="flex flex-col items-center text-center">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full sm:h-11 sm:w-11 ${
                  done ? 'bg-stone-300 text-white' : stopped ? 'bg-[#fdf0f0] text-[#c06b6b] ring-2 ring-[#e5b4b4]' : 'border border-dashed border-stone-200 text-stone-300'
                }`}
              >
                {done ? <Check className="h-4 w-4" strokeWidth={3} /> : stopped ? <X className="h-4 w-4" strokeWidth={3} /> : null}
              </span>
              <span className={`mt-2 text-[10px] font-semibold leading-tight sm:text-xs ${stopped ? 'text-[#c06b6b]' : done ? 'text-stone-500' : 'text-stone-300'}`}>
                {milestone.label}
                {stopped && <span className="block text-[9px] font-bold uppercase tracking-wider">Cancelado</span>}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
