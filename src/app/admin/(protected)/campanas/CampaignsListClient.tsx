"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminCampaigns, useToggleCampaignStatus, useDeleteCampaign } from '@/hooks/use-admin-campaigns';
import { Button } from '@/components/ui/Button';
import { Plus, Megaphone, Search, Eye, Trash2, CalendarDays, Sparkles, AlertTriangle, Loader2 } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Modal } from '@/components/ui/Modal';
import { toast } from 'sonner';
import { NewFeatureExplanation } from '@/components/admin/shared/NewFeatureExplanation';

export function CampaignsListClient() {
  const router = useRouter();
  const { data: campaigns, isLoading, isError, refetch } = useAdminCampaigns();
  const { mutate: toggleStatus, isPending: isToggling } = useToggleCampaignStatus();
  const { mutate: deleteCampaign, isPending: isDeleting } = useDeleteCampaign();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModalState, setDeleteModalState] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false,
    id: '',
    name: ''
  });

  const handleCreate = () => {
    router.push('/admin/campanas/nueva');
  };

  const handleViewDetail = (id: string) => {
    router.push(`/admin/campanas/${id}`);
  };

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    toggleStatus({ id, isActive: !currentStatus });
  };

  const handleConfirmDelete = () => {
    if (!deleteModalState.id) return;
    deleteCampaign(deleteModalState.id, {
      onSuccess: () => {
        toast.success('Campaña eliminada correctamente');
        setDeleteModalState({ isOpen: false, id: '', name: '' });
      },
      onError: (err: any) => {
        toast.error('Error al eliminar', { description: err?.message || 'No se pudo eliminar la campaña' });
      }
    });
  };

  const filteredCampaigns = campaigns?.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isNow = (start: string, end: string) => {
    const now = new Date();
    return now >= new Date(start) && now <= new Date(end);
  };

  const activeCount = campaigns?.filter(c => c.isActive).length || 0;
  const liveCount = campaigns?.filter(c => isNow(c.startDate, c.endDate) && c.isActive).length || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      
      {/* ── Top Header & Stats ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-sage">Marketing & Promociones</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-brown flex items-center gap-3">
            <Megaphone className="text-[#c8a96b]" size={28} />
            Campañas Comerciales
          </h1>
          <p className="text-sage text-sm mt-1">
            Configura fechas especiales, etapas dinámicas y precios preferenciales para eventos.
          </p>
        </div>

        <Button 
          onClick={handleCreate} 
          className="whitespace-nowrap shrink-0 bg-[#c8a96b] hover:bg-[#b09355] text-white rounded-xl shadow-md px-5 py-2.5 font-semibold flex items-center gap-2"
        >
          <Plus size={18} />
          Nueva Campaña
        </Button>
      </div>

      {/* ── Explicación de Novedad para el Equipo ── */}
      <NewFeatureExplanation
        id="campaigns_module_overview"
        title="Nuevo Módulo de Campañas Comerciales y Preventas"
        badgeLabel="NUEVO"
        whatChanged="Se habilitó esta nueva sección en el panel para gestionar fechas de alta demanda (San Valentín, Día de la Madre, Navidad, etc.). Permite programar promociones por fases con descuentos automáticos por tiempo."
        howToUse={[
          "Haz clic en 'Nueva Campaña' para definir el nombre, fechas de vigencia y descripción.",
          "Configura 'Etapas' con descuentos progresivos (ejemplo: Preventa con 15% de descuento antes de la fecha límite).",
          "Vincula los ramos o flores del catálogo que participarán para que los clientes vean la insignia y precio especial en la tienda online."
        ]}
        tips="Tip de operación: Las campañas activas destacan automáticamente los ramos en la web sin tener que modificar los precios manualmente."
      />

      {/* ── Metrics Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-sage/15 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-sage uppercase tracking-wider">Total Campañas</p>
            <p className="text-2xl font-serif font-bold text-brown mt-1">{campaigns?.length || 0}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-sage/10 text-sage flex items-center justify-center">
            <Megaphone size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-sage/15 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-sage uppercase tracking-wider">Activas</p>
            <p className="text-2xl font-serif font-bold text-brown mt-1">{activeCount}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#c8a96b]/15 text-[#b09355] flex items-center justify-center">
            <Sparkles size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200/80 shadow-xs flex items-center justify-between bg-emerald-50/30">
          <div>
            <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">En Vivo Ahora</p>
            <p className="text-2xl font-serif font-bold text-emerald-700 mt-1">{liveCount}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
          </div>
        </div>
      </div>

      {/* ── Campaigns Table / List ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-sage/15 overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 sm:p-5 border-b border-sage/10 bg-[#FAF9F6] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sage/70 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar campaña por nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-sage/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all text-brown placeholder:text-sage/40"
            />
          </div>
          <span className="text-xs font-semibold text-sage whitespace-nowrap">
            Mostrando {filteredCampaigns?.length || 0} de {campaigns?.length || 0} campañas
          </span>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center text-sage gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#c8a96b]" />
            <span className="text-sm font-medium">Cargando campañas comerciales...</span>
          </div>
        ) : isError ? (
          <div className="p-8">
            <ErrorState title="Error" message="No pudimos cargar las campañas." onRetry={() => refetch()} />
          </div>
        ) : !filteredCampaigns || filteredCampaigns.length === 0 ? (
          <div className="p-12">
            <EmptyState 
              title={searchQuery ? "No se encontraron coincidencias" : "No tienes campañas creadas"} 
              description={searchQuery ? "Intenta con otro término de búsqueda." : "Comienza registrando tu primera campaña comercial para festividades o promociones."}
              icon={<Megaphone size={36} className="text-[#c8a96b]" />}
            />
          </div>
        ) : (
          <div className="divide-y divide-sage/10">
            {filteredCampaigns.map((campaign) => {
              const isLive = isNow(campaign.startDate, campaign.endDate) && campaign.isActive;
              return (
                <div 
                  key={campaign.id} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:bg-[#FAF9F6]/80 transition-colors"
                >
                  {/* Left: Info & Badges */}
                  <div className="flex items-start sm:items-center gap-4 min-w-0">
                    {/* Badge Icon */}
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                      isLive 
                        ? 'bg-emerald-500 text-white shadow-emerald-200' 
                        : campaign.isActive 
                          ? 'bg-[#c8a96b] text-white shadow-gold/20' 
                          : 'bg-sage/15 text-sage'
                    }`}>
                      <Megaphone size={22} />
                    </div>

                    {/* Title and Dates */}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 
                          onClick={() => handleViewDetail(campaign.id)}
                          className="font-serif font-bold text-brown text-base sm:text-lg hover:text-[#c8a96b] cursor-pointer transition-colors truncate"
                        >
                          {campaign.name}
                        </h3>
                        {isLive && (
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase tracking-wider flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                            EN VIVO
                          </span>
                        )}
                        <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${
                          campaign.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : 'bg-sage/10 text-sage'
                        }`}>
                          {campaign.isActive ? 'Activa' : 'Pausada'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-y-1 gap-x-2 text-xs text-sage">
                        <div className="flex items-center gap-1 font-medium">
                          <CalendarDays size={13} className="text-[#c8a96b]" />
                          <span>
                            {new Date(campaign.startDate).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })} — {new Date(campaign.endDate).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <span className="text-sage/40">·</span>
                        <span className="bg-white border border-sage/20 px-2 py-0.5 rounded-md font-medium text-brown/80">
                          {campaign.products.length} productos
                        </span>
                        <span className="text-sage/40">·</span>
                        <span className="bg-white border border-sage/20 px-2 py-0.5 rounded-md font-medium text-brown/80">
                          {campaign.stages.length} etapas
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions (Activar, Ver, Eliminar) */}
                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center pt-2 sm:pt-0">
                    
                    {/* Botón Activar / Desactivar (Toggle) */}
                    <div className="flex items-center gap-2 bg-[#FAF9F6] px-3 py-1.5 rounded-xl border border-sage/15 shadow-2xs">
                      <span className="text-[11px] font-bold text-brown/70 hidden lg:inline">
                        {campaign.isActive ? 'Activa' : 'Pausada'}
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer" title={campaign.isActive ? 'Desactivar campaña' : 'Activar campaña'}>
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={campaign.isActive}
                          onChange={() => handleToggleStatus(campaign.id, campaign.isActive)}
                          disabled={isToggling}
                        />
                        <div className="w-10 h-5 bg-sage/25 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>

                    {/* Botón Ver Detalle */}
                    <button
                      onClick={() => handleViewDetail(campaign.id)}
                      className="p-2.5 rounded-xl bg-white border border-sage/20 text-brown/80 hover:text-[#c8a96b] hover:border-gold/50 hover:bg-gold/5 transition-all flex items-center justify-center shadow-2xs"
                      title="Ver y editar detalles"
                    >
                      <Eye size={17} strokeWidth={2.2} />
                    </button>

                    {/* Botón Eliminar con Ventana de Confirmación */}
                    <button
                      onClick={() => setDeleteModalState({ isOpen: true, id: campaign.id, name: campaign.name })}
                      className="p-2.5 rounded-xl bg-white border border-sage/20 text-rose-500 hover:text-rose-700 hover:border-rose-300 hover:bg-rose-50 transition-all flex items-center justify-center shadow-2xs"
                      title="Eliminar campaña"
                    >
                      <Trash2 size={17} strokeWidth={2.2} />
                    </button>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Ventana Modal de Confirmación de Eliminación ── */}
      <Modal
        isOpen={deleteModalState.isOpen}
        onClose={() => !isDeleting && setDeleteModalState({ isOpen: false, id: '', name: '' })}
        title="¿Eliminar campaña comercial?"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 pt-2">
          <div className="flex items-start gap-3.5 bg-rose-50 border border-rose-200 p-4 rounded-2xl">
            <div className="p-2 bg-rose-100 text-rose-600 rounded-xl shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div className="text-xs sm:text-sm text-rose-900 leading-relaxed">
              Estás por eliminar permanentemente la campaña <span className="font-bold text-rose-950">"{deleteModalState.name}"</span>.
              <p className="mt-1 text-rose-800/80 text-xs">
                Esta acción borrará todas sus etapas, productos y precios dinámicos asignados. No se puede deshacer.
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
                <><Trash2 size={16} /> Eliminar definitivamente</>
              )}
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
