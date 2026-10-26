import { OrderStatus, DeliveryType, NotificationType } from '@/types/enums';

export const ORDER_STATUS_MAP: Record<number, { label: string, color: 'gold' | 'rose' | 'sage' | 'brown' }> = {
  0: { label: 'Por Cotizar', color: 'gold' },
  1: { label: 'Cotización Lista', color: 'gold' },
  2: { label: 'Esperando Pago', color: 'rose' },
  3: { label: 'Pago Reportado', color: 'gold' },
  4: { label: 'Pago Confirmado', color: 'sage' },
  5: { label: 'En elaboración', color: 'sage' },
  6: { label: 'Listo', color: 'sage' },
  7: { label: 'En Camino', color: 'brown' },
  8: { label: 'Entregado', color: 'sage' },
  9: { label: 'Entregado a Agencia', color: 'sage' },
  10: { label: 'Cancelado', color: 'rose' },
};

export const DELIVERY_TYPE_MAP: Record<number, string> = {
  0: 'Delivery Directo',
  1: 'Punto de Encuentro',
  2: 'Envío Nacional',
};

export function getOrderStatusInfo(status: number | string, deliveryType?: DeliveryType | number | string) {
  const key = typeof status === 'string' ? (OrderStatus as Record<string, string | number>)[status] ?? status : status;
  const baseInfo = ORDER_STATUS_MAP[key as number] || { label: 'Desconocido', color: 'sage' };
  
  if (key === OrderStatus.Ready) {
    if (deliveryType === DeliveryType.NationalShipping || deliveryType === 'NationalShipping') {
      return { ...baseInfo, label: 'Listo para envío' };
    }
    if (deliveryType === DeliveryType.MeetingPoint || deliveryType === 'MeetingPoint') {
      return { ...baseInfo, label: 'Listo para entrega' };
    }
  }

  if (key === OrderStatus.Delivered) {
    if (deliveryType === DeliveryType.NationalShipping || deliveryType === 'NationalShipping') {
      return { ...baseInfo, label: 'Recibido' };
    }
    if (deliveryType === DeliveryType.MeetingPoint || deliveryType === 'MeetingPoint') {
      return { ...baseInfo, label: 'Recibido' };
    }
  }

  return baseInfo;
}

export function getDeliveryTypeLabel(type: number | string) {
  const key = typeof type === 'string' ? (DeliveryType as Record<string, string | number>)[type] ?? type : type;
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

// Mismo orden que NotificationType del backend (antes estaba corrido: "cancelado" salía como "entregado a agencia")
export const NOTIFICATION_TYPE_MAP: Record<number, string> = {
  [NotificationType.OrderCreated]: 'Pedido creado',
  [NotificationType.QuoteReady]: 'Cotización lista',
  [NotificationType.PaymentReported]: 'Pago reportado',
  [NotificationType.PaymentConfirmed]: 'Pago confirmado',
  [NotificationType.PaymentRejected]: 'Pago rechazado',
  [NotificationType.OrderPreparing]: 'Pedido en elaboración',
  [NotificationType.OrderReady]: 'Pedido listo',
  [NotificationType.OrderShipped]: 'Pedido enviado',
  [NotificationType.OrderDelivered]: 'Pedido entregado',
  [NotificationType.OrderCancelled]: 'Pedido cancelado',
  [NotificationType.BalancePaid]: 'Saldo pagado',
};

export function getNotificationTypeLabel(type: number | string) {
  const key = typeof type === 'string' ? (NotificationType as Record<string, string | number>)[type] ?? type : type;
  return NOTIFICATION_TYPE_MAP[key as number] || 'Desconocido';
}

export type AdminActionTone = 'urgent' | 'waiting' | 'progress' | 'done';

/** Lo siguiente que hay que hacer con el pedido, en palabras del equipo. */
export function nextAdminAction(status: string, deliveryType?: string): { label: string; tone: AdminActionTone } {
  switch (status) {
    case 'WaitingQuote': return { label: 'Poner precio', tone: 'urgent' };
    case 'QuoteReady': return { label: 'Esperando que acepte', tone: 'waiting' };
    case 'WaitingPayment': return { label: 'Esperando el pago', tone: 'waiting' };
    case 'PaymentReported': return { label: 'Revisar comprobante', tone: 'urgent' };
    case 'PaymentConfirmed': return { label: 'Empezar a preparar', tone: 'urgent' };
    case 'Preparing': return { label: 'Marcar como listo', tone: 'progress' };
    case 'Ready':
      return {
        label: deliveryType === 'NationalShipping' ? 'Llevar a la agencia' : deliveryType === 'MeetingPoint' ? 'Entregar en el punto' : 'Enviar delivery',
        tone: 'progress',
      };
    case 'Shipped':
    case 'DeliveredToAgency': return { label: 'Confirmar entrega', tone: 'progress' };
    case 'Delivered': return { label: 'Entregado', tone: 'done' };
    case 'Cancelled': return { label: 'Cancelado', tone: 'done' };
    default: return { label: '', tone: 'done' };
  }
}

/** Días que faltan para una fecha "YYYY-MM-DD", contando desde hoy en Perú. */
export function daysUntilDate(isoDate: string): number {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima' }).format(new Date());
  const toUtc = (value: string) => {
    const [y, m, d] = value.slice(0, 10).split('-').map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((toUtc(isoDate) - toUtc(today)) / 86_400_000);
}
