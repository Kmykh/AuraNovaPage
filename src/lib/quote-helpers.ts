import { QuoteStatus } from '@/types/enums';

export const QUOTE_STATUS_MAP: Record<number, { label: string, color: 'gold' | 'rose' | 'sage' | 'brown' }> = {
  0: { label: 'Pendiente', color: 'gold' },
  1: { label: 'Cotización Lista', color: 'sage' },
  2: { label: 'Rechazada', color: 'rose' },
};

export function getQuoteStatusInfo(status: number | string) {
  const key = typeof status === 'string' ? (QuoteStatus as any)[status] ?? status : status;
  return QUOTE_STATUS_MAP[key as number] || { label: 'Desconocido', color: 'sage' };
}
