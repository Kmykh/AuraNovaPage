"use client";

import React from 'react';
import Link from 'next/link';
import { useAdminOrder } from '@/hooks/use-admin-orders';
import { getOrderStatusInfo, getDeliveryTypeLabel, formatDate } from '@/lib/order-helpers';
import { formatCurrency } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { AlertCircle, ArrowLeft, User, Truck, Package } from 'lucide-react';
import { ApiProblemDetails } from '@/lib/api-errors';
import { DeliveryType } from '@/types/enums';

import { OrderStatusChangeForm } from './OrderStatusChangeForm';
import { OrderStatusHistory } from './OrderStatusHistory';
import { OrderNotifications } from './OrderNotifications';

export function AdminOrderDetail({ id }: { id: string }) {
  const { data: order, isLoading, error, refetch } = useAdminOrder(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="rect" className="w-full h-24 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton variant="rect" className="w-full h-64 rounded-2xl" />
            <Skeleton variant="rect" className="w-full h-64 rounded-2xl" />
          </div>
          <div className="space-y-6">
            <Skeleton variant="rect" className="w-full h-48 rounded-2xl" />
            <Skeleton variant="rect" className="w-full h-48 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    const isNotFound = error instanceof ApiProblemDetails && error.status === 404;
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-sage/20 shadow-sm max-w-2xl mx-auto">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <h2 className="text-xl font-serif text-brown font-semibold mb-2">
          {isNotFound ? 'Pedido no encontrado' : 'Error al cargar'}
        </h2>
        <p className="text-sage max-w-md mb-6">
          {isNotFound ? 'El pedido que buscas no existe en el sistema.' : 'Ocurrió un error de conexión.'}
        </p>
        <div className="flex gap-3">
          <Link href="/admin/pedidos">
            <Button variant="outline">Volver a pedidos</Button>
          </Link>
          {!isNotFound && <Button onClick={() => refetch()}>Reintentar</Button>}
        </div>
      </div>
    );
  }

  const statusInfo = getOrderStatusInfo(order.status);

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/pedidos" className="text-sage hover:text-brown transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-serif font-bold text-brown">Pedido {order.orderCode}</h1>
            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-${statusInfo.color}/10 text-${statusInfo.color}`}>
              {statusInfo.label}
            </span>
            {order.isCustomOrder && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-[#c8a96b]/10 text-[#c8a96b]">
                Personalizado
              </span>
            )}
            {order.deliveryType === DeliveryType.Delivery && (
              <span className="inline-flex items-center text-[10px] uppercase tracking-wider font-bold bg-[#c8a96b]/10 text-[#c8a96b] px-2 py-1 rounded-sm border border-[#c8a96b]/20">Delivery Local</span>
            )}
            {order.deliveryType === DeliveryType.MeetingPoint && (
              <span className="inline-flex items-center text-[10px] uppercase tracking-wider font-bold bg-[#71a37c]/10 text-[#71a37c] px-2 py-1 rounded-sm border border-[#71a37c]/20">Punto de Encuentro</span>
            )}
            {order.deliveryType === DeliveryType.NationalShipping && (
              <span className="inline-flex items-center text-[10px] uppercase tracking-wider font-bold bg-[#d38b8b]/10 text-[#d38b8b] px-2 py-1 rounded-sm border border-[#d38b8b]/20">Envío Nacional</span>
            )}
          </div>
          <p className="text-sm text-sage mt-1">
            Creado el {formatDate(order.createdAt)} • {getDeliveryTypeLabel(order.deliveryType)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Columna Principal */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tarjetas de Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-sage/10">
              <div className="flex items-center gap-2 mb-4 text-brown font-medium">
                <User size={18} /> Cliente
              </div>
              <div className="space-y-2 text-sm text-sage">
                <p><span className="font-medium text-brown">Nombre:</span> {order.customer?.name}</p>
                <p><span className="font-medium text-brown">Teléfono:</span> {order.customer?.phone}</p>
                <p><span className="font-medium text-brown">Email:</span> {order.customer?.email || 'No proporcionado'}</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-sage/10">
              <div className="flex items-center gap-2 mb-4 text-brown font-medium">
                <Truck size={18} /> Entrega
              </div>
              <div className="space-y-2 text-sm text-sage">
                <p><span className="font-medium text-brown">Tipo:</span> {getDeliveryTypeLabel(order.deliveryType)}</p>
                {order.delivery?.meetingPoint && <p><span className="font-medium text-brown">Punto:</span> {order.delivery.meetingPoint}</p>}
                {order.delivery?.deliveryZone && <p><span className="font-medium text-brown">Zona:</span> {order.delivery.deliveryZone}</p>}
                {order.delivery?.district && <p><span className="font-medium text-brown">Distrito/Destino:</span> {order.delivery.district}</p>}
                {order.delivery?.deliveryAddress && <p><span className="font-medium text-brown">Dirección:</span> {order.delivery.deliveryAddress}</p>}
              </div>
            </div>
          </div>

          {/* Pedido Personalizado Info */}
          {order.isCustomOrder && (
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#c8a96b]/30">
              <div className="flex items-center gap-2 mb-4 text-[#c8a96b] font-medium">
                <AlertCircle size={18} /> Detalles del Pedido Personalizado
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 text-sm text-sage">
                  <p className="font-medium text-brown mb-1">Notas del cliente:</p>
                  <div className="bg-[#faf7f2] p-3 rounded-lg whitespace-pre-wrap text-[#887870]">
                    {order.customizationNotes || 'Sin notas.'}
                  </div>
                </div>
                {order.referenceImageUrl && (
                  <div className="space-y-2 text-sm text-sage">
                    <p className="font-medium text-brown mb-1">Imagen de Referencia:</p>
                    <a href={order.referenceImageUrl} target="_blank" rel="noopener noreferrer" className="block w-full max-w-[200px] rounded-lg overflow-hidden border border-[#d38b8b]/30 hover:opacity-90 transition-opacity">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={order.referenceImageUrl} alt="Referencia" className="w-full h-auto object-cover" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Items */}
          <div className="bg-white rounded-2xl shadow-sm border border-sage/10 overflow-hidden">
            <div className="p-5 border-b border-sage/10 flex items-center gap-2 text-brown font-medium">
              <Package size={18} /> Productos
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-brown">
                <thead className="bg-cream/30 text-sage border-b border-sage/10">
                  <tr>
                    <th className="px-5 py-3 font-medium">Producto</th>
                    <th className="px-5 py-3 font-medium">Cant.</th>
                    <th className="px-5 py-3 font-medium text-right">Precio Unit.</th>
                    <th className="px-5 py-3 font-medium text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sage/10">
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#FAFAFA]">
                      <td className="px-5 py-3 align-top">
                        <div className="font-medium mb-1">{item.productName}</div>
                        {(item.selectedPrimaryColor || item.selectedSecondaryColor || item.selectedFlowerType || item.selectedFlowerColor || item.hasLights || item.hasButterfly || item.hasPhraseCard) && (
                          <div className="mt-3 flex flex-col gap-1.5 pl-3 border-l-[3px] border-[#c8a96b]/40">
                            <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#c8a96b] mb-0.5 flex items-center gap-1.5">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                              El cliente personalizó:
                            </div>
                            {item.selectedPrimaryColor && <div className="text-[11px] text-sage"><span className="font-semibold text-brown mr-1">Color Principal:</span> {item.selectedPrimaryColor}</div>}
                            {item.selectedSecondaryColor && <div className="text-[11px] text-sage"><span className="font-semibold text-brown mr-1">Color Secundario:</span> {item.selectedSecondaryColor}</div>}
                            {item.selectedFlowerType && <div className="text-[11px] text-sage"><span className="font-semibold text-brown mr-1">Flor:</span> {item.selectedFlowerType} {item.selectedFlowerColor ? <span className="italic opacity-80">({item.selectedFlowerColor})</span> : ''}</div>}
                            {(item.hasLights || item.hasButterfly) && (
                               <div className="text-[11px] text-sage"><span className="font-semibold text-brown mr-1">Extras:</span> {[item.hasLights && 'Luces', item.hasButterfly && 'Mariposa'].filter(Boolean).join(', ')}</div>
                            )}
                            {item.hasPhraseCard && (
                              <div className="mt-1.5 flex flex-col gap-1.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] font-semibold text-brown flex items-center gap-1">
                                    <svg className="w-3 h-3 text-[#c8a96b]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    Tarjeta Dedicatoria
                                  </span>
                                  <span className="text-[9px] uppercase tracking-wider text-[#c8a96b] bg-[#c8a96b]/10 px-2 py-0.5 rounded-full font-medium">{item.phraseFont}</span>
                                </div>
                                <div className="text-sm italic font-serif text-brown/90 leading-relaxed bg-[#faf7f2]/50 px-3 py-2 rounded-lg border border-sage/5">
                                  "{item.phraseText}"
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3 font-medium align-top pt-4">{item.quantity}</td>
                      <td className="px-5 py-3 text-right align-top pt-4">{formatCurrency(item.unitPrice)}</td>
                      <td className="px-5 py-3 text-right font-medium align-top pt-4">{formatCurrency(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-5 bg-[#FAFAFA] flex flex-col items-end gap-2 text-sm">
              <div className="flex justify-between w-48 text-sage">
                <span>Subtotal items:</span>
                <span>{order.subtotal !== null ? formatCurrency(order.subtotal) : '-'}</span>
              </div>
              <div className="flex justify-between w-48 text-sage">
                <span>Envío:</span>
                <span>{order.deliveryCost !== null ? formatCurrency(order.deliveryCost) : 'Por cotizar'}</span>
              </div>
              {order.isCustomOrder && order.customizationCost !== undefined && order.customizationCost !== null && (
                <div className="flex justify-between w-48 text-sage">
                  <span>Personalización:</span>
                  <span>{formatCurrency(order.customizationCost)}</span>
                </div>
              )}
              <div className="flex justify-between w-48 text-brown font-semibold text-base pt-2 border-t border-sage/20">
                <span>Total:</span>
                <span>{order.total !== null ? formatCurrency(order.total) : 'Por cotizar'}</span>
              </div>
            </div>
          </div>

          <OrderStatusHistory orderId={id} />

        </div>

        {/* Columna Lateral (Máquina de estados y Acciones) */}
        <div className="space-y-6">
          <OrderStatusChangeForm 
            orderId={id} 
            currentStatus={order.status} 
            deliveryType={order.deliveryType} 
            customerName={order.customer?.name}
            customerPhone={order.customer?.phone}
            orderCode={order.orderCode}
          />
          
          <OrderNotifications orderId={id} />

          {/* Tarjeta Informativa de Tracking Opcional */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-sage/10">
             <h3 className="font-serif text-lg text-brown font-semibold mb-2">Token de rastreo</h3>
             <p className="text-xs text-sage mb-4">Uso exclusivo para el portal público. No compartir públicamente fuera de la comunicación con el cliente.</p>
             <div className="p-3 bg-cream/30 rounded-lg text-xs font-mono text-brown break-all">
               {order.trackingToken}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
