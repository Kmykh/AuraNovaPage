"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCreateProduct, useUpdateProduct, useUpdateStock, useUpdateAvailability } from '@/hooks/use-admin-products';
import { useAdminCategories } from '@/hooks/use-categories';
import { AdminProductsService } from '@/services/admin-products.service';
import { ProductResponse } from '@/types/products';
import { ProductAudience } from '@/types/categories';
import { Button } from '@/components/ui/Button';
import {
  AlertCircle, Image as ImageIcon, Save, Loader2, ArrowLeft, Package, ArchiveRestore, ArchiveX, Sparkles,
  Lightbulb, Mail, Images, FileText,
} from 'lucide-react';
import { ApiProblemDetails } from '@/lib/api-errors';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency } from '@/lib/formatters';
import { compressImage } from '@/lib/compress-image';
import { productImages } from '@/lib/product-options';
import { ItemOptions } from '@/components/shared/ItemOptions';
import { GalleryItem, ProductImagesManager, galleryFromPaths } from './ProductImagesManager';
import { ProductOptionsPicker } from './ProductOptionsPicker';

interface ProductFormProps {
  mode: 'create' | 'edit';
  initialData?: ProductResponse;
  onRefresh?: () => void;
}

const inputClass = 'w-full px-4 py-2.5 bg-[#FAF9F6] rounded-xl border border-sage/20 focus:bg-white focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none transition-all text-brown text-sm';
const labelClass = 'block text-[11px] font-bold text-sage mb-1.5 uppercase tracking-wider';

