import { apiClient } from '../lib/api-client';
import { PagedResponse } from '../types/common';
import { AdminAuditLogResponse } from '../types/audit';

export const AuditService = {
  getAuditLogs: async (params?: Record<string, string | number>): Promise<PagedResponse<AdminAuditLogResponse>> => {
    const { data } = await apiClient.get<PagedResponse<AdminAuditLogResponse>>('/api/admin/audit-logs', { params });
    return data;
  }
};
