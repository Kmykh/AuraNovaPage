import { MEDIA_BASE_URL } from './site';

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
  
  // 2. URLs completas (incluye las URLs firmadas de archivos privados que devuelve la API),
  // vistas previas locales (blob:) e imágenes antiguas en base64 (data:) se usan tal cual.
  if (path.startsWith('http') || path.startsWith('blob:') || path.startsWith('data:')) return path; 
  
  // 3. Ruta corta del catálogo (ej. "products/uuid.webp"): se le antepone la base pública de medios
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  
  return `${MEDIA_BASE_URL}/${cleanPath}`;
}

/**
 * Normaliza el nombre de la etapa de campaña.
 * Si es "Día Central", se muestra como "Flores Amarillas".
 */
export function formatStageName(stage?: string | null): string {
  if (!stage) return 'Preventa';
  if (stage.toLowerCase().includes('central')) return 'Flores Amarillas';
  return stage;
}

