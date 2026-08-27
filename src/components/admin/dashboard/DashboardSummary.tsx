"use client";

import React from 'react';
import { ShoppingBag, CircleDollarSign, ClipboardList, Coins, Package, AlertCircle } from 'lucide-react';
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardKpiCard
          title="Pedidos pendientes"
          value={data ? (data.orders.waitingQuote + data.orders.paymentReported + data.orders.preparing) : 0}
          description="Pedidos que requieren atención"
          icon={ShoppingBag}
          color="rose"
        />
        <DashboardKpiCard
          title="Pagos pendientes"
          value={data?.payments.pendingVerification ?? 0}
          description="Pagos por revisar"
          icon={CircleDollarSign}
          color="gold"
        />
        <DashboardKpiCard
          title="Cotizaciones pendientes"
          value={data?.quotes.pending ?? 0}
          description="Envíos esperando cotización"
          icon={ClipboardList}
          color="gold"
        />
        <DashboardKpiCard
          title="Ingresos de hoy"
          value={formatCurrency(data?.today.sales ?? 0)}
          description="Ventas del día"
          icon={Coins}
          color="gold"
        />
        <DashboardKpiCard
          title="Productos activos"
          value={productsData ? productsData.filter((p: any) => p.isAvailable).length : 0}
          description="Productos visibles en catálogo"
          icon={Package}
          color="sage"
        />
      </div>
    </div>
  );
}
