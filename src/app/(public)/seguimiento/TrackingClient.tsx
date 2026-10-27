"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ChevronLeft, Share2, Copy, Check, BadgeCheck, MessageCircle, CalendarDays, Sparkles,
} from 'lucide-react';
import { useTracking } from '@/hooks/use-tracking';
import { useBusinessSettings } from '@/hooks/use-info';
import { TrackingHero } from '@/components/tracking/TrackingHero';
import { TrackingTimeline } from '@/components/tracking/TrackingTimeline';
import { TrackingOrderSummary, TrackingCustomBrief, TrackingDeliveryCard } from '@/components/tracking/TrackingDetails';
import { TrackingOrderDetailsModal } from '@/components/tracking/TrackingOrderDetailsModal';
import { trackingPayment } from '@/components/tracking/TrackingMoney';
import { ErrorState } from '@/components/ui/ErrorState';
import { ApiProblemDetails, isTransientApiError } from '@/lib/api-errors';
import { TransientApiErrorState } from '@/components/shared/TransientApiErrorState';
import { FlowerWaterfallLoader } from '@/components/ui/FlowerWaterfallLoader';
import { formatCurrency } from '@/lib/formatters';
import { formatLongDate, statusName } from '@/lib/tracking-progress';
import { trackingUrl } from '@/lib/tracking-code';
import { saveRecentTracking } from '@/lib/recent-tracking';
import { PublicTrackingResponse } from '@/types/tracking';

import flo1 from '@/app/(public)/images/flo1.png';
import flo5 from '@/app/(public)/images/flo5.png';

function whatsappLink(rawNumber: string | undefined, message: string) {
  const number = (rawNumber || '51950482596').replace(/\D/g, '');
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function TrackingResult({ trackingCode }: { trackingCode: string }) {
  const router = useRouter();
  const { data: tracking, isLoading, error, refetch } = useTracking(trackingCode);
  const { data: settings } = useBusinessSettings();
  const [showTicket, setShowTicket] = useState(false);

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md items-center justify-center px-4 pb-8 pt-24">
        <FlowerWaterfallLoader message="Buscando tu pedido..." subMessage="Estamos obteniendo los detalles más recientes." />
      </div>
    );
  }

  if (error || !tracking) {
    if (error && isTransientApiError(error)) {
      return (
        <div className="mx-auto max-w-md px-4 pb-8 pt-24">
          <TransientApiErrorState
            title="No pudimos consultar tu pedido"
            message="Ocurrió una dificultad técnica temporal. Intenta nuevamente o contáctanos."
            onRetry={() => refetch()}
            whatsappMessage={`Hola Aura Nova. Quiero saber el estado de mi pedido con código de seguimiento ${trackingCode}.`}
          />
        </div>
      );
    }

    const status = error instanceof ApiProblemDetails ? error.status : undefined;
    return (
      <div className="mx-auto max-w-md px-4 pb-8 pt-24">
        <ErrorState
          title={status === 404 ? 'No encontramos ese pedido' : status === 429 ? 'Demasiadas consultas' : 'Error de conexión'}
          message={
            status === 404 ? `Revisa que el código ${trackingCode} esté bien escrito.`
            : status === 429 ? 'Espera unos segundos antes de intentar nuevamente.'
            : 'Revisa tu conexión a internet e inténtalo de nuevo.'
          }
          onRetry={() => (status === 404 ? router.push('/seguimiento') : refetch())}
        />
      </div>
    );
  }

  return (
    <TrackingView
      tracking={tracking}
      trackingCode={trackingCode}
      whatsappNumber={settings?.whatsappNumber}
      onBack={() => router.push('/seguimiento')}
      onOpenTicket={() => setShowTicket(true)}
      ticket={
        <TrackingOrderDetailsModal
          isOpen={showTicket}
          onClose={() => setShowTicket(false)}
          tracking={tracking}
          trackingCode={trackingCode}
        />
      }
    />
  );
}

interface TrackingViewProps {
  tracking: PublicTrackingResponse;
  trackingCode: string;
  whatsappNumber?: string;
  onBack: () => void;
  onOpenTicket: () => void;
  ticket: React.ReactNode;
}

