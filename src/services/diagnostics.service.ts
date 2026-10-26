import { apiClient } from '../lib/api-client';
import { EmailStatusResponse, EmailTestResponse } from '../types/diagnostics';

export const DiagnosticsService = {
  getEmailStatus: async (): Promise<EmailStatusResponse> => {
    const { data } = await apiClient.get<EmailStatusResponse>('/api/admin/diagnostics/email');
    return data;
  },

  sendTestEmail: async (to: string): Promise<EmailTestResponse> => {
    const { data } = await apiClient.post<EmailTestResponse>('/api/admin/diagnostics/email', { to });
    return data;
  },
};
