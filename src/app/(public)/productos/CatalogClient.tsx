"use client";

import { useSearchParams } from 'next/navigation';
import { useProducts } from '@/hooks/use-products';
import { ProductCard } from '@/components/shared/ProductCard';
import { ProductGrid } from '@/components/shared/ProductGrid';
import { ProductGridSkeleton } from '@/components/shared/ProductSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { PackageOpen } from 'lucide-react';
import { CatalogFilters } from '@/components/shared/CatalogFilters';

import { CustomOrderBanner } from '@/components/quotes/CustomOrderBanner';

export function CatalogClient() {
  const { data: products, isLoading, isError, refetch } = useProducts();
  const searchParams = useSearchParams();
  
  const currentCategorySlug = searchParams.get('category');
  const currentAudience = searchParams.get('audience');

  const filteredProducts = products?.filter((product) => {
    if (currentCategorySlug && product.category?.slug !== currentCategorySlug) return false;
    if (currentAudience && product.audience !== currentAudience) return false;
    return true;
  });

  const topBar = (
    <div className="flex justify-center mb-4">
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

  if (!filteredProducts || filteredProducts.length === 0) {
    return (
      <div className="py-12">
        {topBar}
        <CatalogFilters />
        <EmptyState 
          title="No encontramos productos" 
          description="Intenta cambiar los filtros seleccionados para ver más resultados."
          icon={<PackageOpen size={32} />}
        />
      </div>
    );
  }

  return (
    <>
      {topBar}
      <CatalogFilters />
      <ProductGrid>
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </ProductGrid>
    </>
  );
}
