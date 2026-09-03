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
import { PackageOpen, Trash2, Plus, Minus, Info, ArrowRight } from 'lucide-react';
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

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 relative z-10 w-full">
        
        {/* Cart Items List */}
        <div className="flex-1">
          <div className="flex flex-col gap-6">
            {items.map((item, index) => {
              const isUnavailable = !item.isAvailable;
              return (
                <div key={item.cartItemId || item.productId} className={`bg-white rounded-[2rem] p-6 shadow-sm border border-[#e8dcdc]/50 flex flex-col sm:flex-row gap-6 items-start sm:items-center transition-all hover:shadow-md ${isUnavailable ? 'opacity-60' : ''}`}>
                  
                  {/* Image */}
                  <div className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-2xl overflow-hidden bg-[#faf7f2] flex-shrink-0">
                    {item.imageUrl ? (
                      <Image 
                        src={item.imageUrl} 
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-[#d38b8b]/40">
                        <PackageOpen size={32} strokeWidth={1} />
                      </div>
                    )}
                  </div>
                  
                  {/* Product Details */}
                  <div className="flex-1 w-full min-w-0 flex flex-col justify-between h-full">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                      <div>
                        <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#4a3933] mb-1">
                          {item.name}
                        </h3>
                        <p className="text-[#887870] font-medium">{formatCurrency(item.price)} <span className="text-xs font-normal">c/u</span></p>
                        
                        {(item.selectedPrimaryColor || item.selectedFlowerType || item.hasLights || item.hasButterfly || item.hasPhraseCard) && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {item.selectedPrimaryColor && <span className="bg-[#e8dcdc]/40 text-[#887870] text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-full">{item.selectedPrimaryColor}</span>}
                            {item.selectedFlowerType && <span className="bg-[#e8dcdc]/40 text-[#887870] text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-full">{item.selectedFlowerType}</span>}
                            {item.hasLights && <span className="bg-[#c8a96b]/10 text-[#b59555] text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-full">Luces</span>}
                            {item.hasButterfly && <span className="bg-[#c8a96b]/10 text-[#b59555] text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-full">Mariposa</span>}
                            {item.hasPhraseCard && <span className="bg-[#e8dcdc]/40 text-[#887870] text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-full">Tarjeta</span>}
                          </div>
                        )}
                        {isUnavailable && (
                          <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-widest text-rose-500 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
                            Agotado
                          </span>
                        )}
                      </div>
                      
                      {/* Price subtotal desktop */}
                      <div className="hidden sm:block text-right">
                        <span className="font-serif text-2xl font-bold text-[#c8a96b]">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    </div>
                    
                    {/* Controls */}
                    <div className="flex items-center justify-between w-full mt-auto">
                      <div className="flex items-center bg-[#faf7f2] rounded-full p-1 shadow-inner border border-[#e8dcdc]/50">
                        <button 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[#4a3933] hover:bg-white hover:shadow-sm disabled:opacity-50 transition-all"
                          onClick={() => handleDecreaseQuantity(item.cartItemId || item.productId, item.quantity, item.name)}
                          aria-label={item.quantity === 1 ? "Eliminar producto" : "Disminuir cantidad"}
                        >
                          {item.quantity === 1 ? <Trash2 size={14} className="text-rose-400" /> : <Minus size={14} />}
                        </button>
                        <span className="w-10 text-center text-sm font-bold text-[#4a3933]">
                          {item.quantity}
                        </span>
                        <button 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[#4a3933] hover:bg-white hover:shadow-sm disabled:opacity-50 transition-all"
                          onClick={() => handleIncreaseQuantity(item.cartItemId || item.productId, item.quantity, item.stock)}
                          disabled={item.quantity >= item.stock || isUnavailable}
                          aria-label="Aumentar cantidad"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => handleRemoveItem(item.cartItemId || item.productId, item.name)}
                        className="text-[#887870] hover:text-rose-500 text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-rose-50"
                        aria-label="Eliminar producto"
                      >
                        <Trash2 size={14} /> Quitar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 flex flex-col sm:flex-row justify-between items-center gap-4">
            <Link href="/productos" tabIndex={-1} className="flex items-center justify-center w-full sm:w-auto gap-2 px-6 py-3.5 rounded-full bg-white border border-[#e8dcdc] text-[#887870] font-sans text-xs font-bold uppercase tracking-widest hover:text-[#4a3933] hover:border-[#c8a96b] hover:shadow-sm transition-all">
              <ArrowRight className="w-4 h-4 rotate-180" /> Seguir comprando
            </Link>
            <button 
              className="flex items-center justify-center w-full sm:w-auto gap-2 px-6 py-3.5 rounded-full border border-rose-200 text-rose-500 hover:bg-rose-50 hover:border-rose-300 text-xs font-bold uppercase tracking-widest transition-all"
              onClick={() => setIsClearModalOpen(true)}
            >
              <Trash2 size={16} /> Vaciar carrito
            </button>
          </div>
        </div>

        {/* Order Summary Sidebar - Clean white block without heavy borders */}
        <div className="w-full lg:w-[400px] flex-shrink-0">
          <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_20px_50px_-15px_rgba(211,139,139,0.15)] sticky top-32 relative">
            
            <h2 className="font-serif text-3xl font-bold text-[#4a3933] mb-8">Resumen</h2>
            
            <div className="flex justify-between items-center mb-6 text-[#887870]">
              <span>Subtotal ({items.reduce((acc, i) => acc + i.quantity, 0)} {items.length === 1 ? 'item' : 'items'})</span>
              <span className="font-bold text-[#4a3933]">{formatCurrency(getSubtotal())}</span>
            </div>
            
            <div className="pt-6 border-t border-[#e8dcdc] mb-8">
              <div className="flex justify-between items-end">
                <span className="font-bold uppercase tracking-widest text-xs text-[#887870]">Total estimado</span>
                <span className="font-serif text-4xl font-bold text-[#4a3933]">{formatCurrency(getSubtotal())}</span>
              </div>
            </div>
            
            <div className="bg-[#faf7f2] rounded-2xl p-5 flex gap-3 items-start mb-8 shadow-inner">
              <Info className="w-5 h-5 text-[#d38b8b] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[#887870] leading-relaxed font-medium">El costo de envío se calculará al confirmar los datos de tu pedido y la modalidad de entrega en el siguiente paso.</p>
            </div>
            
            <Link href="/checkout" tabIndex={-1} className="block w-full">
              <button 
                className="w-full h-14 text-sm tracking-widest uppercase flex items-center justify-center gap-2.5 rounded-full bg-[#c8a96b] hover:bg-[#b89759] text-white font-sans font-bold shadow-xl shadow-[#c8a96b]/20 transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:pointer-events-none"
                disabled={items.some(i => !i.isAvailable)}
              >
                Proceder al pago
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
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
