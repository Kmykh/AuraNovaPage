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

/** Campos seguros de MercadoPago.js: el número, el vencimiento y el código se escriben dentro de un iframe de Mercado Pago. */
export type SecureFieldType = 'cardNumber' | 'expirationDate' | 'securityCode';

export interface SecureFieldStyle {
  color?: string;
  placeholderColor?: string;
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  height?: string;
  padding?: string;
}

export interface SecureFieldValidity {
  field: SecureFieldType;
  errorMessages: { message: string; cause?: string }[];
}

export interface SecureField {
  mount: (containerId: string) => SecureField;
  unmount: () => void;
  update: (options: { settings?: unknown; placeholder?: string }) => void;
  on(event: 'binChange', callback: (data: { bin?: string | null }) => void): SecureField;
  on(event: 'validityChange', callback: (data: SecureFieldValidity) => void): SecureField;
  on(event: 'focus' | 'blur' | 'ready' | 'change' | 'error', callback: (data?: unknown) => void): SecureField;
}

/** Medio de pago que Mercado Pago reconoce por los primeros dígitos (visa, debvisa, master…). */
export interface CardPaymentMethod {
  id: string;
  payment_type_id: string;
  settings?: { card_number?: unknown; security_code?: unknown }[];
}

export interface InstallmentOption {
  installments: number;
  recommended_message: string;
}

export interface IdentificationType {
  id: string;
  name: string;
  min_length?: number;
  max_length?: number;
}

/** Lo que usamos de MercadoPago.js v2 (la librería no trae tipos). */
export interface MercadoPagoInstance {
  fields: {
    create: (type: SecureFieldType, options?: { placeholder?: string; style?: SecureFieldStyle }) => SecureField;
    createCardToken: (data: { cardholderName: string; identificationType: string; identificationNumber: string }) => Promise<{ id: string }>;
  };
  getPaymentMethods: (params: { bin: string }) => Promise<{ results: CardPaymentMethod[] }>;
  getInstallments: (params: { amount: string; bin: string; paymentTypeId?: string }) => Promise<{ payer_costs: InstallmentOption[] }[]>;
  getIdentificationTypes: () => Promise<IdentificationType[]>;
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
