import React from 'react';
import { Metadata } from 'next';
import { QuoteRedirect } from './QuoteRedirect';

export const metadata: Metadata = {
  title: 'Pedido personalizado | Aura Nova',
  robots: { index: false, follow: false }
};

/** La cotización se hace en el detalle del pedido (allí están la ficha y el precio). */
export default async function AdminQuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <QuoteRedirect id={id} />;
}
