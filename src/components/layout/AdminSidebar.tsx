"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthSession } from '@/lib/auth-storage';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  PackageSearch, 
  FileText, 
  CreditCard, 
  Settings, 
  ShieldAlert,
  Truck,
  Tags,
  X,
  Flower2,
  Megaphone,
  Radio,
  BookOpen,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { Logo } from '../shared/Logo';
import { useAdminOrderCounts, needsActionCount } from '@/hooks/use-admin-orders';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

type NavItem = { name: string; href: string; icon: React.ElementType };

const navGroups: { title: string; items: NavItem[] }[] = [
  {
    title: 'Ventas',
    items: [
      { name: 'Inicio', href: '/admin', icon: LayoutDashboard },
      { name: 'Pedidos', href: '/admin/pedidos', icon: ShoppingBag },
      { name: 'Personalizados', href: '/admin/cotizaciones', icon: FileText },
      { name: 'Pagos', href: '/admin/pagos', icon: CreditCard },
      { name: 'Envíos', href: '/admin/envios', icon: Truck },
    ],
  },
  {
    title: 'Catálogo',
    items: [
      { name: 'Productos', href: '/admin/productos', icon: PackageSearch },
      { name: 'Categorías', href: '/admin/categorias', icon: Tags },
      { name: 'Personalización', href: '/admin/personalizacion', icon: Sparkles },
      { name: 'Campañas', href: '/admin/campanas', icon: Megaphone },
      { name: 'Catálogo PDF', href: '/admin/catalogo', icon: BookOpen },
    ],
  },
  {
    title: 'Ajustes',
    items: [
      { name: 'Transmisión', href: '/admin/transmision', icon: Radio },
      { name: 'Configuración', href: '/admin/configuracion', icon: Settings },
      { name: 'Auditoría', href: '/admin/auditoria', icon: ShieldAlert },
      { name: 'Sistema', href: '/admin/sistema', icon: Wrench },
    ],
  },
];

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const [role, setRole] = React.useState<string | null>(null);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Necesario para hidratación segura del rol desde LocalStorage tras SSR
    setRole(AuthSession.getRole());
  }, []);

  const { data: counts } = useAdminOrderCounts();
  const pendingOrders = needsActionCount(counts?.byStatus);

  const visibleGroups = React.useMemo(() => navGroups.map(group => ({
    ...group,
    items: group.items.filter(item => {
      // Transmisión: cualquier administrador autenticado. Auditoría y Sistema: solo SuperAdmin.
      if (item.name === 'Transmisión' && !role) return false;
      if ((item.name === 'Auditoría' || item.name === 'Sistema') && !role?.includes('SuperAdmin')) return false;
      return true;
    }),
  })), [role]);

  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive = item.href === '/admin' 
      ? pathname === '/admin' 
      : pathname?.startsWith(item.href);
    
    return (
      <Link
        href={item.href}
        onClick={onClose}
        className={`
          group relative flex items-center gap-x-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold
          ${isActive 
            ? 'bg-gradient-to-r from-gold/15 to-gold/5 text-gold shadow-sm' 
            : 'text-brown/70 hover:bg-cream/80 hover:text-brown'}
        `}
      >
        {/* Active indicator */}
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-gold rounded-r-full" />
        )}
        <item.icon 
          size={18} 
          className={`transition-colors duration-200 ${isActive ? 'text-gold' : 'text-sage/70 group-hover:text-gold'}`} 
        />
        <span className="truncate">{item.name}</span>
        {item.name === 'Pedidos' && pendingOrders > 0 && (
          <span
            className="ml-auto min-w-[20px] rounded-full bg-[#d38b8b] px-1.5 py-0.5 text-center text-[10px] font-bold text-white"
            title="Pedidos que necesitan tu atención"
          >
            {pendingOrders}
          </span>
        )}
        {item.name === 'Transmisión' && (
          <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            LIVE
          </span>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-brown/40 backdrop-blur-sm lg:hidden transition-opacity" 
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div 
        className={`
          fixed inset-y-0 left-0 z-50 w-[260px] bg-white/95 backdrop-blur-xl border-r border-sage/8 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
          ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex h-16 shrink-0 items-center justify-between px-5 border-b border-sage/8">
          <Link href="/admin" className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-md">
            <Logo variant="dark" />
          </Link>
          <button 
            type="button" 
            className="lg:hidden text-sage hover:text-brown focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-md p-1"
            onClick={onClose}
            aria-label="Cerrar menú lateral"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col overflow-y-auto pt-5 px-3 pb-4 gap-7">
          
          {visibleGroups.map(group => (
            <div key={group.title} className="space-y-1">
              <h3 className="px-3 text-[10px] font-bold text-sage/60 uppercase tracking-[0.15em] mb-2.5">{group.title}</h3>
              {group.items.map(item => (
                <NavLink key={item.name} item={item} />
              ))}
            </div>
          ))}
        </nav>

        {/* Bottom branding */}
        <div className="px-5 py-4 border-t border-sage/8">
          <div className="flex items-center gap-2 text-sage/50">
            <Flower2 size={14} />
            <span className="text-[10px] font-medium tracking-wide">Aura Nova Admin v3.0</span>
          </div>
        </div>
      </div>
    </>
  );
}
