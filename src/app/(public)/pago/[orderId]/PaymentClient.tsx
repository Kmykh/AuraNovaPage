"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useMounted } from '@/hooks/use-mounted';
import { OrderStatus } from '@/types/checkout';
import { PaymentInstructions } from '@/components/checkout/PaymentInstructions';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, ChevronLeft } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { PaymentEvidenceUploader } from '@/components/checkout/PaymentEvidenceUploader';
import { PaymentReportedState } from '@/components/checkout/PaymentReportedState';

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

  // 4. Main Payment Form
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-sage hover:text-brown transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Volver al inicio
        </Link>
      </div>
      
      {/* Resumen Superior */}
      <div className="bg-white rounded-xl border border-sage/20 p-5 mb-8 flex flex-col sm:flex-row justify-between items-center shadow-sm">
        <div className="text-center sm:text-left mb-4 sm:mb-0">
          <p className="text-sm text-sage mb-1">Total a pagar para el Pedido <span className="font-medium text-brown">{orderCode}</span></p>
          <p className="text-3xl font-bold text-brown">{total !== null ? formatCurrency(total) : '---'}</p>
        </div>
        <div className="bg-cream/50 px-4 py-2 rounded-lg text-sm text-brown border border-sage/10">
          Estado: <span className="font-semibold">Esperando pago</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left Column: QR and Info */}
        <div>
          <PaymentInstructions />
        </div>

        {/* Right Column: Uploader */}
        <div>
          <PaymentEvidenceUploader 
            orderId={orderId} 
            onSuccess={() => {
              setIsReported(true);
              setStatus(OrderStatus.PaymentReported);
            }} 
          />
        </div>
      </div>
    </div>
  );
}
