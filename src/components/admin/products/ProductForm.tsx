"use client";

import React, { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCreateProduct, useUpdateProduct, useUpdateStock, useUpdateAvailability } from '@/hooks/use-admin-products';
import { useAdminCategories } from '@/hooks/use-categories';
import { AdminProductsService } from '@/services/admin-products.service';
import { ProductResponse } from '@/types/products';
import { ProductAudience } from '@/types/categories';
import { Button } from '@/components/ui/Button';
import { 
  AlertCircle, 
  Image as ImageIcon, 
  Save, 
  Loader2, 
  ArrowLeft, 
  Package, 
  ArchiveRestore, 
  ArchiveX, 
  Check, 
  Plus, 
  X, 
  Sparkles,
  UploadCloud
} from 'lucide-react';
import { ApiProblemDetails } from '@/lib/api-errors';
import { Modal } from '@/components/ui/Modal';
import { getImageUrl } from '@/lib/formatters';

interface ProductFormProps {
  mode: 'create' | 'edit';
  initialData?: ProductResponse;
  onRefresh?: () => void;
}

const PRESET_COLORS = [
  { name: 'Rojo', color: '#ef4444' },
  { name: 'Rosado', color: '#f472b6' },
  { name: 'Rosa Pastel', color: '#fbcfe8' },
  { name: 'Blanco', color: '#ffffff', border: true },
  { name: 'Amarillo', color: '#facc15' },
  { name: 'Azul', color: '#3b82f6' },
  { name: 'Celeste', color: '#93c5fd' },
  { name: 'Morado', color: '#8b5cf6' },
  { name: 'Lila', color: '#c4b5fd' },
  { name: 'Fucsia', color: '#d946ef' },
  { name: 'Naranja', color: '#fb923c' },
  { name: 'Champagne', color: '#fef3c7' },
  { name: 'Vino Tinto', color: '#881337' },
  { name: 'Multicolor', color: 'linear-gradient(135deg, #ef4444, #facc15, #3b82f6)' },
];

const PRESET_FLOWER_TYPES = [
  'Rosas',
  'Girasoles',
  'Tulipanes',
  'Lirios',
  'Orquídeas',
  'Margaritas',
  'Claveles',
  'Hortensias',
  'Peonías',
  'Crisantemos',
  'Gerberas',
  'Gypsophila (Lluvia)',
  'Astromelias',
  'Lavanda',
  'Flores Silvestres'
];

