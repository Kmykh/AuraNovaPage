/**
 * Código de seguimiento "K7M3-Q9XA": 8 caracteres sin letras confusas (sin 0/O, 1/I/L).
 * Mismo formato que el backend (OrderCodes.cs).
 */
export const TRACKING_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const TRACKING_LENGTH = 8;

/** Acepta lo que pegue el cliente (minúsculas, espacios o el enlace completo) y devuelve "K7M3-Q9XA" o null. */
export function normalizeTrackingCode(input: string | null | undefined): string | null {
  if (!input) return null;
  const lastSegment = input.trim().replace(/\/+$/, '').split(/[/?=]/).pop() ?? '';
  const compact = lastSegment.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (compact.length !== TRACKING_LENGTH) return null;
  if ([...compact].some((c) => !TRACKING_ALPHABET.includes(c))) return null;
  return `${compact.slice(0, 4)}-${compact.slice(4)}`;
}

/** Solo los caracteres válidos, en mayúscula y sin guion (para los inputs del buscador). */
export function cleanTrackingInput(input: string): string {
  return input
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .split('')
    .filter((c) => TRACKING_ALPHABET.includes(c))
    .join('');
}

export function trackingPath(code: string): string {
  return `/seguimiento/${normalizeTrackingCode(code) ?? code}`;
}

export function trackingUrl(code: string, origin?: string): string {
  const base = origin ?? (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}${trackingPath(code)}`;
}
