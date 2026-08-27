import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { AdminProductsList } from '@/components/admin/products/AdminProductsList';

export const metadata: Metadata = {
  title: 'Gestión de Productos | Aura Nova',
  description: 'Administra el catálogo de Aura Nova',
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminProductsPage() {
  return (
    <div className="py-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-brown tracking-tight">Catálogo de Productos</h1>
          <p className="text-sage mt-2 text-sm md:text-base">
            Administra los detalles florales disponibles en tu tienda Aura Nova.
          </p>
        </div>
        <Link href="/admin/productos/nuevo" className="shrink-0">
          <Button className="rounded-full shadow-md bg-brown hover:bg-brown/90 px-6 font-medium">
            + Nuevo producto
          </Button>
        </Link>
      </div>

      <AdminProductsList />
    </div>
  );
}
