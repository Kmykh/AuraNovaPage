"use client";

import React, { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { CampaignsService } from '@/services/campaigns.service';
import { useAdminProducts } from '@/hooks/use-admin-products';
import { useCampaignDetail } from '@/hooks/use-admin-campaigns';
import { Button } from '@/components/ui/Button';
import { CalendarPicker } from '@/components/ui/CalendarPicker';
import { toast } from 'sonner';
import { getImageUrl, formatCurrency } from '@/lib/formatters';
import {
  ArrowLeft, ArrowRight, Check, Megaphone, CalendarDays,
  PackageOpen, Sparkles, Search, X, Save, Loader2
} from 'lucide-react';

/* ─── Types ─── */
interface ProductWithPrices {
  productId: string;
  productName: string;
  productImageUrl: string | null;
  productBasePrice: number;
  preventaPrice: string;
  diaCentralPrice: string;
}

interface CampaignWizardProps {
  mode?: 'create' | 'edit';
  campaignId?: string;
}

/* ─── WIZARD ─── */
export function CampaignWizard({ mode = 'create', campaignId }: CampaignWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  // Edit Mode Data Fetching
  const { data: campaignDetail, isLoading: isLoadingDetail } = useCampaignDetail(campaignId || '');
  const [loadedFromCampaign, setLoadedFromCampaign] = useState(false);

  // Step 1: Campaign Info
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Step 2: Stage Dates
  const [preventaStart, setPreventaStart] = useState('');
  const [preventaEnd, setPreventaEnd] = useState('');
  const [diaCentralDate, setDiaCentralDate] = useState('');

  // Step 3: Products
  const [selectedProducts, setSelectedProducts] = useState<ProductWithPrices[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const { data: allProducts } = useAdminProducts();

  // Populate data if in edit mode
  useEffect(() => {
    if (mode === 'edit' && campaignDetail && !loadedFromCampaign) {
      setName(campaignDetail.name || '');
      setDescription(campaignDetail.description || '');
      setStartDate(campaignDetail.startDate ? campaignDetail.startDate.slice(0, 10) : '');
      setEndDate(campaignDetail.endDate ? campaignDetail.endDate.slice(0, 10) : '');

      const prevStage = campaignDetail.stages?.find(s => s.name.toLowerCase().includes('preventa')) || campaignDetail.stages?.[0];
      const centralStage = campaignDetail.stages?.find(s => s.name.toLowerCase().includes('central')) || campaignDetail.stages?.[1];

      if (prevStage) {
        setPreventaStart(prevStage.startDate.slice(0, 10));
        setPreventaEnd(prevStage.endDate.slice(0, 10));
      }
      if (centralStage) {
        setDiaCentralDate(centralStage.startDate.slice(0, 10));
      }

      if (campaignDetail.products && campaignDetail.products.length > 0) {
        const mapped: ProductWithPrices[] = campaignDetail.products.map(p => {
          const prePrice = p.stagePrices?.find(sp => sp.campaignStageId === prevStage?.id)?.price;
          const diaPrice = p.stagePrices?.find(sp => sp.campaignStageId === centralStage?.id)?.price;
          return {
            productId: p.productId,
            productName: p.productName,
            productImageUrl: p.productImageUrl ?? null,
            productBasePrice: p.productBasePrice,
            preventaPrice: prePrice !== undefined ? prePrice.toString() : '',
            diaCentralPrice: diaPrice !== undefined ? diaPrice.toString() : '',
          };
        });
        setSelectedProducts(mapped);
      }

      setLoadedFromCampaign(true);
    }
  }, [mode, campaignDetail, loadedFromCampaign]);

  // Derived
  const availableProducts = allProducts?.filter(p =>
    !selectedProducts.some(sp => sp.productId === p.id) &&
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  ) || [];

  /* ─── Step Validation ─── */
  const isStep1Valid = name.trim().length > 0 && startDate && endDate && new Date(startDate) < new Date(endDate);
  const isStep2Valid = preventaStart && preventaEnd && diaCentralDate && new Date(preventaStart) < new Date(preventaEnd);
  const isStep3Valid = selectedProducts.length > 0 && selectedProducts.every(p => {
    const pre = parseFloat(p.preventaPrice);
    const dia = parseFloat(p.diaCentralPrice);
    return !isNaN(pre) && pre > 0 && !isNaN(dia) && dia > 0;
  });

  /* ─── Navigation ─── */
  const goNext = () => {
    if (step === 1) {
      if (!preventaStart) setPreventaStart(startDate);
      if (!preventaEnd) {
        const end = new Date(endDate);
        end.setDate(end.getDate() - 1);
        setPreventaEnd(end.toISOString().slice(0, 10));
      }
      if (!diaCentralDate) setDiaCentralDate(endDate);
    }
    setStep(s => Math.min(s + 1, 3));
  };
  const goBack = () => setStep(s => Math.max(s - 1, 1));

  /* ─── Add/Remove Product ─── */
  const addProduct = useCallback((product: { id: string; name: string; imageUrl: string | null; price: number }) => {
    setSelectedProducts(prev => [...prev, {
      productId: product.id,
      productName: product.name,
      productImageUrl: product.imageUrl,
      productBasePrice: product.price,
      preventaPrice: '',
      diaCentralPrice: ''
    }]);
    setProductSearch('');
  }, []);

  const removeProduct = useCallback((productId: string) => {
    setSelectedProducts(prev => prev.filter(p => p.productId !== productId));
  }, []);

  const updateProductPrice = useCallback((productId: string, field: 'preventaPrice' | 'diaCentralPrice', value: string) => {
    if (value && !/^\d*\.?\d*$/.test(value)) return;
    setSelectedProducts(prev => prev.map(p => p.productId === productId ? { ...p, [field]: value } : p));
  }, []);

  /* ─── SAVE ALL ─── */
  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      if (mode === 'edit' && campaignId) {
        // 1. Update Campaign
        await CampaignsService.update(campaignId, {
          name,
          description: description || null,
          startDate: new Date(`${startDate}T00:00:00`).toISOString(),
          endDate: new Date(`${endDate}T23:59:59`).toISOString(),
          isActive: campaignDetail?.isActive ?? true
        });

        // 2. Stages Update
        const prevStage = campaignDetail?.stages?.find(s => s.name.toLowerCase().includes('preventa')) || campaignDetail?.stages?.[0];
        const centralStage = campaignDetail?.stages?.find(s => s.name.toLowerCase().includes('central')) || campaignDetail?.stages?.[1];

        let preventaStageId = prevStage?.id;
        if (prevStage) {
          await CampaignsService.updateStage(campaignId, prevStage.id, {
            name: 'Preventa',
            startDate: new Date(`${preventaStart}T00:00:00`).toISOString(),
            endDate: new Date(`${preventaEnd}T23:59:59`).toISOString(),
            isActive: true
          });
        } else {
          const created = await CampaignsService.addStage(campaignId, {
            name: 'Preventa',
            startDate: new Date(`${preventaStart}T00:00:00`).toISOString(),
            endDate: new Date(`${preventaEnd}T23:59:59`).toISOString(),
            isActive: true
          });
          preventaStageId = created.id;
        }

        let diaCentralStageId = centralStage?.id;
        if (centralStage) {
          await CampaignsService.updateStage(campaignId, centralStage.id, {
            name: 'Día Central',
            startDate: new Date(`${diaCentralDate}T00:00:00`).toISOString(),
            endDate: new Date(`${diaCentralDate}T23:59:59`).toISOString(),
            isActive: true
          });
        } else {
          const created = await CampaignsService.addStage(campaignId, {
            name: 'Día Central',
            startDate: new Date(`${diaCentralDate}T00:00:00`).toISOString(),
            endDate: new Date(`${diaCentralDate}T23:59:59`).toISOString(),
            isActive: true
          });
          diaCentralStageId = created.id;
        }

        // 3. Products Sync
        const existingProductIds = new Set(campaignDetail?.products?.map(p => p.productId) || []);
        const currentSelectedIds = new Set(selectedProducts.map(p => p.productId));

        for (const existingId of existingProductIds) {
          if (!currentSelectedIds.has(existingId)) {
            await CampaignsService.removeProduct(campaignId, existingId);
          }
        }

        for (const prod of selectedProducts) {
          if (!existingProductIds.has(prod.productId)) {
            await CampaignsService.addProduct(campaignId, {
              productId: prod.productId,
              isActive: true
            });
          }

          if (preventaStageId) {
            await CampaignsService.setProductStagePrice(campaignId, prod.productId, preventaStageId, {
              price: parseFloat(prod.preventaPrice)
            });
          }
          if (diaCentralStageId) {
            await CampaignsService.setProductStagePrice(campaignId, prod.productId, diaCentralStageId, {
              price: parseFloat(prod.diaCentralPrice)
            });
          }
        }

        toast.success('¡Campaña actualizada exitosamente!', { description: 'Los cambios en etapas y precios fueron guardados.' });
        router.push(`/admin/campanas/${campaignId}`);
      } else {
        // Mode Create
        const campaign = await CampaignsService.create({
          name,
          description: description || null,
          startDate: new Date(`${startDate}T00:00:00`).toISOString(),
          endDate: new Date(`${endDate}T23:59:59`).toISOString(),
          isActive: true
        });

        const preventaStage = await CampaignsService.addStage(campaign.id, {
          name: 'Preventa',
          startDate: new Date(`${preventaStart}T00:00:00`).toISOString(),
          endDate: new Date(`${preventaEnd}T23:59:59`).toISOString(),
          isActive: true
        });

        const diaCentralStage = await CampaignsService.addStage(campaign.id, {
          name: 'Día Central',
          startDate: new Date(`${diaCentralDate}T00:00:00`).toISOString(),
          endDate: new Date(`${diaCentralDate}T23:59:59`).toISOString(),
          isActive: true
        });

        for (const prod of selectedProducts) {
          await CampaignsService.addProduct(campaign.id, {
            productId: prod.productId,
            isActive: true
          });

          await CampaignsService.setProductStagePrice(campaign.id, prod.productId, preventaStage.id, {
            price: parseFloat(prod.preventaPrice)
          });

          await CampaignsService.setProductStagePrice(campaign.id, prod.productId, diaCentralStage.id, {
            price: parseFloat(prod.diaCentralPrice)
          });
        }

        toast.success('¡Campaña creada exitosamente!', { description: 'Con etapas, productos y precios configurados.' });
        router.push(`/admin/campanas/${campaign.id}`);
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Error al guardar la campaña', { description: err?.response?.data?.Message || err?.message || 'Ocurrió un error inesperado.' });
    } finally {
      setIsSaving(false);
    }
  };

  /* ─── Step Indicator ─── */
  const steps = [
    { num: 1, label: 'Campaña', icon: Megaphone },
    { num: 2, label: 'Etapas', icon: CalendarDays },
    { num: 3, label: 'Productos', icon: PackageOpen },
  ];

  if (mode === 'edit' && isLoadingDetail && !loadedFromCampaign) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-sage gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#c8a96b]" />
        <span className="text-sm font-medium">Cargando datos de la campaña...</span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button 
          onClick={() => mode === 'edit' && campaignId ? router.push(`/admin/campanas/${campaignId}`) : router.push('/admin/campanas')} 
          className="p-2 hover:bg-sage/10 rounded-full transition-colors text-sage hover:text-brown"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-serif font-bold text-brown">
            {mode === 'edit' ? `Editar Campaña: ${name || '...'}` : 'Nueva Campaña'}
          </h1>
          <p className="text-sage text-sm">
            {mode === 'edit' ? 'Modifica los datos, etapas y precios de la campaña paso a paso' : 'Configura tu campaña paso a paso'}
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-0 mb-10">
        {steps.map((s, i) => (
          <React.Fragment key={s.num}>
            <div className="flex flex-col items-center">
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  step === s.num
                    ? 'bg-brown text-white shadow-lg ring-4 ring-gold/20 scale-110'
                    : step > s.num
                    ? 'bg-green-600 text-white'
                    : 'bg-sage/15 text-sage'
                }`}
              >
                {step > s.num ? <Check size={18} strokeWidth={3} /> : <s.icon size={18} />}
              </div>
              <span className={`text-xs mt-2 font-medium ${step === s.num ? 'text-brown font-bold' : 'text-sage'}`}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-20 sm:w-28 h-0.5 mx-2 mb-6 transition-colors duration-300 ${step > s.num ? 'bg-green-600' : 'bg-sage/20'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Content Container */}
      <div className="bg-white rounded-2xl border border-sage/10 shadow-sm overflow-hidden">
        
        {/* ─── STEP 1: Campaign Info ─── */}
        {step === 1 && (
          <div className="p-8 space-y-6 animate-in fade-in duration-300">
            <div>
              <label className="block text-xs font-bold text-sage uppercase tracking-wider mb-2">Nombre de la campaña *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ej. San Valentín 2026, Día de la Madre..."
                className="w-full px-4 py-3 border border-sage/20 rounded-xl text-base focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all font-medium text-brown placeholder:text-sage/40"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-sage uppercase tracking-wider mb-2">Descripción (opcional)</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                placeholder="Detalles sobre las promociones, condiciones o mensaje de la campaña..."
                className="w-full px-4 py-3 border border-sage/20 rounded-xl text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all text-brown placeholder:text-sage/40 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-sage uppercase tracking-wider mb-2">Vigencia de la campaña *</label>
              <CalendarPicker
                mode="range"
                rangeStart={startDate}
                rangeEnd={endDate}
                onChangeRange={(start: string, end: string) => { setStartDate(start); setEndDate(end); }}
              />
              <p className="text-[11px] text-sage/70 mt-2">
                Haz clic en la fecha de inicio y luego en la fecha de fin en el calendario.
              </p>
            </div>
          </div>
        )}

        {/* ─── STEP 2: Stage Dates ─── */}
        {step === 2 && (
          <div className="p-8 space-y-8 animate-in fade-in duration-300">
            <div>
              <span className="text-xs font-bold text-gold uppercase tracking-wider">Etapa 1</span>
              <h3 className="text-lg font-bold text-brown">Fechas de Preventa</h3>
              <p className="text-xs text-sage mt-1 mb-4">Periodo en que los clientes pueden reservar con precio especial.</p>
              <CalendarPicker
                mode="range"
                rangeStart={preventaStart}
                rangeEnd={preventaEnd}
                min={startDate}
                max={endDate}
                onChangeRange={(start: string, end: string) => { setPreventaStart(start); setPreventaEnd(end); }}
              />
            </div>

            <div className="border-t border-sage/10 pt-6">
              <span className="text-xs font-bold text-gold uppercase tracking-wider">Etapa 2</span>
              <h3 className="text-lg font-bold text-brown">Día Central</h3>
              <p className="text-xs text-sage mt-1 mb-4">El día de la festividad principal (todo el día).</p>
              <input
                type="date"
                value={diaCentralDate}
                min={startDate}
                max={endDate}
                onChange={e => setDiaCentralDate(e.target.value)}
                className="px-4 py-3 border border-sage/20 rounded-xl text-sm font-medium text-brown focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 bg-white shadow-2xs"
              />
            </div>
          </div>
        )}

        {/* ─── STEP 3: Products & Prices ─── */}
        {step === 3 && (
          <div className="p-8 space-y-6 animate-in fade-in duration-300">
            <div>
              <h3 className="text-lg font-bold text-brown">Seleccionar Productos y Precios</h3>
              <p className="text-xs text-sage mt-1">
                Define el precio de Preventa y Día Central para cada producto.
              </p>
            </div>

            {/* Selected Products */}
            {selectedProducts.length > 0 && (
              <div className="space-y-3">
                {selectedProducts.map(p => (
                  <div key={p.productId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-sage/15 bg-[#FAF9F6]">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-lg bg-white border border-sage/15 relative overflow-hidden shrink-0">
                        {p.productImageUrl && <Image src={getImageUrl(p.productImageUrl)} alt={p.productName} fill className="object-cover" />}
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-sm text-brown truncate block">{p.productName}</span>
                        <span className="text-xs text-sage">Base: {formatCurrency(p.productBasePrice)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-sage uppercase">Preventa (S/)</label>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={p.preventaPrice}
                          onChange={e => updateProductPrice(p.productId, 'preventaPrice', e.target.value)}
                          placeholder="0.00"
                          className="w-24 px-2.5 py-1.5 border border-sage/20 rounded-lg text-sm font-bold text-brown bg-white text-center focus:border-gold outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-sage uppercase">Día Central (S/)</label>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={p.diaCentralPrice}
                          onChange={e => updateProductPrice(p.productId, 'diaCentralPrice', e.target.value)}
                          placeholder="0.00"
                          className="w-24 px-2.5 py-1.5 border border-sage/20 rounded-lg text-sm font-bold text-brown bg-white text-center focus:border-gold outline-none"
                        />
                      </div>
                      <button
                        onClick={() => removeProduct(p.productId)}
                        className="p-1.5 text-sage hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors mt-3"
                        title="Quitar"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Catalog Search */}
            <div className="border-t border-sage/10 pt-4">
              <h3 className="text-xs font-bold text-sage uppercase tracking-wider mb-3">Catálogo disponible para agregar</h3>
              <div className="relative mb-3">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sage/60 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar en el catálogo..."
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#FAF9F6] border border-sage/20 rounded-xl text-sm focus:bg-white focus:border-gold outline-none"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[260px] overflow-y-auto pr-1">
                {availableProducts.length === 0 ? (
                  <div className="col-span-full text-center py-6 text-xs text-sage">
                    {productSearch ? 'No hay resultados para esa búsqueda' : 'Todos los productos ya fueron seleccionados'}
                  </div>
                ) : (
                  availableProducts.map(prod => (
                    <button
                      key={prod.id}
                      type="button"
                      onClick={() => addProduct(prod)}
                      className="flex flex-col items-center text-center p-3 rounded-xl border border-sage/10 bg-[#FAF9F6] hover:border-gold/50 hover:bg-gold/5 transition-all"
                    >
                      <div className="w-12 h-12 rounded-lg bg-white border border-sage/10 relative overflow-hidden mb-1.5">
                        {prod.imageUrl && <Image src={getImageUrl(prod.imageUrl)} alt={prod.name} fill className="object-cover" />}
                      </div>
                      <span className="font-bold text-xs text-brown truncate w-full">{prod.name}</span>
                      <span className="text-[10px] text-sage">{formatCurrency(prod.price)}</span>
                      <span className="text-[9px] font-bold text-[#c8a96b] mt-1">+ Añadir</span>
                    </button>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* Footer Navigation */}
        <div className="px-8 py-5 bg-[#FAF9F6] border-t border-sage/10 flex items-center justify-between">
          {step > 1 ? (
            <Button variant="outline" onClick={goBack} disabled={isSaving} className="rounded-xl border-sage/30 text-sage hover:text-brown">
              <ArrowLeft size={16} className="mr-2" /> Anterior
            </Button>
          ) : (
            <Button 
              variant="outline" 
              onClick={() => mode === 'edit' && campaignId ? router.push(`/admin/campanas/${campaignId}`) : router.push('/admin/campanas')} 
              disabled={isSaving}
              className="rounded-xl border-sage/30 text-sage hover:text-brown"
            >
              Cancelar
            </Button>
          )}

          {step < 3 ? (
            <Button
              onClick={goNext}
              disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
              className="min-w-[140px] bg-[#c8a96b] hover:bg-[#b09355] text-white rounded-xl"
            >
              Siguiente <ArrowRight size={16} className="ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSaveAll}
              disabled={!isStep3Valid || isSaving}
              className="min-w-[180px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-md flex items-center gap-2"
            >
              {isSaving ? (
                <><Loader2 size={16} className="animate-spin" /> Guardando...</>
              ) : (
                <><Save size={16} /> {mode === 'edit' ? 'Guardar Cambios' : 'Crear Campaña'}</>
              )}
            </Button>
          )}
        </div>

      </div>
    </div>
  );
}
