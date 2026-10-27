"use client";

import React, { useState } from 'react';
import { useAdminMeetingPoints, useCreateMeetingPoint, useUpdateMeetingPoint, useToggleMeetingPoint } from '@/hooks/use-admin-shipping';
import { MeetingPointAdminResponse } from '@/types/admin-shipping';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { Map, MapPin, Navigation, CircleDollarSign } from 'lucide-react';
import { ShippingListHeader, ShippingRow } from './ShippingRow';
import { toast } from 'sonner';

export function MeetingPointsList() {
  const { data: points, isLoading, isError, refetch } = useAdminMeetingPoints();
  const { mutate: createPoint, isPending: isCreating } = useCreateMeetingPoint();
  const { mutate: updatePoint, isPending: isUpdating } = useUpdateMeetingPoint();
  const { mutate: togglePoint, isPending: isToggling } = useToggleMeetingPoint();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState<MeetingPointAdminResponse | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [cost, setCost] = useState('');

  const openCreateModal = () => {
    setEditingPoint(null);
    setName('');
    setAddress('');
    setCost('');
    setIsModalOpen(true);
  };

  const openEditModal = (point: MeetingPointAdminResponse) => {
    setEditingPoint(point);
    setName(point.name);
    setAddress(point.address);
    setCost(point.cost.toString());
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numCost = parseFloat(cost);
    
    if (isNaN(numCost) || numCost < 0) {
      toast.error('El costo debe ser un número válido mayor o igual a 0');
      return;
    }

    if (editingPoint) {
      updatePoint(
        { id: editingPoint.id, data: { name, address, cost: numCost } },
        {
          onSuccess: () => {
            toast.success('Punto de encuentro actualizado correctamente');
            setIsModalOpen(false);
          },
          onError: () => toast.error('Error al actualizar')
        }
      );
    } else {
      createPoint(
        { name, address, cost: numCost },
        {
          onSuccess: () => {
            toast.success('Punto de encuentro creado correctamente');
            setIsModalOpen(false);
          },
          onError: () => toast.error('Error al crear el punto de encuentro')
        }
      );
    }
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gold/10 text-gold mb-4">
              <Map size={24} />
            </div>
            <h2 className="text-2xl font-serif font-bold text-brown">
              {editingPoint ? 'Editar Punto de Encuentro' : 'Nuevo Punto de Encuentro'}
            </h2>
            <p className="text-sage text-sm mt-1">Configura los detalles de este punto de recojo.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <label className="block text-[10px] font-bold text-sage mb-1 uppercase tracking-widest">Nombre / Referencia</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MapPin size={18} className="text-gold/60" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Estación Central"
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-sage/20 rounded-xl focus:ring-2 focus:ring-gold/30 focus:border-gold/50 outline-none transition-all shadow-sm text-brown placeholder:text-sage/40"
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-[10px] font-bold text-sage mb-1 uppercase tracking-widest">Dirección exacta</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Navigation size={18} className="text-gold/60" />
                </div>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ej. Av. Paseo de la República s/n"
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-sage/20 rounded-xl focus:ring-2 focus:ring-gold/30 focus:border-gold/50 outline-none transition-all shadow-sm text-brown placeholder:text-sage/40"
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-[10px] font-bold text-sage mb-1 uppercase tracking-widest">Costo de entrega (S/)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <CircleDollarSign size={18} className="text-gold/60" />
                </div>
                <input
                  type="number"
                  step="0.10"
                  min="0"
                  required
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="5.00"
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-sage/20 rounded-xl focus:ring-2 focus:ring-gold/30 focus:border-gold/50 outline-none transition-all shadow-sm text-brown placeholder:text-sage/40 font-mono"
                />
              </div>
            </div>
            
            <div className="pt-6 flex gap-3 border-t border-sage/10">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 rounded-xl border-sage/20 text-sage hover:bg-cream">
                Cancelar
              </Button>
              <Button type="submit" disabled={isCreating || isUpdating} className="flex-1 bg-gradient-to-r from-gold to-[#D4AF37] hover:from-[#D4AF37] hover:to-gold text-white shadow-lg shadow-gold/20 py-3.5 rounded-xl border-0">
                {isCreating || isUpdating ? 'Guardando...' : 'Guardar Punto'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
