import { PaymentStatus, PaymentMethod } from '@/types/enums';

export const PAYMENT_STATUS_MAP: Record<number, { label: string, color: 'gold' | 'rose' | 'sage' | 'brown' }> = {
  0: { label: 'Pendiente', color: 'gold' },
  1: { label: 'Comprobante Recibido', color: 'gold' },
  2: { label: 'Pago Confirmado', color: 'sage' },
  3: { label: 'Pago Rechazado', color: 'rose' },
};

export const PAYMENT_METHOD_MAP: Record<number, string> = {
  0: 'Yape',
};

export function getPaymentStatusInfo(status: number | string) {
  const key = typeof status === 'string' ? (PaymentStatus as any)[status] ?? status : status;
  return PAYMENT_STATUS_MAP[key as number] || { label: 'Desconocido', color: 'sage' };
}

export function getPaymentMethodLabel(method: number | string) {
  const key = typeof method === 'string' ? (PaymentMethod as any)[method] ?? method : method;
  return PAYMENT_METHOD_MAP[key as number] || 'Desconocido';
}
