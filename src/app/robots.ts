import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = SITE_URL;
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/admin/*',
        '/carrito',
        '/checkout',
        '/pago/',
        '/pago/*',
        '/seguimiento/',
        '/catalogo-pdf'
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
