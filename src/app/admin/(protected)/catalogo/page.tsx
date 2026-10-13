import React from 'react';
import { Metadata } from 'next';
import { CatalogPdfBuilder } from '@/components/admin/catalog/CatalogPdfBuilder';

export const metadata: Metadata = {
  title: 'Catálogo PDF | Aura Nova',
  robots: { index: false, follow: false },
};

export default function AdminCatalogPage() {
  return (
    <div className="mx-auto max-w-7xl py-6">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-brown md:text-4xl">Catálogo en PDF</h1>
        <p className="mt-2 text-sm text-sage md:text-base">
          Genera un catálogo con los productos disponibles para enviarlo por WhatsApp o compartirlo con clientes y mayoristas.
        </p>
      </div>
      <CatalogPdfBuilder />
    </div>
  );
}
