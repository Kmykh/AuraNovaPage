import { useQuery } from '@tanstack/react-query';
import { AuditService } from '@/services/audit.service';

export const auditLogsKeys = {
  all: ['admin-audit-logs'] as const,
  list: (filters: Record<string, string | number>) => ['admin-audit-logs', filters] as const,
};

export function useAuditLogs(filters: Record<string, string | number>) {
  return useQuery({
    queryKey: auditLogsKeys.list(filters),
    queryFn: () => AuditService.getAuditLogs(filters),
    staleTime: 60000,
  });
}
