import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BusinessSettingsService } from '@/services/business-settings.service';
import { UpdateBusinessSettingsRequest } from '@/types/business-settings';
import { toast } from 'sonner';

export const businessSettingsKeys = {
  admin: ['admin-business-settings'] as const,
  public: ['business-settings'] as const,
  paymentInfo: ['payment-info'] as const,
};

export function useAdminBusinessSettings() {
  return useQuery({
    queryKey: businessSettingsKeys.admin,
    queryFn: () => BusinessSettingsService.getAdminBusinessSettings(),
    staleTime: 60000,
  });
}

export function useUpdateBusinessSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: UpdateBusinessSettingsRequest) => BusinessSettingsService.updateBusinessSettings(request),
    onSuccess: () => {
      toast.success('Configuración actualizada correctamente.');
      queryClient.invalidateQueries({ queryKey: businessSettingsKeys.admin });
      queryClient.invalidateQueries({ queryKey: businessSettingsKeys.public });
      queryClient.invalidateQueries({ queryKey: businessSettingsKeys.paymentInfo });
    },
  });
}

export function useUploadYapeQr() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => BusinessSettingsService.uploadYapeQr(file),
    onSuccess: () => {
      toast.success('Código QR subido correctamente.');
      queryClient.invalidateQueries({ queryKey: businessSettingsKeys.admin });
      queryClient.invalidateQueries({ queryKey: businessSettingsKeys.public });
      queryClient.invalidateQueries({ queryKey: businessSettingsKeys.paymentInfo });
    },
  });
}

export function useDeleteYapeQr() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => BusinessSettingsService.deleteYapeQr(),
    onSuccess: () => {
      toast.success('QR eliminado.');
      queryClient.invalidateQueries({ queryKey: businessSettingsKeys.admin });
      queryClient.invalidateQueries({ queryKey: businessSettingsKeys.public });
      queryClient.invalidateQueries({ queryKey: businessSettingsKeys.paymentInfo });
    },
  });
}
