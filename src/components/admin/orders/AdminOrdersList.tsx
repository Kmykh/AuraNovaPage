"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useAdminOrders } from '@/hooks/use-admin-orders';
import { getOrderStatusInfo, formatDate } from '@/lib/order-helpers';
import { formatCurrency } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Search, ChevronLeft, ChevronRight, AlertCircle, Inbox, ArrowRight, Clock, User, DollarSign, ShoppingBag, PackageCheck, Truck, XCircle, CreditCard, Calendar } from 'lucide-react';
import { ApiProblemDetails } from '@/lib/api-errors';

// Status to icon mapping
const statusIconMap: Record<number, React.ElementType> = {
  0: DollarSign,    // Por Cotizar
  1: DollarSign,    // Cotización Lista
  2: Clock,         // Esperando Pago
  3: CreditCard,    // Pago Reportado
  4: PackageCheck,  // Pago Confirmado
  5: ShoppingBag,   // En elaboración
  6: PackageCheck,  // Listo
  7: Truck,         // En Camino
  8: PackageCheck,  // Entregado
  9: Truck,         // Entregado a Agencia
  10: XCircle,      // Cancelado
};

const statusColorMap: Record<string, string> = {
  gold:  'bg-amber-50 text-amber-700 border-amber-200/60',
  rose:  'bg-rose-50 text-rose-600 border-rose-200/60',
  sage:  'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  brown: 'bg-stone-100 text-stone-700 border-stone-200/60',
};

const statusDotMap: Record<string, string> = {
  gold:  'bg-amber-500',
  rose:  'bg-rose-500',
  sage:  'bg-emerald-500',
  brown: 'bg-stone-500',
};

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

function formatShortDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return new Intl.DateTimeFormat('es-PE', { hour: '2-digit', minute: '2-digit' }).format(date);
    }
    if (days === 1) return 'Ayer';
    if (days < 7) return `Hace ${days} días`;
    
    return new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short' }).format(date);
  } catch {
    return dateString;
  }
}

