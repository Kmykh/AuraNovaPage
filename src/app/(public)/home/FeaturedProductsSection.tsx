"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useProducts } from '@/hooks/use-products';
import { ProductCard } from '@/components/shared/ProductCard';
import { ProductCardSkeleton } from '@/components/shared/ProductSkeleton';
import { ProductSectionSlider } from '@/components/shared/ProductSectionSlider';
import { Button } from '@/components/ui/Button';

import flo1 from '../images/flo1.png';

export function FeaturedProductsSection() {
  const { data: products, isLoading, isError } = useProducts();

  // Filtrar para NO mostrar los productos que ya están seleccionados en la campaña activa
  const nonCampaignProducts = products?.filter(p => !p.isCampaignActive) || [];
  const featured = nonCampaignProducts.slice(0, 4);
  
  const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';

  // Si no hay productos fuera de la campaña activa y no estamos cargando, no duplicamos
  if (!isLoading && !isError && nonCampaignProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-16 lg:py-20 relative">
      
      {/* Decorative Flower */}
      <div className="absolute top-0 right-0 w-[250px] opacity-40 pointer-events-none translate-x-1/4 -translate-y-1/4 animate-spin-slow mix-blend-multiply">
        <Image src={flo1} alt="" width={250} height={250}  style={{ width: 'auto', height: 'auto' }} />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8A96B]/15 border border-[#C8A96B]/25 backdrop-blur-md mb-3.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C8A96B]" />
              <span className="uppercase tracking-[0.2em] text-[11px] font-bold text-[#8C6D32] font-sans">
                Catálogo
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#4A3933] mb-3">
              Nuestros detalles
            </h2>
            <p className="text-[#6F5F57] text-base sm:text-lg leading-relaxed">
              Explora una selección de nuestras creaciones más queridas.
            </p>
          </div>
          {!isMaintenanceMode && (
            <Link href="/productos" tabIndex={-1}>
              <Button className="hidden md:flex bg-[#4A3933] hover:bg-[#3D2E28] text-white border-none transition-all duration-300 rounded-full font-medium text-sm px-8 h-12 shadow-[0_4px_16px_rgba(74,57,51,0.18)] hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]">
                Ver catálogo completo
              </Button>
            </Link>
          )}
        </div>

        {isLoading ? (
          <ProductSectionSlider theme="gold">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </ProductSectionSlider>
        ) : (isError || isMaintenanceMode) ? (
          <div className="text-center py-16 max-w-2xl mx-auto">
            <p className="text-[#5C4B41] font-serif text-2xl mb-4 italic">
              Preparando nuevas sorpresas...
            </p>
            <p className="text-[#8C7B71] text-lg">
              Estamos organizando nuestras creaciones. Vuelve muy pronto para descubrir nuestros nuevos detalles.
            </p>
          </div>
        ) : featured.length === 0 ? (
          <p className="text-sage italic text-center py-10">
            Pronto añadiremos nuevos detalles.
          </p>
        ) : (
          <ProductSectionSlider theme="gold">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ProductSectionSlider>
        )}

        {!isMaintenanceMode && (
          <div className="mt-8 md:hidden flex justify-center px-2">
            <Link href="/productos" tabIndex={-1} className="w-full max-w-sm">
              <Button className="w-full bg-[#4A3933] hover:bg-[#3D2E28] text-white border-none transition-all duration-300 rounded-full font-medium text-sm h-12 shadow-[0_4px_16px_rgba(74,57,51,0.18)] active:scale-[0.98]">
                Ver catálogo completo
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
