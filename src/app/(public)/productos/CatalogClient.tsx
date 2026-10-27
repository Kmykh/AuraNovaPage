"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, PackageOpen } from 'lucide-react';
import { useProducts } from '@/hooks/use-products';
import { useCategories } from '@/hooks/use-categories';
import { ProductCard } from '@/components/shared/ProductCard';
import { ProductGridSkeleton } from '@/components/shared/ProductSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { CustomOrderBanner } from '@/components/quotes/CustomOrderBanner';
import { CatalogAudience, CatalogFilterBar, CatalogSort, SORTS } from '@/components/catalog/CatalogFilterBar';
import { ProductResponse } from '@/types/products';
import { formatStageName } from '@/lib/formatters';

const normalize = (value: string) => value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Orden de las secciones: flores, ramos, maceteros, accesorios y el resto
const categoryPriority = (slug: string, name: string): number => {
  const lower = `${name} ${slug}`.toLowerCase();
  if (lower.includes('artesanal') || lower.includes('flor')) return 1;
  if (lower.includes('ramo')) return 2;
  if (lower.includes('macet')) return 3;
  if (lower.includes('accesori') || lower.includes('joya')) return 4;
  return 5;
};

function sortProducts(list: ProductResponse[], sort: CatalogSort) {
  if (sort === 'precio-asc') return [...list].sort((a, b) => a.effectivePrice - b.effectivePrice);
  if (sort === 'precio-desc') return [...list].sort((a, b) => b.effectivePrice - a.effectivePrice);
  if (sort === 'nuevos') return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return list;
}

const grid = 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4';

