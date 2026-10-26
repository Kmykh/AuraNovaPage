import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminOrdersService } from '@/services/admin-orders.service';
import { ChangeOrderStatusRequest } from '@/types/orders';
import { toast } from 'sonner';
import { ApiProblemDetails } from '@/lib/api-errors';

/** Muestra el motivo que da el backend (p. ej. "El cliente aún debe el saldo…"). */
const showError = (error: unknown) => {
  toast.error(error instanceof ApiProblemDetails && error.detail ? error.detail : 'No se pudo actualizar el pedido.');
};

export const adminOrderKeys = {
  all: ['admin-orders'] as const,
  list: (filters: Record<string, string | number>) => ['admin-orders', 'list', filters] as const,
  counts: ['admin-orders', 'counts'] as const,
  detail: (id: string) => ['admin-order', id] as const,
  history: (id: string) => ['admin-order-status-history', id] as const,
  notifications: (id: string) => ['admin-order-notifications', id] as const,
};

export function useAdminOrders(filters: Record<string, string | number>) {
  return useQuery({
    queryKey: adminOrderKeys.list(filters),
    queryFn: () => AdminOrdersService.getOrders(filters),
    staleTime: 30000,
  });
}

/** Pedidos por estado (pestañas y aviso del menú). Se refresca solo cada minuto. */
export function useAdminOrderCounts() {
  return useQuery({
    queryKey: adminOrderKeys.counts,
    queryFn: () => AdminOrdersService.getCounts(),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

/** Pedidos que esperan una acción del equipo: cotizar, revisar pago o empezar a preparar. */
export function needsActionCount(byStatus?: Record<string, number>): number {
  if (!byStatus) return 0;
  return (byStatus.WaitingQuote ?? 0) + (byStatus.PaymentReported ?? 0) + (byStatus.PaymentConfirmed ?? 0);
}

export function useAdminOrder(id: string) {
  return useQuery({
    queryKey: adminOrderKeys.detail(id),
    queryFn: () => AdminOrdersService.getOrder(id),
    staleTime: 30000,
    enabled: !!id,
  });
}

export function useOrderStatusHistory(id: string) {
  return useQuery({
    queryKey: adminOrderKeys.history(id),
    queryFn: () => AdminOrdersService.getStatusHistory(id),
    staleTime: 60000,
    enabled: !!id,
  });
}

export function useOrderNotifications(id: string) {
  return useQuery({
    queryKey: adminOrderKeys.notifications(id),
    queryFn: () => AdminOrdersService.getNotifications(id),
    staleTime: 60000,
    enabled: !!id,
  });
}

export function useChangeOrderStatus(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: ChangeOrderStatusRequest) => AdminOrdersService.changeStatus(id, request),
    onError: showError,
    onSuccess: () => {
      toast.success('Estado del pedido actualizado.');
      queryClient.invalidateQueries({ queryKey: adminOrderKeys.all });
      queryClient.invalidateQueries({ queryKey: adminOrderKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: adminOrderKeys.history(id) });
      queryClient.invalidateQueries({ queryKey: adminOrderKeys.notifications(id) });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-summary'] });
    },
  });
}

export function usePrepareWhatsapp(orderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => AdminOrdersService.prepareWhatsapp(orderId, notificationId),
    onSuccess: () => {
      toast.success('WhatsApp preparado.');
      queryClient.invalidateQueries({ queryKey: adminOrderKeys.notifications(orderId) });
    },
  });
}

export function useStartPreparation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => AdminOrdersService.startPreparation(id),
    onError: showError,
    onSuccess: () => {
      toast.success('Elaboración iniciada.');
      queryClient.invalidateQueries({ queryKey: adminOrderKeys.all });
      queryClient.invalidateQueries({ queryKey: adminOrderKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: adminOrderKeys.history(id) });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-summary'] });
    },
  });
}

export function useSetEstimatedReadyDate(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: { estimatedDate: string }) => AdminOrdersService.setEstimatedReadyDate(id, request),
    onError: showError,
    onSuccess: () => {
      toast.success('Fecha estimada de disponibilidad actualizada.');
      queryClient.invalidateQueries({ queryKey: adminOrderKeys.detail(id) });
    },
  });
}

export function useMarkAsReady(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => AdminOrdersService.markAsReady(id),
    onError: showError,
    onSuccess: () => {
      toast.success('Pedido marcado como listo.');
      queryClient.invalidateQueries({ queryKey: adminOrderKeys.all });
      queryClient.invalidateQueries({ queryKey: adminOrderKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: adminOrderKeys.history(id) });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-summary'] });
    },
  });
}

export function useDeliverToAgency(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: { provider: string; trackingCode: string; proofFile?: File | null }) => AdminOrdersService.deliverToAgency(id, request),
    onError: showError,
    onSuccess: () => {
      toast.success('Pedido entregado a agencia.');
      queryClient.invalidateQueries({ queryKey: adminOrderKeys.all });
      queryClient.invalidateQueries({ queryKey: adminOrderKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: adminOrderKeys.history(id) });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-summary'] });
    },
  });
}
