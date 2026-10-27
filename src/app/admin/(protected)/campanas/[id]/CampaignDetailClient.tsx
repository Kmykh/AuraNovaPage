"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCampaignDetail, useToggleCampaignStatus } from '@/hooks/use-admin-campaigns';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Edit2, LayoutList, PackageOpen, Info } from 'lucide-react';
import { CampaignStagesTab } from '@/components/admin/campaigns/CampaignStagesTab';
import { CampaignProductsTab } from '@/components/admin/campaigns/CampaignProductsTab';
import { CampaignOverview } from '@/components/admin/campaigns/CampaignOverview';

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
            <CampaignOverview campaign={campaign} onGoTo={setActiveTab} />
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
