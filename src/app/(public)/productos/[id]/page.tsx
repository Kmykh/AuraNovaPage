import React from 'react';
import { Metadata } from 'next';
import { ProductDetailClient } from './ProductDetailClient';
import { ProductsService } from '@/services/products.service';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const id = params.id;

  try {
    const product = await ProductsService.getProductById(id);
    return {
      title: `Aura Nova | ${product.name}`,
      description: product.description || `Descubre ${product.name} en Aura Nova.`,
      openGraph: {
        images: product.imageUrl ? [product.imageUrl] : [],
      }
    };
  } catch {
    return {
      title: 'Aura Nova | Detalle de Producto',
      description: 'Cuidado premium de la piel.',
    };
  }
}

export default async function ProductDetailPage(props: Props) {
  const params = await props.params;
  const id = params.id;

  return (
    <div className="pb-12 pt-4">
      <ProductDetailClient id={id} />
    </div>
  );
}
