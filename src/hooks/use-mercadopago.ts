import { useQuery } from '@tanstack/react-query';
import { getMercadoPago, getPublicKey } from '@/lib/mercadopago';

/** ¿Hay Public Key de Mercado Pago? (de Vercel al compilar, o del backend). */
export function useMercadoPagoAvailable() {
  return useQuery({
    queryKey: ['mercadopago-public-key'],
    queryFn: getPublicKey,
    staleTime: Infinity,
    select: key => key.length > 0,
  });
}

/**
 * Instancia de Mercado Pago lista para usar en la página de pago.
 * Solo carga el script cuando hace falta (enabled) y si hay Public Key.
 */
export function useMercadoPago(enabled = true) {
  const { data: available } = useMercadoPagoAvailable();
  return useQuery({
    queryKey: ['mercadopago-sdk'],
    queryFn: getMercadoPago,
    enabled: enabled && available === true,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 1,
  });
}
