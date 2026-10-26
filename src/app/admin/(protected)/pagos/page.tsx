import React from 'react';
import { Metadata } from 'next';
import { OnlinePaymentsReport } from '@/components/admin/payments/OnlinePaymentsReport';
import { LegacyProofsNotice } from '@/components/admin/payments/LegacyProofsNotice';

export const metadata: Metadata = {
  title: 'Gestión de Pagos | Aura Nova',
  description: 'Administración de pagos en Aura Nova',
  robots: { index: false, follow: false }
};

export default function AdminPaymentsPage() {
  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-brown">Pagos</h1>
        <p className="text-sage mt-1">
          Lo que cobraste con Mercado Pago (tarjeta y Yape), las devoluciones y el estado de la conexión.
        </p>
      </div>

      <LegacyProofsNotice />
      <OnlinePaymentsReport />
    </div>
  );
}
