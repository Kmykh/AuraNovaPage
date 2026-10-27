"use client";

import React from 'react';
import Link from 'next/link';
import { AlertCircle, ChevronRight, ClipboardCheck, Coins, Hourglass, PackageCheck, ShoppingBag, Truck, Wrench } from 'lucide-react';
import { useDashboard } from '@/hooks/use-dashboard';
import { DashboardHeader } from './DashboardHeader';
import { DashboardLoading } from './DashboardLoading';
import { PendingWhatsAppCard } from './PendingWhatsAppCard';
import { formatCurrency } from '@/lib/formatters';
import { Button } from '@/components/ui/Button';
import { ApiProblemDetails } from '@/lib/api-errors';

/**
 * Inicio del panel: lo de hoy y una lista de tareas que lleva a cada pestaña de Pedidos.
 * Los detalles (y los conteos por estado) viven en Pedidos; aquí no se repiten en tarjetas.
 */
export function DashboardSummary() {
  const { data, isLoading, error, refetch, isFetching, dataUpdatedAt } = useDashboard();

  if (isLoading) return <DashboardLoading />;

  if (error || !data) {
    const forbidden = error instanceof ApiProblemDetails && error.status === 403;
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-sage/20 bg-white px-4 py-20 text-center shadow-sm">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="mb-2 font-serif text-xl font-bold text-brown">{forbidden ? 'Acceso denegado' : 'No pudimos cargar el inicio'}</h2>
        <p className="mb-6 max-w-md text-sage">{forbidden ? 'No tienes permisos para ver este resumen.' : 'Revisa tu conexión e inténtalo de nuevo.'}</p>
        <Button onClick={() => refetch()} variant="outline" className="min-w-[150px]">Reintentar</Button>
      </div>
    );
  }

  const o = data.orders;
  const tasks = [
    {
      label: 'Te toca',
      hint: 'Cotizar, revisar comprobantes y empezar a preparar',
      count: o.waitingQuote + o.paymentReported + o.paymentConfirmed,
      href: '/admin/pedidos?view=action',
      icon: ClipboardCheck,
      urgent: true,
    },
    { label: 'En el taller', hint: 'Marcar como listos', count: o.preparing, href: '/admin/pedidos?view=workshop', icon: Wrench },
    {
      label: 'Por entregar',
      hint: 'Listos, en camino o en la agencia',
      count: o.ready + o.shipped + (o.deliveredToAgency ?? 0),
      href: '/admin/pedidos?view=delivery',
      icon: Truck,
    },
    { label: 'Esperando al cliente', hint: 'Que acepte la cotización o pague', count: o.quoteReady + o.waitingPayment, href: '/admin/pedidos?view=customer', icon: Hourglass },
  ];

  return (
    <div className="max-w-5xl">
      <DashboardHeader onRefresh={() => refetch()} isFetching={isFetching} lastUpdated={dataUpdatedAt} />

      {/* Hoy */}
      <section className="grid grid-cols-1 overflow-hidden rounded-[24px] border border-sage/10 bg-white shadow-sm sm:grid-cols-3 sm:divide-x sm:divide-sage/10">
        {[
          { label: 'Ventas de hoy', value: formatCurrency(data.today.sales), icon: Coins },
          { label: 'Pedidos nuevos hoy', value: data.today.orders, icon: ShoppingBag },
          { label: 'Pagos confirmados hoy', value: data.today.confirmedPayments, icon: PackageCheck },
        ].map(stat => (
          <div key={stat.label} className="flex items-center gap-3 border-b border-sage/10 p-5 last:border-b-0 sm:border-b-0">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold"><stat.icon size={18} /></span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-sage">{stat.label}</p>
              <p className="font-serif text-2xl font-bold text-brown">{stat.value}</p>
            </div>
          </div>
        ))}
      </section>

      <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* Lo que te toca: atajos a cada pestaña de Pedidos */}
        <section className="rounded-[24px] border border-sage/10 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="font-serif text-lg font-bold text-brown">Lo que te toca</h2>
          <ul className="mt-3 divide-y divide-sage/10">
            {tasks.map(task => (
              <li key={task.label}>
                <Link href={task.href} className="group flex items-center gap-3 py-3.5">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${task.urgent && task.count > 0 ? 'bg-[#d38b8b]/15 text-[#b45f5f]' : 'bg-cream text-sage'}`}>
                    <task.icon size={17} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-brown">{task.label}</span>
                    <span className="block text-xs text-sage">{task.hint}</span>
                  </span>
                  <span className={`min-w-[2rem] rounded-full px-2.5 py-1 text-center text-sm font-bold ${
                    task.count === 0 ? 'bg-sage/10 text-sage' : task.urgent ? 'bg-[#d38b8b] text-white' : 'bg-brown text-white'
                  }`}>
                    {task.count}
                  </span>
                  <ChevronRight size={16} className="text-sage transition group-hover:translate-x-0.5 group-hover:text-brown" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <PendingWhatsAppCard />
      </div>
    </div>
  );
}
