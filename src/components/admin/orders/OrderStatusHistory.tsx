"use client";

import React from 'react';
import { useOrderStatusHistory } from '@/hooks/use-admin-orders';
import { getOrderStatusInfo, formatDate } from '@/lib/order-helpers';
import { Skeleton } from '@/components/ui/Skeleton';
import { History } from 'lucide-react';
import { OrderStatus } from '@/types/checkout';

interface OrderStatusHistoryProps {
  orderId: string;
  deliveryType?: number | string;
}

export function OrderStatusHistory({ orderId, deliveryType }: OrderStatusHistoryProps) {
  const { data: history, isLoading, error } = useOrderStatusHistory(orderId);

  if (isLoading) {
    return <Skeleton variant="rect" className="mt-6 h-24 w-full rounded-xl" />;
  }
  if (error || !history) {
    return <p className="mt-6 text-sm text-rose">No se pudo cargar el historial.</p>;
  }
  if (history.length === 0) return null;

  // Lo más reciente arriba
  const events = [...history].reverse();

  return (
    <div className="mt-6 border-t border-sage/10 pt-5">
      <h4 className="mb-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-sage">
        <History size={13} /> Historial
      </h4>
      <ol className="space-y-0">
        {events.map((event, index) => {
          const statusKey = typeof event.status === 'string' ? (OrderStatus as Record<string, string | number>)[event.status] ?? event.status : event.status;
          const statusInfo = getOrderStatusInfo(statusKey, deliveryType);
          const last = index === events.length - 1;
          return (
            <li key={event.id || index} className="relative flex gap-3 pb-4 last:pb-0">
              {!last && <span className="absolute left-[5px] top-4 bottom-0 w-px bg-sage/15" />}
              <span className={`relative mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full border-2 border-white shadow-sm bg-${statusInfo.color} ${index === 0 ? 'ring-2 ring-gold/30' : ''}`} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <p className="text-sm font-semibold text-brown">{statusInfo.label}</p>
                  <p className="text-xs text-sage">{formatDate(event.createdAt)}</p>
                </div>
                {event.comment && <p className="mt-0.5 text-xs leading-relaxed text-sage">{event.comment}</p>}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
