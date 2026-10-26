import { loadMercadoPago } from '@mercadopago/sdk-js';
import { apiClient } from './api-client';

/**
 * Public Key de Mercado Pago. No es secreta (va en el navegador). El Access Token nunca va aquí: solo en el backend.
 * Se toma de NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY (Vercel, al compilar) o, si no está, del backend
 * (MercadoPago__PublicKey en Render), donde vive junto al Access Token de la misma aplicación.
 */
const BUILD_PUBLIC_KEY = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY ?? '';

let publicKeyPromise: Promise<string> | null = null;

export function getPublicKey(): Promise<string> {
  if (BUILD_PUBLIC_KEY) return Promise.resolve(BUILD_PUBLIC_KEY);
  publicKeyPromise ??= apiClient
    .get<{ publicKey?: string | null }>('/api/payments/mercadopago/config')
    .then(response => response.data?.publicKey?.trim() ?? '')
    .catch(() => {
      publicKeyPromise = null;
      return '';
    });
  return publicKeyPromise;
}

/** Datos que entrega el Card Payment Brick al enviar (la tarjeta ya viene convertida en token). */
export interface CardPaymentFormData {
  token: string;
  issuer_id?: string;
  payment_method_id: string;
  transaction_amount: number;
  installments: number;
  payer: {
    email?: string;
    identification?: { type?: string; number?: string };
  };
}

export interface CardPaymentAdditionalData {
  paymentTypeId?: string;
  bin?: string;
  lastFourDigits?: string;
  cardholderName?: string;
}

export interface BrickController {
  unmount: () => void;
}

export interface CardPaymentBrickSettings {
  initialization: { amount: number; payer?: { email?: string } };
  customization?: {
    paymentMethods?: { maxInstallments?: number };
    visual?: { style?: { theme?: 'default' | 'dark' | 'bootstrap' | 'flat' } };
  };
  callbacks: {
    onReady?: () => void;
    onSubmit: (formData: CardPaymentFormData, additionalData?: CardPaymentAdditionalData) => Promise<void>;
    onError?: (error: unknown) => void;
  };
}

/** Lo que usamos de MercadoPago.js v2 (la librería no trae tipos). */
export interface MercadoPagoInstance {
  bricks: () => {
    create: (type: 'cardPayment', containerId: string, settings: CardPaymentBrickSettings) => Promise<BrickController>;
  };
  /** Token de Yape a partir del celular y el código de aprobación (OTP) de la app Yape. */
  yape: (options: { otp: string; phoneNumber: string }) => { create: () => Promise<{ id: string }> };
}

/** Límite máximo de Yape por pago (S/ 500, 900 o 2000 según lo configure el cliente en su app). */
export const YAPE_MAX_AMOUNT = 2000;

type MercadoPagoConstructor = new (publicKey: string, options?: { locale?: string }) => MercadoPagoInstance;


const SECURITY_SCRIPT_URL = 'https://www.mercadopago.com/v2/security.js';

/**
 * security.js de Mercado Pago: identifica el dispositivo del comprador para su antifraude (aprueba más pagos).
 * Se carga una sola vez y, si un bloqueador lo impide, el pago sigue funcionando igual.
 */
function loadDeviceFingerprint() {
  if (typeof document === 'undefined' || document.querySelector(`script[src="${SECURITY_SCRIPT_URL}"]`)) return;
  const script = document.createElement('script');
  script.src = SECURITY_SCRIPT_URL;
  script.async = true;
  script.setAttribute('view', 'checkout');
  document.head.appendChild(script);
}

/** Identificador del dispositivo que generó security.js; el backend lo envía como X-meli-session-id. */
export function getDeviceId(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const value = (window as unknown as { MP_DEVICE_SESSION_ID?: unknown }).MP_DEVICE_SESSION_ID;
  return typeof value === 'string' && /^[A-Za-z0-9._:-]{1,500}$/.test(value) ? value : undefined;
}

/** Si el cliente paga muy rápido, security.js puede no haber terminado: se espera un momento (máx. 3 s). */
export async function waitForDeviceId(timeoutMs = 3000): Promise<string | undefined> {
  const started = Date.now();
  let deviceId = getDeviceId();
  while (!deviceId && Date.now() - started < timeoutMs) {
    await new Promise(resolve => setTimeout(resolve, 150));
    deviceId = getDeviceId();
  }
  return deviceId;
}

let instancePromise: Promise<MercadoPagoInstance> | null = null;

/** Carga MercadoPago.js una sola vez y devuelve la instancia inicializada con la Public Key. */
export function getMercadoPago(): Promise<MercadoPagoInstance> {
  if (!instancePromise) {
    instancePromise = (async () => {
      const publicKey = await getPublicKey();
      if (!publicKey) throw new Error('Falta la Public Key de Mercado Pago (Vercel o MercadoPago__PublicKey en Render).');

      loadDeviceFingerprint();
      await loadMercadoPago();
      const MercadoPago = (window as unknown as { MercadoPago?: MercadoPagoConstructor }).MercadoPago;
      if (!MercadoPago) throw new Error('No se pudo cargar MercadoPago.js.');

      return new MercadoPago(publicKey, { locale: 'es-PE' });
    })();

    // Si falla (sin conexión o un bloqueador), el siguiente intento vuelve a cargarla
    instancePromise.catch(() => {
      instancePromise = null;
    });
  }
  return instancePromise;
}
