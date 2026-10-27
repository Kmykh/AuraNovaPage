"use client";

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useAdminCategories, useToggleCategoryStatus } from '@/hooks/use-categories';
import { useAdminProducts } from '@/hooks/use-admin-products';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, Edit2, ExternalLink, Plus, Search, Tags } from 'lucide-react';
import { CategoryModal } from '@/components/admin/categories/CategoryModal';
import { Category } from '@/types/categories';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';

export default function AdminCategoriesPage() {
  const { data: categories, isLoading, isError, refetch } = useAdminCategories();
  const { data: products } = useAdminProducts();
  const { mutate: toggleStatus, isPending: isToggling } = useToggleCategoryStatus();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Cuántos productos tiene cada categoría (y cuántos están sin categoría)
  const counts = useMemo(() => {
    const byCategory = new Map<string, number>();
    let uncategorized = 0;
    for (const p of products ?? []) {
      if (p.category?.id) byCategory.set(p.category.id, (byCategory.get(p.category.id) ?? 0) + 1);
      else uncategorized++;
    }
    return { byCategory, uncategorized };
  }, [products]);

  const openModal = (category: Category | null) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const query = searchQuery.trim().toLowerCase();
  const filtered = (categories ?? [])
    .filter(c => !query || c.name.toLowerCase().includes(query) || (c.description ?? '').toLowerCase().includes(query))
    .sort((a, b) => Number(b.isActive) - Number(a.isActive) || a.name.localeCompare(b.name, 'es'));
  const activeCount = categories?.filter(c => c.isActive).length ?? 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-2 font-serif text-2xl font-bold text-brown">
            <Tags className="text-gold" /> Categorías
          </h1>
          <p className="mt-1 text-sage">Ordenan tu catálogo y los filtros de la tienda. Oculta una sin borrarla.</p>
        </div>
        <Button onClick={() => openModal(null)} className="shrink-0 whitespace-nowrap">
          <Plus size={18} className="mr-2" /> Nueva categoría
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sage" />
          <input
            type="text"
            placeholder="Buscar categoría…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-sage/20 bg-white py-2.5 pl-9 pr-4 text-sm outline-none transition-all focus:border-gold focus:ring-1 focus:ring-gold"
          />
        </div>
        {categories && (
          <p className="text-sm text-sage">
            <strong className="text-brown">{activeCount}</strong> visibles · {categories.length - activeCount} ocultas
          </p>
        )}
      </div>

      {counts.uncategorized > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <p>
            {counts.uncategorized === 1 ? 'Hay 1 producto sin categoría' : `Hay ${counts.uncategorized} productos sin categoría`}: no aparecen al filtrar en la tienda.{' '}
            <Link href="/admin/productos" className="font-semibold underline underline-offset-2">Asígnales una en Productos</Link>.
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-40 animate-pulse rounded-[22px] bg-sage/10" />)}
        </div>
      ) : isError ? (
        <ErrorState title="Error" message="No pudimos cargar las categorías." onRetry={() => refetch()} />
      ) : filtered.length === 0 ? (
        <div className="rounded-[22px] border border-sage/10 bg-white p-8">
          <EmptyState
            title={query ? 'No hay resultados' : 'No hay categorías'}
            description={query ? 'Prueba con otro nombre.' : 'Crea la primera, por ejemplo "Ramos" o "Flores por unidad".'}
            icon={<Tags size={32} />}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map(category => {
            const count = counts.byCategory.get(category.id) ?? 0;
            return (
              <article
                key={category.id}
                className={`flex flex-col rounded-[22px] border p-5 shadow-sm transition ${category.isActive ? 'border-sage/15 bg-white hover:border-gold/40' : 'border-dashed border-sage/25 bg-[#FAFAFA]'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className={`min-w-0 ${category.isActive ? '' : 'opacity-60'}`}>
                    <h2 className="truncate font-serif text-lg font-bold text-brown">{category.name}</h2>
                    <p className="text-xs font-semibold text-gold">
                      {products ? (count === 1 ? '1 producto' : `${count} productos`) : '…'}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={category.isActive}
                    aria-label={category.isActive ? `Ocultar ${category.name}` : `Mostrar ${category.name}`}
                    onClick={() => toggleStatus({ id: category.id, isActive: !category.isActive })}
                    disabled={isToggling}
                    className={`relative mt-1 h-6 w-11 shrink-0 rounded-full transition disabled:opacity-50 ${category.isActive ? 'bg-emerald-500' : 'bg-sage/30'}`}
                  >
                    <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${category.isActive ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>

                <p className={`mt-3 line-clamp-2 flex-1 text-sm ${category.description ? 'text-[#6b5a50]' : 'italic text-sage/70'}`}>
                  {category.description || 'Sin descripción'}
                </p>

                <div className="mt-4 flex items-center justify-between gap-2 border-t border-sage/10 pt-3">
                  {category.isActive ? (
                    <Link
                      href={`/productos?category=${encodeURIComponent(category.slug)}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-sage hover:text-brown"
                    >
                      Ver en la tienda <ExternalLink size={12} />
                    </Link>
                  ) : (
                    <span className="text-xs font-semibold text-sage">Oculta en la tienda</span>
                  )}
                  <button
                    type="button"
                    onClick={() => openModal(category)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-sage/20 px-3 py-1.5 text-xs font-semibold text-brown hover:border-gold/50 hover:bg-gold/5"
                  >
                    <Edit2 size={13} /> Editar
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <CategoryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} category={selectedCategory} />
    </div>
  );
}
