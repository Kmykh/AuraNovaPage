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

import estatuoImg from '../../images/estatuo.png';
import nubeImg from '../../images/nube2.png';
import florImg from '../../images/flowera.png';
import flortalloImg from '../../images/flortallo.png';
import angelesImg from '../../images/angeles.png';

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
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isPhraseModalOpen, setIsPhraseModalOpen] = useState(false);

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
      <div className="pt-24 md:pt-32 max-w-7xl mx-auto px-4 md:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-[40%_60%] gap-10 lg:gap-16 animate-pulse">
          <div className="flex justify-center md:justify-end">
            <Skeleton variant="card" className="aspect-[4/5] w-full max-w-[400px] rounded-2xl md:rounded-[2rem]" />
          </div>
          <div className="flex flex-col pt-4">
            <Skeleton variant="text" className="w-2/3 h-14 mb-3 rounded-xl" />
            <Skeleton variant="text" className="w-1/3 h-10 mb-8 rounded-xl" />
            <Skeleton variant="text" className="w-full h-3 mb-2 rounded-full" />
            <Skeleton variant="text" className="w-4/5 h-3 mb-8 rounded-full" />
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <Skeleton variant="text" className="w-1/2 h-3 mb-3 rounded-full" />
                <div className="flex gap-2">
                  <Skeleton variant="rect" className="w-16 h-8 rounded-full" />
                  <Skeleton variant="rect" className="w-16 h-8 rounded-full" />
                </div>
              </div>
              <div>
                <Skeleton variant="text" className="w-1/2 h-3 mb-3 rounded-full" />
                <div className="flex gap-2">
                  <Skeleton variant="rect" className="w-16 h-8 rounded-full" />
                  <Skeleton variant="rect" className="w-16 h-8 rounded-full" />
                </div>
              </div>
            </div>
            <Skeleton variant="rect" className="w-full h-12 rounded-full mt-auto" />
          </div>
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
    <div className="relative overflow-hidden">
      {/* Float Animations & Masks */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes floatGentle {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-14px); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .detail-float-gentle { animation: floatGentle 6s ease-in-out infinite; }
        .detail-float-slow { animation: floatSlow 9s ease-in-out infinite; }
        .detail-vignette {
          mask-image: radial-gradient(ellipse at center, black 30%, transparent 75%);
          -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 75%);
        }
        `
      }} />

      {/* ── Global Page Decorations ── */}
      {/* Angeles top-right background */}
      <div className="absolute -top-8 right-0 translate-x-1/4 w-72 md:w-[28rem] opacity-[0.07] pointer-events-none mix-blend-multiply detail-vignette -rotate-12">
        <Image src={angelesImg} alt="" className="w-full h-full object-contain" />
      </div>
      {/* Statue bottom-right */}
      <div className="absolute bottom-0 right-0 translate-x-1/6 translate-y-1/6 w-52 md:w-80 opacity-[0.65] pointer-events-none mix-blend-multiply detail-vignette detail-float-slow hidden md:block">
        <Image src={estatuoImg} alt="" className="w-full h-full object-contain" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[42%_58%] gap-8 lg:gap-14 items-center pt-20 md:pt-28 max-w-7xl mx-auto px-4 md:px-8 pb-10 relative z-10 min-h-[calc(100vh-5rem)]">
        {/* Image Column */}
        <div className="relative w-full flex justify-center">
          <div className="relative aspect-[3/4] w-full max-w-[420px] rounded-2xl md:rounded-[2rem] overflow-hidden bg-[#F9F8F6] shadow-[0_8px_40px_rgba(74,57,51,0.08)]">
            {product.imageUrl ? (
              <Image
                src={getImageUrl(product.imageUrl)}
                alt={`Imagen de ${product.name}`}
                fill
                className="object-cover object-center transition-transform duration-[2s] ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:scale-105"
                sizes="(max-width: 768px) 100vw, 42vw"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-[#887870]/40">
                <PackageOpen size={64} strokeWidth={1} />
              </div>
            )}
          </div>
        </div>

        {/* Info Column */}
        <div className="flex flex-col justify-center relative">
          
          {/* Inline Decorative Images */}
          <div className="absolute -top-10 right-0 w-44 md:w-64 opacity-60 pointer-events-none mix-blend-multiply detail-vignette detail-float-gentle">
            <Image src={nubeImg} alt="" className="w-full h-full object-contain" />
          </div>
          <div className="absolute top-8 right-8 md:right-16 w-20 md:w-28 opacity-35 pointer-events-none mix-blend-multiply detail-float-slow rotate-12 detail-vignette">
            <Image src={florImg} alt="" className="w-full h-full object-contain" />
          </div>
          <div className="absolute bottom-4 left-0 w-28 md:w-40 opacity-25 pointer-events-none mix-blend-multiply detail-float-gentle -translate-x-1/4 detail-vignette hidden md:block">
            <Image src={flortalloImg} alt="" className="w-full h-full object-contain" />
          </div>

          {/* Title + Price Row */}
          <div className="mb-5 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between md:gap-6">
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-[#4a3933] leading-[1.05] tracking-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-3 mt-2 md:mt-0 shrink-0">
                <span className="text-3xl md:text-4xl font-serif text-[#4a3933] tracking-wide font-bold whitespace-nowrap">
                  {formatCurrency(product.price)}
                </span>
                {isOutOfStock ? (
                  <span className="bg-red-50 text-red-600 text-[9px] uppercase tracking-[0.15em] font-bold px-2.5 py-1 rounded-full border border-red-100">
                    Agotado
                  </span>
                ) : isLowStock ? (
                  <span className="bg-[#c8a96b]/10 text-[#c8a96b] text-[9px] uppercase tracking-[0.15em] font-bold px-2.5 py-1 rounded-full border border-[#c8a96b]/20">
                    Últimas {product.stock}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="w-12 h-px bg-[#c8a96b]/40 mt-3" />
          </div>

          {/* Description */}
          <div className="mb-5 relative">
            <div className={`overflow-hidden transition-all duration-500 relative ${isDescriptionExpanded ? '' : 'max-h-[60px]'}`}>
              <p className="text-[#887870] leading-[1.7] whitespace-pre-wrap font-medium text-sm">
                {product.description}
              </p>
              {!isDescriptionExpanded && ((product.description?.length ?? 0) > 100) && (
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#faf7f2] to-transparent pointer-events-none" />
              )}
            </div>
            {(product.description?.length ?? 0) > 100 && (
              <button 
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="mt-2 text-[10px] font-bold uppercase tracking-widest text-[#c8a96b] hover:text-[#4a3933] transition-colors flex items-center gap-1"
              >
                {isDescriptionExpanded ? 'Ver menos' : 'Ver más'}
                <svg className={`w-3 h-3 transition-transform duration-300 ${isDescriptionExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
          </div>

          {/* --- Opciones de Personalización --- */}
          <div className="space-y-5 mb-6">
            {product.availableColors && product.availableColors.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-[#887870] uppercase tracking-widest mb-2.5">Color Principal</label>
                  <div className="flex flex-wrap gap-2">
                    {product.availableColors.map(color => (
                      <button
                        key={color}
                        onClick={() => setSelectedPrimaryColor(color)}
                        className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 border ${selectedPrimaryColor === color ? 'bg-[#4a3933] text-white border-[#4a3933]' : 'bg-transparent text-[#887870] border-sage/30 hover:border-[#4a3933]/40'}`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#887870] uppercase tracking-widest mb-2.5">Color Secundario</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedSecondaryColor('')}
                      className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 border ${selectedSecondaryColor === '' ? 'bg-[#4a3933] text-white border-[#4a3933]' : 'bg-transparent text-[#887870] border-sage/30 hover:border-[#4a3933]/40'}`}
                    >
                      Ninguno
                    </button>
                    {product.availableColors.map(color => (
                      <button
                        key={color}
                        onClick={() => setSelectedSecondaryColor(color)}
                        className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 border ${selectedSecondaryColor === color ? 'bg-[#4a3933] text-white border-[#4a3933]' : 'bg-transparent text-[#887870] border-sage/30 hover:border-[#4a3933]/40'}`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {product.availableFlowerTypes && product.availableFlowerTypes.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-[#887870] uppercase tracking-widest mb-2.5">Tipo de Flor</label>
                  <div className="flex flex-wrap gap-2">
                    {product.availableFlowerTypes.map(flower => (
                      <button
                        key={flower}
                        onClick={() => setSelectedFlowerType(flower)}
                        className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 border ${selectedFlowerType === flower ? 'bg-[#4a3933] text-white border-[#4a3933]' : 'bg-transparent text-[#887870] border-sage/30 hover:border-[#4a3933]/40'}`}
                      >
                        {flower}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#887870] uppercase tracking-widest mb-2.5">Color de Flor</label>
                  <input 
                    type="text"
                    value={selectedFlowerColor}
                    onChange={e => setSelectedFlowerColor(e.target.value)}
                    placeholder="Ej. Rojo intenso"
                    className="w-full h-9 px-4 rounded-full border border-sage/30 text-[#4a3933] text-xs font-medium focus:outline-none focus:border-[#4a3933] bg-transparent transition-all duration-300 placeholder:text-sage/40 placeholder:font-normal"
                  />
                </div>
              </div>
            )}

            {(product.allowsLights || product.allowsButterfly) && (
              <div className="flex flex-col sm:flex-row gap-5 pt-1">
                {product.allowsLights && (
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <div className={`w-4 h-4 rounded-[3px] border flex items-center justify-center transition-colors ${hasLights ? 'bg-[#4a3933] border-[#4a3933]' : 'border-sage/40 group-hover:border-[#4a3933]'}`}>
                      {hasLights && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <input type="checkbox" className="hidden" checked={hasLights} onChange={e => setHasLights(e.target.checked)} />
                    <span className={`text-sm font-medium transition-colors ${hasLights ? 'text-[#4a3933]' : 'text-[#887870]'}`}>Añadir Luces</span>
                  </label>
                )}
                
                {product.allowsButterfly && (
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <div className={`w-4 h-4 rounded-[3px] border flex items-center justify-center transition-colors ${hasButterfly ? 'bg-[#4a3933] border-[#4a3933]' : 'border-sage/40 group-hover:border-[#4a3933]'}`}>
                      {hasButterfly && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <input type="checkbox" className="hidden" checked={hasButterfly} onChange={e => setHasButterfly(e.target.checked)} />
                    <span className={`text-sm font-medium transition-colors ${hasButterfly ? 'text-[#4a3933]' : 'text-[#887870]'}`}>Añadir Mariposas</span>
                  </label>
                )}
              </div>
            )}

            {product.allowsPhraseCard && (
              <div className="pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer group w-fit mb-3">
                  <div className={`w-4 h-4 rounded-[3px] border flex items-center justify-center transition-colors ${hasPhraseCard ? 'bg-[#4a3933] border-[#4a3933]' : 'border-sage/40 group-hover:border-[#4a3933]'}`}>
                    {hasPhraseCard && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <input type="checkbox" className="hidden" checked={hasPhraseCard} onChange={e => {
                    const isChecked = e.target.checked;
                    setHasPhraseCard(isChecked);
                    if (isChecked && !phraseText) {
                      setIsPhraseModalOpen(true);
                    }
                    if (!isChecked) setPhraseText('');
                  }} />
                  <span className={`text-sm font-medium transition-colors ${hasPhraseCard ? 'text-[#4a3933]' : 'text-[#887870]'}`}>Incluir Tarjeta con Dedicatoria</span>
                </label>

                {hasPhraseCard && (
                  <div className="pl-6 animate-in slide-in-from-top-2 fade-in duration-300">
                    {phraseText.trim() ? (
                      <div className="p-4 rounded-xl border border-sage/20 bg-white/40 flex flex-col items-start gap-3 relative overflow-hidden group">
                        <p className={`text-[#4a3933] w-full break-words ${
                          phraseFont === 'Elegante/Cursiva' ? 'font-serif italic text-lg' :
                          phraseFont === 'Clásica' ? 'font-serif text-sm' :
                          'font-sans font-light text-sm'
                        }`}>
                          "{phraseText}"
                        </p>
                        <button
                          onClick={() => setIsPhraseModalOpen(true)}
                          className="text-[10px] font-bold uppercase tracking-widest text-[#c8a96b] hover:text-[#4a3933] transition-colors flex items-center gap-1.5"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          Editar dedicatoria
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsPhraseModalOpen(true)}
                        className="px-4 py-2 rounded-full border border-[#c8a96b] text-[#c8a96b] text-xs font-medium hover:bg-[#c8a96b] hover:text-white transition-all flex items-center gap-2"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Escribir mensaje
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          {/* --- Fin Opciones de Personalización --- */}

          {/* Phrase Card Modal */}
          {isPhraseModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setIsPhraseModalOpen(false)}>
              <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
              <div 
                className="relative bg-[#faf7f2] rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-8 md:p-10"
                onClick={e => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={() => setIsPhraseModalOpen(false)}
                  className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-[#887870] hover:text-[#4a3933] hover:bg-[#4a3933]/5 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <h3 className="font-serif text-2xl font-bold text-[#4a3933] mb-1">Tarjeta con Dedicatoria</h3>
                <p className="text-xs text-[#887870] mb-6">Escribe un mensaje especial para acompañar tu detalle.</p>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-[#887870] uppercase tracking-widest mb-2 flex justify-between">
                      <span>Tu Frase</span>
                      <span className="text-sage/60 font-medium">{phraseText.length}/150</span>
                    </label>
                    <textarea
                      value={phraseText}
                      onChange={e => setPhraseText(e.target.value.slice(0, 150))}
                      placeholder="Escribe algo hermoso aquí..."
                      className="w-full p-4 rounded-2xl border border-sage/20 text-[#4a3933] text-sm font-medium focus:outline-none focus:border-[#4a3933] resize-none h-28 bg-white/50 transition-all duration-300 placeholder:text-sage/40 placeholder:font-normal"
                      autoFocus
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-[#887870] uppercase tracking-widest mb-3">Tipografía</label>
                    <div className="flex flex-wrap gap-2">
                      {['Elegante/Cursiva', 'Clásica', 'Moderna'].map(font => (
                        <button
                          key={font}
                          onClick={() => setPhraseFont(font)}
                          className={`px-5 py-2 rounded-full text-xs font-medium transition-all duration-300 border ${phraseFont === font ? 'bg-[#4a3933] text-white border-[#4a3933]' : 'bg-transparent text-[#887870] border-sage/20 hover:border-[#4a3933]/40'}`}
                        >
                          {font.split('/')[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Live Preview */}
                  <div className="p-6 rounded-2xl border border-sage/10 bg-white/60 relative overflow-hidden">
                    <div className="flex flex-col items-center justify-center min-h-[100px] text-center">
                      <span className="text-[9px] text-sage uppercase tracking-[0.3em] font-bold mb-4">Vista Previa</span>
                      {phraseText.trim() ? (
                        <p className={`text-xl text-[#4a3933] px-4 break-words w-full leading-relaxed ${
                          phraseFont === 'Elegante/Cursiva' ? 'font-serif italic text-2xl' :
                          phraseFont === 'Clásica' ? 'font-serif' :
                          'font-sans font-light tracking-wide'
                        }`}>
                          &ldquo;{phraseText}&rdquo;
                        </p>
                      ) : (
                        <p className="text-sm text-sage/40 italic font-serif">Tu dedicatoria aparecerá aquí...</p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setIsPhraseModalOpen(false)}
                    className="w-full h-11 rounded-full bg-[#4a3933] text-white text-sm font-serif font-medium tracking-wide hover:bg-[#3a2d28] transition-all"
                  >
                    Listo
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-auto space-y-4 pt-6">
            <Button 
              size="lg" 
              className="w-full text-base rounded-full bg-[#c8a96b] hover:bg-[#b59555] text-white shadow-[0_8px_30px_rgba(200,169,107,0.2)] transition-all hover:-translate-y-1 h-12 border-none font-serif italic" 
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
