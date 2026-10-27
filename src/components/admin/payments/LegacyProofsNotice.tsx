"use client";

import React from 'react';
import Link from 'next/link';
import { ChevronRight, FileImage } from 'lucide-react';
import { usePendingProofs } from '@/hooks/use-admin-payments';
import { formatCurrency } from '@/lib/formatters';
import { formatDate } from '@/lib/order-helpers';

/**
 * Comprobantes de Yape por captura (el cobro anterior, antes de Mercado Pago) que siguen esperando revisión.
 * Si no queda ninguno, no se muestra nada.
 */
export function LegacyProofsNotice() {
  const { data: pending } = usePendingProofs();
  if (!pending?.length) return null;

  return (
    <section className="rounded-[24px] border border-amber-200 bg-amber-50/60 p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700"><FileImage size={16} /></span>
        <div>
          <p className="font-semibold text-brown">
            {pending.length === 1 ? '1 comprobante de Yape por revisar' : `${pending.length} comprobantes de Yape por revisar`}
          </p>
          <p className="text-xs text-sage">Capturas enviadas con el sistema anterior. Ábrelas en el pedido para confirmar o rechazar el pago.</p>
        </div>
      </div>
      <ul className="mt-4 divide-y divide-amber-100 rounded-2xl bg-white">
        {pending.map(p => (
          <li key={p.id}>
            <Link href={`/admin/pedidos/${p.orderId}`} className="flex items-center justify-between gap-3 px-4 py-3 text-sm transition hover:bg-amber-50/50">
              <span className="min-w-0">
                <span className="font-mono text-xs font-bold text-gold">{p.orderCode}</span>
                <span className="block truncate text-brown">{p.customerName} · <span className="text-sage">{formatDate(p.updatedAt ?? p.createdAt)}</span></span>
              </span>
              <span className="flex shrink-0 items-center gap-1 font-semibold text-brown">
                {formatCurrency(p.amount)} <ChevronRight size={16} className="text-sage" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
