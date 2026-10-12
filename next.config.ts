import type { NextConfig } from "next";

const supabaseHost = 'jfxbsnhzbkdawncdatwb.supabase.co';
const mediaHost = process.env.NEXT_PUBLIC_MEDIA_BASE_URL
  ? new URL(process.env.NEXT_PUBLIC_MEDIA_BASE_URL).hostname
  : supabaseHost;

const nextConfig: NextConfig = {
  images: {
    // Solo nuestro Storage: con '**' el optimizador de imágenes quedaba abierto como proxy para cualquiera.
    remotePatterns: [...new Set([supabaseHost, mediaHost])].map((hostname) => ({
      protocol: 'https' as const,
      hostname,
      pathname: hostname === supabaseHost ? '/storage/v1/object/**' : '/**',
    })),
    formats: ['image/webp'],
    // Las imágenes subidas por la API no cambian nunca (nombre único) y vienen con caché de 1 año.
    // Se reutiliza la versión optimizada 31 días en lugar de volver a descargar el original de Supabase.
    minimumCacheTTL: 2678400,
    // Menos anchos posibles = menos variantes que Next tiene que pedir al Storage.
    deviceSizes: [640, 828, 1080, 1600],
    imageSizes: [64, 128, 256, 384],
  },
};

export default nextConfig;
