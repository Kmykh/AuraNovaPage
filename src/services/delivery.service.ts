import { apiClient } from '../lib/api-client';
import { DeliveryZoneResponse } from '../types/delivery';

export const DeliveryService = {
  getDeliveryZones: async (): Promise<DeliveryZoneResponse[]> => {
    const { data } = await apiClient.get<DeliveryZoneResponse[]>('/api/delivery-zones');
    return data;
  }
};
