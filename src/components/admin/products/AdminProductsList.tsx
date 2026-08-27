"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAdminProducts, useUpdateAvailability } from '@/hooks/use-admin-products';
import { ProductResponse } from '@/types/products';
import { formatCurrency, getImageUrl } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { AlertCircle, Plus, Search, Edit2, ArchiveX, ArchiveRestore, PackageOpen } from 'lucide-react';
import { ApiProblemDetails } from '@/lib/api-errors';

export function AdminProductsList() {
  const { data: products, isLoading, error, refetch } = useAdminProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'unavailable'>('all');
  
  // Modal states para desactivar/reactivar
  const [productToToggle, setProductToToggle] = useState<ProductResponse | null>(null);
  const { mutate: updateAvailability, isPending: isUpdating } = useUpdateAvailability(productToToggle?.id || '');

  const filteredProducts = products?.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (p.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'available') return matchesSearch && p.isAvailable;
    if (statusFilter === 'unavailable') return matchesSearch && !p.isAvailable;
    return matchesSearch;
  });

  const handleToggleConfirm = () => {
    if (!productToToggle) return;
    updateAvailability(
      { isAvailable: !productToToggle.isAvailable },
      {
        onSuccess: () => setProductToToggle(null),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} variant="rect" className="w-full h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    const isForbidden = error instanceof ApiProblemDetails && error.status === 403;
    const isRateLimit = error instanceof ApiProblemDetails && error.status === 429;
    
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-sage/20 shadow-sm">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <h2 className="text-xl font-serif text-brown font-semibold mb-2">
          {isForbidden ? 'Acceso denegado' : isRateLimit ? 'Demasiadas solicitudes' : 'Error de conexión'}
        </h2>
        <p className="text-sage max-w-md mb-6">
          {isForbidden 
            ? 'No tienes permisos para ver los productos.' 
            : isRateLimit 
            ? 'Espera un momento e inténtalo de nuevo.' 
            : 'No pudimos cargar los productos.'}
        </p>
        <Button variant="outline" onClick={() => refetch()}>Reintentar</Button>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-sage/20 shadow-sm">
        <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center mb-4 text-gold">
          <PackageOpen className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-serif text-brown font-semibold mb-2">No hay productos registrados</h2>
        <p className="text-sage max-w-md mb-6">Agrega el primer detalle de Aura Nova para comenzar.</p>
        <Link href="/admin/productos/nuevo">
          <Button className="flex items-center gap-2">
            <Plus size={18} /> Nuevo producto
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/50 backdrop-blur-sm p-2 rounded-full border border-sage/20 shadow-sm max-w-3xl">
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-sage/60 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Buscar joyas florales por nombre..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-transparent border-none rounded-full focus:ring-0 outline-none text-brown placeholder:text-sage/50"
          />
        </div>
        
        <div className="w-full sm:w-auto shrink-0 flex items-center pr-2">
          <div className="h-6 w-px bg-sage/20 mx-2 hidden sm:block"></div>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'available' | 'unavailable')}
            className="w-full sm:w-auto px-4 py-2 bg-transparent border-none rounded-full text-brown font-medium focus:ring-0 outline-none cursor-pointer appearance-none hover:bg-sage/5 transition-colors"
          >
            <option value="all">Todos los estados</option>
            <option value="available">Activos en tienda</option>
            <option value="unavailable">Ocultos</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-sage/10 overflow-hidden">
        {/* Vista Mobile / Tablet */}
        <div className="grid grid-cols-1 md:hidden divide-y divide-sage/10">
          {filteredProducts?.map((p) => (
            <div key={p.id} className="p-4 flex flex-col gap-4">
              <div className="flex items-start gap-4">
                <div className="relative w-16 h-16 rounded-lg bg-cream flex-shrink-0 overflow-hidden">
                  {p.imageUrl ? (
                    <Image src={getImageUrl(p.imageUrl)} alt={p.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sage">No img</div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-brown">{p.name}</h3>
                  <div className="flex gap-2 text-sm text-sage mt-1">
                    <span>{formatCurrency(p.price)}</span>
                    <span>•</span>
                    <span>Stock: {p.stock}</span>
                  </div>
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${p.isAvailable ? 'bg-gold/10 text-gold' : 'bg-sage/10 text-sage'}`}>
                      {p.isAvailable ? 'Disponible' : 'No disponible'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 w-full">
                <Link href={`/admin/productos/${p.id}`} className="flex-1">
                  <Button variant="outline" className="w-full h-9 flex items-center justify-center gap-2">
                    <Edit2 size={16} /> Editar
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="flex-1 h-9 flex items-center justify-center gap-2"
                  onClick={() => setProductToToggle(p)}
                >
                  {p.isAvailable ? <><ArchiveX size={16} /> Desactivar</> : <><ArchiveRestore size={16} /> Activar</>}
                </Button>
              </div>
            </div>
          ))}
          {filteredProducts?.length === 0 && (
            <div className="p-8 text-center text-sage">No se encontraron resultados para tu búsqueda.</div>
          )}
        </div>

        {/* Vista Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm text-brown">
            <thead className="bg-cream/30 text-sage border-b border-sage/10">
              <tr>
                <th className="px-6 py-4 font-medium">Producto</th>
                <th className="px-6 py-4 font-medium">Precio</th>
                <th className="px-6 py-4 font-medium">Stock</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage/10">
              {filteredProducts?.map((p) => (
                <tr key={p.id} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="relative w-12 h-12 rounded-lg bg-cream flex-shrink-0 overflow-hidden border border-sage/20">
                        {p.imageUrl ? (
                          <Image src={getImageUrl(p.imageUrl)} alt={p.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sage text-xs">No img</div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">{p.name}</p>
                        <p className="text-sage text-xs max-w-[200px] truncate" title={p.description ?? undefined}>{p.description || 'Sin descripción'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium">{formatCurrency(p.price)}</td>
                  <td className="px-6 py-4">
                    <span className="font-medium">{p.stock}</span> {p.stock < 5 && <span className="text-xs text-rose ml-1">(Pocas)</span>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${p.isAvailable ? 'bg-gold/10 text-gold' : 'bg-sage/10 text-sage'}`}>
                      {p.isAvailable ? 'Disponible' : 'No disponible'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/productos/${p.id}`}>
                        <Button variant="outline" className="h-8 px-3 text-xs flex items-center gap-1">
                          <Edit2 size={14} /> Editar
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        className="h-8 px-3 text-xs flex items-center gap-1"
                        onClick={() => setProductToToggle(p)}
                      >
                        {p.isAvailable ? <ArchiveX size={14} /> : <ArchiveRestore size={14} />}
                        <span className="sr-only sm:not-sr-only sm:ml-1">
                          {p.isAvailable ? 'Desactivar' : 'Activar'}
                        </span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sage">
                    No se encontraron productos que coincidan con tu búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={!!productToToggle} 
        onClose={() => setProductToToggle(null)}
        title={productToToggle?.isAvailable ? '¿Desactivar producto?' : 'Activar producto'}
      >
        <div className="space-y-6">
          <p className="text-sage">
            {productToToggle?.isAvailable 
              ? `El producto "${productToToggle.name}" dejará de aparecer en el catálogo público y los clientes no podrán comprarlo.` 
              : `El producto "${productToToggle?.name}" volverá a aparecer en el catálogo público.`}
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setProductToToggle(null)} disabled={isUpdating}>
              Cancelar
            </Button>
            <Button onClick={handleToggleConfirm} disabled={isUpdating}>
              {isUpdating ? 'Procesando...' : 'Confirmar'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
