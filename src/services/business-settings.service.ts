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
  }
};
