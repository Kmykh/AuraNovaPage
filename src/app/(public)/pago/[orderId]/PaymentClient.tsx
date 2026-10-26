"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, ChevronLeft, Loader2, MessageCircle, Receipt } from 'lucide-react';
import { useMounted } from '@/hooks/use-mounted';
import { useOrderSummary, orderSummaryKey } from '@/hooks/use-order-summary';
import { useBusinessSettings } from '@/hooks/use-info';
import { MercadoPagoCheckout } from '@/components/checkout/MercadoPagoCheckout';
import { OrderTicketModal } from '@/components/checkout/OrderTicketModal';
import {
  AmountBreakdown, OrderNotFoundState, PaymentDoneState, PaymentReportedState, QuotePendingState, QuoteReadyState, SummaryItems,
} from '@/components/checkout/PaymentStates';
import { OrderDetailsSnapshot } from '@/app/(public)/checkout/OrderSuccess';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { ApiProblemDetails } from '@/lib/api-errors';
import { isMercadoPagoConfigured } from '@/lib/mercadopago';
import { OnlinePaymentResult } from '@/types/orders';

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
  const { data: settings } = useBusinessSettings();
  const [isTicketOpen, setIsTicketOpen] = useState(false);

  const refresh = () => queryClient.invalidateQueries({ queryKey: orderSummaryKey(orderId) });

  // Pago en revisión: se consulta solo cada pocos segundos hasta que Mercado Pago lo confirme (máx. 5 min)
  const [confirming, setConfirming] = useState<{ since: number; paid: number } | null>(null);
  const handlePaid = (result: OnlinePaymentResult) => {
    if (result.status === 'pending') setConfirming({ since: Date.now(), paid: summary?.amountPaid ?? 0 });
    refresh();
  };
  useEffect(() => {
    if (!confirming) return;
    const timer = setInterval(async () => {
      const latest = await refetch();
      if ((latest.data?.amountPaid ?? 0) > confirming.paid || Date.now() - confirming.since > 5 * 60_000) setConfirming(null);
    }, 8000);
    return () => clearInterval(timer);
  }, [confirming, refetch]);

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

  // Con el adelanto del 50% el pedido avanza, y el saldo se paga aquí mismo
  const hasBalance = summary.amountPaid > 0 && summary.balanceDue > 0 && summary.status !== 'Cancelled';

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
      if (!hasBalance) return <PaymentDoneState summary={summary} trackingCode={trackingCode} />;
  }

  const total = summary.total;
  const whatsappHref = settings?.whatsappNumber
    ? `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(`Hola Aura Nova, quiero pagar mi pedido ${summary.orderCode}.`)}`
    : null;

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

      {hasBalance && summary.status === 'Ready' && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900" role="status">
          <p className="font-bold">¡Tu pedido está listo!</p>
          <p className="mt-0.5">Paga el saldo y lo {summary.deliveryType === 'MeetingPoint' ? 'entregamos en el punto de encuentro' : 'enviamos'} de inmediato.</p>
        </div>
      )}

      {/* Resumen del pedido y monto a pagar */}
      <div className="grid grid-cols-1 gap-5 rounded-3xl border border-[#c8a96b]/30 bg-white/95 p-5 shadow-[0_10px_30px_-10px_rgba(200,169,107,0.1)] backdrop-blur-md md:grid-cols-[1fr_280px]">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#887870]">Pedido</span>
            <span className="rounded-md border border-[#c8a96b]/20 bg-[#faf7f2] px-2 py-0.5 font-mono text-sm font-bold text-[#4a3933]">{summary.orderCode}</span>
            <span className="flex items-center gap-1 rounded-full border border-[#b58129]/20 bg-[#fdf6e7] px-2.5 py-0.5 text-[11px] font-semibold text-[#b58129]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#b58129]" /> {hasBalance ? 'Saldo pendiente' : 'Esperando tu pago'}
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
          {summary.amountPaid > 0 && (
            <dl className="space-y-1 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3 text-sm">
              <div className="flex justify-between text-emerald-800"><dt>Ya pagaste</dt><dd className="font-semibold">S/ {summary.amountPaid.toFixed(2)}</dd></div>
              <div className="flex justify-between font-bold text-[#4a3933]"><dt>Saldo</dt><dd>S/ {summary.balanceDue.toFixed(2)}</dd></div>
            </dl>
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

      {isMercadoPagoConfigured() ? (
        <>
          {confirming && (
            <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900" role="status">
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
              <p>Estamos confirmando tu pago con Mercado Pago. Esta página se actualizará sola; no hace falta que pagues de nuevo.</p>
            </div>
          )}
          <MercadoPagoCheckout summary={summary} onPaid={handlePaid} />
        </>
      ) : (
        <div className="rounded-[2rem] border border-[#c8a96b]/25 bg-white/95 p-6 text-center">
          <p className="font-serif text-lg font-bold text-[#4a3933]">Los pagos en línea se están activando</p>
          <p className="mt-1 text-sm text-[#887870]">Escríbenos y te ayudamos a completar el pago de tu pedido.</p>
          {whatsappHref && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#1fb959]"
            >
              <MessageCircle className="h-4 w-4" /> Escribir por WhatsApp
            </a>
          )}
        </div>
      )}

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
