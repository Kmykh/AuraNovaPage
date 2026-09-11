import React from 'react';
import { Metadata } from 'next';
import { ProductForm } from '@/components/admin/products/ProductForm';

export const metadata: Metadata = {
  title: 'Nuevo Producto | Aura Nova',
  description: 'Crear un nuevo producto en Aura Nova',
  robots: { index: false, follow: false }
};

export default function NewProductPage() {
  return (
    <div className="py-2">
      <ProductForm mode="create" />
    </div>
  );
}
