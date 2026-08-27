import { OrderStatus, DeliveryType, NotificationType } from '@/types/enums';

export const ORDER_STATUS_MAP: Record<number, { label: string, color: 'gold' | 'rose' | 'sage' | 'brown' }> = {
  0: { label: 'Por Cotizar', color: 'gold' },
  1: { label: 'Cotización Lista', color: 'gold' },
  2: { label: 'Esperando Pago', color: 'rose' },
  3: { label: 'Pago Reportado', color: 'gold' },
  4: { label: 'Pago Confirmado', color: 'sage' },
  5: { label: 'Preparando', color: 'sage' },
  6: { label: 'Listo', color: 'sage' },
  7: { label: 'En Camino', color: 'brown' },
  8: { label: 'Entregado', color: 'sage' },
  9: { label: 'Cancelado', color: 'rose' },
};

export const DELIVERY_TYPE_MAP: Record<number, string> = {
  0: 'Delivery Directo',
  1: 'Punto de Encuentro',
  2: 'Envío Nacional',
};

export function getOrderStatusInfo(status: number | string) {
  const key = typeof status === 'string' ? (OrderStatus as any)[status] ?? status : status;
  return ORDER_STATUS_MAP[key as number] || { label: 'Desconocido', color: 'sage' };
}

export function getDeliveryTypeLabel(type: number | string) {
  const key = typeof type === 'string' ? (DeliveryType as any)[type] ?? type : type;
  return DELIVERY_TYPE_MAP[key as number] || 'Desconocido';
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch {
    return dateString;
  }
}

export const NOTIFICATION_TYPE_MAP: Record<number, string> = {
  0: 'Pedido creado',
  1: 'Cotización lista',
  2: 'Pago reportado',
  3: 'Pago confirmado',
  4: 'Pago rechazado',
  5: 'Pedido en preparación',
  6: 'Pedido listo',
  7: 'Pedido enviado',
  8: 'Pedido entregado',
  9: 'Pedido cancelado',
};

export function getNotificationTypeLabel(type: number | string) {
  const key = typeof type === 'string' ? (NotificationType as any)[type] ?? type : type;
  return NOTIFICATION_TYPE_MAP[key as number] || 'Desconocido';
}
