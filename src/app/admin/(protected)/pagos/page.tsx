import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { AdminPaymentsList } from '@/components/admin/payments/AdminPaymentsList';
import { OnlinePaymentsReport } from '@/components/admin/payments/OnlinePaymentsReport';

export const metadata: Metadata = {
  title: 'Gestión de Pagos | Aura Nova',
  description: 'Administración de pagos en Aura Nova',
  robots: { index: false, follow: false }
};

export default function AdminPaymentsPage() {
  return (
    <div className="space-y-10 py-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-brown">Pagos</h1>
        <p className="text-sage mt-1">
          Cobros con Mercado Pago, devoluciones y el estado de los avisos. Exporta el periodo para cuadrar con tu cuenta.
        </p>
      </div>

      <OnlinePaymentsReport />

      <section>
        <h2 className="text-xl font-serif font-bold text-brown">Comprobantes por captura</h2>
        <p className="text-sage mt-1 mb-4 text-sm">Pagos con captura de Yape del sistema anterior.</p>
        <Suspense fallback={<div>Cargando…</div>}>
          <AdminPaymentsList />
        </Suspense>
      </section>
    </div>
  );
}
