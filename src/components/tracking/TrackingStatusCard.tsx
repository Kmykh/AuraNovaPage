import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import { PublicTrackingResponse, TrackingTimelineEvent } from '@/types/tracking';
import { DeliveryType } from '@/types/enums';
import { getOrderStatusDescription } from '@/lib/tracking-helpers';
import { 
  Check, Package, Truck, Building2, PackageCheck, 
  CreditCard, FileText, CheckCircle, Store, Box, Navigation
} from 'lucide-react';

import flo1 from '@/app/(public)/images/flo1.png';
import flo2 from '@/app/(public)/images/flo2.png';

interface TrackingStatusCardProps {
  tracking: PublicTrackingResponse;
}

// Función para mapear el estado a un icono de Lucide
const getStatusIcon = (status: string | number, deliveryType: DeliveryType | number | string) => {
  const isNational = deliveryType === DeliveryType.NationalShipping || deliveryType === 'NationalShipping' || Number(deliveryType) === 2;
  
  const statusStr = String(status);
  
  switch (statusStr) {
    case 'WaitingQuote':
    case '0':
      return FileText;
    case 'QuoteReady':
    case '1':
      return FileText;
    case 'WaitingPayment':
    case '2':
      return CreditCard;
    case 'PaymentReported':
    case '3':
      return FileText;
    case 'PaymentConfirmed':
    case '4':
      return CheckCircle;
    case 'Preparing':
    case '5':
      return Package;
    case 'Ready':
    case '6':
      return Box;
    case 'Shipped':
    case '7':
      return isNational ? Truck : Navigation;
    case 'DeliveredToAgency':
    case '9':
      return isNational ? Building2 : Store;
    case 'Delivered':
    case '8':
      return PackageCheck;
    default:
      return Package;
  }
};

