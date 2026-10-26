"use client";

import React, { useState } from 'react';
import { CheckCircle2, Clock, CreditCard, RotateCcw, Smartphone, Undo2, XCircle } from 'lucide-react';
import { AdminOrderPayment, AdminPaymentTransaction } from '@/types/orders';
import { formatCurrency } from '@/lib/formatters';
import { formatDate } from '@/lib/order-helpers';
import { useRefundOnlinePayment } from '@/hooks/use-admin-payments';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export const CARD_BRANDS: Record<string, string> = {
  visa: 'Visa', debvisa: 'Visa débito', master: 'Mastercard', debmaster: 'Mastercard débito',
  amex: 'American Express', diners: 'Diners', yape: 'Yape',
};

export function paymentStatusBadge(t: Pick<AdminPaymentTransaction, 'approved' | 'status' | 'refundedAmount' | 'amount'>) {
  if (t.approved && t.refundedAmount >= t.amount) return { label: 'Devuelto', className: 'bg-stone-100 text-stone-600', icon: Undo2 };
  if (t.approved && t.refundedAmount > 0) return { label: 'Devuelto en parte', className: 'bg-sky-50 text-sky-700', icon: Undo2 };
  if (t.approved) return { label: 'Aprobado', className: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2 };
  if (['failed', 'error', 'canceled', 'cancelled', 'expired'].includes(t.status)) return { label: 'Rechazado', className: 'bg-rose-50 text-rose-600', icon: XCircle };
  return { label: 'En proceso', className: 'bg-amber-50 text-amber-700', icon: Clock };
}

