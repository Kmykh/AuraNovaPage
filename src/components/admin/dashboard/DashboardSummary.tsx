"use client";

import React from 'react';
import { ShoppingBag, CircleDollarSign, ClipboardList, Coins, Package, AlertCircle, Clock, CheckCircle2, Truck } from 'lucide-react';
import Link from 'next/link';
import { useDashboard } from '@/hooks/use-dashboard';
import { useAdminProducts } from '@/hooks/use-admin-products';
import { DashboardHeader } from './DashboardHeader';
import { DashboardKpiCard } from './DashboardKpiCard';
import { DashboardLoading } from './DashboardLoading';
import { formatCurrency } from '@/lib/formatters';
import { Button } from '@/components/ui/Button';
import { ApiProblemDetails } from '@/lib/api-errors';

export function DashboardSummary() {
  const { data, isLoading, error, refetch, isFetching, dataUpdatedAt } = useDashboard();
  const { data: productsData, isLoading: isLoadingProducts } = useAdminProducts();

  if (isLoading || isLoadingProducts) {
    return <DashboardLoading />;
  }

  if (error) {
    // Manejo de errores específicos
    let title = "No pudimos cargar el dashboard";
    let message = "Ha ocurrido un error al conectar con Aura Nova.";
    
    if (error instanceof ApiProblemDetails) {
      if (error.status === 403) {
        title = "Acceso denegado";
        message = "No tienes permisos para acceder al dashboard.";
      } else if (error.status === 429) {
        title = "Demasiadas solicitudes";
        message = "Espera un momento y vuelve a intentarlo.";
      }
    }

    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center border border-sage/20 rounded-2xl bg-white shadow-sm">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-serif font-bold text-brown mb-2">{title}</h2>
        <p className="text-sage max-w-md mb-6">{message}</p>
        <Button onClick={() => refetch()} variant="outline" className="min-w-[150px]">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div>
      <DashboardHeader 
        onRefresh={() => refetch()} 
        isFetching={isFetching} 
        lastUpdated={dataUpdatedAt} 
      />

      {data && data.orders.paymentReported > 0 && (
        <div className="mb-6 bg-gold/10 border-l-4 border-gold p-4 rounded-r-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-gold mt-0.5" />
          <div>
            <h3 className="font-semibold text-brown">Pagos Reportados Pendientes</h3>
            <p className="text-sm text-sage mt-1">
              Tienes {data.orders.paymentReported} pedido(s) con pago reportado. Revisa la evidencia y confirma el pago para poder iniciar la elaboración.
            </p>
            <Link href="/admin/pedidos?status=3">
              <Button variant="outline" className="mt-3 h-8 border-gold text-gold hover:bg-gold/10 bg-transparent">
                Revisar pedidos
              </Button>
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardKpiCard
          title="Pedidos recibidos"
          value={data?.orders.paymentConfirmed ?? 0}
          description="Pagos confirmados"
          icon={ShoppingBag}
          color="rose"
        />
        <DashboardKpiCard
          title="En elaboración"
          value={data?.orders.preparing ?? 0}
          description="En taller"
          icon={Clock}
          color="gold"
        />
        <DashboardKpiCard
          title="Listos"
          value={data?.orders.ready ?? 0}
          description="Para entrega/envío"
          icon={CheckCircle2}
          color="sage"
        />
        <DashboardKpiCard
          title="Personalizados"
          value={data?.orders.waitingQuote ?? 0}
          description="Por cotizar"
          icon={ClipboardList}
          color="gold"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardKpiCard
          title="Ingresos de hoy"
          value={formatCurrency(data?.today.sales ?? 0)}
          description="Ventas del día"
          icon={Coins}
          color="gold"
        />
        <DashboardKpiCard
          title="Entregados a agencia"
          value={data?.orders.shipped ?? 0}
          description="Envíos nacionales"
          icon={Truck}
          color="brown"
        />
      </div>
    </div>
  );
}
