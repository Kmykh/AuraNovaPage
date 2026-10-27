import React from 'react';
import { Metadata } from 'next';
import { PaymentRedirect } from './PaymentRedirect';

export const metadata: Metadata = {
  title: 'Pago | Aura Nova',
  robots: { index: false, follow: false }
};

/** El comprobante se revisa en el detalle del pedido (confirmar o rechazar). */
export default async function AdminPaymentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PaymentRedirect id={id} />;
}
