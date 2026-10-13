"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  AlertTriangle, Ban, CheckCircle2, Clock, FileSearch, Gift, Hourglass, Package, PackageCheck, RefreshCw, Sparkles,
} from 'lucide-react';
import { OrderPaymentSummary } from '@/types/orders';
import { Button } from '@/components/ui/Button';
import { ItemOptions } from '@/components/shared/ItemOptions';
import { useAcceptQuote } from '@/hooks/use-accept-quote';
import { ApiProblemDetails } from '@/lib/api-errors';
import { formatCurrency, getImageUrl } from '@/lib/formatters';
import { trackingPath } from '@/lib/tracking-code';

const shellClass = 'mx-auto max-w-2xl rounded-[2rem] border border-[#c8a96b]/25 bg-white/95 p-6 text-center shadow-[0_15px_35px_-12px_rgba(200,169,107,0.18)] sm:p-10';

function TrackingButton({ trackingCode }: { trackingCode?: string | null }) {
  return (
    <Link href={trackingCode ? trackingPath(trackingCode) : '/seguimiento'} tabIndex={-1}>
      <Button className="flex w-full items-center justify-center gap-2 rounded-full sm:w-auto">
        <FileSearch className="h-4 w-4" /> Ver el seguimiento
      </Button>
    </Link>
  );
}

/** Desglose de montos (lo mismo que se cobra). */
export function AmountBreakdown({ summary }: { summary: OrderPaymentSummary }) {
  const isNational = summary.deliveryType === 'NationalShipping';
  return (
    <dl className="space-y-2 rounded-2xl bg-[#faf7f2] p-4 text-left text-sm">
      {summary.subtotal > 0 && (
        <div className="flex justify-between text-[#887870]"><dt>Productos</dt><dd>{formatCurrency(summary.subtotal)}</dd></div>
      )}
      {summary.customizationCost > 0 && (
        <div className="flex justify-between text-[#887870]">
          <dt>{summary.isCustomOrder ? 'Tu diseño personalizado' : 'Personalización'}</dt>
          <dd>{formatCurrency(summary.customizationCost)}</dd>
        </div>
      )}
      <div className="flex justify-between text-[#887870]">
        <dt>Entrega{summary.deliveryPlace ? ` · ${summary.deliveryPlace}` : ''}</dt>
        <dd>{isNational && !summary.deliveryCost ? 'Pagas en destino' : summary.deliveryCost ? formatCurrency(summary.deliveryCost) : 'Gratis'}</dd>
      </div>
      <div className="flex justify-between border-t border-[#e8dcdc] pt-2 text-base font-bold text-[#4a3933]">
        <dt>Total</dt>
        <dd>{summary.total != null ? formatCurrency(summary.total) : 'Por definir'}</dd>
      </div>
    </dl>
  );
}

