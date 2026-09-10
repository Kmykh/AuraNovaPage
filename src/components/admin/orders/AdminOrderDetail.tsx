"use client";

import React from 'react';
import Link from 'next/link';
import { useAdminOrder, useChangeOrderStatus } from '@/hooks/use-admin-orders';
import { getOrderStatusInfo, getDeliveryTypeLabel, formatDate } from '@/lib/order-helpers';
import { formatCurrency, getImageUrl } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { AlertCircle, ArrowLeft, User, Truck, Package, ExternalLink, CreditCard, Check, X } from 'lucide-react';
import { ApiProblemDetails } from '@/lib/api-errors';
import { DeliveryType, OrderStatus } from '@/types/enums';

import { OrderStatusChangeForm } from './OrderStatusChangeForm';
import { OrderStatusHistory } from './OrderStatusHistory';
import { OrderNotifications } from './OrderNotifications';
import { OrderTimeline } from './OrderTimeline';
import { OrderActions } from './OrderActions';
import { useConfirmPayment, useRejectPayment } from '@/hooks/use-admin-payments';

export function AdminOrderDetail({ id }: { id: string }) {
  const { data: order, isLoading, error, refetch } = useAdminOrder(id);

  const confirmPaymentMutation = useConfirmPayment(order?.payment?.id || '', id);
  const rejectPaymentMutation = useRejectPayment(order?.payment?.id || '', id);
  const { mutate: changeStatus } = useChangeOrderStatus(id);

  const handleConfirmPayment = () => {
    if (confirm('¿Confirmar este pago?')) {
      confirmPaymentMutation.mutate(undefined, {
        onSuccess: () => {
          changeStatus({ status: OrderStatus.PaymentConfirmed }, {
            onSettled: () => refetch()
          });
        }
      });
    }
  };

  const handleRejectPayment = () => {
    const reason = prompt('Motivo del rechazo:');
    if (reason !== null) {
      rejectPaymentMutation.mutate({ notes: reason || 'Comprobante inválido' }, {
        onSuccess: () => refetch()
      });
    }
  };

  const [activeTab, setActiveTab] = React.useState<'detalle' | 'auditoria'>('detalle');

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

  const statusInfo = getOrderStatusInfo(order.status, order.deliveryType);

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 bg-white p-6 rounded-[24px] shadow-sm border border-sage/10">
        <Link href="/admin/pedidos" className="w-10 h-10 rounded-full bg-cream/50 flex items-center justify-center text-sage hover:bg-gold/10 hover:text-gold transition-colors shrink-0">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-brown">Pedido <span className="text-gold">{order.orderCode}</span></h1>
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-${statusInfo.color}/10 text-${statusInfo.color} border border-${statusInfo.color}/20`}>
              {statusInfo.label}
            </span>
            {order.isCustomOrder && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-gold/10 text-gold border border-gold/20">
                ✨ Personalizado
              </span>
            )}
            {order.deliveryType === DeliveryType.Delivery && (
              <span className="inline-flex items-center text-[10px] uppercase tracking-widest font-bold bg-brown/5 text-brown px-3 py-1.5 rounded-full border border-brown/10">Delivery Local</span>
            )}
            {order.deliveryType === DeliveryType.MeetingPoint && (
              <span className="inline-flex items-center text-[10px] uppercase tracking-widest font-bold bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full border border-emerald-100">Punto de Encuentro</span>
            )}
            {order.deliveryType === DeliveryType.NationalShipping && (
              <span className="inline-flex items-center text-[10px] uppercase tracking-widest font-bold bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full border border-indigo-100">Envío Nacional</span>
            )}
          </div>
          <p className="text-sm text-sage mt-2 flex items-center gap-2">
            <span>Creado el {formatDate(order.createdAt)}</span>
            <span className="w-1 h-1 rounded-full bg-sage/30" />
            <span>{getDeliveryTypeLabel(order.deliveryType)}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Columna Principal */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Tabs Navigation */}
          <div className="flex gap-2 p-1.5 bg-[#FAFAFA] rounded-xl border border-sage/10 w-fit mb-2">
            <button
              onClick={() => setActiveTab('detalle')}
              className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
                activeTab === 'detalle' 
                  ? 'bg-white shadow-sm text-brown font-bold' 
                  : 'text-sage hover:text-brown'
              }`}
            >
              Proceso del Pedido
            </button>
            <button
              onClick={() => setActiveTab('auditoria')}
              className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
                activeTab === 'auditoria' 
                  ? 'bg-white shadow-sm text-brown font-bold' 
                  : 'text-sage hover:text-brown'
              }`}
            >
              Auditoría y Trazabilidad
            </button>
          </div>

          {activeTab === 'detalle' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <OrderTimeline order={order} />
              
              {/* Tarjetas de Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-[24px] shadow-sm border border-sage/10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gold/5 to-transparent rounded-bl-full pointer-events-none" />
                  <div className="flex items-center gap-3 mb-6 text-brown font-bold font-serif text-lg">
                    <span className="w-8 h-8 rounded-full bg-cream/80 flex items-center justify-center">
                      <User size={16} className="text-gold" />
                    </span>
                    Cliente
                  </div>
                  <div className="space-y-4 text-sm text-sage">
                    <p><span className="block text-[10px] uppercase tracking-widest font-bold text-brown mb-1">Nombre</span> {order.customer?.name}</p>
                    <p><span className="block text-[10px] uppercase tracking-widest font-bold text-brown mb-1">Teléfono</span> {order.customer?.phone}</p>
                    <p><span className="block text-[10px] uppercase tracking-widest font-bold text-brown mb-1">Email</span> {order.customer?.email || 'No proporcionado'}</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-[24px] shadow-sm border border-sage/10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gold/5 to-transparent rounded-bl-full pointer-events-none" />
                  <div className="flex items-center gap-3 mb-6 text-brown font-bold font-serif text-lg">
                    <span className="w-8 h-8 rounded-full bg-cream/80 flex items-center justify-center">
                      <Truck size={16} className="text-gold" />
                    </span>
                    Entrega
                  </div>
                  <div className="space-y-4 text-sm text-sage">
                    <p><span className="block text-[10px] uppercase tracking-widest font-bold text-brown mb-1">Tipo de entrega</span> {getDeliveryTypeLabel(order.deliveryType)}</p>
                    {order.delivery?.meetingPoint && <p><span className="block text-[10px] uppercase tracking-widest font-bold text-brown mb-1">Punto de Encuentro</span> {order.delivery.meetingPoint}</p>}
                    {order.delivery?.deliveryZone && <p><span className="block text-[10px] uppercase tracking-widest font-bold text-brown mb-1">Zona</span> {order.delivery.deliveryZone}</p>}
                    {order.delivery?.district && <p><span className="block text-[10px] uppercase tracking-widest font-bold text-brown mb-1">Distrito / Ciudad</span> {order.delivery.district}</p>}
                    {order.delivery?.deliveryAddress && <p><span className="block text-[10px] uppercase tracking-widest font-bold text-brown mb-1">Dirección Exacta</span> {order.delivery.deliveryAddress}</p>}

                    {order.deliveryType === DeliveryType.NationalShipping && order.deliveryCost === null && (
                      <p className="text-gold font-medium mt-2">El costo del envío es pagado por el destinatario según la tarifa de la agencia.</p>
                    )}
                  </div>
                </div>

                {order.deliveryType === DeliveryType.NationalShipping && order.shippingProvider && (
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gold/30">
                    <div className="flex items-center gap-2 mb-4 text-brown font-medium">
                      <Package size={18} className="text-gold" /> Datos de Agencia
                    </div>
                    <div className="space-y-2 text-sm text-sage">
                      <p><span className="font-medium text-brown">Proveedor:</span> {order.shippingProvider}</p>
                      <p><span className="font-medium text-brown">Tracking:</span> {order.shippingTrackingCode}</p>
                      {order.shippingProofUrl && (
                        <p>
                          <a href={order.shippingProofUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-gold hover:underline">
                            Ver constancia de entrega <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Pago Evidencia */}
              {order.payment && order.payment.evidenceUrl && (
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#c8a96b]/30">
                  <div className="flex items-center gap-2 mb-4 text-[#c8a96b] font-medium">
                    <CreditCard size={18} /> Comprobante de Pago
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="text-sm text-sage">
                        <p><span className="font-medium text-brown">Método:</span> {order.payment.paymentMethod}</p>
                        <p><span className="font-medium text-brown">Monto:</span> {formatCurrency(order.payment.amount)}</p>
                        <p><span className="font-medium text-brown">Fecha reporte:</span> {formatDate(order.payment.createdAt)}</p>
                        <p><span className="font-medium text-brown">Estado de Pago:</span> {order.payment.paymentStatus}</p>
                      </div>
                      
                      {(order.status === OrderStatus.PaymentReported || String(order.status) === 'PaymentReported') && order.payment.id && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          <Button onClick={handleConfirmPayment} disabled={confirmPaymentMutation.isPending} className="bg-sage text-white hover:bg-sage/90 py-1.5 px-3 h-auto text-sm">
                            <Check size={16} className="mr-1.5" />
                            Confirmar Pago
                          </Button>
                          <Button onClick={handleRejectPayment} disabled={rejectPaymentMutation.isPending} variant="outline" className="text-red-500 border-red-200 hover:bg-red-50 py-1.5 px-3 h-auto text-sm">
                            <X size={16} className="mr-1.5" />
                            Rechazar
                          </Button>
                        </div>
                      )}
                    </div>
                    <div>
                      <a href={getImageUrl(order.payment.evidenceUrl)} target="_blank" rel="noopener noreferrer" className="block w-full max-w-[250px] rounded-lg overflow-hidden border border-sage/20 hover:opacity-90 transition-opacity ml-auto">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={getImageUrl(order.payment.evidenceUrl)} alt="Comprobante de pago" className="w-full h-auto object-cover" />
                      </a>
                    </div>
                  </div>
                </div>
              )}

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
              <div className="bg-white rounded-[24px] shadow-sm border border-sage/10 overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gold/5 to-transparent rounded-bl-full pointer-events-none" />
                <div className="p-6 sm:p-8 pb-4 flex items-center gap-3 text-brown font-bold font-serif text-xl border-b border-sage/10">
                  <span className="w-8 h-8 rounded-full bg-cream/80 flex items-center justify-center">
                    <Package size={16} className="text-gold" />
                  </span>
                  Productos del Pedido
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-brown">
                    <thead className="bg-[#FAFAFA] text-sage/70 border-b border-sage/10 text-xs uppercase tracking-widest">
                      <tr>
                        <th className="px-6 sm:px-8 py-4 font-bold">Producto</th>
                        <th className="px-6 py-4 font-bold">Cant.</th>
                        <th className="px-6 py-4 font-bold text-right">Precio Unit.</th>
                        <th className="px-6 sm:px-8 py-4 font-bold text-right">Subtotal</th>
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
                                      &quot;{item.phraseText}&quot;
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
                <div className="p-6 sm:p-8 bg-gradient-to-t from-[#FAFAFA] to-white flex flex-col items-end gap-3 text-sm">
                  <div className="flex justify-between w-56 text-sage">
                    <span>Subtotal items:</span>
                    <span className="font-medium text-brown">{order.subtotal !== null ? formatCurrency(order.subtotal) : '-'}</span>
                  </div>
                  <div className="flex justify-between w-56 text-sage">
                    <span>Envío:</span>
                    <span className="font-medium text-brown">{order.deliveryType === DeliveryType.NationalShipping ? 'Pago en destino' : order.deliveryCost !== null ? formatCurrency(order.deliveryCost) : 'Por cotizar'}</span>
                  </div>
                  {order.isCustomOrder && order.customizationCost !== undefined && order.customizationCost !== null && (
                    <div className="flex justify-between w-56 text-sage">
                      <span>Personalización:</span>
                      <span className="font-medium text-brown">{formatCurrency(order.customizationCost)}</span>
                    </div>
                  )}
                  <div className="flex justify-between w-56 text-brown font-bold text-xl font-serif pt-4 mt-2 border-t border-sage/20">
                    <span>Total:</span>
                    <span className="text-gold">{order.total !== null ? formatCurrency(order.total) : 'Por cotizar'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'auditoria' && (
            <div className="animate-in fade-in duration-300">
              <OrderStatusHistory orderId={id} deliveryType={order.deliveryType} />
            </div>
          )}

        </div>

        {/* Columna Lateral (Máquina de estados y Acciones) */}
        <div className="space-y-6">
          <OrderActions order={order} />
          
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
