import { apiClient } from '@/lib/api-client';
import { 
  DeliveryZoneAdminResponse, 
  MeetingPointAdminResponse,
  CreateDeliveryZoneRequest,
  UpdateDeliveryZoneRequest,
  CreateMeetingPointRequest,
  UpdateMeetingPointRequest
} from '@/types/admin-shipping';

export const AdminShippingService = {
  // --- Delivery Zones ---
  async getDeliveryZones(): Promise<DeliveryZoneAdminResponse[]> {
    const { data } = await apiClient.get<DeliveryZoneAdminResponse[]>('/api/admin/delivery-zones');
    return data;
  },

  async getDeliveryZone(id: string): Promise<DeliveryZoneAdminResponse> {
    const { data } = await apiClient.get<DeliveryZoneAdminResponse>(`/api/admin/delivery-zones/${id}`);
    return data;
  },

  async createDeliveryZone(payload: CreateDeliveryZoneRequest): Promise<DeliveryZoneAdminResponse> {
    const { data } = await apiClient.post<DeliveryZoneAdminResponse>('/api/admin/delivery-zones', payload);
    return data;
  },

  async updateDeliveryZone(id: string, payload: UpdateDeliveryZoneRequest): Promise<void> {
    await apiClient.put(`/api/admin/delivery-zones/${id}`, payload);
  },

  async toggleDeliveryZoneAvailability(id: string, isActive: boolean): Promise<void> {
    await apiClient.patch(`/api/admin/delivery-zones/${id}/availability`, { isActive });
  },

  // --- Meeting Points ---
  async getMeetingPoints(): Promise<MeetingPointAdminResponse[]> {
    const { data } = await apiClient.get<MeetingPointAdminResponse[]>('/api/admin/meeting-points');
    return data;
  },

  async getMeetingPoint(id: string): Promise<MeetingPointAdminResponse> {
    const { data } = await apiClient.get<MeetingPointAdminResponse>(`/api/admin/meeting-points/${id}`);
    return data;
  },

  async createMeetingPoint(payload: CreateMeetingPointRequest): Promise<MeetingPointAdminResponse> {
    const { data } = await apiClient.post<MeetingPointAdminResponse>('/api/admin/meeting-points', payload);
    return data;
  },

  async updateMeetingPoint(id: string, payload: UpdateMeetingPointRequest): Promise<void> {
    await apiClient.put(`/api/admin/meeting-points/${id}`, payload);
  },

  async toggleMeetingPointAvailability(id: string, isActive: boolean): Promise<void> {
    await apiClient.patch(`/api/admin/meeting-points/${id}/availability`, { isActive });
  }
};
