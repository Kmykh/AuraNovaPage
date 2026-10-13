import { DeliveryType, OrderStatus } from '@/types/enums';

/** La API envía el estado como texto ("Preparing"); algunos lugares antiguos usan el número. */
export function statusName(status: OrderStatus | string | number): string {
  if (typeof status === 'number') return OrderStatus[status] ?? String(status);
  const asNumber = Number(status);
  return Number.isInteger(asNumber) && OrderStatus[asNumber] ? OrderStatus[asNumber] : String(status);
}

export function deliveryTypeName(deliveryType: DeliveryType | string | number): string {
  if (typeof deliveryType === 'number') return DeliveryType[deliveryType] ?? String(deliveryType);
  const asNumber = Number(deliveryType);
  return Number.isInteger(asNumber) && DeliveryType[asNumber] ? DeliveryType[asNumber] : String(deliveryType);
}

export type MilestoneKey = 'received' | 'payment' | 'workshop' | 'onTheWay' | 'delivered';

export interface Milestone {
  key: MilestoneKey;
  label: string;
}

/** Los 5 grandes pasos que ve el cliente, adaptados al tipo de pedido y de entrega. */
export function buildMilestones(isCustomOrder: boolean, deliveryType: string): Milestone[] {
  const onTheWay =
    deliveryType === 'MeetingPoint' ? 'Listo para recoger'
    : deliveryType === 'NationalShipping' ? 'En la agencia'
    : 'En camino';

  return [
    { key: 'received', label: isCustomOrder ? 'Cotización' : 'Recibido' },
    { key: 'payment', label: 'Pago' },
    { key: 'workshop', label: 'En el taller' },
    { key: 'onTheWay', label: onTheWay },
    { key: 'delivered', label: 'Entregado' },
  ];
}

/** Índice (0-4) del paso en curso según el estado del pedido. */
export function currentMilestoneIndex(status: string): number {
  switch (status) {
    case 'WaitingQuote':
    case 'QuoteReady':
      return 0;
    case 'WaitingPayment':
    case 'PaymentReported':
      return 1;
    case 'PaymentConfirmed':
    case 'Preparing':
      return 2;
    case 'Ready':
    case 'Shipped':
    case 'DeliveredToAgency':
      return 3;
    case 'Delivered':
      return 4;
    default:
      return 0;
  }
}

export interface StatusCopy {
  title: string;
  message: string;
  tone: 'waiting' | 'action' | 'progress' | 'success' | 'cancelled';
}

/** Texto principal del estado, pensado para el cliente (no para el panel). */
export function statusCopy(status: string, deliveryType: string, isCustomOrder: boolean): StatusCopy {
  switch (status) {
    case 'WaitingQuote':
      return { title: 'Estamos diseñando tu cotización', message: 'Revisamos tus referencias y te escribiremos por WhatsApp con el precio.', tone: 'waiting' };
    case 'QuoteReady':
      return { title: '¡Tu cotización está lista!', message: 'Revisa el precio y acéptala para reservar tu pedido.', tone: 'action' };
    case 'WaitingPayment':
      return { title: 'Falta tu pago para empezar', message: 'Paga con Yape y sube tu comprobante: apenas lo validemos, empezamos.', tone: 'action' };
    case 'PaymentReported':
      return { title: 'Estamos validando tu pago', message: 'Recibimos tu comprobante. Te avisaremos en cuanto esté confirmado.', tone: 'waiting' };
    case 'PaymentConfirmed':
      return { title: '¡Pago confirmado!', message: isCustomOrder ? 'Tu diseño entra al taller muy pronto.' : 'Tu pedido entra al taller muy pronto.', tone: 'progress' };
    case 'Preparing':
      return { title: 'Tu detalle está en el taller', message: 'Lo estamos armando a mano, flor por flor.', tone: 'progress' };
    case 'Ready':
      return deliveryType === 'MeetingPoint'
        ? { title: '¡Listo para recoger!', message: 'Tu pedido te espera en el punto de encuentro acordado.', tone: 'success' }
        : { title: '¡Tu pedido está listo!', message: 'Lo preparamos para la entrega.', tone: 'success' };
    case 'Shipped':
      return { title: 'Tu pedido va en camino', message: 'Muy pronto estará en tus manos.', tone: 'progress' };
    case 'DeliveredToAgency':
      return { title: 'Tu pedido está en la agencia', message: 'Ya viaja hacia tu ciudad. Usa el código de la agencia para seguirlo.', tone: 'progress' };
    case 'Delivered':
      return { title: '¡Entregado con cariño!', message: 'Gracias por elegir Aura Nova. Esperamos que lo disfruten mucho.', tone: 'success' };
    case 'Cancelled':
      return { title: 'Este pedido fue cancelado', message: 'Si tienes dudas, escríbenos por WhatsApp y te ayudamos.', tone: 'cancelled' };
    default:
      return { title: 'Estamos revisando tu pedido', message: 'Te mantendremos al tanto por WhatsApp.', tone: 'waiting' };
  }
}

/** "hace 5 min", "hace 2 h", "hace 3 días". */
export function timeAgo(iso: string | undefined | null): string | null {
  if (!iso) return null;
  const diffMs = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diffMs)) return null;
  const minutes = Math.max(0, Math.round(diffMs / 60000));
  if (minutes < 1) return 'hace un momento';
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.round(hours / 24);
  return `hace ${days} ${days === 1 ? 'día' : 'días'}`;
}

/** "miércoles, 14 de octubre" → "Miércoles, 14 de octubre" (CSS capitalize pondría "De" y "Octubre"). */
export function formatLongDate(value: string | Date, withWeekday = true): string {
  const date = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T12:00:00`) // fecha sin hora: mediodía para que la zona horaria no cambie el día
    : new Date(value);
  const text = date.toLocaleDateString('es-PE', withWeekday
    ? { weekday: 'long', day: 'numeric', month: 'long' }
    : { day: 'numeric', month: 'long' });
  return text.charAt(0).toUpperCase() + text.slice(1);
}
