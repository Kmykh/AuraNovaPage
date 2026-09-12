"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useProducts } from '@/hooks/use-products';
import { ProductCard } from '@/components/shared/ProductCard';
import { Button } from '@/components/ui/Button';
import { formatStageName } from '@/lib/formatters';

import flo1 from '../images/flo1.png';

export function CampaignProductsSection() {
  const { data: products, isLoading, isError } = useProducts();

  const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';

  if (isLoading || isError || isMaintenanceMode) return null;

  const campaignProducts = products?.filter(p => p.isCampaignActive) || [];
  
  // Si no hay productos en campaña activa, la sección no se muestra
  if (campaignProducts.length === 0) return null;

  // Tomamos los primeros 4 para destacar
  const featured = campaignProducts.slice(0, 4);

  // Datos principales de la campaña
  const mainCampaignName = featured[0]?.campaignName || 'Campaña Especial';
  const stageName = featured[0]?.campaignStageName;

  return (
    <section className="py-14 md:py-20 lg:py-24 relative overflow-hidden bg-gradient-to-b from-[#FAF7F2] via-[#F7EDE7] to-[#FAF7F2] border-y border-[#edd8ce]/50">
      
      {/* Decorative Glow & Ambient Lights */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-rose-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />

      {/* Decorative Flower Ambient */}
      <div className="absolute top-0 right-0 w-[260px] opacity-20 pointer-events-none translate-x-1/4 -translate-y-1/4 animate-spin-slow mix-blend-multiply">
        <Image src={flo1} alt="" width={260} height={260}  style={{ width: 'auto', height: 'auto' }} />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Visual de Campaña / Preventa */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="h-px w-6 bg-[#8f2d3b]/50" />
              <span className="text-[#8f2d3b] text-xs uppercase tracking-[0.28em] font-extrabold font-sans">
                {formatStageName(stageName).toUpperCase()}
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#3d2e28] tracking-tight mb-3">
              {mainCampaignName}
            </h2>
            <p className="text-[#705e55] text-base sm:text-lg leading-relaxed">
              Detalles exclusivos con reserva anticipada y precios preferenciales por tiempo limitado.
            </p>
          </div>

          <Link href="/productos?coleccion=campana" tabIndex={-1}>
            <Button className="hidden md:inline-flex items-center justify-center bg-gradient-to-r from-[#8f2d3b] to-[#b54051] hover:from-[#7a2330] hover:to-[#9e3343] text-white border-none transition-all duration-300 rounded-full font-medium text-sm px-8 h-12 shadow-md hover:shadow-lg hover:-translate-y-0.5">
              Explorar Colección Completa
            </Button>
          </Link>
        </div>

        {/* Grid de Productos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Botón móvil */}
        <div className="mt-10 md:hidden flex justify-center">
          <Link href="/productos?coleccion=campana" tabIndex={-1} className="w-full">
            <Button className="w-full bg-gradient-to-r from-[#8f2d3b] to-[#b54051] hover:from-[#7a2330] hover:to-[#9e3343] text-white border-none transition-all duration-300 rounded-full font-medium text-sm h-12 shadow-md">
              Explorar Colección Completa
            </Button>
          </Link>
        </div>

      </div>
    </section>
  );
}
