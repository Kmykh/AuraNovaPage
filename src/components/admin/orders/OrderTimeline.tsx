"use client";

import React from 'react';
import { OrderStatus, DeliveryType } from '@/types/enums';
import { getOrderStatusInfo, formatDate } from '@/lib/order-helpers';
import { AdminOrderDetailResponse } from '@/types/orders';

interface OrderTimelineProps {
  order: AdminOrderDetailResponse;
}

export function OrderTimeline({ order }: OrderTimelineProps) {
  // Configurar las etapas según el tipo de entrega y si es personalizado
  const getStages = () => {
    const stages = [];
    
    // Normalizar el status a número para comparaciones seguras
    const currentStatus = typeof order.status === 'string' 
      ? (OrderStatus as unknown as Record<string, number>)[order.status] ?? parseInt(order.status, 10)
      : order.status;
    
    // Si es personalizado, siempre empieza por cotización
    if (order.isCustomOrder || order.quote) {
      stages.push({
        label: 'Cotización',
        status: order.quote?.quoteStatus === 'Ready' || currentStatus >= OrderStatus.WaitingPayment ? 'completed' : 'current',
        date: order.quote?.quotedAt ? formatDate(order.quote.quotedAt) : null,
      });
    }

    // 1. Pedido / Pago
    stages.push({
      label: 'Pedido recibido',
      status: currentStatus >= OrderStatus.WaitingPayment ? 'completed' : 'current',
      date: order.createdAt ? formatDate(order.createdAt) : null,
    });

    let paymentLabel = 'Esperando pago';
    if (currentStatus >= OrderStatus.PaymentConfirmed) paymentLabel = 'Pago confirmado';
    else if (currentStatus === OrderStatus.PaymentReported || (typeof order.status === 'string' && order.status === 'PaymentReported')) paymentLabel = 'Comprobante subido, pendiente de revisión';

    stages.push({
      label: paymentLabel,
      status: currentStatus >= OrderStatus.PaymentConfirmed ? 'completed' : (currentStatus >= OrderStatus.WaitingPayment ? 'current' : 'pending'),
      date: order.payment?.verifiedAt ? formatDate(order.payment.verifiedAt) : null,
    });

    // 3. Elaboración
    stages.push({
      label: 'En elaboración',
      status: currentStatus >= OrderStatus.Ready ? 'completed' : (currentStatus === OrderStatus.Preparing ? 'current' : 'pending'),
      date: order.startedAt ? formatDate(order.startedAt) : null,
      estimated: order.estimatedReadyAt ? formatDate(order.estimatedReadyAt) : null,
    });

    // 4. Específicos por Delivery Type
    if (order.deliveryType === DeliveryType.NationalShipping) {
      stages.push({
        label: 'Listo para envío',
        status: currentStatus >= OrderStatus.DeliveredToAgency ? 'completed' : (currentStatus === OrderStatus.Ready ? 'current' : 'pending'),
        date: order.readyAt ? formatDate(order.readyAt) : null,
      });
      stages.push({
        label: 'Entregado a agencia',
        status: currentStatus >= OrderStatus.Delivered ? 'completed' : (currentStatus === OrderStatus.DeliveredToAgency ? 'current' : 'pending'),
        date: order.deliveredToAgencyAt ? formatDate(order.deliveredToAgencyAt) : null,
      });
      stages.push({
        label: 'Recibido',
        status: currentStatus >= OrderStatus.Delivered ? 'completed' : 'pending',
        date: null, // Asumimos que no lo trackeamos, pero es el fin del flujo
      });
    } else if (order.deliveryType === DeliveryType.MeetingPoint) {
      stages.push({
        label: 'Listo para entrega',
        status: currentStatus >= OrderStatus.Delivered ? 'completed' : (currentStatus === OrderStatus.Ready ? 'current' : 'pending'),
        date: order.readyAt ? formatDate(order.readyAt) : null,
      });
      stages.push({
        label: 'Recibido',
        status: currentStatus >= OrderStatus.Delivered ? 'completed' : 'pending',
        date: null,
      });
    } else {
      stages.push({
        label: 'Listo',
        status: currentStatus >= OrderStatus.Shipped ? 'completed' : (currentStatus === OrderStatus.Ready ? 'current' : 'pending'),
        date: order.readyAt ? formatDate(order.readyAt) : null,
      });
      stages.push({
        label: 'En reparto',
        status: currentStatus >= OrderStatus.Delivered ? 'completed' : (currentStatus === OrderStatus.Shipped ? 'current' : 'pending'),
        date: null,
      });
      stages.push({
        label: 'Recibido',
        status: currentStatus >= OrderStatus.Delivered ? 'completed' : 'pending',
        date: null,
      });
    }

    return stages;
  };

  const stages = getStages();

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-sage/10 mb-6">
      <h3 className="font-serif text-lg text-brown font-semibold mb-6">Progreso del Pedido</h3>
      
      <div className="relative">
        <div className="absolute top-5 left-0 w-full h-[2px] bg-sage/20 -z-10" />
        
        <div className="flex justify-between w-full">
          {stages.map((stage, idx) => {
            const isCompleted = stage.status === 'completed';
            const isCurrent = stage.status === 'current';
            const isPending = stage.status === 'pending';
            
            return (
              <div key={idx} className="flex flex-col items-center relative group" style={{ width: `${100 / stages.length}%` }}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-colors
                  ${isCompleted ? 'bg-sage text-white' : ''}
                  ${isCurrent ? 'bg-gold text-white animate-pulse' : ''}
                  ${isPending ? 'bg-cream/50 text-sage' : ''}
                `}>
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-sm font-semibold">{idx + 1}</span>
                  )}
                </div>
                <div className="text-center mt-3 px-1">
                  <p className={`text-[10px] sm:text-xs font-medium leading-tight ${isCurrent || isCompleted ? 'text-brown' : 'text-sage'}`}>
                    {stage.label}
                  </p>
                  {stage.date && (
                    <p className="text-[9px] text-sage mt-1 leading-tight hidden sm:block">{stage.date}</p>
                  )}
                  {stage.estimated && isCurrent && (
                    <p className="text-[9px] text-gold mt-1 leading-tight border border-gold/30 rounded bg-gold/5 px-1 py-0.5 inline-block">
                      Est: {stage.estimated}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
