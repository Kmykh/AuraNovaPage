import { useQuery } from '@tanstack/react-query';
import { DashboardService } from '@/services/dashboard.service';
import { DashboardSummaryResponse } from '@/types/dashboard';

export function useDashboard() {
  return useQuery<DashboardSummaryResponse, Error>({
    queryKey: ['admin-dashboard-summary'],
    queryFn: DashboardService.getDashboardSummary,
    staleTime: 60000, // 1 minuto
    refetchOnWindowFocus: false, // Evitamos auto-refetch agresivo, priorizando manual
  });
}
