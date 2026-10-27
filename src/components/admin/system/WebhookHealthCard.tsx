"use client";

import React, { useState } from 'react';
import { AlertTriangle, Check, CheckCircle2, Copy, Radio } from 'lucide-react';
import { usePaymentWebhookEvents } from '@/hooks/use-admin-payments';
import { PaymentWebhookEvent } from '@/types/orders';
import { formatDate } from '@/lib/order-helpers';
import { Skeleton } from '@/components/ui/Skeleton';
import { apiClient } from '@/lib/api-client';

const WEBHOOK_RESULTS: Record<string, { label: string; className: string }> = {
  processed: { label: 'Procesado', className: 'bg-emerald-50 text-emerald-700' },
  ignored: { label: 'Ignorado', className: 'bg-stone-100 text-stone-600' },
  invalid_signature: { label: 'Firma inválida', className: 'bg-rose-50 text-rose-600' },
  error: { label: 'Error', className: 'bg-amber-50 text-amber-700' },
};

/** Dirección que va en Mercado Pago → Webhooks (es la del backend, no la de la tienda). */
const WEBHOOK_URL = `${(apiClient.defaults.baseURL ?? '').replace(/\/$/, '')}/api/webhooks/mercadopago`;

/** Si los avisos de Mercado Pago llegan bien: así se detecta una clave secreta o una URL mal configurada. */
export function WebhookHealthCard() {
  const { data: events, isLoading } = usePaymentWebhookEvents();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyUrl = () => {
    navigator.clipboard?.writeText(WEBHOOK_URL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };
  if (isLoading) return <Skeleton variant="rect" className="h-20 w-full rounded-[24px]" />;

  const last = events?.[0];
  const failing = last?.result === 'invalid_signature';

  return (
    <section className={`rounded-[24px] border p-5 shadow-sm ${failing ? 'border-rose-200 bg-rose-50/60' : 'border-sage/10 bg-white'}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${failing ? 'bg-rose-100 text-rose-600' : last ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
            {failing ? <AlertTriangle size={16} /> : last ? <CheckCircle2 size={16} /> : <Radio size={16} />}
          </span>
          <div>
            <p className="font-semibold text-brown">Conexión con Mercado Pago (avisos de pago)</p>
            <p className="text-xs text-sage">
              {!last
                ? 'Todavía no llega ningún aviso. Revisa en Mercado Pago → Webhooks la URL y el evento "Order", en modo prueba y producción.'
                : failing
                  ? 'El último aviso llegó con la firma inválida: MercadoPago__WebhookSecret en Render debe ser la clave secreta de Mercado Pago → Webhooks.'
                  : `Último aviso: ${formatDate(last.receivedAt)} · ${WEBHOOK_RESULTS[last.result]?.label ?? last.result}`}
            </p>
          </div>
        </div>
        {!!events?.length && (
          <button type="button" onClick={() => setOpen(o => !o)} className="text-xs font-semibold text-sage hover:text-brown">
            {open ? 'Ocultar' : `Ver los últimos ${events.length}`}
          </button>
        )}
      </div>
      {/* La URL correcta a mano: si apunta a la tienda, Mercado Pago marca 405 y los pagos no se confirman por aviso */}
      <div className="mt-4 rounded-2xl bg-[#faf7f2] p-3.5 text-xs text-sage">
        <p className="font-semibold text-brown">URL para Mercado Pago → Webhooks (modo productivo y de prueba, evento &quot;Order&quot;)</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <code className="min-w-0 flex-1 break-all rounded-lg bg-white px-2.5 py-1.5 font-mono text-[11px] text-brown">{WEBHOOK_URL}</code>
          <button type="button" onClick={copyUrl} className="inline-flex h-8 items-center gap-1.5 rounded-full border border-gold/40 bg-white px-3 font-semibold text-brown hover:bg-[#fffdf8]">
            {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} className="text-gold" />} {copied ? 'Copiada' : 'Copiar'}
          </button>
        </div>
        <p className="mt-2">Si en Mercado Pago los avisos salen con <strong>405</strong>, la URL apunta a la tienda y no a esta.</p>
      </div>
      {open && !!events?.length && <WebhookList events={events} />}
    </section>
  );
}

function WebhookList({ events }: { events: PaymentWebhookEvent[] }) {
  return (
    <ul className="mt-4 divide-y divide-sage/10 text-xs">
      {events.map((e, i) => {
        const result = WEBHOOK_RESULTS[e.result] ?? { label: e.result, className: 'bg-stone-100 text-stone-600' };
        return (
          <li key={`${e.receivedAt}-${i}`} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2">
            <span className="text-sage">{formatDate(e.receivedAt)}</span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${result.className}`}>{result.label}</span>
            <span className="font-mono text-[11px] text-brown">{e.topic ?? '—'} · {e.resourceId ?? '—'}</span>
            {e.detail && <span className="w-full text-[11px] text-sage">{e.detail}</span>}
          </li>
        );
      })}
    </ul>
  );
}
