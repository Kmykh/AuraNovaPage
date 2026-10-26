"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, ChevronLeft, Receipt } from 'lucide-react';
import { useMounted } from '@/hooks/use-mounted';
import { useOrderSummary, orderSummaryKey } from '@/hooks/use-order-summary';
import { useMercadoPago } from '@/hooks/use-mercadopago';
import { PaymentInstructions } from '@/components/checkout/PaymentInstructions';
import { PaymentEvidenceUploader } from '@/components/checkout/PaymentEvidenceUploader';
import { OrderTicketModal } from '@/components/checkout/OrderTicketModal';
import {
  AmountBreakdown, OrderNotFoundState, PaymentDoneState, PaymentReportedState, QuotePendingState, QuoteReadyState, SummaryItems,
} from '@/components/checkout/PaymentStates';
import { OrderDetailsSnapshot } from '@/app/(public)/checkout/OrderSuccess';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatCurrency } from '@/lib/formatters';
import { ApiProblemDetails } from '@/lib/api-errors';

interface PaymentClientProps {
  orderId: string;
}

interface StoredContext {
  orderCode?: string;
  trackingCode?: string;
}

/** Datos que quedaron en este navegador al crear el pedido (ticket y código de seguimiento). */
function readStoredContext(): { context: StoredContext; snapshot: OrderDetailsSnapshot | null } {
  if (typeof window === 'undefined') return { context: {}, snapshot: null };
  try {
    const context = JSON.parse(sessionStorage.getItem('tempPaymentContext') || '{}') as StoredContext;
    const snapshot = JSON.parse(sessionStorage.getItem('latestOrderSnapshot') || 'null') as OrderDetailsSnapshot | null;
    return { context, snapshot };
  } catch {
    return { context: {}, snapshot: null };
  }
}

/**
 * Página de pago. El estado y los montos se leen siempre del backend (antes se tomaban del navegador
 * al crear el pedido y por eso un pedido ya cotizado seguía mostrando "por cotizar").
 */
export function PaymentClient({ orderId }: PaymentClientProps) {
  const isMounted = useMounted();
  const queryClient = useQueryClient();
  const { data: summary, isLoading, error, refetch, isFetching } = useOrderSummary(orderId);
  const [stored] = useState(readStoredContext);
  // Mercado Pago se inicializa en cuanto el pedido está listo para pagar (aquí irá el formulario de pago)
  useMercadoPago(summary?.status === 'WaitingPayment');
  const [isTicketOpen, setIsTicketOpen] = useState(false);

  const refresh = () => queryClient.invalidateQueries({ queryKey: orderSummaryKey(orderId) });

  if (!isMounted || isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-5">
        <Skeleton variant="rect" className="h-24 w-full rounded-3xl" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Skeleton variant="rect" className="h-80 w-full rounded-[2rem]" />
          <Skeleton variant="rect" className="h-80 w-full rounded-[2rem]" />
        </div>
      </div>
    );
  }

  if (error || !summary) {
    if (error instanceof ApiProblemDetails && error.status === 404) return <OrderNotFoundState />;
    return (
      <ErrorState
        title="No pudimos cargar tu pedido"
        message="Revisa tu conexión e inténtalo de nuevo."
        onRetry={() => refetch()}
      />
    );
  }

  // El código de seguimiento solo se conoce en el navegador donde se hizo el pedido
  const sameOrder = stored.context.orderCode === summary.orderCode;
  const trackingCode = sameOrder ? stored.context.trackingCode : undefined;
  const snapshot = sameOrder ? stored.snapshot : null;

  switch (summary.status) {
    case 'WaitingQuote':
      return <QuotePendingState summary={summary} trackingCode={trackingCode} isRefreshing={isFetching} />;
    case 'QuoteReady':
      return <QuoteReadyState summary={summary} onAccepted={refresh} />;
    case 'PaymentReported':
      return <PaymentReportedState orderCode={summary.orderCode} trackingCode={trackingCode} />;
    case 'WaitingPayment':
      break;
    default:
      return <PaymentDoneState summary={summary} trackingCode={trackingCode} />;
  }

  const total = summary.total;

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex items-center justify-between">
        <Link href="/" className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-[#887870] transition-colors hover:text-[#4a3933]">
          <ChevronLeft className="mr-0.5 h-4 w-4" /> Volver a la tienda
        </Link>
        <span className="text-[11px] text-[#887870]">Paso final</span>
      </div>

      {summary.paymentRejectionReason && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800" role="alert">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
          <div>
            <p className="font-bold">Tu comprobante anterior no pudo validarse</p>
            <p className="mt-0.5">Motivo: {summary.paymentRejectionReason}. Sube una nueva captura donde se vea bien el pago.</p>
          </div>
        </div>
      )}

      {/* Resumen del pedido y monto a pagar */}
      <div className="grid grid-cols-1 gap-5 rounded-3xl border border-[#c8a96b]/30 bg-white/95 p-5 shadow-[0_10px_30px_-10px_rgba(200,169,107,0.1)] backdrop-blur-md md:grid-cols-[1fr_280px]">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#887870]">Pedido</span>
            <span className="rounded-md border border-[#c8a96b]/20 bg-[#faf7f2] px-2 py-0.5 font-mono text-sm font-bold text-[#4a3933]">{summary.orderCode}</span>
            <span className="flex items-center gap-1 rounded-full border border-[#b58129]/20 bg-[#fdf6e7] px-2.5 py-0.5 text-[11px] font-semibold text-[#b58129]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#b58129]" /> Esperando tu pago
            </span>
          </div>
          {summary.items.length > 0 ? (
            <SummaryItems summary={summary} />
          ) : (
            <p className="text-sm text-[#887870]">Diseño personalizado según tus referencias.</p>
          )}
        </div>
        <div className="space-y-3">
          <AmountBreakdown summary={summary} />
          {total != null && (
            <p className="text-center text-[11px] text-[#887870]">
              Puedes pagar el total o un adelanto del 50% ({formatCurrency(total * 0.5)}).
            </p>
          )}
          {snapshot && (
            <Button
              type="button"
              onClick={() => setIsTicketOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-[#c8a96b]/40 bg-[#faf7f2] text-xs font-bold uppercase tracking-wider text-[#4a3933] hover:bg-[#f3ece2]"
            >
              <Receipt className="h-4 w-4 text-[#c8a96b]" /> Ver mi ticket
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2 lg:gap-8">
        <PaymentInstructions total={total} orderCode={summary.orderCode} />
        <PaymentEvidenceUploader orderId={orderId} onSuccess={refresh} />
      </div>

      {snapshot && (
        <OrderTicketModal
          isOpen={isTicketOpen}
          onClose={() => setIsTicketOpen(false)}
          orderCode={summary.orderCode}
          total={total}
          shippingCost={summary.deliveryCost ?? 0}
          snapshot={snapshot}
        />
      )}
    </div>
  );
}