/** Cobros del pedido con Mercado Pago: lo pagado, el saldo, cada intento y las devoluciones. */
export function OrderPaymentsCard({ orderId, payment }: { orderId: string; payment: AdminOrderPayment }) {
  const transactions = payment.transactions ?? [];
  const paid = payment.amountPaid ?? 0;
  const balance = payment.balanceDue ?? Math.max(0, payment.amount - paid);
  const [refunding, setRefunding] = useState<AdminPaymentTransaction | null>(null);
  if (transactions.length === 0 && paid <= 0) return null;

  return (
    <section className="rounded-[24px] border border-sage/10 bg-white p-5 shadow-sm sm:p-6">
      <h3 className="flex items-center gap-2 font-serif text-lg font-bold text-brown">
        <CreditCard size={18} className="text-gold" /> Pagos con Mercado Pago
      </h3>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-[#faf7f2] p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-sage">Total</p>
          <p className="font-serif text-lg font-bold text-brown">{formatCurrency(payment.amount)}</p>
        </div>
        <div className="rounded-xl bg-emerald-50 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Pagado</p>
          <p className="font-serif text-lg font-bold text-emerald-800">{formatCurrency(paid)}</p>
        </div>
        <div className={`rounded-xl p-3 ${balance > 0 ? 'bg-amber-50' : 'bg-[#faf7f2]'}`}>
          <p className={`text-[10px] font-bold uppercase tracking-wider ${balance > 0 ? 'text-amber-700' : 'text-sage'}`}>Saldo</p>
          <p className={`font-serif text-lg font-bold ${balance > 0 ? 'text-amber-800' : 'text-brown'}`}>{formatCurrency(balance)}</p>
        </div>
      </div>

      {transactions.length > 0 && (
        <ul className="mt-4 divide-y divide-sage/10">
          {transactions.map((t, index) => {
            const badge = paymentStatusBadge(t);
            const Icon = t.methodId === 'yape' ? Smartphone : CreditCard;
            const refundable = t.approved ? t.amount - (t.refundedAmount ?? 0) : 0;
            return (
              <li key={t.id ?? `${t.externalOrderId ?? index}-${t.createdAt}`} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${t.methodId === 'yape' ? 'bg-[#742284]/10 text-[#742284]' : 'bg-gold/10 text-gold'}`}>
                  <Icon size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-brown">
                    {formatCurrency(t.amount)} · {CARD_BRANDS[t.methodId] ?? t.methodId}
                    <span className="ml-1.5 text-xs font-normal text-sage">{t.isDeposit ? '(adelanto 50%)' : ''}</span>
                  </p>
                  <p className="truncate text-xs text-sage">
                    {formatDate(t.createdAt)}{t.externalOrderId ? ` · ${t.externalOrderId}` : ''}{!t.approved && t.statusDetail ? ` · ${t.statusDetail}` : ''}
                  </p>
                  {t.refundedAmount > 0 && (
                    <p className="text-xs font-semibold text-sky-700">Devuelto: {formatCurrency(t.refundedAmount)}{t.refundedAt ? ` · ${formatDate(t.refundedAt)}` : ''}</p>
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${badge.className}`}>
                    <badge.icon size={11} /> {badge.label}
                  </span>
                  {refundable > 0 && t.id && (
                    <button
                      type="button"
                      onClick={() => setRefunding(t)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-sage underline-offset-2 hover:text-brown hover:underline"
                    >
                      <RotateCcw size={11} /> Devolver
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {refunding && (
        <RefundModal key={refunding.id} orderId={orderId} transaction={refunding} onClose={() => setRefunding(null)} />
      )}
    </section>
  );
}

function RefundModal({ orderId, transaction, onClose }: { orderId: string; transaction: AdminPaymentTransaction; onClose: () => void }) {
  const refundable = transaction.amount - (transaction.refundedAmount ?? 0);
  const [mode, setMode] = useState<'all' | 'part'>('all');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const { mutate: refund, isPending } = useRefundOnlinePayment(orderId);

  const partial = Number(amount.replace(',', '.'));
  const partialValid = Number.isFinite(partial) && partial > 0 && partial <= refundable;
  const toRefund = mode === 'all' ? refundable : partial;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'part' && !partialValid) return;
    refund(
      { transactionId: transaction.id, request: { amount: mode === 'part' ? partial : undefined, reason: reason.trim() || undefined } },
      { onSuccess: onClose },
    );
  };

  return (
    <Modal isOpen onClose={() => !isPending && onClose()} title="Devolver pago">
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm text-sage">
          Cobro de <strong className="text-brown">{formatCurrency(transaction.amount)}</strong> con {CARD_BRANDS[transaction.methodId] ?? transaction.methodId}.
          {transaction.refundedAmount > 0 && <> Ya devolviste {formatCurrency(transaction.refundedAmount)}.</>}
        </p>

        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Cuánto devolver">
          {([['all', `Todo (${formatCurrency(refundable)})`], ['part', 'Una parte']] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={mode === value}
              onClick={() => setMode(value)}
              className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${mode === value ? 'border-gold bg-[#fdf8ee] text-brown ring-2 ring-gold/20' : 'border-sage/20 text-sage hover:border-gold/40'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {mode === 'part' && (
          <div>
            <label htmlFor="refund-amount" className="mb-1 block text-xs font-bold uppercase tracking-wider text-sage">Monto a devolver (S/)</label>
            <input
              id="refund-amount"
              inputMode="decimal"
              value={amount}
              onChange={e => setAmount(e.target.value.replace(/[^\d.,]/g, ''))}
              placeholder={`Hasta ${refundable.toFixed(2)}`}
              className="w-full rounded-xl border border-sage/30 bg-[#FAFAFA] px-4 py-2.5 text-brown outline-none focus:border-gold"
              autoFocus
            />
            {amount && !partialValid && <p className="mt-1 text-xs text-rose-600">Ingresa un monto entre S/ 0.01 y {formatCurrency(refundable)}.</p>}
          </div>
        )}

        <div>
          <label htmlFor="refund-reason" className="mb-1 block text-xs font-bold uppercase tracking-wider text-sage">Motivo (queda en el historial)</label>
          <input
            id="refund-reason"
            value={reason}
            maxLength={250}
            onChange={e => setReason(e.target.value)}
            placeholder="Ej. Pedido cancelado por el cliente"
            className="w-full rounded-xl border border-sage/30 bg-[#FAFAFA] px-4 py-2.5 text-brown outline-none focus:border-gold"
          />
        </div>

        <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
          La devolución se hace en Mercado Pago y no se puede deshacer. El cliente la verá en su {transaction.methodId === 'yape' ? 'Yape' : 'tarjeta'} según los plazos de su banco.
          Lo devuelto se descuenta de lo pagado y el saldo del pedido se recalcula.
        </p>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>Cancelar</Button>
          <Button type="submit" variant="danger" disabled={isPending || (mode === 'part' && !partialValid)}>
            {isPending ? 'Devolviendo…' : `Devolver ${Number.isFinite(toRefund) && toRefund > 0 ? formatCurrency(toRefund) : ''}`}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
