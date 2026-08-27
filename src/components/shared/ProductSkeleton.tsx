import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';
import { ProductGrid } from './ProductGrid';

export function ProductCardSkeleton() {
  return (
    <Card className="flex flex-col h-full border-sage/5">
      <div className="relative aspect-square w-full">
        <Skeleton variant="rect" className="w-full h-full rounded-b-none" />
      </div>
      <CardContent className="flex flex-col flex-1 p-5">
        <Skeleton variant="text" className="w-3/4 mb-4" />
        <Skeleton variant="text" className="w-full mb-2" />
        <Skeleton variant="text" className="w-2/3 mb-6" />
        
        <div className="flex justify-between items-end mt-auto pt-4 border-t border-sage/10">
          <div className="w-1/3">
            <Skeleton variant="text" className="w-1/2 mb-2" />
            <Skeleton variant="text" className="w-full h-5" />
          </div>
          <Skeleton variant="rect" className="w-24 h-8" />
        </div>
      </CardContent>
    </Card>
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
