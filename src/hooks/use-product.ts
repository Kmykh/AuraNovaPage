import { useQuery } from '@tanstack/react-query';
import { ProductsService } from '../services/products.service';

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => ProductsService.getProductById(id),
    staleTime: 60 * 1000,
    retry: 1,
    enabled: !!id, // Only run if ID is truthy
  });
}
