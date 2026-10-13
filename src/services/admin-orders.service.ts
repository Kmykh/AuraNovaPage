import { apiClient } from '../lib/api-client';
import { PagedResponse } from '../types/common';
import { 
  AdminOrderCountsResponse,
  AdminOrderListItemResponse, 
  AdminOrderDetailResponse, 
  ChangeOrderStatusRequest, 
  OrderStatusChangeResponse, 
  OrderStatusHistoryResponse 
} from '../types/orders';
import { NotificationResponse, WhatsAppPreparationResponse } from '../types/notifications';
import { DeliveryType, OrderStatus } from '../types/enums';

/**
 * La API envía estado y tipo de entrega como texto ("PaymentReported", "NationalShipping");
 * el panel los compara con los enums numéricos. Se normalizan aquí una sola vez.
 */
function toEnum<T extends Record<string, string | number>>(enumType: T, value: unknown): T[keyof T] {
  if (typeof value === 'number') return value as T[keyof T];
  const asNumber = Number(value);
  if (Number.isInteger(asNumber)) return asNumber as T[keyof T];
  return (enumType[value as keyof T] ?? value) as T[keyof T];
}

function normalizeOrder(order: AdminOrderDetailResponse): AdminOrderDetailResponse {
  return {
    ...order,
    status: toEnum(OrderStatus, order.status) as OrderStatus,
    deliveryType: toEnum(DeliveryType, order.deliveryType) as DeliveryType,
  };
}

export const AdminOrdersService = {
  getOrders: async (params?: Record<string, string | number>): Promise<PagedResponse<AdminOrderListItemResponse>> => {
    const { data } = await apiClient.get<PagedResponse<AdminOrderListItemResponse>>('/api/admin/orders', { params });
    return data;
  },

  getCounts: async (): Promise<AdminOrderCountsResponse> => {
    const { data } = await apiClient.get<AdminOrderCountsResponse>('/api/admin/orders/counts');
    return data;
  },

  getOrder: async (id: string): Promise<AdminOrderDetailResponse> => {
    const { data } = await apiClient.get<AdminOrderDetailResponse>(`/api/admin/orders/${id}`);
    return normalizeOrder(data);
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
  },

  startPreparation: async (id: string): Promise<{ message: string }> => {
    const { data } = await apiClient.post<{ message: string }>(`/api/admin/orders/${id}/start-preparation`);
    return data;
  },

  setEstimatedReadyDate: async (id: string, request: { estimatedDate: string }): Promise<{ message: string }> => {
    const { data } = await apiClient.patch<{ message: string }>(`/api/admin/orders/${id}/estimated-date`, request);
    return data;
  },

  markAsReady: async (id: string): Promise<{ message: string }> => {
    const { data } = await apiClient.post<{ message: string }>(`/api/admin/orders/${id}/mark-ready`);
    return data;
  },

  deliverToAgency: async (id: string, request: { provider: string; trackingCode: string; proofFile?: File | null }): Promise<{ message: string }> => {
    const formData = new FormData();
    formData.append('provider', request.provider);
    formData.append('trackingCode', request.trackingCode);
    if (request.proofFile) {
      formData.append('proofFile', request.proofFile);
    }
    const { data } = await apiClient.post<{ message: string }>(`/api/admin/orders/${id}/deliver-to-agency`, formData);
    return data;
  }
};
