/**
 * WhatsApp del cliente: celular peruano (9 dígitos, se guarda como siempre) o, si compra desde otro país,
 * con su código de país ("+5491123456789"). El backend lo valida igual.
 */
export interface PhoneCountry {
  iso: string;
  name: string;
  dial: string;
}

export const PERU: PhoneCountry = { iso: 'PE', name: 'Perú', dial: '51' };

/** Perú primero; luego donde más viven peruanos y los vecinos. */
export const PHONE_COUNTRIES: PhoneCountry[] = [
  PERU,
  { iso: 'AR', name: 'Argentina', dial: '54' },
  { iso: 'CL', name: 'Chile', dial: '56' },
  { iso: 'US', name: 'Estados Unidos / Canadá', dial: '1' },
  { iso: 'ES', name: 'España', dial: '34' },
  { iso: 'IT', name: 'Italia', dial: '39' },
  { iso: 'BO', name: 'Bolivia', dial: '591' },
  { iso: 'BR', name: 'Brasil', dial: '55' },
  { iso: 'CO', name: 'Colombia', dial: '57' },
  { iso: 'EC', name: 'Ecuador', dial: '593' },
  { iso: 'MX', name: 'México', dial: '52' },
  { iso: 'VE', name: 'Venezuela', dial: '58' },
  { iso: 'UY', name: 'Uruguay', dial: '598' },
  { iso: 'PY', name: 'Paraguay', dial: '595' },
  { iso: 'PA', name: 'Panamá', dial: '507' },
  { iso: 'CR', name: 'Costa Rica', dial: '506' },
  { iso: 'JP', name: 'Japón', dial: '81' },
  { iso: 'DE', name: 'Alemania', dial: '49' },
  { iso: 'FR', name: 'Francia', dial: '33' },
  { iso: 'GB', name: 'Reino Unido', dial: '44' },
];

/** "+5491123456789" → Argentina + "91123456789"; un número sin "+" es peruano. */
export function parsePhone(value: string): { country: PhoneCountry; national: string } {
  if (!value.startsWith('+')) return { country: PERU, national: value };
  const digits = value.slice(1);
  // El código más largo que coincida (p. ej. +593 antes que +59…)
  const country = [...PHONE_COUNTRIES].sort((a, b) => b.dial.length - a.dial.length).find(c => digits.startsWith(c.dial));
  return country ? { country, national: digits.slice(country.dial.length) } : { country: PERU, national: '' };
}

export function composePhone(country: PhoneCountry, national: string): string {
  const digits = national.replace(/\D/g, '');
  return country.iso === PERU.iso ? digits : `+${country.dial}${digits}`;
}

/** WhatsApp de otro país (con "+" y código distinto de +51). */
export const isAbroadPhone = (value: string) => value.startsWith('+') && !value.startsWith('+51');

export function isValidCustomerPhone(value: string): boolean {
  const { country, national } = parsePhone(value.trim());
  if (country.iso === PERU.iso) return /^9\d{8}$/.test(national);
  return national.length >= 6 && country.dial.length + national.length <= 15;
}

export const phoneError = (value: string) =>
  parsePhone(value).country.iso === PERU.iso
    ? 'Debe tener 9 dígitos y empezar con 9 (ej. 987654321).'
    : 'Escribe tu número sin el código de país (ese ya va elegido).';