export function TrackingStatusCard({ tracking }: TrackingStatusCardProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Orden cronológico normal (el primer paso a la izquierda, el último a la derecha)
  const timelineEvents = [...(tracking.timeline || [])];

  // Auto-scroll para enfocar el estado más reciente (activo) al renderizar
  useEffect(() => {
    if (scrollRef.current) {
      const activeElement = scrollRef.current.querySelector('[data-active="true"]');
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [timelineEvents]);

  const currentStatusDisplay = 
    tracking.statusLabel === 'DeliveredToAgency' 
      ? 'Entregado a Agencia' 
      : tracking.statusLabel;

  return (
    <div className="w-full flex flex-col gap-5 mt-2 relative">
      
      {/* Elementos Decorativos (Flores) */}
      <div className="absolute -top-10 -right-4 md:-right-10 w-16 h-16 opacity-80 pointer-events-none animate-pulse-slow">
        <Image src={flo1} alt="flor decorativa" layout="fill" objectFit="contain" />
      </div>
      <div className="absolute top-1/2 -left-6 md:-left-12 w-12 h-12 opacity-60 pointer-events-none animate-float">
        <Image src={flo2} alt="flor decorativa" layout="fill" objectFit="contain" />
      </div>

      {/* SECCIÓN HORIZONTAL ÚNICA BASADA EN EL TIMELINE DEL BACKEND */}
      <div className="w-full relative z-10">
        <h3 className="font-bold text-sm sm:text-base text-[#4a3933] mb-4 text-center">
          {currentStatusDisplay}
        </h3>

        {/* Contenedor con scroll horizontal suave (sin barra visible) */}
        <div 
          ref={scrollRef}
          className="w-full overflow-x-auto pb-4 pt-2 px-4 hide-scrollbar snap-x snap-mandatory flex items-start"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Estilos para ocultar la barra de scroll en webkit */}
          <style dangerouslySetInnerHTML={{__html: `
            .hide-scrollbar::-webkit-scrollbar {
              display: none;
            }
          `}} />

          {timelineEvents.map((event, idx) => {
            const isCompleted = event.completed;
            const isLastCompleted = isCompleted && (idx === timelineEvents.length - 1 || !timelineEvents[idx + 1]?.completed);
            const isNextCompleted = idx < timelineEvents.length - 1 && timelineEvents[idx + 1].completed;
            const Icon = getStatusIcon(event.status, tracking.deliveryType);
            const dateObj = event.createdAt ? new Date(event.createdAt) : null;

            return (
              <div 
                key={idx} 
                data-active={isLastCompleted}
                className="relative flex flex-col items-center shrink-0 w-28 sm:w-36 snap-center"
              >
                
                {/* 1. Línea Conectora de Fondo (mitad izquierda y mitad derecha) */}
                <div className="absolute top-[28px] left-0 w-full flex">
                  {/* Línea hacia el nodo anterior */}
                  <div className={`h-[2px] w-1/2 ${
                    idx === 0 ? 'bg-transparent' : isCompleted ? 'bg-[#4a3933]' : 'bg-[#e8dcdc] border-t-2 border-dashed border-[#e8dcdc]'
                  }`} />
                  {/* Línea hacia el siguiente nodo */}
                  <div className={`h-[2px] w-1/2 ${
                    idx === timelineEvents.length - 1 ? 'bg-transparent' : isNextCompleted ? 'bg-[#4a3933]' : 'bg-transparent border-t-2 border-dashed border-[#e8dcdc]'
                  }`} />
                </div>

                {/* 2. Nodo / Burbuja */}
                <div 
                  className={`relative z-10 w-14 h-14 rounded-full flex flex-col items-center justify-center border-4 border-[#faf7f2] transition-all duration-300 ${
                    isCompleted
                      ? 'bg-[#4a3933] text-[#faf7f2] shadow-md scale-110' // Marrón si completado
                      : 'bg-[#faf7f2] border-[#d38b8b] text-[#d38b8b] shadow-sm' // Crema/Rosado si pendiente
                  }`}
                >
                  <Icon size={20} strokeWidth={isCompleted ? 2.5 : 2} />
                  
                  {/* Check superpuesto para los completados */}
                  {isCompleted && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#faf7f2] border-2 border-[#4a3933] rounded-full flex items-center justify-center">
                      <Check size={12} strokeWidth={4} className="text-[#4a3933]" />
                    </div>
                  )}
                </div>

                {/* 3. Etiqueta y Fecha (Debajo del nodo) */}
                <div className="mt-4 flex flex-col items-center text-center px-1">
                  <span className={`font-bold text-[11px] sm:text-xs leading-tight mb-1 ${
                    isCompleted ? 'text-[#4a3933]' : 'text-[#887870]'
                  }`}>
                    {event.label === 'DeliveredToAgency' ? 'Entregado a Agencia' : event.label}
                  </span>
                  
                  {dateObj && isCompleted ? (
                    <span className="text-[10px] sm:text-[11px] font-medium text-[#887870] leading-none">
                      {dateObj.getDate()} {dateObj.toLocaleString('es-PE', { month: 'short' }).replace('.', '')}
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-[#e8dcdc] leading-none">
                      ---
                    </span>
                  )}
                </div>
                
              </div>
            );
          })}
        </div>
      </div>

      {/* SECCIÓN VERTICAL: DETALLE DEL ESTADO (Seguimiento a detalle con descripciones y hora) */}
      <div className="w-full pt-6 mt-2 border-t border-[#e8dcdc]/60 relative z-10">
        <h3 className="font-bold text-sm sm:text-base text-[#4a3933] mb-5 pl-2">
          Seguimiento a detalle
        </h3>

        <div className="flex flex-col">
          {[...timelineEvents].reverse().map((event, idx) => {
            const isCompleted = event.completed;
            const description = getOrderStatusDescription(event.status);
            const dateObj = event.createdAt ? new Date(event.createdAt) : null;
            
            // El primer elemento completado en la lista invertida es el estado activo actual
            const isFirstCompleted = isCompleted && ![...timelineEvents].reverse().slice(0, idx).some(e => e.completed);

            return (
              <div key={idx} className="flex items-start gap-4 sm:gap-5 relative mb-1">
                
                {/* Columna Fecha Izquierda */}
                <div className="w-12 sm:w-16 text-right shrink-0 pt-1">
                  {dateObj && isCompleted ? (
                    <>
                      <p className="font-bold text-xs sm:text-sm text-[#4a3933] leading-none">
                        {dateObj.getDate()} <span className="text-[10px] sm:text-xs text-[#887870] uppercase font-semibold">{dateObj.toLocaleString('es-PE', { month: 'short' }).replace('.', '')}</span>
                      </p>
                      <p className="text-[9px] sm:text-[10px] font-medium text-[#c8a96b] mt-1 tracking-wide">
                        {dateObj.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-[#d38b8b]/60 font-medium pt-1">---</p>
                  )}
                </div>

                {/* Columna Nodo Central y Línea Vertical Discontinua */}
                <div className="relative flex flex-col items-center shrink-0 pt-1">
                  <div 
                    className={`w-[22px] h-[22px] rounded-full flex items-center justify-center z-10 transition-all ${
                      isFirstCompleted
                        ? 'bg-[#4a3933] text-[#faf7f2] shadow-sm ring-4 ring-[#faf7f2]'
                        : isCompleted
                          ? 'bg-[#4a3933] text-[#faf7f2] ring-2 ring-[#faf7f2]'
                          : 'bg-[#faf7f2] border-2 border-[#d38b8b] text-[#d38b8b]'
                    }`}
                  >
                    <Check size={12} strokeWidth={isCompleted ? 3.5 : 2} />
                  </div>

                  {/* Línea vertical discontinua hacia el siguiente hito */}
                  {idx < timelineEvents.length - 1 && (
                    <div className="w-0 flex-1 border-l-2 border-dashed border-[#e8dcdc] my-1 min-h-[36px] sm:min-h-[44px]" />
                  )}
                </div>

                {/* Columna Información Derecha */}
                <div className="flex-1 pb-5 pl-1 pt-1">
                  <p 
                    className={`font-bold text-sm sm:text-base leading-tight ${
                      isFirstCompleted || isCompleted
                        ? 'text-[#4a3933]'
                        : 'text-[#d38b8b]'
                    }`}
                  >
                    {event.label === 'DeliveredToAgency' ? 'Entregado a Agencia' : event.label}
                  </p>
                  <p className="text-xs sm:text-sm text-[#887870] mt-1 leading-snug max-w-sm">
                    {description}
                  </p>
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
