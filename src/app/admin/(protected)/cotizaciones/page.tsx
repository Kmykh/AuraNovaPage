import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { AdminQuotesList } from '@/components/admin/quotes/AdminQuotesList';

export const metadata: Metadata = {
  title: 'Pedidos Personalizados | Aura Nova',
  description: 'Administración de pedidos personalizados y propuestas',
  robots: { index: false, follow: false }
};

export default function AdminQuotesPage() {
  return (
    <div className="py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-brown">Pedidos Personalizados</h1>
        <p className="text-sage mt-1">
          Gestiona las solicitudes de arreglos personalizados y responde con propuestas de costo.
        </p>
      </div>

      <Suspense fallback={<div>Cargando panel...</div>}>
        <AdminQuotesList />
      </Suspense>
    </div>
  );
}
