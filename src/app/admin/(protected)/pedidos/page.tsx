import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { AdminOrdersList } from '@/components/admin/orders/AdminOrdersList';

export const metadata: Metadata = {
  title: 'Gestión de Pedidos | Aura Nova',
  description: 'Administración de pedidos en Aura Nova',
  robots: { index: false, follow: false }
};

export default function AdminOrdersPage() {
  return (
    <div className="py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-brown">Pedidos</h1>
        <p className="text-sage mt-1">
          Busca, filtra y actualiza el estado de los pedidos.
        </p>
      </div>

      <Suspense fallback={<div>Cargando panel...</div>}>
        <AdminOrdersList />
      </Suspense>
    </div>
  );
}
