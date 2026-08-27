import React from 'react';
import { Metadata } from 'next';
import { DeliveryZonesList } from '@/components/admin/shipping/DeliveryZonesList';
import { MeetingPointsList } from '@/components/admin/shipping/MeetingPointsList';

export const metadata: Metadata = {
  title: 'Gestión de Envíos | Aura Nova',
  description: 'Administra zonas de reparto y puntos de encuentro',
  robots: { index: false, follow: false }
};

export default function AdminShippingPage() {
  return (
    <div className="py-6 max-w-6xl mx-auto space-y-8">
      <div className="mb-6">
        <h1 className="text-3xl font-serif font-bold text-brown">Gestión de Envíos</h1>
        <p className="text-sage mt-1">
          Configura tus zonas de delivery local y los puntos de encuentro. 
          Los envíos nacionales se cotizan automáticamente según la demanda.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
        <DeliveryZonesList />
        <MeetingPointsList />
      </div>
    </div>
  );
}
