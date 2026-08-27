import React from 'react';
import { Skeleton } from './ui/Skeleton';

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm border border-sage/20 w-full max-w-sm">
      {/* Image Skeleton */}
      <Skeleton className="w-full h-64 rounded-none" />
      
      {/* Content Skeleton */}
      <div className="p-6 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-2 w-2/3">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <Skeleton className="h-8 w-1/4" />
        </div>
        
        <Skeleton className="h-10 w-full mt-2 rounded-full" />
      </div>
    </div>
  );
}
