"use client";

import React, { useState } from 'react';
import { AlertCircle, Check, Info, Loader2, Lock } from 'lucide-react';
import { OrderPaymentSummary, OnlinePaymentResult } from '@/types/orders';
import { OnlinePaymentsService } from '@/services/online-payments.service';
import { useMercadoPago } from '@/hooks/use-mercadopago';
import { YAPE_MAX_AMOUNT, waitForDeviceId } from '@/lib/mercadopago';
import { ApiProblemDetails } from '@/lib/api-errors';
import { formatCurrency } from '@/lib/formatters';
import { Button } from '@/components/ui/Button';
import { readSavedCustomer } from '@/lib/saved-customer';
import { MercadoPagoLogo } from './MercadoPagoLogo';
import { CardFields, CardPaymentData } from './CardFields';
import { CardMethodIcon, YapeLogo } from './PaymentIcons';

export type PaymentMethodChoice = 'card' | 'yape';

interface MercadoPagoCheckoutProps {
  summary: OrderPaymentSummary;
  /** Se llama cuando un pago se aprueba (o queda en proceso) para recargar el estado del pedido */
  onPaid: (result: OnlinePaymentResult, method: PaymentMethodChoice) => void;
  /** true al tocar "Pagar" (la página se cubre con "Procesando…"); false si el pago se rechaza o falla */
  onProcessing: (active: boolean, method: PaymentMethodChoice) => void;
}

type Notice = { tone: 'error' | 'info'; text: string } | null;

const errorText = (error: unknown) =>
  error instanceof ApiProblemDetails && error.detail && error.status && error.status < 500
    ? error.detail
    : 'No pudimos procesar el pago. Revisa tu conexión e inténtalo de nuevo.';

function StepTitle({ number, children }: { number: number; children: React.ReactNode }) {
  return (
    <h3 className="mb-3 flex items-center gap-2.5 text-sm font-bold text-[#4a3933]">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#4a3933] text-[11px] text-white">{number}</span>
      {children}
    </h3>
  );
}

/**
 * Pago dentro de la página con Mercado Pago: tarjeta (campos seguros de MercadoPago.js) o Yape (celular + código de aprobación).
 * En el primer pago el cliente elige el 50% o el total; si ya pagó el adelanto, solo se cobra el saldo.
 */