export function ProductForm({ mode, initialData, onRefresh }: ProductFormProps) {
  const router = useRouter();

  // Basic Info
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [price, setPrice] = useState<string>(initialData?.price?.toString() || '');
  const [categoryId, setCategoryId] = useState<string>(initialData?.category?.id || '');
  const [audience, setAudience] = useState<ProductAudience | ''>(initialData?.audience || '');

  // Customization Lists
  const [selectedColors, setSelectedColors] = useState<string[]>(initialData?.availableColors || []);
  const [newColorInput, setNewColorInput] = useState('');
  const [selectedFlowers, setSelectedFlowers] = useState<string[]>(initialData?.availableFlowerTypes || []);
  const [newFlowerInput, setNewFlowerInput] = useState('');

  // Toggles
  const [allowsLights, setAllowsLights] = useState<boolean>(initialData?.allowsLights ?? false);
  const [allowsButterfly, setAllowsButterfly] = useState<boolean>(initialData?.allowsButterfly ?? false);
  const [allowsPhraseCard, setAllowsPhraseCard] = useState<boolean>(initialData?.allowsPhraseCard ?? false);

  // Inventory & Visibility
  const [stockInput, setStockInput] = useState<string>(initialData?.stock?.toString() || '0');
  const [currentAvailability, setCurrentAvailability] = useState<boolean>(initialData?.isAvailable ?? true);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);

  // Sync if initialData changes
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setDescription(initialData.description || '');
      setPrice(initialData.price?.toString() || '');
      setCategoryId(initialData.category?.id || '');
      setAudience(initialData.audience || '');
      setSelectedColors(initialData.availableColors || []);
      setSelectedFlowers(initialData.availableFlowerTypes || []);
      setAllowsLights(initialData.allowsLights ?? false);
      setAllowsButterfly(initialData.allowsButterfly ?? false);
      setAllowsPhraseCard(initialData.allowsPhraseCard ?? false);
      setStockInput(initialData.stock?.toString() || '0');
      setCurrentAvailability(initialData.isAvailable ?? true);
    }
  }, [initialData]);

  // Image Upload
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Modals & Feedback
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // API Hooks
  const { mutateAsync: createProductAsync, isPending: isCreating } = useCreateProduct();
  const { mutateAsync: updateProductAsync, isPending: isUpdating } = useUpdateProduct(initialData?.id || '');
  const { mutate: updateStockMutation, isPending: isUpdatingStock } = useUpdateStock(initialData?.id || '');
  const { mutate: updateAvailabilityMutation, isPending: isUpdatingAvailability } = useUpdateAvailability(initialData?.id || '');
  const { data: categories, isLoading: isLoadingCategories } = useAdminCategories();

  const isSaving = isCreating || isUpdating || isUploading;

  // Drag & drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); }, []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files?.[0]) setSelectedFile(e.dataTransfer.files[0]);
  }, []);

  const previewUrl = selectedFile ? URL.createObjectURL(selectedFile) : imageUrl;

  // Quick Stock Update (Edit mode)
  const handleStockUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode !== 'edit' || !initialData) return;
    const parsedStock = parseInt(stockInput, 10);
    if (!isNaN(parsedStock) && parsedStock >= 0) {
      updateStockMutation({ stock: parsedStock }, {
        onSuccess: () => {
          onRefresh?.();
        }
      });
    }
  };

  // Quick Availability Toggle (Edit mode)
  const handleToggleConfirm = () => {
    if (!initialData) return;
    const nextState = !currentAvailability;
    updateAvailabilityMutation(
      { isAvailable: nextState },
      {
        onSuccess: () => {
          setCurrentAvailability(nextState);
          setShowAvailabilityModal(false);
          onRefresh?.();
        }
      }
    );
  };

  // Color selection helpers
  const toggleColor = (colorName: string) => {
    setSelectedColors(prev => 
      prev.includes(colorName) ? prev.filter(c => c !== colorName) : [...prev, colorName]
    );
  };

  const handleAddCustomColor = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const trimmed = newColorInput.trim();
    if (trimmed && !selectedColors.includes(trimmed)) {
      setSelectedColors(prev => [...prev, trimmed]);
      setNewColorInput('');
    }
  };

  const removeColor = (colorName: string) => {
    setSelectedColors(prev => prev.filter(c => c !== colorName));
  };

  // Flower selection helpers
  const toggleFlower = (flowerName: string) => {
    setSelectedFlowers(prev => 
      prev.includes(flowerName) ? prev.filter(f => f !== flowerName) : [...prev, flowerName]
    );
  };

  const handleAddCustomFlower = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const trimmed = newFlowerInput.trim();
    if (trimmed && !selectedFlowers.includes(trimmed)) {
      setSelectedFlowers(prev => [...prev, trimmed]);
      setNewFlowerInput('');
    }
  };

  const removeFlower = (flowerName: string) => {
    setSelectedFlowers(prev => prev.filter(f => f !== flowerName));
  };

  // Save product logic
  const executeSave = async () => {
    setErrorMsg(null);
    let finalImageUrl = imageUrl;

    if (selectedFile) {
      try {
        setIsUploading(true);
        const res = await AdminProductsService.uploadImage(selectedFile);
        finalImageUrl = res.imageUrl;
        setImageUrl(res.imageUrl);
      } catch {
        setIsUploading(false);
        setErrorMsg('Error al subir la imagen. Verifica el formato e inténtalo de nuevo.');
        setShowPreviewModal(false);
        return;
      } finally {
        setIsUploading(false);
      }
    }

    try {
      if (mode === 'create') {
        const parsedStock = parseInt(stockInput, 10) || 0;
        const newProduct = await createProductAsync({
          name,
          description: description || undefined,
          price: parseFloat(price),
          stock: parsedStock,
          imageUrl: finalImageUrl || undefined,
          availableColors: selectedColors.length > 0 ? selectedColors : undefined,
          availableFlowerTypes: selectedFlowers.length > 0 ? selectedFlowers : undefined,
          allowsLights,
          allowsButterfly,
          allowsPhraseCard,
          categoryId: categoryId || null,
          audience: audience || null,
        });

        if (!currentAvailability) {
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
          availableColors: selectedColors.length > 0 ? selectedColors : undefined,
          availableFlowerTypes: selectedFlowers.length > 0 ? selectedFlowers : undefined,
          allowsLights,
          allowsButterfly,
          allowsPhraseCard,
          categoryId: categoryId || null,
          audience: audience || null,
        });

        setShowPreviewModal(false);
        onRefresh?.();
        router.push('/admin/productos');
      }
    } catch (error: unknown) {
      setShowPreviewModal(false);
      if (error instanceof ApiProblemDetails) {
        if (error.status === 400) setErrorMsg('Revisa los datos del producto. Verifica precios o nombres requeridos.');
        else if (error.status === 403) setErrorMsg('No tienes permisos para realizar esta acción.');
        else setErrorMsg('No pudimos procesar la solicitud con el servidor.');
      } else {
        setErrorMsg('Ocurrió un error inesperado al guardar el producto.');
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowPreviewModal(true);
  };

  return (
    <div className="max-w-5xl mx-auto pb-16 animate-in fade-in duration-300">
      
      {/* ── Top Header Navigation ── */}
      <div className="mb-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-sage mb-1 block">
          Información básica
        </span>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              type="button" 
              onClick={() => router.back()} 
              className="p-2 -ml-2 rounded-full hover:bg-sage/10 text-sage hover:text-brown transition-colors"
              title="Volver"
            >
              <ArrowLeft size={22} />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-brown flex items-center gap-2">
                {mode === 'create' ? 'Crear Nuevo Producto' : `Editar: ${name || initialData?.name}`}
              </h1>
              <p className="text-xs sm:text-sm text-sage">
                Completa los campos y previsualiza antes de guardar
              </p>
            </div>
          </div>
          {mode === 'edit' && (
            <div className="hidden sm:flex items-center gap-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                currentAvailability ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {currentAvailability ? 'Disponible' : 'No disponible'}
              </span>
              {initialData?.id && (
                <span className="text-xs text-sage bg-sage/10 px-2.5 py-1 rounded-full font-mono">
                  ID: {initialData.id.slice(0, 8)}...
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-700 p-4 rounded-2xl text-sm flex items-center gap-3 border border-red-200 mb-6 shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <p className="font-medium">{errorMsg}</p>
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-6">
        
        {/* ── 1. Main Product Card (Horizontal Layout) ── */}
        <div className="bg-white rounded-[24px] shadow-sm border border-sage/15 p-6 sm:p-8">
          
          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr] gap-8 items-start">
            
            {/* Left: Image Upload & Preview Box */}
            <div className="flex flex-col items-center">
              <label className="block text-[11px] font-bold text-sage mb-2 uppercase tracking-wider self-start">
                Fotografía del Producto *
              </label>
              <div 
                className={`relative w-full aspect-square rounded-[22px] flex flex-col items-center justify-center transition-all overflow-hidden border-2 cursor-pointer group ${
                  isDragging 
                    ? 'border-gold bg-gold/5 scale-[1.02]' 
                    : 'border-dashed border-sage/25 bg-[#FAF9F6] hover:border-gold/60'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file" 
                  accept="image/*"
                  onChange={e => {
                    if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
                  }}
                  disabled={isSaving}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />

                {previewUrl ? (
                  <div className="relative w-full h-full">
                    <Image 
                      src={getImageUrl(previewUrl)} 
                      alt="Vista previa del producto" 
                      fill 
                      className="object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1 z-10">
                      <UploadCloud size={28} />
                      <span className="text-xs font-semibold">Cambiar imagen</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 p-6 text-center text-sage">
                    <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center text-gold border border-sage/10">
                      <ImageIcon size={26} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-brown">Arrastra una imagen aquí</p>
                      <p className="text-[11px] text-sage/70 mt-0.5">o haz clic para explorar</p>
                    </div>
                    <span className="text-[10px] text-sage/50 uppercase tracking-wider font-semibold">PNG, JPG o WEBP</span>
                  </div>
                )}
              </div>

              {selectedFile && (
                <div className="mt-3 w-full flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs text-emerald-800">
                  <span className="truncate max-w-[200px] font-medium">📷 {selectedFile.name}</span>
                  <button 
                    type="button" 
                    onClick={() => setSelectedFile(null)} 
                    className="text-emerald-700 hover:text-emerald-900 font-bold ml-2"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            {/* Right: Info Fields */}
            <div className="space-y-5">
              {/* Nombre */}
              <div>
                <label className="block text-[11px] font-bold text-sage mb-1.5 uppercase tracking-wider">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  disabled={isSaving}
                  className="w-full px-4 py-3 bg-[#FAF9F6] rounded-xl border border-sage/20 focus:bg-white focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none transition-all text-brown font-semibold placeholder:text-sage/40"
                  placeholder="Ej. 🦋 Ramito Aperlado ✨"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-[11px] font-bold text-sage mb-1.5 uppercase tracking-wider">
                  Descripción
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  disabled={isSaving}
                  className="w-full px-4 py-3 bg-[#FAF9F6] rounded-xl border border-sage/20 focus:bg-white focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none transition-all text-brown text-sm leading-relaxed placeholder:text-sage/40 resize-none font-medium"
                  placeholder="Describe la composición floral, ocasión ideal, cuidados o detalles emotivos..."
                />
              </div>

              {/* Precio, Categoría y Público */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Precio */}
                <div>
                  <label className="block text-[11px] font-bold text-sage mb-1.5 uppercase tracking-wider">
                    Precio *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brown font-bold text-sm">
                      S/
                    </span>
                    <input
                      type="number"
                      step="0.10"
                      min="0"
                      required
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      disabled={isSaving}
                      className="w-full pl-9 pr-3 py-2.5 bg-[#FAF9F6] rounded-xl border border-sage/20 focus:bg-white focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none transition-all text-base font-bold text-brown"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Categoría */}
                <div>
                  <label className="block text-[11px] font-bold text-sage mb-1.5 uppercase tracking-wider">
                    Categoría
                  </label>
                  <select
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                    disabled={isSaving}
                    className="w-full px-3 py-2.5 bg-[#FAF9F6] rounded-xl border border-sage/20 focus:bg-white focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none transition-all text-brown text-sm font-medium"
                  >
                    <option value="">{isLoadingCategories ? 'Cargando...' : 'Sin Categoría'}</option>
                    {categories?.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Público */}
                <div>
                  <label className="block text-[11px] font-bold text-sage mb-1.5 uppercase tracking-wider">
                    Público
                  </label>
                  <select
                    value={audience}
                    onChange={e => setAudience(e.target.value as ProductAudience)}
                    disabled={isSaving}
                    className="w-full px-3 py-2.5 bg-[#FAF9F6] rounded-xl border border-sage/20 focus:bg-white focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none transition-all text-brown text-sm font-medium"
                  >
                    <option value="">Cualquiera</option>
                    <option value="Chicos">Chicos</option>
                    <option value="Chicas">Chicas</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>
              </div>

            </div>

          </div>

          {/* ── 2. Customization Section ── */}
          <div className="mt-8 pt-8 border-t border-sage/15">
            <h3 className="text-sm font-bold text-brown uppercase tracking-wider mb-5 flex items-center gap-2">
              <Sparkles size={18} className="text-gold" />
              Opciones de Personalización
            </h3>

            {/* Colores Disponibles */}
            <div className="mb-6 bg-[#FAF9F6] p-5 rounded-2xl border border-sage/10">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-[11px] font-bold text-sage uppercase tracking-wider">
                  Colores Disponibles (Haz clic para seleccionar opciones)
                </label>
                <span className="text-xs text-sage/70 font-medium">
                  {selectedColors.length} seleccionados
                </span>
              </div>

              {/* Pre-set color pills */}
              <div className="flex flex-wrap gap-2 mb-3">
                {PRESET_COLORS.map(item => {
                  const isSelected = selectedColors.includes(item.name);
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => toggleColor(item.name)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-brown text-white shadow-sm ring-2 ring-gold/40'
                          : 'bg-white text-brown/80 border border-sage/20 hover:border-gold/60 hover:bg-gold/5'
                      }`}
                    >
                      <span 
                        className={`w-3 h-3 rounded-full shrink-0 ${item.border ? 'border border-gray-300' : ''}`}
                        style={{ background: item.color }} 
                      />
                      <span>{item.name}</span>
                      {isSelected && <Check size={12} className="text-gold" />}
                    </button>
                  );
                })}
              </div>

              {/* Custom color input */}
              <div className="flex gap-2 items-center mt-3 pt-3 border-t border-sage/10">
                <input
                  type="text"
                  value={newColorInput}
                  onChange={e => setNewColorInput(e.target.value)}
                  onKeyDown={handleAddCustomColor}
                  placeholder="+ Escribe otro color y presiona Enter..."
                  className="flex-1 px-3 py-1.5 bg-white text-xs rounded-lg border border-sage/20 focus:border-gold outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddCustomColor}
                  disabled={!newColorInput.trim()}
                  className="px-3 py-1.5 bg-white hover:bg-sage/10 text-brown text-xs font-semibold rounded-lg border border-sage/20 disabled:opacity-40 transition-colors"
                >
                  Agregar
                </button>
              </div>

              {/* Selected colors chips summary */}
              {selectedColors.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5 items-center">
                  <span className="text-[11px] text-sage font-semibold mr-1">Activos:</span>
                  {selectedColors.map(c => (
                    <span key={c} className="inline-flex items-center gap-1.5 bg-white border border-sage/25 px-2.5 py-0.5 rounded-full text-[11px] font-medium text-brown shadow-2xs">
                      {c}
                      <button 
                        type="button" 
                        onClick={() => removeColor(c)} 
                        className="text-sage hover:text-red-500 font-bold ml-0.5"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Tipos de Flores */}
            <div className="mb-6 bg-[#FAF9F6] p-5 rounded-2xl border border-sage/10">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-[11px] font-bold text-sage uppercase tracking-wider">
                  Tipos de Flores (Haz clic para seleccionar opciones)
                </label>
                <span className="text-xs text-sage/70 font-medium">
                  {selectedFlowers.length} seleccionados
                </span>
              </div>

              {/* Pre-set flower pills */}
              <div className="flex flex-wrap gap-2 mb-3">
                {PRESET_FLOWER_TYPES.map(flowerName => {
                  const isSelected = selectedFlowers.includes(flowerName);
                  return (
                    <button
                      key={flowerName}
                      type="button"
                      onClick={() => toggleFlower(flowerName)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-[#c8a96b] text-white shadow-sm ring-2 ring-gold/40'
                          : 'bg-white text-brown/80 border border-sage/20 hover:border-gold/60 hover:bg-gold/5'
                      }`}
                    >
                      <span>🌸 {flowerName}</span>
                      {isSelected && <Check size={12} className="text-white" />}
                    </button>
                  );
                })}
              </div>

              {/* Custom flower input */}
              <div className="flex gap-2 items-center mt-3 pt-3 border-t border-sage/10">
                <input
                  type="text"
                  value={newFlowerInput}
                  onChange={e => setNewFlowerInput(e.target.value)}
                  onKeyDown={handleAddCustomFlower}
                  placeholder="+ Escribe otro tipo de flor y presiona Enter..."
                  className="flex-1 px-3 py-1.5 bg-white text-xs rounded-lg border border-sage/20 focus:border-gold outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddCustomFlower}
                  disabled={!newFlowerInput.trim()}
                  className="px-3 py-1.5 bg-white hover:bg-sage/10 text-brown text-xs font-semibold rounded-lg border border-sage/20 disabled:opacity-40 transition-colors"
                >
                  Agregar
                </button>
              </div>

              {/* Selected flowers summary */}
              {selectedFlowers.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5 items-center">
                  <span className="text-[11px] text-sage font-semibold mr-1">Activos:</span>
                  {selectedFlowers.map(f => (
                    <span key={f} className="inline-flex items-center gap-1.5 bg-white border border-sage/25 px-2.5 py-0.5 rounded-full text-[11px] font-medium text-brown shadow-2xs">
                      {f}
                      <button 
                        type="button" 
                        onClick={() => removeFlower(f)} 
                        className="text-sage hover:text-red-500 font-bold ml-0.5"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Toggles: Luces, Mariposas, Dedicatoria */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div 
                onClick={() => setAllowsLights(!allowsLights)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  allowsLights ? 'bg-amber-50/50 border-gold shadow-xs' : 'bg-[#FAF9F6] border-sage/15 hover:bg-white'
                }`}
              >
                <div>
                  <p className="text-sm font-bold text-brown">Luces LED</p>
                  <p className="text-[11px] text-sage">Añadir luces decorativas</p>
                </div>
                <div className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 ${allowsLights ? 'bg-[#c8a96b]' : 'bg-sage/30'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${allowsLights ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
              </div>

              <div 
                onClick={() => setAllowsButterfly(!allowsButterfly)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  allowsButterfly ? 'bg-amber-50/50 border-gold shadow-xs' : 'bg-[#FAF9F6] border-sage/15 hover:bg-white'
                }`}
              >
                <div>
                  <p className="text-sm font-bold text-brown">Mariposas</p>
                  <p className="text-[11px] text-sage">Mariposas decorativas</p>
                </div>
                <div className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 ${allowsButterfly ? 'bg-[#c8a96b]' : 'bg-sage/30'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${allowsButterfly ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
              </div>

              <div 
                onClick={() => setAllowsPhraseCard(!allowsPhraseCard)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  allowsPhraseCard ? 'bg-amber-50/50 border-gold shadow-xs' : 'bg-[#FAF9F6] border-sage/15 hover:bg-white'
                }`}
              >
                <div>
                  <p className="text-sm font-bold text-brown">Tarjeta Frase</p>
                  <p className="text-[11px] text-sage">Dedicatoria personalizada</p>
                </div>
                <div className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 ${allowsPhraseCard ? 'bg-[#c8a96b]' : 'bg-sage/30'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${allowsPhraseCard ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* ── 3. Inventario y Visibilidad Debajo Horizontalmente ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Tarjeta de Inventario */}
          <div className="bg-[#FAF8F5] p-6 rounded-[22px] border border-amber-900/10 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-[#c8a96b]/15 text-[#b09355]">
                  <Package size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-brown">Inventario</h3>
                  <p className="text-[11px] text-sage font-medium">Control de stock del producto</p>
                </div>
              </div>

              <label className="block text-[11px] font-bold text-brown/70 mb-2 uppercase tracking-wider">
                {mode === 'edit' ? 'Stock Actual' : 'Stock Inicial'}
              </label>

              <div className="flex gap-3 items-center">
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={stockInput}
                  onChange={e => setStockInput(e.target.value)}
                  disabled={isSaving || isUpdatingStock}
                  className="w-28 px-4 py-2.5 bg-white rounded-xl border border-sage/25 focus:border-gold outline-none text-center font-bold text-brown text-xl"
                  placeholder="0"
                />

                {mode === 'edit' ? (
                  <Button
                    type="button"
                    onClick={handleStockUpdate}
                    disabled={isUpdatingStock || stockInput === initialData?.stock?.toString()}
                    className="bg-[#c8a96b] hover:bg-[#b09355] text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-xs"
                  >
                    {isUpdatingStock ? 'Actualizando...' : 'Actualizar'}
                  </Button>
                ) : (
                  <span className="text-xs text-sage font-medium">unidades para el lanzamiento</span>
                )}
              </div>
            </div>

            <p className="text-xs text-sage leading-relaxed mt-4 pt-3 border-t border-sage/10">
              {mode === 'edit'
                ? 'El stock no afecta directamente la disponibilidad visible en catálogo si tú no la modificas.'
                : 'Define el stock inicial. Podrás ajustarlo libremente tras crear el producto.'}
            </p>
          </div>

          {/* Tarjeta de Visibilidad */}
          <div className={`p-6 rounded-[22px] border transition-all shadow-xs flex flex-col justify-between ${
            currentAvailability 
              ? 'bg-emerald-50/60 border-emerald-200' 
              : 'bg-rose-50/60 border-rose-200'
          }`}>
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2.5 rounded-xl ${
                  currentAvailability ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                }`}>
                  {currentAvailability ? <ArchiveRestore size={20} /> : <ArchiveX size={20} />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-brown">Visibilidad</h3>
                  <p className={`text-[11px] font-medium ${currentAvailability ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {currentAvailability ? 'Visible en la tienda' : 'Oculto para clientes'}
                  </p>
                </div>
              </div>

              <p className={`text-sm font-medium leading-relaxed mb-4 ${
                currentAvailability ? 'text-emerald-900' : 'text-rose-900'
              }`}>
                {currentAvailability 
                  ? 'El producto está VISIBLE en el catálogo y listo para ser comprado.' 
                  : 'El producto está OCULTO. Los clientes no podrán verlo ni comprarlo en la tienda.'}
              </p>
            </div>

            {mode === 'edit' ? (
              <Button
                type="button"
                variant={currentAvailability ? 'outline' : 'primary'}
                onClick={() => setShowAvailabilityModal(true)}
                disabled={isUpdatingAvailability}
                className={`w-full py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  currentAvailability 
                    ? 'border-rose-200 text-rose-600 bg-white hover:bg-rose-50' 
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {currentAvailability ? (
                  <><ArchiveX size={16} /> Ocultar del catálogo</>
                ) : (
                  <><ArchiveRestore size={16} /> Publicar producto</>
                )}
              </Button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentAvailability(!currentAvailability)}
                className={`w-full py-2.5 rounded-xl font-bold text-sm border transition-all ${
                  currentAvailability
                    ? 'bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                    : 'bg-white border-rose-200 text-rose-700 hover:bg-rose-50'
                }`}
              >
                {currentAvailability ? 'Estado: Visible (Clic para ocultar)' : 'Estado: Oculto (Clic para mostrar)'}
              </button>
            )}
          </div>

        </div>

        {/* ── 4. Botones de Acción Finales ── */}
        <div className="flex items-center justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl border-sage/30 text-sage hover:text-brown font-medium"
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={isSaving}
            className="min-w-[200px] bg-[#c8a96b] hover:bg-[#b09355] text-white rounded-xl py-2.5 font-semibold shadow-md transition-all hover:shadow-lg flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <><Loader2 size={16} className="animate-spin" /> Guardando...</>
            ) : (
              <><Save size={16} /> {mode === 'create' ? 'Crear Producto' : 'Guardar Cambios'}</>
            )}
          </Button>
        </div>

      </form>

      {/* ── Modal de Confirmación de Visibilidad (Modo Edit) ── */}
      <Modal 
        isOpen={showAvailabilityModal} 
        onClose={() => setShowAvailabilityModal(false)}
        title={currentAvailability ? '¿Ocultar producto del catálogo?' : '¿Publicar producto en el catálogo?'}
      >
        <div className="space-y-6 pt-2">
          <p className="text-sage text-sm leading-relaxed">
            {currentAvailability 
              ? `El producto "${name || initialData?.name}" dejará de aparecer en la tienda y catálogo público para todos los clientes.` 
              : `El producto "${name || initialData?.name}" volverá a aparecer en el catálogo público y estará disponible para pedidos.`}
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-sage/10">
            <Button 
              variant="outline" 
              onClick={() => setShowAvailabilityModal(false)} 
              disabled={isUpdatingAvailability}
              className="rounded-xl"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleToggleConfirm} 
              disabled={isUpdatingAvailability}
              className={`rounded-xl ${
                currentAvailability 
                  ? 'bg-rose-600 hover:bg-rose-700 text-white' 
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isUpdatingAvailability ? 'Procesando...' : 'Confirmar'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Modal de Previsualización antes de Guardar ── */}
      <Modal 
        isOpen={showPreviewModal} 
        onClose={() => !isSaving && setShowPreviewModal(false)} 
        title="Confirmar cambios del producto" 
        maxWidth="max-w-3xl"
      >
        <div className="space-y-6 pt-2">
          <div className="flex flex-col sm:flex-row gap-6 items-start bg-[#FAF9F6] p-6 rounded-2xl border border-sage/15">
            <div className="w-full sm:w-48 aspect-square relative rounded-xl overflow-hidden bg-white border border-sage/20 shrink-0">
              {previewUrl ? (
                <Image src={getImageUrl(previewUrl)} alt="Preview" fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sage/40">
                  <ImageIcon size={32} />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-2">
              <span className="text-[10px] tracking-wider uppercase text-gold font-bold">
                {categories?.find(c => c.id === categoryId)?.name || 'Catálogo General'}
              </span>
              <h3 className="font-serif text-2xl font-bold text-brown leading-tight">
                {name || 'Nombre no asignado'}
              </h3>
              <p className="text-xl font-bold text-gold font-serif">
                S/ {parseFloat(price || '0').toFixed(2)}
              </p>
              <p className="text-xs text-sage/80 line-clamp-3 leading-relaxed">
                {description || 'Sin descripción ingresada.'}
              </p>

              {(selectedColors.length > 0 || selectedFlowers.length > 0) && (
                <div className="pt-2 flex flex-wrap gap-1">
                  {selectedColors.slice(0, 4).map(c => (
                    <span key={c} className="text-[10px] bg-white border border-sage/20 px-2 py-0.5 rounded-full text-brown">
                      {c}
                    </span>
                  ))}
                  {selectedFlowers.slice(0, 3).map(f => (
                    <span key={f} className="text-[10px] bg-gold/10 text-brown px-2 py-0.5 rounded-full">
                      🌸 {f}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-sage/10">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowPreviewModal(false)} 
              disabled={isSaving}
              className="rounded-xl"
            >
              Volver a editar
            </Button>
            <Button 
              type="button" 
              onClick={executeSave} 
              disabled={isSaving} 
              className="bg-[#c8a96b] hover:bg-[#b09355] text-white rounded-xl px-6 font-semibold shadow-md"
            >
              {isSaving ? (
                <><Loader2 size={16} className="mr-2 animate-spin" /> Guardando...</>
              ) : (
                <><Save size={16} className="mr-2" /> Confirmar y Guardar</>
              )}
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
