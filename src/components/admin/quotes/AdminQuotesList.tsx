"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useAdminQuotes } from '@/hooks/use-admin-quotes';
import { getQuoteStatusInfo } from '@/lib/quote-helpers';
import { formatDate } from '@/lib/order-helpers';
import { formatCurrency } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, ChevronRight, AlertCircle, Inbox } from 'lucide-react';
import { ApiProblemDetails } from '@/lib/api-errors';
import { DeliveryType } from '@/types/enums';

export function AdminQuotesList() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { data: quotesArray, isLoading, error, refetch } = useAdminQuotes();

  const totalItems = quotesArray?.length || 0;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedQuotes = quotesArray?.slice((page - 1) * pageSize, page * pageSize) || [];

  if (error) {
    const isForbidden = error instanceof ApiProblemDetails && error.status === 403;
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-sage/20 shadow-sm">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <h2 className="text-xl font-serif text-brown font-semibold mb-2">
          {isForbidden ? 'Acceso denegado' : 'Error al cargar'}
        </h2>
        <p className="text-sage max-w-md mb-6">
          {isForbidden ? 'No tienes permisos para ver las cotizaciones.' : 'No pudimos comunicarnos con Aura Nova.'}
        </p>
        <Button onClick={() => refetch()} variant="outline">Reintentar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-sage/10 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => <Skeleton key={i} variant="rect" className="w-full h-16 rounded-xl" />)}
          </div>
        ) : (paginatedQuotes.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Inbox className="w-12 h-12 text-sage/40 mb-4" />
            <h3 className="text-lg font-medium text-brown">No hay cotizaciones pendientes</h3>
            <p className="text-sage mt-1 mb-4">No se han generado pedidos para cotizar envíos nacionales.</p>
          </div>
        ) : (
          <>
            {/* Mobile View */}
            <div className="grid grid-cols-1 md:hidden divide-y divide-sage/10">
              {paginatedQuotes.map((quote) => {
                const statusInfo = getQuoteStatusInfo(quote.status);
                return (
                  <div key={quote.quoteId} className="p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-brown">{quote.orderCode}</p>
                          {quote.deliveryType === 'Delivery' && (
                            <span className="text-[9px] uppercase tracking-wider font-bold bg-[#c8a96b]/10 text-[#c8a96b] px-1.5 py-0.5 rounded-sm border border-[#c8a96b]/20">Delivery</span>
                          )}
                          {quote.deliveryType === 'MeetingPoint' && (
                            <span className="text-[9px] uppercase tracking-wider font-bold bg-[#71a37c]/10 text-[#71a37c] px-1.5 py-0.5 rounded-sm border border-[#71a37c]/20">Punto de Enc.</span>
                          )}
                          {quote.deliveryType === 'NationalShipping' && (
                            <span className="text-[9px] uppercase tracking-wider font-bold bg-[#d38b8b]/10 text-[#d38b8b] px-1.5 py-0.5 rounded-sm border border-[#d38b8b]/20">Nacional</span>
                          )}
                        </div>
                        <span className="text-xs text-sage">{formatDate(quote.createdAt)}</span>
                      </div>
                      <p className="font-semibold text-brown">
                        {quote.shippingCost !== null ? formatCurrency(quote.shippingCost) : '---'}
                      </p>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-${statusInfo.color}/10 text-${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <Link href={`/admin/cotizaciones/${quote.quoteId}`}>
                      <Button variant="outline" className="w-full mt-2 h-9">Cotizar / Revisar</Button>
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
                    <th className="px-6 py-4 font-medium">Pedido</th>
                    <th className="px-6 py-4 font-medium">Estado</th>
                    <th className="px-6 py-4 font-medium">Costo Estimado</th>
                    <th className="px-6 py-4 font-medium">Fecha</th>
                    <th className="px-6 py-4 font-medium text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sage/10">
                  {paginatedQuotes.map((quote) => {
                    const statusInfo = getQuoteStatusInfo(quote.status);
                    return (
                      <tr key={quote.quoteId} className="hover:bg-[#FAFAFA] transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-brown mb-1">{quote.orderCode}</div>
                          <div className="flex flex-col gap-1.5">
                            {quote.deliveryType === 'Delivery' && (
                              <span className="inline-flex w-fit items-center text-[10px] uppercase tracking-wider font-bold bg-[#c8a96b]/10 text-[#c8a96b] px-2 py-1 rounded-sm border border-[#c8a96b]/20">Delivery Local</span>
                            )}
                            {quote.deliveryType === 'MeetingPoint' && (
                              <span className="inline-flex w-fit items-center text-[10px] uppercase tracking-wider font-bold bg-[#71a37c]/10 text-[#71a37c] px-2 py-1 rounded-sm border border-[#71a37c]/20">Punto de Encuentro</span>
                            )}
                            {quote.deliveryType === 'NationalShipping' && (
                              <span className="inline-flex w-fit items-center text-[10px] uppercase tracking-wider font-bold bg-[#d38b8b]/10 text-[#d38b8b] px-2 py-1 rounded-sm border border-[#d38b8b]/20">Envío Nacional</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-${statusInfo.color}/10 text-${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium">
                          {quote.shippingCost !== null ? formatCurrency(quote.shippingCost) : '---'}
                        </td>
                        <td className="px-6 py-4 text-sage">{formatDate(quote.createdAt)}</td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/admin/cotizaciones/${quote.quoteId}`}>
                            <Button variant="outline" className="h-8 px-4 text-xs">Revisar</Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-sage/10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#FAFAFA]">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-sage">Mostrar:</span>
                  <select 
                    value={pageSize} 
                    onChange={(e) => {
                      setPageSize(parseInt(e.target.value, 10));
                      setPage(1);
                    }}
                    className="bg-white border border-sage/20 rounded-lg px-2 py-1 text-sm outline-none"
                  >
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                  </select>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-sage">
                    Página {page} de {totalPages} ({totalItems} en total)
                  </span>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="h-8 w-8 p-0" 
                      disabled={page <= 1}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                    >
                      <ChevronLeft size={16} />
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-8 w-8 p-0" 
                      disabled={page >= totalPages}
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
