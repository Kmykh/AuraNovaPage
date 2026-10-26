"use client";

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, CheckCircle2, Download, Radio, RefreshCw, Search } from 'lucide-react';
import { useOnlinePaymentsReport, usePaymentWebhookEvents } from '@/hooks/use-admin-payments';
import { OnlinePaymentReportRow, PaymentWebhookEvent } from '@/types/orders';
import { CARD_BRANDS, paymentStatusBadge } from '@/components/admin/orders/OrderPaymentsCard';
import { formatCurrency } from '@/lib/formatters';
import { formatDate } from '@/lib/order-helpers';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';

type Preset = 'today' | '7d' | '30d' | 'month';
type Filter = 'all' | 'approved' | 'refunded' | 'pending' | 'rejected';

const PRESETS: { key: Preset; label: string }[] = [
  { key: 'today', label: 'Hoy' },
  { key: '7d', label: '7 días' },
  { key: '30d', label: '30 días' },
  { key: 'month', label: 'Este mes' },
];

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'approved', label: 'Aprobados' },
  { key: 'refunded', label: 'Devoluciones' },
  { key: 'pending', label: 'En proceso' },
  { key: 'rejected', label: 'Rechazados' },
];

const PENDING = ['created', 'processing', 'action_required'];

function rangeFor(preset: Preset) {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  if (preset === '7d') start.setDate(start.getDate() - 6);
  if (preset === '30d') start.setDate(start.getDate() - 29);
  if (preset === 'month') start.setDate(1);
  return { from: start.toISOString(), to: new Date(now.getTime() + 60_000).toISOString() };
}

function matches(row: OnlinePaymentReportRow, filter: Filter) {
  switch (filter) {
    case 'approved': return row.approved && row.refundedAmount < row.amount;
    case 'refunded': return row.refundedAmount > 0;
    case 'pending': return !row.approved && PENDING.includes(row.status);
    case 'rejected': return !row.approved && !PENDING.includes(row.status);
    default: return true;
  }
}

function toCsv(rows: OnlinePaymentReportRow[]) {
  const header = ['Fecha', 'Pedido', 'Cliente', 'Medio', 'Tipo', 'Monto', 'Devuelto', 'Estado', 'Detalle', 'Order ID Mercado Pago'];
  const quote = (value: string | number | null | undefined) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const lines = rows.map(r => [
    new Date(r.createdAt).toLocaleString('es-PE'),
    r.orderCode,
    r.customerName,
    CARD_BRANDS[r.methodId] ?? r.methodId,
    r.isDeposit ? 'Adelanto 50%' : 'Total o saldo',
    r.amount.toFixed(2),
    r.refundedAmount.toFixed(2),
    paymentStatusBadge(r).label,
    r.approved ? '' : r.statusDetail,
    r.externalOrderId,
  ].map(quote).join(','));
  // BOM para que Excel lea bien las tildes
  return '﻿' + [header.map(quote).join(','), ...lines].join('\r\n');
}

