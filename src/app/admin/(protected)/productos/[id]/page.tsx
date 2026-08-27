import React from 'react';
import { Metadata } from 'next';
import { AdminProductDetail } from '@/components/admin/products/AdminProductDetail';

export const metadata: Metadata = {
  title: 'Editar Producto | Aura Nova',
  description: 'Editar un producto del catálogo',
  robots: { index: false, follow: false }
};

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="py-6">
      <AdminProductDetail id={id} />
    </div>
  );
}
