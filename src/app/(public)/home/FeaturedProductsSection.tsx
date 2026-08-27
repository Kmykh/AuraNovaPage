"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useProducts } from '@/hooks/use-products';
import { ProductCard } from '@/components/shared/ProductCard';
import { ProductCardSkeleton } from '@/components/shared/ProductSkeleton';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

import flo1 from '../images/flo1.png';

export function FeaturedProductsSection() {
  const { data: products, isLoading, isError } = useProducts();

  // Limit to 4 products for the featured section
  const featured = products?.slice(0, 4) || [];

  return (
    <section className="py-12 md:py-16 lg:py-20 relative">
      
      {/* Decorative Flower */}
      <div className="absolute top-0 right-0 w-[250px] opacity-40 pointer-events-none translate-x-1/4 -translate-y-1/4 animate-spin-slow mix-blend-multiply">
        <Image src={flo1} alt="" width={250} height={250} />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-xl">
            <span className="uppercase tracking-[0.3em] text-[11px] font-semibold text-gold mb-4 block">Catálogo</span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-brown mb-4">
              Nuestros detalles
            </h2>
            <p className="text-sage text-lg">
              Explora una selección de nuestras creaciones más queridas.
            </p>
          </div>
          <Link href="/productos" tabIndex={-1}>
            <Button className="hidden md:flex bg-[#c8a96b] hover:bg-[#b59555] text-white border-none transition-all duration-300 rounded-full font-serif italic text-lg px-8 h-12 shadow-sm hover:shadow-md hover:-translate-y-0.5">
              Ver catálogo completo
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <Alert 
            variant="warning" 
            title="No pudimos cargar los destacados en este momento."
            message="Por favor, visita el catálogo principal para ver nuestros productos."
          />
        ) : featured.length === 0 ? (
          <p className="text-sage italic text-center py-10">
            Pronto añadiremos nuevos detalles.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="mt-12 md:hidden flex justify-center">
          <Link href="/productos" tabIndex={-1} className="w-full">
            <Button className="w-full bg-[#c8a96b] hover:bg-[#b59555] text-white border-none transition-all duration-300 rounded-full font-serif italic text-lg h-12 shadow-sm">
              Ver catálogo completo
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
