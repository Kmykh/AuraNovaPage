import React from 'react';
import { Metadata } from 'next';
import { AdminQuoteDetail } from '@/components/admin/quotes/AdminQuoteDetail';

export const metadata: Metadata = {
  title: 'Detalle de Cotización | Aura Nova',
  description: 'Cotizar envío nacional',
  robots: { index: false, follow: false }
};

export default async function AdminQuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="py-6">
      <AdminQuoteDetail id={id} />
    </div>
  );
}
