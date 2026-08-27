import { apiClient } from '../lib/api-client';
import { PaymentInfoResponse, PaymentResponse } from '../types/payments';

export const paymentsService = {
  getPaymentInfo: async (): Promise<PaymentInfoResponse> => {
    const response = await apiClient.get<PaymentInfoResponse>('/api/payment-info');
    
    type RawResponse = PaymentInfoResponse & { yape?: { holderName: string; qrImageUrl: string; phoneNumber: string } };
    const rawData = response.data as RawResponse;

    if (rawData.yape) {
      return {
        enabled: true,
        method: "Yape",
        holderName: rawData.yape.holderName,
        qrImageUrl: rawData.yape.qrImageUrl,
        phoneNumber: rawData.yape.phoneNumber,
        businessName: "Aura Nova"
      };
    }
    return response.data;
  },

  uploadPaymentEvidence: async (orderId: string, file: File): Promise<PaymentResponse> => {
    const formData = new FormData();
    formData.append('evidence', file);

    const response = await apiClient.post<PaymentResponse>(`/api/orders/${orderId}/payment-evidence`, formData);
    return response.data;
  }
};
