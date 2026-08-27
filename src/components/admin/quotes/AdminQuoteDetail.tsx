"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAdminQuote, useUpdateQuote } from '@/hooks/use-admin-quotes';
import { useAdminOrder, useOrderNotifications, useChangeOrderStatus } from '@/hooks/use-admin-orders';
import { getQuoteStatusInfo } from '@/lib/quote-helpers';
import { formatDate } from '@/lib/order-helpers';
import { formatCurrency } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { WhatsAppFallbackButton } from '@/components/shared/WhatsAppFallbackButton';
import { ArrowLeft, AlertCircle, Calculator, CheckCircle, Package, MapPin } from 'lucide-react';
import { ApiProblemDetails } from '@/lib/api-errors';
import { DeliveryType } from '@/types/enums';

export function AdminQuoteDetail({ id }: { id: string }) {
  const router = useRouter();
  const { data: quote, isLoading, error, refetch } = useAdminQuote(id);
  const actualOrderId = quote?.orderId || quote?.orderCode || '';
  const { data: order, isLoading: isOrderLoading } = useAdminOrder(actualOrderId);
  const { data: notifications } = useOrderNotifications(actualOrderId);
  const { mutate: changeStatus } = useChangeOrderStatus(actualOrderId);
  
  const [shippingCost, setShippingCost] = useState('');
  const [customizationCost, setCustomizationCost] = useState('');
  const [notes, setNotes] = useState('');
  const [initialized, setInitialized] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const orderId = quote?.orderCode || ''; // En un DTO más avanzado podría ser quote.orderId si existe. Asumimos fallback si no está explícito en el response original.
  const { mutate: updateQuote, isPending } = useUpdateQuote(id, orderId);

  if (quote && !initialized) {
    setShippingCost(quote.shippingCost !== null ? quote.shippingCost.toString() : '');
    setCustomizationCost(quote.customizationCost !== null && quote.customizationCost !== undefined ? quote.customizationCost.toString() : '');
    setNotes(quote.notes || '');
    setInitialized(true);
  }

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <Skeleton variant="rect" className="w-full h-32 rounded-2xl" />
        <Skeleton variant="rect" className="w-full h-96 rounded-2xl" />
      </div>
    );
  }

  if (error || !quote) {
    const isNotFound = error instanceof ApiProblemDetails && error.status === 404;
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-sage/20 shadow-sm max-w-2xl mx-auto">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <h2 className="text-xl font-serif text-brown font-semibold mb-2">
          {isNotFound ? 'Cotización no encontrada' : 'Error al cargar'}
        </h2>
        <p className="text-sage max-w-md mb-6">
          {isNotFound ? 'La cotización que buscas no existe en el sistema.' : 'Ocurrió un error de conexión.'}
        </p>
        <div className="flex gap-3">
          <Link href="/admin/cotizaciones">
            <Button variant="outline">Volver a cotizaciones</Button>
          </Link>
          {!isNotFound && <Button onClick={() => refetch()}>Reintentar</Button>}
        </div>
      </div>
    );
  }

  const statusInfo = getQuoteStatusInfo(quote.status);
  const isPendingQuote = quote.status === 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // If not national shipping, we send 0 and backend will preserve the original delivery cost.
    const numericShippingCost = quote.deliveryType === 'NationalShipping' ? parseFloat(shippingCost) : 0;
    const numericCustomCost = quote.isCustomOrder ? parseFloat(customizationCost) : undefined;
    
    if (quote.deliveryType === 'NationalShipping' && (isNaN(numericShippingCost) || numericShippingCost < 0)) {
      setErrorMsg("Ingresa un costo de envío válido.");
      return;
    }

    if (quote.isCustomOrder && (isNaN(numericCustomCost!) || numericCustomCost! < 0)) {
      setErrorMsg("Ingresa un costo de personalización válido.");
      return;
    }

    setErrorMsg(null);
    updateQuote(
      {
        shippingCost: numericShippingCost,
        customizationCost: numericCustomCost,
        notes: notes.trim() || undefined
      },
      {
        onSuccess: () => {
          changeStatus({ status: 2 }, {
            onSettled: async () => {
              // Send the receipt email
              if (order?.customer?.email) {
                try {
                  await fetch('/api/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      order: order,
                      customer: order.customer,
                      items: order.items || [],
                      subtotal: order.subtotal || 0,
                      deliveryType: quote.deliveryType === 'NationalShipping' ? 2 : (quote.deliveryType === 'MeetingPoint' ? 1 : 0),
                      estimatedDeliveryCost: numericShippingCost,
                      emailType: 'receipt'
                    })
                  });
                } catch (error) {
                  console.error('Error enviando correo de boleta', error);
                }
              }
              setShowSuccessModal(true);
            }
          });
        },
        onError: (err) => {
          if (err instanceof ApiProblemDetails) {
            if (err.status === 400) setErrorMsg('Revisa el costo y los datos de la cotización.');
            else if (err.status === 403) setErrorMsg('No tienes permisos para gestionar cotizaciones.');
            else if (err.status === 409) setErrorMsg('La cotización cambió antes de completar la operación.');
            else setErrorMsg(err.title || 'Error inesperado.');
          } else {
            setErrorMsg('Error de red.');
          }
        }
      }
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-4">
          <Link href="/admin/cotizaciones" className="text-sage hover:text-brown transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-serif font-bold text-brown">Cotización para {quote.orderCode}</h1>
              {quote.deliveryType === 'Delivery' && (
                <span className="inline-flex items-center text-[10px] uppercase tracking-wider font-bold bg-[#c8a96b]/10 text-[#c8a96b] px-2 py-1 rounded-sm border border-[#c8a96b]/20">Delivery Local</span>
              )}
              {quote.deliveryType === 'MeetingPoint' && (
                <span className="inline-flex items-center text-[10px] uppercase tracking-wider font-bold bg-[#71a37c]/10 text-[#71a37c] px-2 py-1 rounded-sm border border-[#71a37c]/20">Punto de Encuentro</span>
              )}
              {quote.deliveryType === 'NationalShipping' && (
                <span className="inline-flex items-center text-[10px] uppercase tracking-wider font-bold bg-[#d38b8b]/10 text-[#d38b8b] px-2 py-1 rounded-sm border border-[#d38b8b]/20">Envío Nacional</span>
              )}
            </div>
            <p className="text-sm text-sage mt-1">Generada el {formatDate(quote.createdAt)}</p>
          </div>
        </div>
        
        {/* Aquí asumimos que el administrador puede deducir la navegación o se tiene orderCode/orderId para linkear */}
        <Link href={`/admin/pedidos`}>
          <Button variant="outline" className="h-9">Ir a lista de pedidos</Button>
        </Link>
      </div>

      {/* Contexto del Pedido (Para Cotizar) */}
      {isOrderLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton variant="rect" className="w-full h-48 rounded-2xl" />
          <Skeleton variant="rect" className="w-full h-48 rounded-2xl" />
        </div>
      ) : order ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`bg-white p-6 rounded-2xl shadow-sm border ${quote.deliveryType === 'NationalShipping' ? 'border-[#d38b8b]/30 bg-gradient-to-br from-white to-[#d38b8b]/5' : quote.deliveryType === 'MeetingPoint' ? 'border-[#71a37c]/30 bg-gradient-to-br from-white to-[#71a37c]/5' : 'border-[#c8a96b]/30 bg-gradient-to-br from-white to-[#c8a96b]/5'} relative overflow-hidden`}>
            {quote.deliveryType === 'NationalShipping' && <div className="absolute top-0 right-0 w-24 h-24 bg-[#d38b8b]/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>}
            {quote.deliveryType === 'MeetingPoint' && <div className="absolute top-0 right-0 w-24 h-24 bg-[#71a37c]/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>}
            {quote.deliveryType === 'Delivery' && <div className="absolute top-0 right-0 w-24 h-24 bg-[#c8a96b]/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>}
            
            <div className="flex items-center gap-2 text-brown font-semibold mb-4 font-serif relative z-10">
              <MapPin size={18} className={quote.deliveryType === 'NationalShipping' ? 'text-[#d38b8b]' : quote.deliveryType === 'MeetingPoint' ? 'text-[#71a37c]' : 'text-[#c8a96b]'} />
              <h4>Destino de Envío</h4>
            </div>
            <div className="space-y-3 text-sm text-sage relative z-10">
              {quote.deliveryType === 'NationalShipping' ? (
                <>
                  <div className="flex justify-between border-b border-sage/10 pb-2">
                    <span className="font-medium text-brown">Departamento:</span> 
                    <span className="font-semibold text-brown">{order.delivery?.department || 'No especificado'}</span>
                  </div>
                  <div className="flex justify-between border-b border-sage/10 pb-2">
                    <span className="font-medium text-brown">Provincia:</span> 
                    <span className="font-semibold text-brown">{order.delivery?.province || 'No especificada'}</span>
                  </div>
                  <div className="flex justify-between border-b border-sage/10 pb-2">
                    <span className="font-medium text-brown">Distrito:</span> 
                    <span className="font-semibold text-brown">{order.delivery?.district || 'No especificado'}</span>
                  </div>
                  <div className="flex flex-col gap-1 pt-1">
                    <span className="font-medium text-brown">Dirección exacta / Agencia:</span> 
                    <span className="bg-white p-3 rounded-xl border border-sage/20 font-medium text-brown shadow-sm">{order.delivery?.deliveryAddress || 'No especificada'}</span>
                  </div>
                </>
              ) : (
                <div className="bg-white/60 p-4 rounded-xl border border-sage/20 text-center space-y-2 mt-2">
                  <p className="text-brown font-medium">Revisar en Pedidos</p>
                  <p className="text-xs text-sage">Por favor, revisa el módulo de <strong className="text-brown">Pedidos</strong> para ver el lugar exacto de entrega ({quote.deliveryType === 'Delivery' ? 'Zona' : 'Punto de Encuentro'}) y no complicar la cotización.</p>
                  <Link href="/admin/pedidos">
                    <Button variant="outline" size="sm" className="mt-2 w-full h-8 text-xs bg-white">Ir a Pedidos</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-sage/10">
            <div className="flex items-center gap-2 text-brown font-semibold mb-4 font-serif">
              <Package size={18} className="text-gold" />
              <h4>{quote.isCustomOrder ? 'Detalles del Personalizado' : 'Productos a Enviar'}</h4>
            </div>
            
            {quote.isCustomOrder ? (
              <div className="space-y-4 custom-scrollbar overflow-y-auto pr-2">
                <div className="bg-[#FAFAFA] p-4 rounded-xl border border-sage/10">
                  <span className="block text-xs font-bold text-sage uppercase tracking-wider mb-2">Indicaciones del Cliente:</span>
                  <p className="text-sm text-brown whitespace-pre-wrap leading-relaxed">{quote.customizationNotes}</p>
                </div>
                {quote.referenceImageUrl && (
                  <div className="bg-[#FAFAFA] p-4 rounded-xl border border-sage/10">
                    <span className="block text-xs font-bold text-sage uppercase tracking-wider mb-3">Foto de referencia:</span>
                    <a href={quote.referenceImageUrl} target="_blank" rel="noreferrer" className="group block w-full rounded-xl border-2 border-dashed border-sage/20 overflow-hidden hover:border-gold relative bg-white">
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                         <span className="bg-white text-brown text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full shadow-lg">Click para agrandar</span>
                       </div>
                       {/* eslint-disable-next-line @next/next/no-img-element */}
                       <img src={quote.referenceImageUrl} alt="Referencia" className="w-full h-auto max-h-96 object-contain" />
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="space-y-3 text-sm max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sage bg-[#FAFAFA] p-2 rounded-lg border border-sage/10">
                      <span className="flex-1 truncate pr-4">{item.quantity}x {item.productName}</span>
                      <span className="font-medium text-brown whitespace-nowrap">{formatCurrency(item.unitPrice)} c/u</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-sage/10 flex justify-between items-center">
                  <span className="text-sage font-medium text-sm">Subtotal de productos:</span>
                  <span className="text-brown font-semibold">{order.subtotal !== null ? formatCurrency(order.subtotal) : '---'}</span>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}

      <div className="bg-white rounded-2xl shadow-sm border border-sage/10 overflow-hidden">
        <div className="p-6 border-b border-sage/10 bg-[#FAFAFA] flex justify-between items-center">
          <div className="flex items-center gap-2 text-brown font-serif font-semibold text-lg">
            <Calculator size={20} className="text-gold" />
            <h3>Detalles de la cotización</h3>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-${statusInfo.color}/10 text-${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>

        <div className="p-6">
          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm flex gap-3 border border-red-200 mb-6">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className={`grid grid-cols-1 ${quote.isCustomOrder ? 'md:grid-cols-4' : 'md:grid-cols-2'} gap-6`}>
              {quote.deliveryType === 'NationalShipping' && (
                <div className={quote.isCustomOrder ? 'md:col-span-2' : ''}>
                  <label className="block text-sm font-medium text-brown mb-2">
                    Costo de Envío Nacional (S/) <span className="text-rose">*</span>
                  </label>
                  <div className="flex gap-4 items-start">
                    <div className="flex-1">
                      <input 
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={shippingCost}
                        onChange={(e) => setShippingCost(e.target.value)}
                        disabled={isPending}
                        className="w-full px-4 py-3 bg-[#FAFAFA] border border-sage/30 rounded-xl focus:ring-1 focus:ring-gold outline-none"
                        placeholder="0.00"
                      />
                    </div>
                    {!quote.isCustomOrder && (
                      <div className="w-1/3">
                        <div className="h-12 px-4 flex items-center bg-cream/30 border border-sage/10 rounded-xl text-brown font-semibold text-sm">
                          {quote.shippingCost !== null ? formatCurrency(quote.shippingCost) : 'Ninguno'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {quote.isCustomOrder && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-brown mb-2">
                    Costo de Personalización (S/) <span className="text-rose">*</span>
                  </label>
                  <div className="flex gap-4 items-start">
                    <div className="flex-1">
                      <input 
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={customizationCost}
                        onChange={(e) => setCustomizationCost(e.target.value)}
                        disabled={isPending}
                        className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#c8a96b]/30 rounded-xl focus:ring-1 focus:ring-[#c8a96b] outline-none"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="w-1/3">
                      <div className="h-12 px-4 flex items-center bg-cream/30 border border-sage/10 rounded-xl text-brown font-semibold text-sm">
                        {quote.customizationCost !== null && quote.customizationCost !== undefined ? formatCurrency(quote.customizationCost) : 'Ninguno'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-brown mb-2">
                Notas adicionales (Opcional)
              </label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={2000}
                disabled={isPending}
                className="w-full px-4 py-3 bg-[#FAFAFA] border border-sage/30 rounded-xl focus:ring-1 focus:ring-gold outline-none resize-none"
                rows={4}
                placeholder="Ej. Envío por Olva Courier, llegada estimada de 2 a 3 días hábiles..."
              />
              <p className="text-right text-xs text-sage mt-1">{notes.length}/2000</p>
            </div>

            <div className="pt-4 border-t border-sage/10 flex justify-end">
              <Button type="submit" disabled={isPending || (!isPendingQuote && quote.shippingCost !== null && parseFloat(shippingCost) === quote.shippingCost && notes === (quote.notes || ''))} className="w-full md:w-auto px-8">
                {isPending ? 'Actualizando...' : isPendingQuote ? 'Guardar y Finalizar Cotización' : 'Actualizar Cotización'}
              </Button>
            </div>
            {isPendingQuote && (
              <p className="text-xs text-center text-sage mt-2">
                Al guardar exitosamente, el backend transicionará automáticamente el pedido al estado &quot;Cotización Lista&quot;.
              </p>
            )}
          </form>
        </div>
      </div>

      <Modal 
        isOpen={showSuccessModal} 
        onClose={() => {
          setShowSuccessModal(false);
          router.push('/admin/cotizaciones');
        }}
        title="Cotización Finalizada"
      >
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
            <CheckCircle size={32} />
          </div>
          <p className="text-brown font-serif text-lg font-medium mb-3">¡Lista para pago!</p>
          <p className="text-sage text-sm mb-8 leading-relaxed px-4">
            La cotización se ha guardado y el sistema ha enviado el correo. 
            El pedido está ahora esperando el pago del cliente.
          </p>
          
          <div className="w-full space-y-3">
            <Button 
              className="w-full h-12" 
              onClick={() => {
                setShowSuccessModal(false);
                router.push('/admin/cotizaciones');
              }}
            >
              Cerrar y volver a la lista
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
