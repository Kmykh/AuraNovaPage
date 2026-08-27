"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useAdminOrders } from '@/hooks/use-admin-orders';
import { getOrderStatusInfo, formatDate } from '@/lib/order-helpers';
import { formatCurrency } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Search, ChevronLeft, ChevronRight, AlertCircle, Inbox } from 'lucide-react';
import { ApiProblemDetails } from '@/lib/api-errors';

// Para el debounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export function AdminOrdersList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Estados locales inicializados desde URL
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

  const debouncedSearch = useDebounce(search, 400);

  // Sincronizar hacia URL cuando cambian (y resetear página si cambian filtros)
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

  // Reset page to 1 when filters change
  const [prevFilterKey, setPrevFilterKey] = useState('');
  const currentFilterKey = `${debouncedSearch}|${status}|${dateFrom}|${dateTo}|${pageSize}`;
  if (currentFilterKey !== prevFilterKey) {
    setPrevFilterKey(currentFilterKey);
    setPage(1);
  }

  // Query actual
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
    <div className="space-y-6">
      {/* Panel de Filtros */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-sage/10 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-sage w-5 h-5" />
            <input 
              type="text" 
              placeholder="Buscar por código, cliente o email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#FAFAFA] border border-sage/20 rounded-xl focus:ring-1 focus:ring-gold focus:border-gold outline-none"
            />
          </div>
          <select 
            value={status} 
            onChange={(e) => setStatus(e.target.value)}
            className="w-full sm:w-48 px-4 py-2 bg-[#FAFAFA] border border-sage/20 rounded-xl text-brown focus:ring-1 focus:ring-gold outline-none"
          >
            <option value="">Todos los estados</option>
            <option value="0">Por Cotizar</option>
            <option value="1">Cotización Lista</option>
            <option value="2">Esperando Pago</option>
            <option value="3">Pago Reportado</option>
            <option value="4">Pago Confirmado</option>
            <option value="5">Preparando</option>
            <option value="6">Listo</option>
            <option value="7">En Camino</option>
            <option value="8">Entregado</option>
            <option value="9">Cancelado</option>
          </select>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="w-full sm:w-auto flex-1 flex gap-4">
            <div className="flex-1">
              <label className="block text-xs text-sage mb-1">Desde</label>
              <input 
                type="date" 
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-4 py-2 bg-[#FAFAFA] border border-sage/20 rounded-xl text-brown focus:ring-1 focus:ring-gold outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-sage mb-1">Hasta</label>
              <input 
                type="date" 
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-4 py-2 bg-[#FAFAFA] border border-sage/20 rounded-xl text-brown focus:ring-1 focus:ring-gold outline-none"
              />
            </div>
          </div>
          <Button variant="outline" onClick={handleClearFilters} className="w-full sm:w-auto h-[42px]">
            Limpiar filtros
          </Button>
        </div>
      </div>

      {/* Listado */}
      <div className="bg-white rounded-2xl shadow-sm border border-sage/10 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => <Skeleton key={i} variant="rect" className="w-full h-16 rounded-xl" />)}
          </div>
        ) : (!pagedResponse?.items || pagedResponse.items.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Inbox className="w-12 h-12 text-sage/40 mb-4" />
            <h3 className="text-lg font-medium text-brown">No encontramos pedidos</h3>
            <p className="text-sage mt-1 mb-4">No hay resultados para estos criterios de búsqueda.</p>
            <Button variant="outline" onClick={handleClearFilters}>Limpiar filtros</Button>
          </div>
        ) : (
          <>
            {/* Mobile View */}
            <div className="grid grid-cols-1 md:hidden divide-y divide-sage/10">
              {(pagedResponse?.items || []).map((order) => {
                const statusInfo = getOrderStatusInfo(order.status);
                return (
                  <div key={order.id} className="p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-brown">{order.orderCode}</p>
                        <p className="text-sm text-sage">{order.customerName}</p>
                      </div>
                      <p className="font-semibold text-brown">
                        {order.total !== null && order.total !== undefined ? formatCurrency(order.total) : 'Por cotizar'}
                      </p>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-${statusInfo.color}/10 text-${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                      <span className="text-xs text-sage">{formatDate(order.createdAt)}</span>
                    </div>
                    <Link href={`/admin/pedidos/${order.id}`}>
                      <Button variant="outline" className="w-full mt-2 h-9">Ver pedido</Button>
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm text-brown">
                <thead className="bg-cream/30 text-sage border-b border-sage/10">
                  <tr>
                    <th className="px-6 py-4 font-medium">Código</th>
                    <th className="px-6 py-4 font-medium">Cliente</th>
                    <th className="px-6 py-4 font-medium">Fecha</th>
                    <th className="px-6 py-4 font-medium">Estado</th>
                    <th className="px-6 py-4 font-medium">Total</th>
                    <th className="px-6 py-4 font-medium text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sage/10">
                  {(pagedResponse?.items || []).map((order) => {
                    const statusInfo = getOrderStatusInfo(order.status);
                    return (
                      <tr key={order.id} className="hover:bg-[#FAFAFA] transition-colors">
                        <td className="px-6 py-4 font-medium">{order.orderCode}</td>
                        <td className="px-6 py-4">{order.customerName}</td>
                        <td className="px-6 py-4 text-sage">{formatDate(order.createdAt)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-${statusInfo.color}/10 text-${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium">
                          {order.total !== null && order.total !== undefined ? formatCurrency(order.total) : 'Por cotizar'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/admin/pedidos/${order.id}`}>
                            <Button variant="outline" className="h-8 px-4 text-xs">Ver detalle</Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {pagedResponse && (pagedResponse.totalPages ?? 0) > 1 && (
              <div className="p-4 border-t border-sage/10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#FAFAFA]">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-sage">Mostrar:</span>
                  <select 
                    value={pageSize} 
                    onChange={(e) => setPageSize(parseInt(e.target.value, 10))}
                    className="bg-white border border-sage/20 rounded-lg px-2 py-1 text-sm outline-none"
                  >
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                  </select>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-sage">
                    Página {pagedResponse.page} de {pagedResponse.totalPages ?? 1} ({pagedResponse.totalItems ?? 0} en total)
                  </span>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="h-8 w-8 p-0" 
                      disabled={!pagedResponse.hasPreviousPage}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                    >
                      <ChevronLeft size={16} />
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-8 w-8 p-0" 
                      disabled={!pagedResponse.hasNextPage}
                      onClick={() => setPage(p => p + 1)}
                    >
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
