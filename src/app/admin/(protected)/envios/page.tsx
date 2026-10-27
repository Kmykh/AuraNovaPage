import React from 'react';
import { Metadata } from 'next';
import { Truck } from 'lucide-react';
import { DeliveryZonesList } from '@/components/admin/shipping/DeliveryZonesList';
import { MeetingPointsList } from '@/components/admin/shipping/MeetingPointsList';
import { ShippingSummary } from '@/components/admin/shipping/ShippingSummary';

export const metadata: Metadata = {
  title: 'Gestión de Envíos | Aura Nova',
  description: 'Administra zonas de reparto y puntos de encuentro',
  robots: { index: false, follow: false }
};

export default function AdminShippingPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="flex items-center gap-2 font-serif text-2xl font-bold text-brown">
          <Truck className="text-gold" /> Envíos
        </h1>
        <p className="mt-1 text-sage">Cómo recibe el cliente su pedido. Lo que ocultes aquí deja de aparecer al pagar.</p>
      </div>

      <ShippingSummary />

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-2">
        <DeliveryZonesList />
        <MeetingPointsList />
      </div>
    </div>
  );
}