export function AdminOrdersList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialPage = parseInt(searchParams.get('page') || '1', 10);
  const initialPageSize = parseInt(searchParams.get('pageSize') || '20', 10);
  const initialSearch = searchParams.get('search') || '';
  const initialStatus = searchParams.get('status') || '';
  const initialDateFrom = searchParams.get('dateFrom') || '';
  const initialDateTo = searchParams.get('dateTo') || '';

  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState(initialStatus);
  const [dateFrom, setDateFrom] = useState(initialDateFrom);
  const [dateTo, setDateTo] = useState(initialDateTo);
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    const params = new URLSearchParams();
    if (page > 1) params.set('page', page.toString());
    if (pageSize !== 20) params.set('pageSize', pageSize.toString());
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (status) params.set('status', status);
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);

    const query = params.toString();
    router.replace(`${pathname}${query ? `?${query}` : ''}`, { scroll: false });
  }, [page, pageSize, debouncedSearch, status, dateFrom, dateTo, pathname, router]);

  const [prevFilterKey, setPrevFilterKey] = useState('');
  const currentFilterKey = `${debouncedSearch}|${status}|${dateFrom}|${dateTo}|${pageSize}`;
  if (currentFilterKey !== prevFilterKey) {
    setPrevFilterKey(currentFilterKey);
    setPage(1);
  }

  const queryParams: Record<string, string | number> = {
    page,
    pageSize,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(status && { status }),
    ...(dateFrom && { dateFrom }),
    ...(dateTo && { dateTo }),
  };

  const { data: pagedResponse, isLoading, error, refetch } = useAdminOrders(queryParams);

  const handleClearFilters = () => {
    setSearch('');
    setStatus('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  const hasActiveFilters = !!status || !!dateFrom || !!dateTo;

  if (error) {
    const isForbidden = error instanceof ApiProblemDetails && error.status === 403;
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-sage/20 shadow-sm">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <h2 className="text-xl font-serif text-brown font-semibold mb-2">
          {isForbidden ? 'Acceso denegado' : 'Error al cargar'}
        </h2>
        <p className="text-sage max-w-md mb-6">
          {isForbidden ? 'No tienes permisos para ver los pedidos.' : 'No pudimos comunicarnos con Aura Nova.'}
        </p>
        <Button onClick={() => refetch()} variant="outline">Reintentar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Search + Filters Bar */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-sage/50 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Buscar por código, cliente o email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-sage/20 rounded-xl focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 text-sm text-brown placeholder:text-sage/50 transition-all"
            />
          </div>
          <div className="flex gap-2 shrink-0">
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value)}
              className="px-4 py-2.5 bg-white border border-sage/20 rounded-xl text-sm text-brown focus:outline-none focus:border-gold transition-all min-w-[160px]"
            >
              <option value="">Todos los estados</option>
              <option value="0">Por Cotizar</option>
              <option value="1">Cotización Lista</option>
              <option value="2">Esperando Pago</option>
              <option value="3">Pago Reportado</option>
              <option value="4">Pago Confirmado</option>
              <option value="5">En Elaboración</option>
              <option value="6">Listo</option>
              <option value="8">Entregado</option>
              <option value="9">Entregado a Agencia</option>
              <option value="10">Cancelado</option>
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-2.5 border rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                showFilters || hasActiveFilters
                  ? 'bg-gold/10 border-gold/30 text-gold' 
                  : 'bg-white border-sage/20 text-sage hover:text-brown'
              }`}
            >
              <Calendar size={14} />
              <span className="hidden sm:inline">Fechas</span>
              {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-gold" />}
            </button>
          </div>
        </div>

        {/* Expandable date filters */}
        {showFilters && (
          <div className="flex flex-col sm:flex-row gap-3 items-end bg-white p-4 rounded-xl border border-sage/15 animate-in slide-in-from-top-2 duration-200">
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-sage uppercase tracking-wider mb-1.5">Desde</label>
              <input 
                type="date" 
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAFAFA] border border-sage/20 rounded-lg text-sm text-brown focus:outline-none focus:border-gold"
              />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-sage uppercase tracking-wider mb-1.5">Hasta</label>
              <input 
                type="date" 
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAFAFA] border border-sage/20 rounded-lg text-sm text-brown focus:outline-none focus:border-gold"
              />
            </div>
            <Button variant="outline" onClick={handleClearFilters} className="h-[38px] text-xs shrink-0">
              Limpiar
            </Button>
          </div>
        )}
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} variant="rect" className="w-full h-20 rounded-xl" />
          ))}
        </div>
      ) : (!pagedResponse?.items || pagedResponse.items.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-sage/15">
          <Inbox className="w-12 h-12 text-sage/30 mb-4" />
          <h3 className="text-lg font-medium text-brown">No encontramos pedidos</h3>
          <p className="text-sage text-sm mt-1 mb-4">No hay resultados para estos criterios de búsqueda.</p>
          <Button variant="outline" onClick={handleClearFilters} className="text-sm">Limpiar filtros</Button>
        </div>
      ) : (
        <>
          {/* Order Cards (Unified for mobile + desktop) */}
          <div className="space-y-2.5">
            {(pagedResponse?.items || []).map((order) => {
              const statusInfo = getOrderStatusInfo(order.status);
              const StatusIcon = statusIconMap[typeof order.status === 'number' ? order.status : 0] || ShoppingBag;
              const colorClasses = statusColorMap[statusInfo.color] || statusColorMap.sage;
              const dotColor = statusDotMap[statusInfo.color] || statusDotMap.sage;

              return (
                <Link 
                  key={order.id}
                  href={`/admin/pedidos/${order.id}`}
                  className="group block bg-white rounded-xl border border-sage/10 hover:border-gold/30 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center gap-4 p-4">
                    {/* Status indicator dot (left edge) */}
                    <div className="hidden sm:flex flex-col items-center gap-1.5 shrink-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClasses} border`}>
                        <StatusIcon size={18} />
                      </div>
                    </div>

                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-brown text-sm">{order.orderCode}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${colorClasses}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                          {statusInfo.label}
                        </span>
                        {order.isCustomOrder && (
                          <span className="text-[10px] font-bold text-gold bg-gold/10 px-1.5 py-0.5 rounded-full border border-gold/20">
                            Personalizado
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-sage">
                        <span className="flex items-center gap-1">
                          <User size={11} /> {order.customerName}
                        </span>
                        <span className="hidden sm:flex items-center gap-1">
                          <Clock size={11} /> {formatShortDate(order.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Right side: Total + Arrow */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className="font-bold text-brown text-sm">
                          {order.total !== null && order.total !== undefined 
                            ? formatCurrency(order.total) 
                            : <span className="text-sage/60 text-xs font-normal">Por cotizar</span>
                          }
                        </p>
                        <p className="text-[10px] text-sage sm:hidden">{formatShortDate(order.createdAt)}</p>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-cream/60 flex items-center justify-center text-sage group-hover:bg-gold/10 group-hover:text-gold transition-all">
                        <ArrowRight size={14} />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          
          {/* Pagination */}
          {pagedResponse && (pagedResponse.totalPages ?? 0) > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-sage/10">
              <div className="flex items-center gap-3 text-sm text-sage">
                <span>Mostrar:</span>
                <select 
                  value={pageSize} 
                  onChange={(e) => setPageSize(parseInt(e.target.value, 10))}
                  className="bg-cream/30 border border-sage/20 rounded-lg px-2 py-1 text-sm text-brown outline-none"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
                <span className="text-sage/70">
                  Pág. {pagedResponse.page} de {pagedResponse.totalPages ?? 1} • {pagedResponse.totalItems ?? 0} pedidos
                </span>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="h-8 px-3 text-xs" 
                  disabled={!pagedResponse.hasPreviousPage}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  <ChevronLeft size={14} className="mr-1" /> Anterior
                </Button>
                <Button 
                  variant="outline" 
                  className="h-8 px-3 text-xs" 
                  disabled={!pagedResponse.hasNextPage}
                  onClick={() => setPage(p => p + 1)}
                >
                  Siguiente <ChevronRight size={14} className="ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
