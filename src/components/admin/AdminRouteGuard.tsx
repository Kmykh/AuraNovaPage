"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthSession } from '@/lib/auth-storage';
import { Skeleton } from '@/components/ui/Skeleton';

export function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Se ejecuta solo en el cliente tras la hidratación para coincidir con SSR
    const authStatus = AuthSession.isAuthenticated();
    setIsAuthenticated(authStatus);

    if (authStatus === false) {
      // Proteger Open Redirects
      const returnUrl = encodeURIComponent(pathname);
      router.push(`/admin/login?returnUrl=${returnUrl}`);
    }
  }, [pathname, router]);

  // Si no hemos determinado el estado, no renderizamos children para evitar flash de contenido protegido
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream/10">
        <Skeleton variant="rect" className="w-64 h-64 rounded-full opacity-20" />
      </div>
    );
  }

  return <>{children}</>;
}
