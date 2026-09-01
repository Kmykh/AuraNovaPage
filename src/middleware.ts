import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Leemos la variable en tiempo real
  const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';

  if (isMaintenanceMode) {
    // Si la ruta solicitada NO es /mantenimiento, la redirigimos internamente (rewrite)
    if (!request.nextUrl.pathname.startsWith('/mantenimiento')) {
      return NextResponse.rewrite(new URL('/mantenimiento', request.url));
    }
  }

  return NextResponse.next();
}

// Especificamos en qué rutas debe ejecutarse este middleware
export const config = {
  matcher: [
    '/admin/:path*',
    '/productos/:path*',
    '/carrito/:path*',
    '/checkout/:path*',
    '/pago/:path*',
    '/personalizado/:path*',
  ],
};
