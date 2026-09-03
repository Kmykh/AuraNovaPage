"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useProduct } from '@/hooks/use-product';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { formatCurrency, getImageUrl } from '@/lib/formatters';
import { ArrowLeft, PackageOpen, ShoppingBag } from 'lucide-react';
import { ApiProblemDetails } from '@/lib/api-errors';
import { useCartStore } from '@/store/cart.store';
import { toast } from 'sonner';

interface ProductDetailClientProps {
  id: string;
}

export function ProductDetailClient({ id }: ProductDetailClientProps) {
  const { data: product, isLoading, error, refetch } = useProduct(id);
  const addItem = useCartStore(state => state.addItem);

  const [selectedPrimaryColor, setSelectedPrimaryColor] = useState<string>('');
  const [selectedSecondaryColor, setSelectedSecondaryColor] = useState<string>('');
  const [selectedFlowerType, setSelectedFlowerType] = useState<string>('');
  const [selectedFlowerColor, setSelectedFlowerColor] = useState<string>('');
  const [hasLights, setHasLights] = useState(false);
  const [hasButterfly, setHasButterfly] = useState(false);
  const [hasPhraseCard, setHasPhraseCard] = useState(false);
  const [phraseText, setPhraseText] = useState('');
  const [phraseFont, setPhraseFont] = useState('Elegante/Cursiva');

  useEffect(() => {
    if (product) {
      if (product.availableColors && product.availableColors.length > 0) {
        setSelectedPrimaryColor(product.availableColors[0]);
      }
      if (product.availableFlowerTypes && product.availableFlowerTypes.length > 0) {
        setSelectedFlowerType(product.availableFlowerTypes[0]);
      }
    }
  }, [product]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 animate-pulse">
        <Skeleton variant="card" className="h-[500px] md:h-[700px] w-full rounded-2xl" />
        <div className="flex flex-col pt-4 md:pt-12">
          <Skeleton variant="text" className="w-3/4 h-12 mb-6" />
          <Skeleton variant="text" className="w-1/4 h-8 mb-10" />
          <Skeleton variant="text" className="w-full h-4 mb-3" />
          <Skeleton variant="text" className="w-full h-4 mb-3" />
          <Skeleton variant="text" className="w-4/5 h-4 mb-12" />
          <Skeleton variant="rect" className="w-full h-14 rounded-full" />
        </div>
      </div>
    );
  }

  if (error) {
    const isNotFound = error instanceof ApiProblemDetails && error.status === 404;
    return (
      <div className="py-12">
        {isNotFound ? (
          <div className="flex flex-col items-center text-center p-8 bg-[#F9F8F6] rounded-2xl border border-sage/10 min-h-[300px]">
            <PackageOpen className="h-16 w-16 text-sage/40 mb-4" strokeWidth={1} />
            <h3 className="text-xl font-serif font-semibold text-brown mb-2">Joya floral no encontrada</h3>
            <p className="text-sage mb-6">El detalle que buscas no existe o ya no está disponible en nuestro catálogo.</p>
            <Link href="/productos" tabIndex={-1}>
              <Button variant="outline" className="rounded-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a la colección
              </Button>
            </Link>
          </div>
        ) : (
          <ErrorState 
            title="No pudimos cargar el producto" 
            message="Hubo un inconveniente conectando con nuestro sistema."
            onRetry={() => refetch()} 
          />
        )}
      </div>
    );
  }

  if (!product) return null;

  const isOutOfStock = !product.isAvailable || product.stock <= 0;
  const isLowStock = !isOutOfStock && product.stock > 0 && product.stock <= 3;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    
    if (hasPhraseCard && !phraseText.trim()) {
      toast.error('Falta la dedicatoria', {
        description: 'Por favor, escribe una frase para la tarjeta o desmarca la opción.'
      });
      return;
    }
    
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: getImageUrl(product.imageUrl),
      stock: product.stock,
      isAvailable: product.isAvailable,
      selectedPrimaryColor: product.availableColors?.length > 0 ? selectedPrimaryColor : undefined,
      selectedSecondaryColor: product.availableColors?.length > 0 ? selectedSecondaryColor : undefined,
      selectedFlowerType: product.availableFlowerTypes?.length > 0 ? selectedFlowerType : undefined,
      selectedFlowerColor: product.availableFlowerTypes?.length > 0 ? selectedFlowerColor : undefined,
      hasLights: product.allowsLights ? hasLights : undefined,
      hasButterfly: product.allowsButterfly ? hasButterfly : undefined,
      hasPhraseCard: product.allowsPhraseCard ? hasPhraseCard : undefined,
      phraseText: hasPhraseCard ? phraseText : undefined,
      phraseFont: hasPhraseCard ? phraseFont : undefined,
    });
    
    toast.success('Detalle agregado al carrito', {
      description: product.name,
      icon: <ShoppingBag className="h-4 w-4" />
    });
  };

  return (
    <div className="relative">
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 opacity-[0.03] pointer-events-none -z-10 -translate-y-10 translate-x-10">
        <Image src="/images/angeles.png" alt="" fill className="object-contain" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-center mt-6 max-w-7xl mx-auto px-4 md:px-8">
        {/* Image Column */}
        <div className="relative aspect-[4/5] w-full rounded-[2rem] overflow-hidden bg-white shadow-[0_20px_50px_rgba(74,57,51,0.08)] group border border-[#c8a96b]/10 p-2 md:p-4">
          <div className="relative w-full h-full rounded-[1.5rem] overflow-hidden">
            {product.imageUrl ? (
              <Image
                src={getImageUrl(product.imageUrl)}
                alt={`Imagen de ${product.name}`}
                fill
                className="object-cover object-center transition-transform duration-[2s] ease-out group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-[#887870]/40">
                <PackageOpen size={64} strokeWidth={1} />
              </div>
            )}
            {/* Soft inner shadow */}
            <div className="absolute inset-0 rounded-[1.5rem] shadow-[inset_0_0_20px_rgba(0,0,0,0.05)] pointer-events-none" />
          </div>
        </div>

        {/* Info Column */}
        <div className="flex flex-col justify-center py-4 md:py-10">
          <div className="mb-8 flex flex-col gap-5">
            <div className="flex flex-wrap gap-2">
              {isOutOfStock ? (
                <span className="bg-red-50 text-red-600 text-[10px] uppercase tracking-[0.2em] font-bold px-4 py-2 rounded-full border border-red-100 shadow-sm">
                  Agotado
                </span>
              ) : isLowStock ? (
                <span className="bg-gradient-to-r from-[#c8a96b]/20 to-[#e2cba0]/20 text-[#c8a96b] text-[10px] uppercase tracking-[0.2em] font-bold px-4 py-2 rounded-full border border-[#c8a96b]/20 shadow-sm">
                  Últimas {product.stock} unidades
                </span>
              ) : (
                <span className="bg-green-50 text-green-700 text-[10px] uppercase tracking-[0.2em] font-bold px-4 py-2 rounded-full border border-green-100 shadow-sm">
                  Disponible
                </span>
              )}
            </div>
            
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-light text-[#4a3933] leading-[1.1] tracking-tight">
              {product.name}
            </h1>
            
            <div className="text-3xl lg:text-4xl font-light text-[#c8a96b] mt-2 font-serif italic tracking-wide">
              {formatCurrency(product.price)}
            </div>
          </div>
          
          <div className="flex items-center gap-4 mb-8">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#c8a96b]/60" />
            <span className="text-[#c8a96b] text-sm animate-pulse">✨</span>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#c8a96b]/60" />
          </div>

          <div className="prose prose-sage mb-8">
            <p className="text-[#887870] leading-[2] whitespace-pre-wrap font-medium tracking-wide text-base md:text-lg">
              {product.description}
            </p>
          </div>

          {/* --- Opciones de Personalización --- */}
          <div className="space-y-6 mb-12">
            {product.availableColors && product.availableColors.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#887870] uppercase tracking-widest mb-2">Color Principal</label>
                  <select 
                    value={selectedPrimaryColor} 
                    onChange={e => setSelectedPrimaryColor(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-sage/20 text-[#4a3933] text-sm focus:outline-none focus:border-gold bg-[#FFFDF8]"
                  >
                    {product.availableColors.map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#887870] uppercase tracking-widest mb-2">Color Secundario</label>
                  <select 
                    value={selectedSecondaryColor} 
                    onChange={e => setSelectedSecondaryColor(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-sage/20 text-[#4a3933] text-sm focus:outline-none focus:border-gold bg-[#FFFDF8]"
                  >
                    <option value="">Ninguno</option>
                    {product.availableColors.map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {product.availableFlowerTypes && product.availableFlowerTypes.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#887870] uppercase tracking-widest mb-2">Tipo de Flor</label>
                  <select 
                    value={selectedFlowerType} 
                    onChange={e => setSelectedFlowerType(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-sage/20 text-[#4a3933] text-sm focus:outline-none focus:border-gold bg-[#FFFDF8]"
                  >
                    {product.availableFlowerTypes.map(flower => (
                      <option key={flower} value={flower}>{flower}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#887870] uppercase tracking-widest mb-2">Color de Flor</label>
                  <input 
                    type="text"
                    value={selectedFlowerColor}
                    onChange={e => setSelectedFlowerColor(e.target.value)}
                    placeholder="Ej. Rojo intenso"
                    className="w-full h-11 px-4 rounded-xl border border-sage/20 text-[#4a3933] text-sm focus:outline-none focus:border-gold bg-[#FFFDF8]"
                  />
                </div>
              </div>
            )}

            {(product.allowsLights || product.allowsButterfly) && (
              <div className="flex flex-wrap gap-6 pt-2">
                {product.allowsLights && (
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${hasLights ? 'bg-gold border-gold' : 'border-sage/40 group-hover:border-gold'}`}>
                      {hasLights && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <input type="checkbox" className="hidden" checked={hasLights} onChange={e => setHasLights(e.target.checked)} />
                    <span className="text-sm font-medium text-[#4a3933]">Añadir Luces</span>
                  </label>
                )}
                
                {product.allowsButterfly && (
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${hasButterfly ? 'bg-gold border-gold' : 'border-sage/40 group-hover:border-gold'}`}>
                      {hasButterfly && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <input type="checkbox" className="hidden" checked={hasButterfly} onChange={e => setHasButterfly(e.target.checked)} />
                    <span className="text-sm font-medium text-[#4a3933]">Añadir Mariposas</span>
                  </label>
                )}
              </div>
            )}

            {product.allowsPhraseCard && (
              <div className="border border-sage/20 rounded-2xl overflow-hidden bg-[#FFFDF8] transition-all">
                <label className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gold/5 transition-colors">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${hasPhraseCard ? 'bg-gold border-gold' : 'border-sage/40'}`}>
                    {hasPhraseCard && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <input type="checkbox" className="hidden" checked={hasPhraseCard} onChange={e => {
                    setHasPhraseCard(e.target.checked);
                    if (!e.target.checked) setPhraseText('');
                  }} />
                  <span className="text-sm font-bold text-[#4a3933]">Incluir Tarjeta con Dedicatoria</span>
                </label>
                
                {hasPhraseCard && (
                  <div className="p-4 pt-0 border-t border-sage/10 space-y-4 animate-in slide-in-from-top-2 duration-300 mt-2">
                    <div>
                      <label className="block text-xs font-bold text-[#887870] uppercase tracking-widest mb-2">Tu Frase (Máx 150 car.)</label>
                      <textarea
                        value={phraseText}
                        onChange={e => setPhraseText(e.target.value.slice(0, 150))}
                        placeholder="Escribe algo hermoso aquí..."
                        className="w-full p-3 rounded-xl border border-sage/20 text-[#4a3933] text-sm focus:outline-none focus:border-gold resize-none h-20 bg-white"
                      />
                      <div className="text-right text-[10px] text-sage font-medium mt-1">{phraseText.length}/150</div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#887870] uppercase tracking-widest mb-2">Tipografía</label>
                      <select 
                        value={phraseFont} 
                        onChange={e => setPhraseFont(e.target.value)}
                        className="w-full h-11 px-4 rounded-xl border border-sage/20 text-[#4a3933] text-sm focus:outline-none focus:border-gold bg-white"
                      >
                        <option value="Elegante/Cursiva">Elegante / Cursiva</option>
                        <option value="Clásica">Clásica / Serif</option>
                        <option value="Moderna">Moderna / Sans-serif</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* --- Fin Opciones de Personalización --- */}

          <div className="mt-auto space-y-5">
            <Button 
              size="lg" 
              className="w-full text-lg rounded-full bg-[#c8a96b] hover:bg-[#b59555] text-white shadow-[0_8px_30px_rgba(200,169,107,0.2)] transition-all hover:-translate-y-1 h-14 border-none font-serif italic" 
              disabled={isOutOfStock}
              onClick={handleAddToCart}
            >
              {isOutOfStock ? 'No disponible temporalmente' : (
                <div className="flex items-center justify-center gap-3">
                  <ShoppingBag className="h-5 w-5" />
                  <span>Agregar al carrito</span>
                </div>
              )}
            </Button>
            
            <p className="text-[11px] text-center text-[#887870] uppercase tracking-[0.2em] font-bold mt-6">
              Detalles únicos y eternos, creados con amor.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
