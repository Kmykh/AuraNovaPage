import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { AdminPaymentsList } from '@/components/admin/payments/AdminPaymentsList';

export const metadata: Metadata = {
  title: 'Gestión de Pagos | Aura Nova',
  description: 'Administración de pagos en Aura Nova',
  robots: { index: false, follow: false }
};

export default function AdminPaymentsPage() {
  return (
    <div className="py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-brown">Pagos</h1>
        <p className="text-sage mt-1">
          Visualiza, confirma o rechaza las notificaciones de pago.
        </p>
      </div>

      <Suspense fallback={<div>Cargando panel...</div>}>
        <AdminPaymentsList />
      </Suspense>
    </div>
  );
}
