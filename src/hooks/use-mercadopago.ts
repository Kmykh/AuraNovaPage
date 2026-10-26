import { useQuery } from '@tanstack/react-query';
import { getMercadoPago, isMercadoPagoConfigured } from '@/lib/mercadopago';

/**
 * Instancia de Mercado Pago lista para usar en la página de pago.
 * Solo carga el script cuando hace falta (enabled) y si la Public Key está configurada.
 */
export function useMercadoPago(enabled = true) {
  return useQuery({
    queryKey: ['mercadopago-sdk'],
    queryFn: getMercadoPago,
    enabled: enabled && isMercadoPagoConfigured(),
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 1,
  });
}
