import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminPaymentsService } from '@/services/admin-payments.service';
import { RejectPaymentRequest } from '@/types/payments';
import { toast } from 'sonner';

export const adminPaymentKeys = {
  all: ['admin-payments'] as const,
  list: (filters?: Record<string, string | number>) => ['admin-payments', 'list', filters] as const,
  detail: (id: string) => ['admin-payment', id] as const,
};

export function useAdminPayments(filters?: Record<string, string | number>) {
  return useQuery({
    queryKey: adminPaymentKeys.list(filters),
    queryFn: () => AdminPaymentsService.getPayments(filters),
    staleTime: 30000,
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
