import { apiClient } from '../lib/api-client';
import { PagedResponse } from '../types/common';
import { 
  AdminPaymentResponse, 
  AdminPaymentDetailResponse, 
  RejectPaymentRequest 
} from '../types/payments';

export const AdminPaymentsService = {
  getPayments: async (params?: Record<string, string | number>): Promise<AdminPaymentResponse[]> => {
    const { data } = await apiClient.get<AdminPaymentResponse[]>('/api/admin/payments', { params });
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
  }
};
