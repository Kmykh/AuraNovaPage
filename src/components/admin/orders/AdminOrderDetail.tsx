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
import { ConfirmPaymentModal, RejectPaymentModal } from './PaymentReviewModals';
import { WorkshopPreparationCard } from './WorkshopPreparationCard';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

export function AdminOrderDetail({ id }: { id: string }) {
  const { data: order, isLoading, error, refetch } = useAdminOrder(id);

  const confirmPaymentMutation = useConfirmPayment(order?.payment?.id || '', id);
  const rejectPaymentMutation = useRejectPayment(order?.payment?.id || '', id);
  const { mutate: changeStatus } = useChangeOrderStatus(id);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = React.useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = React.useState(false);

  const handleConfirmPayment = () => {
    confirmPaymentMutation.mutate(undefined, {
      onSuccess: () => {
        changeStatus({ status: OrderStatus.PaymentConfirmed }, {
          onSettled: () => {
            setIsConfirmModalOpen(false);
            toast.success('Pago confirmado exitosamente');
            refetch();
          }
        });
      },
      onError: () => {
        toast.error('Error al confirmar el pago');
      }
    });
  };

  const handleRejectPayment = (reason: string) => {
    rejectPaymentMutation.mutate({ notes: reason || 'Comprobante inválido' }, {
      onSuccess: () => {
        setIsRejectModalOpen(false);
        toast.success('Comprobante rechazado');
        refetch();
      },
      onError: () => {
        toast.error('Error al rechazar el comprobante');
      }
    });
  };

  const handleDownloadEvidence = async (url: string) => {
    try {
      const fullUrl = getImageUrl(url);
      const res = await fetch(fullUrl, { mode: 'cors' });
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `Comprobante_${order?.orderCode || 'pago'}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      toast.success('Comprobante descargado');
    } catch {
      window.open(getImageUrl(url), '_blank');
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
                <div className="bg-white p-6 rounded-[24px] shadow-sm border border-[#c8a96b]/35 relative overflow-hidden">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-[#e8dcdc]">
                    <div className="flex items-center gap-2 text-[#4a3933] font-serif font-bold text-lg">
                      <CreditCard size={20} className="text-[#c8a96b]" />
                      <span>Comprobante de Pago Reportado</span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadEvidence(order.payment!.evidenceUrl!)}
                      className="text-xs border-[#c8a96b]/40 text-[#4a3933] hover:bg-[#faf7f2] rounded-full flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-[#c8a96b]" />
                      Descargar Comprobante
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="space-y-3">
                      <div className="bg-[#faf7f2] p-4 rounded-xl border border-[#c8a96b]/20 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-[#887870]">Método de Pago:</span>
                          <strong className="text-[#4a3933]">{order.payment.paymentMethod}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#887870]">Monto Reportado:</span>
                          <strong className="text-[#2d5736] font-serif text-sm">{formatCurrency(order.payment.amount)}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#887870]">Fecha y Hora:</span>
                          <span>{formatDate(order.payment.createdAt)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#887870]">Estado Actual:</span>
                          <span className="font-bold text-[#b58129]">{order.payment.paymentStatus}</span>
                        </div>
                      </div>
                      
                      {(order.status === OrderStatus.PaymentReported || String(order.status) === 'PaymentReported') && order.payment.id && (
                        <div className="flex flex-wrap gap-2.5 pt-2">
                          <Button 
                            onClick={() => setIsConfirmModalOpen(true)} 
                            disabled={confirmPaymentMutation.isPending} 
                            className="bg-[#71a37c] text-white hover:bg-[#588562] py-2 px-4 h-auto text-xs font-bold uppercase tracking-wider rounded-full shadow-sm flex items-center gap-1.5"
                          >
                            <Check size={16} />
                            Verificar y Confirmar Pago
                          </Button>
                          <Button 
                            onClick={() => setIsRejectModalOpen(true)} 
                            disabled={rejectPaymentMutation.isPending} 
                            variant="outline" 
                            className="text-red-500 border-red-200 hover:bg-red-50 py-2 px-4 h-auto text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1.5"
                          >
                            <X size={16} />
                            Rechazar Comprobante
                          </Button>
                        </div>
                      )}
                    </div>
                    <div>
                      <div 
                        className="relative w-full max-w-[280px] h-56 rounded-2xl overflow-hidden border border-[#c8a96b]/30 bg-stone-50 shadow-xs ml-auto group cursor-pointer"
                        onClick={() => setIsConfirmModalOpen(true)}
                        title="Clic para ampliar y verificar"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={getImageUrl(order.payment.evidenceUrl)} 
                          alt="Comprobante de pago" 
                          className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform" 
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold backdrop-blur-xs">
                          Clic para verificar comprobante
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Ficha de Taller de Floristería y Personalización Completa */}
              <WorkshopPreparationCard
                items={order.items}
                orderCode={order.orderCode}
                customerName={order.customer?.name}
                isCustomOrder={order.isCustomOrder}
                customizationNotes={order.customizationNotes}
                referenceImageUrl={order.referenceImageUrl}
              />

              {/* Items Table (Contabilidad y Desglose Financiero) */}
              <div className="bg-white rounded-[24px] shadow-sm border border-sage/10 overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gold/5 to-transparent rounded-bl-full pointer-events-none" />
                <div className="p-6 sm:p-8 pb-4 flex items-center gap-3 text-brown font-bold font-serif text-xl border-b border-sage/10">
                  <span className="w-8 h-8 rounded-full bg-cream/80 flex items-center justify-center">
                    <Package size={16} className="text-gold" />
                  </span>
                  Resumen Financiero del Pedido
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
                          <td className="px-6 sm:px-8 py-4 align-middle">
                            <div className="font-bold text-[#4a3933]">{item.productName}</div>
                          </td>
                          <td className="px-6 py-4 font-medium align-middle">{item.quantity}</td>
                          <td className="px-6 py-4 text-right align-middle">{formatCurrency(item.unitPrice)}</td>
                          <td className="px-6 sm:px-8 py-4 text-right font-bold text-[#4a3933] align-middle">{formatCurrency(item.subtotal)}</td>
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
        </div>
      </div>

      {/* Modales de Confirmación y Rechazo de Pago */}
      <ConfirmPaymentModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmPayment}
        isPending={confirmPaymentMutation.isPending}
        orderCode={order.orderCode}
        orderTotal={order.total}
        paymentAmount={order.payment?.amount}
        paymentMethod={order.payment?.paymentMethod}
        evidenceUrl={order.payment?.evidenceUrl}
        customerName={order.customer?.name}
      />

      <RejectPaymentModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onReject={handleRejectPayment}
        isPending={rejectPaymentMutation.isPending}
        orderCode={order.orderCode}
      />
    </div>
  );
}