/** Productos del pedido con lo que eligió el cliente. */
export function SummaryItems({ summary }: { summary: OrderPaymentSummary }) {
  if (!summary.items.length) return null;
  return (
    <ul className="divide-y divide-[#f1e9e4] text-left">
      {summary.items.map((item, index) => (
        <li key={`${item.productName}-${index}`} className="flex gap-3 py-3 first:pt-0 last:pb-0">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[#e8dcdc] bg-[#faf7f2]">
            {item.imageUrl ? (
              <Image src={getImageUrl(item.imageUrl)} alt={item.productName} fill sizes="56px" className="object-cover" />
            ) : (
              <Package className="absolute inset-0 m-auto h-5 w-5 text-[#d38b8b]/50" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex justify-between gap-2">
              <p className="truncate text-sm font-bold text-[#4a3933]">{item.quantity} × {item.productName}</p>
              <span className="shrink-0 text-sm font-semibold text-[#4a3933]">{formatCurrency(item.unitPrice * item.quantity)}</span>
            </div>
            <ItemOptions
              className="mt-1.5"
              colors={item.selectedColors}
              flowers={item.selectedFlowerTypes}
              hasLights={item.hasLights}
              hasButterfly={item.hasButterfly}
              hasPhraseCard={item.hasPhraseCard}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function QuotePendingState({ summary, trackingCode, isRefreshing }: { summary: OrderPaymentSummary; trackingCode?: string | null; isRefreshing: boolean }) {
  return (
    <div className={shellClass}>
      <div className="relative mx-auto mb-6 inline-flex">
        <span className="absolute inset-0 animate-ping rounded-full bg-[#c8a96b]/20" />
        <span className="relative flex h-20 w-20 items-center justify-center rounded-full border border-[#c8a96b]/30 bg-[#fdf8ee] text-[#c8a96b]">
          <Hourglass className="h-9 w-9" />
        </span>
      </div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b08a4e]">Pedido {summary.orderCode}</p>
      <h1 className="mt-1 font-serif text-3xl font-bold text-[#4a3933]">Estamos preparando tu cotización</h1>
      <p className="mx-auto mt-3 max-w-md text-[#887870]">
        {summary.isCustomOrder
          ? 'Revisamos tus fotos e indicaciones para darte el mejor precio. Te avisaremos por WhatsApp.'
          : 'Estamos calculando el costo final de tu pedido. Te avisaremos por WhatsApp.'}
      </p>

      <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#faf7f2] px-4 py-2 text-xs font-semibold text-[#8c6d36]">
        <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
        Esta página se actualiza sola apenas enviemos el precio
      </p>

      {summary.items.length > 0 && <div className="mt-6"><SummaryItems summary={summary} /></div>}

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <TrackingButton trackingCode={trackingCode} />
        <Link href="/productos" tabIndex={-1}>
          <Button variant="outline" className="w-full rounded-full sm:w-auto">Seguir viendo el catálogo</Button>
        </Link>
      </div>
    </div>
  );
}

export function QuoteReadyState({ summary, onAccepted }: { summary: OrderPaymentSummary; onAccepted: () => void }) {
  const { mutate: acceptQuote, isPending } = useAcceptQuote();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAccept = () => {
    setErrorMsg(null);
    acceptQuote(summary.orderId, {
      onSuccess: () => {
        toast.success('¡Cotización aceptada!', { description: 'Ya puedes realizar tu pago.' });
        onAccepted();
      },
      onError: (error) => {
        setErrorMsg(error instanceof ApiProblemDetails
          ? error.detail || 'La cotización ya no está disponible para aceptar.'
          : 'No pudimos conectarnos con Aura Nova. Inténtalo nuevamente.');
      },
    });
  };

  return (
    <div className="mx-auto max-w-xl overflow-hidden rounded-[2rem] border border-[#c8a96b]/30 bg-white shadow-[0_15px_35px_-12px_rgba(200,169,107,0.2)]">
      <div className="flex items-center gap-4 border-b border-[#e8dcdc] bg-gradient-to-r from-[#fdf8ee] to-white px-6 py-5">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#c8a96b]/30 bg-white text-[#c8a96b]">
          <PackageCheck className="h-6 w-6" />
        </span>
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#4a3933]">¡Tu cotización está lista!</h1>
          <p className="text-sm text-[#887870]">Pedido <span className="font-semibold text-[#4a3933]">{summary.orderCode}</span></p>
        </div>
      </div>

      <div className="space-y-5 p-6">
        {summary.items.length > 0 && <SummaryItems summary={summary} />}
        <AmountBreakdown summary={summary} />

        {summary.quoteNotes && (
          <blockquote className="rounded-2xl border-l-4 border-[#c8a96b] bg-[#fffdf8] px-4 py-3 text-left text-sm text-[#5e4a42]">
            <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#b08a4e]">Nota de Aura Nova</span>
            {summary.quoteNotes}
          </blockquote>
        )}

        {errorMsg && (
          <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-left text-sm text-red-600" aria-live="polite">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <p>{errorMsg}</p>
          </div>
        )}

        <Button
          size="lg"
          className="h-12 w-full rounded-full bg-[#c8a96b] text-base text-white hover:bg-[#b59555]"
          onClick={handleAccept}
          disabled={isPending}
        >
          {isPending ? 'Procesando…' : `Aceptar y pagar ${summary.total != null ? formatCurrency(summary.total) : ''}`}
        </Button>
        <p className="text-center text-xs text-[#887870]">
          ¿Quieres cambiar algo? Escríbenos por WhatsApp antes de aceptar.
        </p>
      </div>
    </div>
  );
}

export function PaymentReportedState({ orderCode, trackingCode }: { orderCode: string; trackingCode?: string | null }) {
  return (
    <div className={shellClass}>
      <div className="relative mx-auto mb-6 inline-flex">
        <span className="absolute inset-0 animate-ping rounded-full bg-emerald-100 opacity-70" />
        <span className="relative flex h-20 w-20 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-10 w-10" />
        </span>
      </div>
      <h1 className="font-serif text-3xl font-bold text-[#4a3933]">¡Recibimos tu comprobante!</h1>
      <p className="mx-auto mt-3 max-w-md text-[#887870]">
        Lo revisaremos en breve y te avisaremos por WhatsApp cuando tu pago esté confirmado. Luego empezamos a preparar tu pedido.
      </p>
      <div className="mx-auto mt-6 inline-flex flex-col items-center rounded-2xl border border-[#e8dcdc] bg-[#faf7f2] px-8 py-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#887870]">Pedido</span>
        <span className="font-serif text-2xl font-bold text-[#4a3933]">{orderCode}</span>
      </div>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <TrackingButton trackingCode={trackingCode} />
        <Link href="/productos" tabIndex={-1}>
          <Button variant="outline" className="w-full rounded-full sm:w-auto">Volver a la tienda</Button>
        </Link>
      </div>
    </div>
  );
}

export function PaymentDoneState({ summary, trackingCode }: { summary: OrderPaymentSummary; trackingCode?: string | null }) {
  const cancelled = summary.status === 'Cancelled';
  return (
    <div className={shellClass}>
      <span className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${cancelled ? 'bg-stone-100 text-stone-500' : 'bg-[#fdf8ee] text-[#c8a96b]'}`}>
        {cancelled ? <Ban className="h-9 w-9" /> : summary.status === 'Delivered' ? <Gift className="h-9 w-9" /> : <Sparkles className="h-9 w-9" />}
      </span>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b08a4e]">Pedido {summary.orderCode}</p>
      <h1 className="mt-1 font-serif text-3xl font-bold text-[#4a3933]">
        {cancelled ? 'Este pedido fue cancelado' : 'Tu pago ya está confirmado'}
      </h1>
      <p className="mx-auto mt-3 max-w-md text-[#887870]">
        {cancelled
          ? 'Si crees que es un error, escríbenos por WhatsApp y lo revisamos.'
          : `Estado actual: ${summary.statusLabel}. Puedes seguir cada paso en tu seguimiento.`}
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <TrackingButton trackingCode={trackingCode} />
      </div>
    </div>
  );
}

export function OrderNotFoundState() {
  return (
    <div className={shellClass}>
      <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#faf7f2] text-[#c8a96b]">
        <Clock className="h-8 w-8" />
      </span>
      <h1 className="font-serif text-2xl font-bold text-[#4a3933]">No encontramos este pedido</h1>
      <p className="mx-auto mt-2 max-w-md text-[#887870]">Revisa el enlace o busca tu pedido con el código de seguimiento que te enviamos.</p>
      <div className="mt-6 flex justify-center">
        <TrackingButton />
      </div>
    </div>
  );
}
