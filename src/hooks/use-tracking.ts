import { useQuery } from '@tanstack/react-query';
import { TrackingService } from '@/services/tracking.service';
import { PublicTrackingResponse } from '@/types/tracking';
import { statusName } from '@/lib/tracking-progress';

// Estados en los que el pedido todavía avanza: se consulta cada 30 s mientras la página está abierta
const ACTIVE_STATUSES = new Set([
  'WaitingQuote', 'QuoteReady', 'WaitingPayment', 'PaymentReported', 'PaymentConfirmed',
  'Preparing', 'Ready', 'Shipped', 'DeliveredToAgency',
]);

export function useTracking(trackingCode: string) {
  return useQuery<PublicTrackingResponse, Error>({
    queryKey: ['tracking', trackingCode],
    queryFn: () => TrackingService.getTrackingByCode(trackingCode),
    enabled: !!trackingCode,
    // La API devuelve el estado como texto ("Preparing"); antes se comparaba con el enum numérico y nunca refrescaba
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status !== undefined && ACTIVE_STATUSES.has(statusName(status)) ? 30000 : false;
    },
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    retry: (failureCount, error) => {
      const status = (error as { status?: number })?.status;
      return status !== 404 && status !== 429 && failureCount < 2;
    },
  });
}
