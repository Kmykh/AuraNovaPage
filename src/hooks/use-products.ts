import { useQuery } from '@tanstack/react-query';
import { ProductsService } from '../services/products.service';

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => ProductsService.getProducts(),
    staleTime: 60 * 1000, // 1 minute cache
    retry: 1, // Only retry once on failure to avoid long waits
  });
}
