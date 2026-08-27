"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAdminPayments } from '@/hooks/use-admin-payments';
import { getPaymentStatusInfo, getPaymentMethodLabel } from '@/lib/payment-helpers';
import { formatDate } from '@/lib/order-helpers';
import { formatCurrency } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { AlertCircle, Inbox, Clock, Filter } from 'lucide-react';
import { ApiProblemDetails } from '@/lib/api-errors';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export function AdminPaymentsList() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: pagedResponse, isLoading, error, refetch } = useAdminPayments({ page, pageSize });

  if (error) {
    const isForbidden = error instanceof ApiProblemDetails && error.status === 403;
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-sage/20 shadow-sm">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <h2 className="text-xl font-serif text-brown font-semibold mb-2">
          {isForbidden ? 'Acceso denegado' : 'Error al cargar'}
        </h2>
        <p className="text-sage max-w-md mb-6">
          {isForbidden ? 'No tienes permisos para ver los pagos.' : 'No pudimos comunicarnos con Aura Nova.'}
        </p>
        <Button onClick={() => refetch()} variant="outline">Reintentar</Button>
      </div>
    );
  }

  const allItems = Array.isArray(pagedResponse) ? pagedResponse : [];
  
  // Filter items
  const items = useMemo(() => {
    if (statusFilter === 'all') return allItems;
    return allItems.filter(item => {
      // payment.status can be number or string enum
      return item.status === statusFilter || item.status === parseInt(statusFilter) || (item.status?.toString().toLowerCase() === statusFilter.toLowerCase());
    });
  }, [allItems, statusFilter]);

  const hasItems = items.length > 0;
  const totalItems = items.length;

  return (
    <div className="bg-white rounded-2xl border border-sage/20 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-sage/10 bg-sage/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="font-medium text-brown flex items-center gap-2">
          {isLoading ? (
            <Skeleton variant="text" className="w-48 h-6" />
          ) : (
            <>
              Listado de Pagos
              <span className="bg-white px-2 py-0.5 rounded-full text-xs font-semibold text-sage border border-sage/20">
                {totalItems}
              </span>
            </>
          )}
        </h2>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={16} className="text-sage" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto text-sm border-sage/20 bg-white rounded-lg focus:ring-1 focus:ring-sage/50 outline-none px-3 py-1.5"
          >
            <option value="all">Todos los estados</option>
            <option value="Reported">Pendientes de revisión</option>
            <option value="Confirmed">Confirmados</option>
            <option value="Rejected">Rechazados</option>
          </select>
        </div>
      </div>

      <div className="min-h-[400px]">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => <Skeleton key={i} variant="rect" className="w-full h-16 rounded-xl" />)}
          </div>
        ) : !hasItems ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Inbox className="w-12 h-12 text-sage/40 mb-4" />
            <h3 className="text-lg font-medium text-brown">No hay pagos</h3>
            <p className="text-sage mt-1 mb-4">No se encontraron pagos con ese estado.</p>
          </div>
        ) : (
          <>
            {/* Mobile View */}
            <div className="grid grid-cols-1 md:hidden divide-y divide-sage/10">
              {items.map((payment) => {
                const statusInfo = getPaymentStatusInfo(payment.status);
                const paymentId = payment.id;
                const orderCode = payment.orderCode;
                const customerName = payment.customerName;
                const amount = payment.amount;
                const createdAt = payment.createdAt;

                return (
                  <div key={paymentId} className="p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-brown">{orderCode}</p>
                        <p className="text-sm text-sage">{customerName}</p>
                      </div>
                      <p className="font-semibold text-brown">{formatCurrency(amount)}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-${statusInfo.color}/10 text-${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                      <span className="text-xs text-sage flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: es })}
                      </span>
                    </div>

                    <Link href={`/admin/pagos/${paymentId}`}>
                      <Button variant="outline" className="w-full mt-2 h-9">Ver detalle</Button>
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-sage/5 border-y border-sage/10 text-sm font-medium text-sage">
                    <th className="py-3 px-6 whitespace-nowrap">Pedido</th>
                    <th className="py-3 px-6 whitespace-nowrap">Cliente</th>
                    <th className="py-3 px-6 whitespace-nowrap text-right">Monto</th>
                    <th className="py-3 px-6 whitespace-nowrap text-center">Estado</th>
                    <th className="py-3 px-6 whitespace-nowrap">Fecha</th>
                    <th className="py-3 px-6 whitespace-nowrap text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sage/10 text-sm">
                  {items.map((payment) => {
                    const statusInfo = getPaymentStatusInfo(payment.status);
                    const paymentId = payment.id;
                    const orderCode = payment.orderCode;
                    const customerName = payment.customerName;
                    const amount = payment.amount;
                    const createdAt = payment.createdAt;

                    return (
                      <tr key={paymentId} className="hover:bg-cream/20 transition-colors">
                        <td className="py-4 px-6 font-medium text-brown">{orderCode}</td>
                        <td className="py-4 px-6 text-sage">{customerName}</td>
                        <td className="py-4 px-6 text-right font-medium text-brown">
                          {formatCurrency(amount)}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-${statusInfo.color}/10 text-${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sage whitespace-nowrap">
                          {formatDate(createdAt)}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Link href={`/admin/pagos/${paymentId}`}>
                            <Button variant="outline" size="sm">Ver detalle</Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
