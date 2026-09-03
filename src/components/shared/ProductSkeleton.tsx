import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';
import { ProductGrid } from './ProductGrid';

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col h-full animate-pulse">
      <div className="relative w-full aspect-[4/5] bg-cream/50 rounded-2xl overflow-hidden border border-sage/5">
      </div>
      
      <div className="flex flex-col pt-4 px-1 gap-1">
        <Skeleton variant="text" className="w-3/4 h-6 rounded-md" />
        <div className="flex items-center justify-between mt-1">
          <Skeleton variant="text" className="w-1/3 h-5 rounded-md" />
          <div className="md:hidden w-8 h-8 rounded-full bg-cream/80" />
        </div>
      </div>
    </div>
  );
}

interface ProductGridSkeletonProps {
  count?: number;
}

export function ProductGridSkeleton({ count = 8 }: ProductGridSkeletonProps) {
  return (
    <ProductGrid>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </ProductGrid>
  );
}
