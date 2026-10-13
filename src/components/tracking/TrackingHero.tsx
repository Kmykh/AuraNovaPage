"use client";

import React from 'react';
import {
  ClipboardCheck, CreditCard, Flower2, Truck, Store, Building2, Gift, Ban, Check, Hourglass, Sparkles,
} from 'lucide-react';
import { PublicTrackingResponse } from '@/types/tracking';
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

const TONE_STYLES = {
  waiting: { ring: 'ring-[#c8a96b]/30', badge: 'bg-[#c8a96b]/15 text-[#f3e3bd]', icon: Hourglass },
  action: { ring: 'ring-[#d38b8b]/40', badge: 'bg-[#d38b8b]/20 text-[#f6d6d6]', icon: Sparkles },
  progress: { ring: 'ring-[#c8a96b]/40', badge: 'bg-[#c8a96b]/15 text-[#f3e3bd]', icon: Flower2 },
  success: { ring: 'ring-emerald-300/40', badge: 'bg-emerald-400/15 text-emerald-100', icon: Gift },
  cancelled: { ring: 'ring-stone-300/30', badge: 'bg-stone-200/15 text-stone-200', icon: Ban },
} as const;

export function TrackingHero({ tracking }: { tracking: PublicTrackingResponse }) {
  const status = statusName(tracking.status);
  const deliveryType = deliveryTypeName(tracking.deliveryType);
  const isCustom = !!tracking.isCustomOrder;
  const isCancelled = status === 'Cancelled';

  const milestones = buildMilestones(isCustom, deliveryType);
  const current = currentMilestoneIndex(status);
  const copy = statusCopy(status, deliveryType, isCustom);
  const tone = TONE_STYLES[copy.tone];
  const StatusIcon = status === 'Delivered' ? Gift : tone.icon;

  const lastUpdate = tracking.timeline?.length ? tracking.timeline[tracking.timeline.length - 1].createdAt : undefined;
  const updatedAgo = timeAgo(lastUpdate);
  // El paso actual cuenta como "a medio camino" para que la barra avance con cada estado
  const progress = isCancelled ? 0 : status === 'Delivered' ? 100 : Math.round(((current + 0.5) / milestones.length) * 100);

  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#4a3933] via-[#5a463e] to-[#7a5c45] text-white shadow-[0_24px_60px_-20px_rgba(74,57,51,0.55)]">
      {/* Brillos decorativos */}
      <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#c8a96b]/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-10 h-56 w-56 rounded-full bg-[#d38b8b]/20 blur-3xl" />

      <div className="relative px-5 pb-6 pt-6 sm:px-8 sm:pt-8">
        {/* Estado principal */}
        <div className="flex items-start gap-4 sm:gap-6">
          <div className={`relative shrink-0 rounded-full ring-8 ${tone.ring}`}>
            {!isCancelled && status !== 'Delivered' && (
              <span className="absolute inset-0 animate-ping rounded-full bg-[#c8a96b]/30" />
            )}
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#c8a96b] to-[#b08a4e] shadow-lg sm:h-20 sm:w-20">
              <StatusIcon className="h-8 w-8 text-white sm:h-10 sm:w-10" strokeWidth={1.8} />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${tone.badge}`}>
              {isCustom ? '✨ Pedido personalizado' : 'Pedido'} · {tracking.orderCode}
            </span>
            <h2 className="mt-2 font-serif text-2xl font-bold leading-tight sm:text-3xl">{copy.title}</h2>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-[#eadfd6] sm:text-base">{copy.message}</p>
            {updatedAgo && (
              <p className="mt-2 text-xs text-[#c9b8ad]">Última actualización {updatedAgo}</p>
            )}
          </div>
        </div>

        {/* Progreso */}
        {!isCancelled && (
          <div className="mt-7">
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#e8c98a] via-[#c8a96b] to-[#d38b8b] transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            <ol className="mt-4 grid grid-cols-5 gap-1">
              {milestones.map((milestone, index) => {
                const done = index < current || status === 'Delivered';
                const active = index === current && status !== 'Delivered';
                const Icon = milestone.key === 'onTheWay' ? onTheWayIcon(deliveryType) : MILESTONE_ICONS[milestone.key];

                return (
                  <li key={milestone.key} className="flex flex-col items-center text-center">
                    <div
                      className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-500 sm:h-12 sm:w-12 ${
                        done
                          ? 'border-[#c8a96b] bg-[#c8a96b] text-white'
                          : active
                            ? 'scale-110 border-white bg-white text-[#4a3933] shadow-lg'
                            : 'border-white/25 bg-white/5 text-white/45'
                      }`}
                    >
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2} />
                      {done && (
                        <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[#b08a4e]">
                          <Check className="h-3 w-3" strokeWidth={3.5} />
                        </span>
                      )}
                    </div>
                    <span
                      className={`mt-2 text-[10px] font-semibold leading-tight sm:text-xs ${
                        done || active ? 'text-white' : 'text-white/50'
                      }`}
                    >
                      {milestone.label}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        )}
      </div>
    </section>
  );
}
