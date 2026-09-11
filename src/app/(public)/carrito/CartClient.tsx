"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/cart.store';
import { useMounted } from '@/hooks/use-mounted';
import { formatCurrency } from '@/lib/formatters';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { PackageOpen, Trash2, Plus, Minus, Info, ArrowRight, Truck, Sparkles, Mail, Palette, Flower2 } from 'lucide-react';
import { toast } from 'sonner';

import flo1 from '../images/flo1.png';
import flo2 from '../images/flo2.png';
import flowera from '../images/flowera.png';

export function CartClient() {
  const isMounted = useMounted();
  const { items, updateQuantity, removeItem, clearCart, getSubtotal } = useCartStore();
  
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  // Prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="w-full flex justify-center py-20">
        <div className="h-8 w-8 border-4 border-sage/20 border-t-gold rounded-full animate-spin"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="relative w-full flex flex-col items-center justify-center py-32 overflow-hidden rounded-3xl bg-cream/30 border border-sage/10">
        <div className="absolute top-0 right-10 w-[200px] opacity-20 pointer-events-none animate-float-gentle mix-blend-multiply">
          <Image src={flo1} alt="" width={200} height={200} />
        </div>
        <div className="absolute bottom-0 left-10 w-[150px] opacity-30 pointer-events-none animate-float-delayed mix-blend-multiply">
          <Image src={flo2} alt="" width={150} height={150} />
        </div>
        <div className="relative z-10 bg-white/70 backdrop-blur-xl p-12 rounded-[4rem] text-center max-w-lg shadow-[0_20px_50px_-15px_rgba(89,72,61,0.1)] border border-white flex flex-col items-center">
          <PackageOpen className="h-16 w-16 text-gold/60 mb-6" strokeWidth={1} />
          <h2 className="font-serif text-4xl font-bold text-brown mb-4">Tu carrito <span className="italic font-light text-sage">está vacío</span></h2>
          <p className="text-sage mb-8">Descubre nuestros detalles y encuentra algo especial para esa persona importante.</p>
          <Link href="/productos" tabIndex={-1} className="group relative inline-flex items-center justify-center px-8 py-3.5 font-serif text-lg italic text-white transition-all duration-300 ease-in-out bg-brown rounded-full hover:bg-brown/90 hover:scale-105 shadow-lg shadow-brown/20 overflow-hidden">
            <span className="relative flex items-center gap-3">
              Explorar Catálogo
              <ArrowRight size={18} className="transition-transform duration-300 ease-out group-hover:translate-x-1.5 text-gold" />
            </span>
          </Link>
        </div>
      </div>
    );
  }

  const handleDecreaseQuantity = (cartItemId: string, currentQuantity: number, name: string) => {
    if (currentQuantity <= 1) {
      removeItem(cartItemId);
      toast.success('Producto eliminado del carrito', { description: name, icon: <Trash2 className="h-4 w-4" /> });
    } else {
      updateQuantity(cartItemId, currentQuantity - 1);
    }
  };

  const handleIncreaseQuantity = (cartItemId: string, currentQuantity: number, stock: number) => {
    if (currentQuantity < stock) {
      updateQuantity(cartItemId, currentQuantity + 1);
    } else {
      toast.warning('No hay más stock disponible', { description: 'Has alcanzado el límite para este producto.' });
    }
  };

  const handleRemoveItem = (cartItemId: string, name: string) => {
    removeItem(cartItemId);
    toast.success('Producto eliminado del carrito', { description: name, icon: <Trash2 className="h-4 w-4" /> });
  };

  const handleClearCart = () => {
    clearCart();
    setIsClearModalOpen(false);
    toast.success('El carrito ha sido vaciado');
  };

  const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);
  const subtotal = getSubtotal();

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 relative z-10 w-full items-start">
        
        {/* Cart Items List */}
        <div className="flex-1 w-full">
          
          {/* Header de la lista de productos */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-sage/15">
            <span className="text-[11px] font-serif uppercase tracking-[0.2em] text-[#887870] font-bold">
              Detalles en tu bolsa ({totalItems})
            </span>
            <button 
              onClick={() => setIsClearModalOpen(true)}
              className="text-[11px] text-rose-500 hover:text-rose-700 font-medium flex items-center gap-1.5 transition-colors py-1 px-2.5 rounded-full hover:bg-rose-50"
            >
              <Trash2 size={13} />
              <span>Vaciar bolsa</span>
            </button>
          </div>

          <div className="flex flex-col gap-4 sm:gap-5">
            {items.map((item) => {
              const isUnavailable = !item.isAvailable;
              return (
                <div 
                  key={item.cartItemId || item.productId} 
                  className={`group relative bg-white/90 backdrop-blur-xl rounded-[2.2rem] p-5 sm:p-6 shadow-[0_10px_30px_-8px_rgba(200,169,107,0.08)] border border-white/80 hover:border-[#c8a96b]/30 hover:shadow-[0_16px_40px_-10px_rgba(200,169,107,0.16)] flex flex-col sm:flex-row gap-5 sm:gap-6 items-start sm:items-center transition-all duration-300 ${isUnavailable ? 'opacity-60' : ''}`}
                >
                  
                  {/* Image */}
                  <div className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-2xl overflow-hidden bg-[#faf7f2] border border-[#e8dcdc]/60 flex-shrink-0 shadow-xs">
                    {item.imageUrl ? (
                      <Image 
                        src={item.imageUrl} 
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-[#d38b8b]/40">
                        <PackageOpen size={32} strokeWidth={1} />
                      </div>
                    )}
                  </div>
                  
                  {/* Product Details */}
                  <div className="flex-1 w-full min-w-0 flex flex-col justify-between h-full">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
                      <div>
                        <Link href={`/productos/${item.productId}`} className="focus:outline-none">
                          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#4a3933] hover:text-[#c8a96b] transition-colors leading-snug">
                            {item.name}
                          </h3>
                        </Link>
                        <p className="text-xs text-[#887870] font-medium mt-0.5">
                          {formatCurrency(item.price)} <span className="font-normal opacity-70">c/u</span>
                        </p>
                        
                        {/* Customization Details Showcase */}
                        {(item.selectedPrimaryColor || item.selectedSecondaryColor || item.selectedFlowerType || item.selectedFlowerColor || item.hasLights || item.hasButterfly || item.hasPhraseCard || item.phraseText) && (
                          <div className="mt-3 space-y-2">
                            {/* Chips Grid */}
                            <div className="flex flex-wrap gap-1.5">
                              {item.selectedPrimaryColor && (
                                <span className="inline-flex items-center gap-1.5 bg-[#fcf9f2] text-[#8f6d28] border border-[#c8a96b]/30 text-[11px] font-medium px-2.5 py-1 rounded-full shadow-2xs">
                                  <span className="w-2 h-2 rounded-full bg-[#c8a96b] shadow-2xs" />
                                  <span className="opacity-75 font-normal">Base:</span> {item.selectedPrimaryColor}
                                </span>
                              )}
                              {item.selectedSecondaryColor && (
                                <span className="inline-flex items-center gap-1.5 bg-[#fcf9f2] text-[#8f6d28] border border-[#c8a96b]/30 text-[11px] font-medium px-2.5 py-1 rounded-full shadow-2xs">
                                  <Palette className="w-3 h-3 text-[#c8a96b]" />
                                  <span className="opacity-75 font-normal">Secundario:</span> {item.selectedSecondaryColor}
                                </span>
                              )}
                              {item.selectedFlowerType && (
                                <span className="inline-flex items-center gap-1.5 bg-[#fcf9f2] text-[#8f6d28] border border-[#c8a96b]/30 text-[11px] font-medium px-2.5 py-1 rounded-full shadow-2xs">
                                  <Flower2 className="w-3 h-3 text-[#d38b8b]" />
                                  <span className="opacity-75 font-normal">Flor:</span> {item.selectedFlowerType}
                                </span>
                              )}
                              {item.selectedFlowerColor && (
                                <span className="inline-flex items-center gap-1.5 bg-[#fcf9f2] text-[#8f6d28] border border-[#c8a96b]/30 text-[11px] font-medium px-2.5 py-1 rounded-full shadow-2xs">
                                  <span className="w-2 h-2 rounded-full bg-[#d38b8b] shadow-2xs" />
                                  <span className="opacity-75 font-normal">Color flor:</span> {item.selectedFlowerColor}
                                </span>
                              )}
                              {item.hasLights && (
                                <span className="inline-flex items-center gap-1 bg-[#fff8eb] text-[#b58129] border border-[#e8be66]/40 text-[11px] font-medium px-2.5 py-1 rounded-full shadow-2xs">
                                  ✨ Luces LED
                                </span>
                              )}
                              {item.hasButterfly && (
                                <span className="inline-flex items-center gap-1 bg-[#fff5f5] text-[#b85b6b] border border-[#e8a3b0]/40 text-[11px] font-medium px-2.5 py-1 rounded-full shadow-2xs">
                                  🦋 Mariposa
                                </span>
                              )}
                            </div>

                            {/* Dedication Card Preview */}
                            {(item.hasPhraseCard || item.phraseText) && (
                              <div className="p-3 rounded-2xl bg-gradient-to-r from-[#faf6ee] to-[#f8f2e7] border border-[#c8a96b]/30 shadow-2xs">
                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                  <div className="flex items-center gap-1.5 text-[10px] font-serif uppercase tracking-wider text-[#8f6d28] font-bold">
                                    <Mail className="w-3.5 h-3.5 text-[#c8a96b]" />
                                    <span>Tarjeta con Dedicatoria</span>
                                  </div>
                                  {item.phraseFont && (
                                    <span className="text-[9px] bg-white/90 text-[#887870] px-2 py-0.5 rounded-full border border-[#c8a96b]/20 font-medium">
                                      Estilo: {item.phraseFont}
                                    </span>
                                  )}
                                </div>
                                {item.phraseText ? (
                                  <p className="font-serif italic text-xs text-[#4a3933] leading-relaxed bg-white/80 p-2.5 rounded-xl border border-[#c8a96b]/15 shadow-2xs line-clamp-3">
                                    “{item.phraseText}”
                                  </p>
                                ) : (
                                  <p className="text-[10px] text-[#887870] italic">
                                    Incluye tarjeta con dedicatoria personalizada artesanal.
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {isUnavailable && (
                          <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-widest text-rose-500 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
                            Agotado
                          </span>
                        )}
                      </div>
                      
                      {/* Price subtotal */}
                      <div className="text-left sm:text-right shrink-0">
                        <span className="font-serif text-2xl sm:text-3xl font-bold text-[#c8a96b] block tracking-tight">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Controls */}
                    <div className="flex items-center justify-between w-full mt-2 pt-3 border-t border-black/5">
                      <div className="flex items-center bg-[#faf7f2] rounded-full p-1 shadow-inner border border-[#e8dcdc]/80">
                        <button 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[#4a3933] hover:bg-white hover:shadow-xs disabled:opacity-40 transition-all active:scale-95"
                          onClick={() => handleDecreaseQuantity(item.cartItemId || item.productId, item.quantity, item.name)}
                          aria-label={item.quantity === 1 ? "Eliminar producto" : "Disminuir cantidad"}
                        >
                          {item.quantity === 1 ? <Trash2 size={13} className="text-rose-500" /> : <Minus size={13} />}
                        </button>
                        <span className="w-9 text-center text-xs font-bold text-[#4a3933]">
                          {item.quantity}
                        </span>
                        <button 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[#4a3933] hover:bg-white hover:shadow-xs disabled:opacity-40 transition-all active:scale-95"
                          onClick={() => handleIncreaseQuantity(item.cartItemId || item.productId, item.quantity, item.stock)}
                          disabled={item.quantity >= item.stock || isUnavailable}
                          aria-label="Aumentar cantidad"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => handleRemoveItem(item.cartItemId || item.productId, item.name)}
                        className="text-[#887870] hover:text-rose-600 hover:bg-rose-50 text-[11px] font-medium transition-all flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                        aria-label="Eliminar producto"
                      >
                        <Trash2 size={13} /> 
                        <span>Quitar</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex items-center justify-between">
            <Link 
              href="/productos" 
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-white/80 hover:bg-white border border-[#e8dcdc] text-[#4a3933] font-serif text-xs font-bold uppercase tracking-widest hover:border-[#c8a96b] shadow-xs hover:shadow-md transition-all group"
            >
              <ArrowRight className="w-3.5 h-3.5 rotate-180 text-[#c8a96b] group-hover:-translate-x-1 transition-transform" /> 
              <span>Seguir explorando detalles</span>
            </Link>
          </div>
        </div>

        {/* Order Summary Sidebar - Luxury Atelier Style */}
        <div className="w-full lg:w-[410px] flex-shrink-0">
          <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-8 sm:p-10 shadow-[0_20px_50px_-15px_rgba(200,169,107,0.16)] border border-[#c8a96b]/25 sticky top-32 relative overflow-hidden">
            
            {/* Floral decoration top right */}
            <div className="absolute -top-10 -right-10 w-[120px] h-[120px] pointer-events-none z-10 mix-blend-multiply opacity-75">
              <Image src={flo1} alt="" width={120} height={120} className="object-contain rotate-[15deg]" />
            </div>

            <div className="mb-6 relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <span className="h-px w-5 bg-[#c8a96b]" />
                <span className="text-[9px] font-serif uppercase tracking-[0.25em] text-[#c8a96b] font-bold">
                  Atelier Aura Nova
                </span>
              </div>
              <h2 className="font-serif text-3xl font-bold text-[#4a3933]">
                Resumen
              </h2>
            </div>
            
            <div className="space-y-3.5 mb-6 text-sm relative z-10">
              <div className="flex justify-between items-center text-[#887870]">
                <span className="font-medium">Subtotal ({totalItems} {totalItems === 1 ? 'detalle' : 'detalles'})</span>
                <span className="font-bold text-[#4a3933]">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-[#887870]">
                <span className="font-medium flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#c8a96b]" /> Envío estimado
                </span>
                <span className="text-xs font-serif italic text-[#887870]">Calculado en checkout</span>
              </div>
            </div>
            
            <div className="pt-5 border-t border-[#e8dcdc] mb-6 relative z-10">
              <div className="flex justify-between items-end">
                <div>
                  <span className="font-serif uppercase tracking-widest text-[10px] text-[#887870] font-bold block">
                    Total estimado
                  </span>
                  <span className="text-[10px] text-stone-400">Impuestos incluidos</span>
                </div>
                <span className="font-serif text-3xl sm:text-4xl font-bold text-[#c8a96b] tracking-tight">
                  {formatCurrency(subtotal)}
                </span>
              </div>
            </div>
            
            <div className="bg-[#fcf9f2] rounded-2xl p-4 flex gap-3 items-start mb-6 border border-[#c8a96b]/20 shadow-xs relative z-10">
              <Info className="w-4 h-4 text-[#c8a96b] flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#856d56] leading-relaxed font-medium">
                El costo de envío se coordinará según tu dirección en Huancayo o agencia nacional (Olva/Shalom) en el siguiente paso.
              </p>
            </div>
            
            <Link href="/checkout" className="block w-full relative z-10">
              <button 
                className="w-full h-14 text-xs font-sans font-bold tracking-[0.15em] uppercase flex items-center justify-center gap-3 rounded-full bg-[#4a3933] hover:bg-[#382b26] text-white shadow-xl shadow-[#4a3933]/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl disabled:opacity-50 disabled:pointer-events-none group"
                disabled={items.some(i => !i.isAvailable)}
              >
                <span>Proceder al pago</span>
                <ArrowRight className="w-4 h-4 text-[#c8a96b] group-hover:translate-x-1.5 transition-transform" />
              </button>
            </Link>

            <p className="text-[10px] text-[#887870] uppercase tracking-wider font-bold text-center mt-4 flex items-center justify-center gap-1.5 relative z-10">
              <Sparkles className="w-3 h-3 text-[#c8a96b]" /> Hecho a mano con amor • Envío seguro
            </p>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={isClearModalOpen} 
        onClose={() => setIsClearModalOpen(false)}
        title="¿Vaciar carrito?"
      >
        <div className="p-6">
          <p className="text-sage mb-6">
            Estás a punto de eliminar todos los productos de tu carrito. Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsClearModalOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              className="bg-red-600 hover:bg-red-700 border-transparent text-white" 
              onClick={handleClearCart}
            >
              Sí, vaciar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
