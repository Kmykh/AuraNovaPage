/** Datos del cliente recordados en este navegador para no volver a escribirlos en el próximo pedido. */
export interface SavedCustomer {
  name: string;
  phone: string;
  email: string;
}

const KEY = 'auranova-checkout-customer';
const EMPTY: SavedCustomer = { name: '', phone: '', email: '' };

export function readSavedCustomer(): SavedCustomer {
  if (typeof window === 'undefined') return EMPTY;
  try {
    return { ...EMPTY, ...JSON.parse(localStorage.getItem(KEY) || '{}') };
  } catch {
    return EMPTY;
  }
}

export function saveCustomer(customer: SavedCustomer) {
  try {
    localStorage.setItem(KEY, JSON.stringify(customer));
  } catch {
    // Navegación privada o almacenamiento bloqueado: no es necesario recordarlo
  }
}

/** Celular peruano: 9 dígitos empezando por 9. */
export const isValidPeruPhone = (phone: string) => /^9\d{8}$/.test(phone.trim());
