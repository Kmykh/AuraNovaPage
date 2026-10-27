"use client";

import React, { useState } from 'react';
import { useAdminDeliveryZones, useToggleDeliveryZone } from '@/hooks/use-admin-shipping';
import { DeliveryZoneAdminResponse } from '@/types/admin-shipping';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { MapPin } from 'lucide-react';
import { DeliveryZonePanel } from './ShippingForms';
import { ShippingListHeader, ShippingRow } from './ShippingRow';
import { toast } from 'sonner';

export function DeliveryZonesList() {
  const { data: zones, isLoading, isError, refetch } = useAdminDeliveryZones();
  const { mutate: toggleZone, isPending: isToggling } = useToggleDeliveryZone();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<DeliveryZoneAdminResponse | null>(null);


  const openCreateModal = () => {
    setEditingZone(null);
    setIsModalOpen(true);
  };

  const openEditModal = (zone: DeliveryZoneAdminResponse) => {
    setEditingZone(zone);
    setIsModalOpen(true);
  };

  const handleToggle = (id: string, currentStatus: boolean) => {
    toggleZone({ id, isActive: !currentStatus }, {
      onSuccess: () => {
        toast.success(currentStatus ? 'Zona oculta: ya no aparece al pagar' : 'Zona visible al pagar');
      },
      onError: () => toast.error('Error al cambiar el estado de la zona')
    });
  };

  if (isLoading) {
    return <Skeleton variant="rect" className="w-full h-64 rounded-2xl" />;
  }

  if (isError) {
    return (
      <div className="bg-red-50 p-6 rounded-2xl border border-red-100 text-center">
        <p className="text-red-600 mb-4">Error al cargar las zonas de reparto</p>
        <Button onClick={() => refetch()} variant="outline">Reintentar</Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-sage/10 overflow-hidden">
      <ShippingListHeader
        icon={MapPin}
        title="Delivery en Huancayo"
        hint={`${zones?.filter(z => z.isActive).length ?? 0} de ${zones?.length ?? 0} zonas visibles al pagar`}
        actionLabel="Nueva zona"
        onAction={openCreateModal}
      />

      {zones && zones.length > 0 ? (
        <div className="divide-y divide-sage/10">
          {[...zones].sort((a, b) => Number(b.isActive) - Number(a.isActive) || a.cost - b.cost).map(zone => (
            <ShippingRow
              key={zone.id}
              name={zone.name}
              detail={
                <span className="flex flex-wrap gap-1">
                  {zone.district.split(',').map(d => d.trim()).filter(Boolean).map(d => (
                    <span key={d} className="rounded-md bg-sage/10 px-1.5 py-0.5 text-[11px] font-medium text-sage">{d}</span>
                  ))}
                </span>
              }
              cost={zone.cost}
              isActive={zone.isActive}
              onToggle={() => handleToggle(zone.id, zone.isActive)}
              onEdit={() => openEditModal(zone)}
              toggling={isToggling}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center text-sage">
          <MapPin size={48} strokeWidth={1} className="mx-auto mb-4 opacity-50" />
          <p>No tienes zonas de reparto configuradas.</p>
          <p className="text-sm mt-1">Crea tu primera zona para ofrecer delivery local.</p>
        </div>
      )}

      <DeliveryZonePanel isOpen={isModalOpen} zone={editingZone} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
