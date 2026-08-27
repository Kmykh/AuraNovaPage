import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { AdminQuotesList } from '@/components/admin/quotes/AdminQuotesList';

export const metadata: Metadata = {
  title: 'Cotizaciones | Aura Nova',
  description: 'Administración de cotizaciones de envíos nacionales',
  robots: { index: false, follow: false }
};

export default function AdminQuotesPage() {
  return (
    <div className="py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-brown">Cotizaciones</h1>
        <p className="text-sage mt-1">
          Define el costo de envío para los pedidos nacionales en espera.
        </p>
      </div>

      <Suspense fallback={<div>Cargando panel...</div>}>
        <AdminQuotesList />
      </Suspense>
    </div>
  );
}
