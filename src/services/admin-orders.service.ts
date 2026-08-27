import { apiClient } from '../lib/api-client';
import { PagedResponse } from '../types/common';
import { 
  AdminOrderListItemResponse, 
  AdminOrderDetailResponse, 
  ChangeOrderStatusRequest, 
  OrderStatusChangeResponse, 
  OrderStatusHistoryResponse 
} from '../types/orders';
import { NotificationResponse, WhatsAppPreparationResponse } from '../types/notifications';

export const AdminOrdersService = {
  getOrders: async (params?: Record<string, string | number>): Promise<PagedResponse<AdminOrderListItemResponse>> => {
    const { data } = await apiClient.get<PagedResponse<AdminOrderListItemResponse>>('/api/admin/orders', { params });
    return data;
  },

  getOrder: async (id: string): Promise<AdminOrderDetailResponse> => {
    const { data } = await apiClient.get<AdminOrderDetailResponse>(`/api/admin/orders/${id}`);
    return data;
  },

  changeStatus: async (id: string, request: ChangeOrderStatusRequest): Promise<OrderStatusChangeResponse> => {
    const { data } = await apiClient.patch<OrderStatusChangeResponse>(`/api/admin/orders/${id}/status`, request);
    return data;
  },

  getStatusHistory: async (id: string): Promise<OrderStatusHistoryResponse[]> => {
    const { data } = await apiClient.get<OrderStatusHistoryResponse[]>(`/api/admin/orders/${id}/status-history`);
    return data;
  },

  getNotifications: async (orderId: string): Promise<NotificationResponse[]> => {
    const { data } = await apiClient.get<NotificationResponse[]>(`/api/admin/orders/${orderId}/notifications`);
    return data;
  },

  prepareWhatsapp: async (orderId: string, notificationId: string): Promise<WhatsAppPreparationResponse> => {
    const { data } = await apiClient.post<WhatsAppPreparationResponse>(`/api/admin/orders/${orderId}/notifications/${notificationId}/prepare-whatsapp`);
    return data;
  }
};
