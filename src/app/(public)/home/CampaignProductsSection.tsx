"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useProducts } from '@/hooks/use-products';
import { ProductCard } from '@/components/shared/ProductCard';
import { ProductSectionSlider } from '@/components/shared/ProductSectionSlider';
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
    <section className="py-14 md:py-20 lg:py-24 relative overflow-hidden bg-gradient-to-b from-[#FAF8F5] via-[#F5EEE7] to-[#FAF8F5] border-y border-[#E6DDD3]/70">
      
      {/* Apple-style Soft Ambient Lighting */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#C8A96B]/12 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#EADFD7]/50 rounded-full blur-3xl pointer-events-none" />

      {/* Decorative Flower Ambient */}
      <div className="absolute top-0 right-0 w-[260px] opacity-15 pointer-events-none translate-x-1/4 -translate-y-1/4 animate-spin-slow mix-blend-multiply">
        <Image src={flo1} alt="" width={260} height={260} style={{ width: 'auto', height: 'auto' }} />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Visual de Campaña / Preventa - Estilo Apple Editorial */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-14 gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4A3933]/[0.05] border border-[#4A3933]/[0.1] backdrop-blur-md mb-3.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C8A96B]" />
              <span className="text-[#4A3933] text-[11px] uppercase tracking-[0.2em] font-bold font-sans">
                {formatStageName(stageName).toUpperCase()}
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#4A3933] tracking-tight mb-3">
              {mainCampaignName}
            </h2>
            <p className="text-[#6F5F57] text-base sm:text-lg leading-relaxed">
              Detalles exclusivos con reserva anticipada y precios preferenciales por tiempo limitado.
            </p>
          </div>

          <Link href="/productos?coleccion=campana" tabIndex={-1}>
            <Button className="hidden md:inline-flex items-center justify-center bg-[#4A3933] hover:bg-[#3D2E28] text-white border-none transition-all duration-300 rounded-full font-medium text-sm px-8 h-12 shadow-[0_4px_16px_rgba(74,57,51,0.18)] hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]">
              Explorar Colección Completa
            </Button>
          </Link>
        </div>

        {/* Slider centrado en móvil / Grid en Desktop */}
        <ProductSectionSlider theme="campaign">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </ProductSectionSlider>

        {/* Botón móvil Apple Style */}
        <div className="mt-8 md:hidden flex justify-center px-2">
          <Link href="/productos?coleccion=campana" tabIndex={-1} className="w-full max-w-sm">
            <Button className="w-full bg-[#4A3933] hover:bg-[#3D2E28] text-white border-none transition-all duration-300 rounded-full font-medium text-sm h-12 shadow-[0_4px_16px_rgba(74,57,51,0.18)] active:scale-[0.98]">
              Explorar Colección Completa
            </Button>
          </Link>
        </div>

      </div>
    </section>
  );
}
