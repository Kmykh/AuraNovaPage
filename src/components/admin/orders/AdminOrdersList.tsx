"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle, ArrowRight, Calendar, Camera, ChevronLeft, ChevronRight, Clock, Inbox, MapPin, Package,
  Search, SlidersHorizontal, Sparkles, CalendarHeart,
} from 'lucide-react';
import { useAdminOrderCounts, useAdminOrders, needsActionCount } from '@/hooks/use-admin-orders';
import { daysUntilDate, getDeliveryTypeLabel, getOrderStatusInfo, nextAdminAction, AdminActionTone } from '@/lib/order-helpers';
import { formatCurrency, getImageUrl } from '@/lib/formatters';
import { statusName, deliveryTypeName, timeAgo } from '@/lib/tracking-progress';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { ColorSwatch } from '@/components/shared/ColorSwatch';
import { ApiProblemDetails } from '@/lib/api-errors';
import { AdminOrderListItemResponse } from '@/types/orders';

type View = 'action' | 'customer' | 'workshop' | 'delivery' | 'done' | 'all';

const VIEWS: { key: View; label: string; statuses: string[] }[] = [
  { key: 'action', label: 'Te toca', statuses: ['WaitingQuote', 'PaymentReported', 'PaymentConfirmed'] },
  { key: 'customer', label: 'Esperando al cliente', statuses: ['QuoteReady', 'WaitingPayment'] },
  { key: 'workshop', label: 'En el taller', statuses: ['Preparing'] },
  { key: 'delivery', label: 'Por entregar', statuses: ['Ready', 'Shipped', 'DeliveredToAgency'] },
  { key: 'done', label: 'Cerrados', statuses: ['Delivered', 'Cancelled'] },
  { key: 'all', label: 'Todos', statuses: [] },
];

const TONE_STYLES: Record<AdminActionTone, string> = {
  urgent: 'bg-[#d38b8b] text-white',
  waiting: 'bg-amber-50 text-amber-700 border border-amber-200',
  progress: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  done: 'bg-stone-100 text-stone-500',
};

const STATUS_BADGE: Record<string, string> = {
  gold: 'bg-amber-50 text-amber-700 border-amber-200/60',
  rose: 'bg-rose-50 text-rose-600 border-rose-200/60',
  sage: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  brown: 'bg-stone-100 text-stone-700 border-stone-200/60',
};

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

