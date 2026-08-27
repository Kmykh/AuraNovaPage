import React from 'react';
import { Metadata } from 'next';
import { AdminOrderDetail } from '@/components/admin/orders/AdminOrderDetail';

export const metadata: Metadata = {
  title: 'Detalle de Pedido | Aura Nova',
  description: 'Información detallada del pedido',
  robots: { index: false, follow: false }
};

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="py-6">
      <AdminOrderDetail id={id} />
    </div>
  );
}
