"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useMounted } from '@/hooks/use-mounted';
import { OrderStatus } from '@/types/checkout';
import { PaymentInstructions } from '@/components/checkout/PaymentInstructions';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, ChevronLeft, Receipt } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { PaymentEvidenceUploader } from '@/components/checkout/PaymentEvidenceUploader';
import { PaymentReportedState } from '@/components/checkout/PaymentReportedState';
import { OrderTicketModal } from '@/components/checkout/OrderTicketModal';
import { OrderDetailsSnapshot } from '@/app/(public)/checkout/OrderSuccess';

import { NationalQuotePendingState } from '@/components/quotes/NationalQuotePendingState';
import { QuoteReadyCard } from '@/components/quotes/QuoteReadyCard';

interface PaymentClientProps {
  orderId: string;
}

export function PaymentClient({ orderId }: PaymentClientProps) {
  const isMounted = useMounted();
  
  const getInitialContext = () => {
    if (typeof window !== 'undefined') {
      const rawContext = sessionStorage.getItem('tempPaymentContext');
      if (rawContext) {
        try {
          return JSON.parse(rawContext);
        } catch {
          // Ignore parse errors
        }
      }
    }
    return { orderCode: '', total: null, status: null, shippingCost: 0 };
  };

  const initialContext = getInitialContext();
  const [orderCode] = useState<string>(initialContext.orderCode);
  const [total, setTotal] = useState<number | null>(initialContext.total);
  const [shippingCost] = useState<number>(initialContext.shippingCost || 0);
  const [status, setStatus] = useState<OrderStatus | null>(initialContext.status);
  const [isReported, setIsReported] = useState(false);
  const [isTicketOpen, setIsTicketOpen] = useState(false);
  const [snapshot, setSnapshot] = useState<OrderDetailsSnapshot | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem('latestOrderSnapshot');
        if (stored) {
          setSnapshot(JSON.parse(stored));
        }
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full flex justify-center py-20">
        <div className="h-8 w-8 border-4 border-sage/20 border-t-gold rounded-full animate-spin"></div>
      </div>
    );
  }

  // 1. Error state (Missing Context)
  if (status === null && !isReported) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center bg-cream/30 rounded-2xl border border-sage/10 p-8">
        <AlertTriangle className="w-12 h-12 text-sage/40 mx-auto mb-4" />
        <h2 className="text-xl font-serif font-semibold text-brown mb-2">Información no disponible</h2>
        <p className="text-sage mb-6">No encontramos los detalles de tu pedido actual. Es posible que hayas refrescado la página.</p>
        <Link href="/productos" tabIndex={-1}>
          <Button variant="outline">Volver al catálogo</Button>
        </Link>
      </div>
    );
  }

  // 2. Waiting Quote Protector (Phase 8)
  if (status === OrderStatus.WaitingQuote) {
    return <NationalQuotePendingState orderCode={orderCode} total={total} />;
  }

  // 3. Quote Ready (Phase 8 Workaround)
  if (status === OrderStatus.QuoteReady) {
    return (
      <QuoteReadyCard 
        orderId={orderId} 
        orderCode={orderCode} 
        subtotal={total} 
        shippingCost={shippingCost} 
        onAcceptSuccess={() => {
          setStatus(OrderStatus.WaitingPayment);
          const newTotal = total !== null ? total + shippingCost : null;
          setTotal(newTotal);
          sessionStorage.setItem('tempPaymentContext', JSON.stringify({
            orderCode,
            total: newTotal,
            status: OrderStatus.WaitingPayment
          }));
        }} 
      />
    );
  }

  // 4. Success State (Phase 7)
  if (isReported || status === OrderStatus.PaymentReported) {
    return <PaymentReportedState orderCode={orderCode} />;
  }

  // 5. Main Payment Form
  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Navegación y Título Compacto */}
      <div className="flex items-center justify-between">
        <Link 
          href="/" 
          className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-[#887870] hover:text-[#4a3933] transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-0.5" />
          Volver a la tienda
        </Link>
        <span className="text-[11px] text-[#887870]">
          Paso final de confirmación
        </span>
      </div>
      
      {/* Barra Superior Compacta de Resumen y Acceso al Ticket */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-[#c8a96b]/30 p-4 sm:p-5 shadow-[0_10px_30px_-10px_rgba(200,169,107,0.1)] flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Izquierda: Info de Pedido y Estado */}
        <div className="flex flex-wrap items-center gap-3 text-center sm:text-left">
          <div className="w-10 h-10 rounded-2xl bg-[#faf7f2] border border-[#c8a96b]/30 flex items-center justify-center text-[#c8a96b] shrink-0">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <span className="text-xs uppercase font-bold tracking-widest text-[#887870]">Pedido</span>
              <span className="font-mono font-bold text-[#4a3933] text-sm bg-[#faf7f2] px-2 py-0.5 rounded-md border border-[#c8a96b]/20">
                {orderCode || 'PED-PENDIENTE'}
              </span>
              <span className="text-[11px] font-semibold text-[#b58129] bg-[#fdf6e7] border border-[#b58129]/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#b58129] animate-pulse" />
                Esperando abono
              </span>
            </div>
            <p className="text-xs text-[#887870] mt-0.5">
              {snapshot?.items?.length 
                ? `${snapshot.items.length} ${snapshot.items.length === 1 ? 'producto personalizado' : 'productos personalizados'}` 
                : 'Detalles de tu orden listos'}
            </p>
          </div>
        </div>

        {/* Derecha: Importe y Botón Ver Ticket */}
        <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-[#e8dcdc]/60">
          <div className="text-left sm:text-right">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#887870] block">Total a Pagar</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-serif font-bold text-[#4a3933]">
                {total !== null ? formatCurrency(total) : '---'}
              </span>
              {total !== null && (
                <span className="text-[11px] text-[#c8a96b] font-medium hidden sm:inline">
                  (50%: {formatCurrency(total * 0.5)})
                </span>
              )}
            </div>
          </div>

          <Button
            type="button"
            onClick={() => setIsTicketOpen(true)}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider rounded-full bg-[#faf7f2] hover:bg-[#f3ece2] text-[#4a3933] border border-[#c8a96b]/40 shadow-xs hover:shadow-md px-4 py-2.5 transition-all hover:scale-[1.02] active:scale-95"
          >
            <Receipt className="w-4 h-4 text-[#c8a96b]" />
            <span>Ver mi Ticket</span>
          </Button>
        </div>
      </div>

      {/* Grid de 2 Columnas Compactas: QR e Instrucciones + Subida de Comprobante */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
        {/* Left Column: QR and Info */}
        <PaymentInstructions total={total} orderCode={orderCode} />

        {/* Right Column: Uploader */}
        <PaymentEvidenceUploader 
          orderId={orderId} 
          onSuccess={() => {
            setIsReported(true);
            setStatus(OrderStatus.PaymentReported);
          }} 
        />
      </div>

      {/* Modal con Ticket de Compra Completo */}
      <OrderTicketModal
        isOpen={isTicketOpen}
        onClose={() => setIsTicketOpen(false)}
        orderCode={orderCode}
        total={total}
        shippingCost={shippingCost}
        snapshot={snapshot}
      />
    </div>
  );
}
