import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ProductResponse } from '../../types/products';
import { formatCurrency, formatStageName, getImageUrl } from '../../lib/formatters';
import { PackageOpen, ShoppingBag, Paintbrush, X, Sparkles } from 'lucide-react';
import { useCartStore } from '../../store/cart.store';
import { toast } from 'sonner';
import estatuo from '../../app/(public)/images/estatuo.png';

interface ProductCardProps {
  product: ProductResponse;
  isActive?: boolean;
}

export function ProductCard({ product, isActive = true }: ProductCardProps) {
  const { id, name, price, imageUrl, isAvailable, stock } = product;
  const addItem = useCartStore(state => state.addItem);
  const [showMobileActions, setShowMobileActions] = useState(false);

  // Derive visual stock availability
  const isOutOfStock = !isAvailable || stock <= 0;
  const isLowStock = !isOutOfStock && stock > 0 && stock <= 3;

  const handleImageClick = (e: React.MouseEvent) => {
    // En pantallas móviles (< 768px), el toque en la imagen despliega los botones verticales
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      e.preventDefault();
      e.stopPropagation();
      setShowMobileActions(prev => !prev);
    }
  };

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
      price: product.effectivePrice,
      quantity: 1,
      imageUrl: getImageUrl(imageUrl),
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

      {/* ── Image Box with Badges ── */}
      {/* ── Image Box with Badges & Mobile Tap Action ── */}
      <Link
        href={`/productos/${id}`}
        onClick={handleImageClick}
        className="block relative w-full aspect-[4/5] overflow-hidden bg-[#F9F8F6] rounded-[26px] border border-black/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold shadow-[0_4px_20px_rgba(0,0,0,0.04)] group-hover:shadow-xl transition-all duration-500 cursor-pointer"
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

        {/* ── Campaign Stage Badge (Warm Brown Pill) ── */}
        {product.isCampaignActive && product.campaignStageName && (
          <div className="absolute top-3.5 left-3.5 z-10">
            <span className="bg-[#4A3933]/90 backdrop-blur-md text-[#FDFCFB] text-[10px] font-sans uppercase tracking-[0.16em] font-semibold px-3 py-1 rounded-full shadow-sm border border-white/20 inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C8A96B]" />
              {formatStageName(product.campaignStageName)}
            </span>
          </div>
        )}

        {/* ── Stock Availability Badges (Top Right) ── */}
        <div className="absolute top-3.5 right-3.5 flex flex-col gap-2 items-end z-10">
          {isOutOfStock ? (
            <span className="bg-stone-850/90 backdrop-blur-md text-white text-[10px] uppercase tracking-wider font-semibold px-3 py-1 rounded-full shadow-sm border border-white/10">
              Agotado
            </span>
          ) : isLowStock ? (
            <span className="bg-[#C8A96B]/95 backdrop-blur-md text-white text-[10px] uppercase tracking-wider font-semibold px-3 py-1 rounded-full shadow-sm border border-white/20">
              Últimas {stock}
            </span>
          ) : null}
        </div>

        {/* ── Translucent pill at bottom of image (Mobile only) ── */}
        {!showMobileActions && (
          <div className="absolute inset-x-3 bottom-3.5 z-15 md:hidden flex justify-center pointer-events-none">
            <span className="bg-[#4A3933]/80 backdrop-blur-md text-white/95 text-[10px] font-sans font-medium px-3 py-1.5 rounded-full shadow-md border border-white/20 flex items-center gap-1.5">
              <ShoppingBag size={12} className="text-[#C8A96B]" />
              Presione la imagen para agregar al carrito
            </span>
          </div>
        )}

        {/* ── Mobile Vertical Actions Overlay (Se activa al presionar la imagen) ── */}
        {showMobileActions && (
          <div
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowMobileActions(false);
            }}
            className="md:hidden absolute inset-0 z-30 bg-[#4A3933]/75 backdrop-blur-md flex flex-col justify-center items-center p-5 gap-2.5 animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Close button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowMobileActions(false);
              }}
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30"
              aria-label="Cerrar"
            >
              <X size={14} />
            </button>

            <span className="text-white/90 text-xs font-serif italic mb-1 text-center">
              ¿Qué deseas hacer con este detalle?
            </span>

            {/* Botón 1: Agregar al carrito */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAddToCart(e);
                setShowMobileActions(false);
              }}
              disabled={isOutOfStock}
              className="w-full h-11 rounded-full bg-white text-[#4A3933] font-medium text-xs flex items-center justify-center gap-2 shadow-lg hover:bg-[#FAF7F2] active:scale-95 transition-all disabled:opacity-50"
            >
              <ShoppingBag size={15} className="text-[#C8A96B]" />
              <span>{isOutOfStock ? 'Agotado' : 'Agregar al carrito'}</span>
            </button>

            {/* Botón 2: Personalizar o Ver detalle */}
            {hasCustomizations && !isOutOfStock ? (
              <Link
                href={`/productos/${id}`}
                onClick={(e) => e.stopPropagation()}
                className="w-full h-11 rounded-full bg-[#C8A96B] text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg hover:bg-[#B89759] active:scale-95 transition-all"
              >
                <Paintbrush size={14} />
                <span>Personalizar detalle</span>
              </Link>
            ) : (
              <Link
                href={`/productos/${id}`}
                onClick={(e) => e.stopPropagation()}
                className="w-full h-11 rounded-full bg-white/20 text-white border border-white/30 font-medium text-xs flex items-center justify-center gap-2 shadow-sm hover:bg-white/30 active:scale-95 transition-all"
              >
                <span>Ver detalle completo</span>
              </Link>
            )}
          </div>
        )}

        {/* Decorative corner image on hover */}
        <div
          className="absolute -bottom-2 -right-4 w-40 h-48 opacity-0 group-hover:opacity-[0.6] transition-all duration-700 pointer-events-none group-hover:-translate-x-2 group-hover:-translate-y-2 z-10"
          style={{ maskImage: 'radial-gradient(ellipse at bottom right, black 50%, transparent 80%)', WebkitMaskImage: 'radial-gradient(ellipse at bottom right, black 50%, transparent 80%)' }}
        >
          <Image src={estatuo} alt="" fill className="object-contain object-bottom right-0" />
        </div>

        {/* Hover Action Button (Desktop only) */}
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

      {/* ── Product Info Section ── */}
      <div className="flex flex-col pt-3 px-0.5">

        {/* Category & Audience (Estilo tipográfico editorial y minimalista, sin tags) */}
        {(product.category?.name || product.audience) && (
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-stone-500 mb-1">
            {product.category?.name && (
              <span className="text-[#a07c3e] font-semibold">
                {product.category.name}
              </span>
            )}
            {product.category?.name && product.audience && (
              <span className="text-stone-300 font-normal">·</span>
            )}
            {product.audience && (
              <span className="text-stone-500 font-normal capitalize">
                Para {product.audience.toLowerCase()}
              </span>
            )}
          </div>
        )}

        {/* Title */}
        <Link
          href={`/productos/${id}`}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-sm inline-block"
        >
          <h3 className="font-serif text-lg font-bold text-brown leading-snug mb-1 group-hover:text-gold transition-colors truncate">
            {name}
          </h3>
        </Link>

        {/* Price Section - Limpio y elegante, sin botones apretados */}
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-baseline gap-2">
            {product.isCampaignActive ? (
              <>
                <span className="font-serif font-bold text-lg text-[#4A3933] tracking-tight">
                  {formatCurrency(product.effectivePrice)}
                </span>
                <span className="font-serif text-xs text-stone-400 line-through font-normal tracking-normal">
                  {formatCurrency(price)}
                </span>
              </>
            ) : (
              <span className="font-serif font-bold text-base text-[#4A3933] tracking-tight">
                {formatCurrency(product.effectivePrice)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
