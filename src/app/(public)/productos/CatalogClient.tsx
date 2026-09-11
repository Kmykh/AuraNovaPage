"use client";

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { useProducts } from '@/hooks/use-products';
import { useCategories } from '@/hooks/use-categories';
import { ProductCard } from '@/components/shared/ProductCard';
import { ProductGridSkeleton } from '@/components/shared/ProductSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { PackageOpen, Sparkles, Layers } from 'lucide-react';
import { CustomOrderBanner } from '@/components/quotes/CustomOrderBanner';
import { ProductResponse } from '@/types/products';
import { formatStageName } from '@/lib/formatters';

export function CatalogClient() {
  const { data: products, isLoading, isError, refetch } = useProducts();
  const { data: categories } = useCategories();
  const searchParams = useSearchParams();
  
  const currentCategorySlug = searchParams.get('category');
  const currentAudience = searchParams.get('audience');
  const showCampaignOnly = searchParams.get('coleccion') === 'campana';

  // Helper para filtrar por público
  const filterByAudience = (list: ProductResponse[]) => {
    if (!currentAudience) return list;
    return list.filter(p => p.audience === currentAudience);
  };

  const campaignProducts = filterByAudience(products?.filter(p => p.isCampaignActive) || []);
  const regularProducts = filterByAudience(products?.filter(p => !p.isCampaignActive) || []);

  const topBar = (
    <div className="flex justify-center mb-2">
      <CustomOrderBanner />
    </div>
  );

  if (isLoading) {
    return (
      <>
        {topBar}
        <ProductGridSkeleton count={8} />
      </>
    );
  }

  if (isError) {
    return (
      <div className="py-12">
        {topBar}
        <ErrorState 
          title="No pudimos cargar los detalles" 
          message="Tuvimos un inconveniente conectando con nuestro catálogo. Por favor intenta de nuevo."
          onRetry={() => refetch()} 
        />
      </div>
    );
  }

  // ── Caso 1: Ver solo Colección de Preventa / Campaña ──
  if (showCampaignOnly) {
    return (
      <>
        {topBar}
        
        {campaignProducts.length === 0 ? (
          <EmptyState 
            title="No hay productos en preventa con los filtros actuales" 
            description="Prueba cambiando el público seleccionado."
            icon={<PackageOpen size={32} />}
          />
        ) : (
          <div className="space-y-6">
            {/* Visual Campaign Hero Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#fcf7f4] via-[#f7ece5] to-[#f5e5dd] p-6 sm:p-8 border border-[#edd7cd] shadow-sm">
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="max-w-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="h-px w-6 bg-[#8f2d3b]/50" />
                    <span className="text-[#8f2d3b] text-xs uppercase tracking-[0.25em] font-extrabold font-sans">
                      {formatStageName(campaignProducts[0]?.campaignStageName).toUpperCase()}
                    </span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#3d2e28] tracking-tight mb-2">
                    {campaignProducts[0]?.campaignName || 'Colección de Preventa'}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#705e55] leading-relaxed">
                    Reserva tus arreglos con anticipación para asegurar stock y obtener precios preferenciales de temporada.
                  </p>
                </div>
                <div className="shrink-0 self-start sm:self-auto">
                  <span className="text-xs font-bold text-[#8f2d3b] bg-white/90 px-4 py-1.5 rounded-full border border-[#edd7cd] shadow-2xs inline-block">
                    {campaignProducts.length} {campaignProducts.length === 1 ? 'detalle exclusivo' : 'detalles exclusivos'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {campaignProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </>
    );
  }

  // ── Caso 2: Ver una sola Categoría Específica ──
  if (currentCategorySlug) {
    const selectedCat = categories?.find(c => c.slug === currentCategorySlug);
    const catProducts = regularProducts.filter(p => p.category?.slug === currentCategorySlug);

    return (
      <>
        {topBar}

        {catProducts.length === 0 ? (
          <EmptyState 
            title={`No encontramos productos en ${selectedCat?.name || 'esta categoría'}`}
            description="Intenta cambiar los filtros de público o explorar otras colecciones."
            icon={<PackageOpen size={32} />}
          />
        ) : (
          <div className="space-y-6">
            <div className="pb-4 border-b border-sage/15 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] font-bold text-gold block mb-1">
                  Colección Seleccionada
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brown">
                  {selectedCat?.name || 'Detalles'}
                </h2>
              </div>
              <span className="text-xs font-semibold text-sage bg-white px-3 py-1 rounded-full border border-sage/20 shadow-2xs self-start sm:self-auto">
                {catProducts.length} {catProducts.length === 1 ? 'detalle' : 'detalles'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {catProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </>
    );
  }

  // ── Caso 3: Vista Completa Organizada por Secciones ──
  // Prioridad de orden de categorías: Flores Artesanales (1), Ramos (2), Maceteros (3), Accesorios (4)
  const categoryPriority = (slug: string, name: string): number => {
    const lower = `${name} ${slug}`.toLowerCase();
    if (lower.includes('artesanal') || lower.includes('flor')) return 1;
    if (lower.includes('ramo')) return 2;
    if (lower.includes('macet')) return 3;
    if (lower.includes('accesori') || lower.includes('joya')) return 4;
    return 5;
  };

  const categorySections = (categories?.map(cat => {
    const catProducts = regularProducts.filter(p => p.category?.id === cat.id);
    return {
      category: cat,
      products: catProducts
    };
  }).filter(sec => sec.products.length > 0) || []).sort((a, b) => 
    categoryPriority(a.category.slug, a.category.name) - categoryPriority(b.category.slug, b.category.name)
  );

  // Productos sin categoría asignada
  const uncategorizedProducts = regularProducts.filter(p => !p.category);

  const totalMatching = campaignProducts.length + categorySections.reduce((acc, s) => acc + s.products.length, 0) + uncategorizedProducts.length;

  if (totalMatching === 0) {
    return (
      <>
        {topBar}
        <EmptyState 
          title="No encontramos productos con los filtros seleccionados" 
          description="Prueba seleccionando 'Todos' en el filtro de público."
          icon={<PackageOpen size={32} />}
        />
      </>
    );
  }

  return (
    <>
      {topBar}

      <div className="space-y-16">
        {/* ── 1. Sección de Campaña Activa (Siempre primero en el catálogo si hay campaña) ── */}
        {campaignProducts.length > 0 && (
          <section className="space-y-6 scroll-mt-36" id="sec-campana-activa">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#fcf7f4] via-[#f8ede6] to-[#f4e4dc] p-6 sm:p-7 border border-[#edd7cd] shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="h-px w-6 bg-[#8f2d3b]/50" />
                    <span className="text-[#8f2d3b] text-xs uppercase tracking-[0.25em] font-extrabold font-sans">
                      {formatStageName(campaignProducts[0]?.campaignStageName).toUpperCase()}
                    </span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#3d2e28] tracking-tight mb-1">
                    {campaignProducts[0]?.campaignName || 'Colección Especial'}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#705e55]">
                    Detalles exclusivos con reserva anticipada y precios especiales.
                  </p>
                </div>
                <span className="text-xs font-bold text-[#8f2d3b] bg-white/95 px-3.5 py-1.5 rounded-full border border-[#edd7cd] shadow-2xs self-start sm:self-auto shrink-0 font-sans">
                  {campaignProducts.length} {campaignProducts.length === 1 ? 'detalle exclusivo' : 'detalles exclusivos'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {campaignProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* ── 2. Secciones por Categoría Ordenadas (Flores Artesanales, Ramos, Maceteros, Accesorios...) ── */}
        {categorySections.map(({ category, products: catProducts }) => (
          <section key={category.id} className="space-y-6 scroll-mt-36" id={`sec-${category.slug}`}>
            
            {/* Cabecera de la Sección de Categoría */}
            <div className="pb-3 border-b border-sage/15 flex items-end justify-between gap-4">
              <div>
                <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] font-bold text-gold block mb-1">
                  Colección Aura Nova
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brown">
                  {category.name}
                </h2>
              </div>
              <span className="text-xs font-semibold text-sage bg-white px-3 py-1 rounded-full border border-sage/20 shadow-2xs">
                {catProducts.length} {catProducts.length === 1 ? 'detalle' : 'detalles'}
              </span>
            </div>

            {/* Grilla de Productos de la Sección */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {catProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

          </section>
        ))}

        {/* ── 3. Sección de Otros Detalles (si existen sin categoría) ── */}
        {uncategorizedProducts.length > 0 && (
          <section className="space-y-6 scroll-mt-36">
            <div className="pb-3 border-b border-sage/15 flex items-end justify-between gap-4">
              <div>
                <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] font-bold text-gold block mb-1">
                  Creaciones Exclusivas
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brown">
                  Otros Detalles
                </h2>
              </div>
              <span className="text-xs font-semibold text-sage bg-white px-3 py-1 rounded-full border border-sage/20 shadow-2xs">
                {uncategorizedProducts.length} {uncategorizedProducts.length === 1 ? 'detalle' : 'detalles'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {uncategorizedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
