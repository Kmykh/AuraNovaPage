"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, ChevronLeft, MessageCircle, PartyPopper, Receipt, ShieldCheck } from 'lucide-react';
import { useMounted } from '@/hooks/use-mounted';
import { useOrderSummary, orderSummaryKey } from '@/hooks/use-order-summary';
import { useBusinessSettings } from '@/hooks/use-info';
import { MercadoPagoCheckout, PaymentMethodChoice } from '@/components/checkout/MercadoPagoCheckout';
import { PaymentOverlay, PaymentOverlayState } from '@/components/checkout/PaymentSuccessDialog';
import { PurchaseSteps } from '@/app/(public)/carrito/CartClient';
import { OrderTicketModal } from '@/components/checkout/OrderTicketModal';
import {
  AmountBreakdown, DepositPaidState, OrderNotFoundState, PaymentDoneState, PaymentReportedState, QuotePendingState, QuoteReadyState, SummaryItems,
} from '@/components/checkout/PaymentStates';
import { OrderDetailsSnapshot } from '@/app/(public)/checkout/OrderSuccess';
import { formatCurrency } from '@/lib/formatters';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { ApiProblemDetails } from '@/lib/api-errors';
import { useMercadoPagoAvailable } from '@/hooks/use-mercadopago';
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
  const { data: onlinePayments, isLoading: isCheckingPayments } = useMercadoPagoAvailable();

  const router = useRouter();
  // Desde que toca "Pagar": la página se cubre con "Procesando…" y en la misma ventana sale la confirmación
  const [overlay, setOverlay] = useState<PaymentOverlayState | null>(null);
  // Desde el seguimiento ("Pagar el saldo") se abre directo el formulario del saldo
  const [payBalanceNow, setPayBalanceNow] = useState(() =>
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('saldo') === '1');
  const [reviewTimedOut, setReviewTimedOut] = useState(false);

  // Pago en revisión: se consulta solo cada pocos segundos hasta que Mercado Pago lo confirme (máx. 5 min)
  const [confirming, setConfirming] = useState<{ since: number; paid: number; method: PaymentMethodChoice } | null>(null);
  const handleProcessing = (active: boolean, method: PaymentMethodChoice) => {
    setReviewTimedOut(false);
    setOverlay(active ? { phase: 'processing', method } : null);
  };
  const handlePaid = (result: OnlinePaymentResult, method: PaymentMethodChoice) => {
    if (result.status === 'approved') {
      setOverlay({ phase: 'success', success: { amount: result.amountCharged, balanceDue: result.balanceDue, method } });
    } else {
      setOverlay({ phase: 'processing', method, slow: true });
      setConfirming({ since: Date.now(), paid: summary?.amountPaid ?? 0, method });
    }
    setPayBalanceNow(false);
    refresh();
  };
  useEffect(() => {
    if (!confirming) return;
    const timer = setInterval(async () => {
      const latest = await refetch();
      const paid = latest.data?.amountPaid ?? 0;
      if (paid > confirming.paid) {
        setOverlay({ phase: 'success', success: { amount: paid - confirming.paid, balanceDue: latest.data?.balanceDue ?? 0, method: confirming.method } });
        setConfirming(null);
      } else if (Date.now() - confirming.since > 5 * 60_000) {
        setOverlay(null);
        setReviewTimedOut(true);
        setConfirming(null);
      }
    }, 4000);
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

  const trackingHref = (trackingCode ?? summary.trackingCode) ? `/seguimiento/${trackingCode ?? summary.trackingCode}` : '/seguimiento';
  const closeOverlay = () => {
    const paid = overlay?.phase === 'success';
    setOverlay(null);
    // Pagó (todo o el adelanto): el siguiente paso es su seguimiento. Nunca se vuelve al formulario,
    // así no se envía un segundo pago con el mismo código de Yape
    if (paid) router.push(trackingHref);
  };
  const overlayView = overlay && (
    <PaymentOverlay state={overlay} orderCode={summary.orderCode} trackingCode={trackingCode ?? summary.trackingCode} onClose={closeOverlay} />
  );

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
      // Pagado por completo: la confirmación se muestra encima del estado final
      if (!hasBalance) return <>{overlayView}<PaymentDoneState summary={summary} trackingCode={trackingCode} /></>;
      // Con el adelanto pagado no se vuelve al formulario: el saldo se paga cuando el pedido esté listo (o antes si quiere)
      if (summary.status !== 'Ready' && !payBalanceNow) {
        return <>{overlayView}<DepositPaidState summary={summary} trackingCode={trackingCode} onPayNow={() => setPayBalanceNow(true)} /></>;
      }
  }

  const total = summary.total;
  const whatsappHref = settings?.whatsappNumber
    ? `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(`Hola Aura Nova, quiero pagar mi pedido ${summary.orderCode}.`)}`
    : null;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-[#887870] transition-colors hover:text-[#4a3933]">
          <ChevronLeft className="mr-0.5 h-4 w-4" /> Volver a la tienda
        </Link>
        <span className="hidden sm:block"><PurchaseSteps current={3} /></span>
      </div>

      <header className="mb-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#c8a96b]">Pedido {summary.orderCode}</p>
        <h1 className="mt-1 font-serif text-4xl font-bold tracking-tight text-[#4a3933] sm:text-5xl">{hasBalance ? 'Paga tu saldo' : 'Paga tu pedido'}</h1>
        <p className="mt-2 text-sm text-[#887870]">
          {hasBalance
            ? <>Ya pagaste {formatCurrency(summary.amountPaid)}. Te falta <strong className="text-[#4a3933]">{formatCurrency(summary.balanceDue)}</strong> para la entrega.</>
            : 'Elige cuánto pagar ahora y con qué medio. Es rápido y seguro.'}
        </p>
      </header>

      <div className="mb-5 space-y-3">
        {summary.paymentRejectionReason && (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800" role="alert">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
            <div>
              <p className="font-bold">Tu pago anterior no se pudo validar</p>
              <p className="mt-0.5">Motivo: {summary.paymentRejectionReason}. Puedes pagar de nuevo aquí con tarjeta o Yape.</p>
            </div>
          </div>
        )}
        {hasBalance && summary.status === 'Ready' && (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900" role="status">
            <PartyPopper className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            <div>
              <p className="font-bold">¡Tu pedido está listo!</p>
              <p className="mt-0.5">Paga el saldo y lo {summary.deliveryType === 'MeetingPoint' ? 'entregamos en el punto de encuentro' : 'enviamos'} de inmediato.</p>
            </div>
          </div>
        )}
        {reviewTimedOut && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900" role="status">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>Mercado Pago sigue revisando tu pago. Te avisaremos por correo apenas se confirme; no hace falta que pagues de nuevo.</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_360px] lg:gap-8">
        <div>
          {isCheckingPayments ? (
            <Skeleton variant="rect" className="h-96 w-full rounded-[2rem]" />
          ) : onlinePayments ? (
            overlay?.phase === 'success' ? (
              // Pago aprobado: mientras se ve la confirmación no queda un formulario debajo para volver a pagar
              <div className="h-96 w-full rounded-[2rem] bg-white/60" aria-hidden />
            ) : (
              // La clave reinicia el formulario después de cada pago (sin mensajes viejos)
              <MercadoPagoCheckout key={summary.amountPaid} summary={summary} onPaid={handlePaid} onProcessing={handleProcessing} />
            )
          ) : (
            <div className="rounded-[2rem] border border-[#c8a96b]/25 bg-white/95 p-8 text-center">
              <p className="font-serif text-xl font-bold text-[#4a3933]">Los pagos en línea se están activando</p>
              <p className="mt-1 text-sm text-[#887870]">Escríbenos y te ayudamos a completar el pago de tu pedido.</p>
              {whatsappHref && (
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#1fb959]">
                  <MessageCircle className="h-4 w-4" /> Escribir por WhatsApp
                </a>
              )}
            </div>
          )}
        </div>

        {/* Resumen siempre a la vista */}
        <aside className="order-first space-y-4 lg:sticky lg:top-28 lg:order-last">
          <section className="rounded-[2rem] border border-[#c8a96b]/30 bg-white p-5 shadow-[0_18px_40px_-28px_rgba(74,57,51,0.45)]">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="font-serif text-xl font-bold text-[#4a3933]">Tu pedido</h2>
              <span className="flex items-center gap-1.5 rounded-full bg-[#fdf6e7] px-2.5 py-1 text-[11px] font-semibold text-[#b58129]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#b58129]" /> {hasBalance ? 'Saldo pendiente' : 'Esperando tu pago'}
              </span>
            </div>
            {summary.items.length > 0 ? (
              <SummaryItems summary={summary} />
            ) : (
              <p className="text-sm text-[#887870]">Diseño personalizado según tus referencias.</p>
            )}
            <div className="mt-4">
              <AmountBreakdown summary={summary} />
            </div>
            {summary.amountPaid > 0 && (
              <dl className="mt-3 space-y-1.5 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3.5 text-sm">
                <div className="flex justify-between text-emerald-800"><dt>Ya pagaste</dt><dd className="font-semibold">{formatCurrency(summary.amountPaid)}</dd></div>
                <div className="flex justify-between font-bold text-[#4a3933]"><dt>Saldo</dt><dd>{formatCurrency(summary.balanceDue)}</dd></div>
              </dl>
            )}
            {snapshot && (
              <button
                type="button"
                onClick={() => setIsTicketOpen(true)}
                className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[#c8a96b]/40 bg-[#faf7f2] text-xs font-bold uppercase tracking-wider text-[#4a3933] hover:bg-[#f3ece2]"
              >
                <Receipt className="h-4 w-4 text-[#c8a96b]" /> Ver mi ticket
              </button>
            )}
          </section>
          <div className="flex items-start gap-3 rounded-2xl bg-white/70 p-4 text-xs leading-relaxed text-[#6b5a50]">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#4f755b]" />
            <p>
              Tu pago lo procesa Mercado Pago. Apenas se apruebe te enviamos la confirmación a tu correo.
              {whatsappHref && <> ¿Algún problema? <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#8f6d28] underline-offset-2 hover:underline">Escríbenos</a>.</>}
            </p>
          </div>
        </aside>
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
      {overlayView}
    </div>
  );
}
