import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ProductResponse } from '../../types/products';
import { Badge } from '../ui/Badge';
import { formatCurrency, getImageUrl } from '../../lib/formatters';
import { PackageOpen, ShoppingBag, Paintbrush } from 'lucide-react';
import { useCartStore } from '../../store/cart.store';
import { toast } from 'sonner';
import estatuo from '../../app/(public)/images/estatuo.png';

interface ProductCardProps {
  product: ProductResponse;
}

export function ProductCard({ product }: ProductCardProps) {
  const { id, name, price, imageUrl, isAvailable, stock } = product;
  const addItem = useCartStore(state => state.addItem);

  // Derive visual stock availability
  const isOutOfStock = !isAvailable || stock <= 0;
  const isLowStock = !isOutOfStock && stock > 0 && stock <= 3;
  
  const hasCustomizations = 
    (product.availableColors && product.availableColors.length > 0) ||
    (product.availableFlowerTypes && product.availableFlowerTypes.length > 0) ||
    product.allowsLights ||
    product.allowsButterfly ||
    product.allowsPhraseCard;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isOutOfStock) return;
    
    addItem({
      productId: id,
      name,
      price,
      quantity: 1,
      imageUrl: getImageUrl(imageUrl), // Ensure cart gets the absolute URL
      stock,
      isAvailable
    });
    
    toast.success('Detalle agregado al carrito', {
      description: name,
      icon: <ShoppingBag className="h-4 w-4" />
    });
  };

  return (
    <div className="group relative flex flex-col h-full animate-in fade-in duration-700">
      <Link 
        href={`/productos/${id}`} 
        className="block relative w-full aspect-[4/5] overflow-hidden bg-[#F9F8F6] rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold shadow-sm group-hover:shadow-xl transition-shadow duration-500"
      >
        {imageUrl ? (
          <Image
            src={getImageUrl(imageUrl)}
            alt={`Imagen de ${name}`}
            fill
            className="object-cover object-center transition-transform duration-[2s] ease-out group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-sage/40">
            <PackageOpen size={48} strokeWidth={1} />
          </div>
        )}
        
        {/* Availability Badges */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 items-end z-10">
          {isOutOfStock ? (
            <span className="bg-red-500/90 backdrop-blur text-white text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-full shadow-sm">
              Agotado
            </span>
          ) : isLowStock ? (
            <span className="bg-gold/90 backdrop-blur text-white text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-full shadow-sm">
              Últimas {stock} unidades
            </span>
          ) : null}
        </div>

        {/* Decorative corner image on hover */}
        <div className="absolute -bottom-2 -right-4 w-40 h-48 opacity-0 group-hover:opacity-[0.6] transition-all duration-700 pointer-events-none group-hover:-translate-x-2 group-hover:-translate-y-2 z-10"
             style={{ maskImage: 'radial-gradient(ellipse at bottom right, black 50%, transparent 80%)', WebkitMaskImage: 'radial-gradient(ellipse at bottom right, black 50%, transparent 80%)' }}>
          <Image src={estatuo} alt="" fill className="object-contain object-bottom right-0" />
        </div>

        {/* Hover Action Button (Desktop only) without dark overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hidden md:flex justify-center w-full z-20">
          {isOutOfStock ? (
            <button disabled className="bg-white/95 backdrop-blur-md text-[#4a3933] font-medium text-sm px-6 py-2.5 rounded-full opacity-50 flex items-center gap-2 border border-white">
              Agotado
            </button>
          ) : hasCustomizations ? (
            <div className="flex gap-2 w-full px-2 max-w-[220px] group/actions justify-center">
              <button 
                className="group/btn1 bg-white/95 backdrop-blur-md text-[#4a3933] font-medium text-sm h-10 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.12)] hover:bg-white hover:text-[#c8a96b] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] flex items-center justify-center border border-white w-[140px] group-hover/actions:w-10 hover:!w-[140px] px-4 group-hover/actions:px-0 hover:!px-4 shrink-0"
              >
                <Paintbrush size={14} className="shrink-0" />
                <span className="whitespace-nowrap transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden opacity-100 group-hover/actions:opacity-0 group-hover/btn1:!opacity-100 max-w-[120px] group-hover/actions:max-w-0 group-hover/btn1:!max-w-[120px] ml-1.5 group-hover/actions:ml-0 group-hover/btn1:!ml-1.5">
                  Personalizar
                </span>
              </button>
              <button 
                onClick={(e) => handleAddToCart(e)}
                className="group/btn2 bg-[#c8a96b] text-white h-10 rounded-full shadow-md hover:bg-[#b89759] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] flex items-center justify-center border border-transparent w-10 hover:w-[140px] px-0 hover:px-4 shrink-0"
                title="Añadir rápido al carrito"
              >
                <ShoppingBag size={15} className="shrink-0" />
                <span className="whitespace-nowrap transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden opacity-0 group-hover/btn2:opacity-100 max-w-0 group-hover/btn2:max-w-[120px] ml-0 group-hover/btn2:ml-1.5 text-sm font-medium">
                  Al carrito
                </span>
              </button>
            </div>
          ) : (
            <button 
              onClick={handleAddToCart}
              className="bg-white/95 backdrop-blur-md text-[#4a3933] font-medium text-sm px-6 py-2.5 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.12)] hover:bg-white hover:text-[#c8a96b] transition-all flex items-center gap-2 border border-white"
            >
              <ShoppingBag size={16} /> Agregar al carrito
            </button>
          )}
        </div>
      </Link>

      <div className="flex flex-col pt-4 px-1">
        <Link 
          href={`/productos/${id}`}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-sm inline-block"
        >
          <h3 className="font-serif text-lg font-bold text-brown leading-tight mb-1 group-hover:text-gold transition-colors">
            {name}
          </h3>
        </Link>
        
        <div className="flex items-center justify-between mt-1">
          <span className="font-semibold text-brown/80 text-base">
            {formatCurrency(price)}
          </span>
          
          {/* Mobile "Add to Cart" Button */}
          {hasCustomizations && !isOutOfStock ? (
            <div className="md:hidden flex gap-1.5">
              <button 
                className="p-2 rounded-full bg-cream text-brown hover:bg-[#c8a96b] hover:text-white transition-colors"
                aria-label="Personalizar"
              >
                <Paintbrush size={16} />
              </button>
              <button 
                onClick={handleAddToCart}
                className="p-2 rounded-full bg-[#c8a96b] text-white hover:bg-[#b89759] transition-colors"
                aria-label="Agregar al carrito"
              >
                <ShoppingBag size={16} />
              </button>
            </div>
          ) : (
            <button 
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="md:hidden p-2 rounded-full bg-cream text-brown hover:bg-gold hover:text-white transition-colors disabled:opacity-50"
              aria-label="Agregar al carrito"
            >
              <ShoppingBag size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
