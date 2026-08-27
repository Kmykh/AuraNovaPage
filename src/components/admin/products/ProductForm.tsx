"use client";

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCreateProduct, useUpdateProduct } from '@/hooks/use-admin-products';
import { AdminProductsService } from '@/services/admin-products.service';
import { ProductResponse } from '@/types/products';
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
  
  // Step 3: Inventory & Visibility
  const [stock, setStock] = useState<string>(initialData?.stock?.toString() || '0');
  const [isAvailable, setIsAvailable] = useState<boolean>(initialData?.isAvailable ?? true);
  
  // Step 1: Image
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { mutateAsync: createProductAsync, isPending: isCreating } = useCreateProduct();
  const { mutateAsync: updateProductAsync, isPending: isUpdating } = useUpdateProduct(initialData?.id || '');

  const isPending = isCreating || isUpdating || isUploading;

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
      } catch (err) {
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
        });

        setShowPreviewModal(false);
        router.refresh();
        router.push(`/admin/productos`);
      }
    } catch (error: any) {
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
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-sage/10">
        <h2 className="text-xl font-serif font-bold text-brown mb-6 flex items-center gap-2">
          <ImageIcon className="w-6 h-6 text-gold" />
          Paso 1: Fotografía del Producto
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div 
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[200px] transition-colors ${
              isDragging ? 'border-gold bg-gold/5' : 'border-sage/30 hover:bg-sage/5'
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
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                <ImageIcon size={24} />
              </div>
              <p className="text-brown font-medium">Arrastra tu imagen aquí</p>
              <p className="text-xs text-sage">o haz clic para explorar tus archivos</p>
              <p className="text-xs text-sage mt-2 opacity-70">Soporta PNG, JPG, JPEG</p>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center">
            {previewUrl ? (
              <div className="relative w-full aspect-square max-w-[240px] rounded-2xl overflow-hidden border border-sage/20 shadow-sm">
                <Image src={getImageUrl(previewUrl)} alt="Vista previa" fill className="object-cover" />
              </div>
            ) : (
              <div className="w-full aspect-square max-w-[240px] rounded-2xl border border-sage/10 bg-cream flex items-center justify-center flex-col text-sage gap-2">
                <ImageIcon size={32} className="opacity-50" />
                <span className="text-sm font-medium">Sin imagen</span>
              </div>
            )}
            
            {selectedFile && (
              <p className="text-xs text-gold mt-4 font-medium text-center">
                ✅ Archivo seleccionado: {selectedFile.name}
              </p>
            )}
            {mode === 'edit' && !selectedFile && imageUrl && (
               <p className="text-xs text-sage mt-4 text-center px-4">
                 Actualmente usando la imagen guardada.
               </p>
            )}
          </div>
        </div>
      </div>

      {/* PASO 2: INFORMACIÓN PRINCIPAL */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-sage/10">
        <h2 className="text-xl font-serif font-bold text-brown mb-6 flex items-center gap-2">
          <List className="w-6 h-6 text-gold" />
          Paso 2: Detalles del Producto
        </h2>
        
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-brown mb-2">Nombre del producto *</label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
              className="block w-full px-4 py-3 rounded-xl border border-sage/30 focus:ring-1 focus:ring-gold focus:border-gold outline-none"
              placeholder="Ej. Taza Personalizada Floral"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-brown mb-2">Descripción</label>
            <textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isPending}
              className="block w-full px-4 py-3 rounded-xl border border-sage/30 focus:ring-1 focus:ring-gold focus:border-gold outline-none resize-none"
              placeholder="Describe los detalles, materiales y cuidados de este producto..."
            />
          </div>

          <div className="w-full sm:w-1/2">
            <label htmlFor="price" className="block text-sm font-medium text-brown mb-2">Precio de venta (S/) *</label>
            <input
              id="price"
              type="number"
              step="0.10"
              min="0"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              disabled={isPending}
              className="block w-full px-4 py-3 rounded-xl border border-sage/30 focus:ring-1 focus:ring-gold focus:border-gold outline-none text-lg font-medium"
              placeholder="79.90"
            />
          </div>
        </div>
      </div>

      {/* PASO 3: INVENTARIO Y VISIBILIDAD (Solo al crear) */}
      {mode === 'create' && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-sage/10">
          <h2 className="text-xl font-serif font-bold text-brown mb-6 flex items-center gap-2">
            <Box className="w-6 h-6 text-gold" />
            Paso 3: Inventario y Disponibilidad
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            
            {/* Stock - Premium */}
            <div className="bg-[#FFFDF8] p-6 rounded-2xl border border-sage/20 shadow-sm flex flex-col justify-between">
              <div>
                <label htmlFor="stock" className="block text-sm font-bold text-brown mb-2 uppercase tracking-wide">Inventario Físico *</label>
                <p className="text-sm text-sage mb-6 leading-relaxed">Indica cuántas unidades tienes armadas y listas para enviar inmediatamente.</p>
              </div>
              <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-sage/30 shadow-inner focus-within:ring-2 focus-within:ring-gold/50 focus-within:border-gold transition-all">
                <input
                  id="stock"
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  disabled={isPending}
                  className="block w-full px-4 py-2 bg-transparent focus:outline-none text-3xl text-center font-serif text-brown"
                  placeholder="0"
                />
                <span className="text-sage font-medium pr-4 uppercase tracking-widest text-xs">Unidades</span>
              </div>
            </div>

            {/* Visibilidad - Elegante */}
            <div className={`p-6 rounded-2xl border flex flex-col justify-between transition-all duration-300 ${!isAvailable ? 'bg-cream/40 border-sage/20 opacity-90' : 'bg-white border-gold/40 shadow-sm'}`}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-bold text-brown uppercase tracking-wide flex items-center gap-2">
                    <Eye className="w-4 h-4 text-gold" />
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
                    <div className="w-11 h-6 bg-sage/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
                  </label>
                </div>
                <p className="text-sm text-sage leading-relaxed mb-6">Controla si los clientes pueden ver y comprar este producto en tu tienda virtual.</p>
              </div>
              
              <div className="flex items-center gap-3 bg-[#F9F8F6] p-3 rounded-xl border border-sage/10">
                <div className="relative flex items-center justify-center">
                  <div className={`w-3 h-3 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-red-400'}`} />
                  {isAvailable && <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-30" />}
                </div>
                <span className={`text-sm font-medium ${isAvailable ? 'text-brown' : 'text-sage/70'}`}>
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
