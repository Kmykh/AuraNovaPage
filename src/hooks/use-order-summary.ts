import { useQuery } from '@tanstack/react-query';
import { OrdersService } from '@/services/orders.service';

export const orderSummaryKey = (id: string) => ['order-summary', id] as const;

/**
 * Resumen del pedido para la página de pago. Mientras espera la cotización o la revisión del pago
 * se vuelve a consultar solo, así el cliente ve el precio apenas el equipo lo envía.
 */
export function useOrderSummary(orderId: string) {
  return useQuery({
    queryKey: orderSummaryKey(orderId),
    queryFn: () => OrdersService.getPaymentSummary(orderId),
    enabled: !!orderId,
    retry: 1,
    refetchOnWindowFocus: true,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'WaitingQuote') return 30_000;
      if (status === 'PaymentReported') return 60_000;
      return false;
    },
  });
}
