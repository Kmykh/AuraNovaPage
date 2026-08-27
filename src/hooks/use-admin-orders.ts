import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminOrdersService } from '@/services/admin-orders.service';
import { ChangeOrderStatusRequest } from '@/types/orders';
import { toast } from 'sonner';

export const adminOrderKeys = {
  all: ['admin-orders'] as const,
  list: (filters: Record<string, string | number>) => ['admin-orders', 'list', filters] as const,
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
