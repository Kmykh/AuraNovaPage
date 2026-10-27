"use client";

import React, { useState } from 'react';
import { useOrderNotifications, usePrepareWhatsapp, useResendEmail } from '@/hooks/use-admin-orders';
import { getNotificationTypeLabel } from '@/lib/order-helpers';
import { Skeleton } from '@/components/ui/Skeleton';
import { Bell, CheckCircle2, MessageCircle, AlertTriangle, ExternalLink, Mail, RotateCw } from 'lucide-react';
import { toast } from 'sonner';
import { NotificationStatus, NotificationChannel } from '@/types/enums';
import { NotificationResponse } from '@/types/notifications';

const STATUS_LABEL: Record<NotificationStatus, { whatsapp: string; email: string }> = {
  [NotificationStatus.Generated]: { whatsapp: 'Por enviar', email: 'En cola' },
  [NotificationStatus.Opened]: { whatsapp: 'WhatsApp abierto', email: 'Abierto' },
  [NotificationStatus.Sent]: { whatsapp: 'Enviado', email: 'Enviado' },
  [NotificationStatus.Failed]: { whatsapp: 'Falló', email: 'No se envió' },
};

/** Fecha corta para la columna lateral: "26 oct., 07:56 p. m." */
function shortDate(value: string) {
  try {
    return new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
  } catch {
    return value;
  }
}

function statusLabel(n: NotificationResponse) {
  const labels = STATUS_LABEL[n.status];
  if (!labels) return 'Desconocido';
  return n.channel === NotificationChannel.Email ? labels.email : labels.whatsapp;
}

