import { loadMercadoPago } from '@mercadopago/sdk-js';

/**
 * Public Key de Mercado Pago. No es secreta (va en el navegador): en desarrollo la de prueba y en producción
 * la de producción (ambas empiezan con "APP_USR-"). El Access Token nunca va aquí: solo en el backend.
 */
export const MERCADOPAGO_PUBLIC_KEY = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY ?? '';

/** Lo que usamos de MercadoPago.js v2 (la librería no trae tipos). */
export interface MercadoPagoInstance {
  bricks: () => unknown;
}

type MercadoPagoConstructor = new (publicKey: string, options?: { locale?: string }) => MercadoPagoInstance;

export const isMercadoPagoConfigured = () => MERCADOPAGO_PUBLIC_KEY.length > 0;

let instancePromise: Promise<MercadoPagoInstance> | null = null;

/** Carga MercadoPago.js una sola vez y devuelve la instancia inicializada con la Public Key. */
export function getMercadoPago(): Promise<MercadoPagoInstance> {
  if (!instancePromise) {
    instancePromise = (async () => {
      if (!MERCADOPAGO_PUBLIC_KEY) throw new Error('Falta configurar NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY.');

      await loadMercadoPago();
      const MercadoPago = (window as unknown as { MercadoPago?: MercadoPagoConstructor }).MercadoPago;
      if (!MercadoPago) throw new Error('No se pudo cargar MercadoPago.js.');

      return new MercadoPago(MERCADOPAGO_PUBLIC_KEY, { locale: 'es-PE' });
    })();

    // Si falla (sin conexión o un bloqueador), el siguiente intento vuelve a cargarla
    instancePromise.catch(() => {
      instancePromise = null;
    });
  }
  return instancePromise;
}