function DesiredDateChip({ date }: { date: string }) {
  const days = daysUntilDate(date);
  const urgent = days <= 2;
  const label = days < 0 ? 'Fecha pasada' : days === 0 ? 'Lo necesita hoy' : days === 1 ? 'Lo necesita mañana' : `Para en ${days} días`;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${urgent ? 'bg-rose-100 text-rose-700' : 'bg-[#fdf8ee] text-[#8c6d36]'}`}>
      <CalendarHeart size={11} /> {label}
    </span>
  );
}

function OrderThumbs({ order }: { order: AdminOrderListItemResponse }) {
  const items = order.items ?? [];
  if (order.isCustomOrder && items.length === 0) {
    return (
      <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-gold/25 bg-[#fdf8ee] text-gold">
        <Camera size={18} />
        {!!order.referenceImageCount && <span className="text-[10px] font-bold">{order.referenceImageCount} fotos</span>}
      </div>
    );
  }
  const shown = items.slice(0, 3);
  return (
    <div className="relative h-14 w-14 shrink-0">
      {shown.map((item, index) => (
        <div
          key={`${item.productName}-${index}`}
          className="absolute overflow-hidden rounded-xl border-2 border-white bg-[#FAF9F6] shadow-sm"
          style={{
            width: shown.length > 1 ? 44 : 56,
            height: shown.length > 1 ? 44 : 56,
            left: index * 6,
            top: index * 6,
            zIndex: 10 - index,
          }}
        >
          {item.imageUrl ? (
            <Image src={getImageUrl(item.imageUrl)} alt="" fill sizes="64px" className="object-cover" />
          ) : (
            <Package className="absolute inset-0 m-auto h-5 w-5 text-sage/40" />
          )}
        </div>
      ))}
      {shown.length === 0 && <Package className="absolute inset-0 m-auto h-6 w-6 text-sage/40" />}
    </div>
  );
}

function OrderRow({ order }: { order: AdminOrderListItemResponse }) {
  const status = statusName(order.status);
  const delivery = deliveryTypeName(order.deliveryType ?? '');
  const statusInfo = getOrderStatusInfo(status, delivery);
  const action = nextAdminAction(status, delivery);
  const items = order.items ?? [];
  const firstColors = items[0]?.colors ?? [];

  return (
    <Link
      href={`/admin/pedidos/${order.id}`}
      className="group block rounded-2xl border border-sage/10 bg-white transition-all duration-200 hover:border-gold/30 hover:shadow-md"
    >
      <div className="flex items-start gap-4 p-4">
        <OrderThumbs order={order} />

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm font-bold text-brown">{order.orderCode}</span>
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${STATUS_BADGE[statusInfo.color] ?? STATUS_BADGE.sage}`}>
              {statusInfo.label}
            </span>
            {order.isCustomOrder && (
              <span className="inline-flex items-center gap-1 rounded-full border border-gold/20 bg-gold/10 px-2 py-0.5 text-[10px] font-bold text-gold">
                <Sparkles size={10} /> Personalizado
              </span>
            )}
            {order.desiredDate && status !== 'Delivered' && status !== 'Cancelled' && <DesiredDateChip date={order.desiredDate} />}
          </div>

          {/* Qué pidió */}
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-brown/90">
            {items.length > 0 ? (
              <>
                {items.slice(0, 2).map((item, index) => (
                  <span key={`${item.productName}-${index}`} className="truncate">
                    {index > 0 && <span className="mr-2 text-sage/40">·</span>}
                    <span className="font-semibold">{item.productName}</span>
                    {item.quantity > 1 && <span className="text-sage"> ×{item.quantity}</span>}
                  </span>
                ))}
                {items.length > 2 && <span className="text-xs text-sage">+{items.length - 2} más</span>}
                {firstColors.length > 0 && (
                  <span className="inline-flex items-center gap-0.5">
                    {firstColors.map(color => <ColorSwatch key={color} name={color} size={12} />)}
                  </span>
                )}
                {items.some(i => i.hasExtras) && <span className="text-[10px] font-semibold text-gold">+ extras</span>}
              </>
            ) : (
              <span className="text-sage">
                {order.occasion ? <span className="font-semibold text-brown">{order.occasion}</span> : 'Diseño a pedido'}
                {order.referenceImageCount ? ` · ${order.referenceImageCount} foto${order.referenceImageCount === 1 ? '' : 's'} de referencia` : ''}
              </span>
            )}
          </p>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-sage">
            <span className="font-medium text-brown/80">{order.customerName}</span>
            {order.deliveryType !== undefined && (
              <span className="inline-flex items-center gap-1">
                <MapPin size={11} /> {getDeliveryTypeLabel(order.deliveryType)}{order.deliveryPlace ? ` · ${order.deliveryPlace}` : ''}
              </span>
            )}
            <span className="inline-flex items-center gap-1"><Clock size={11} /> {timeAgo(order.createdAt)}</span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <p className="text-sm font-bold text-brown">
            {order.total != null ? formatCurrency(order.total) : <span className="text-xs font-semibold text-amber-600">Sin precio</span>}
          </p>
          {action.label && (
            <span className={`hidden rounded-full px-2.5 py-1 text-[10px] font-bold sm:inline-block ${TONE_STYLES[action.tone]}`}>
              {action.label}
            </span>
          )}
          <ArrowRight size={14} className="text-sage transition group-hover:translate-x-0.5 group-hover:text-gold" />
        </div>
      </div>
      {action.label && (
        <div className={`rounded-b-2xl px-4 py-1.5 text-center text-[11px] font-bold sm:hidden ${TONE_STYLES[action.tone]}`}>
          {action.label}
        </div>
      )}
    </Link>
  );
}

