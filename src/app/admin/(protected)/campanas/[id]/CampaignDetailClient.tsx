"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCampaignDetail, useToggleCampaignStatus } from '@/hooks/use-admin-campaigns';
import { Button } from '@/components/ui/Button';
import { 
  ArrowLeft, 
  Edit2, 
  LayoutList, 
  PackageOpen, 
  Info, 
  CalendarDays, 
  Megaphone, 
  CheckCircle2,
  Clock,
  Calendar
} from 'lucide-react';
import { CampaignStagesTab } from '@/components/admin/campaigns/CampaignStagesTab';
import { CampaignProductsTab } from '@/components/admin/campaigns/CampaignProductsTab';

interface Props {
  campaignId: string;
}

export function CampaignDetailClient({ campaignId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: campaign, isLoading, isError } = useCampaignDetail(campaignId);
  const { mutate: toggleStatus, isPending: isToggling } = useToggleCampaignStatus();
  
  const initialTab = (searchParams.get('tab') as 'general' | 'stages' | 'products') || 'general';
  const [activeTab, setActiveTab] = useState<'general' | 'stages' | 'products'>(initialTab);

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-sage gap-3 animate-in fade-in">
        <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
        <span className="text-sm font-medium">Cargando detalles de la campaña...</span>
      </div>
    );
  }

  if (isError || !campaign) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-rose-200 text-center max-w-md mx-auto my-12 shadow-sm">
        <p className="text-rose-600 font-bold mb-2">Error al cargar la campaña</p>
        <p className="text-xs text-sage mb-4">No se pudo encontrar la información solicitada o hubo un problema de conexión.</p>
        <Button onClick={() => router.push('/admin/campanas')} variant="outline">
          Volver a campañas
        </Button>
      </div>
    );
  }

  const now = new Date();
  const startDate = new Date(campaign.startDate);
  const endDate = new Date(campaign.endDate);
  const isLive = campaign.isActive && now >= startDate && now <= endDate;
  const isPast = now > endDate;
  const isUpcoming = now < startDate;

  // Stages
  const preventaStage = campaign.stages?.find(s => s.name.toLowerCase().includes('preventa')) || campaign.stages?.[0];
  const diaCentralStage = campaign.stages?.find(s => s.name.toLowerCase().includes('central')) || campaign.stages?.[1];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-16 max-w-5xl mx-auto">
      
      {/* ── Top Header Navigation ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => router.push('/admin/campanas')}
            className="p-2 -ml-2 hover:bg-sage/10 text-sage hover:text-brown rounded-full transition-colors"
            title="Volver a lista"
          >
            <ArrowLeft size={22} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-sage">Detalle de Campaña</span>
              {isLive ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                  EN VIVO AHORA
                </span>
              ) : isUpcoming ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold uppercase tracking-wider">
                  PROGRAMADA
                </span>
              ) : isPast ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sage/15 text-sage font-bold uppercase tracking-wider">
                  FINALIZADA
                </span>
              ) : null}
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-brown flex items-center gap-2.5">
              {campaign.name}
            </h1>
          </div>
        </div>

        {/* Quick actions in header */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          {/* Direct Status Toggle */}
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-sage/20 shadow-2xs">
            <span className="text-xs font-semibold text-brown/80">
              {campaign.isActive ? 'Activa' : 'Pausada'}
            </span>
            <label className="relative inline-flex items-center cursor-pointer" title={campaign.isActive ? 'Pausar campaña' : 'Activar campaña'}>
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={campaign.isActive}
                onChange={() => toggleStatus({ id: campaign.id, isActive: !campaign.isActive })}
                disabled={isToggling}
              />
              <div className="w-9 h-5 bg-sage/25 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {/* Botón Editar que lleva al Wizard con los datos cargados */}
          <Button 
            variant="outline" 
            onClick={() => router.push(`/admin/campanas/${campaignId}/editar`)}
            className="rounded-xl border-sage/25 text-brown hover:border-gold/50 shadow-2xs flex items-center gap-2"
          >
            <Edit2 size={15} /> Editar Campaña
          </Button>
        </div>
      </div>

      {/* ── Main Container with Tabs ── */}
      <div className="bg-white rounded-[24px] shadow-sm border border-sage/15 overflow-hidden">
        
        {/* Tabs Bar */}
        <div className="flex border-b border-sage/10 bg-[#FAF9F6] px-4 sm:px-6 gap-2 sm:gap-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-2 py-4 px-3 sm:px-4 text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'general' 
                ? 'border-[#c8a96b] text-brown' 
                : 'border-transparent text-sage hover:text-brown'
            }`}
          >
            <Info size={16} className={activeTab === 'general' ? 'text-[#c8a96b]' : 'text-sage'} /> 
            Información
          </button>

          <button
            onClick={() => setActiveTab('stages')}
            className={`flex items-center gap-2 py-4 px-3 sm:px-4 text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'stages' 
                ? 'border-[#c8a96b] text-brown' 
                : 'border-transparent text-sage hover:text-brown'
            }`}
          >
            <LayoutList size={16} className={activeTab === 'stages' ? 'text-[#c8a96b]' : 'text-sage'} /> 
            Etapas ({campaign.stages.length})
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 py-4 px-3 sm:px-4 text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'products' 
                ? 'border-[#c8a96b] text-brown' 
                : 'border-transparent text-sage hover:text-brown'
            }`}
          >
            <PackageOpen size={16} className={activeTab === 'products' ? 'text-[#c8a96b]' : 'text-sage'} /> 
            Productos ({campaign.products.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 sm:p-8">
          {activeTab === 'general' && (
            <div className="space-y-8">
              
              {/* Resumen de Campaña y Vigencia General */}
              <div className="bg-[#FAF9F6] p-6 sm:p-7 rounded-[22px] border border-sage/15 flex flex-col md:flex-row gap-6 justify-between items-start">
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-2">
                    <Megaphone size={18} className="text-[#c8a96b]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-sage">Resumen de Campaña</span>
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-brown">{campaign.name}</h3>
                  <p className="text-sm text-[#5c564d] leading-relaxed whitespace-pre-wrap">
                    {campaign.description || 'Sin descripción detallada.'}
                  </p>
                </div>

                <div className="flex flex-col gap-2 w-full md:w-auto shrink-0 bg-white p-4 rounded-2xl border border-sage/15">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-sage">Vigencia General</span>
                  <div className="flex items-center gap-2 text-sm font-bold text-brown">
                    <CalendarDays size={16} className="text-[#c8a96b]" />
                    <span>
                      {new Date(campaign.startDate).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="text-sage font-normal">hasta</span>
                    <span>
                      {new Date(campaign.endDate).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Fechas de Preventa y Día Central */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-sage mb-3">
                  Cronograma de Etapas Clave
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Tarjeta de Preventa */}
                  <div className="bg-white p-5 rounded-2xl border border-amber-200/80 bg-amber-50/20 shadow-2xs">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#c8a96b]"></span>
                        <h5 className="font-bold text-brown text-sm">Etapa de Preventa</h5>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${preventaStage?.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-sage/15 text-sage'}`}>
                        {preventaStage?.isActive ? 'Activa' : 'Pausada'}
                      </span>
                    </div>

                    {preventaStage ? (
                      <div className="text-xs text-sage font-medium space-y-1.5 mt-3">
                        <div className="flex items-center justify-between py-1 border-b border-sage/10">
                          <span className="text-sage/70">Inicio de Preventa:</span>
                          <span className="text-brown font-bold font-mono">
                            {new Date(preventaStage.startDate).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between py-1">
                          <span className="text-sage/70">Cierre de Preventa:</span>
                          <span className="text-brown font-bold font-mono">
                            {new Date(preventaStage.endDate).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-sage/70 pt-1">
                          Los clientes pueden reservar con precios exclusivos de preventa en este periodo.
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-sage italic mt-2">No se ha configurado la etapa de preventa.</p>
                    )}
                  </div>

                  {/* Tarjeta de Día Central */}
                  <div className="bg-white p-5 rounded-2xl border border-rose-200/80 bg-rose-50/20 shadow-2xs">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#b07474]"></span>
                        <h5 className="font-bold text-brown text-sm">Día Central (Festividad)</h5>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${diaCentralStage?.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-sage/15 text-sage'}`}>
                        {diaCentralStage?.isActive ? 'Activa' : 'Pausada'}
                      </span>
                    </div>

                    {diaCentralStage ? (
                      <div className="text-xs text-sage font-medium space-y-1.5 mt-3">
                        <div className="flex items-center justify-between py-1 border-b border-sage/10">
                          <span className="text-sage/70">Fecha Central:</span>
                          <span className="text-brown font-bold font-mono">
                            {new Date(diaCentralStage.startDate).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between py-1">
                          <span className="text-sage/70">Duración:</span>
                          <span className="text-brown font-semibold">Todo el día</span>
                        </div>
                        <p className="text-[11px] text-sage/70 pt-1">
                          Aplica el precio para el día de la celebración o festividad principal.
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-sage italic mt-2">No se ha configurado el día central.</p>
                    )}
                  </div>

                </div>
              </div>

              {/* Métricas Rápidas */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
                <div className="bg-white p-5 rounded-2xl border border-sage/15 shadow-2xs">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-xl bg-amber-50 text-[#b09355]">
                      <LayoutList size={18} />
                    </div>
                    <span className="text-xs font-bold text-sage uppercase tracking-wider">Etapas Totales</span>
                  </div>
                  <p className="text-2xl font-bold text-brown font-serif">{campaign.stages.length}</p>
                  <p className="text-xs text-sage mt-1">Fases de preventa y evento</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-sage/15 shadow-2xs">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                      <PackageOpen size={18} />
                    </div>
                    <span className="text-xs font-bold text-sage uppercase tracking-wider">Productos Asignados</span>
                  </div>
                  <p className="text-2xl font-bold text-brown font-serif">{campaign.products.length}</p>
                  <p className="text-xs text-sage mt-1">Con precios dinámicos asignados</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-sage/15 shadow-2xs">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-xl ${campaign.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                      <CheckCircle2 size={18} />
                    </div>
                    <span className="text-xs font-bold text-sage uppercase tracking-wider">Disponibilidad</span>
                  </div>
                  <p className={`text-2xl font-bold font-serif ${campaign.isActive ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {campaign.isActive ? 'Activa' : 'Pausada'}
                  </p>
                  <p className="text-xs text-sage mt-1">Visibilidad en tienda online</p>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'stages' && (
            <CampaignStagesTab campaign={campaign} />
          )}

          {activeTab === 'products' && (
            <CampaignProductsTab campaign={campaign} />
          )}
        </div>

      </div>

    </div>
  );
}
