"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTracking } from '@/hooks/use-tracking';
import { TrackingSearchForm } from '@/components/tracking/TrackingSearchForm';
import { TrackingStatusCard } from '@/components/tracking/TrackingStatusCard';
import { TrackingActions } from '@/components/tracking/TrackingActions';
import { TrackingOrderDetails } from '@/components/tracking/TrackingOrderDetails';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { ApiProblemDetails, isTransientApiError } from '@/lib/api-errors';
import { TransientApiErrorState } from '@/components/shared/TransientApiErrorState';
import { OrderStatus } from '@/types/enums';
import { FlowerWaterfallLoader } from '@/components/ui/FlowerWaterfallLoader';

interface TrackingClientProps {
  initialCode: string;
  initialToken: string;
}

export function TrackingClient({ initialCode, initialToken }: TrackingClientProps) {
  // Si no tenemos parámetros, simplemente mostramos el buscador
  if (!initialCode || !initialToken) {
    return <TrackingSearchForm />;
  }

  return (
    <TrackingResultViewer orderCode={initialCode} trackingToken={initialToken} />
  );
}

// Extraído para mantener limpio el hook condicional
function TrackingResultViewer({ orderCode, trackingToken }: { orderCode: string, trackingToken: string }) {
  const router = useRouter();
  const { data: tracking, isLoading, error, refetch, isFetching } = useTracking({ orderCode, trackingToken });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto mt-8">
        <FlowerWaterfallLoader 
          message="Buscando tu pedido..." 
          subMessage="Estamos recolectando la información de tus detalles."
        />
      </div>
    );
  }

  if (error) {
    if (isTransientApiError(error)) {
      return (
        <TransientApiErrorState 
          title="No pudimos consultar tu pedido en este momento"
          message="Nuestros servidores están experimentando una dificultad técnica temporal. Si lo deseas, puedes consultar el estado de tu pedido directamente por WhatsApp."
          onRetry={() => refetch()}
          whatsappMessage={`Hola Aura Nova. He intentado hacer seguimiento a mi pedido ${orderCode}, pero el sistema está temporalmente inactivo. Quisiera saber el estado de mi envío.`}
        />
      );
    }

    if (error instanceof ApiProblemDetails) {
      if (error.status === 404) {
        return (
          <ErrorState 
            title="No encontramos un pedido con esos datos" 
            message="Por favor, revisa que el código de pedido y el token sean correctos y vuelve a intentarlo."
            onRetry={() => router.push('/seguimiento')}
          />
        );
      }
      if (error.status === 429) {
        return (
          <ErrorState 
            title="Has realizado demasiadas consultas" 
            message="Espera un momento antes de intentarlo nuevamente para evitar saturar el sistema."
            onRetry={() => refetch()}
          />
        );
      }
    }
    
    return (
      <ErrorState 
        title="No pudimos consultar tu pedido" 
        message="Verifica tu conexión a internet o intenta nuevamente en unos minutos."
        onRetry={() => refetch()}
      />
    );
  }

  if (!tracking) return null;

  const statusKey = typeof tracking.status === 'string' ? (OrderStatus as any)[tracking.status] ?? tracking.status : tracking.status;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full bg-[#faf7f2] pt-24 pb-12 overflow-x-hidden">
      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8 text-center md:text-left">
          <button 
            onClick={() => router.push('/seguimiento')}
            className="text-sm font-medium text-sage hover:text-brown transition-colors flex items-center gap-2 mx-auto md:mx-0"
          >
            <span>←</span> Volver al buscador
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 xl:gap-10 mt-6">
          
          {/* Main Column (Timeline & Details) */}
          <div className="xl:col-span-2 flex flex-col gap-8">
            <TrackingStatusCard tracking={tracking} />
            <TrackingOrderDetails delivery={tracking.delivery} items={tracking.items} />
          </div>

          {/* Side Column (Payment & Actions) */}
          <div className="xl:col-span-1 flex flex-col gap-6 w-full">
            
            {statusKey === OrderStatus.WaitingQuote && (
              <div className="bg-[#fdf5f5] p-6 rounded-[2rem] text-[#4a3933] shadow-inner text-center border border-transparent">
                <span className="text-4xl mb-4 block">⏳</span>
                <strong className="block mb-2 font-serif text-xl italic text-[#d38b8b]">Cotización Recibida</strong>
                <p className="text-sm leading-relaxed text-[#887870]">Hemos recibido tu solicitud. Nuestro equipo te contactará por WhatsApp para brindarte el monto total con envío.</p>
              </div>
            )}
            
            {(statusKey === OrderStatus.WaitingPayment || statusKey === OrderStatus.QuoteReady) && (
              <>
                <style dangerouslySetInnerHTML={{__html: `
                  .ticket-edge-bottom {
                    background-image: radial-gradient(circle at 6px 6px, transparent 6px, #fdfdfd 6.5px);
                    background-size: 12px 12px;
                    background-position: center bottom;
                    background-repeat: repeat-x;
                    height: 12px;
                    width: 100%;
                    transform: rotate(180deg);
                  }
                  .printing-mask {
                    mask-image: linear-gradient(to bottom, black 95%, transparent 100%);
                    -webkit-mask-image: linear-gradient(to bottom, black 95%, transparent 100%);
                  }
                `}} />

                <div className="w-full flex flex-col items-center">
                  <div className="w-full max-w-[320px] relative mt-2 mx-auto printing-mask overflow-hidden pt-2">
                    {/* The slot */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-[#2a2a2a] rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] z-20"></div>
                    
                    {/* The Ticket */}
                    <div className="w-full bg-[#fdfdfd] relative z-10 pt-8 pb-4 px-6 text-[#1a1a1a] shadow-[0_4px_20px_rgba(0,0,0,0.08)] mx-auto animate-print" style={{ fontFamily: '"Courier New", Courier, monospace' }}>
                      
                      <div className="text-center border-b-2 border-dashed border-[#ccc] pb-4 mb-4">
                        <p className="font-bold text-xl uppercase mb-1">AURA NOVA</p>
                        <p className="text-[10px] tracking-widest text-[#666] uppercase">Comprobante de Pago</p>
                      </div>

                      <div className="space-y-3 text-xs mb-4">
                        <div className="flex justify-between">
                          <span className="font-bold text-[#666]">PEDIDO:</span>
                          <span className="font-bold">{tracking.orderCode}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-bold text-[#666]">ESTADO:</span>
                          <span className="font-bold bg-[#c8a96b]/20 px-1 text-[#4a3933]">ESPERANDO PAGO</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-bold text-[#666]">FECHA:</span>
                          <span>{new Date().toLocaleDateString('es-PE')}</span>
                        </div>
                      </div>

                      <div className="border-t-2 border-dashed border-[#ccc] pt-4 mb-4 space-y-3 text-xs">
                        <div>
                          <span className="font-bold text-[#666] block mb-1">DESTINO:</span>
                          <span className="block break-words">
                            {tracking.delivery?.meetingPointName || tracking.delivery?.deliveryZoneName || tracking.delivery?.deliveryAddress || 'No especificado'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-bold text-[#666]">DISTRITO:</span>
                          <span className="text-right">{tracking.delivery?.district || '-'}</span>
                        </div>
                      </div>

                      <div className="border-t-2 border-dashed border-[#ccc] pt-4 mb-6 space-y-2 text-xs">
                        {tracking.subtotal != null && (
                          <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>S/ {tracking.subtotal.toFixed(2)}</span>
                          </div>
                        )}
                        {tracking.customizationCost != null && tracking.customizationCost > 0 && (
                          <div className="flex justify-between">
                            <span>Personalización:</span>
                            <span>S/ {tracking.customizationCost.toFixed(2)}</span>
                          </div>
                        )}
                        {tracking.deliveryCost != null && (
                          <div className="flex justify-between">
                            <span>Envío:</span>
                            <span>S/ {tracking.deliveryCost.toFixed(2)}</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between pt-2 mt-2 border-t border-[#eee] text-sm font-bold">
                          <span>TOTAL A PAGAR:</span>
                          <span>
                            S/ {(tracking.total || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="text-center mt-6">
                        <p className="text-[10px] text-[#666] leading-relaxed">
                          Por favor, realiza el pago para iniciar la preparación de tu pedido.
                        </p>
                      </div>

                      {/* Bottom zig-zag edge */}
                      <div className="absolute -bottom-3 left-0 w-full z-10">
                        <div className="ticket-edge-bottom"></div>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      sessionStorage.setItem('tempPaymentContext', JSON.stringify({
                        orderCode: tracking.orderCode,
                        total: tracking.total,
                        shippingCost: tracking.deliveryCost || 0,
                        status: 2
                      }));
                      router.push(`/pago/${tracking.orderCode}`);
                    }}
                    className="relative z-10 w-full max-w-[320px] h-14 mt-6 text-base tracking-widest uppercase flex items-center justify-center gap-3 rounded-xl bg-[#c8a96b] hover:bg-[#b89759] text-white font-sans font-bold shadow-xl shadow-[#c8a96b]/30 transition-all hover:-translate-y-1"
                  >
                    Pagar Ahora <span className="text-xl">💳</span>
                  </button>
                </div>
              </>
            )}
            

            <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_20px_50px_-15px_rgba(211,139,139,0.15)] relative">
              <h3 className="font-serif text-xl font-bold text-[#d38b8b] italic mb-6 text-center lg:text-left">Acciones Adicionales</h3>
              <TrackingActions trackingToken={trackingToken} tracking={tracking} />
              
              <button 
                onClick={() => refetch()}
                disabled={isFetching}
                className="w-full mt-8 flex items-center justify-center gap-2 text-sm font-bold text-[#887870] hover:text-[#c8a96b] transition-colors disabled:opacity-50"
              >
                <span className={isFetching ? 'animate-spin' : ''}>↻</span>
                Actualizar estado
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