function Section({ icon: Icon, title, hint, children }: { icon: React.ElementType; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[24px] border border-sage/15 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold">
          <Icon size={18} />
        </span>
        <div>
          <h2 className="text-base font-bold text-brown">{title}</h2>
          {hint && <p className="text-xs text-sage">{hint}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function ToggleCard({ active, onToggle, icon, title, hint }: { active: boolean; onToggle: () => void; icon: React.ReactNode; title: string; hint: string }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      className={`flex items-center justify-between gap-3 rounded-2xl border p-4 text-left transition ${
        active ? 'border-gold bg-amber-50/60 shadow-xs' : 'border-sage/15 bg-[#FAF9F6] hover:bg-white'
      }`}
    >
      <span className="flex items-center gap-3">
        <span className="text-gold">{icon}</span>
        <span>
          <span className="block text-sm font-bold text-brown">{title}</span>
          <span className="block text-[11px] text-sage">{hint}</span>
        </span>
      </span>
      <span className={`relative flex h-6 w-11 shrink-0 items-center rounded-full px-1 transition-colors ${active ? 'bg-[#c8a96b]' : 'bg-sage/30'}`}>
        <span className={`h-4 w-4 rounded-full bg-white transition-transform ${active ? 'translate-x-5' : ''}`} />
      </span>
    </button>
  );
}

export function ProductForm({ mode, initialData, onRefresh }: ProductFormProps) {
  const router = useRouter();

  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [price, setPrice] = useState<string>(initialData?.price?.toString() || '');
  const [categoryId, setCategoryId] = useState<string>(initialData?.category?.id || '');
  const [audience, setAudience] = useState<ProductAudience | ''>(initialData?.audience || '');

  const [gallery, setGallery] = useState<GalleryItem[]>(() => galleryFromPaths(initialData ? productImages(initialData) : []));
  const [selectedColors, setSelectedColors] = useState<string[]>(initialData?.availableColors || []);
  const [selectedFlowers, setSelectedFlowers] = useState<string[]>(initialData?.availableFlowerTypes || []);
  const [allowsLights, setAllowsLights] = useState<boolean>(initialData?.allowsLights ?? false);
  const [allowsButterfly, setAllowsButterfly] = useState<boolean>(initialData?.allowsButterfly ?? false);
  const [allowsPhraseCard, setAllowsPhraseCard] = useState<boolean>(initialData?.allowsPhraseCard ?? false);

  const [stockInput, setStockInput] = useState<string>(initialData?.stock?.toString() || '0');
  const [currentAvailability, setCurrentAvailability] = useState<boolean>(initialData?.isAvailable ?? true);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);

  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { mutateAsync: createProductAsync, isPending: isCreating } = useCreateProduct();
  const { mutateAsync: updateProductAsync, isPending: isUpdating } = useUpdateProduct(initialData?.id || '');
  const { mutate: updateStockMutation, isPending: isUpdatingStock } = useUpdateStock(initialData?.id || '');
  const { mutate: updateAvailabilityMutation, isPending: isUpdatingAvailability } = useUpdateAvailability(initialData?.id || '');
  const { data: categories, isLoading: isLoadingCategories } = useAdminCategories();

  const isSaving = isCreating || isUpdating || uploadProgress !== null;
  const cover = gallery[0]?.preview;

  const handleStockUpdate = () => {
    if (mode !== 'edit' || !initialData) return;
    const parsedStock = parseInt(stockInput, 10);
    if (!isNaN(parsedStock) && parsedStock >= 0) {
      updateStockMutation({ stock: parsedStock }, { onSuccess: () => onRefresh?.() });
    }
  };

  const handleToggleConfirm = () => {
    if (!initialData) return;
    const nextState = !currentAvailability;
    updateAvailabilityMutation({ isAvailable: nextState }, {
      onSuccess: () => {
        setCurrentAvailability(nextState);
        setShowAvailabilityModal(false);
        onRefresh?.();
      },
    });
  };

  /** Sube las fotos nuevas (comprimidas) y devuelve la galería final en orden. */
  const uploadGallery = async (): Promise<string[]> => {
    const pending = gallery.filter(item => item.file).length;
    let done = 0;
    const paths: string[] = [];
    for (const item of gallery) {
      if (item.path) {
        paths.push(item.path);
        continue;
      }
      setUploadProgress(`Subiendo fotos ${done + 1}/${pending}…`);
      const file = await compressImage(item.file!, 2000, 0.9);
      const res = await AdminProductsService.uploadImage(file);
      paths.push(res.imageUrl);
      done++;
    }
    return paths;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (gallery.length === 0) {
      setErrorMsg('Agrega al menos una foto del producto.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    let imageUrls: string[];
    try {
      imageUrls = await uploadGallery();
      // Las ya subidas quedan como guardadas: si falla el guardado no se vuelven a subir
      setGallery(galleryFromPaths(imageUrls));
    } catch {
      setUploadProgress(null);
      setErrorMsg('No se pudo subir una de las fotos. Revisa el formato (JPG, PNG o WEBP) e inténtalo de nuevo.');
      return;
    }

    setUploadProgress('Guardando…');
    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      price: parseFloat(price),
      imageUrl: imageUrls[0],
      imageUrls,
      availableColors: selectedColors,
      availableFlowerTypes: selectedFlowers,
      allowsLights,
      allowsButterfly,
      allowsPhraseCard,
      categoryId: categoryId || null,
      audience: audience || null,
    };

    try {
      if (mode === 'create') {
        const created = await createProductAsync({ ...payload, stock: parseInt(stockInput, 10) || 0 });
        if (!currentAvailability) {
          await AdminProductsService.updateAvailability(created.id, { isAvailable: false });
        }
      } else {
        await updateProductAsync(payload);
        onRefresh?.();
      }
      router.push('/admin/productos');
    } catch (error: unknown) {
      if (error instanceof ApiProblemDetails) {
        if (error.status === 400) setErrorMsg(error.detail || 'Revisa los datos del producto (precio y nombre son obligatorios).');
        else if (error.status === 403) setErrorMsg('No tienes permisos para realizar esta acción.');
        else setErrorMsg('No pudimos procesar la solicitud con el servidor.');
      } else {
        setErrorMsg('Ocurrió un error inesperado al guardar el producto.');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setUploadProgress(null);
    }
  };

  const parsedPrice = parseFloat(price || '0');

  return (
    <div className="mx-auto max-w-6xl pb-16 animate-in fade-in duration-300">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="-ml-2 rounded-full p-2 text-sage transition-colors hover:bg-sage/10 hover:text-brown"
            title="Volver"
          >
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1 className="font-serif text-2xl font-bold text-brown sm:text-3xl">
              {mode === 'create' ? 'Nuevo producto' : name || initialData?.name}
            </h1>
            <p className="text-xs text-sage sm:text-sm">Fotos, datos y opciones que el cliente puede elegir.</p>
          </div>
        </div>
        {mode === 'edit' && (
          <span className={`hidden rounded-full px-3 py-1 text-xs font-semibold sm:inline-flex ${currentAvailability ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
            {currentAvailability ? 'Visible en la tienda' : 'Oculto'}
          </span>
        )}
      </div>

      {errorMsg && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
          <p className="font-medium">{errorMsg}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Section icon={Images} title="Fotos" hint={`Hasta 8. La primera es la portada.`}>
            <ProductImagesManager items={gallery} onChange={setGallery} disabled={isSaving} />
          </Section>

          <Section icon={FileText} title="Datos del producto">
            <div className="space-y-4">
              <div>
                <label className={labelClass} htmlFor="product-name">Nombre *</label>
                <input
                  id="product-name"
                  type="text"
                  required
                  maxLength={250}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  disabled={isSaving}
                  className={`${inputClass} font-semibold`}
                  placeholder="Ej. Ramo Eterno de Rosas"
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="product-description">Descripción</label>
                <textarea
                  id="product-description"
                  rows={4}
                  maxLength={2000}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  disabled={isSaving}
                  className={`${inputClass} resize-none leading-relaxed`}
                  placeholder="Qué incluye, para qué ocasión es ideal, medidas o cuidados…"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className={labelClass} htmlFor="product-price">Precio *</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-brown">S/</span>
                    <input
                      id="product-price"
                      type="number"
                      step="0.10"
                      min="0"
                      required
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      disabled={isSaving}
                      className={`${inputClass} pl-9 text-base font-bold`}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass} htmlFor="product-category">Categoría</label>
                  <select id="product-category" value={categoryId} onChange={e => setCategoryId(e.target.value)} disabled={isSaving} className={inputClass}>
                    <option value="">{isLoadingCategories ? 'Cargando…' : 'Sin categoría'}</option>
                    {categories?.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass} htmlFor="product-audience">Público</label>
                  <select id="product-audience" value={audience} onChange={e => setAudience(e.target.value as ProductAudience)} disabled={isSaving} className={inputClass}>
                    <option value="">Cualquiera</option>
                    <option value="Chicos">Chicos</option>
                    <option value="Chicas">Chicas</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>
              </div>
            </div>
          </Section>

          <Section icon={Sparkles} title="Personalización" hint="Lo que el cliente puede elegir en el detalle del producto.">
            <ProductOptionsPicker
              colors={selectedColors}
              flowers={selectedFlowers}
              onColorsChange={setSelectedColors}
              onFlowersChange={setSelectedFlowers}
              disabled={isSaving}
            />
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <ToggleCard active={allowsLights} onToggle={() => setAllowsLights(v => !v)} icon={<Lightbulb size={18} />} title="Luces LED" hint="Opción de luces" />
              <ToggleCard active={allowsButterfly} onToggle={() => setAllowsButterfly(v => !v)} icon={<span className="text-base">🦋</span>} title="Mariposas" hint="Decoración extra" />
              <ToggleCard active={allowsPhraseCard} onToggle={() => setAllowsPhraseCard(v => !v)} icon={<Mail size={18} />} title="Tarjeta" hint="Con dedicatoria" />
            </div>
          </Section>

          <Section icon={Package} title="Stock y visibilidad">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="product-stock">{mode === 'edit' ? 'Stock actual' : 'Stock inicial'}</label>
                <div className="flex items-center gap-3">
                  <input
                    id="product-stock"
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={stockInput}
                    onChange={e => setStockInput(e.target.value)}
                    disabled={isSaving || isUpdatingStock}
                    className="w-28 rounded-xl border border-sage/25 bg-white px-4 py-2.5 text-center text-xl font-bold text-brown outline-none focus:border-gold"
                  />
                  {mode === 'edit' ? (
                    <Button
                      type="button"
                      onClick={handleStockUpdate}
                      disabled={isUpdatingStock || stockInput === initialData?.stock?.toString()}
                      className="rounded-xl bg-[#c8a96b] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#b09355]"
                    >
                      {isUpdatingStock ? 'Actualizando…' : 'Actualizar'}
                    </Button>
                  ) : (
                    <span className="text-xs text-sage">unidades</span>
                  )}
                </div>
              </div>
              <div>
                <span className={labelClass}>Visibilidad</span>
                {mode === 'edit' ? (
                  <Button
                    type="button"
                    variant={currentAvailability ? 'outline' : 'primary'}
                    onClick={() => setShowAvailabilityModal(true)}
                    disabled={isUpdatingAvailability}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 font-bold ${
                      currentAvailability ? 'border-rose-200 bg-white text-rose-600 hover:bg-rose-50' : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {currentAvailability ? <><ArchiveX size={16} /> Ocultar del catálogo</> : <><ArchiveRestore size={16} /> Publicar</>}
                  </Button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setCurrentAvailability(v => !v)}
                    className={`w-full rounded-xl border py-2.5 text-sm font-bold transition ${
                      currentAvailability ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'
                    }`}
                  >
                    {currentAvailability ? 'Se publicará al guardar' : 'Quedará oculto'}
                  </button>
                )}
              </div>
            </div>
          </Section>
        </div>

        {/* Vista previa y guardar */}
        <aside className="space-y-4 lg:sticky lg:top-6">
          <div className="overflow-hidden rounded-[24px] border border-sage/15 bg-white shadow-sm">
            <div className="relative aspect-[4/5] bg-[#FAF9F6]">
              {cover ? (
                <Image src={cover} alt="Portada" fill sizes="320px" unoptimized={cover.startsWith('blob:')} className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-sage/40"><ImageIcon size={40} /></div>
              )}
              {gallery.length > 1 && (
                <span className="absolute bottom-3 right-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-brown shadow">
                  {gallery.length} fotos
                </span>
              )}
            </div>
            <div className="space-y-2 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gold">
                {categories?.find(c => c.id === categoryId)?.name || 'Catálogo'}
              </p>
              <p className="truncate font-serif text-lg font-bold text-brown">{name || 'Nombre del producto'}</p>
              <p className="font-serif text-xl font-bold text-brown">{formatCurrency(isNaN(parsedPrice) ? 0 : parsedPrice)}</p>
              <ItemOptions
                colors={selectedColors.slice(0, 6)}
                flowers={selectedFlowers.slice(0, 4)}
                hasLights={allowsLights}
                hasButterfly={allowsButterfly}
                hasPhraseCard={allowsPhraseCard}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSaving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#c8a96b] py-3 font-semibold text-white shadow-md hover:bg-[#b09355]"
          >
            {isSaving ? (
              <><Loader2 size={16} className="animate-spin" /> {uploadProgress ?? 'Guardando…'}</>
            ) : (
              <><Save size={16} /> {mode === 'create' ? 'Crear producto' : 'Guardar cambios'}</>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSaving}
            className="w-full rounded-xl border-sage/30 py-2.5 text-sage hover:text-brown"
          >
            Cancelar
          </Button>
        </aside>
      </form>

      <Modal
        isOpen={showAvailabilityModal}
        onClose={() => setShowAvailabilityModal(false)}
        title={currentAvailability ? '¿Ocultar producto del catálogo?' : '¿Publicar producto en el catálogo?'}
      >
        <div className="space-y-6 pt-2">
          <p className="text-sm leading-relaxed text-sage">
            {currentAvailability
              ? `"${name || initialData?.name}" dejará de aparecer en la tienda.`
              : `"${name || initialData?.name}" volverá a aparecer en la tienda y se podrá pedir.`}
          </p>
          <div className="flex justify-end gap-3 border-t border-sage/10 pt-4">
            <Button variant="outline" onClick={() => setShowAvailabilityModal(false)} disabled={isUpdatingAvailability} className="rounded-xl">
              Cancelar
            </Button>
            <Button
              onClick={handleToggleConfirm}
              disabled={isUpdatingAvailability}
              className={`rounded-xl text-white ${currentAvailability ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
            >
              {isUpdatingAvailability ? 'Procesando…' : 'Confirmar'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