export function CatalogClient() {
  const { data: products, isLoading, isError, refetch } = useProducts();
  const { data: categories } = useCategories();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const category = searchParams.get('category') ?? '';
  const audience = (searchParams.get('audience') ?? '') as CatalogAudience;
  const campaignOnly = searchParams.get('coleccion') === 'campana';
  const query = searchParams.get('q') ?? '';
  const sortParam = searchParams.get('orden') as CatalogSort | null;
  const sort: CatalogSort = SORTS.some(s => s.value === sortParam) ? sortParam! : 'recomendados';

  const setParams = (changes: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  // Público y búsqueda se aplican a todo; la categoría y la preventa eligen qué se muestra
  const visible = useMemo(() => {
    const q = normalize(query.trim());
    return (products ?? []).filter(p =>
      (!audience || p.audience === audience) &&
      (!q || normalize(`${p.name} ${p.description ?? ''} ${p.category?.name ?? ''}`).includes(q)));
  }, [products, audience, query]);

  const campaignProducts = visible.filter(p => p.isCampaignActive);
  const activeCategories = (categories ?? [])
    .filter(c => visible.some(p => p.category?.id === c.id))
    .sort((a, b) => categoryPriority(a.slug, a.name) - categoryPriority(b.slug, b.name));

  const chips = activeCategories.map(c => {
    const list = visible.filter(p => p.category?.id === c.id);
    return { category: c, count: list.length, imageUrl: list.find(p => p.imageUrl)?.imageUrl ?? null };
  });
  const campaignChip = campaignProducts.length > 0
    ? { name: campaignProducts[0].campaignName || 'Preventa', count: campaignProducts.length, imageUrl: campaignProducts.find(p => p.imageUrl)?.imageUrl ?? null }
    : null;

  // Lo que se muestra con la categoría o la preventa elegidas
  const focused = campaignOnly
    ? campaignProducts
    : category ? visible.filter(p => p.category?.slug === category) : null;
  const resultCount = focused ? focused.length : visible.length;

  const filterBar = (
    <CatalogFilterBar
      categories={chips}
      campaign={campaignChip}
      category={category}
      campaignOnly={campaignOnly}
      audience={audience}
      sort={sort}
      query={query}
      resultCount={resultCount}
      onCategory={slug => setParams({ category: slug === category ? null : slug || null, coleccion: null })}
      onCampaign={() => setParams({ coleccion: campaignOnly ? null : 'campana', category: null })}
      onAudience={value => setParams({ audience: value || null })}
      onSort={value => setParams({ orden: value === 'recomendados' ? null : value })}
      onQuery={value => setParams({ q: value || null })}
      onClear={() => router.replace(pathname, { scroll: false })}
    />
  );

  const topBar = (
    <div className="flex justify-center">
      <CustomOrderBanner />
    </div>
  );

  if (isLoading) {
    return (
      <>
        {topBar}
        <ProductGridSkeleton count={8} />
      </>
    );
  }

  if (isError) {
    return (
      <div className="py-12">
        <ErrorState
          title="No pudimos cargar los detalles"
          message="Tuvimos un inconveniente conectando con nuestro catálogo. Por favor intenta de nuevo."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const empty = (
    <EmptyState
      title={query ? `No encontramos "${query}"` : 'No hay detalles con estos filtros'}
      description="Prueba con otra palabra, cambia el público o mira todo el catálogo."
      icon={<PackageOpen size={32} />}
    />
  );

  // Categoría, preventa o búsqueda: una sola grilla
  if (focused || query) {
    const list = sortProducts(focused ?? visible, sort);
    const selected = categories?.find(c => c.slug === category);
    return (
      <>
        {topBar}
        {filterBar}
        {list.length === 0 ? empty : (
          <section className="space-y-6">
            {campaignOnly && campaignChip ? (
              <CampaignHeader name={campaignChip.name} stage={campaignProducts[0]?.campaignStageName} count={list.length} />
            ) : selected ? (
              <SectionHeader title={selected.name} description={selected.description} count={list.length} />
            ) : (
              <SectionHeader title={`Resultados para "${query}"`} count={list.length} />
            )}
            <div className={grid}>
              {list.map(product => <ProductCard key={product.id} product={product} />)}
            </div>
          </section>
        )}
      </>
    );
  }

  // Todo el catálogo por secciones (la preventa primero; sus productos no se repiten abajo)
  const regular = visible.filter(p => !p.isCampaignActive);
  const sections = activeCategories
    .map(c => ({ category: c, products: sortProducts(regular.filter(p => p.category?.id === c.id), sort) }))
    .filter(s => s.products.length > 0);
  const uncategorized = sortProducts(regular.filter(p => !p.category), sort);

  return (
    <>
      {topBar}
      {filterBar}
      {visible.length === 0 ? empty : (
        <div className="space-y-14 sm:space-y-16">
          {campaignProducts.length > 0 && campaignChip && (
            <section className="scroll-mt-40 space-y-6" id="sec-campana-activa">
              <CampaignHeader
                name={campaignChip.name}
                stage={campaignProducts[0]?.campaignStageName}
                count={campaignProducts.length}
                onSeeAll={() => setParams({ coleccion: 'campana', category: null })}
              />
              <div className={grid}>
                {sortProducts(campaignProducts, sort).map(product => <ProductCard key={product.id} product={product} />)}
              </div>
            </section>
          )}

          {sections.map(({ category: cat, products: list }) => (
            <section key={cat.id} className="scroll-mt-40 space-y-6" id={`sec-${cat.slug}`}>
              <SectionHeader
                title={cat.name}
                description={cat.description}
                count={list.length}
                href={`${pathname}?category=${encodeURIComponent(cat.slug)}${audience ? `&audience=${audience}` : ''}`}
              />
              <div className={grid}>
                {list.map(product => <ProductCard key={product.id} product={product} />)}
              </div>
            </section>
          ))}

          {uncategorized.length > 0 && (
            <section className="scroll-mt-40 space-y-6">
              <SectionHeader title="Más detalles" count={uncategorized.length} />
              <div className={grid}>
                {uncategorized.map(product => <ProductCard key={product.id} product={product} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </>
  );
}

/** Título de sección: nombre grande, descripción de la categoría y cuántos hay, con enlace para ver solo esa. */
function SectionHeader({ title, description, count, href }: { title: string; description?: string | null; count: number; href?: string }) {
  return (
    <header className="flex items-end justify-between gap-4">
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#c8a96b] sm:text-[11px]">
          <span className="h-px w-6 bg-[#c8a96b]/60" />
          {count} {count === 1 ? 'detalle' : 'detalles'}
        </p>
        <h2 className="mt-1 font-serif text-[1.7rem] font-bold leading-tight text-brown sm:text-4xl">{title}</h2>
        {description && <p className="mt-1 max-w-2xl text-sm text-sage">{description}</p>}
      </div>
      {href && (
        <Link href={href} scroll={false} className="group hidden shrink-0 items-center gap-1.5 rounded-full border border-[#c8a96b]/40 bg-white/80 px-4 py-2 text-xs font-bold text-[#8c6d36] transition hover:border-[#c8a96b] hover:bg-white sm:inline-flex">
          Ver solo esta <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
        </Link>
      )}
    </header>
  );
}

function CampaignHeader({ name, stage, count, onSeeAll }: { name: string; stage?: string; count: number; onSeeAll?: () => void }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-[#edd7cd] bg-gradient-to-br from-[#fcf7f4] via-[#f8ede6] to-[#f4e4dc] p-6 shadow-sm sm:p-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.25em] text-[#8f2d3b]">
            <span className="h-px w-6 bg-[#8f2d3b]/50" />
            {formatStageName(stage).toUpperCase()}
          </p>
          <h2 className="font-serif text-2xl font-bold tracking-tight text-[#3d2e28] sm:text-3xl">{name}</h2>
          <p className="mt-1 text-xs text-[#705e55] sm:text-sm">Precios especiales por tiempo limitado. Reserva el tuyo antes que se agoten.</p>
        </div>
        <div className="flex shrink-0 items-center gap-2 self-start sm:self-auto">
          <span className="rounded-full border border-[#edd7cd] bg-white/95 px-3.5 py-1.5 text-xs font-bold text-[#8f2d3b]">
            {count} {count === 1 ? 'detalle' : 'detalles'}
          </span>
          {onSeeAll && (
            <button type="button" onClick={onSeeAll} className="rounded-full bg-[#8f2d3b] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#76232f]">
              Ver solo ofertas
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
