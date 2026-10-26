"use client";

import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle2, CreditCard, Info, Loader2, Lock, Smartphone } from 'lucide-react';
import { OrderPaymentSummary, OnlinePaymentResult } from '@/types/orders';
import { OnlinePaymentsService } from '@/services/online-payments.service';
import { useMercadoPago } from '@/hooks/use-mercadopago';
import { BrickController, YAPE_MAX_AMOUNT, waitForDeviceId } from '@/lib/mercadopago';
import { ApiProblemDetails } from '@/lib/api-errors';
import { formatCurrency } from '@/lib/formatters';
import { Button } from '@/components/ui/Button';
import { readSavedCustomer } from '@/lib/saved-customer';
import { MercadoPagoLogo } from './MercadoPagoLogo';

interface MercadoPagoCheckoutProps {
  summary: OrderPaymentSummary;
  /** Se llama cuando un pago se aprueba (o queda en proceso) para recargar el estado del pedido */
  onPaid: (result: OnlinePaymentResult) => void;
}

type Method = 'card' | 'yape';
type Notice = { tone: 'error' | 'info'; text: string } | null;

const CARD_CONTAINER_ID = 'auranova-card-payment-brick';

const errorText = (error: unknown) =>
  error instanceof ApiProblemDetails && error.detail && error.status && error.status < 500
    ? error.detail
    : 'No pudimos procesar el pago. Revisa tu conexión e inténtalo de nuevo.';

/**
 * Pago dentro de la página con Mercado Pago: tarjeta (Card Payment Brick) o Yape (celular + código de aprobación).
 * En el primer pago el cliente elige el 50% o el total; si ya pagó el adelanto, solo se cobra el saldo.
 */
