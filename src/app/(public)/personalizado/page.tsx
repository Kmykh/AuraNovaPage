import React from 'react';
import { Metadata } from 'next';
import { CustomOrderClient } from './CustomOrderClient';

export const metadata: Metadata = {
  title: 'Pedido Personalizado - Aura Nova',
  description: 'Solicita un producto 100% personalizado según tus gustos y necesidades.',
};

export default function CustomOrderPage() {
  return (
    <main className="min-h-screen bg-[#faf7f2] pt-28 pb-12">
      <CustomOrderClient />
    </main>
  );
}
