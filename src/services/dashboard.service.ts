import { apiClient } from '../lib/api-client';
import { DashboardSummaryResponse } from '../types/dashboard';

export const DashboardService = {
  getDashboardSummary: async (): Promise<DashboardSummaryResponse> => {
    const { data } = await apiClient.get<DashboardSummaryResponse>('/api/admin/dashboard/summary');
    return data;
  }
};
