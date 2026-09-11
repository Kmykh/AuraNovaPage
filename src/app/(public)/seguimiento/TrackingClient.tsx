"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTracking } from '@/hooks/use-tracking';
import { TrackingSearchForm } from '@/components/tracking/TrackingSearchForm';
import { TrackingStatusCard } from '@/components/tracking/TrackingStatusCard';
import { TrackingOrderDetailsModal } from '@/components/tracking/TrackingOrderDetailsModal';
import { ErrorState } from '@/components/ui/ErrorState';
import { ApiProblemDetails, isTransientApiError } from '@/lib/api-errors';
import { TransientApiErrorState } from '@/components/shared/TransientApiErrorState';
import { OrderStatus } from '@/types/enums';
import { FlowerWaterfallLoader } from '@/components/ui/FlowerWaterfallLoader';
import { getDeliveryTypeLabel } from '@/lib/tracking-helpers';
import { ChevronLeft, Search, Share2, Calendar, Package, Check, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface TrackingClientProps {
  initialCode: string;
  initialToken: string;
}

export function TrackingClient({ initialCode, initialToken }: TrackingClientProps) {
  if (!initialCode || !initialToken) {
    return <TrackingSearchForm />;
  }

  return (
    <TrackingResultViewer orderCode={initialCode} trackingToken={initialToken} />
  );
}

function TrackingResultViewer({ orderCode, trackingToken }: { orderCode: string, trackingToken: string }) {
  const router = useRouter();
  const { data: tracking, isLoading, error, refetch } = useTracking({ orderCode, trackingToken });

  const [searchInput, setSearchInput] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [copied, setCopied] = useState(false);

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto pt-24 pb-8 px-4 flex justify-center items-center min-h-[60vh]">
        <FlowerWaterfallLoader 
          message="Buscando tu pedido..." 
          subMessage="Estamos obteniendo los detalles más recientes."
        />
      </div>
    );
  }

  if (error) {
    if (isTransientApiError(error)) {
      return (
        <div className="max-w-md mx-auto pt-24 pb-8 px-4">
          <TransientApiErrorState 
            title="No pudimos consultar tu pedido"
            message="Ocurrió una dificultad técnica temporal. Intenta nuevamente o contáctanos."
            onRetry={() => refetch()}
            whatsappMessage={`Hola Aura Nova. He intentado hacer seguimiento a mi pedido ${orderCode}, pero el sistema está temporalmente inactivo.`}
          />
        </div>
      );
    }

    if (error instanceof ApiProblemDetails) {
      if (error.status === 404) {
        return (
          <div className="max-w-md mx-auto pt-24 pb-8 px-4">
            <ErrorState 
              title="Pedido no encontrado" 
              message="Verifica que el código y el enlace sean correctos."
              onRetry={() => router.push('/seguimiento')}
            />
          </div>
        );
      }
      if (error.status === 429) {
        return (
          <div className="max-w-md mx-auto pt-24 pb-8 px-4">
            <ErrorState 
              title="Demasiadas consultas" 
              message="Espera unos segundos antes de intentar nuevamente."
              onRetry={() => refetch()}
            />
          </div>
        );
      }
    }
    
    return (
      <div className="max-w-md mx-auto pt-24 pb-8 px-4">
        <ErrorState 
          title="Error de conexión" 
          message="Revisa tu conexión a internet e inténtalo de nuevo."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  if (!tracking) return null;

  const statusKey = typeof tracking.status === 'string' 
    ? ((OrderStatus as Record<string, string | number>)[tracking.status] ?? tracking.status) 
    : tracking.status;

  const deliveryTypeLabel = getDeliveryTypeLabel(tracking.deliveryType);
  const totalQuantity = tracking.items?.reduce((sum, item) => sum + item.quantity, 0) || 1;
  const quantityString = totalQuantity < 10 ? `0${totalQuantity}` : `${totalQuantity}`;
  const firstItemName = tracking.items?.[0]?.productName || `Pedido #${tracking.orderCode}`;

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
      toast.success('Enlace copiado al portapapeles');
    } catch {
      toast.error('No se pudo copiar el enlace');
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(tracking.orderCode);
    setCopied(true);
    toast.success('Código copiado');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    router.push(`/seguimiento?code=${encodeURIComponent(searchInput.trim())}`);
  };

  return (
    <div className="w-full min-h-[calc(100vh-4.5rem)] bg-[#faf7f2] pt-20 sm:pt-24 pb-6 px-4 flex flex-col items-center">
      
      {/* Contenedor Principal Ajustado al tamaño de pantalla */}
      <div className="w-full max-w-4xl flex flex-col gap-5 sm:gap-6">

        {/* 1. Header Superior (Flecha Volver + Título + Compartir) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-1 gap-4">
          <div className="flex items-start gap-3">
             <button 
               onClick={() => router.push('/seguimiento')}
               className="p-1.5 -ml-1.5 rounded-full hover:bg-stone-200/50 text-[#1f2937] transition-colors mt-0.5"
               title="Volver"
             >
               <ChevronLeft size={22} />
             </button>
             <div>
                <h1 className="font-bold text-xl sm:text-2xl font-serif text-[#4a3933]">
                  ¡Hola {tracking.customerFirstName || 'AuraLover'}!
                </h1>
                <p className="text-sm text-stone-500 font-medium mt-0.5">
                  Aquí tienes el detalle de tu pedido <span className="text-[#c8a96b] font-mono font-bold">#{tracking.orderCode}</span>
                </p>
                {tracking.isCustomOrder && (
                  <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-[#c8a96b]/10 text-[#c8a96b] rounded text-[11px] font-bold uppercase tracking-wider">
                    ✨ Pedido Personalizado
                  </span>
                )}
             </div>
          </div>
          
          <button 
            onClick={handleShare}
            className="p-1.5 -mr-1.5 rounded-full hover:bg-stone-200/50 text-stone-500 hover:text-[#c8a96b] transition-colors self-end sm:self-auto"
            title="Compartir enlace"
          >
            <Share2 size={18} />
          </button>
        </div>



        {/* 3. Tarjeta Resumen del Producto / Pedido */}
        <div className="w-full bg-[#4a3933] rounded-2xl p-3 sm:p-4 border border-[#5e4a42] shadow-md flex items-center gap-4">
          
          {/* Miniatura Izquierda */}
          <div className="w-12 h-12 rounded-xl bg-[#5e4a42] border border-[#7a6258] flex items-center justify-center text-[#c8a96b] shrink-0 shadow-inner">
            <Package size={22} strokeWidth={2.2} />
          </div>

          {/* Información Central */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm sm:text-base text-[#faf7f2] truncate pr-2">
                {firstItemName}
              </h2>
              <span className="text-xs font-bold text-[#c8a96b] shrink-0 bg-[#5e4a42] px-2 py-0.5 rounded-md">
                x{quantityString}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[#c0b3b0] mt-1">
              <Calendar size={12} className="shrink-0 text-[#c8a96b]" />
              <span className="truncate">{deliveryTypeLabel}</span>
            </div>

            <div className="flex items-center justify-between mt-2">
              <span className="font-bold text-sm sm:text-base text-white">
                S/ {(tracking.costs?.total ?? tracking.total ?? 0).toFixed(2)}
              </span>
              <button 
                onClick={() => setShowDetailsModal(true)}
                className="text-xs font-bold text-[#4a3933] bg-[#c8a96b] hover:bg-[#b89759] px-3 py-1.5 rounded-lg transition-colors shadow-sm"
              >
                Ver Ticket
              </button>
            </div>
          </div>
        </div>

        {/* Notificación Compacta si está Pendiente de Pago (Sin ocupar media pantalla) */}
        {(statusKey === OrderStatus.WaitingPayment || Number(statusKey) === 2) && (
          <div className="w-full bg-[#fdf8ee] border border-[#c8a96b]/40 rounded-xl px-3 py-2 flex items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs text-[#8c6d36] font-medium">
              <span>⏳</span>
              <span className="font-semibold">Pendiente de pago</span>
            </div>
            <button
              onClick={() => {
                sessionStorage.setItem('tempPaymentContext', JSON.stringify({
                  orderCode: tracking.orderCode,
                  total: tracking.costs?.total ?? tracking.total,
                  shippingCost: tracking.costs?.deliveryCost ?? tracking.deliveryCost ?? 0,
                  status: 2
                }));
                router.push(`/pago/${tracking.orderCode}`);
              }}
              className="px-3 py-1 rounded-lg bg-[#c8a96b] hover:bg-[#b89759] text-white text-xs font-bold transition-all shadow-xs"
            >
              Pagar S/ {(tracking.costs?.total ?? tracking.total ?? 0).toFixed(2)}
            </button>
          </div>
        )}

        {/* Notificación Compacta si está en Cotización */}
        {(statusKey === OrderStatus.WaitingQuote || Number(statusKey) === 0) && (
          <div className="w-full bg-[#fdf5f5] border border-[#d38b8b]/30 rounded-xl px-3 py-2 flex items-center justify-between text-xs text-[#887870]">
            <span className="font-medium">⏳ Cotización en proceso</span>
            <span className="text-[11px] text-[#d38b8b] font-bold">Te escribiremos a WhatsApp</span>
          </div>
        )}

        {/* Tarjeta Informativa de Agencia (Condicional) */}
        {(tracking.statusLabel === 'DeliveredToAgency' || Number(statusKey) === 9 || statusKey === OrderStatus.DeliveredToAgency) && tracking.nationalShippingDetails && tracking.nationalShippingDetails.provider && (
          <div className="w-full bg-blue-50/50 border border-blue-200/60 p-4 rounded-xl shadow-xs">
            <h3 className="font-bold text-blue-900 flex items-center gap-2 text-sm">
              🚚 Paquete en Agencia: {tracking.nationalShippingDetails.provider}
            </h3>
            <p className="text-blue-800 text-xs mt-2">
              Código de Rastreo: <span className="font-mono font-bold bg-white border border-blue-200 text-blue-600 px-2 py-1 rounded ml-1">{tracking.nationalShippingDetails.trackingCode}</span>
            </p>
            
            {tracking.nationalShippingDetails.proofUrl && (
              <a 
                href={tracking.nationalShippingDetails.proofUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 underline decoration-blue-300 underline-offset-2"
              >
                Ver Foto del Comprobante
              </a>
            )}
          </div>
        )}

        {/* 4. Componente de Seguimiento (Tracker Horizontal con Iconos + Timeline Vertical Detallado) */}
        <div className="w-full">
          <TrackingStatusCard tracking={tracking} />
          
          {tracking.estimates?.estimatedReadyAt && (
            <div className="mt-4 text-center">
              <p className="text-[13px] text-[#887870] bg-white border border-[#e8dcdc] px-4 py-3 rounded-xl shadow-xs inline-flex items-center gap-2">
                📅 Estimamos que tu pedido estará listo el <span className="font-bold text-[#4a3933]">{new Date(tracking.estimates.estimatedReadyAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Modal Desplegable de Detalles Completos (No añade scroll a la pantalla principal) */}
      <TrackingOrderDetailsModal 
        isOpen={showDetailsModal} 
        onClose={() => setShowDetailsModal(false)}
        tracking={tracking}
        trackingToken={trackingToken}
      />

    </div>
  );
}
