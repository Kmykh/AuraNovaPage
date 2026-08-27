"use client";

import React, { useState } from 'react';
import { Menu, LogOut, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AuthSession } from '@/lib/auth-storage';
import { useQueryClient } from '@tanstack/react-query';

interface AdminHeaderProps {
  onMenuClick: () => void;
  title?: string;
}

export function AdminHeader({ onMenuClick, title = 'Panel Administrativo' }: AdminHeaderProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [adminName] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return AuthSession.getAdminName();
    }
    return null;
  });

  const handleLogout = () => {
    AuthSession.clearSession();
    // Limpiar toda la caché de consultas (incluidas las de admin)
    queryClient.clear();
    router.push('/admin/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b border-sage/10 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <button
        type="button"
        className="-m-2.5 p-2.5 text-sage hover:text-brown lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-md"
        onClick={onMenuClick}
        aria-label="Abrir menú lateral"
      >
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Separator for mobile */}
      <div className="h-6 w-px bg-sage/20 lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 justify-between items-center">
        <h1 className="text-lg font-semibold leading-6 text-brown hidden sm:block">
          {title}
        </h1>
        
        {/* Placeholder title for very small screens */}
        <h1 className="text-base font-semibold leading-6 text-brown sm:hidden truncate">
          Aura Nova
        </h1>

        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <div className="flex items-center gap-x-3 border-l border-sage/20 pl-4 lg:pl-6">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-sm font-semibold leading-6 text-brown">Administrador</span>
              <span className="text-xs text-sage">{adminName || 'Admin'}</span>
            </div>
            <div className="h-9 w-9 rounded-full bg-cream flex items-center justify-center text-brown">
              <User size={18} />
            </div>
            
            <button
              type="button"
              onClick={handleLogout}
              className="ml-2 p-2 text-sage hover:text-red-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded-md"
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
