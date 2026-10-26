"use client";

import React, { useState } from 'react';
import { useOrderNotifications, usePrepareWhatsapp, useResendEmail } from '@/hooks/use-admin-orders';
import { formatDate, getNotificationTypeLabel } from '@/lib/order-helpers';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Bell, CheckCircle2, MessageCircle, AlertTriangle, ExternalLink, Mail, RotateCw, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { NotificationStatus, NotificationChannel } from '@/types/enums';
import { NotificationResponse } from '@/types/notifications';

const STATUS_LABEL: Record<NotificationStatus, { whatsapp: string; email: string }> = {
  [NotificationStatus.Generated]: { whatsapp: 'Por enviar', email: 'En cola' },
  [NotificationStatus.Opened]: { whatsapp: 'WhatsApp abierto', email: 'Abierto' },
  [NotificationStatus.Sent]: { whatsapp: 'Enviado', email: 'Enviado' },
  [NotificationStatus.Failed]: { whatsapp: 'Falló', email: 'No se pudo enviar' },
};

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

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-sage/10">
      <div className="flex items-center gap-2 mb-2 text-brown font-serif font-semibold text-lg">
        <Bell size={20} className="text-gold" />
        <h3>Notificaciones</h3>
      </div>
      <p className="mb-5 text-xs text-sage">Los correos salen solos. Los WhatsApp se envían con un toque desde aquí.</p>

      <div className="space-y-3">
        {notifications.map((n) => {
          const isWhatsApp = n.channel === NotificationChannel.WhatsApp;
          const failed = n.status === NotificationStatus.Failed;

          return (
            <div
              key={n.id}
              className={`p-3 border rounded-xl transition-colors ${failed ? 'border-red-200 bg-red-50/50' : 'bg-[#FAFAFA] border-sage/10 hover:border-sage/30'}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${isWhatsApp ? 'bg-[#25D366]/10 text-[#1a9e4b]' : 'bg-gold/10 text-gold'}`}>
                    {isWhatsApp ? <MessageCircle size={15} /> : <Mail size={15} />}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-brown">{getNotificationTypeLabel(n.type)}</p>
                    <p className="truncate text-xs text-sage">
                      {formatDate(n.sentAt ?? n.createdAt)} • {statusLabel(n)}
                      {!isWhatsApp && n.recipient && <> • {n.recipient}</>}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {fallbackUrl[n.id] ? (
                    <a
                      href={fallbackUrl[n.id]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium bg-[#25D366] text-white hover:bg-[#20bd5a] transition-colors"
                    >
                      <ExternalLink size={14} /> Abrir manual
                    </a>
                  ) : isWhatsApp ? (
                    <>
                      {(n.status === NotificationStatus.Generated || failed) && (
                        <Button
                          size="sm"
                          disabled={isPending}
                          onClick={() => handlePrepare(n.id)}
                          className="bg-[#25D366] text-white hover:bg-[#20bd5a] h-8 text-xs font-medium px-4 shadow-sm border-none"
                        >
                          <MessageCircle size={14} className="mr-1.5" />
                          {failed ? 'Reintentar' : 'Enviar'}
                        </Button>
                      )}

                      {n.status === NotificationStatus.Opened && n.channelUrl && (
                        <a
                          href={n.channelUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 h-8 px-4 rounded-lg text-xs font-medium bg-cream text-[#25D366] border border-[#25D366] hover:bg-[#25D366]/5 transition-colors"
                        >
                          <ExternalLink size={14} /> Reabrir
                        </a>
                      )}

                      {n.status === NotificationStatus.Sent && (
                        <span className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium bg-sage/10 text-sage cursor-default">
                          <CheckCircle2 size={14} /> Enviado
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      {n.status === NotificationStatus.Sent && (
                        <span className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium bg-sage/10 text-sage cursor-default">
                          <CheckCircle2 size={14} /> Enviado
                        </span>
                      )}
                      {n.status === NotificationStatus.Generated && (
                        <span className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium bg-gold/10 text-[#8c6d36] cursor-default">
                          <Clock size={14} /> En cola
                        </span>
                      )}
                      {/* Reenviar: si falló, o si el cliente dice que no le llegó */}
                      {n.status !== NotificationStatus.Generated && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isResending && resendingId === n.id}
                          onClick={() => resendEmail(n.id)}
                          className="h-8 px-3 text-xs"
                          title="Volver a enviar este correo"
                        >
                          <RotateCw size={13} className={`mr-1 ${isResending && resendingId === n.id ? 'animate-spin' : ''}`} />
                          Reenviar
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {failed && n.errorMessage && (
                <p className="mt-2 rounded-lg bg-white px-3 py-2 text-xs text-red-600">{n.errorMessage}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
