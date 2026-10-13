import { apiClient } from '../lib/api-client';
import { CreateOrderRequest, CreateOrderResponse, CreateCustomOrderRequest, OrderPaymentSummary } from '../types/orders';

export const OrdersService = {
  createOrder: async (request: CreateOrderRequest): Promise<CreateOrderResponse> => {
    const { data } = await apiClient.post<CreateOrderResponse>('/api/orders', request);
    return data;
  },

  createCustomOrder: async (request: CreateCustomOrderRequest): Promise<CreateOrderResponse> => {
    const { data } = await apiClient.post<CreateOrderResponse>('/api/orders/custom', request);
    return data;
  },

  /** Pedido personalizado con hasta 5 imágenes de referencia como archivos (multipart). */
  createCustomOrderWithImages: async (request: CreateCustomOrderRequest, images: File[]): Promise<CreateOrderResponse> => {
    const form = new FormData();
    form.append('data', JSON.stringify(request));
    images.forEach((image) => form.append('images', image, image.name));
    const { data } = await apiClient.post<CreateOrderResponse>('/api/orders/custom', form, { timeout: 120000 });
    return data;
  },

  /** Estado, montos y productos del pedido para la página de pago (siempre desde la BD). */
  getPaymentSummary: async (id: string): Promise<OrderPaymentSummary> => {
    const { data } = await apiClient.get<OrderPaymentSummary>(`/api/orders/${id}/summary`);
    return data;
  },

  acceptQuote: async (id: string): Promise<{ message: string }> => {
    const { data } = await apiClient.post<{ message: string }>(`/api/orders/${id}/accept-quote`);
    return data;
  }
};
