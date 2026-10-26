import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DiagnosticsService } from '@/services/diagnostics.service';

const emailStatusKey = ['admin-email-status'] as const;

export function useEmailStatus() {
  return useQuery({
    queryKey: emailStatusKey,
    queryFn: DiagnosticsService.getEmailStatus,
    staleTime: 15_000,
  });
}

/** Correo de prueba: el resultado (o el error exacto del proveedor) se muestra en el panel. */
export function useSendTestEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: DiagnosticsService.sendTestEmail,
    onSettled: () => queryClient.invalidateQueries({ queryKey: emailStatusKey }),
  });
}