export function MercadoPagoCheckout({ summary, onPaid }: MercadoPagoCheckoutProps) {
  const { data: mp, isError: sdkFailed, refetch: retrySdk } = useMercadoPago(true);

  const isBalance = summary.amountPaid > 0;
  const total = summary.total ?? 0;
  const deposit = summary.depositAmount ?? null;
  const [payFull, setPayFull] = useState(true);
  const [method, setMethod] = useState<Method>('card');
  const [notice, setNotice] = useState<Notice>(null);
  // Cambia para volver a montar el formulario de tarjeta (cada token sirve una sola vez)
  const [cardAttempt, setCardAttempt] = useState(0);
  const [readyKey, setReadyKey] = useState<string | null>(null);

  const amount = isBalance ? summary.balanceDue : payFull || deposit == null ? total : deposit;
  const cardKey = `${amount}-${cardAttempt}`;
  const yapeAllowed = amount <= YAPE_MAX_AMOUNT;

  // Lo que el cliente ya escribió al pedir en este dispositivo: no tiene que volver a escribirlo
  const [savedCustomer] = useState(readSavedCustomer);
  const [phone, setPhone] = useState(savedCustomer.phone ?? '');
  const [otp, setOtp] = useState('');
  const [isPayingYape, setIsPayingYape] = useState(false);

  const savedEmail = /^\S+@\S+\.\S+$/.test(savedCustomer.email ?? '') ? savedCustomer.email : undefined;

  // Mantiene las últimas opciones para el callback del formulario de tarjeta (se crea una vez por monto)
  const latest = useRef({ payFull, onPaid });
  useEffect(() => {
    latest.current = { payFull, onPaid };
  }, [payFull, onPaid]);

  const handleResult = (result: OnlinePaymentResult) => {
    if (result.status === 'approved') {
      toast.success('¡Pago aprobado!', { description: result.message });
      latest.current.onPaid(result);
    } else if (result.status === 'pending') {
      setNotice({ tone: 'info', text: result.message });
      latest.current.onPaid(result);
    } else {
      setNotice({ tone: 'error', text: result.message });
    }
  };

  // Formulario de tarjeta de Mercado Pago (los datos de la tarjeta nunca pasan por nuestro servidor)
  useEffect(() => {
    if (!mp || method !== 'card') return;
    let controller: BrickController | null = null;
    let cancelled = false;
    const key = cardKey;

    mp.bricks()
      .create('cardPayment', CARD_CONTAINER_ID, {
        initialization: { amount, ...(savedEmail ? { payer: { email: savedEmail } } : {}) },
        customization: { paymentMethods: { maxInstallments: 12 }, visual: { style: { theme: 'default' } } },
        callbacks: {
          onReady: () => {
            if (!cancelled) setReadyKey(key);
          },
          onSubmit: async (formData, additionalData) => {
            setNotice(null);
            try {
              const result = await OnlinePaymentsService.pay(summary.orderId, {
                method: 'card',
                token: formData.token,
                paymentMethodId: formData.payment_method_id,
                paymentTypeId: additionalData?.paymentTypeId,
                installments: formData.installments,
                payFull: latest.current.payFull,
                payerEmail: formData.payer?.email,
                identificationType: formData.payer?.identification?.type,
                identificationNumber: formData.payer?.identification?.number,
                deviceId: await waitForDeviceId(),
              });
              handleResult(result);
              if (result.status === 'rejected') setCardAttempt(a => a + 1);
            } catch (error) {
              setNotice({ tone: 'error', text: errorText(error) });
              setCardAttempt(a => a + 1);
            }
          },
          onError: (error) => {
            console.error('Mercado Pago (tarjeta):', error);
          },
        },
      })
      .then((created) => {
        if (cancelled) created.unmount();
        else controller = created;
      })
      .catch((error) => {
        console.error('No se pudo mostrar el formulario de tarjeta', error);
        if (!cancelled) setNotice({ tone: 'error', text: 'No pudimos cargar el formulario de tarjeta. Recarga la página.' });
      });

    return () => {
      cancelled = true;
      try {
        controller?.unmount();
      } catch {
        // El contenedor ya no existe: no hay nada que desmontar
      }
    };
    // handleResult usa refs: el formulario solo se vuelve a crear si cambia el monto o tras un rechazo
  }, [mp, method, cardKey, amount, summary.orderId, savedEmail]);

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
      handleResult(result);
      if (result.status !== 'approved') setOtp('');
    } catch (error) {
      setOtp('');
      setNotice({
        tone: 'error',
        text: error instanceof ApiProblemDetails ? errorText(error) : 'No pudimos validar tu Yape. Revisa el celular y el código e inténtalo de nuevo.',
      });
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

  return (
    <section className="space-y-5 rounded-[2rem] border border-[#c8a96b]/25 bg-white/95 p-5 shadow-[0_15px_35px_-12px_rgba(200,169,107,0.18)] sm:p-7">
      {/* 1. Cuánto paga */}
      <div>
        <h2 className="font-serif text-xl font-bold text-[#4a3933]">{isBalance ? 'Paga tu saldo' : '¿Cuánto quieres pagar ahora?'}</h2>
        {isBalance ? (
          <p className="mt-1 text-sm text-[#887870]">
            Ya pagaste {formatCurrency(summary.amountPaid)}. Te falta <strong className="text-[#4a3933]">{formatCurrency(summary.balanceDue)}</strong>.
          </p>
        ) : deposit != null && deposit < total ? (
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Monto a pagar">
            {[
              { full: false, title: 'Adelanto del 50%', value: deposit, hint: `Empezamos tu pedido y pagas ${formatCurrency(total - deposit)} después` },
              { full: true, title: 'Pago total', value: total, hint: 'Pagas todo y no te queda saldo' },
            ].map(option => {
              const active = payFull === option.full;
              return (
                <button
                  key={option.title}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => { setPayFull(option.full); setNotice(null); }}
                  className={`rounded-2xl border p-4 text-left transition ${
                    active ? 'border-[#c8a96b] bg-[#fdf8ee] ring-2 ring-[#c8a96b]/25' : 'border-[#e8dcdc] bg-white hover:border-[#c8a96b]/50'
                  }`}
                >
                  <span className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#4a3933]">{option.title}</span>
                    <span className={`h-4 w-4 rounded-full border-2 ${active ? 'border-[#c8a96b] bg-[#c8a96b]' : 'border-[#d9cfc8]'}`} />
                  </span>
                  <span className="mt-1 block font-serif text-2xl font-bold text-[#4a3933]">{formatCurrency(option.value)}</span>
                  <span className="mt-0.5 block text-xs text-[#887870]">{option.hint}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="mt-1 text-sm text-[#887870]">Total a pagar: <strong className="text-[#4a3933]">{formatCurrency(total)}</strong></p>
        )}
      </div>

      {/* 2. Cómo paga */}
      <div>
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[#faf7f2] p-1.5" role="tablist" aria-label="Medio de pago">
          {[
            { key: 'card' as const, label: 'Tarjeta', icon: CreditCard },
            { key: 'yape' as const, label: 'Yape', icon: Smartphone },
          ].map(tab => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={method === tab.key}
              onClick={() => { setMethod(tab.key); setNotice(null); }}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition ${
                method === tab.key ? 'bg-white text-[#4a3933] shadow-sm' : 'text-[#887870] hover:text-[#4a3933]'
              }`}
            >
              <tab.icon className="h-4 w-4" /> {tab.label}
            </button>
          ))}
        </div>

        {notice && (
          <div
            className={`mt-4 flex items-start gap-2 rounded-xl border p-3 text-sm ${
              notice.tone === 'error' ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-amber-200 bg-amber-50 text-amber-800'
            }`}
            role="alert"
          >
            {notice.tone === 'error' ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> : <Info className="mt-0.5 h-4 w-4 shrink-0" />}
            <p>{notice.text}</p>
          </div>
        )}

        <div className="mt-4">
          {method === 'card' ? (
            <div>
              {(!mp || readyKey !== cardKey) && (
                <div className="flex items-center justify-center gap-2 py-10 text-sm text-[#887870]">
                  <Loader2 className="h-4 w-4 animate-spin" /> Cargando formulario seguro…
                </div>
              )}
              {/* Mercado Pago dibuja aquí el formulario de tarjeta */}
              <div id={CARD_CONTAINER_ID} />
            </div>
          ) : !yapeAllowed ? (
            <p className="rounded-xl bg-[#faf7f2] p-4 text-sm text-[#6b5a50]">
              Yape permite pagos de hasta {formatCurrency(YAPE_MAX_AMOUNT)}. Paga con tarjeta{!isBalance && deposit != null ? ' o elige el adelanto del 50%' : ''}.
            </p>
          ) : (
            <form onSubmit={payWithYape} className="space-y-4">
              <div>
                <label htmlFor="yape-phone" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#887870]">Celular de tu Yape</label>
                <input
                  id="yape-phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  maxLength={11}
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/[^\d ]/g, ''))}
                  placeholder="987 654 321"
                  className="w-full rounded-xl border border-[#e8dcdc] bg-[#faf7f2] px-4 py-3 text-base text-[#4a3933] outline-none focus:border-[#c8a96b] focus:bg-white"
                  disabled={isPayingYape}
                />
              </div>
              <div>
                <label htmlFor="yape-otp" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#887870]">Código de aprobación</label>
                <input
                  id="yape-otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="6 dígitos"
                  className="w-full rounded-xl border border-[#e8dcdc] bg-[#faf7f2] px-4 py-3 text-center font-mono text-xl tracking-[0.4em] text-[#4a3933] outline-none focus:border-[#c8a96b] focus:bg-white"
                  disabled={isPayingYape}
                />
                <p className="mt-1.5 text-xs text-[#887870]">
                  Ábrelo en tu app Yape → menú → <strong>Código de aprobación</strong>. Cambia cada pocos minutos.
                </p>
              </div>
              <Button
                type="submit"
                disabled={!mp || isPayingYape}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#742284] text-white hover:bg-[#5e1b6b]"
              >
                {isPayingYape ? <><Loader2 className="h-4 w-4 animate-spin" /> Procesando…</> : <>Pagar {formatCurrency(amount)} con Yape</>}
              </Button>
              <p className="text-center text-[11px] text-[#887870]">
                Revisa que tu límite de Yape (S/ 500, 900 o 2,000) cubra el monto.
              </p>
            </form>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center gap-1.5 border-t border-[#f1e9e4] pt-4 text-center">
        <p className="flex items-center gap-2 text-xs font-semibold text-[#4a3933]">
          <MercadoPagoLogo className="h-5 w-5" /> Pago seguro con Mercado Pago
        </p>
        <p className="flex items-center gap-1.5 text-[11px] text-[#887870]">
          <Lock className="h-3.5 w-3.5" /> Aura Nova no ve ni guarda los datos de tu tarjeta.
        </p>
      </div>
      {summary.status !== 'WaitingPayment' && isBalance && (
        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5" /> Tu pedido ya está en marcha. Lo entregamos cuando el saldo esté pagado.
        </p>
      )}
    </section>
  );
}
