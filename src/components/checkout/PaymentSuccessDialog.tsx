"use client";

import React from 'react';
import Link from 'next/link';
import { Check, CreditCard, Lock, Mail, PackageCheck, Smartphone } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { MercadoPagoLogo } from './MercadoPagoLogo';

export interface PaymentSuccess {
  amount: number;
  balanceDue: number;
  method?: 'card' | 'yape';
}

export type PaymentOverlayState =
  | { phase: 'processing'; method: 'card' | 'yape'; slow?: boolean }
  | { phase: 'success'; success: PaymentSuccess };

interface Props {
  state: PaymentOverlayState;
  orderCode: string;
  trackingCode?: string | null;
  onClose: () => void;
}

/**
 * Lo que ve el cliente desde que toca "Pagar": la página queda cubierta mientras Mercado Pago procesa
 * y en la misma ventana aparece la confirmación. Así no ve el formulario de nuevo ni dos avisos seguidos.
 */
export function PaymentOverlay({ state, orderCode, trackingCode, onClose }: Props) {
  const processing = state.phase === 'processing';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#f7f1ea]/80 p-4 backdrop-blur-md animate-in fade-in duration-200"
      onClick={processing ? undefined : onClose}
      aria-live="polite"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={processing ? 'Procesando tu pago' : 'Pago aprobado'}
        className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-[#efe6dd] bg-white px-6 pb-7 pt-10 text-center shadow-[0_40px_80px_-30px_rgba(74,57,51,0.45)]"
        onClick={e => e.stopPropagation()}
      >
        {processing ? <Processing slow={state.slow} method={state.method} /> : (
          <Success success={state.success} orderCode={orderCode} trackingCode={trackingCode} onClose={onClose} />
        )}
      </div>
    </div>
  );
}

function Processing({ slow, method }: { slow?: boolean; method: 'card' | 'yape' }) {
  return (
    <div className="animate-in fade-in duration-300">
      <div className="relative mx-auto mb-6 h-20 w-20">
        <span className="absolute inset-0 rounded-full border-4 border-[#f1e9e4]" />
        <span className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-[#c8a96b] [animation-duration:1.1s]" />
        <span className="absolute inset-0 flex items-center justify-center text-[#4a3933]">
          {method === 'yape' ? <Smartphone className="h-7 w-7" /> : <CreditCard className="h-7 w-7" />}
        </span>
      </div>
      <h2 className="font-serif text-2xl font-bold text-[#4a3933]">{slow ? 'Confirmando tu pago…' : 'Procesando tu pago…'}</h2>
      <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-[#887870]">
        {slow
          ? 'Mercado Pago está terminando de confirmarlo. Puede tardar unos segundos; no hace falta que pagues de nuevo.'
          : 'Estamos confirmando el pago con Mercado Pago. No cierres ni recargues esta página.'}
      </p>
      <p className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-[#887870]">
        <MercadoPagoLogo className="h-4 w-4" /> Pago seguro · <Lock className="h-3 w-3" /> datos protegidos
      </p>
    </div>
  );
}

function Success({ success, orderCode, trackingCode, onClose }: { success: PaymentSuccess; orderCode: string; trackingCode?: string | null; onClose: () => void }) {
  const fullyPaid = success.balanceDue <= 0;
  const MethodIcon = success.method === 'yape' ? Smartphone : CreditCard;
  const trackingHref = trackingCode ? `/seguimiento/${trackingCode}` : '/seguimiento';

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_50%_0%,rgba(79,117,91,0.16),transparent_70%)]" />
      <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#5f8f6b] to-[#3f6b4c] text-white shadow-lg shadow-emerald-900/20">
        <Check className="h-10 w-10" strokeWidth={3} />
      </div>
      <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#4f755b]">{fullyPaid ? 'Pago aprobado' : 'Adelanto pagado'}</p>
      <h2 className="mt-1 font-serif text-3xl font-bold text-[#4a3933]">
        {fullyPaid ? '¡Tu pedido está pagado!' : '¡Adelanto pagado!'}
      </h2>

      <div className="mx-auto mt-5 inline-flex items-center gap-3 rounded-2xl border border-[#e8dcdc] bg-[#fffdf9] px-5 py-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fdf8ee] text-[#c8a96b]">
          <MethodIcon className="h-4 w-4" />
        </span>
        <span className="text-left">
          <span className="block font-serif text-2xl font-bold leading-none text-[#4a3933]">{formatCurrency(success.amount)}</span>
          <span className="text-xs text-[#887870]">{success.method === 'yape' ? 'con Yape' : 'con tarjeta'} · pedido {orderCode}</span>
        </span>
      </div>

      <p className="mx-auto mt-5 max-w-xs text-sm leading-relaxed text-[#6b5a50]">
        {fullyPaid
          ? 'Empezamos a preparar tu detalle y te avisamos en cada paso hasta la entrega.'
          : <>Ya empezamos tu pedido. Te falta <strong className="text-[#4a3933]">{formatCurrency(success.balanceDue)}</strong>: lo pagas antes de la entrega desde tu seguimiento, con un código de Yape nuevo o tu tarjeta. Te avisamos cuando esté listo.</>}
      </p>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-[#887870]">
        <Mail className="h-3.5 w-3.5 text-[#c8a96b]" /> Te enviamos la confirmación a tu correo.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <Link href={trackingHref} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#4a3933] text-sm font-bold text-white transition hover:bg-[#3a2d28]">
          <PackageCheck className="h-4 w-4 text-[#e8c98a]" /> Ver mi seguimiento
        </Link>
        {/* También lleva al seguimiento: después de pagar no se vuelve al formulario */}
        <button type="button" onClick={onClose} className="h-12 rounded-full border border-[#e8dcdc] bg-white text-sm font-bold text-[#4a3933] transition hover:border-[#c8a96b]">
          Entendido
        </button>
      </div>
    </div>
  );
}
