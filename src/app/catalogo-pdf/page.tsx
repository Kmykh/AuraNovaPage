import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { CatalogDocument } from '@/components/catalog/CatalogDocument';

export const metadata: Metadata = {
  title: 'Catálogo Aura Nova',
  robots: { index: false, follow: false },
};

/**
 * Documento A4 del catálogo (portada, páginas por categoría y "cómo pedir"), pensado para imprimir o
 * guardar como PDF. Vive fuera del layout del panel para que el PDF salga sin menús. Solo muestra
 * información pública del catálogo.
 */
export default function CatalogPdfPage() {
  return (
    <Suspense fallback={null}>
      <CatalogDocument />
    </Suspense>
  );
}
