import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminProductsService } from '@/services/admin-products.service';
import { 
  CreateProductRequest, 
  UpdateProductRequest, 
  UpdateProductStockRequest, 
  UpdateProductAvailabilityRequest 
} from '@/types/products';
import { toast } from 'sonner';

// Keys
export const adminProductKeys = {
  all: ['admin-products'] as const,
  detail: (id: string) => ['admin-products', id] as const,
};

// Hook para obtener todos los productos
export function useAdminProducts() {
  return useQuery({
    queryKey: adminProductKeys.all,
    queryFn: AdminProductsService.getProducts,
    staleTime: 60000,
  });
}

// Hook para obtener detalle
export function useAdminProduct(id: string) {
  return useQuery({
    queryKey: adminProductKeys.detail(id),
    queryFn: () => AdminProductsService.getProduct(id),
    staleTime: 60000,
    enabled: !!id,
  });
}

// Helpers para la invalidación de caché
function useInvalidateProducts() {
  const queryClient = useQueryClient();
  return (id?: string) => {
    queryClient.invalidateQueries({ queryKey: adminProductKeys.all });
    if (id) {
      queryClient.invalidateQueries({ queryKey: adminProductKeys.detail(id) });
    }
    // Invalidamos también el catálogo público y dashboard
    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({ queryKey: ['admin-dashboard-summary'] });
  };
}

// Crear producto
export function useCreateProduct() {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: (req: CreateProductRequest) => AdminProductsService.createProduct(req),
    onSuccess: () => {
      invalidate();
      toast.success('Producto creado correctamente.');
    },
  });
}

// Editar producto
export function useUpdateProduct(id: string) {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: (req: UpdateProductRequest) => AdminProductsService.updateProduct(id, req),
    onSuccess: () => {
      invalidate(id);
      toast.success('Producto actualizado correctamente.');
    },
  });
}

// Editar stock
export function useUpdateStock(id: string) {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: (req: UpdateProductStockRequest) => AdminProductsService.updateStock(id, req),
    onSuccess: () => {
      invalidate(id);
      toast.success('Stock actualizado.');
    },
  });
}

// Editar disponibilidad
export function useUpdateAvailability(id: string) {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: (req: UpdateProductAvailabilityRequest) => AdminProductsService.updateAvailability(id, req),
    onSuccess: () => {
      invalidate(id);
      toast.success('Disponibilidad actualizada.');
    },
  });
}