export function AdminOrdersList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [view, setView] = useState<View>((searchParams.get('view') as View) || 'all');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const [pageSize, setPageSize] = useState(parseInt(searchParams.get('pageSize') || '20', 10));
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('dateTo') || '');
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    const params = new URLSearchParams();
    if (view !== 'all') params.set('view', view);
    if (page > 1) params.set('page', page.toString());
    if (pageSize !== 20) params.set('pageSize', pageSize.toString());
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (status) params.set('status', status);
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);
    const query = params.toString();
    router.replace(`${pathname}${query ? `?${query}` : ''}`, { scroll: false });
  }, [view, page, pageSize, debouncedSearch, status, dateFrom, dateTo, pathname, router]);

  // Cualquier cambio de filtro vuelve a la primera página
  const [prevFilterKey, setPrevFilterKey] = useState('');
  const currentFilterKey = `${view}|${debouncedSearch}|${status}|${dateFrom}|${dateTo}|${pageSize}`;
  if (currentFilterKey !== prevFilterKey) {
    setPrevFilterKey(currentFilterKey);
    setPage(1);
  }

  const queryParams: Record<string, string | number> = {
    page,
    pageSize,
    ...(view !== 'all' && !status && { view }),
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(status && { status }),
    ...(dateFrom && { dateFrom }),
    ...(dateTo && { dateTo }),
  };

  const { data: pagedResponse, isLoading, error, refetch } = useAdminOrders(queryParams);
  const { data: counts } = useAdminOrderCounts();

  const countFor = (key: View) => {
    if (!counts) return null;
    if (key === 'all') return counts.total;
    if (key === 'action') return needsActionCount(counts.byStatus);
    return VIEWS.find(v => v.key === key)!.statuses.reduce((sum, s) => sum + (counts.byStatus[s] ?? 0), 0);
  };

  const clearFilters = () => {
    setSearch('');
    setStatus('');
    setDateFrom('');
    setDateTo('');
  };
  const hasExtraFilters = !!status || !!dateFrom || !!dateTo;

  if (error) {
    const isForbidden = error instanceof ApiProblemDetails && error.status === 403;
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-sage/20 bg-white py-20 text-center shadow-sm">
        <AlertCircle className="mb-4 h-12 w-12 text-red-400" />
        <h2 className="mb-2 font-serif text-xl font-semibold text-brown">{isForbidden ? 'Acceso denegado' : 'Error al cargar'}</h2>
        <p className="mb-6 max-w-md text-sage">{isForbidden ? 'No tienes permisos para ver los pedidos.' : 'No pudimos comunicarnos con Aura Nova.'}</p>
        <Button onClick={() => refetch()} variant="outline">Reintentar</Button>
      </div>
    );
  }

  const items = pagedResponse?.items ?? [];

  return (
    <div className="space-y-4">
      {/* Pestañas por etapa */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {VIEWS.map(tab => {
          const count = countFor(tab.key);
          const active = view === tab.key && !status;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => { setView(tab.key); setStatus(''); }}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                active ? 'border-brown bg-brown text-white shadow-sm' : 'border-sage/20 bg-white text-brown/80 hover:border-gold/50'
              }`}
            >
              {tab.label}
              {count !== null && (
                <span className={`min-w-[22px] rounded-full px-1.5 py-0.5 text-center text-[11px] font-bold ${
                  active ? 'bg-white/20 text-white' : tab.key === 'action' && count > 0 ? 'bg-[#d38b8b] text-white' : 'bg-sage/10 text-sage'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Búsqueda y filtros */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-sage/50" />
            <input
              type="search"
              placeholder="Buscar por N° de pedido, código, cliente, teléfono o producto…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-sage/20 bg-white py-2.5 pl-11 pr-4 text-sm text-brown placeholder:text-sage/50 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30"
            />
          </div>
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
              showFilters || hasExtraFilters ? 'border-gold/30 bg-gold/10 text-gold' : 'border-sage/20 bg-white text-sage hover:text-brown'
            }`}
          >
            <SlidersHorizontal size={14} />
            <span className="hidden sm:inline">Filtros</span>
            {hasExtraFilters && <span className="h-1.5 w-1.5 rounded-full bg-gold" />}
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 items-end gap-3 rounded-xl border border-sage/15 bg-white p-4 animate-in slide-in-from-top-2 duration-200 sm:grid-cols-[1fr_1fr_1fr_auto]">
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-sage">Estado exacto</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-sage/20 bg-[#FAFAFA] px-3 py-2 text-sm text-brown focus:border-gold focus:outline-none"
              >
                <option value="">Según la pestaña</option>
                <option value="0">Por cotizar</option>
                <option value="1">Cotización enviada</option>
                <option value="2">Esperando pago</option>
                <option value="3">Pago reportado</option>
                <option value="4">Pago confirmado</option>
                <option value="5">En elaboración</option>
                <option value="6">Listo</option>
                <option value="7">En camino</option>
                <option value="9">Entregado a agencia</option>
                <option value="8">Entregado</option>
                <option value="10">Cancelado</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-sage">
                <Calendar size={10} className="mr-1 inline" />Desde
              </label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full rounded-lg border border-sage/20 bg-[#FAFAFA] px-3 py-2 text-sm text-brown focus:border-gold focus:outline-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-sage">Hasta</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full rounded-lg border border-sage/20 bg-[#FAFAFA] px-3 py-2 text-sm text-brown focus:border-gold focus:outline-none" />
            </div>
            <Button variant="outline" onClick={clearFilters} className="h-[38px] shrink-0 text-xs">Limpiar</Button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} variant="rect" className="h-24 w-full rounded-2xl" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-sage/15 bg-white py-16 text-center">
          <Inbox className="mb-4 h-12 w-12 text-sage/30" />
          <h3 className="text-lg font-medium text-brown">
            {view === 'action' && !debouncedSearch && !hasExtraFilters ? '¡Todo al día!' : 'No encontramos pedidos'}
          </h3>
          <p className="mb-4 mt-1 text-sm text-sage">
            {view === 'action' && !debouncedSearch && !hasExtraFilters
              ? 'No hay pedidos esperando una acción tuya.'
              : 'Prueba con otra pestaña o limpia los filtros.'}
          </p>
          {(debouncedSearch || hasExtraFilters || view !== 'all') && (
            <Button variant="outline" onClick={() => { clearFilters(); setView('all'); }} className="text-sm">Ver todos</Button>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-2.5">
            {items.map(order => <OrderRow key={order.id} order={order} />)}
          </div>

          {pagedResponse && (pagedResponse.totalPages ?? 0) > 1 && (
            <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-sage/10 bg-white p-4 sm:flex-row">
              <div className="flex items-center gap-3 text-sm text-sage">
                <span>Mostrar:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(parseInt(e.target.value, 10))}
                  className="rounded-lg border border-sage/20 bg-cream/30 px-2 py-1 text-sm text-brown outline-none"
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
                <Button variant="outline" className="h-8 px-3 text-xs" disabled={!pagedResponse.hasPreviousPage} onClick={() => setPage(p => Math.max(1, p - 1))}>
                  <ChevronLeft size={14} className="mr-1" /> Anterior
                </Button>
                <Button variant="outline" className="h-8 px-3 text-xs" disabled={!pagedResponse.hasNextPage} onClick={() => setPage(p => p + 1)}>
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
