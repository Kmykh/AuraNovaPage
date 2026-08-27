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
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-32 pb-16 md:pt-40 md:pb-24 min-h-[60vh]">
      <div className="mb-8 text-center md:text-left">
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-brown">
          Confirma tu pago
        </h1>
      </div>
      <PaymentClient orderId={orderId} />
    </div>
  );
}
