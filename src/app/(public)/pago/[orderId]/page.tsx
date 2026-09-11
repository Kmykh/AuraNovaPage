import React from 'react';
import { Metadata } from 'next';
import { PaymentClient } from './PaymentClient';

export const metadata: Metadata = {
  title: 'Paga tu pedido | Aura Nova',
  description: 'Adjunta el comprobante de tu pedido con Yape.',
  robots: { index: false, follow: false },
};

interface PaymentPageProps {
  params: Promise<{
    orderId: string;
  }>;
}

export default async function PaymentPage({ params }: PaymentPageProps) {
  const { orderId } = await params;
  
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-24 pb-12 md:pt-28 md:pb-16 min-h-[60vh]">
      <PaymentClient orderId={orderId} />
    </div>
  );
}
