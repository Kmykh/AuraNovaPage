"use client";

import React from 'react';
import { CheckCircle2, Clock, CreditCard, Smartphone, XCircle } from 'lucide-react';
import { AdminOrderPayment } from '@/types/orders';
import { formatCurrency } from '@/lib/formatters';
import { formatDate } from '@/lib/order-helpers';

const BRANDS: Record<string, string> = {
  visa: 'Visa', debvisa: 'Visa débito', master: 'Mastercard', debmaster: 'Mastercard débito',
  amex: 'American Express', diners: 'Diners', yape: 'Yape',
};

function statusBadge(approved: boolean, status: string) {
  if (approved) return { label: 'Aprobado', className: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2 };
  if (status === 'failed' || status === 'error') return { label: 'Rechazado', className: 'bg-rose-50 text-rose-600', icon: XCircle };
  return { label: 'En proceso', className: 'bg-amber-50 text-amber-700', icon: Clock };
}

/** Cobros del pedido con Mercado Pago: lo pagado, el saldo y cada intento. */
export function OrderPaymentsCard({ payment }: { payment: AdminOrderPayment }) {
  const transactions = payment.transactions ?? [];
  const paid = payment.amountPaid ?? 0;
  const balance = payment.balanceDue ?? Math.max(0, payment.amount - paid);
  if (transactions.length === 0 && paid <= 0) return null;

  return (
    <section className="rounded-[24px] border border-sage/10 bg-white p-5 shadow-sm sm:p-6">
      <h3 className="flex items-center gap-2 font-serif text-lg font-bold text-brown">
        <CreditCard size={18} className="text-gold" /> Pagos
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
            const badge = statusBadge(t.approved, t.status);
            const Icon = t.methodId === 'yape' ? Smartphone : CreditCard;
            return (
              <li key={`${t.externalOrderId ?? index}-${t.createdAt}`} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${t.methodId === 'yape' ? 'bg-[#742284]/10 text-[#742284]' : 'bg-gold/10 text-gold'}`}>
                  <Icon size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-brown">
                    {formatCurrency(t.amount)} · {BRANDS[t.methodId] ?? t.methodId}
                    <span className="ml-1.5 text-xs font-normal text-sage">{t.isDeposit ? '(adelanto 50%)' : ''}</span>
                  </p>
                  <p className="truncate text-xs text-sage">
                    {formatDate(t.createdAt)}{t.externalOrderId ? ` · ${t.externalOrderId}` : ''}{!t.approved && t.statusDetail ? ` · ${t.statusDetail}` : ''}
                  </p>
                </div>
                <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${badge.className}`}>
                  <badge.icon size={11} /> {badge.label}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
