import { apiClient } from '../lib/api-client';
import { 
  PublicBusinessSettingsResponse, 
  AdminBusinessSettingsResponse, 
  UpdateBusinessSettingsRequest 
} from '../types/business-settings';

export const BusinessSettingsService = {
  getPublicBusinessSettings: async (): Promise<PublicBusinessSettingsResponse> => {
    const { data } = await apiClient.get<PublicBusinessSettingsResponse>('/api/business-settings');
    return data;
  },

  getAdminBusinessSettings: async (): Promise<AdminBusinessSettingsResponse> => {
    const { data } = await apiClient.get<AdminBusinessSettingsResponse>('/api/admin/business-settings');
    return data;
  },

  updateBusinessSettings: async (request: UpdateBusinessSettingsRequest): Promise<AdminBusinessSettingsResponse> => {
    const { data } = await apiClient.put<AdminBusinessSettingsResponse>('/api/admin/business-settings', request);
    return data;
  },

  uploadYapeQr: async (file: File): Promise<{ message: string }> => {
    const formData = new FormData();
    formData.append('qr', file);

    const { data } = await apiClient.post<{ message: string }>('/api/admin/business-settings/yape-qr', formData);
    return data;
  },

  deleteYapeQr: async (): Promise<{ message: string }> => {
    const { data } = await apiClient.delete<{ message: string }>('/api/admin/business-settings/yape-qr');
    return data;
  }
};
