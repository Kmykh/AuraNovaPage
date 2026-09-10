"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthSession } from '@/lib/auth-storage';
import { Skeleton } from '@/components/ui/Skeleton';

export function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authState, setAuthState] = useState<'loading' | 'authenticated' | 'unauthorized'>('loading');

  useEffect(() => {
    const isAuth = AuthSession.isAuthenticated();

    if (!isAuth) {
      const returnUrl = encodeURIComponent(pathname);
      router.push(`/admin/login?returnUrl=${returnUrl}`);
      setAuthState('unauthorized');
      return;
    }

    // Check audit route restriction
    if (pathname.startsWith('/admin/auditoria')) {
      const role = AuthSession.getRole();
      if (role !== 'SuperAdmin') {
        router.push('/admin');
        setAuthState('unauthorized');
        return;
      }
    }

    setAuthState('authenticated');
  }, [pathname, router]);

  if (authState !== 'authenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream/10">
        <Skeleton variant="rect" className="w-64 h-64 rounded-full opacity-20" />
      </div>
    );
  }

  return <>{children}</>;
}

