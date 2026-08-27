import { useQuery } from '@tanstack/react-query';
import { InfoService } from '../services/info.service';

export function usePaymentInfo() {
  return useQuery({
    queryKey: ['payment-info'],
    queryFn: () => InfoService.getPaymentInfo(),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    retry: 1,
  });
}

export function useBusinessSettings() {
  return useQuery({
    queryKey: ['business-settings'],
    queryFn: () => InfoService.getBusinessSettings(),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    retry: 1,
  });
}
