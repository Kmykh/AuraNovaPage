"use client";

import React from 'react';
import { Map, MapPin, Package } from 'lucide-react';
import { useAdminDeliveryZones, useAdminMeetingPoints } from '@/hooks/use-admin-shipping';
import { formatCurrency } from '@/lib/formatters';

/** Las 3 formas de entrega que ve el cliente al pagar, con lo que hay activo en cada una. */
export function ShippingSummary() {
  const { data: zones } = useAdminDeliveryZones();
  const { data: points } = useAdminMeetingPoints();
  const activeZones = zones?.filter(z => z.isActive) ?? [];
  const activePoints = points?.filter(p => p.isActive) ?? [];
  const minCost = activeZones.length ? Math.min(...activeZones.map(z => z.cost)) : null;

  const cards = [
    {
      icon: MapPin,
      title: 'Delivery en Huancayo',
      value: zones ? `${activeZones.length} ${activeZones.length === 1 ? 'zona' : 'zonas'}` : '…',
      hint: minCost === null ? 'Sin zonas activas: el cliente no verá delivery' : minCost > 0 ? `Desde ${formatCurrency(minCost)}` : 'Desde gratis',
      warn: zones !== undefined && activeZones.length === 0,
    },
    {
      icon: Map,
      title: 'Punto de encuentro',
      value: points ? `${activePoints.length} ${activePoints.length === 1 ? 'punto' : 'puntos'}` : '…',
      hint: activePoints.length === 0 ? 'Sin puntos activos' : activePoints.every(p => p.cost === 0) ? 'Sin costo para el cliente' : 'Con costo en algunos puntos',
      warn: points !== undefined && activePoints.length === 0,
    },
    {
      icon: Package,
      title: 'Envío a provincia',
      value: 'Shalom u Olva',
      hint: 'El cliente paga el flete al recoger en la agencia',
      warn: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {cards.map(card => (
        <div key={card.title} className={`flex items-start gap-3 rounded-2xl border bg-white p-4 shadow-sm ${card.warn ? 'border-amber-200' : 'border-sage/10'}`}>
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${card.warn ? 'bg-amber-50 text-amber-600' : 'bg-gold/10 text-gold'}`}>
            <card.icon size={18} />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-sage">{card.title}</p>
            <p className="font-serif text-lg font-bold text-brown">{card.value}</p>
            <p className={`text-xs ${card.warn ? 'font-semibold text-amber-700' : 'text-sage'}`}>{card.hint}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
