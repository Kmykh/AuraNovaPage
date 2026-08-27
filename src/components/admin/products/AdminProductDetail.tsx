"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useAdminProduct, useUpdateStock, useUpdateAvailability } from '@/hooks/use-admin-products';
import { ProductForm } from './ProductForm';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { AlertCircle, Package, ArchiveRestore, ArchiveX, ArrowLeft } from 'lucide-react';
import { ApiProblemDetails } from '@/lib/api-errors';
import { Modal } from '@/components/ui/Modal';
import Link from 'next/link';
import { formatCurrency, getImageUrl } from '@/lib/formatters';

export function AdminProductDetail({ id }: { id: string }) {
  const { data: product, isLoading, error, refetch } = useAdminProduct(id);
  const { mutate: updateStock, isPending: isUpdatingStock } = useUpdateStock(id);
  const { mutate: updateAvailability, isPending: isUpdatingAvailability } = useUpdateAvailability(id);

  const [stockInput, setStockInput] = useState<string>('');
  const [prevProductStock, setPrevProductStock] = useState<number | undefined>(undefined);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);

  // Sincronizar el input de stock cuando carga el producto o se actualiza remotamente
  if (product && product.stock !== prevProductStock) {
    setPrevProductStock(product.stock);
    setStockInput(product.stock.toString());
  }

  const handleStockUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedStock = parseInt(stockInput, 10);
    if (!isNaN(parsedStock) && parsedStock >= 0) {
      updateStock({ stock: parsedStock });
    }
  };

  const handleToggleConfirm = () => {
    if (!product) return;
    updateAvailability(
      { isAvailable: !product.isAvailable },
      { onSuccess: () => setShowAvailabilityModal(false) }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="flex gap-4 items-center">
          <Skeleton variant="rect" className="w-24 h-24 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton variant="text" className="w-64 h-8" />
            <Skeleton variant="text" className="w-32 h-4" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Skeleton variant="rect" className="w-full h-96 rounded-2xl" />
          </div>
          <div className="space-y-6">
            <Skeleton variant="rect" className="w-full h-40 rounded-2xl" />
            <Skeleton variant="rect" className="w-full h-40 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    const isNotFound = error instanceof ApiProblemDetails && error.status === 404;
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-sage/20 shadow-sm max-w-2xl">
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
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/productos" className="text-sage hover:text-brown transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-xl bg-cream flex-shrink-0 overflow-hidden border border-sage/20">
            {product.imageUrl ? (
              <Image src={getImageUrl(product.imageUrl)} alt={product.name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sage text-xs">No img</div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-brown">{product.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${product.isAvailable ? 'bg-gold/10 text-gold' : 'bg-sage/10 text-sage'}`}>
                {product.isAvailable ? 'Disponible' : 'No disponible'}
              </span>
              <span className="text-sm text-sage ml-2">ID: {product.id.split('-')[0]}...</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Formulario Principal */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-medium text-brown mb-4">Información básica</h2>
          <ProductForm mode="edit" initialData={product} />
        </div>

        {/* Acciones Rápidas (Stock & Availability) */}
        <div className="space-y-6">
          <div className="bg-sage/5 p-6 rounded-2xl shadow-sm border border-sage/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-gold/10 text-gold">
                <Package size={20} />
              </div>
              <h2 className="text-lg font-bold text-brown">Inventario</h2>
            </div>
            
            <form onSubmit={handleStockUpdate}>
              <label htmlFor="stockUpdate" className="block text-sm font-bold text-brown mb-2">
                Stock Actual
              </label>
              <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <input
                    id="stockUpdate"
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={stockInput}
                    onChange={(e) => setStockInput(e.target.value)}
                    disabled={isUpdatingStock}
                    className="block w-full px-4 py-3 rounded-xl border border-sage/30 focus:ring-2 focus:ring-gold focus:border-gold outline-none text-xl text-center font-bold"
                  />
                  <Button type="submit" disabled={isUpdatingStock || stockInput === product.stock.toString()} className="px-6">
                    {isUpdatingStock ? '...' : 'Actualizar'}
                  </Button>
                </div>
                <p className="text-xs text-sage leading-relaxed">
                  El stock no afecta directamente la disponibilidad visible en catálogo si tú no la modificas.
                </p>
              </div>
            </form>
          </div>

          <div className={`p-6 rounded-2xl border-2 transition-colors shadow-sm ${product.isAvailable ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${product.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {product.isAvailable ? <ArchiveRestore size={20} /> : <ArchiveX size={20} />}
              </div>
              <h2 className="text-lg font-bold text-brown">Visibilidad</h2>
            </div>
            
            <p className={`text-sm font-medium mb-6 ${product.isAvailable ? 'text-green-800' : 'text-red-800'}`}>
              {product.isAvailable 
                ? 'El producto está VISIBLE en el catálogo y listo para ser comprado.' 
                : 'El producto está OCULTO. Los clientes no podrán verlo ni comprarlo.'}
            </p>
            
            <Button 
              variant={product.isAvailable ? "outline" : "primary"} 
              className={`w-full flex justify-center gap-2 ${product.isAvailable ? 'border-red-200 text-red-600 hover:bg-red-50' : 'bg-green-600 hover:bg-green-700 text-white'}`}
              onClick={() => setShowAvailabilityModal(true)}
            >
              {product.isAvailable ? <><ArchiveX size={16}/> Ocultar del catálogo</> : <><ArchiveRestore size={16}/> Publicar producto</>}
            </Button>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={showAvailabilityModal} 
        onClose={() => setShowAvailabilityModal(false)}
        title={product.isAvailable ? '¿Desactivar producto?' : 'Activar producto'}
      >
        <div className="space-y-6">
          <p className="text-sage">
            {product.isAvailable 
              ? `El producto "${product.name}" dejará de aparecer en el catálogo público.` 
              : `El producto "${product.name}" volverá a aparecer en el catálogo público.`}
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowAvailabilityModal(false)} disabled={isUpdatingAvailability}>
              Cancelar
            </Button>
            <Button onClick={handleToggleConfirm} disabled={isUpdatingAvailability}>
              {isUpdatingAvailability ? 'Procesando...' : 'Confirmar'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
