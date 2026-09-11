"use client";

import React from 'react';
import { useAdminProduct } from '@/hooks/use-admin-products';
import { ProductForm } from './ProductForm';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { AlertCircle } from 'lucide-react';
import { ApiProblemDetails } from '@/lib/api-errors';
import Link from 'next/link';

export function AdminProductDetail({ id }: { id: string }) {
  const { data: product, isLoading, error, refetch } = useAdminProduct(id);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto py-4">
        <div className="flex gap-4 items-center">
          <Skeleton variant="rect" className="w-16 h-16 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton variant="text" className="w-64 h-8" />
            <Skeleton variant="text" className="w-32 h-4" />
          </div>
        </div>
        <Skeleton variant="rect" className="w-full h-96 rounded-[24px]" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton variant="rect" className="w-full h-44 rounded-[22px]" />
          <Skeleton variant="rect" className="w-full h-44 rounded-[22px]" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    const isNotFound = error instanceof ApiProblemDetails && error.status === 404;
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-sage/20 shadow-sm max-w-2xl mx-auto my-8">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <h2 className="text-xl font-serif text-brown font-semibold mb-2">
          {isNotFound ? 'Producto no encontrado' : 'Error al cargar'}
        </h2>
        <p className="text-sage max-w-md mb-6">
          {isNotFound ? 'El producto que buscas no existe o ha sido removido.' : 'Ocurrió un error de conexión.'}
        </p>
        <div className="flex gap-3">
          <Link href="/admin/productos">
            <Button variant="outline">Volver a la lista</Button>
          </Link>
          {!isNotFound && <Button onClick={() => refetch()}>Reintentar</Button>}
        </div>
      </div>
    );
  }

  return (
    <ProductForm 
      mode="edit" 
      initialData={product} 
      onRefresh={refetch} 
    />
  );
}
