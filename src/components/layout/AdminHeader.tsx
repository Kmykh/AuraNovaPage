"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, LogOut, ChevronDown, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AuthSession } from '@/lib/auth-storage';
import { useQueryClient } from '@tanstack/react-query';

interface AdminHeaderProps {
  onMenuClick: () => void;
}


export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showMenu, setShowMenu] = useState(false);

  const [adminName] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return AuthSession.getAdminName();
    }
    return null;
  });

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
        {/* Sin título aquí: cada página ya tiene el suyo (antes salía dos veces) */}
        <div className="flex items-center gap-3">
          <span className="font-serif text-base font-semibold text-brown lg:hidden">Aura Nova</span>
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1.5 rounded-full border border-sage/15 px-3 py-1.5 text-xs font-semibold text-sage transition hover:border-gold/40 hover:text-brown sm:inline-flex"
          >
            <ExternalLink size={13} /> Ver tienda
          </Link>
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