function TrackingView({ tracking, trackingCode, whatsappNumber, onBack, onOpenTicket, ticket }: TrackingViewProps) {
  const [copied, setCopied] = useState(false);
  // Este dispositivo recuerda el pedido para volver a verlo sin escribir el código
  useEffect(() => { saveRecentTracking(trackingCode, tracking.orderCode); }, [trackingCode, tracking.orderCode]);
  const firstName = tracking.customerFirstName || 'AuraLover';
  const moneyState = trackingPayment(tracking).state;
  const helpMessage = moneyState === 'refund_pending' || moneyState === 'refunded'
    ? `Hola Aura Nova, tengo una consulta sobre la devolución de mi pedido ${tracking.orderCode}.`
    : `Hola Aura Nova, tengo una consulta sobre mi pedido ${tracking.orderCode}.`;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(trackingCode);
      setCopied(true);
      toast.success('Código copiado');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('No se pudo copiar el código');
    }
  };

  const share = async () => {
    const url = trackingUrl(trackingCode);
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Mi pedido en Aura Nova', text: `Sigue mi pedido ${tracking.orderCode}`, url });
        return;
      } catch { /* el usuario canceló */ }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Enlace copiado');
    } catch {
      toast.error('No se pudo copiar el enlace');
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4.5rem)] w-full overflow-hidden bg-[#faf7f2] px-4 pb-16 pt-20 sm:pt-24">
      {/* Flores de fondo */}
      <div className="pointer-events-none absolute -right-24 top-24 w-[260px] opacity-40 mix-blend-multiply animate-float-gentle sm:w-[340px]">
        <Image src={flo5} alt="" width={340} height={340} style={{ width: 'auto', height: 'auto' }} />
      </div>
      <div className="pointer-events-none absolute -left-24 bottom-10 w-[240px] opacity-30 mix-blend-multiply animate-float-gentle-reverse">
        <Image src={flo1} alt="" width={300} height={300} style={{ width: 'auto', height: 'auto' }} />
      </div>

      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-5 sm:gap-6">
        {/* Encabezado */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-2">
            <button onClick={onBack} className="-ml-2 mt-1 rounded-full p-1.5 text-[#4a3933] transition hover:bg-stone-200/50" title="Volver">
              <ChevronLeft size={22} />
            </button>
            <div>
              <h1 className="font-serif text-3xl font-bold text-[#4a3933] sm:text-4xl">¡Hola, {firstName}!</h1>
              <p className="mt-1 text-sm text-[#887870]">Así va tu pedido en este momento.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyCode}
              className="group inline-flex items-center gap-2 rounded-full border border-[#e8dcdc] bg-white px-4 py-2 shadow-xs transition hover:border-[#c8a96b]"
              title="Copiar código de seguimiento"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#887870]">Código</span>
              <span className="font-mono text-sm font-bold tracking-[0.15em] text-[#4a3933]">{trackingCode}</span>
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-[#c8a96b] group-hover:scale-110" />}
            </button>
            <button
              onClick={share}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#4a3933] text-white shadow-md transition hover:bg-[#5e4a42]"
              title="Compartir seguimiento"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </header>

        <TrackingHero tracking={tracking} />

        <NextStepCard tracking={tracking} trackingCode={trackingCode} whatsappNumber={whatsappNumber} />

        <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-5">
          <div className="flex flex-col gap-5 sm:gap-6 lg:col-span-3">
            <TrackingOrderSummary tracking={tracking} onOpenTicket={onOpenTicket} />
            <TrackingCustomBrief tracking={tracking} />
            <TrackingTimeline events={tracking.timeline} />
          </div>
          <div className="flex flex-col gap-5 sm:gap-6 lg:col-span-2">
            <TrackingDeliveryCard tracking={tracking} />

            <section className="rounded-[1.75rem] bg-gradient-to-br from-[#fdf5f5] to-[#fdf8ee] p-6 text-center shadow-[0_10px_30px_-12px_rgba(211,139,139,0.25)]">
              <Sparkles className="mx-auto h-6 w-6 text-[#d38b8b]" />
              <h3 className="mt-2 font-serif text-lg font-bold text-[#4a3933]">
                {moneyState === 'refund_pending' || moneyState === 'refunded' ? '¿Dudas sobre tu devolución?' : '¿Tienes alguna duda?'}
              </h3>
              <p className="mt-1 text-sm text-[#887870]">Escríbenos y te respondemos por WhatsApp.</p>
              <a
                href={whatsappLink(whatsappNumber, helpMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#25D366]/25 transition hover:-translate-y-0.5 hover:bg-[#1fb959]"
              >
                <MessageCircle className="h-4 w-4" /> Escribir por WhatsApp
              </a>
            </section>
          </div>
        </div>
      </div>

      {ticket}
    </div>
  );
}

function NextStepCard({ tracking, trackingCode, whatsappNumber }: { tracking: PublicTrackingResponse; trackingCode: string; whatsappNumber?: string }) {
  const router = useRouter();
  const status = statusName(tracking.status);
  const total = tracking.costs?.total ?? tracking.total ?? null;

  // La página de pago lee montos y estado del backend; aquí solo se recuerda el código de seguimiento
  const goToPayment = () => {
    if (!tracking.orderId) return;
    sessionStorage.setItem('tempPaymentContext', JSON.stringify({ orderCode: tracking.orderCode, trackingCode }));
    router.push(`/pago/${tracking.orderId}`);
  };

  const eta = tracking.estimates?.estimatedReadyAt ? formatLongDate(tracking.estimates.estimatedReadyAt) : null;

  if (status === 'QuoteReady' && tracking.orderId) {
    return (
      <ActionCard
        title="Revisa y acepta tu cotización"
        message={total != null ? `El total de tu pedido personalizado es ${formatCurrency(total)}.` : 'Tu cotización ya está disponible.'}
        primary={
          <button onClick={goToPayment} className={primaryButton}>
            <BadgeCheck className="h-4 w-4" /> Ver cotización y aceptar
          </button>
        }
        secondary={<WhatsAppButton number={whatsappNumber} message={`Hola Aura Nova, tengo una consulta sobre la cotización de mi pedido ${tracking.orderCode}.`} label="Consultar" />}
      />
    );
  }

  // Lo que falta pagar (y el botón para pagarlo) se muestra arriba, en el estado del pedido
  if (eta && ['PaymentConfirmed', 'Preparing', 'Ready'].includes(status)) {
    return (
      <div className="flex items-center gap-3 rounded-[1.5rem] border border-[#c8a96b]/30 bg-white px-5 py-4 shadow-xs">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fdf8ee] text-[#b08a4e]">
          <CalendarDays className="h-5 w-5" />
        </span>
        <p className="text-sm text-[#5e4a42]">
          Estimamos que estará listo el <span className="font-bold text-[#4a3933]">{eta}</span>.
        </p>
      </div>
    );
  }

  return null;
}

const primaryButton =
  'inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#c8a96b] to-[#b08a4e] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#c8a96b]/30 transition hover:-translate-y-0.5 disabled:opacity-60 sm:w-auto';

function ActionCard({ title, message, primary, secondary }: { title: string; message: string; primary: React.ReactNode; secondary?: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-[1.75rem] border-2 border-[#c8a96b]/40 bg-white p-5 shadow-[0_14px_40px_-16px_rgba(200,169,107,0.45)] animate-fade-in-up sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#d38b8b]">Siguiente paso</p>
        <h3 className="mt-1 font-serif text-xl font-bold text-[#4a3933]">{title}</h3>
        <p className="mt-1 text-sm text-[#887870]">{message}</p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:shrink-0">
        {primary}
        {secondary}
      </div>
    </section>
  );
}

function WhatsAppButton({ number, message, label }: { number?: string; message: string; label: string }) {
  return (
    <a
      href={whatsappLink(number, message)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-2 rounded-full border border-[#e8dcdc] px-5 py-3 text-sm font-bold text-[#5e4a42] transition hover:border-[#25D366] hover:text-[#1a9c4c]"
    >
      <MessageCircle className="h-4 w-4" /> {label}
    </a>
  );
}
