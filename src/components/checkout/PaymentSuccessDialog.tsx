"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Check, CreditCard, Mail, PackageCheck, Smartphone } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

export interface PaymentSuccess {
  amount: number;
  balanceDue: number;
  method?: 'card' | 'yape';
}

interface Props extends PaymentSuccess {
  orderCode: string;
  trackingCode?: string;
  onClose: () => void;
}

/** Confirmación clara apenas Mercado Pago aprueba el pago (adelanto, total o saldo). */
export function PaymentSuccessDialog({ amount, balanceDue, method, orderCode, trackingCode, onClose }: Props) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const fullyPaid = balanceDue <= 0;
  const MethodIcon = method === 'yape' ? Smartphone : CreditCard;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#2b201c]/55 backdrop-blur-sm sm:items-center sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-success-title"
        className="relative w-full max-w-md overflow-hidden rounded-t-[2rem] bg-[#fffdf9] px-6 pb-7 pt-10 text-center shadow-2xl animate-in zoom-in-95 fade-in duration-300 sm:rounded-[2rem]"
        onClick={e => e.stopPropagation()}
      >
        {/* Brillo suave detrás del check */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_50%_0%,rgba(79,117,91,0.18),transparent_70%)]" />

        <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/20" />
          <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#5f8f6b] to-[#3f6b4c] text-white shadow-lg shadow-emerald-900/20">
            <Check className="h-10 w-10" strokeWidth={3} />
          </span>
        </div>

        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#4f755b]">Pago aprobado</p>
        <h2 id="payment-success-title" className="mt-1 font-serif text-3xl font-bold text-[#4a3933]">
          {fullyPaid ? '¡Tu pedido está pagado!' : '¡Recibimos tu adelanto!'}
        </h2>

        <div className="mx-auto mt-5 inline-flex items-center gap-3 rounded-2xl border border-[#e8dcdc] bg-white px-5 py-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fdf8ee] text-[#c8a96b]">
            <MethodIcon className="h-4 w-4" />
          </span>
          <span className="text-left">
            <span className="block font-serif text-2xl font-bold leading-none text-[#4a3933]">{formatCurrency(amount)}</span>
            <span className="text-xs text-[#887870]">{method === 'yape' ? 'con Yape' : 'con tarjeta'} · pedido {orderCode}</span>
          </span>
        </div>

        <p className="mx-auto mt-5 max-w-xs text-sm leading-relaxed text-[#6b5a50]">
          {fullyPaid
            ? 'Empezamos a preparar tu detalle. Te avisamos en cada paso hasta la entrega.'
            : <>Ya empezamos tu pedido. Te falta <strong className="text-[#4a3933]">{formatCurrency(balanceDue)}</strong>, que pagas aquí mismo antes de la entrega; te avisamos cuando esté listo.</>}
        </p>

        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-[#887870]">
          <Mail className="h-3.5 w-3.5 text-[#c8a96b]" /> Te enviamos la confirmación a tu correo.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <Link
            href={trackingCode ? `/seguimiento/${trackingCode}` : '/seguimiento'}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#4a3933] text-sm font-bold text-white transition hover:bg-[#3a2d28]"
          >
            <PackageCheck className="h-4 w-4 text-[#e8c98a]" /> Ver mi pedido
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="h-12 rounded-full border border-[#e8dcdc] bg-white text-sm font-bold text-[#4a3933] transition hover:border-[#c8a96b]"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
