"use client";

import React from 'react';
import { useProducts } from '@/hooks/use-products';
import { ProductCard } from '@/components/shared/ProductCard';
import { ProductGrid } from '@/components/shared/ProductGrid';
import { ProductGridSkeleton } from '@/components/shared/ProductSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { PackageOpen } from 'lucide-react';

import { CustomOrderBanner } from '@/components/quotes/CustomOrderBanner';

export function CatalogClient() {
  const { data: products, isLoading, isError, refetch } = useProducts();

  // The personalized order pill always sits at the top
  const topBar = (
    <div className="flex justify-center mb-8">
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

  if (!products || products.length === 0) {
    return (
      <div className="py-12">
        {topBar}
        <EmptyState 
          title="Pronto tendremos nuevos detalles para ti" 
          description="Estamos preparando una nueva colección de productos premium que te encantará."
          icon={<PackageOpen size={32} />}
        />
      </div>
    );
  }

  return (
    <>
      {topBar}
      <ProductGrid>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </ProductGrid>
    </>
  );
}
