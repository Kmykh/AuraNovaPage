import { apiClient } from '../lib/api-client';
import { CustomizationOptions } from '../types/products';

export const CustomizationService = {
  getOptions: async (): Promise<CustomizationOptions> => {
    const { data } = await apiClient.get<CustomizationOptions>('/api/customization-options');
    return data;
  },

  getAdminOptions: async (): Promise<CustomizationOptions> => {
    const { data } = await apiClient.get<CustomizationOptions>('/api/admin/customization-options');
    return data;
  },

  updateOptions: async (request: CustomizationOptions): Promise<CustomizationOptions> => {
    const { data } = await apiClient.put<CustomizationOptions>('/api/admin/customization-options', request);
    return data;
  },
};