export function OrderNotifications({ orderId }: { orderId: string }) {
  const { data: notifications, isLoading, error } = useOrderNotifications(orderId);
  const { mutate: prepareWhatsapp, isPending } = usePrepareWhatsapp(orderId);
  const { mutate: resendEmail, isPending: isResending, variables: resendingId } = useResendEmail(orderId);
  const [fallbackUrl, setFallbackUrl] = useState<{ [key: string]: string }>({});

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <Skeleton key={i} variant="rect" className="w-full h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  if (error || !notifications) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-sage/10 text-center">
        <AlertTriangle className="w-8 h-8 text-rose mx-auto mb-2" />
        <p className="text-sm text-brown font-medium">No pudimos cargar las notificaciones.</p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-sage/10 text-center">
        <Bell className="w-8 h-8 text-sage/40 mx-auto mb-2" />
        <p className="text-sm text-sage">No hay notificaciones generadas para este pedido.</p>
      </div>
    );
  }

  const handlePrepare = (notificationId: string) => {
    // Limpiar fallback previo si existe para este id
    setFallbackUrl(prev => {
      const copy = { ...prev };
      delete copy[notificationId];
      return copy;
    });

    prepareWhatsapp(notificationId, {
      onSuccess: (data) => {
        if (data.whatsappUrl) {
          const opened = window.open(data.whatsappUrl, '_blank', 'noopener,noreferrer');
          if (!opened) {
            toast.error('Tu navegador bloqueó la apertura de WhatsApp. Usa el botón para abrirlo manualmente.');
            setFallbackUrl(prev => ({ ...prev, [notificationId]: data.whatsappUrl }));
          }
        }
      },
      onError: () => {
        toast.error('No pudimos preparar el mensaje de WhatsApp.');
      }
    });
  };

  // Cada aviso sale por correo y por WhatsApp: se muestran juntos en una sola fila
  const groups: { key: string; type: NotificationResponse['type']; createdAt: string; email?: NotificationResponse; whatsapp?: NotificationResponse }[] = [];
  for (const n of [...notifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())) {
    const isWhatsApp = n.channel === NotificationChannel.WhatsApp;
    // Mismo aviso = mismo tipo y creados con menos de 2 minutos de diferencia
    const group = groups.find(g => g.type === n.type && !(isWhatsApp ? g.whatsapp : g.email) &&
      Math.abs(new Date(g.createdAt).getTime() - new Date(n.createdAt).getTime()) < 120_000);
    if (group) {
      if (isWhatsApp) group.whatsapp = n; else group.email = n;
    } else {
      groups.push({ key: n.id, type: n.type, createdAt: n.createdAt, ...(isWhatsApp ? { whatsapp: n } : { email: n }) });
    }
  }

  const chip = 'inline-flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium';

  const emailActions = (n: NotificationResponse) => {
    const busy = isResending && resendingId === n.id;
    const tone = n.status === NotificationStatus.Failed ? 'text-red-600' : n.status === NotificationStatus.Generated ? 'text-[#8c6d36]' : 'text-sage';
    return (
      <span className="flex items-center gap-1.5">
        <span className={`text-xs font-medium ${tone}`} title={n.recipient}>{statusLabel(n)}</span>
        {/* Reenviar: si falló, o si el cliente dice que no le llegó */}
        {n.status !== NotificationStatus.Generated && (
          <button type="button" disabled={busy} onClick={() => resendEmail(n.id)} title="Volver a enviar este correo" aria-label="Reenviar correo"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-sage/20 bg-white text-brown hover:border-gold disabled:opacity-60">
            <RotateCw size={12} className={busy ? 'animate-spin' : ''} />
          </button>
        )}
      </span>
    );
  };

  const whatsappActions = (n: NotificationResponse) => {
    const failed = n.status === NotificationStatus.Failed;
    if (fallbackUrl[n.id]) {
      return (
        <a href={fallbackUrl[n.id]} target="_blank" rel="noopener noreferrer" className={`${chip} bg-[#25D366] text-white hover:bg-[#20bd5a]`}>
          <ExternalLink size={13} /> Abrir
        </a>
      );
    }
    if (n.status === NotificationStatus.Generated || failed) {
      return (
        <button type="button" disabled={isPending} onClick={() => handlePrepare(n.id)} className={`${chip} bg-[#25D366] font-semibold text-white hover:bg-[#20bd5a] disabled:opacity-60`}>
          <MessageCircle size={13} /> {failed ? 'Reintentar' : 'Enviar'}
        </button>
      );
    }
    if (n.status === NotificationStatus.Opened && n.channelUrl) {
      return (
        <a href={n.channelUrl} target="_blank" rel="noopener noreferrer" className={`${chip} border border-[#25D366] text-[#1a9e4b] hover:bg-[#25D366]/5`}>
          <ExternalLink size={13} /> Reabrir
        </a>
      );
    }
    return <span className="flex items-center gap-1 text-xs font-medium text-[#1a9e4b]"><CheckCircle2 size={13} /> Enviado</span>;
  };

  return (
    <div className="rounded-[24px] border border-sage/10 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-1 flex items-center gap-2 font-serif text-lg font-bold text-brown">
        <Bell size={18} className="text-gold" />
        <h3>Avisos al cliente</h3>
      </div>
      <p className="mb-4 text-xs text-sage">El correo sale solo; el WhatsApp lo envías con un toque.</p>

      <ul className="space-y-2.5">
        {groups.map(group => {
          const failedEmail = group.email?.status === NotificationStatus.Failed ? group.email : undefined;
          return (
            <li key={group.key} className={`rounded-xl border p-3 ${failedEmail ? 'border-red-200 bg-red-50/40' : 'border-sage/10 bg-[#FAFAFA]'}`}>
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm font-semibold text-brown">{getNotificationTypeLabel(group.type)}</p>
                <p className="shrink-0 text-[11px] text-sage">{shortDate(group.createdAt)}</p>
              </div>
              <div className="mt-2 space-y-1.5">
                {group.whatsapp && (
                  <div className="flex min-h-8 items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-xs text-sage"><MessageCircle size={13} className="text-[#1a9e4b]" /> WhatsApp</span>
                    {whatsappActions(group.whatsapp)}
                  </div>
                )}
                {group.email && (
                  <div className="flex min-h-8 items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-xs text-sage"><Mail size={13} className="text-gold" /> Correo</span>
                    {emailActions(group.email)}
                  </div>
                )}
              </div>
              {failedEmail?.errorMessage && <p className="mt-2 rounded-lg bg-white px-3 py-2 text-xs text-red-600">{failedEmail.errorMessage}</p>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
