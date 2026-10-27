"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Clock, CreditCard, Loader2, Undo2, Wallet } from 'lucide-react';
import { PublicTrackingResponse, TrackingMoneyMovement, TrackingPayment } from '@/types/tracking';
import { formatCurrency } from '@/lib/formatters';
import { statusName } from '@/lib/tracking-progress';

/** El estado del dinero; con un backend anterior se arma con `costs`. */
export function trackingPayment(tracking: PublicTrackingResponse): TrackingPayment {
  if (tracking.payment) return tracking.payment;
  const total = tracking.costs?.total ?? tracking.total ?? 0;
  const paid = tracking.costs?.amountPaid ?? 0;
  const due = tracking.costs?.balanceDue ?? Math.max(0, total - paid);
  const cancelled = statusName(tracking.status) === 'Cancelled';
  return {
    state: cancelled ? (paid > 0 ? 'refund_pending' : 'none') : paid > 0 ? (due > 0 ? 'deposit' : 'paid') : 'unpaid',
    total, charged: paid, refunded: 0, netPaid: paid, balanceDue: cancelled ? 0 : due, movements: [],
  };
}

const shortDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' }) : null;

/** Yape se ve en la app; la tarjeta depende del banco. */
function refundHint(movements: TrackingMoneyMovement[]) {
  const methods = new Set(movements.map(m => m.method));
  const yape = methods.has('Yape');
  const card = [...methods].some(m => m !== 'Yape');
  if (yape && card) return 'En Yape lo ves en los movimientos de tu app. En tarjeta, tu banco puede tardar algunos días hábiles en mostrarlo.';
  if (yape) return 'Lo ves en los movimientos de tu app Yape.';
  return 'Tu banco puede tardar algunos días hábiles en mostrarlo en tu estado de cuenta. Si no lo ves, escríbenos.';
}

