import React from 'react';
import { Metadata } from 'next';
import { AdminPaymentDetail } from '@/components/admin/payments/AdminPaymentDetail';

export const metadata: Metadata = {
  title: 'Detalle del Pago | Aura Nova',
  description: 'Revisión y confirmación de pagos',
  robots: { index: false, follow: false }
};

export default async function AdminPaymentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="py-6">
      <AdminPaymentDetail id={id} />
    </div>
  );
}