export function MercadoPagoCheckout({ summary, onPaid, onProcessing }: MercadoPagoCheckoutProps) {
  const { data: mp, isError: sdkFailed, refetch: retrySdk } = useMercadoPago(true);

  const isBalance = summary.amountPaid > 0;
  const total = summary.total ?? 0;
  const deposit = summary.depositAmount ?? null;
  const [payFull, setPayFull] = useState(true);
  const [method, setMethod] = useState<PaymentMethodChoice>('card');
  const [notice, setNotice] = useState<Notice>(null);

  const offersDeposit = !isBalance && deposit != null && deposit < total;
  const amount = isBalance ? summary.balanceDue : payFull || !offersDeposit ? total : deposit!;
  const yapeAllowed = amount <= YAPE_MAX_AMOUNT;

  // Lo que el cliente ya escribió al pedir en este dispositivo: no tiene que volver a escribirlo
  const [savedCustomer] = useState(readSavedCustomer);
  const [phone, setPhone] = useState(savedCustomer.phone ?? '');
  const [otp, setOtp] = useState('');
  const [isPayingYape, setIsPayingYape] = useState(false);
  const savedEmail = /^\S+@\S+\.\S+$/.test(savedCustomer.email ?? '') ? savedCustomer.email : undefined;

  const handleResult = (result: OnlinePaymentResult, paidWith: PaymentMethodChoice) => {
    if (result.status === 'rejected') {
      onProcessing(false, paidWith);
      setNotice({ tone: 'error', text: result.message });
      return;
    }
    onPaid(result, paidWith);
  };

  const handleError = (error: unknown, paidWith: PaymentMethodChoice, fallback?: string) => {
    onProcessing(false, paidWith);
    setNotice({ tone: 'error', text: error instanceof ApiProblemDetails || !fallback ? errorText(error) : fallback });
  };

  // Tarjeta: el formulario ya creó el token (los datos de la tarjeta nunca pasan por nuestro servidor)
  const payWithCard = async (card: CardPaymentData) => {
    setNotice(null);
    try {
      const result = await OnlinePaymentsService.pay(summary.orderId, {
        method: 'card',
        token: card.token,
        paymentMethodId: card.paymentMethodId,
        paymentTypeId: card.paymentTypeId,
        installments: card.installments,
        payFull,
        payerEmail: savedEmail,
        identificationType: card.identificationType,
        identificationNumber: card.identificationNumber,
        deviceId: await waitForDeviceId(),
      });
      handleResult(result, 'card');
    } catch (error) {
      handleError(error, 'card');
    }
  };

  const payWithYape = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mp) return;
    const phoneNumber = phone.replace(/\D/g, '');
    const code = otp.replace(/\D/g, '');
    if (phoneNumber.length !== 9) {
      setNotice({ tone: 'error', text: 'Ingresa el celular de 9 dígitos asociado a tu Yape.' });
      return;
    }
    if (code.length !== 6) {
      setNotice({ tone: 'error', text: 'Ingresa el código de aprobación de 6 dígitos que ves en tu app Yape.' });
      return;
    }

    setNotice(null);
    setIsPayingYape(true);
    onProcessing(true, 'yape');
    try {
      // El token de Yape es de un solo uso: se genera en cada intento
      const yapeToken = await mp.yape({ otp: code, phoneNumber }).create();
      const result = await OnlinePaymentsService.pay(summary.orderId, {
        method: 'yape',
        token: yapeToken.id,
        phone: phoneNumber,
        payFull,
        deviceId: await waitForDeviceId(),
      });
      handleResult(result, 'yape');
      if (result.status !== 'approved') setOtp('');
    } catch (error) {
      setOtp('');
      handleError(error, 'yape', 'No pudimos validar tu Yape. Revisa el celular y el código e inténtalo de nuevo.');
    } finally {
      setIsPayingYape(false);
    }
  };

  if (sdkFailed) {
    return (
      <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-800">
        <p className="font-semibold">No pudimos cargar Mercado Pago.</p>
        <p className="mt-1">Revisa tu conexión o desactiva el bloqueador de anuncios para esta página.</p>
        <Button type="button" variant="outline" className="mt-4 rounded-full" onClick={() => retrySdk()}>Reintentar</Button>
      </div>
    );
  }

  const methods = [
    { key: 'card' as const, label: 'Tarjeta', hint: 'Crédito o débito', icon: CardMethodIcon, ring: 'border-[#4a3933]' },
    { key: 'yape' as const, label: 'Yape', hint: 'Código de aprobación', icon: YapeLogo, ring: 'border-[#742284]' },
  ];

  return (
    <section className="overflow-hidden rounded-[2rem] border border-[#e8dcdc] bg-white shadow-[0_24px_50px_-30px_rgba(74,57,51,0.45)]">
      <div className="space-y-7 p-5 sm:p-8">
        {/* 1. Cuánto paga */}
        {isBalance ? (
          <div className="flex items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-[#fdf8ee] to-[#fffdf8] p-4 sm:p-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#8f6d28]">Saldo a pagar</p>
              <p className="text-xs text-[#887870]">Ya pagaste {formatCurrency(summary.amountPaid)}</p>
            </div>
            <p className="font-serif text-3xl font-bold text-[#4a3933]">{formatCurrency(summary.balanceDue)}</p>
          </div>
        ) : offersDeposit ? (
          <div>
            <StepTitle number={1}>¿Cuánto pagas ahora?</StepTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Monto a pagar">
              {[
                { full: false, title: 'Adelanto del 50%', value: deposit!, hint: `Empezamos tu pedido y pagas ${formatCurrency(total - deposit!)} antes de la entrega` },
                { full: true, title: 'Pago total', value: total, hint: 'Pagas todo ahora y no te queda saldo' },
              ].map(option => {
                const active = payFull === option.full;
                return (
                  <button
                    key={option.title}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => { setPayFull(option.full); setNotice(null); }}
                    className={`rounded-2xl border-2 p-4 text-left transition ${
                      active ? 'border-[#c8a96b] bg-[#fffbf3] shadow-[0_10px_24px_-14px_rgba(200,169,107,0.8)]' : 'border-[#efe6dd] bg-white hover:border-[#c8a96b]/50'
                    }`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-[#4a3933]">{option.title}</span>
                      <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${active ? 'border-[#c8a96b] bg-[#c8a96b] text-white' : 'border-[#d9cfc8]'}`}>
                        {active && <Check className="h-3 w-3" strokeWidth={3} />}
                      </span>
                    </span>
                    <span className="mt-2 block font-serif text-3xl font-bold text-[#4a3933]">{formatCurrency(option.value)}</span>
                    <span className="mt-1 block text-xs leading-snug text-[#887870]">{option.hint}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#faf7f2] p-4">
            <p className="text-sm font-semibold text-[#4a3933]">Total a pagar</p>
            <p className="font-serif text-2xl font-bold text-[#4a3933]">{formatCurrency(total)}</p>
          </div>
        )}

        {/* 2. Cómo paga */}
        <div>
          <StepTitle number={isBalance || !offersDeposit ? 1 : 2}>¿Cómo quieres pagar?</StepTitle>
          <div className="grid grid-cols-2 gap-2.5" role="tablist" aria-label="Medio de pago">
            {methods.map(item => {
              const active = method === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => { setMethod(item.key); setNotice(null); }}
                  className={`relative flex items-center gap-3 rounded-2xl border-2 p-3 text-left transition sm:p-3.5 ${
                    active ? `${item.ring} bg-white shadow-[0_10px_24px_-16px_rgba(74,57,51,0.6)]` : 'border-[#efe6dd] bg-[#fdfbf8] hover:border-[#4a3933]/25'
                  }`}
                >
                  <item.icon className={`h-10 w-10 shrink-0 transition ${active ? '' : 'opacity-60 grayscale-[35%]'}`} />
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-[#4a3933]">{item.label}</span>
                    <span className="block text-[11px] leading-tight text-[#887870]">{item.hint}</span>
                  </span>
                  {active && (
                    <span className={`absolute right-2.5 top-2.5 flex h-4 w-4 items-center justify-center rounded-full text-white ${item.key === 'yape' ? 'bg-[#742284]' : 'bg-[#4a3933]'}`}>
                      <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {notice && (
            <div
              className={`mt-4 flex items-start gap-2.5 rounded-2xl border p-3.5 text-sm ${
                notice.tone === 'error' ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-amber-200 bg-amber-50 text-amber-800'
              }`}
              role="alert"
            >
              {notice.tone === 'error' ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> : <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin" />}
              <p>{notice.text}</p>
            </div>
          )}

          <div className="mt-5">
            {/* Queda montado aunque elija Yape: al volver a "Tarjeta" no se pierde lo que escribió */}
            <div className={method === 'card' ? undefined : 'hidden'}>
              {mp ? (
                <CardFields mp={mp} amount={amount} onProcessing={active => onProcessing(active, 'card')} onPay={payWithCard} />
              ) : (
                <div className="space-y-3 py-2" aria-label="Cargando formulario seguro">
                  {[...Array(4)].map((_, i) => <div key={i} className="h-12 animate-pulse rounded-2xl bg-[#faf7f2]" />)}
                </div>
              )}
            </div>
            {method === 'card' ? null : !yapeAllowed ? (
              <p className="flex items-start gap-2.5 rounded-2xl bg-[#faf7f2] p-4 text-sm text-[#6b5a50]">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#c8a96b]" />
                Yape permite pagos de hasta {formatCurrency(YAPE_MAX_AMOUNT)}. Paga con tarjeta{offersDeposit ? ' o elige el adelanto del 50%' : ''}.
              </p>
            ) : (
              <form onSubmit={payWithYape} className="space-y-4">
                <ol className="grid grid-cols-1 gap-2 rounded-2xl bg-[#f7f0f9] p-4 text-xs text-[#5b2a67] sm:grid-cols-3">
                  <li><strong className="block text-[#742284]">1. Abre Yape</strong>En tu celular.</li>
                  <li><strong className="block text-[#742284]">2. Menú → Código de aprobación</strong>Cambia cada pocos minutos.</li>
                  <li><strong className="block text-[#742284]">3. Escríbelo aquí</strong>Junto a tu número.</li>
                </ol>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-bold text-[#887870]">Celular de tu Yape</span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      maxLength={11}
                      value={phone}
                      onChange={e => setPhone(e.target.value.replace(/[^\d ]/g, ''))}
                      placeholder="987 654 321"
                      className="h-12 w-full rounded-2xl border border-[#e8dcdc] bg-white px-4 text-base text-[#4a3933] outline-none transition focus:border-[#742284] focus:ring-4 focus:ring-[#742284]/10"
                      disabled={isPayingYape}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-bold text-[#887870]">Código de aprobación</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="• • • • • •"
                      className="h-12 w-full rounded-2xl border border-[#e8dcdc] bg-white px-4 text-center font-mono text-xl tracking-[0.5em] text-[#4a3933] outline-none transition focus:border-[#742284] focus:ring-4 focus:ring-[#742284]/10"
                      disabled={isPayingYape}
                    />
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={!mp || isPayingYape}
                  className="flex h-13 w-full items-center justify-center gap-2 rounded-full bg-[#742284] text-sm font-bold text-white shadow-lg shadow-[#742284]/25 transition hover:bg-[#5e1b6b] disabled:opacity-50"
                >
                  {isPayingYape ? <><Loader2 className="h-4 w-4 animate-spin" /> Procesando…</> : <>Pagar {formatCurrency(amount)} con Yape</>}
                </button>
                <p className="text-center text-[11px] text-[#887870]">Revisa que tu límite de Yape (S/ 500, 900 o 2,000) cubra el monto.</p>
              </form>
            )}
          </div>
        </div>
      </div>

      <footer className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-t border-[#f1e9e4] bg-[#fdfbf8] px-5 py-3.5 text-[11px] text-[#887870]">
        <span className="flex items-center gap-1.5 font-semibold text-[#4a3933]"><MercadoPagoLogo className="h-4 w-4" /> Pago seguro con Mercado Pago</span>
        <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> Aura Nova no ve ni guarda los datos de tu tarjeta</span>
      </footer>
    </section>
  );
}
