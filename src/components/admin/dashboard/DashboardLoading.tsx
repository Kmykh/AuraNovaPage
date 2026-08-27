import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export function DashboardLoading() {
  return (
    <div className="space-y-8">
      {/* Skeleton para el Header (simplificado ya que el título puede estar renderizado fuera) */}
      <div className="flex justify-between items-center mb-8">
        <div className="space-y-2">
          <Skeleton variant="text" className="w-48 h-8" />
          <Skeleton variant="text" className="w-64 h-4" />
        </div>
        <Skeleton variant="rect" className="w-32 h-10 rounded-xl" />
      </div>

      {/* Grid de 5 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-sage/10 p-6 shadow-sm">
            <div className="flex justify-between items-start">
              <div className="space-y-3">
                <Skeleton variant="text" className="w-32 h-4" />
                <Skeleton variant="text" className="w-16 h-8" />
              </div>
              <Skeleton variant="rect" className="w-12 h-12 rounded-full" />
            </div>
            <div className="mt-6 pt-4 border-t border-sage/10">
              <Skeleton variant="text" className="w-40 h-3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
