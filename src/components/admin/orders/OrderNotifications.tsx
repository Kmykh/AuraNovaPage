"use client";

import React, { useState } from 'react';
import { useOrderNotifications, usePrepareWhatsapp } from '@/hooks/use-admin-orders';
import { formatDate, getNotificationTypeLabel } from '@/lib/order-helpers';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Bell, CheckCircle2, MessageCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { NotificationStatus, NotificationChannel } from '@/types/enums';

export function OrderNotifications({ orderId }: { orderId: string }) {
  const { data: notifications, isLoading, error } = useOrderNotifications(orderId);
  const { mutate: prepareWhatsapp, isPending } = usePrepareWhatsapp(orderId);
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

  const getStatusIcon = (status: number | string) => {
    const key = typeof status === 'string' ? (NotificationStatus as any)[status] ?? status : status;
    switch(key) {
      case NotificationStatus.Generated: return <Bell size={16} className="text-gold" />; // Generated
      case NotificationStatus.Opened: return <MessageCircle size={16} className="text-gold" />; // Opened
      case NotificationStatus.Sent: return <CheckCircle2 size={16} className="text-sage" />; // Sent
      case NotificationStatus.Failed: return <AlertTriangle size={16} className="text-rose" />; // Failed
      default: return <Bell size={16} className="text-sage" />;
    }
  };

  const getStatusLabel = (status: number | string) => {
    const key = typeof status === 'string' ? (NotificationStatus as any)[status] ?? status : status;
    switch(key) {
      case NotificationStatus.Generated: return 'Generada';
      case NotificationStatus.Opened: return 'WhatsApp preparado';
      case NotificationStatus.Sent: return 'Enviada';
      case NotificationStatus.Failed: return 'Fallida';
      default: return 'Desconocido';
    }
  };

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
      <div className="flex items-center gap-2 mb-6 text-brown font-serif font-semibold text-lg">
        <Bell size={20} className="text-gold" />
        <h3>Notificaciones</h3>
      </div>
      
      <div className="space-y-3">
        {notifications.map((n) => {
          const statusKey = typeof n.status === 'string' ? (NotificationStatus as any)[n.status] ?? n.status : n.status;
          const channelKey = typeof n.channel === 'string' ? (NotificationChannel as any)[n.channel] ?? n.channel : n.channel;
          const isWhatsApp = channelKey === NotificationChannel.WhatsApp;

          return (
            <div key={n.id} className="flex items-center justify-between p-3 bg-[#FAFAFA] border border-sage/10 rounded-xl hover:border-sage/30 transition-colors">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-brown">
                  {getNotificationTypeLabel(n.type)}
                </span>
                <span className="text-xs text-sage mt-0.5">
                  {formatDate(n.createdAt)} • {getStatusLabel(statusKey)}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
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
                    {(statusKey === NotificationStatus.Generated || statusKey === NotificationStatus.Failed) && (
                      <Button 
                        size="sm"
                        disabled={isPending}
                        onClick={() => handlePrepare(n.id)}
                        className="bg-[#25D366] text-white hover:bg-[#20bd5a] h-8 text-xs font-medium px-4 shadow-sm border-none"
                      >
                        <MessageCircle size={14} className="mr-1.5" /> 
                        {statusKey === NotificationStatus.Failed ? 'Reintentar' : 'Enviar WhatsApp'}
                      </Button>
                    )}

                    {statusKey === NotificationStatus.Opened && n.channelUrl && (
                      <a 
                        href={n.channelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 h-8 px-4 rounded-lg text-xs font-medium bg-cream text-[#25D366] border border-[#25D366] hover:bg-[#25D366]/5 transition-colors"
                      >
                        <ExternalLink size={14} /> Reabrir WhatsApp
                      </a>
                    )}

                    {statusKey === NotificationStatus.Sent && (
                      <span className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium bg-sage/10 text-sage cursor-default">
                        <CheckCircle2 size={14} /> Enviado
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-xs text-sage">{getStatusLabel(statusKey)}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
