"use client";

import React from 'react';
import { useOrderStatusHistory } from '@/hooks/use-admin-orders';
import { getOrderStatusInfo, formatDate } from '@/lib/order-helpers';
import { Skeleton } from '@/components/ui/Skeleton';
import { History, MessageSquare } from 'lucide-react';
import { OrderStatus } from '@/types/checkout';

export function OrderStatusHistory({ orderId }: { orderId: string }) {
  const { data: history, isLoading, error } = useOrderStatusHistory(orderId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} variant="rect" className="w-full h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  if (error || !history) {
    return <div className="text-sm text-rose">No se pudo cargar el historial.</div>;
  }

  if (history.length === 0) {
    return <div className="text-sm text-sage">No hay historial registrado.</div>;
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-sage/10 relative">
      <div className="flex items-center gap-2 mb-6 text-brown font-serif font-semibold text-lg">
        <History size={20} />
        <h3>Historial del pedido</h3>
      </div>
      
      <div className="relative pl-3 before:absolute before:top-4 before:bottom-4 before:left-[21px] before:w-0.5 before:bg-sage/20">
        <div className="space-y-6">
          {history.map((event, index) => {
            const statusKey = typeof event.status === 'string' ? (OrderStatus as any)[event.status] ?? event.status : event.status;
            const statusInfo = getOrderStatusInfo(statusKey);
            const isLast = index === history.length - 1;
            
            return (
              <div key={event.id || index} className="relative flex items-start gap-5">
                {/* Timeline dot */}
                <div className={`w-5 h-5 mt-1 rounded-full border-[3px] border-white bg-${statusInfo.color} shrink-0 z-10 shadow-sm`} />
                
                {/* Content */}
                <div className="flex-1 bg-[#FAFAFA] border border-sage/10 rounded-xl p-4 shadow-sm hover:border-sage/30 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-${statusInfo.color}/10 text-${statusInfo.color} uppercase tracking-wider`}>
                      {statusInfo.label}
                    </span>
                    <span className="text-xs text-sage font-medium">{formatDate(event.createdAt)}</span>
                  </div>
                  
                  {event.comment && (
                    <div className="mt-3 flex gap-2.5 text-sm text-brown bg-white p-3 rounded-lg border border-sage/10 shadow-sm">
                      <MessageSquare size={16} className="text-sage shrink-0 mt-0.5" />
                      <p className="whitespace-pre-wrap leading-relaxed italic">{event.comment}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
