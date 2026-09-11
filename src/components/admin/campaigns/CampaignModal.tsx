import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateCampaign, useUpdateCampaign } from '@/hooks/use-admin-campaigns';
import { CampaignsService } from '@/services/campaigns.service';
import { CampaignResponse } from '@/types/campaigns';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

interface CampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign?: CampaignResponse | null;
}

export function CampaignModal({ isOpen, onClose, campaign }: CampaignModalProps) {
  const router = useRouter();
  const { mutate: createCampaign, isPending: isCreating } = useCreateCampaign();
  const { mutate: updateCampaign, isPending: isUpdating } = useUpdateCampaign(campaign?.id || '');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (campaign) {
      setName(campaign.name);
      setDescription(campaign.description || '');
      setStartDate(campaign.startDate.slice(0, 10)); // Format for date (YYYY-MM-DD)
      setEndDate(campaign.endDate.slice(0, 10));
      setIsActive(campaign.isActive);
    } else {
      setName('');
      setDescription('');
      setStartDate('');
      setEndDate('');
      setIsActive(true);
    }
  }, [campaign, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Regla de Negocio: Validación de Fechas
    if (new Date(startDate) >= new Date(endDate)) {
      toast.error('Error de Fechas', {
        description: 'La fecha de inicio debe ser menor a la fecha de fin.'
      });
      return;
    }

    const startIso = new Date(`${startDate}T00:00:00`).toISOString();
    const endIso = new Date(`${endDate}T23:59:59`).toISOString();

    const payload = {
      name,
      description: description || null,
      startDate: startIso,
      endDate: endIso,
      isActive
    };

    if (campaign) {
      updateCampaign(payload, {
        onSuccess: () => {
          toast.success('Campaña actualizada');
          onClose();
        },
        onError: (err: any) => {
          toast.error('Error al actualizar', { description: err.message || 'Ocurrió un error inesperado' });
        }
      });
    } else {
      createCampaign(payload, {
        onSuccess: async (createdCampaign) => {
          toast.success('Campaña creada');
          try {
            // Regla de Negocio: Autocrear etapas comunes
            await CampaignsService.addStage(createdCampaign.id, {
              name: 'Preventa',
              startDate: startIso,
              endDate: endIso, // El cliente ajustará esto después
              isActive: true
            });
            await CampaignsService.addStage(createdCampaign.id, {
              name: 'Día Central',
              startDate: startIso,
              endDate: endIso,
              isActive: true
            });
          } catch (e) {
            console.error(e);
            toast.warning('Campaña creada, pero hubo un problema al generar las etapas.');
          }
          onClose();
          router.push(`/admin/campanas/${createdCampaign.id}?tab=stages`);
        },
        onError: (err: any) => {
          toast.error('Error al crear', { description: err.message || 'Ocurrió un error inesperado' });
        }
      });
    }
  };

  const isPending = isCreating || isUpdating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brown/20 backdrop-blur-sm">
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-sage/10">
          <h2 className="text-xl font-serif font-bold text-brown">
            {campaign ? 'Editar Campaña' : 'Nueva Campaña'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-sage mb-1">Nombre de la campaña</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border border-sage/20 rounded-lg text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
              placeholder="Ej. Día de la Madre 2026"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-sage mb-1">Descripción</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-sage/20 rounded-lg text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold resize-none"
              placeholder="Descripción opcional"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-sage mb-1">Fecha de Inicio</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-sage/20 rounded-lg text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-sage mb-1">Fecha de Fin</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-sage/20 rounded-lg text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={e => setIsActive(e.target.checked)}
              className="rounded text-gold focus:ring-gold border-sage/30 w-4 h-4"
            />
            <label htmlFor="isActive" className="text-sm text-sage cursor-pointer">
              Campaña activa
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-sage/10 mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Guardando...' : 'Guardar Campaña'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
