import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QuotesService } from '@/services/quotes.service';
import { UpdateQuoteRequest } from '@/types/quotes';
import { toast } from 'sonner';
import { adminOrderKeys } from './use-admin-orders';

export const adminQuoteKeys = {
  all: ['admin-quotes'] as const,
  list: (filters?: Record<string, string | number>) => ['admin-quotes', 'list', filters] as const,
  detail: (id: string) => ['admin-quote', id] as const,
};

export function useAdminQuotes(filters?: Record<string, string | number>) {
  return useQuery({
    queryKey: adminQuoteKeys.list(filters),
    queryFn: () => QuotesService.getQuotes(filters),
    staleTime: 30000,
  });
}

export function useAdminQuote(id: string) {
  return useQuery({
    queryKey: adminQuoteKeys.detail(id),
    queryFn: () => QuotesService.getQuote(id),
    staleTime: 30000,
    enabled: !!id,
  });
}

export function useUpdateQuote(id: string, orderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: UpdateQuoteRequest) => QuotesService.updateQuote(id, request),
    onSuccess: () => {
      toast.success('Cotización actualizada.');
      queryClient.invalidateQueries({ queryKey: adminQuoteKeys.all });
      queryClient.invalidateQueries({ queryKey: adminQuoteKeys.detail(id) });
      if (orderId) {
        queryClient.invalidateQueries({ queryKey: adminOrderKeys.detail(orderId) });
        queryClient.invalidateQueries({ queryKey: adminOrderKeys.notifications(orderId) });
      }
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-summary'] });
    },
  });
}
