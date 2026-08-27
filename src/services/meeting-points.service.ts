import { apiClient } from '../lib/api-client';
import { MeetingPointResponse } from '../types/meeting-points';

export const MeetingPointsService = {
  getMeetingPoints: async (): Promise<MeetingPointResponse[]> => {
    const { data } = await apiClient.get<MeetingPointResponse[]>('/api/meeting-points');
    return data;
  }
};
