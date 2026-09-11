import React, { useState } from 'react';
import { CampaignResponse, CampaignStageResponse } from '@/types/campaigns';
import { useAddCampaignStage, useUpdateCampaignStage, useDeleteCampaignStage } from '@/hooks/use-admin-campaigns';
import { Button } from '@/components/ui/Button';
import { Plus, Edit2, Trash2, CalendarDays, AlertTriangle, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { toast } from 'sonner';

interface Props {
  campaign: CampaignResponse;
}

export function CampaignStagesTab({ campaign }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<CampaignStageResponse | null>(null);
  const [deleteModalState, setDeleteModalState] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false,
    id: '',
    name: ''
  });

  const { mutate: deleteStage, isPending: isDeleting } = useDeleteCampaignStage(campaign.id);

  const handleCreate = () => {
    setSelectedStage(null);
    setIsModalOpen(true);
  };

  const handleEdit = (stage: CampaignStageResponse) => {
    setSelectedStage(stage);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deleteModalState.id) return;
    deleteStage(deleteModalState.id, {
      onSuccess: () => {
        toast.success('Etapa eliminada correctamente');
        setDeleteModalState({ isOpen: false, id: '', name: '' });
      },
      onError: (err: any) => toast.error('Error al eliminar', { description: err?.message || 'No se pudo eliminar la etapa' })
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-serif font-bold text-brown">Etapas de la Campaña</h3>
          <p className="text-sage text-xs sm:text-sm mt-0.5">
            Define las fases temporales (ej. Preventa, Día Central) y los periodos en los que aplican precios especiales.
          </p>
        </div>
        <Button 
          onClick={handleCreate}
          className="bg-[#c8a96b] hover:bg-[#b09355] text-white rounded-xl shadow-xs font-semibold px-4 py-2.5 flex items-center gap-2 shrink-0 self-start sm:self-center"
        >
          <Plus size={16} /> Nueva Etapa
        </Button>
      </div>

      {campaign.stages.length === 0 ? (
        <div className="p-10 text-center bg-[#FAF9F6] rounded-2xl border border-sage/15 text-sage">
          <CalendarDays size={36} className="mx-auto mb-2 text-sage/40" />
          <p className="font-bold text-brown">No hay etapas configuradas</p>
          <p className="text-xs text-sage mt-1">Crea etapas para poder asignar precios dinámicos según la fecha.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-sage/15 rounded-2xl bg-white shadow-2xs">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#FAF9F6] text-sage font-bold uppercase tracking-wider text-[11px] border-b border-sage/15">
              <tr>
                <th className="px-6 py-3.5">Nombre de Etapa</th>
                <th className="px-6 py-3.5">Vigencia</th>
                <th className="px-6 py-3.5 text-center">Estado</th>
                <th className="px-6 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage/10 text-brown">
              {campaign.stages.map(stage => (
                <tr key={stage.id} className="hover:bg-[#FAF9F6]/80 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-bold text-brown text-sm">{stage.name}</span>
                  </td>
                  <td className="px-6 py-4 text-xs text-sage">
                    <div className="flex items-center gap-1.5 font-medium">
                      <CalendarDays size={13} className="text-[#c8a96b]" />
                      <span>{new Date(stage.startDate).toLocaleString('es-PE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="text-sage/40">—</span>
                      <span>{new Date(stage.endDate).toLocaleString('es-PE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${
                      stage.isActive 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' 
                        : 'bg-sage/15 text-sage'
                    }`}>
                      {stage.isActive ? 'Activa' : 'Pausada'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(stage)} 
                        className="p-2 rounded-xl bg-white border border-sage/20 text-brown/70 hover:text-[#c8a96b] hover:border-gold/50 hover:bg-gold/5 transition-all shadow-2xs" 
                        title="Editar etapa"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button 
                        onClick={() => setDeleteModalState({ isOpen: true, id: stage.id, name: stage.name })} 
                        disabled={isDeleting} 
                        className="p-2 rounded-xl bg-white border border-sage/20 text-rose-500 hover:text-rose-700 hover:border-rose-300 hover:bg-rose-50 transition-all shadow-2xs" 
                        title="Eliminar etapa"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <StageModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          campaign={campaign} 
          stage={selectedStage} 
        />
      )}

      {/* ── Modal de Confirmación para Eliminar Etapa ── */}
      <Modal
        isOpen={deleteModalState.isOpen}
        onClose={() => !isDeleting && setDeleteModalState({ isOpen: false, id: '', name: '' })}
        title="¿Eliminar etapa?"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 pt-2">
          <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 p-4 rounded-2xl">
            <div className="p-2 bg-rose-100 text-rose-600 rounded-xl shrink-0">
              <AlertTriangle size={18} />
            </div>
            <div className="text-xs sm:text-sm text-rose-900 leading-relaxed">
              ¿Deseas eliminar la etapa <span className="font-bold text-rose-950">"{deleteModalState.name}"</span>?
              <p className="mt-1 text-rose-800/80 text-xs">
                Se removerán los precios específicos configurados para esta fase en los productos vinculados.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-sage/10">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteModalState({ isOpen: false, id: '', name: '' })}
              disabled={isDeleting}
              className="rounded-xl border-sage/30 text-sage hover:text-brown"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl px-5 font-semibold shadow-sm flex items-center gap-2"
            >
              {isDeleting ? (
                <><Loader2 size={16} className="animate-spin" /> Eliminando...</>
              ) : (
                <><Trash2 size={16} /> Eliminar etapa</>
              )}
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}

function StageModal({ isOpen, onClose, campaign, stage }: { isOpen: boolean; onClose: () => void; campaign: CampaignResponse; stage: CampaignStageResponse | null }) {
  const { mutate: addStage, isPending: isAdding } = useAddCampaignStage(campaign.id);
  const { mutate: updateStage, isPending: isUpdating } = useUpdateCampaignStage(campaign.id);

  const [name, setName] = useState(stage?.name || '');
  const [startDate, setStartDate] = useState(stage?.startDate.slice(0, 16) || '');
  const [endDate, setEndDate] = useState(stage?.endDate.slice(0, 16) || '');
  const [isActive, setIsActive] = useState(stage?.isActive ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const start = new Date(startDate);
    const end = new Date(endDate);
    const campStart = new Date(campaign.startDate);
    const campEnd = new Date(campaign.endDate);

    if (start >= end) {
      toast.error('Error de Fechas', { description: 'La fecha de inicio debe ser menor a la de fin.' });
      return;
    }
    
    if (start < campStart || end > campEnd) {
      toast.error('Error de Rango', { description: 'Las fechas de la etapa deben estar dentro del rango de la campaña.' });
      return;
    }

    const payload = {
      name,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      isActive
    };

    if (stage) {
      updateStage({ stageId: stage.id, data: payload }, {
        onSuccess: () => { toast.success('Etapa actualizada'); onClose(); },
        onError: (err: any) => toast.error('Error', { description: err.message })
      });
    } else {
      addStage(payload, {
        onSuccess: () => { toast.success('Etapa creada'); onClose(); },
        onError: (err: any) => toast.error('Error', { description: err.message })
      });
    }
  };

  const isPending = isAdding || isUpdating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brown/20 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-sage/15" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-sage/10 bg-[#FAF9F6]">
          <h2 className="text-xl font-serif font-bold text-brown">{stage ? 'Editar Etapa' : 'Nueva Etapa'}</h2>
          <p className="text-xs text-sage mt-0.5">Asigna nombre y periodo dentro de la campaña.</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-sage mb-1.5">Nombre (ej. Preventa)</label>
            <input 
              type="text" 
              required 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-sage/20 rounded-xl focus:bg-white focus:border-gold outline-none text-sm text-brown font-medium" 
              placeholder="Ej. Preventa Especial"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-sage mb-1.5">Fecha de Inicio</label>
              <input 
                type="datetime-local" 
                required 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)} 
                className="w-full px-3 py-2 bg-[#FAF9F6] border border-sage/20 rounded-xl focus:bg-white focus:border-gold outline-none text-xs text-brown font-medium" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-sage mb-1.5">Fecha de Fin</label>
              <input 
                type="datetime-local" 
                required 
                value={endDate} 
                onChange={e => setEndDate(e.target.value)} 
                className="w-full px-3 py-2 bg-[#FAF9F6] border border-sage/20 rounded-xl focus:bg-white focus:border-gold outline-none text-xs text-brown font-medium" 
              />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input 
              type="checkbox" 
              id="stageActive"
              checked={isActive} 
              onChange={e => setIsActive(e.target.checked)} 
              className="w-4 h-4 rounded text-[#c8a96b] focus:ring-[#c8a96b] border-sage/30" 
            />
            <label htmlFor="stageActive" className="text-sm font-medium text-brown cursor-pointer">
              Etapa activa para la tienda
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-sage/10 mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending} className="rounded-xl border-sage/30 text-sage hover:text-brown">
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending} className="bg-[#c8a96b] hover:bg-[#b09355] text-white rounded-xl font-semibold px-5">
              {isPending ? 'Guardando...' : 'Guardar Etapa'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