/** Cobros en línea con Mercado Pago: totales del periodo, cada intento, exportación y estado de los avisos. */
export function OnlinePaymentsReport() {
  const [preset, setPreset] = useState<Preset>('30d');
  const [range, setRange] = useState(() => rangeFor('30d'));
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const { data: report, isLoading, isFetching, refetch, error } = useOnlinePaymentsReport(range.from, range.to);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (report?.rows ?? []).filter(r =>
      matches(r, filter) &&
      (!term || r.orderCode.toLowerCase().includes(term) || (r.customerName ?? '').toLowerCase().includes(term) || (r.externalOrderId ?? '').toLowerCase().includes(term)));
  }, [report, filter, search]);

  const choosePreset = (key: Preset) => {
    setPreset(key);
    setRange(rangeFor(key));
  };

  const exportCsv = () => {
    const blob = new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pagos-mercadopago-${range.from.slice(0, 10)}-a-${range.to.slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[24px] border border-sage/10 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5 rounded-2xl bg-[#faf7f2] p-1" role="tablist" aria-label="Periodo">
            {PRESETS.map(p => (
              <button
                key={p.key}
                type="button"
                role="tab"
                aria-selected={preset === p.key}
                onClick={() => choosePreset(p.key)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${preset === p.key ? 'bg-white text-brown shadow-sm' : 'text-sage hover:text-brown'}`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} className="flex items-center gap-1.5 rounded-full text-xs">
              <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} /> Actualizar
            </Button>
            <Button type="button" size="sm" onClick={exportCsv} disabled={rows.length === 0} className="flex items-center gap-1.5 rounded-full bg-brown text-xs text-white hover:bg-brown/90">
              <Download className="h-3.5 w-3.5" /> Exportar CSV
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} variant="rect" className="h-20 rounded-2xl" />)}
          </div>
        ) : error || !report ? (
          <p className="mt-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">No pudimos cargar los pagos. Intenta actualizar.</p>
        ) : (
          <>
            <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Kpi label="Cobrado" value={formatCurrency(report.collected)} tone="emerald" />
              <Kpi label="Devuelto" value={formatCurrency(report.refunded)} tone="sky" />
              <Kpi label="Neto" value={formatCurrency(report.net)} tone="brown" />
              <Kpi
                label="Pagos aprobados"
                value={String(report.approvedCount)}
                hint={`${report.rejectedCount} rechazados · ${report.pendingCount} en proceso`}
                tone="stone"
              />
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              {FILTERS.map(f => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  aria-pressed={filter === f.key}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${filter === f.key ? 'border-gold bg-gold text-white' : 'border-sage/20 text-sage hover:border-gold/50'}`}
                >
                  {f.label}
                </button>
              ))}
              <div className="relative ml-auto w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-sage" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Pedido, cliente u Order ID"
                  className="w-full rounded-full border border-sage/20 bg-[#FAFAFA] py-2 pl-8 pr-3 text-xs text-brown outline-none focus:border-gold"
                />
              </div>
            </div>

            {rows.length === 0 ? (
              <p className="mt-5 rounded-xl bg-[#faf7f2] p-6 text-center text-sm text-sage">No hay pagos con estos filtros en el periodo.</p>
            ) : (
              <>
                {/* Escritorio */}
                <div className="mt-4 hidden overflow-x-auto md:block">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-sage/10 text-[11px] uppercase tracking-wider text-sage">
                        <th className="py-2 pr-3 font-bold">Fecha</th>
                        <th className="py-2 pr-3 font-bold">Pedido</th>
                        <th className="py-2 pr-3 font-bold">Medio</th>
                        <th className="py-2 pr-3 text-right font-bold">Monto</th>
                        <th className="py-2 pr-3 font-bold">Estado</th>
                        <th className="py-2 font-bold">Order ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sage/10">
                      {rows.map(r => {
                        const badge = paymentStatusBadge(r);
                        return (
                          <tr key={r.id} className="align-top">
                            <td className="py-2.5 pr-3 text-xs text-sage">{formatDate(r.createdAt)}</td>
                            <td className="py-2.5 pr-3">
                              <Link href={`/admin/pedidos/${r.orderId}`} className="font-mono text-xs font-bold text-gold hover:underline">{r.orderCode}</Link>
                              <p className="text-xs text-brown">{r.customerName}</p>
                            </td>
                            <td className="py-2.5 pr-3 text-xs text-brown">
                              {CARD_BRANDS[r.methodId] ?? r.methodId}
                              {r.isDeposit && <span className="block text-[11px] text-sage">Adelanto 50%</span>}
                            </td>
                            <td className="py-2.5 pr-3 text-right font-semibold text-brown">
                              {formatCurrency(r.amount)}
                              {r.refundedAmount > 0 && <span className="block text-[11px] font-normal text-sky-700">−{formatCurrency(r.refundedAmount)}</span>}
                            </td>
                            <td className="py-2.5 pr-3">
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${badge.className}`}>
                                <badge.icon size={11} /> {badge.label}
                              </span>
                              {!r.approved && r.statusDetail && <p className="mt-0.5 max-w-[180px] truncate text-[11px] text-sage">{r.statusDetail}</p>}
                            </td>
                            <td className="py-2.5 font-mono text-[11px] text-sage">{r.externalOrderId ?? '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Celular */}
                <ul className="mt-4 divide-y divide-sage/10 md:hidden">
                  {rows.map(r => {
                    const badge = paymentStatusBadge(r);
                    return (
                      <li key={r.id} className="flex items-start justify-between gap-3 py-3">
                        <div className="min-w-0">
                          <Link href={`/admin/pedidos/${r.orderId}`} className="font-mono text-xs font-bold text-gold">{r.orderCode}</Link>
                          <p className="truncate text-sm text-brown">{r.customerName}</p>
                          <p className="text-[11px] text-sage">{formatDate(r.createdAt)} · {CARD_BRANDS[r.methodId] ?? r.methodId}{r.isDeposit ? ' · adelanto' : ''}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="font-semibold text-brown">{formatCurrency(r.amount)}</p>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${badge.className}`}>
                            <badge.icon size={11} /> {badge.label}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
            <p className="mt-4 text-[11px] text-sage">
              Para las comisiones y lo depositado en tu cuenta, usa los reportes de <strong>Liquidaciones</strong> y <strong>Todas las transacciones</strong> de Mercado Pago y crúzalos por el Order ID.
            </p>
          </>
        )}
      </section>

      <WebhookHealth />
    </div>
  );
}

function Kpi({ label, value, tone, hint }: { label: string; value: string; tone: 'emerald' | 'sky' | 'brown' | 'stone'; hint?: string }) {
  const tones = {
    emerald: 'bg-emerald-50 text-emerald-800',
    sky: 'bg-sky-50 text-sky-800',
    brown: 'bg-[#fdf8ee] text-brown',
    stone: 'bg-[#faf7f2] text-brown',
  };
  return (
    <div className={`rounded-2xl p-4 ${tones[tone]}`}>
      <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">{label}</p>
      <p className="mt-1 font-serif text-xl font-bold">{value}</p>
      {hint && <p className="mt-0.5 text-[11px] opacity-70">{hint}</p>}
    </div>
  );
}

const WEBHOOK_RESULTS: Record<string, { label: string; className: string }> = {
  processed: { label: 'Procesado', className: 'bg-emerald-50 text-emerald-700' },
  ignored: { label: 'Ignorado', className: 'bg-stone-100 text-stone-600' },
  invalid_signature: { label: 'Firma inválida', className: 'bg-rose-50 text-rose-600' },
  error: { label: 'Error', className: 'bg-amber-50 text-amber-700' },
};

/** Si los avisos de Mercado Pago llegan bien: así se detecta una clave secreta o una URL mal configurada. */
function WebhookHealth() {
  const { data: events, isLoading } = usePaymentWebhookEvents();
  const [open, setOpen] = useState(false);
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
