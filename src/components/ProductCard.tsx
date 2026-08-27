"use client";

import React from 'react';
import { ShoppingCart, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

export function ProductCard({ name, description, price, imageUrl }: ProductCardProps) {
  const router = useRouter();
  
  const handleAddToCart = () => {
    toast.success(`${name} agregado al carrito`, {
      description: 'Revisa tu carrito para procesar el pago.',
      action: {
        label: 'Ver Carrito',
        onClick: () => router.push('/carrito')
      },
      style: {
        background: 'var(--color-cream)',
        color: 'var(--color-brown)',
        border: '1px solid var(--color-gold)'
      }
    });
  };

  return (
    <div className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-sage/20 w-full max-w-sm">
      {/* Image Container */}
      <div className="relative w-full h-64 overflow-hidden bg-cream/50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={imageUrl} 
          alt={name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
        <button 
          className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-md rounded-full text-rose hover:bg-rose hover:text-white transition-colors shadow-sm"
          onClick={() => toast('Añadido a favoritos', { icon: '❤️' })}
        >
          <Heart size={20} />
        </button>
      </div>
      
      {/* Content */}
      <div className="p-6 flex flex-col gap-4">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h3 className="font-semibold text-lg text-brown line-clamp-1">{name}</h3>
            <p className="text-sm text-sage mt-1 line-clamp-2">{description}</p>
          </div>
          <span className="font-bold text-lg text-gold">${price.toFixed(2)}</span>
        </div>
        
        <button 
          onClick={handleAddToCart}
          className="mt-2 w-full flex items-center justify-center gap-2 bg-brown text-cream py-3 px-4 rounded-full font-medium hover:bg-rose transition-colors active:scale-[0.98]"
        >
          <ShoppingCart size={18} />
          <span>Añadir al Carrito</span>
        </button>
      </div>
    </div>
  );
}
