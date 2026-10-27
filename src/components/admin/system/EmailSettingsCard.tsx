"use client";

import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock, Loader2, Mail, RefreshCw, Send, XCircle } from 'lucide-react';
import { useEmailStatus, useSendTestEmail } from '@/hooks/use-email-diagnostics';
import { EmailTestResponse } from '@/types/diagnostics';
import { NotificationStatus } from '@/types/enums';
import { formatDate, getNotificationTypeLabel } from '@/lib/order-helpers';
import { ApiProblemDetails } from '@/lib/api-errors';

const statusName = (status: NotificationStatus | string) =>
  typeof status === 'number' ? NotificationStatus[status] : status;

const STATUS_BADGE: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  Sent: { label: 'Enviado', className: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2 },
  Failed: { label: 'Falló', className: 'bg-rose-50 text-rose-700', icon: XCircle },
  Generated: { label: 'En cola', className: 'bg-amber-50 text-amber-700', icon: Clock },
};

/** Correos automáticos: si están activos, un correo de prueba y los últimos envíos con su error. */
export function EmailSettingsCard() {
  const { data, isLoading, isError, refetch, isFetching } = useEmailStatus();
  const { mutate: sendTest, isPending } = useSendTestEmail();
  const [to, setTo] = useState('');
  const [result, setResult] = useState<EmailTestResponse | null>(null);

  const handleTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!to.trim()) return;
    setResult(null);
    sendTest(to.trim(), {
      onSuccess: setResult,
      onError: (error) => setResult({
        ok: false,
        provider: data?.provider ?? '',
        message: error instanceof ApiProblemDetails && error.detail ? error.detail : 'No se pudo hacer la prueba. Revisa tu conexión.',
      }),
    });
  };

  return (
    <section className="rounded-[24px] border border-sage/15 bg-white p-5 shadow-sm sm:p-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-gold"><Mail size={20} /></span>
          <div>
            <h2 className="text-lg font-bold text-brown">Correos automáticos</h2>
            <p className="text-xs text-sage">Confirmaciones y avisos que reciben tus clientes en su correo.</p>
          </div>
        </div>
        {data && (
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${data.configured ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
            {data.configured ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
            {data.configured ? 'Activos' : 'Falta configurar'}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="h-32 animate-pulse rounded-2xl bg-sage/10" />
      ) : isError || !data ? (
        <p className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">
          No se pudo leer el estado de los correos.{' '}
          <button type="button" onClick={() => refetch()} className="font-semibold underline">Reintentar</button>
        </p>
      ) : (
        <div className="space-y-6">
          <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-2xl bg-[#faf7f2] p-4">
              <dt className="text-[11px] font-bold uppercase tracking-wider text-sage">Proveedor</dt>
              <dd className="mt-1 font-semibold text-brown">{data.provider}</dd>
            </div>
            <div className="rounded-2xl bg-[#faf7f2] p-4">
              <dt className="text-[11px] font-bold uppercase tracking-wider text-sage">Se envían desde</dt>
              <dd className="mt-1 break-all font-semibold text-brown">
                {data.fromAddress ? `${data.fromName ?? ''} <${data.fromAddress}>` : '—'}
              </dd>
            </div>
            <div className="rounded-2xl bg-[#faf7f2] p-4">
              <dt className="text-[11px] font-bold uppercase tracking-wider text-sage">Las respuestas llegan a</dt>
              <dd className="mt-1 break-all font-semibold text-brown">{data.replyTo ?? '—'}</dd>
            </div>
          </dl>

          {data.problem && (
            <p className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800" role="alert">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" /> {data.problem}
            </p>
          )}

          <form onSubmit={handleTest} className="rounded-2xl border border-sage/15 p-4">
            <label htmlFor="email-test" className="text-sm font-bold text-brown">Enviar un correo de prueba</label>
            <p className="mb-3 text-xs text-sage">Si algo falla, aquí aparece el motivo exacto que da el proveedor.</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id="email-test"
                type="email"
                value={to}
                onChange={e => setTo(e.target.value)}
                placeholder="tucorreo@gmail.com"
                className="h-11 flex-1 rounded-xl border border-sage/25 px-4 text-sm text-brown outline-none focus:border-gold focus:ring-4 focus:ring-gold/10"
                required
              />
              <button
                type="submit"
                disabled={isPending || !to.trim()}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#c8a96b] px-5 text-sm font-semibold text-white shadow-sm hover:bg-[#b09355] disabled:opacity-60"
              >
                {isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Enviar prueba
              </button>
            </div>
            {result && (
              <p className={`mt-3 flex items-start gap-2 rounded-xl p-3 text-sm ${result.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`} role="status">
                {result.ok ? <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> : <XCircle size={16} className="mt-0.5 shrink-0" />}
                <span className="break-words">{result.message}</span>
              </p>
            )}
          </form>

          <div>
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-sage">Últimos correos a clientes</h3>
              <button type="button" onClick={() => refetch()} className="inline-flex items-center gap-1 text-xs font-semibold text-gold hover:underline">
                <RefreshCw size={12} className={isFetching ? 'animate-spin' : ''} /> Actualizar
              </button>
            </div>
            {data.recent.length === 0 ? (
              <p className="rounded-2xl bg-[#faf7f2] p-4 text-sm text-sage">
                Todavía no se generó ningún correo. Se crean solos cuando un cliente hace un pedido con su correo (y los correos están activos).
              </p>
            ) : (
              <ul className="divide-y divide-sage/10 rounded-2xl border border-sage/15">
                {data.recent.map(item => {
                  const badge = STATUS_BADGE[statusName(item.status)] ?? STATUS_BADGE.Generated;
                  return (
                    <li key={item.id} className="p-3.5 text-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="min-w-0 text-brown">
                          <span className="font-semibold">{getNotificationTypeLabel(item.type)}</span>
                          {item.orderCode && <span className="text-sage"> · {item.orderCode}</span>}
                          <span className="block truncate text-xs text-sage">{item.recipient} · {formatDate(item.createdAt)}</span>
                        </p>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${badge.className}`}>
                          <badge.icon size={12} /> {badge.label}
                        </span>
                      </div>
                      {item.errorMessage && <p className="mt-2 break-words rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{item.errorMessage}</p>}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
