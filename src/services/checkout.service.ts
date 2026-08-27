import { apiClient } from '@/lib/api-client';
import { 
  DeliveryZoneResponse, 
  MeetingPointResponse, 
  CreateOrderRequest, 
  CreateOrderResponse 
} from '@/types/checkout';

export const checkoutService = {
  getDeliveryZones: async (): Promise<DeliveryZoneResponse[]> => {
    const response = await apiClient.get<DeliveryZoneResponse[]>('/api/delivery-zones');
    return response.data;
  },

  getMeetingPoints: async (): Promise<MeetingPointResponse[]> => {
    const response = await apiClient.get<MeetingPointResponse[]>('/api/meeting-points');
    return response.data;
  },

  createOrder: async (data: CreateOrderRequest): Promise<CreateOrderResponse> => {
    const response = await apiClient.post<CreateOrderResponse>('/api/orders', data);
    return response.data;
  },

  acceptQuote: async (orderId: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<{ success: boolean; message: string }>(`/api/orders/${orderId}/accept-quote`);
    return response.data;
  }
};
