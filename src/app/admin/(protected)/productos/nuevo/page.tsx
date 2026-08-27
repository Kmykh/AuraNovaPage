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
    <div className="py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-brown">Nuevo producto</h1>
        <p className="text-sage mt-1">
          Ingresa los detalles para registrar un producto en el catálogo.
        </p>
      </div>

      <ProductForm mode="create" />
    </div>
  );
}
