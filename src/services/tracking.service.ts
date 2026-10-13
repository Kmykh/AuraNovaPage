import { apiClient } from '../lib/api-client';
import { PublicTrackingResponse } from '../types/tracking';

export const TrackingService = {
  /** Seguimiento con un solo código ("K7M3-Q9XA"). */
  getTrackingByCode: async (trackingCode: string): Promise<PublicTrackingResponse> => {
    const { data } = await apiClient.get<PublicTrackingResponse>(`/api/public/tracking/${encodeURIComponent(trackingCode)}`);
    return data;
  },

  /** Formato anterior (número de pedido + token), para enlaces antiguos. */
  getTracking: async (orderCode: string, trackingToken: string): Promise<PublicTrackingResponse> => {
    const { data } = await apiClient.get<PublicTrackingResponse>(`/api/public/orders/${orderCode}/tracking/${trackingToken}`);
    return data;
  }
};
