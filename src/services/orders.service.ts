import { apiClient } from '../lib/api-client';
import { CreateOrderRequest, CreateOrderResponse, CreateCustomOrderRequest } from '../types/orders';

export const OrdersService = {
  createOrder: async (request: CreateOrderRequest): Promise<CreateOrderResponse> => {
    const { data } = await apiClient.post<CreateOrderResponse>('/api/orders', request);
    return data;
  },

  createCustomOrder: async (request: CreateCustomOrderRequest): Promise<CreateOrderResponse> => {
    const { data } = await apiClient.post<CreateOrderResponse>('/api/orders/custom', request);
    return data;
  },

  acceptQuote: async (id: string): Promise<{ message: string }> => {
    const { data } = await apiClient.post<{ message: string }>(`/api/orders/${id}/accept-quote`);
    return data;
  }
};
