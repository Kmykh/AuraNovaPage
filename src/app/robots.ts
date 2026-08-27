import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://auranova.com.pe';
  
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
        '/pago/*'
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
