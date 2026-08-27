"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  PackageSearch, 
  FileText, 
  CreditCard, 
  Settings, 
  ShieldAlert,
  Truck,
  X
} from 'lucide-react';
import { Logo } from '../shared/Logo';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Pedidos', href: '/admin/pedidos', icon: ShoppingBag },
  { name: 'Productos', href: '/admin/productos', icon: PackageSearch },
  { name: 'Cotizaciones', href: '/admin/cotizaciones', icon: FileText },
  { name: 'Pagos', href: '/admin/pagos', icon: CreditCard },
  { name: 'Envíos', href: '/admin/envios', icon: Truck },
  { name: 'Configuración', href: '/admin/configuracion', icon: Settings },
  { name: 'Auditoría', href: '/admin/auditoria', icon: ShieldAlert },
];

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-brown/50 lg:hidden" 
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div 
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-sage/10 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-sage/10">
          <Link href="/admin" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-md">
            <Logo variant="dark" />
          </Link>
          <button 
            type="button" 
            className="lg:hidden text-sage hover:text-brown focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-md"
            onClick={onClose}
            aria-label="Cerrar menú lateral"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col overflow-y-auto pt-6 px-4 pb-4 gap-1">
          {navItems.map((item) => {
            const isActive = item.href === '/admin' 
              ? pathname === '/admin' 
              : pathname?.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group flex items-center gap-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold
                  ${isActive 
                    ? 'bg-gold/10 text-gold' 
                    : 'text-brown hover:bg-cream hover:text-gold'}
                `}
              >
                <item.icon 
                  size={20} 
                  className={isActive ? 'text-gold' : 'text-sage group-hover:text-gold transition-colors'} 
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
