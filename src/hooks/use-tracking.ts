import { useQuery } from '@tanstack/react-query';
import { TrackingService } from '@/services/tracking.service';
import { PublicTrackingResponse } from '@/types/tracking';
import { OrderStatus } from '@/types/checkout';

interface UseTrackingProps {
  orderCode: string;
  trackingToken: string;
}

export function useTracking({ orderCode, trackingToken }: UseTrackingProps) {
  return useQuery<PublicTrackingResponse, Error>({
    queryKey: ['tracking', orderCode, trackingToken],
    queryFn: () => TrackingService.getTracking(orderCode, trackingToken),
    enabled: !!orderCode && !!trackingToken,
    // Polling dinámico: 15s si está en un estado no final
    refetchInterval: (query) => {
      if (!query.state.data) return false;
      const status = query.state.data.status;
      
      // Estados dinámicos que cambian rápido o donde el cliente espera novedad
      const activeStatuses = [
        OrderStatus.WaitingQuote,
        OrderStatus.QuoteReady,
        OrderStatus.WaitingPayment,
        OrderStatus.PaymentReported,
        OrderStatus.PaymentConfirmed,
        OrderStatus.Preparing,
        OrderStatus.Ready,
        OrderStatus.Shipped
      ];

      return activeStatuses.includes(status) ? 15000 : false;
    },
    // No refetchear cuando la ventana pierda y gane foco excesivamente si no está en polling
    refetchOnWindowFocus: false,
    retry: 2 // retry limitado para no saturar al servidor
  });
}
