"use client";

import React, { useState } from 'react';
import { useAdminDeliveryZones, useCreateDeliveryZone, useUpdateDeliveryZone, useToggleDeliveryZone } from '@/hooks/use-admin-shipping';
import { DeliveryZoneAdminResponse } from '@/types/admin-shipping';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { MapPin, Plus, Edit2, CheckCircle2, XCircle, Map, CircleDollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { toast } from 'sonner';

export function DeliveryZonesList() {
  const { data: zones, isLoading, isError, refetch } = useAdminDeliveryZones();
  const { mutate: createZone, isPending: isCreating } = useCreateDeliveryZone();
  const { mutate: updateZone, isPending: isUpdating } = useUpdateDeliveryZone();
  const { mutate: toggleZone, isPending: isToggling } = useToggleDeliveryZone();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<DeliveryZoneAdminResponse | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [district, setDistrict] = useState('');
  const [cost, setCost] = useState('');

  const openCreateModal = () => {
    setEditingZone(null);
    setName('');
    setDistrict('');
    setCost('');
    setIsModalOpen(true);
  };

  const openEditModal = (zone: DeliveryZoneAdminResponse) => {
    setEditingZone(zone);
    setName(zone.name);
    setDistrict(zone.district);
    setCost(zone.cost.toString());
    setIsModalOpen(true);
  };

  const handleToggle = (id: string, currentStatus: boolean) => {
    toggleZone({ id, isActive: !currentStatus }, {
      onSuccess: () => {
        toast.success(`Zona ${currentStatus ? 'desactivada' : 'activada'}`);
      },
      onError: () => toast.error('Error al cambiar el estado de la zona')
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numCost = parseFloat(cost);
    
    if (isNaN(numCost) || numCost < 0) {
      toast.error('El costo debe ser un número válido mayor o igual a 0');
      return;
    }

    if (editingZone) {
      updateZone(
        { id: editingZone.id, data: { name, district, cost: numCost } },
        {
          onSuccess: () => {
            toast.success('Zona actualizada correctamente');
            setIsModalOpen(false);
          },
          onError: () => toast.error('Error al actualizar la zona')
        }
      );
    } else {
      createZone(
        { name, district, cost: numCost },
        {
          onSuccess: () => {
            toast.success('Zona creada correctamente');
            setIsModalOpen(false);
          },
          onError: () => toast.error('Error al crear la zona')
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
        <p className="text-red-600 mb-4">Error al cargar las zonas de reparto</p>
        <Button onClick={() => refetch()} variant="outline">Reintentar</Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-sage/10 overflow-hidden">
      <div className="p-6 border-b border-sage/10 bg-[#FAFAFA] flex justify-between items-center">
        <h2 className="text-lg font-serif font-semibold text-brown flex items-center gap-2">
          <MapPin size={20} className="text-gold" /> Zonas de Reparto (Delivery Local)
        </h2>
        <Button onClick={openCreateModal} className="bg-brown hover:bg-brown/90 px-4 py-2 rounded-xl text-sm shadow-md">
          <Plus size={16} className="mr-2 inline" /> Nueva Zona
        </Button>
      </div>

      <div className="p-0">
        {zones && zones.length > 0 ? (
          <div className="divide-y divide-sage/10">
            {zones.map((zone) => (
              <div key={zone.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-cream/20 transition-colors">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-semibold text-base ${zone.isActive ? 'text-brown' : 'text-sage line-through'}`}>{zone.name}</h3>
                    {zone.isActive ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sage/10 text-sage text-xs font-medium">
                        <CheckCircle2 size={12} /> Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose/10 text-rose text-xs font-medium">
                        <XCircle size={12} /> Inactivo
                      </span>
                    )}
                  </div>
                  <p className="text-sage text-sm mb-1">Distritos: {zone.district}</p>
                  <p className="text-gold font-medium font-mono text-lg">{formatCurrency(zone.cost)}</p>
                </div>

                <div className="flex gap-2 shrink-0">
                  <Button 
                    variant="outline" 
                    onClick={() => handleToggle(zone.id, zone.isActive)}
                    disabled={isToggling}
                    className={`px-3 py-2 ${zone.isActive ? 'text-rose border-rose/20 hover:bg-rose/5' : 'text-sage border-sage/20 hover:bg-sage/10'}`}
                  >
                    {zone.isActive ? 'Desactivar' : 'Activar'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => openEditModal(zone)}
                    className="px-3 py-2 text-brown border-sage/20 hover:bg-cream"
                  >
                    <Edit2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-sage">
            <MapPin size={48} strokeWidth={1} className="mx-auto mb-4 opacity-50" />
            <p>No tienes zonas de reparto configuradas.</p>
            <p className="text-sm mt-1">Crea tu primera zona para ofrecer delivery local.</p>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gold/10 text-gold mb-4">
              <MapPin size={24} />
            </div>
            <h2 className="text-2xl font-serif font-bold text-brown">
              {editingZone ? 'Editar Zona de Reparto' : 'Nueva Zona de Reparto'}
            </h2>
            <p className="text-sage text-sm mt-1">Configura los detalles y tarifa para esta zona.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <label className="block text-[10px] font-bold text-sage mb-1 uppercase tracking-widest">Nombre de la zona</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MapPin size={18} className="text-gold/60" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Zona Céntrica"
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-sage/20 rounded-xl focus:ring-2 focus:ring-gold/30 focus:border-gold/50 outline-none transition-all shadow-sm text-brown placeholder:text-sage/40"
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-[10px] font-bold text-sage mb-1 uppercase tracking-widest">Distritos incluidos</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Map size={18} className="text-gold/60" />
                </div>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="Ej. El Tambo, Huancayo Centro, Chilca"
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-sage/20 rounded-xl focus:ring-2 focus:ring-gold/30 focus:border-gold/50 outline-none transition-all shadow-sm text-brown placeholder:text-sage/40"
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {['Huancayo', 'El Tambo', 'Chilca', 'Pilcomayo', 'Huancán', 'Sapallanga', 'San Jerónimo'].map((dist) => (
                  <button
                    key={dist}
                    type="button"
                    onClick={() => {
                      const current = district.trim();
                      if (current && !current.includes(dist)) {
                        setDistrict(current + ', ' + dist);
                      } else if (!current) {
                        setDistrict(dist);
                      }
                    }}
                    className="px-3 py-1 bg-cream/50 hover:bg-gold/10 text-sage hover:text-gold text-xs font-medium rounded-lg border border-sage/10 transition-colors"
                  >
                    + {dist}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <label className="block text-[10px] font-bold text-sage mb-1 uppercase tracking-widest">Costo de envío (S/)</label>
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
                  placeholder="10.00"
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-sage/20 rounded-xl focus:ring-2 focus:ring-gold/30 focus:border-gold/50 outline-none transition-all shadow-sm text-brown placeholder:text-sage/40 font-mono"
                />
              </div>
            </div>
            
            <div className="pt-6 flex gap-3 border-t border-sage/10">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 rounded-xl border-sage/20 text-sage hover:bg-cream">
                Cancelar
              </Button>
              <Button type="submit" disabled={isCreating || isUpdating} className="flex-1 bg-gradient-to-r from-gold to-[#D4AF37] hover:from-[#D4AF37] hover:to-gold text-white shadow-lg shadow-gold/20 py-3.5 rounded-xl border-0">
                {isCreating || isUpdating ? 'Guardando...' : 'Guardar Zona'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
