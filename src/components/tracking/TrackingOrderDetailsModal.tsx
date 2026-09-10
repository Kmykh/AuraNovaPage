"use client";

import React from 'react';
import { PublicTrackingResponse } from '@/types/tracking';
import { getDeliveryTypeLabel } from '@/lib/tracking-helpers';
import { X, Package, MapPin, Truck, Copy, Check, ExternalLink, Link2 } from 'lucide-react';
import { toast } from 'sonner';

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
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl relative border border-stone-100 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div>
            <h2 className="font-bold text-base sm:text-lg text-[#1f2937]">Detalles del Pedido</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-mono font-bold text-[#c8a96b]">#{tracking.orderCode}</span>
              <button 
                onClick={handleCopyCode} 
                className="text-stone-400 hover:text-[#c8a96b] transition-colors"
                title="Copiar código"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Productos */}
        {items && items.length > 0 && (
          <div>
            <h3 className="text-xs uppercase font-bold text-[#887870] tracking-wider mb-2 flex items-center gap-1.5">
              <Package size={14} className="text-[#c8a96b]" />
              Productos
            </h3>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-2.5 bg-[#faf7f2] rounded-xl border border-stone-200/60 text-xs sm:text-sm">
                  <span className="font-medium text-[#1f2937] truncate pr-2">{item.productName}</span>
                  <span className="font-bold text-[#887870] shrink-0 bg-white px-2 py-0.5 rounded border border-stone-200 text-xs">
                    x{item.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Entrega */}
        {delivery && (
          <div>
            <h3 className="text-xs uppercase font-bold text-[#887870] tracking-wider mb-2 flex items-center gap-1.5">
              <MapPin size={14} className="text-[#c8a96b]" />
              Información de Entrega
            </h3>
            <div className="bg-[#faf7f2] p-3 rounded-xl border border-stone-200/60 text-xs sm:text-sm space-y-2 text-[#1f2937]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#887870] block">Modalidad</span>
                <span className="font-medium">{deliveryTypeLabel}</span>
              </div>
              {delivery.meetingPointName && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#887870] block">Punto de Encuentro</span>
                  <span className="font-medium">{delivery.meetingPointName}</span>
                </div>
              )}
              {delivery.deliveryAddress && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#887870] block">Dirección</span>
                  <span className="font-medium">{delivery.deliveryAddress}</span>
                </div>
              )}
              {(delivery.district || delivery.province || delivery.department) && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#887870] block">Ubicación</span>
                  <span className="font-medium">{[delivery.district, delivery.province, delivery.department].filter(Boolean).join(', ')}</span>
                </div>
              )}
              {delivery.deliveryZoneName && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#887870] block">Zona</span>
                  <span className="font-medium">{delivery.deliveryZoneName}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Envío por Agencia */}
        {(tracking.shippingProvider || tracking.shippingTrackingCode || tracking.shippingProofUrl) && (
          <div>
            <h3 className="text-xs uppercase font-bold text-[#887870] tracking-wider mb-2 flex items-center gap-1.5">
              <Truck size={14} className="text-[#c8a96b]" />
              Datos de Agencia de Envíos
            </h3>
            <div className="bg-[#faf7f2] p-3 rounded-xl border border-stone-200/60 text-xs sm:text-sm space-y-2">
              {tracking.shippingProvider && (
                <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-stone-100">
                  <span className="text-xs text-[#887870]">Agencia:</span>
                  <span className="font-bold text-[#1f2937]">{tracking.shippingProvider}</span>
                </div>
              )}
              {tracking.shippingTrackingCode && (
                <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-[#c8a96b]/30">
                  <span className="text-xs text-[#887870]">Tracking / Clave:</span>
                  <span className="font-mono font-bold text-[#c8a96b] tracking-wider">{tracking.shippingTrackingCode}</span>
                </div>
              )}
              {tracking.shippingProofUrl && (
                <div className="pt-1 text-center">
                  <a 
                    href={tracking.shippingProofUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-1 text-xs text-[#c8a96b] hover:underline font-medium"
                  >
                    <span>Ver comprobante / boleta de envío</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Resumen de Pago */}
        {tracking.total != null && (
          <div className="pt-2 border-t border-stone-100 text-xs space-y-1 text-[#6b7280]">
            {tracking.subtotal != null && (
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-medium text-[#1f2937]">S/ {tracking.subtotal.toFixed(2)}</span>
              </div>
            )}
            {tracking.deliveryCost != null && (
              <div className="flex justify-between">
                <span>Envío:</span>
                <span className="font-medium text-[#1f2937]">S/ {tracking.deliveryCost.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-[#1f2937] pt-1.5 border-t border-stone-100">
              <span>Total:</span>
              <span>S/ {(tracking.total || 0).toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Botones de Acción */}
        <div className="pt-2 flex flex-col gap-2">
          <button
            onClick={handleShare}
            className="w-full h-11 rounded-xl bg-[#c8a96b] hover:bg-[#b89759] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <Link2 size={16} />
            Compartir Enlace de Seguimiento
          </button>
          <button
            onClick={onClose}
            className="w-full h-10 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#1f2937] text-xs font-semibold transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
