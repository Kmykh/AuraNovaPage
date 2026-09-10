"use client";

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCreateProduct, useUpdateProduct } from '@/hooks/use-admin-products';
import { useAdminCategories } from '@/hooks/use-categories';
import { AdminProductsService } from '@/services/admin-products.service';
import { ProductResponse } from '@/types/products';
import { ProductAudience } from '@/types/categories';
import { Button } from '@/components/ui/Button';
import { AlertCircle, Image as ImageIcon, Box, List, Eye } from 'lucide-react';
import { ApiProblemDetails } from '@/lib/api-errors';
import { Modal } from '@/components/ui/Modal';
import { getImageUrl } from '@/lib/formatters';

interface ProductFormProps {
  mode: 'create' | 'edit';
  initialData?: ProductResponse;
}

export function ProductForm({ mode, initialData }: ProductFormProps) {
  const router = useRouter();
  
  // Step 2: Info
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [price, setPrice] = useState<string>(initialData?.price?.toString() || '');
  const [categoryId, setCategoryId] = useState<string>(initialData?.category?.id || '');
  const [audience, setAudience] = useState<ProductAudience | ''>(initialData?.audience || '');

  // Customization State
  const [availableColorsStr, setAvailableColorsStr] = useState(initialData?.availableColors?.join(', ') || '');
  const [availableFlowerTypesStr, setAvailableFlowerTypesStr] = useState(initialData?.availableFlowerTypes?.join(', ') || '');
  const [allowsLights, setAllowsLights] = useState<boolean>(initialData?.allowsLights ?? false);
  const [allowsButterfly, setAllowsButterfly] = useState<boolean>(initialData?.allowsButterfly ?? false);
  const [allowsPhraseCard, setAllowsPhraseCard] = useState<boolean>(initialData?.allowsPhraseCard ?? false);
  
  // Step 3: Inventory & Visibility
  const [stock, setStock] = useState<string>(initialData?.stock?.toString() || '0');
  const [isAvailable, setIsAvailable] = useState<boolean>(initialData?.isAvailable ?? true);
  
  // Step 1: Image
  const [imageUrl] = useState(initialData?.imageUrl || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { mutateAsync: createProductAsync, isPending: isCreating } = useCreateProduct();
  const { mutateAsync: updateProductAsync, isPending: isUpdating } = useUpdateProduct(initialData?.id || '');
  const { data: categories, isLoading: isLoadingCategories } = useAdminCategories();

  const isPending = isCreating || isUpdating || isUploading || isLoadingCategories;

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  }, []);

  const previewUrl = selectedFile ? URL.createObjectURL(selectedFile) : imageUrl;

  const executeSave = async () => {
    setErrorMsg(null);
    let finalImageUrl = imageUrl;

    // 1. Process Image Upload first if selected
    if (selectedFile) {
      try {
        setIsUploading(true);
        const res = await AdminProductsService.uploadImage(selectedFile);
        finalImageUrl = res.imageUrl;
      } catch {
        setIsUploading(false);
        setErrorMsg('Error al subir la imagen. Verifica el formato e inténtalo de nuevo.');
        setShowPreviewModal(false);
        return;
      } finally {
        setIsUploading(false);
      }
    }

    // 2. Process Product Details
    try {
      if (mode === 'create') {
        const newProduct = await createProductAsync({
          name,
          description: description || undefined,
          price: parseFloat(price),
          stock: parseInt(stock, 10),
          imageUrl: finalImageUrl || undefined,
          availableColors: availableColorsStr ? availableColorsStr.split(',').map(s => s.trim()).filter(Boolean) : undefined,
          availableFlowerTypes: availableFlowerTypesStr ? availableFlowerTypesStr.split(',').map(s => s.trim()).filter(Boolean) : undefined,
          allowsLights,
          allowsButterfly,
          allowsPhraseCard,
          categoryId: categoryId || null,
          audience: audience || null,
        });

        if (isAvailable === false) {
          await AdminProductsService.updateAvailability(newProduct.id, { isAvailable: false });
        }
        
        setShowPreviewModal(false);
        router.push('/admin/productos');
      } else {
        await updateProductAsync({
          name,
          description: description || undefined,
          price: parseFloat(price),
          imageUrl: finalImageUrl || undefined,
          availableColors: availableColorsStr ? availableColorsStr.split(',').map(s => s.trim()).filter(Boolean) : undefined,
          availableFlowerTypes: availableFlowerTypesStr ? availableFlowerTypesStr.split(',').map(s => s.trim()).filter(Boolean) : undefined,
          allowsLights,
          allowsButterfly,
          allowsPhraseCard,
          categoryId: categoryId || null,
          audience: audience || null,
        });

        setShowPreviewModal(false);
        router.refresh();
        router.push(`/admin/productos`);
      }
    } catch (error: unknown) {
      setShowPreviewModal(false);
      if (error instanceof ApiProblemDetails) {
        if (error.status === 400) {
          setErrorMsg('Revisa los datos del producto. Verifica precios o nombres.');
        } else if (error.status === 403) {
          setErrorMsg('No tienes permisos para modificar productos.');
        } else if (error.status === 409) {
          setErrorMsg('No se pudo completar la operación porque el producto cambió.');
        } else if (error.status === 429) {
          setErrorMsg('Demasiadas solicitudes. Inténtalo nuevamente.');
        } else {
          setErrorMsg('No pudimos conectarnos con Aura Nova.');
        }
      } else {
        setErrorMsg('Ocurrió un error inesperado al guardar el producto.');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowPreviewModal(true);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm flex gap-3 border border-red-200 shadow-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{errorMsg}</p>
        </div>
      )}

      {/* PASO 1: IMAGEN */}
      <div className="bg-white p-6 sm:p-8 rounded-[24px] shadow-sm border border-sage/10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gold/5 to-transparent rounded-bl-full pointer-events-none transition-transform duration-700 group-hover:scale-110" />
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-brown mb-6 flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-cream/80 flex items-center justify-center">
            <ImageIcon className="w-4 h-4 text-gold" />
          </span>
          Fotografía Principal
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div 
            className={`relative border-2 border-dashed rounded-[20px] p-8 text-center flex flex-col items-center justify-center min-h-[220px] transition-all duration-300 ${
              isDragging ? 'border-gold bg-gold/5 scale-[1.02]' : 'border-sage/20 hover:border-gold/50 hover:bg-[#FAFAFA]'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setSelectedFile(e.target.files[0]);
                } else {
                  setSelectedFile(null);
                }
              }}
              disabled={isPending}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="flex flex-col items-center gap-3 relative z-0 pointer-events-none">
              <div className="w-14 h-14 rounded-full bg-cream flex items-center justify-center text-gold shadow-sm">
                <ImageIcon size={28} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-brown font-semibold text-sm">Arrastra tu imagen aquí</p>
                <p className="text-xs text-sage mt-1">o haz clic para explorar tus archivos</p>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-sage/70 font-medium bg-white px-3 py-1 rounded-full border border-sage/10">
                Soporta PNG, JPG
              </span>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center">
            {previewUrl ? (
              <div className="relative w-full aspect-square max-w-[220px] rounded-[20px] overflow-hidden border border-sage/15 shadow-md group/preview">
                <Image src={getImageUrl(previewUrl)} alt="Vista previa" fill className="object-cover transition-transform duration-700 group-hover/preview:scale-105" />
                <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-[20px] pointer-events-none" />
              </div>
            ) : (
              <div className="w-full aspect-square max-w-[220px] rounded-[20px] border border-sage/10 bg-[#FAFAFA] flex items-center justify-center flex-col text-sage/50 gap-3">
                <ImageIcon size={40} strokeWidth={1} />
                <span className="text-xs font-medium uppercase tracking-widest">Sin imagen</span>
              </div>
            )}
            
            {selectedFile && (
              <p className="text-[11px] text-emerald-600 mt-4 font-semibold text-center bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                ✅ {selectedFile.name}
              </p>
            )}
            {mode === 'edit' && !selectedFile && imageUrl && (
               <p className="text-[11px] text-sage mt-4 text-center px-4 font-medium">
                 Usando la imagen actual del producto.
               </p>
            )}
          </div>
        </div>
      </div>

      {/* PASO 2: INFORMACIÓN PRINCIPAL */}
      <div className="bg-white p-6 sm:p-8 rounded-[24px] shadow-sm border border-sage/10 relative overflow-hidden group">
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-brown mb-8 flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-cream/80 flex items-center justify-center">
            <List className="w-4 h-4 text-gold" />
          </span>
          Detalles del Producto
        </h2>
        
        <div className="grid grid-cols-1 gap-7">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-brown mb-2">Nombre del producto <span className="text-rose-500">*</span></label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
              className="block w-full px-5 py-3.5 bg-[#FAFAFA] rounded-xl border border-sage/15 focus:bg-white focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none transition-all text-brown placeholder:text-sage/40"
              placeholder="Ej. Taza Personalizada Floral"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-brown mb-2">Descripción</label>
            <textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isPending}
              className="block w-full px-5 py-3.5 bg-[#FAFAFA] rounded-xl border border-sage/15 focus:bg-white focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none transition-all text-brown placeholder:text-sage/40 resize-none leading-relaxed"
              placeholder="Describe los detalles, materiales y cuidados de este producto..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
            <div className="sm:col-span-1">
              <label htmlFor="price" className="block text-sm font-semibold text-brown mb-2">Precio de venta (S/) <span className="text-rose-500">*</span></label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-sage font-medium">S/</span>
                <input
                  id="price"
                  type="number"
                  step="0.10"
                  min="0"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  disabled={isPending}
                  className="block w-full pl-12 pr-5 py-3.5 bg-[#FAFAFA] rounded-xl border border-sage/15 focus:bg-white focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none transition-all text-lg font-bold text-brown"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
            <div>
              <label htmlFor="category" className="block text-sm font-semibold text-brown mb-2">Categoría</label>
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={isPending}
                className="block w-full px-5 py-3.5 bg-[#FAFAFA] rounded-xl border border-sage/15 focus:bg-white focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none transition-all text-brown appearance-none"
              >
                <option value="">
                  {isLoadingCategories ? 'Cargando categorías...' : 'Sin categoría (Seleccionar)'}
                </option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="audience" className="block text-sm font-semibold text-brown mb-2">Público objetivo</label>
              <select
                id="audience"
                value={audience}
                onChange={(e) => setAudience(e.target.value as ProductAudience)}
                disabled={isPending}
                className="block w-full px-5 py-3.5 bg-[#FAFAFA] rounded-xl border border-sage/15 focus:bg-white focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none transition-all text-brown appearance-none"
              >
                <option value="">Cualquier público (Seleccionar)</option>
                <option value="Chicos">Chicos</option>
                <option value="Chicas">Chicas</option>
                <option value="Unisex">Unisex</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* PASO 3: PERSONALIZACIÓN */}
      <div className="bg-white p-6 sm:p-8 rounded-[24px] shadow-sm border border-sage/10 relative overflow-hidden group">
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-brown mb-8 flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
            <span className="text-sm">✨</span>
          </span>
          Opciones de Personalización
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
          <div className="md:col-span-2">
            <label htmlFor="colors" className="block text-sm font-semibold text-brown mb-2">Colores disponibles</label>
            <input
              id="colors"
              type="text"
              value={availableColorsStr}
              onChange={(e) => setAvailableColorsStr(e.target.value)}
              disabled={isPending}
              className="block w-full px-5 py-3.5 bg-[#FAFAFA] rounded-xl border border-sage/15 focus:bg-white focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none transition-all text-brown placeholder:text-sage/40"
              placeholder="Ej. Rojo, Rosado, Blanco (separados por coma)"
            />
            <p className="text-[11px] text-sage mt-2 flex items-center gap-1.5"><AlertCircle size={12}/> Déjalo vacío si no tiene variantes de color.</p>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="flowers" className="block text-sm font-semibold text-brown mb-2">Tipos de flores disponibles</label>
            <input
              id="flowers"
              type="text"
              value={availableFlowerTypesStr}
              onChange={(e) => setAvailableFlowerTypesStr(e.target.value)}
              disabled={isPending}
              className="block w-full px-5 py-3.5 bg-[#FAFAFA] rounded-xl border border-sage/15 focus:bg-white focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none transition-all text-brown placeholder:text-sage/40"
              placeholder="Ej. Rosas, Girasoles, Tulipanes (separados por coma)"
            />
            <p className="text-[11px] text-sage mt-2 flex items-center gap-1.5"><AlertCircle size={12}/> Déjalo vacío si no permite cambiar el tipo de flor.</p>
          </div>

          {/* Custom Toggle Switches */}
          <div className="flex items-center justify-between p-5 border border-sage/15 rounded-[16px] bg-white shadow-sm hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm font-bold text-brown">¿Permite luces?</p>
              <p className="text-[11px] text-sage mt-0.5">Opción para añadir luces LED</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={allowsLights} onChange={(e) => setAllowsLights(e.target.checked)} disabled={isPending} />
              <div className="w-12 h-6 bg-sage/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-5 border border-sage/15 rounded-[16px] bg-white shadow-sm hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm font-bold text-brown">¿Permite mariposas?</p>
              <p className="text-[11px] text-sage mt-0.5">Opción para añadir mariposas deco</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={allowsButterfly} onChange={(e) => setAllowsButterfly(e.target.checked)} disabled={isPending} />
              <div className="w-12 h-6 bg-sage/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
            </label>
          </div>

          <div className="md:col-span-2 flex items-center justify-between p-5 border border-sage/15 rounded-[16px] bg-white shadow-sm hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm font-bold text-brown">¿Permite Tarjeta con Frase?</p>
              <p className="text-[11px] text-sage mt-0.5">El cliente podrá escribir una dedicatoria y escoger tipografía al comprar</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={allowsPhraseCard} onChange={(e) => setAllowsPhraseCard(e.target.checked)} disabled={isPending} />
              <div className="w-12 h-6 bg-sage/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
            </label>
          </div>
        </div>
      </div>

      {/* PASO 4: INVENTARIO Y VISIBILIDAD (Solo al crear) */}
      {mode === 'create' && (
        <div className="bg-white p-6 sm:p-8 rounded-[24px] shadow-sm border border-sage/10 relative overflow-hidden group">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-brown mb-8 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-cream/80 flex items-center justify-center">
              <Box className="w-4 h-4 text-gold" />
            </span>
            Inventario y Disponibilidad
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            
            {/* Stock - Premium */}
            <div className="bg-gradient-to-b from-cream/40 to-white p-6 rounded-[20px] border border-sage/15 shadow-sm flex flex-col justify-between">
              <div>
                <label htmlFor="stock" className="block text-xs font-bold text-brown mb-2 uppercase tracking-widest">Inventario Físico <span className="text-rose-500">*</span></label>
                <p className="text-[13px] text-sage mb-6 leading-relaxed">Indica cuántas unidades tienes armadas y listas para enviar inmediatamente.</p>
              </div>
              <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-sage/20 shadow-inner focus-within:ring-2 focus-within:ring-gold/30 focus-within:border-gold transition-all">
                <input
                  id="stock"
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  disabled={isPending}
                  className="block w-full px-4 py-2 bg-transparent focus:outline-none text-4xl text-center font-serif text-brown"
                  placeholder="0"
                />
                <span className="text-sage/60 font-medium pr-4 uppercase tracking-widest text-[10px]">Unidades</span>
              </div>
            </div>

            {/* Visibilidad - Elegante */}
            <div className={`p-6 rounded-[20px] border flex flex-col justify-between transition-all duration-300 ${!isAvailable ? 'bg-[#FAFAFA] border-sage/15' : 'bg-white border-gold/30 shadow-md ring-1 ring-gold/5'}`}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-xs font-bold text-brown uppercase tracking-widest flex items-center gap-2">
                    <Eye className="w-3.5 h-3.5 text-gold" />
                    Catálogo Público
                  </label>
                  
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={isAvailable}
                      onChange={(e) => setIsAvailable(e.target.checked)}
                      disabled={isPending}
                    />
                    <div className="w-12 h-6 bg-sage/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
                  </label>
                </div>
                <p className="text-[13px] text-sage leading-relaxed mb-6">Controla si los clientes pueden ver y comprar este producto en tu tienda virtual.</p>
              </div>
              
              <div className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${isAvailable ? 'bg-emerald-50/50 border-emerald-100' : 'bg-stone-50 border-stone-100'}`}>
                <div className="relative flex items-center justify-center shrink-0">
                  <div className={`w-3 h-3 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-stone-400'}`} />
                  {isAvailable && <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-30" />}
                </div>
                <span className={`text-[13px] font-semibold ${isAvailable ? 'text-emerald-700' : 'text-stone-500'}`}>
                  {isAvailable ? 'Visible para los clientes' : 'Oculto temporalmente'}
                </span>
              </div>
            </div>

          </div>
        </div>
      )}

      <div className="pt-6 flex justify-end gap-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => router.back()}
          disabled={isPending}
          className="px-8"
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending} className="px-8">
          {isPending ? 'Guardando...' : mode === 'create' ? 'Crear producto' : 'Guardar producto'}
        </Button>
      </div>

      <Modal 
        isOpen={showPreviewModal} 
        onClose={() => !isPending && setShowPreviewModal(false)}
        title="Confirmar cambios"
        maxWidth="max-w-4xl"
      >
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* EDITORIAL LAYOUT */}
          <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-start mt-4">
            
            {/* IMAGEN IMPONENTE */}
            <div className="w-full md:w-1/2 relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/5">
               <div className="relative w-full aspect-[4/5] bg-[#F9F8F6]">
                 {previewUrl ? (
                   <Image 
                     src={getImageUrl(previewUrl)} 
                     alt="Preview" 
                     fill 
                     className="object-cover hover:scale-105 transition-transform duration-[2s] ease-out" 
                   />
                 ) : (
                   <div className="w-full h-full flex flex-col items-center justify-center text-sage/40">
                      <ImageIcon size={48} strokeWidth={1} />
                   </div>
                 )}
               </div>
            </div>
            
            {/* TEXTOS Y ESTILO UNICO */}
            <div className="w-full md:w-1/2 flex flex-col justify-center py-2 md:py-6">
               <span className="text-[10px] tracking-[0.25em] uppercase text-gold mb-3 font-semibold">Previsualización</span>
               
               <h3 className="font-serif text-3xl md:text-4xl text-brown leading-[1.1] mb-3">
                 {name || 'Producto Aura Nova'}
               </h3>
               
               <p className="text-2xl font-light text-gold mb-8 font-serif italic">
                 S/ {parseFloat(price || '0').toFixed(2)}
               </p>
               
               <div className="h-px w-12 bg-gold/40 mb-8" />
               
               {/* Descripción sin scroll, totalmente expandida */}
               <p className="text-base text-[#5c564d] leading-[1.8] whitespace-pre-wrap font-light tracking-wide">
                 {description || 'Escribe una descripción que enamore a tus clientes...'}
               </p>
            </div>
          </div>
          
          {/* BOTONERA */}
          <div className="flex justify-end gap-4 pt-6 mt-4 border-t border-sage/10">
             <Button type="button" variant="outline" onClick={() => setShowPreviewModal(false)} disabled={isPending} className="px-6 rounded-full border-sage/30 text-sage hover:bg-sage/5">
               Atrás
             </Button>
             <Button type="button" onClick={executeSave} disabled={isPending} className="px-8 rounded-full bg-brown hover:bg-brown/90 text-white shadow-lg shadow-brown/20 transition-all hover:-translate-y-0.5">
               {isPending ? 'Guardando...' : 'Confirmar cambios'}
             </Button>
          </div>
        </div>
      </Modal>
    </form>
  );
}
