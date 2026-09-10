"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAdminProducts, useUpdateAvailability } from '@/hooks/use-admin-products';
import { ProductResponse } from '@/types/products';
import { formatCurrency, getImageUrl } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { CategoryBadge } from '@/components/shared/CategoryBadge';
import { AudienceBadge } from '@/components/shared/AudienceBadge';
import { Modal } from '@/components/ui/Modal';
import { AlertCircle, Plus, Search, Edit2, ArchiveX, ArchiveRestore, PackageOpen, Eye, EyeOff, Package, Grid3X3, List } from 'lucide-react';
import { ApiProblemDetails } from '@/lib/api-errors';

export function AdminProductsList() {
  const { data: products, isLoading, error, refetch } = useAdminProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'unavailable'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
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

  const totalProducts = products?.length || 0;
  const availableCount = products?.filter(p => p.isAvailable).length || 0;
  const unavailableCount = totalProducts - availableCount;

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Stats skeleton */}
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} variant="rect" className="w-full h-20 rounded-xl" />
          ))}
        </div>
        {/* Cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} variant="rect" className="w-full h-72 rounded-2xl" />
          ))}
        </div>
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

      {/* Mini Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => setStatusFilter('all')}
          className={`group relative overflow-hidden rounded-xl p-4 text-left transition-all duration-200 border ${
            statusFilter === 'all' 
              ? 'bg-brown text-white border-brown shadow-md' 
              : 'bg-white text-brown border-sage/20 hover:border-gold/40 hover:shadow-sm'
          }`}
        >
          <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-white/10 -translate-y-6 translate-x-6 group-hover:scale-110 transition-transform" />
          <p className={`text-2xl font-bold ${statusFilter === 'all' ? 'text-white' : 'text-brown'}`}>{totalProducts}</p>
          <p className={`text-xs font-medium mt-0.5 ${statusFilter === 'all' ? 'text-white/80' : 'text-sage'}`}>Total productos</p>
        </button>
        <button
          onClick={() => setStatusFilter('available')}
          className={`group relative overflow-hidden rounded-xl p-4 text-left transition-all duration-200 border ${
            statusFilter === 'available' 
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' 
              : 'bg-white text-brown border-sage/20 hover:border-emerald-300 hover:shadow-sm'
          }`}
        >
          <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-white/10 -translate-y-6 translate-x-6 group-hover:scale-110 transition-transform" />
          <p className={`text-2xl font-bold ${statusFilter === 'available' ? 'text-white' : 'text-emerald-600'}`}>{availableCount}</p>
          <p className={`text-xs font-medium mt-0.5 ${statusFilter === 'available' ? 'text-white/80' : 'text-sage'}`}>Disponibles</p>
        </button>
        <button
          onClick={() => setStatusFilter('unavailable')}
          className={`group relative overflow-hidden rounded-xl p-4 text-left transition-all duration-200 border ${
            statusFilter === 'unavailable' 
              ? 'bg-rose-500 text-white border-rose-500 shadow-md' 
              : 'bg-white text-brown border-sage/20 hover:border-rose-300 hover:shadow-sm'
          }`}
        >
          <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-white/10 -translate-y-6 translate-x-6 group-hover:scale-110 transition-transform" />
          <p className={`text-2xl font-bold ${statusFilter === 'unavailable' ? 'text-white' : 'text-rose-500'}`}>{unavailableCount}</p>
          <p className={`text-xs font-medium mt-0.5 ${statusFilter === 'unavailable' ? 'text-white/80' : 'text-sage'}`}>Ocultos</p>
        </button>
      </div>

      {/* Search Bar + View Toggle */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-sage/50 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Buscar por nombre o descripción..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-sage/20 rounded-xl focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 text-sm text-brown placeholder:text-sage/50 transition-all"
          />
        </div>
        <div className="flex items-center gap-1 bg-white border border-sage/20 rounded-xl p-1 self-end">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-brown text-white shadow-sm' : 'text-sage hover:text-brown'}`}
            title="Vista cuadrícula"
          >
            <Grid3X3 size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-brown text-white shadow-sm' : 'text-sage hover:text-brown'}`}
            title="Vista lista"
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Products Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProducts?.map((p) => (
            <div 
              key={p.id} 
              className={`group relative bg-white rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                !p.isAvailable ? 'border-sage/20 opacity-80 hover:opacity-100' : 'border-sage/10'
              }`}
            >
              {/* Image */}
              <div className="relative aspect-square bg-cream/50 overflow-hidden">
                {p.imageUrl ? (
                  <Image 
                    src={getImageUrl(p.imageUrl)} 
                    alt={p.name} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-sage/40">
                    <Package size={40} strokeWidth={1} />
                    <span className="text-xs mt-2">Sin imagen</span>
                  </div>
                )}

                {/* Top bar: Availability + Stock badges */}
                <div className="absolute top-3 left-3 right-3 flex items-start justify-between pointer-events-none">
                  {/* Stock warning (left) */}
                  <div>
                    {p.stock < 5 && p.stock > 0 && (
                      <span className="bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
                        ¡Pocas unidades!
                      </span>
                    )}
                    {p.stock === 0 && (
                      <span className="bg-rose-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
                        Sin stock
                      </span>
                    )}
                  </div>

                  {/* Availability status (right) */}
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md backdrop-blur-sm ${
                    p.isAvailable 
                      ? 'bg-emerald-500/90 text-white' 
                      : 'bg-stone-800/80 text-stone-200'
                  }`}>
                    {p.isAvailable ? <Eye size={10} /> : <EyeOff size={10} />}
                    {p.isAvailable ? 'Público' : 'Oculto'}
                  </span>
                </div>

                {/* Unavailable overlay (subtle) */}
                {!p.isAvailable && (
                  <div className="absolute inset-0 bg-brown/15 pointer-events-none" />
                )}

                {/* Quick actions on hover — buttons with text */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-end gap-2">
                  <Link href={`/admin/productos/${p.id}`}>
                    <button className="bg-white/95 text-brown px-3 py-1.5 rounded-lg hover:bg-white shadow-md transition-all text-xs font-semibold flex items-center gap-1.5">
                      <Edit2 size={13} /> Editar
                    </button>
                  </Link>
                  <button 
                    className="bg-white/95 text-brown px-3 py-1.5 rounded-lg hover:bg-white shadow-md transition-all text-xs font-semibold flex items-center gap-1.5" 
                    onClick={() => setProductToToggle(p)}
                  >
                    {p.isAvailable ? <><EyeOff size={13} /> Ocultar</> : <><Eye size={13} /> Mostrar</>}
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h3 className="font-semibold text-brown text-sm leading-tight line-clamp-2">{p.name}</h3>
                  <span className="font-bold text-gold text-sm shrink-0">{formatCurrency(p.price)}</span>
                </div>

                <p className="text-xs text-sage line-clamp-1 mb-3">{p.description || 'Sin descripción'}</p>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1">
                    <CategoryBadge categoryName={p.category?.name} className="text-[10px] px-2 py-0.5 rounded-full" />
                    <AudienceBadge audience={p.audience} className="text-[10px] px-2 py-0.5 rounded-full" />
                  </div>
                  <span className={`text-[11px] font-bold shrink-0 px-2 py-0.5 rounded-full ${
                    p.stock === 0 ? 'bg-rose-50 text-rose-500' : p.stock < 5 ? 'bg-amber-50 text-amber-600' : 'bg-sage/10 text-sage'
                  }`}>
                    {p.stock} uds
                  </span>
                </div>
              </div>
            </div>
          ))}
          {filteredProducts?.length === 0 && (
            <div className="col-span-full py-16 text-center text-sage">
              <Search className="w-10 h-10 mx-auto mb-3 text-sage/30" />
              <p className="font-medium text-brown">No se encontraron productos</p>
              <p className="text-sm mt-1">Intenta ajustar tu búsqueda o filtros</p>
            </div>
          )}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-2xl shadow-sm border border-sage/10 overflow-hidden">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm text-brown">
              <thead className="bg-cream/30 text-sage border-b border-sage/10">
                <tr>
                  <th className="px-6 py-4 font-medium">Producto</th>
                  <th className="px-6 py-4 font-medium">Categoría</th>
                  <th className="px-6 py-4 font-medium">Público</th>
                  <th className="px-6 py-4 font-medium">Precio</th>
                  <th className="px-6 py-4 font-medium">Stock</th>
                  <th className="px-6 py-4 font-medium">Estado</th>
                  <th className="px-6 py-4 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage/10">
                {filteredProducts?.map((p) => (
                  <tr key={p.id} className="hover:bg-cream/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded-xl bg-cream flex-shrink-0 overflow-hidden border border-sage/20">
                          {p.imageUrl ? (
                            <Image src={getImageUrl(p.imageUrl)} alt={p.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-sage text-xs">
                              <Package size={16} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold">{p.name}</p>
                          <p className="text-sage text-xs max-w-[200px] truncate" title={p.description ?? undefined}>{p.description || 'Sin descripción'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <CategoryBadge categoryName={p.category?.name} />
                    </td>
                    <td className="px-6 py-4">
                      <AudienceBadge audience={p.audience} />
                    </td>
                    <td className="px-6 py-4 font-semibold">{formatCurrency(p.price)}</td>
                    <td className="px-6 py-4">
                      <span className="font-medium">{p.stock}</span> 
                      {p.stock < 5 && p.stock > 0 && <span className="text-xs text-amber-500 ml-1 font-medium">(Pocas)</span>}
                      {p.stock === 0 && <span className="text-xs text-rose-500 ml-1 font-medium">(Agotado)</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        p.isAvailable 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' 
                          : 'bg-stone-100 text-stone-500 border border-stone-200/50'
                      }`}>
                        {p.isAvailable ? <Eye size={12} /> : <EyeOff size={12} />}
                        {p.isAvailable ? 'Visible' : 'Oculto'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/admin/productos/${p.id}`}>
                          <Button variant="outline" className="h-8 px-3 text-xs flex items-center gap-1.5 hover:border-gold hover:text-gold">
                            <Edit2 size={13} /> Editar
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          className="h-8 px-3 text-xs flex items-center gap-1.5"
                          onClick={() => setProductToToggle(p)}
                        >
                          {p.isAvailable ? <EyeOff size={13} /> : <Eye size={13} />}
                          <span>{p.isAvailable ? 'Ocultar' : 'Mostrar'}</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredProducts?.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-sage">
                      No se encontraron productos que coincidan con tu búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile list fallback */}
          <div className="md:hidden divide-y divide-sage/10">
            {filteredProducts?.map((p) => (
              <div key={p.id} className="p-4 flex items-center gap-4">
                <div className="relative w-14 h-14 rounded-xl bg-cream flex-shrink-0 overflow-hidden border border-sage/20">
                  {p.imageUrl ? (
                    <Image src={getImageUrl(p.imageUrl)} alt={p.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sage">
                      <Package size={18} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-brown text-sm truncate">{p.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-bold text-sm text-brown">{formatCurrency(p.price)}</span>
                    <span className="text-xs text-sage">• Stock: {p.stock}</span>
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <Link href={`/admin/productos/${p.id}`}>
                    <button className="p-2 text-sage hover:text-gold transition-colors">
                      <Edit2 size={16} />
                    </button>
                  </Link>
                  <button 
                    className="p-2 text-sage hover:text-brown transition-colors"
                    onClick={() => setProductToToggle(p)}
                  >
                    {p.isAvailable ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
