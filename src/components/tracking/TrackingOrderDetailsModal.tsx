"use client";

import React from 'react';
import { PublicTrackingResponse } from '@/types/tracking';
import { getDeliveryTypeLabel } from '@/lib/tracking-helpers';
import { X, Package, MapPin, Truck, Copy, Check, ExternalLink, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import { DeliveryType } from '@/types/enums';

interface TrackingOrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tracking: PublicTrackingResponse;
  trackingToken: string;
}

export function TrackingOrderDetailsModal({ isOpen, onClose, tracking, trackingToken }: TrackingOrderDetailsModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const { delivery, items } = tracking;
  const deliveryTypeLabel = getDeliveryTypeLabel(tracking.deliveryType);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(tracking.orderCode);
    setCopied(true);
    toast.success('Código copiado');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/seguimiento?code=${tracking.orderCode}&token=${trackingToken}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Seguimiento de mi pedido en Aura Nova',
          text: `Revisa el estado de mi pedido ${tracking.orderCode}`,
          url
        });
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Enlace de seguimiento copiado');
    } catch {
      toast.error('No se pudo copiar el enlace');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="bg-[#faf7f2] w-full max-w-[380px] max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col rounded-b-xl rounded-t-sm"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ticket Header Accent */}
        <div className="h-3 w-full bg-[#4a3933] flex items-center justify-between px-2">
          {/* Subtle dashed line inside the header to mimic a ticket perforation */}
          <div className="w-full border-b border-dashed border-[#c8a96b]/30"></div>
        </div>

        <div className="px-5 py-6 sm:px-6 flex flex-col gap-6">
          
          <button 
            onClick={onClose}
            className="absolute top-6 right-5 p-1.5 rounded-full hover:bg-stone-200/50 text-stone-400 transition-colors"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div className="flex flex-col items-center pb-5 border-b-[2px] border-dashed border-stone-300">
            <h2 className="font-serif italic font-bold text-xl sm:text-2xl text-[#4a3933] mb-1">Ticket de Compra</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-mono font-bold text-[#887870] tracking-wider">#{tracking.orderCode}</span>
              <button 
                onClick={handleCopyCode} 
                className="text-stone-400 hover:text-[#c8a96b] transition-colors"
                title="Copiar código"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              </button>
            </div>
          </div>

        {/* Productos */}
        {items && items.length > 0 && (
          <div>
            <h3 className="text-[10px] uppercase font-bold text-[#887870] tracking-widest mb-3 flex items-center gap-1.5">
              <Package size={12} className="text-[#c8a96b]" />
              Productos
            </h3>
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start text-sm">
                  <div className="flex flex-col min-w-0 pr-3">
                    <span className="font-bold text-[#4a3933]">{item.productName}</span>
                    <span className="text-[11px] font-mono text-stone-500 mt-0.5">{item.quantity} x S/ {item.unitPrice?.toFixed(2) || '0.00'}</span>
                  </div>
                  <span className="font-mono font-bold text-[#1f2937] shrink-0 mt-0.5">
                    S/ {((item.unitPrice || 0) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              
              {tracking.isCustomOrder && (tracking.referenceImageUrl || tracking.customizationNotes) && (
                <div className="mt-3 p-3 bg-white/50 border border-dashed border-[#c8a96b]/30 rounded-lg">
                   <h4 className="text-[10px] uppercase font-bold text-[#887870] mb-2">Detalles de Personalización</h4>
                   {tracking.referenceImageUrl && (
                     <a href={tracking.referenceImageUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-[#c8a96b] font-bold hover:underline mb-2 w-fit">
                       <ExternalLink size={12} />
                       Ver imagen de referencia
                     </a>
                   )}
                   {tracking.customizationNotes && (
                     <p className="text-xs text-[#4a3933] italic">"{tracking.customizationNotes}"</p>
                   )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Entrega */}
        {delivery && (
          <div className="pt-5 border-t-[2px] border-dashed border-stone-300">
            <h3 className="text-[10px] uppercase font-bold text-[#887870] tracking-widest mb-3 flex items-center gap-1.5">
              <MapPin size={12} className="text-[#c8a96b]" />
              Información de Entrega
            </h3>
            <div className="text-xs space-y-2.5 text-[#4a3933]">
              <div className="flex justify-between">
                <span className="text-stone-500">Modalidad</span>
                <span className="font-bold">{deliveryTypeLabel}</span>
              </div>
              {delivery.meetingPointName && (
                <div className="flex justify-between">
                  <span className="text-stone-500">Punto de Encuentro</span>
                  <span className="font-bold text-right max-w-[60%]">{delivery.meetingPointName}</span>
                </div>
              )}
              {delivery.deliveryAddress && (
                <div className="flex justify-between">
                  <span className="text-stone-500">Dirección</span>
                  <span className="font-bold text-right max-w-[60%]">{delivery.deliveryAddress}</span>
                </div>
              )}
              {(delivery.district || delivery.province || delivery.department) && (
                <div className="flex justify-between">
                  <span className="text-stone-500">Ubicación</span>
                  <span className="font-bold text-right max-w-[60%]">{[delivery.district, delivery.province, delivery.department].filter(Boolean).join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Envío por Agencia */}
        {((tracking.nationalShippingDetails?.provider || tracking.shippingProvider) || (tracking.nationalShippingDetails?.trackingCode || tracking.shippingTrackingCode) || (tracking.nationalShippingDetails?.proofUrl || tracking.shippingProofUrl)) && tracking.deliveryType === DeliveryType.NationalShipping && (
          <div className="pt-5 border-t-[2px] border-dashed border-stone-300">
            <h3 className="text-[10px] uppercase font-bold text-[#887870] tracking-widest mb-3 flex items-center gap-1.5">
              <Truck size={12} className="text-[#c8a96b]" />
              Agencia de Envíos
            </h3>
            <div className="text-xs space-y-2.5 text-[#4a3933]">
              {(tracking.nationalShippingDetails?.provider || tracking.shippingProvider) && (
                <div className="flex justify-between items-center">
                  <span className="text-stone-500">Agencia</span>
                  <span className="font-bold">{tracking.nationalShippingDetails?.provider || tracking.shippingProvider}</span>
                </div>
              )}
              {(tracking.nationalShippingDetails?.trackingCode || tracking.shippingTrackingCode) && (
                <div className="flex justify-between items-center">
                  <span className="text-stone-500">Clave</span>
                  <span className="font-mono font-bold text-[#c8a96b] tracking-wider bg-[#c8a96b]/10 px-1.5 py-0.5 rounded">{tracking.nationalShippingDetails?.trackingCode || tracking.shippingTrackingCode}</span>
                </div>
              )}
              {(tracking.nationalShippingDetails?.proofUrl || tracking.shippingProofUrl) && (
                <div className="pt-2">
                  <a 
                    href={tracking.nationalShippingDetails?.proofUrl || tracking.shippingProofUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center justify-center gap-1.5 w-full border border-[#c8a96b] py-2 rounded-lg text-xs text-[#c8a96b] hover:bg-[#c8a96b] hover:text-white font-bold transition-colors"
                  >
                    <span>Ver Boleta de Envío</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Resumen de Pago */}
        {(tracking.costs?.total != null || tracking.total != null) && (
          <div className="pt-4 border-t-[2px] border-dashed border-stone-300 text-xs space-y-1.5 text-stone-500 font-mono">
            
            {(tracking.costs?.subtotal ?? tracking.subtotal) != null && (
              <div className="flex justify-between">
                <span>SUBTOTAL</span>
                <span>S/ {(tracking.costs?.subtotal ?? tracking.subtotal!).toFixed(2)}</span>
              </div>
            )}
            {(tracking.costs?.deliveryCost ?? tracking.deliveryCost) != null && (tracking.costs?.deliveryCost ?? tracking.deliveryCost)! > 0 && (
              <div className="flex justify-between">
                <span>ENVÍO</span>
                <span>S/ {(tracking.costs?.deliveryCost ?? tracking.deliveryCost!).toFixed(2)}</span>
              </div>
            )}
            {(tracking.costs?.customizationCost ?? tracking.customizationCost) != null && (tracking.costs?.customizationCost ?? tracking.customizationCost)! > 0 && (
              <div className="flex justify-between">
                <span>PERSONALIZACIÓN</span>
                <span>S/ {(tracking.costs?.customizationCost ?? tracking.customizationCost!).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm sm:text-base font-bold text-[#4a3933] pt-3 mt-2 border-t-[2px] border-stone-800">
              <span>TOTAL PAGADO</span>
              <span>S/ {(tracking.costs?.total ?? tracking.total ?? 0).toFixed(2)}</span>
            </div>
            
            <div className="text-center pt-6 pb-2">
               <p className="text-[10px] text-stone-400 font-sans">* Este ticket es generado automáticamente por Aura Nova.</p>
               <p className="text-[10px] text-stone-400 font-sans">Gracias por tu compra.</p>
            </div>
          </div>
        )}

        </div>
      </div>
      
      {/* Botón flotante para cerrar en móvil si es muy largo */}
      <div className="fixed bottom-6 w-full px-4 max-w-[380px] pointer-events-none flex justify-center z-[60]">
        <button
          onClick={onClose}
          className="pointer-events-auto w-full h-12 rounded-xl bg-[#4a3933] text-white text-sm font-bold shadow-[0_8px_16px_rgba(74,57,51,0.4)] transition-transform hover:scale-[1.02]"
        >
          Cerrar Ticket
        </button>
      </div>

    </div>
  );
}
