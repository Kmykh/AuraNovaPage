import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminPaymentsService } from '@/services/admin-payments.service';
import { RejectPaymentRequest } from '@/types/payments';
import { RefundOnlinePaymentRequest } from '@/types/orders';
import { ApiProblemDetails } from '@/lib/api-errors';
import { toast } from 'sonner';

export const adminPaymentKeys = {
  all: ['admin-payments'] as const,
  pendingProofs: ['admin-payments', 'pending-proofs'] as const,
  detail: (id: string) => ['admin-payment', id] as const,
  online: (from: string, to: string) => ['admin-payments', 'online', from, to] as const,
  webhooks: ['admin-payments', 'webhooks'] as const,
};

export function usePendingProofs() {
  return useQuery({
    queryKey: adminPaymentKeys.pendingProofs,
    queryFn: AdminPaymentsService.getPendingProofs,
    staleTime: 60_000,
  });
}

export function useAdminPayment(id: string) {
  return useQuery({
    queryKey: adminPaymentKeys.detail(id),
    queryFn: () => AdminPaymentsService.getPayment(id),
    staleTime: 30000,
    enabled: !!id,
  });
}

export function useConfirmPayment(id: string, orderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => AdminPaymentsService.confirmPayment(id),
    onSuccess: () => {
      toast.success('Pago confirmado.');
      queryClient.invalidateQueries({ queryKey: adminPaymentKeys.all });
      queryClient.invalidateQueries({ queryKey: adminPaymentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-summary'] });
    },
  });
}

export function useRejectPayment(id: string, orderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: RejectPaymentRequest) => AdminPaymentsService.rejectPayment(id, request),
    onSuccess: () => {
      toast.success('Pago rechazado.');
      queryClient.invalidateQueries({ queryKey: adminPaymentKeys.all });
      queryClient.invalidateQueries({ queryKey: adminPaymentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-summary'] });
    },
  });
}

export function useRefundOnlinePayment(orderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ transactionId, request }: { transactionId: string; request: RefundOnlinePaymentRequest }) =>
      AdminPaymentsService.refundOnlinePayment(orderId, transactionId, request),
    onSuccess: (result) => {
      toast.success('Devolución hecha', { description: result.message });
      queryClient.invalidateQueries({ queryKey: adminPaymentKeys.all });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['admin-order-status-history', orderId] });
    },
    onError: (error) => {
      toast.error(error instanceof ApiProblemDetails && error.detail ? error.detail : 'No se pudo hacer la devolución.');
    },
  });
}

/** "Verificar con Mercado Pago": por si Mercado Pago cobró y la respuesta no llegó al pedido. */
export function useReconcileOrderPayments(orderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => AdminPaymentsService.reconcileOrder(orderId),
    onSuccess: ({ changed }) => {
      if (changed > 0) toast.success('Pago actualizado', { description: 'Mercado Pago confirmó el estado del cobro.' });
      else toast.info('Sin cambios', { description: 'Mercado Pago no tiene un cobro aprobado nuevo para este pedido.' });
      queryClient.invalidateQueries({ queryKey: adminPaymentKeys.all });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['admin-order-status-history', orderId] });
    },
    onError: (error) => {
      toast.error(error instanceof ApiProblemDetails && error.detail ? error.detail : 'No se pudo consultar a Mercado Pago.');
    },
  });
}

export function useOnlinePaymentsReport(from: string, to: string) {
  return useQuery({
    queryKey: adminPaymentKeys.online(from, to),
    queryFn: () => AdminPaymentsService.getOnlineReport(from, to),
    staleTime: 30000,
  });
}

export function usePaymentWebhookEvents() {
  return useQuery({
    queryKey: adminPaymentKeys.webhooks,
    queryFn: () => AdminPaymentsService.getWebhookEvents(20),
    staleTime: 30000,
    refetchInterval: 60000,
  });
}
