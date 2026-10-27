import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CustomizationService } from '@/services/customization.service';
import { CustomizationOptions } from '@/types/products';
import { DEFAULT_ACCESSORIES, DEFAULT_COLORS, DEFAULT_FLOWER_TYPES } from '@/lib/product-options';

export const customizationKeys = {
  public: ['customization-options'] as const,
  admin: ['admin-customization-options'] as const,
};

const FALLBACK: CustomizationOptions = { colors: DEFAULT_COLORS, flowerTypes: DEFAULT_FLOWER_TYPES, accessories: DEFAULT_ACCESSORIES };

/** Paleta pública (cambia muy poco): mientras carga o si falla se usa la paleta inicial. */
export function useCustomizationOptions() {
  const query = useQuery({
    queryKey: customizationKeys.public,
    queryFn: CustomizationService.getOptions,
    staleTime: 30 * 60 * 1000,
    retry: 1,
  });
  return { ...query, options: query.data ?? FALLBACK };
}

export function useAdminCustomizationOptions() {
  return useQuery({
    queryKey: customizationKeys.admin,
    queryFn: CustomizationService.getAdminOptions,
    staleTime: 60_000,
  });
}

export function useUpdateCustomizationOptions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CustomizationOptions) => CustomizationService.updateOptions(request),
    onSuccess: (data) => {
      toast.success('Opciones de personalización guardadas.');
      queryClient.setQueryData(customizationKeys.admin, data);
      queryClient.setQueryData(customizationKeys.public, data);
    },
  });
}
