import { apiClient } from '../lib/api-client';
import { CreateOnlinePaymentRequest, OnlinePaymentResult } from '../types/orders';

export const OnlinePaymentsService = {
  /** Cobra con Mercado Pago el adelanto, el total o el saldo del pedido. */
  pay: async (orderId: string, request: CreateOnlinePaymentRequest): Promise<OnlinePaymentResult> => {
    const { data } = await apiClient.post<OnlinePaymentResult>(`/api/orders/${orderId}/payments/mercadopago`, request, {
      // El backend espera hasta 90 s a Mercado Pago (Yape puede tardar en confirmarse)
      timeout: 120000,
    });
    return data;
  },
};