function Movements({ movements }: { movements: TrackingMoneyMovement[] }) {
  if (movements.length === 0) return null;
  return (
    <ul className="mt-3 divide-y divide-black/5 rounded-xl bg-white/70 px-3.5 text-sm">
      {movements.map((m, i) => {
        const refund = m.kind === 'refund';
        // Un pago después del adelanto es el saldo
        const afterDeposit = movements.slice(0, i).some(prev => prev.kind === 'payment' && prev.isDeposit);
        return (
          <li key={`${m.kind}-${m.date}-${i}`} className="flex items-center gap-3 py-2.5">
            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${refund ? 'bg-emerald-100 text-emerald-700' : 'bg-[#fdf8ee] text-[#b08a4e]'}`}>
              {refund ? <Undo2 className="h-3.5 w-3.5" /> : <CreditCard className="h-3.5 w-3.5" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-[#4a3933]">
                {refund ? 'Devolución' : m.isDeposit ? 'Adelanto' : afterDeposit ? 'Saldo' : 'Pago'} · {m.method}
              </span>
              {shortDate(m.date) && <span className="block text-xs text-[#887870]">{shortDate(m.date)}</span>}
            </span>
            <span className={`shrink-0 font-bold ${refund ? 'text-emerald-700' : 'text-[#4a3933]'}`}>
              {refund ? '+' : ''}{formatCurrency(m.amount)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/** Todo sobre el dinero del pedido: cuánto pagó, cuánto falta o qué se le devolvió, sin letra chica. */
export function TrackingMoney({ tracking }: { tracking: PublicTrackingResponse }) {
  const payment = trackingPayment(tracking);
  const status = statusName(tracking.status);
  const payHref = tracking.orderId ? `/pago/${tracking.orderId}` : null;
  const refunds = payment.movements.filter(m => m.kind === 'refund');
  const payments = payment.movements.filter(m => m.kind === 'payment');
  const paidWith = [...new Set(payments.map(m => m.method))].join(' y ');

  switch (payment.state) {
    case 'refunded':
      return (
        <Panel tone="emerald" icon={<Undo2 className="h-5 w-5" />} title={`Te devolvimos ${formatCurrency(payment.refunded)}`}>
          <p>Se devolvió todo lo que pagaste{paidWith ? ` con ${paidWith}` : ''}. {refundHint(refunds)}</p>
          <Movements movements={payment.movements} />
        </Panel>
      );

    case 'refund_pending':
      return (
        <Panel tone="amber" icon={<Clock className="h-5 w-5" />} title={`Te devolveremos ${formatCurrency(payment.netPaid)}`}>
          <p>
            Pagaste{paidWith ? ` con ${paidWith}` : ''} y el pedido se canceló: estamos gestionando tu devolución.
            Aquí verás cuando esté hecha.
          </p>
          <Movements movements={payment.movements} />
        </Panel>
      );

    case 'none':
      return (
        <Panel tone="stone" icon={<Wallet className="h-5 w-5" />} title="No se te cobró nada">
          <p>El pedido se canceló antes del pago: no hay nada que devolver.</p>
        </Panel>
      );

    case 'paid':
      return (
        <Panel tone="emerald" icon={<CheckCircle2 className="h-5 w-5" />} title={`Pagado por completo · ${formatCurrency(payment.netPaid)}`}>
          {payment.refunded > 0 && <p>Incluye una devolución de {formatCurrency(payment.refunded)}.</p>}
          <Movements movements={payment.movements} />
        </Panel>
      );

    case 'deposit': {
      const percent = payment.total > 0 ? Math.min(100, Math.round((payment.netPaid / payment.total) * 100)) : 0;
      return (
        <Panel
          tone="gold"
          icon={<Wallet className="h-5 w-5" />}
          title={`Pagaste ${formatCurrency(payment.netPaid)} · te falta ${formatCurrency(payment.balanceDue)}`}
          action={payHref && <PayButton href={payHref} label="Pagar el saldo" />}
        >
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#efe6dd]" aria-hidden>
            <div className="h-full rounded-full bg-gradient-to-r from-[#c8a96b] to-[#b08a4e]" style={{ width: `${percent}%` }} />
          </div>
          <p className="mt-2">
            {status === 'Ready' ? '¡Ya está listo! Paga el saldo y lo entregamos.' : 'El saldo se paga antes de la entrega; te avisamos cuando esté listo.'}
          </p>
          <Movements movements={payment.movements} />
        </Panel>
      );
    }

    case 'processing':
      return (
        <Panel tone="amber" icon={<Loader2 className="h-5 w-5 animate-spin" />} title="Estamos confirmando tu pago">
          <p>Mercado Pago lo está procesando; puede tardar unos minutos. <strong>No vuelvas a pagar</strong>: esta página se actualiza sola.</p>
        </Panel>
      );

    default:
      if (payment.total <= 0 || !['WaitingPayment', 'PaymentReported'].includes(status)) return null;
      return (
        <Panel
          tone="gold"
          icon={<CreditCard className="h-5 w-5" />}
          title={`Pendiente de pago · ${formatCurrency(payment.total)}`}
          action={payHref && status !== 'PaymentReported' && <PayButton href={payHref} label="Ir a pagar" />}
        >
          <p>Con tarjeta o Yape: el 50% de adelanto o el total.</p>
        </Panel>
      );
  }
}

const TONES = {
  emerald: 'border-emerald-200 bg-emerald-50/70 text-emerald-900',
  amber: 'border-amber-200 bg-amber-50/70 text-amber-900',
  gold: 'border-[#c8a96b]/30 bg-[#fffbf3] text-[#5e4a42]',
  stone: 'border-stone-200 bg-stone-50 text-stone-700',
};

const ICON_TONES = {
  emerald: 'bg-emerald-100 text-emerald-700',
  amber: 'bg-amber-100 text-amber-700',
  gold: 'bg-[#fdf8ee] text-[#b08a4e]',
  stone: 'bg-stone-200/70 text-stone-600',
};

function Panel({ tone, icon, title, action, children }: {
  tone: keyof typeof TONES; icon: React.ReactNode; title: string; action?: React.ReactNode; children?: React.ReactNode;
}) {
  return (
    <div className={`rounded-2xl border p-4 sm:p-5 ${TONES[tone]}`}>
      <div className="flex flex-wrap items-start gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${ICON_TONES[tone]}`}>{icon}</span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70">Tu pago</p>
          <p className="font-serif text-lg font-bold leading-snug">{title}</p>
        </div>
        {action}
      </div>
      {children && <div className="mt-2 text-sm leading-relaxed">{children}</div>}
    </div>
  );
}

function PayButton({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1.5 self-center rounded-full bg-[#4a3933] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#3a2d28]">
      {label} <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  );
}
