import { apiClient } from '../lib/api-client';
import { PaymentInfoResponse, PublicBusinessSettingsResponse } from '../types/info';

export const InfoService = {
  async getPaymentInfo(): Promise<PaymentInfoResponse> {
    const { data } = await apiClient.get<PaymentInfoResponse>('/api/payment-info');
    return data;
  },

  async getBusinessSettings(): Promise<PublicBusinessSettingsResponse> {
    const { data } = await apiClient.get<PublicBusinessSettingsResponse>('/api/business-settings');
    return data;
  }
};
