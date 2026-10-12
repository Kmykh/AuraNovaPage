/**
 * URL pública del sitio. Se usa para metadatos (Open Graph, sitemap, robots) y para las imágenes del correo.
 * Configurable con NEXT_PUBLIC_BASE_URL.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.auranovaoficial.com').replace(/\/+$/, '');

/**
 * Base pública de las imágenes del catálogo (hoy Supabase Storage). Cambiar NEXT_PUBLIC_MEDIA_BASE_URL
 * permite pasar a un CDN propio sin tocar código.
 */
export const MEDIA_BASE_URL = (
  process.env.NEXT_PUBLIC_MEDIA_BASE_URL ||
  'https://jfxbsnhzbkdawncdatwb.supabase.co/storage/v1/object/public/payment-evidence'
).replace(/\/+$/, '');
