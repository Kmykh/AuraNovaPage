"use client";

import React, { useState } from 'react';
import { useAdminMeetingPoints, useToggleMeetingPoint } from '@/hooks/use-admin-shipping';
import { MeetingPointAdminResponse } from '@/types/admin-shipping';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Map } from 'lucide-react';
import { MeetingPointPanel } from './ShippingForms';
import { ShippingListHeader, ShippingRow } from './ShippingRow';
import { toast } from 'sonner';

export function MeetingPointsList() {
  const { data: points, isLoading, isError, refetch } = useAdminMeetingPoints();
  const { mutate: togglePoint, isPending: isToggling } = useToggleMeetingPoint();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState<MeetingPointAdminResponse | null>(null);


  const openCreateModal = () => {
    setEditingPoint(null);
    setIsModalOpen(true);
  };

  const openEditModal = (point: MeetingPointAdminResponse) => {
    setEditingPoint(point);
    setIsModalOpen(true);
  };

  const handleToggle = (id: string, currentStatus: boolean) => {
    togglePoint({ id, isActive: !currentStatus }, {
      onSuccess: () => {
        toast.success(currentStatus ? 'Punto oculto: ya no aparece al pagar' : 'Punto visible al pagar');
      },
      onError: () => toast.error('Error al cambiar el estado del punto de encuentro')
    });
  };

  if (isLoading) {
    return <Skeleton variant="rect" className="w-full h-64 rounded-2xl" />;
  }

  if (isError) {
    return (
      <div className="bg-red-50 p-6 rounded-2xl border border-red-100 text-center">
        <p className="text-red-600 mb-4">Error al cargar los puntos de encuentro</p>
        <Button onClick={() => refetch()} variant="outline">Reintentar</Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-sage/10 overflow-hidden">
      <ShippingListHeader
        icon={Map}
        title="Puntos de encuentro"
        hint={`${points?.filter(p => p.isActive).length ?? 0} de ${points?.length ?? 0} puntos visibles al pagar`}
        actionLabel="Nuevo punto"
        onAction={openCreateModal}
      />

      {points && points.length > 0 ? (
        <div className="divide-y divide-sage/10">
          {[...points].sort((a, b) => Number(b.isActive) - Number(a.isActive)).map(point => (
            <ShippingRow
              key={point.id}
              name={point.name}
              detail={point.address}
              cost={point.cost}
              isActive={point.isActive}
              onToggle={() => handleToggle(point.id, point.isActive)}
              onEdit={() => openEditModal(point)}
              toggling={isToggling}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center text-sage">
          <Map size={48} strokeWidth={1} className="mx-auto mb-4 opacity-50" />
          <p>No tienes puntos de encuentro configurados.</p>
          <p className="text-sm mt-1">Crea tu primer punto (ej. Parque Huamanmarca).</p>
        </div>
      )}

      <MeetingPointPanel isOpen={isModalOpen} point={editingPoint} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
