import React, { useState } from 'react';
import Image from 'next/image';
import { CampaignResponse, CampaignProductResponse, CampaignStageResponse } from '@/types/campaigns';
import { useAddCampaignProduct, useRemoveCampaignProduct, useSetCampaignProductPrice } from '@/hooks/use-admin-campaigns';
import { useAdminProducts } from '@/hooks/use-admin-products';
import { Button } from '@/components/ui/Button';
import { Plus, Trash2, Save, ChevronDown, ChevronUp, Package, Search, AlertTriangle, Loader2, DollarSign } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { toast } from 'sonner';
import { getImageUrl, formatCurrency } from '@/lib/formatters';

interface Props {
  campaign: CampaignResponse;
}

export function CampaignProductsTab({ campaign }: Props) {
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [deleteModalState, setDeleteModalState] = useState<{ isOpen: boolean; productId: string; name: string }>({
    isOpen: false,
    productId: '',
    name: ''
  });

  const { mutate: removeProduct, isPending: isRemoving } = useRemoveCampaignProduct(campaign.id);

  const handleConfirmRemove = () => {
    if (!deleteModalState.productId) return;
    removeProduct(deleteModalState.productId, {
      onSuccess: () => {
        toast.success('Producto removido de la campaña');
        setDeleteModalState({ isOpen: false, productId: '', name: '' });
      },
      onError: (err: any) => toast.error('Error al remover', { description: err?.message || 'No se pudo remover el producto' })
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedProductId(prev => prev === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-serif font-bold text-brown">Productos en Campaña</h3>
          <p className="text-sage text-xs sm:text-sm mt-0.5">
            Asigna productos y define precios dinámicos específicos para cada etapa de la campaña.
          </p>
        </div>
        <Button 
          onClick={() => setIsAddProductModalOpen(true)}
          className="bg-[#c8a96b] hover:bg-[#b09355] text-white rounded-xl shadow-xs font-semibold px-4 py-2.5 flex items-center gap-2 shrink-0 self-start sm:self-center"
        >
          <Plus size={16} /> Añadir Producto
        </Button>
      </div>

      {campaign.products.length === 0 ? (
        <div className="p-10 text-center bg-[#FAF9F6] rounded-2xl border border-sage/15 text-sage">
          <Package size={36} className="mx-auto mb-2 text-sage/40" />
          <p className="font-bold text-brown">No hay productos asignados a esta campaña</p>
          <p className="text-xs text-sage mt-1">Haz clic en "Añadir Producto" para seleccionar flores o arreglos del catálogo.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {campaign.products.map(prod => {
            const isExpanded = expandedProductId === prod.id;
            return (
              <div key={prod.id} className="border border-sage/15 rounded-2xl overflow-hidden bg-white shadow-2xs transition-all hover:border-sage/30">
                {/* Product Header Row */}
                <div 
                  className="flex items-center justify-between p-4 sm:p-5 cursor-pointer hover:bg-[#FAF9F6]/80 transition-colors"
                  onClick={() => toggleExpand(prod.id)}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-14 h-14 rounded-xl bg-[#FAF9F6] border border-sage/15 overflow-hidden relative shrink-0">
                      {prod.productImageUrl ? (
                        <Image src={getImageUrl(prod.productImageUrl)} alt={prod.productName} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sage/40">
                          <Package size={20} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-brown text-base truncate">{prod.productName}</h4>
                      <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-sage font-medium">
                        <span>Precio Base: <span className="text-brown font-bold font-mono">{formatCurrency(prod.productBasePrice)}</span></span>
                        <span className="text-sage/40">·</span>
                        <span className="bg-amber-50 text-[#b09355] border border-amber-200/60 px-2 py-0.5 rounded-md font-semibold">
                          {prod.stagePrices?.length || 0} precios fijados
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setDeleteModalState({ isOpen: true, productId: prod.productId, name: prod.productName }); 
                      }} 
                      disabled={isRemoving}
                      className="p-2.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all border border-sage/15 hover:border-rose-200 shadow-2xs"
                      title="Remover de campaña"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="p-2 rounded-xl text-sage hover:bg-sage/10 transition-colors">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                </div>

                {/* Expanded Stage Prices Section */}
                {isExpanded && (
                  <div className="p-5 bg-[#FAF9F6] border-t border-sage/15">
                    <div className="flex items-center gap-2 mb-3">
                      <DollarSign size={16} className="text-[#c8a96b]" />
                      <h5 className="text-xs font-bold uppercase tracking-wider text-brown">
                        Precios por Etapa ({prod.productName})
                      </h5>
                    </div>

                    {campaign.stages.length === 0 ? (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                        No hay etapas creadas en esta campaña. Ve a la pestaña "Etapas" para crear fases como Preventa o Día Central y definir precios preferenciales.
                      </div>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {campaign.stages.map(stage => (
                          <StagePriceSetter 
                            key={stage.id} 
                            campaignId={campaign.id}
                            productId={prod.productId}
                            stage={stage}
                            existingPrices={prod.stagePrices}
                            basePrice={prod.productBasePrice}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {isAddProductModalOpen && (
        <AddProductModal 
          isOpen={isAddProductModalOpen} 
          onClose={() => setIsAddProductModalOpen(false)} 
          campaign={campaign} 
        />
      )}

      {/* ── Modal de Confirmación para Remover Producto ── */}
      <Modal
        isOpen={deleteModalState.isOpen}
        onClose={() => !isRemoving && setDeleteModalState({ isOpen: false, productId: '', name: '' })}
        title="¿Remover producto de la campaña?"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 pt-2">
          <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 p-4 rounded-2xl">
            <div className="p-2 bg-rose-100 text-rose-600 rounded-xl shrink-0">
              <AlertTriangle size={18} />
            </div>
            <div className="text-xs sm:text-sm text-rose-900 leading-relaxed">
              ¿Deseas quitar <span className="font-bold text-rose-950">"{deleteModalState.name}"</span> de esta campaña?
              <p className="mt-1 text-rose-800/80 text-xs">
                El producto volverá a venderse a su precio base habitual durante estas fechas.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-sage/10">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteModalState({ isOpen: false, productId: '', name: '' })}
              disabled={isRemoving}
              className="rounded-xl border-sage/30 text-sage hover:text-brown"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleConfirmRemove}
              disabled={isRemoving}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl px-5 font-semibold shadow-sm flex items-center gap-2"
            >
              {isRemoving ? (
                <><Loader2 size={16} className="animate-spin" /> Removiendo...</>
              ) : (
                <><Trash2 size={16} /> Remover de campaña</>
              )}
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}

function StagePriceSetter({ campaignId, productId, stage, existingPrices, basePrice }: { campaignId: string, productId: string, stage: CampaignStageResponse, existingPrices: any[], basePrice: number }) {
  const currentPriceObj = existingPrices.find(sp => sp.campaignStageId === stage.id);
  const [price, setPrice] = useState(currentPriceObj ? currentPriceObj.price.toString() : '');
  
  const { mutate: setStagePrice, isPending } = useSetCampaignProductPrice(campaignId);

  const handleSave = () => {
    const num = parseFloat(price);
    if (isNaN(num) || num <= 0) {
      toast.error('Precio inválido', { description: 'El precio debe ser mayor a 0.' });
      return;
    }
    setStagePrice({ productId, stageId: stage.id, data: { price: num } }, {
      onSuccess: () => toast.success(`Precio en "${stage.name}" actualizado`)
    });
  };

  return (
    <div className="bg-white p-3.5 rounded-xl border border-sage/20 shadow-2xs flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-brown truncate">{stage.name}</span>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${stage.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-sage/15 text-sage'}`}>
          {stage.isActive ? 'Activa' : 'Pausada'}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sage text-xs font-bold">S/</span>
          <input 
            type="number" 
            value={price}
            onChange={e => setPrice(e.target.value)}
            placeholder={basePrice.toString()}
            step="0.10"
            className="w-full h-9 pl-7 pr-2 bg-[#FAF9F6] border border-sage/20 rounded-lg text-sm font-bold text-brown focus:bg-white focus:outline-none focus:border-gold"
          />
        </div>
        <button 
          onClick={handleSave} 
          disabled={isPending || !price}
          className="h-9 px-3 bg-[#c8a96b] text-white rounded-lg hover:bg-[#b09355] disabled:opacity-40 transition-colors flex items-center justify-center font-medium shadow-2xs"
          title="Guardar precio para esta etapa"
        >
          {isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
        </button>
      </div>
    </div>
  );
}

function AddProductModal({ isOpen, onClose, campaign }: { isOpen: boolean, onClose: () => void, campaign: CampaignResponse }) {
  const { data: allProducts, isLoading } = useAdminProducts();
  const { mutate: addProduct, isPending } = useAddCampaignProduct(campaign.id);
  
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const existingIds = new Set(campaign.products.map(p => p.productId));
  const availableProducts = allProducts?.filter(p => !existingIds.has(p.id) && p.name.toLowerCase().includes(search.toLowerCase())) || [];

  const handleAdd = (productId: string) => {
    addProduct({ productId, isActive: true }, {
      onSuccess: () => {
        toast.success('Producto añadido a la campaña');
      },
      onError: (err: any) => {
        toast.error('No se pudo añadir', { description: err?.message || 'Ocurrió un error inesperado' });
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brown/20 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] border border-sage/15 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-sage/10 bg-[#FAF9F6] flex justify-between items-center">
          <div>
            <h2 className="text-xl font-serif font-bold text-brown">Añadir Producto a Campaña</h2>
            <p className="text-xs text-sage mt-0.5">Selecciona un producto del catálogo para integrarlo.</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-sage hover:text-brown hover:bg-sage/10 text-lg leading-none font-bold">×</button>
        </div>

        <div className="p-4 border-b border-sage/10 bg-white">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-sage/70 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Buscar por nombre de producto..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#FAF9F6] border border-sage/20 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-gold transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-sage gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#c8a96b]" />
              <span className="text-xs font-medium">Cargando catálogo de productos...</span>
            </div>
          ) : availableProducts.length === 0 ? (
            <div className="py-12 text-center text-sage text-xs">
              {search ? 'No se encontraron productos con ese término.' : 'Todos los productos del catálogo ya fueron agregados a esta campaña.'}
            </div>
          ) : (
            <ul className="space-y-2">
              {availableProducts.map(prod => (
                <li key={prod.id} className="flex items-center justify-between p-3 hover:bg-[#FAF9F6] rounded-xl border border-sage/10 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-white border border-sage/15 relative overflow-hidden shrink-0">
                      {prod.imageUrl ? (
                        <Image src={getImageUrl(prod.imageUrl)} alt={prod.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sage/40">
                          <Package size={18} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h5 className="font-bold text-sm text-brown truncate">{prod.name}</h5>
                      <span className="text-xs text-sage font-mono font-semibold">{formatCurrency(prod.price)}</span>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleAdd(prod.id)} 
                    disabled={isPending}
                    className="bg-[#c8a96b] hover:bg-[#b09355] text-white rounded-xl text-xs font-semibold px-4 shrink-0 shadow-2xs"
                  >
                    Añadir
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-4 border-t border-sage/10 bg-[#FAF9F6] flex justify-end">
          <Button variant="outline" onClick={onClose} className="rounded-xl border-sage/30 text-sage hover:text-brown text-xs">
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}
