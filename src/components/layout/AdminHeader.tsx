"use client";

import React, { useState } from 'react';
import { Menu, LogOut, User, Bell, ChevronDown } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthSession } from '@/lib/auth-storage';
import { useQueryClient } from '@tanstack/react-query';

interface AdminHeaderProps {
  onMenuClick: () => void;
  title?: string;
}

const pageTitleMap: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/pedidos': 'Gestión de Pedidos',
  '/admin/productos': 'Catálogo de Productos',
  '/admin/cotizaciones': 'Pedidos Personalizados',
  '/admin/categorias': 'Categorías',
  '/admin/pagos': 'Gestión de Pagos',
  '/admin/envios': 'Configuración de Envíos',
  '/admin/configuracion': 'Configuración',
  '/admin/auditoria': 'Auditoría del Sistema',
};

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [showMenu, setShowMenu] = useState(false);

  const [adminName] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return AuthSession.getAdminName();
    }
    return null;
  });

  // Derive the page title from the current pathname
  const pageTitle = Object.entries(pageTitleMap).reduce((best, [path, title]) => {
    if (pathname?.startsWith(path) && path.length > best.pathLen) {
      return { title, pathLen: path.length };
    }
    return best;
  }, { title: 'Panel Administrativo', pathLen: 0 }).title;

  const handleLogout = () => {
    AuthSession.clearSession();
    queryClient.clear();
    router.push('/admin/login');
  };

  const initials = adminName 
    ? adminName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() 
    : 'AD';

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b border-sage/8 bg-white/80 backdrop-blur-xl px-4 sm:px-6 lg:px-8">
      <button
        type="button"
        className="-m-2.5 p-2.5 text-sage hover:text-brown lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-lg transition-colors"
        onClick={onMenuClick}
        aria-label="Abrir menú lateral"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* Mobile separator */}
      <div className="h-5 w-px bg-sage/15 lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 justify-between items-center">
        {/* Dynamic page title */}
        <div className="flex flex-col justify-center">
          <h1 className="text-base sm:text-lg font-semibold leading-tight text-brown">
            {pageTitle}
          </h1>
        </div>

        {/* Right side: Admin profile */}
        <div className="relative flex items-center gap-x-3">
          {/* User area */}
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-x-3 pl-3 py-1.5 pr-2 rounded-xl hover:bg-cream/60 transition-all duration-200 group"
          >
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-semibold leading-tight text-brown">{adminName || 'Admin'}</span>
              <span className="text-[10px] text-sage font-medium">Administrador</span>
            </div>
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-gold/80 to-gold flex items-center justify-center text-white font-bold text-xs shadow-sm">
              {initials}
            </div>
            <ChevronDown size={14} className={`text-sage transition-transform duration-200 hidden sm:block ${showMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown */}
          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-sage/10 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-2.5 border-b border-sage/10">
                  <p className="font-semibold text-sm text-brown">{adminName || 'Admin'}</p>
                  <p className="text-[11px] text-sage mt-0.5">Panel de administración</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={15} />
                  Cerrar sesión
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
