/**
 * Formatea un número como moneda peruana (PEN).
 * Ejemplo: 79.9 -> "S/ 79.90"
 */
export function formatCurrency(value: number | undefined | null): string {
  if (value === undefined || value === null) {
    return 'S/ 0.00';
  }
  
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
  }).format(value);
}

/**
 * Normaliza la URL de una imagen.
 * Si es una ruta relativa (ej. "products/123.jpg"), le antepone la URL base de la API.
 * Si ya es una URL absoluta, la devuelve tal cual.
 */
export function getImageUrl(path: string | null | undefined): string {
  // 1. Si el producto no tiene imagen, devolvemos un placeholder (imagen por defecto)
  if (!path) return '/placeholder-image.jpg'; 
  
  // 2. Si por alguna razón la base de datos ya tiene guardada una URL completa (empieza con http), la devolvemos tal cual
  // Mantenemos 'blob:' para que las vistas previas locales funcionen.
  if (path.startsWith('http') || path.startsWith('blob:')) return path; 
  
  // 3. Magia: Si es una ruta corta (ej. "products/uuid.jpg" o "payment-evidence/uuid.jpg"), le pegamos la URL base de tu Supabase
  const SUPABASE_BASE_URL = 'https://jfxbsnhzbkdawncdatwb.supabase.co/storage/v1/object/public/payment-evidence';
  
  // Limpiamos los slashes dobles por si acaso
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  
  return `${SUPABASE_BASE_URL}/${cleanPath}`;
}

