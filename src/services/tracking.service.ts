import { apiClient } from '../lib/api-client';
import { PublicTrackingResponse } from '../types/tracking';

export const TrackingService = {
  getTracking: async (orderCode: string, trackingToken: string): Promise<PublicTrackingResponse> => {
    const { data } = await apiClient.get<PublicTrackingResponse>(`/api/public/orders/${orderCode}/tracking/${trackingToken}`);
    return data;
  }
};
