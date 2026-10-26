"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, ExternalLink, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { adminOrderKeys, usePendingWhatsApp } from '@/hooks/use-admin-orders';
import { AdminOrdersService } from '@/services/admin-orders.service';
import { getNotificationTypeLabel } from '@/lib/order-helpers';
import { NotificationResponse } from '@/types/notifications';

function timeAgo(date: string) {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(date).getTime()) / 60000));
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.round(minutes / 60);
  return hours < 24 ? `hace ${hours} h` : `hace ${Math.round(hours / 24)} d`;
}

/**
 * Bandeja del día: avisos de WhatsApp que generó el sistema (precio listo, pago confirmado, pedido listo…)
 * y que aún nadie envió. Un toque abre WhatsApp con el mensaje escrito.
 */
export function PendingWhatsAppCard() {
  const queryClient = useQueryClient();
  const { data: pending, isLoading } = usePendingWhatsApp();
  const [blockedUrl, setBlockedUrl] = useState<Record<string, string>>({});

  const { mutate: prepare, isPending, variables } = useMutation({
    mutationFn: (n: NotificationResponse) => AdminOrdersService.prepareWhatsapp(n.orderId, n.id),
    onSuccess: (data, n) => {
      if (data.whatsappUrl && !window.open(data.whatsappUrl, '_blank', 'noopener,noreferrer')) {
        setBlockedUrl(prev => ({ ...prev, [n.id]: data.whatsappUrl }));
        return;
      }
      queryClient.invalidateQueries({ queryKey: adminOrderKeys.pendingWhatsApp });
      queryClient.invalidateQueries({ queryKey: adminOrderKeys.notifications(n.orderId) });
    },
    onError: () => toast.error('No pudimos preparar el WhatsApp.'),
  });

  if (isLoading) return <div className="h-40 animate-pulse rounded-[24px] bg-white" />;

  return (
    <section className="rounded-[24px] border border-sage/10 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-serif text-lg font-bold text-brown">
          <MessageCircle size={18} className="text-[#25D366]" /> WhatsApp por enviar
        </h2>
        {!!pending?.length && (
          <span className="rounded-full bg-[#25D366]/10 px-2.5 py-0.5 text-xs font-bold text-[#1a9e4b]">{pending.length}</span>
        )}
      </div>

      {!pending?.length ? (
        <p className="flex items-center gap-2 rounded-xl bg-[#FAFAFA] p-4 text-sm text-sage">
          <CheckCircle2 size={16} className="text-emerald-600" /> Todo al día: no hay mensajes pendientes.
        </p>
      ) : (
        <ul className="divide-y divide-sage/10">
          {pending.slice(0, 8).map(n => (
            <li key={n.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-brown">
                  {n.customerName || n.recipient}
                  <Link href={`/admin/pedidos/${n.orderId}`} className="ml-2 font-mono text-xs font-normal text-gold hover:underline">{n.orderCode}</Link>
                </p>
                <p className="text-xs text-sage">{getNotificationTypeLabel(n.type)} · {timeAgo(n.createdAt)}</p>
              </div>
              {blockedUrl[n.id] ? (
                <a
                  href={blockedUrl[n.id]}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => queryClient.invalidateQueries({ queryKey: adminOrderKeys.pendingWhatsApp })}
                  className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-[#25D366] px-3 text-xs font-medium text-white"
                >
                  <ExternalLink size={13} /> Abrir
                </a>
              ) : (
                <button
                  type="button"
                  disabled={isPending && variables?.id === n.id}
                  onClick={() => prepare(n)}
                  className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-[#25D366] px-3 text-xs font-medium text-white hover:bg-[#20bd5a] disabled:opacity-60"
                >
                  <MessageCircle size={13} /> Enviar
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {(pending?.length ?? 0) > 8 && <p className="mt-2 text-xs text-sage">Y {pending!.length - 8} más.</p>}
    </section>
  );
}
