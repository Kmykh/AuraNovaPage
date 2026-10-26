import { apiClient } from '../lib/api-client';
import { 
  AdminPaymentResponse, 
  AdminPaymentDetailResponse, 
  RejectPaymentRequest 
} from '../types/payments';
import { OnlinePaymentReport, PaymentWebhookEvent, RefundOnlinePaymentRequest, RefundOnlinePaymentResult } from '../types/orders';

export const AdminPaymentsService = {
  /** Comprobantes de Yape (sistema anterior de captura) que esperan revisión. */
  getPendingProofs: async (): Promise<AdminPaymentResponse[]> => {
    const { data } = await apiClient.get<AdminPaymentResponse[]>('/api/admin/payments/pending');
    return data;
  },

  getPayment: async (id: string): Promise<AdminPaymentDetailResponse> => {
    const { data } = await apiClient.get<AdminPaymentDetailResponse>(`/api/admin/payments/${id}`);
    return data;
  },

  confirmPayment: async (id: string): Promise<{ message: string }> => {
    const { data } = await apiClient.patch<{ message: string }>(`/api/admin/payments/${id}/confirm`);
    return data;
  },

  rejectPayment: async (id: string, request: RejectPaymentRequest): Promise<{ message: string }> => {
    const { data } = await apiClient.patch<{ message: string }>(`/api/admin/payments/${id}/reject`, request);
    return data;
  },

  /** Devuelve un cobro de Mercado Pago (total, o parcial si se indica el monto). */
  refundOnlinePayment: async (orderId: string, transactionId: string, request: RefundOnlinePaymentRequest): Promise<RefundOnlinePaymentResult> => {
    const { data } = await apiClient.post<RefundOnlinePaymentResult>(`/api/admin/orders/${orderId}/payments/${transactionId}/refund`, request, {
      timeout: 60000,
    });
    return data;
  },

  /** Cobros en línea del periodo con totales (cobrado, devuelto, neto). */
  getOnlineReport: async (from: string, to: string): Promise<OnlinePaymentReport> => {
    const { data } = await apiClient.get<OnlinePaymentReport>('/api/admin/payments/online', { params: { from, to } });
    return data;
  },

  /** Últimos avisos (webhooks) recibidos de Mercado Pago. */
  getWebhookEvents: async (take = 20): Promise<PaymentWebhookEvent[]> => {
    const { data } = await apiClient.get<PaymentWebhookEvent[]>('/api/admin/payments/webhooks', { params: { take } });
    return data;
  },
};
