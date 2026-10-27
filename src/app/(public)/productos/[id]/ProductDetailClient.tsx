"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft, PackageOpen, ShoppingBag, Check, ChevronRight, Minus, Plus, Lightbulb, Mail,
  Truck, ShieldCheck, HandHeart, Pencil, Trash2,
} from 'lucide-react';
import { useProduct } from '@/hooks/use-product';
import { useProducts } from '@/hooks/use-products';
import { useCustomizationOptions } from '@/hooks/use-customization-options';
import { useCartStore } from '@/store/cart.store';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { ProductCard } from '@/components/shared/ProductCard';
import { ColorSwatch } from '@/components/shared/ColorSwatch';
import { ItemOptions } from '@/components/shared/ItemOptions';
import { ProductGallery } from '@/components/product/ProductGallery';
import { CampaignBanner } from '@/components/product/CampaignBanner';
import { PhraseCardModal } from '@/components/product/PhraseCardEditor';
import { CardArt } from '@/components/card/CardArt';
import { CardDesign, EMPTY_CARD, cardTheme } from '@/lib/card-design';
import { formatCurrency, formatStageName, getImageUrl } from '@/lib/formatters';
import { MIXED_COLORS, colorBackground, isLightColor, productImages } from '@/lib/product-options';
import { ApiProblemDetails } from '@/lib/api-errors';

import angelesImg from '../../images/angeles.png';

const MAX_SELECTIONS = 5;

interface ProductDetailClientProps {
  id: string;
}

/** Con límite 1 (flor por unidad) elegir otra opción reemplaza la anterior; si no, se suma hasta el límite. */
function toggleInList(list: string[], value: string, limit: number): string[] {
  if (limit <= 1) return [value];
  if (list.includes(value)) return list.length > 1 ? list.filter(v => v !== value) : list;
  return list.length >= limit ? [...list.slice(1), value] : [...list, value];
}

/** Paso de la personalización: número unido por una línea al siguiente, y lo elegido a la derecha. */
function Step({ step, title, hint, summary, last, children }: {
  step: number; title: string; hint?: string; summary?: string; last?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="relative grid grid-cols-[2rem_1fr] gap-x-3.5">
      <div className="flex flex-col items-center">
        <span className="z-10 flex h-8 w-8 items-center justify-center rounded-full border border-[#c8a96b]/50 bg-[#fffdf8] font-serif text-sm font-bold text-[#8f6d28]">
          {step}
        </span>
        {!last && <span className="mt-1 w-px flex-1 bg-gradient-to-b from-[#c8a96b]/50 to-[#c8a96b]/10" />}
      </div>
      <div className={last ? '' : 'pb-7'}>
        <div className="mb-3 flex min-h-8 flex-wrap items-center justify-between gap-x-3 gap-y-0.5">
          <div>
            <h3 className="font-serif text-base font-bold text-[#4a3933]">{title}</h3>
            {hint && <p className="text-xs text-[#887870]">{hint}</p>}
          </div>
          {summary && <span className="max-w-full truncate text-xs font-semibold text-[#8f6d28]">{summary}</span>}
        </div>
        {children}
      </div>
    </div>
  );
}

function ExtraToggle({ active, onToggle, icon, title, hint }: { active: boolean; onToggle: () => void; icon: React.ReactNode; title: string; hint: string }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left transition ${
        active ? 'border-[#c8a96b] bg-[#fdf8ee] shadow-sm' : 'border-[#e8dcdc] bg-white hover:border-[#c8a96b]/50'
      }`}
    >
      <span className={`flex h-10 w-10 items-center justify-center rounded-full ${active ? 'bg-[#c8a96b] text-white' : 'bg-[#fdf8ee] text-[#c8a96b]'}`}>{icon}</span>
      <span className="flex-1">
        <span className="block text-sm font-bold text-[#4a3933]">{title}</span>
        <span className="block text-xs text-[#887870]">{hint}</span>
      </span>
      <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${active ? 'border-[#c8a96b] bg-[#c8a96b] text-white' : 'border-[#d9cfc8]'}`}>
        {active && <Check className="h-3 w-3" strokeWidth={3} />}
      </span>
    </button>
  );
}

export function ProductDetailClient({ id }: ProductDetailClientProps) {
  const router = useRouter();
  const { data: product, isLoading, error, refetch } = useProduct(id);
  const { data: allProducts } = useProducts();
  const { options } = useCustomizationOptions();
  const addItem = useCartStore(state => state.addItem);

  // null = todavía no eligió: se usa la primera opción del producto
  const [chosenColors, setChosenColors] = useState<string[] | null>(null);
  const [chosenFlowers, setChosenFlowers] = useState<string[] | null>(null);
  const [isMixed, setIsMixed] = useState(false);
  const [hasLights, setHasLights] = useState(false);
  const [hasButterfly, setHasButterfly] = useState(false);
  const [hasPhraseCard, setHasPhraseCard] = useState(false);
  const [card, setCard] = useState<CardDesign>(EMPTY_CARD);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-24 md:px-8 md:pt-32">
        <div className="grid animate-pulse grid-cols-1 gap-10 md:grid-cols-2 lg:gap-16">
          <Skeleton variant="card" className="aspect-[4/5] w-full rounded-[2rem]" />
          <div className="flex flex-col pt-4">
            <Skeleton variant="text" className="mb-3 h-12 w-2/3 rounded-xl" />
            <Skeleton variant="text" className="mb-8 h-8 w-1/3 rounded-xl" />
            <Skeleton variant="text" className="mb-2 h-3 w-full rounded-full" />
            <Skeleton variant="text" className="mb-8 h-3 w-4/5 rounded-full" />
            <Skeleton variant="rect" className="mb-4 h-32 w-full rounded-2xl" />
            <Skeleton variant="rect" className="h-12 w-full rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    const isNotFound = error instanceof ApiProblemDetails && error.status === 404;
    return (
      <div className="mx-auto max-w-3xl px-4 py-24">
        {isNotFound ? (
          <div className="flex min-h-[300px] flex-col items-center rounded-2xl border border-sage/10 bg-[#F9F8F6] p-8 text-center">
            <PackageOpen className="mb-4 h-16 w-16 text-sage/40" strokeWidth={1} />
            <h3 className="mb-2 font-serif text-xl font-semibold text-brown">Joya floral no encontrada</h3>
            <p className="mb-6 text-sage">El detalle que buscas no existe o ya no está disponible en nuestro catálogo.</p>
            <Link href="/productos" tabIndex={-1}>
              <Button variant="outline" className="rounded-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a la colección
              </Button>
            </Link>
          </div>
        ) : (
          <ErrorState
            title="No pudimos cargar el producto"
            message="Hubo un inconveniente conectando con nuestro sistema."
            onRetry={() => refetch()}
          />
        )}
      </div>
    );
  }

  if (!product) return null;

  const isOutOfStock = !product.isAvailable || product.stock <= 0;
  const isLowStock = !isOutOfStock && product.stock <= 3;
  const maxQuantity = Math.max(1, Math.min(product.stock, 20));

  const availableColors = product.availableColors ?? [];
  const availableFlowers = product.availableFlowerTypes ?? [];
  // Flor por unidad: un solo color y un tipo de flor (sin surtido)
  const limit = Math.min(product.maxChoices ?? MAX_SELECTIONS, MAX_SELECTIONS);
  const single = limit === 1;
  const colors = chosenColors ?? (availableColors.length ? [availableColors[0]] : []);
  const flowers = chosenFlowers ?? (availableFlowers.length ? [availableFlowers[0]] : []);
  const finalColors = isMixed && !single ? [MIXED_COLORS] : colors;
  const cardReady = hasPhraseCard && card.text.trim().length > 0;
  const total = product.effectivePrice * quantity;

  const sections = [
    availableColors.length > 0 && 'colors',
    availableFlowers.length > 0 && 'flowers',
    (product.allowsLights || product.allowsButterfly) && 'extras',
    product.allowsPhraseCard && 'card',
  ].filter(Boolean) as string[];
  const stepOf = (key: string) => sections.indexOf(key) + 1;

  const suggested = (() => {
    const others = allProducts?.filter(p => p.id !== product.id) ?? [];
    const gifts = others.filter(p => /accesorio|llavero|peluche|regalo/i.test(p.category?.name ?? ''));
    return (gifts.length >= 2 ? gifts : others).slice(0, 4);
  })();

  const addToCart = (goToCheckout: boolean) => {
    if (isOutOfStock) return;
    if (hasPhraseCard && !card.text.trim()) {
      toast.error('Falta la dedicatoria', { description: 'Escribe el mensaje de la tarjeta o quita la opción.' });
      setIsCardModalOpen(true);
      return;
    }

    addItem({
      productId: product.id,
      name: product.name,
      price: product.effectivePrice,
      quantity,
      imageUrl: getImageUrl(product.imageUrl),
      stock: product.stock,
      isAvailable: product.isAvailable,
      selectedColors: finalColors,
      selectedFlowerTypes: flowers,
      hasLights: product.allowsLights ? hasLights : undefined,
      hasButterfly: product.allowsButterfly ? hasButterfly : undefined,
      hasPhraseCard: product.allowsPhraseCard ? hasPhraseCard : undefined,
      phraseText: hasPhraseCard ? card.text.trim() : undefined,
      phraseFont: hasPhraseCard ? card.font : undefined,
      phraseTo: hasPhraseCard ? card.to.trim() || undefined : undefined,
      phraseFrom: hasPhraseCard ? card.from.trim() || undefined : undefined,
      phraseTheme: hasPhraseCard ? card.theme : undefined,
      cardPhoto: hasPhraseCard && card.theme === 'foto' && card.photo ? card.photo : undefined,
    });

    if (goToCheckout) {
      router.push('/checkout');
      return;
    }
    toast.success('Agregado al carrito', {
      description: `${quantity} × ${product.name}`,
      icon: <ShoppingBag className="h-4 w-4" />,
      action: { label: 'Ver carrito', onClick: () => router.push('/carrito') },
    });
  };

  const description = product.description ?? '';
  const longDescription = description.length > 220;

  return (
    // overflow-x-clip (no overflow-hidden): así la galería puede quedarse fija al bajar
    <div className="relative overflow-x-clip">
      {/* Decoración suave de marca */}
      <div className="pointer-events-none absolute -top-8 right-0 w-72 translate-x-1/4 -rotate-12 opacity-[0.06] mix-blend-multiply md:w-[28rem]">
        <Image src={angelesImg} alt="" className="h-full w-full object-contain" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-32 pt-24 md:px-8 md:pb-12 md:pt-28">
        {/* Migas */}
        <nav className="mb-5 flex items-center gap-1.5 text-xs text-[#887870]" aria-label="Ruta">
          <Link href="/productos" className="font-semibold hover:text-[#4a3933]">Catálogo</Link>
          {product.category?.name && (
            <>
              <ChevronRight className="h-3.5 w-3.5" />
              <span>{product.category.name}</span>
            </>
          )}
        </nav>

        <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-2 lg:gap-14">
          {/* Galería */}
          <div className="md:sticky md:top-24">
            <ProductGallery
              images={productImages(product)}
              name={product.name}
              badge={product.isCampaignActive ? (
                <span className="rounded-full bg-[#8f2d3b] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow">
                  {formatStageName(product.campaignStageName)}
                </span>
              ) : undefined}
            />
          </div>

          {/* Información y personalización */}
          <div className="flex flex-col gap-6">
            <header>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                {isOutOfStock ? (
                  <span className="rounded-full border border-red-100 bg-red-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-red-600">Agotado</span>
                ) : isLowStock ? (
                  <span className="rounded-full border border-[#c8a96b]/30 bg-[#c8a96b]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#8c6d36]">
                    {product.stock === 1 ? '¡Queda 1!' : `¡Quedan ${product.stock}!`}
                  </span>
                ) : (
                  <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">Disponible</span>
                )}
              </div>
              <h1 className="font-serif text-4xl font-bold leading-[1.05] tracking-tight text-[#4a3933] md:text-5xl">
                {product.name}
              </h1>
              <div className="mt-3 flex items-baseline gap-3">
                <span className={`font-serif text-3xl font-bold md:text-4xl ${product.isCampaignActive ? 'text-[#8f2d3b]' : 'text-[#3d2e28]'}`}>
                  {formatCurrency(product.effectivePrice)}
                </span>
                {product.isCampaignActive && product.price > product.effectivePrice && (
                  <span className="font-serif text-lg text-stone-400 line-through">{formatCurrency(product.price)}</span>
                )}
              </div>
            </header>

            <CampaignBanner product={product} />

            {description && (
              <div>
                <p className={`whitespace-pre-wrap text-sm leading-[1.75] text-[#6b5a50] ${!isDescriptionExpanded && longDescription ? 'line-clamp-4' : ''}`}>
                  {description}
                </p>
                {longDescription && (
                  <button
                    type="button"
                    onClick={() => setIsDescriptionExpanded(v => !v)}
                    className="mt-1.5 text-xs font-bold text-[#b08a4e] hover:text-[#4a3933]"
                  >
                    {isDescriptionExpanded ? 'Ver menos' : 'Leer más'}
                  </button>
                )}
              </div>
            )}

            {sections.length > 0 && (
              <section className="relative overflow-hidden rounded-[1.75rem] border border-[#e8dcdc]/80 bg-white/85 p-5 shadow-[0_18px_40px_-24px_rgba(74,57,51,0.35)] backdrop-blur sm:p-7">
                <div className="mb-6 flex items-end justify-between gap-3 border-b border-dashed border-[#e8dcdc] pb-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#c8a96b]">Ficha del taller</p>
                    <h2 className="font-serif text-2xl font-bold text-[#4a3933]">Hazlo a tu manera</h2>
                  </div>
                  <p className="max-w-[11rem] text-right text-[11px] leading-snug text-[#887870]">Lo armamos a mano con lo que elijas aquí.</p>
                </div>

                {availableColors.length > 0 && (
                  <Step
                    step={stepOf('colors')}
                    title={single ? 'Color' : 'Colores'}
                    hint={single ? 'Es una sola flor: elige su color. ¿Varias de distinto color? Agrégalas por separado.' : isMixed ? 'El taller los combina con armonía.' : `Hasta ${limit}. Toca de nuevo para quitar.`}
                    summary={isMixed && !single ? 'Surtido multicolor' : colors.join(' · ')}
                    last={stepOf('colors') === sections.length}
                  >
                    <div className="flex flex-wrap gap-x-2 gap-y-3">
                      {availableColors.map(color => {
                        const selected = (single || !isMixed) && colors.includes(color);
                        const light = isLightColor(color, options.colors);
                        return (
                          <button
                            key={color}
                            type="button"
                            onClick={() => { setIsMixed(false); setChosenColors(toggleInList(colors, color, limit)); }}
                            className="group flex w-[3.75rem] flex-col items-center gap-1.5"
                            aria-pressed={selected}
                          >
                            <span
                              className={`relative flex h-12 w-12 items-center justify-center rounded-full shadow-inner transition ${
                                selected ? 'scale-105 ring-2 ring-[#c8a96b] ring-offset-2 ring-offset-white' : 'ring-1 ring-black/10 group-hover:ring-[#c8a96b]/60'
                              }`}
                              style={{ background: colorBackground(color, options.colors) }}
                            >
                              {selected && <Check className={`h-4 w-4 ${light ? 'text-[#4a3933]' : 'text-white'}`} strokeWidth={3} />}
                            </span>
                            <span className={`text-center text-[11px] leading-tight ${selected ? 'font-bold text-[#4a3933]' : 'text-[#887870]'}`}>{color}</span>
                          </button>
                        );
                      })}
                      {/* Surtido solo tiene sentido si lleva varias flores */}
                      {!single && (
                        <button type="button" onClick={() => setIsMixed(v => !v)} className="group flex w-[3.75rem] flex-col items-center gap-1.5" aria-pressed={isMixed}>
                          <span className={`flex h-12 w-12 items-center justify-center rounded-full transition ${isMixed ? 'scale-105 ring-2 ring-[#c8a96b] ring-offset-2' : 'ring-1 ring-black/10 group-hover:ring-[#c8a96b]/60'}`}>
                            <ColorSwatch name={MIXED_COLORS} size={48} />
                          </span>
                          <span className={`text-center text-[11px] leading-tight ${isMixed ? 'font-bold text-[#4a3933]' : 'text-[#887870]'}`}>Surtido</span>
                        </button>
                      )}
                    </div>
                  </Step>
                )}

                {availableFlowers.length > 0 && (
                  <Step
                    step={stepOf('flowers')}
                    title={single ? 'Tipo de flor' : 'Flores'}
                    hint={single ? 'Elige cuál.' : `Hasta ${limit} tipos.`}
                    summary={flowers.join(' · ')}
                    last={stepOf('flowers') === sections.length}
                  >
                    <div className="flex flex-wrap gap-2">
                      {availableFlowers.map(flower => {
                        const selected = flowers.includes(flower);
                        return (
                          <button
                            key={flower}
                            type="button"
                            onClick={() => setChosenFlowers(toggleInList(flowers, flower, limit))}
                            aria-pressed={selected}
                            className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition ${
                              selected ? 'border-[#4a3933] bg-[#4a3933] text-white shadow-sm' : 'border-[#e8dcdc] bg-white text-[#6b5a50] hover:border-[#4a3933]/40'
                            }`}
                          >
                            {selected && <Check className="h-3 w-3 text-[#e8c98a]" />}
                            {flower}
                          </button>
                        );
                      })}
                    </div>
                  </Step>
                )}

                {(product.allowsLights || product.allowsButterfly) && (
                  <Step
                    step={stepOf('extras')}
                    title="Toque mágico"
                    hint="Opcional."
                    summary={[hasLights && 'Luces', hasButterfly && 'Mariposas'].filter(Boolean).join(' · ') || undefined}
                    last={stepOf('extras') === sections.length}
                  >
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      {product.allowsLights && (
                        <ExtraToggle active={hasLights} onToggle={() => setHasLights(v => !v)} icon={<Lightbulb className="h-5 w-5" />} title="Luces LED" hint="Brilla de noche" />
                      )}
                      {product.allowsButterfly && (
                        <ExtraToggle active={hasButterfly} onToggle={() => setHasButterfly(v => !v)} icon={<span className="text-lg">🦋</span>} title="Mariposas" hint="Decoración delicada" />
                      )}
                    </div>
                  </Step>
                )}

                {product.allowsPhraseCard && (
                  <Step
                    step={stepOf('card')}
                    title="Tarjeta con dedicatoria"
                    hint="La imprimimos y va con tu detalle."
                    summary={cardReady ? cardTheme(card.theme).name : undefined}
                    last
                  >
                    {cardReady ? (
                      <div className="rounded-2xl border border-[#efe6dd] bg-[#fdfaf5] p-3">
                        <button type="button" onClick={() => setIsCardModalOpen(true)} className="block w-full" aria-label="Editar tarjeta">
                          <CardArt design={card} />
                        </button>
                        <div className="mt-3 flex items-center justify-between gap-2 px-1">
                          <button type="button" onClick={() => setIsCardModalOpen(true)} className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8f6d28] hover:text-[#4a3933]">
                            <Pencil className="h-3.5 w-3.5" /> Editar tarjeta
                          </button>
                          <button
                            type="button"
                            onClick={() => { setHasPhraseCard(false); setCard(EMPTY_CARD); }}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#887870] hover:text-[#c06b6b]"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Quitar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => { setHasPhraseCard(true); setIsCardModalOpen(true); }}
                        className="group grid w-full grid-cols-[5.5rem_1fr_auto] items-center gap-4 rounded-2xl border border-dashed border-[#c8a96b]/60 bg-[#fffdf8] p-3 text-left transition hover:border-[#c8a96b] hover:bg-[#fdf8ee]"
                      >
                        <span className="pointer-events-none opacity-80 transition group-hover:opacity-100">
                          <CardArt design={{ ...EMPTY_CARD, text: 'Con cariño' }} />
                        </span>
                        <span>
                          <span className="block text-sm font-bold text-[#4a3933]">Agregar una tarjeta</span>
                          <span className="block text-xs text-[#887870]">Elige un diseño o sube tu foto, y escribe tu mensaje.</span>
                        </span>
                        <Mail className="h-5 w-5 text-[#c8a96b]" />
                      </button>
                    )}
                  </Step>
                )}
              </section>
            )}

            {/* Resumen y compra */}
            <section className="rounded-[1.75rem] border border-[#c8a96b]/30 bg-gradient-to-br from-[#fffdf8] to-[#faf4ea] p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-[#F9F8F6]">
                  {product.imageUrl && <Image src={getImageUrl(product.imageUrl)} alt="" fill sizes="64px" className="object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b08a4e]">Tu detalle</p>
                  <p className="truncate font-serif text-base font-bold text-[#4a3933]">{product.name}</p>
                  <ItemOptions
                    className="mt-2"
                    colors={finalColors}
                    flowers={flowers}
                    hasLights={product.allowsLights && hasLights}
                    hasButterfly={product.allowsButterfly && hasButterfly}
                    hasPhraseCard={cardReady}
                  />
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between gap-4 border-t border-[#e8dcdc] pt-4">
                <div className="flex items-center rounded-full border border-[#e8dcdc] bg-white">
                  <button
                    type="button"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-[#4a3933] disabled:opacity-30"
                    aria-label="Quitar uno"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-[#4a3933]" aria-live="polite">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(q => Math.min(maxQuantity, q + 1))}
                    disabled={quantity >= maxQuantity}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-[#4a3933] disabled:opacity-30"
                    aria-label="Agregar uno"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#887870]">Total</p>
                  <p className="font-serif text-2xl font-bold text-[#4a3933]">{formatCurrency(total)}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <Button
                  size="lg"
                  disabled={isOutOfStock}
                  onClick={() => addToCart(false)}
                  className="h-12 rounded-full border-none bg-[#c8a96b] text-base text-white shadow-[0_8px_30px_rgba(200,169,107,0.25)] hover:bg-[#b59555]"
                >
                  {isOutOfStock ? 'No disponible' : (
                    <span className="flex items-center justify-center gap-2">
                      <ShoppingBag className="h-5 w-5" /> Agregar al carrito
                    </span>
                  )}
                </Button>
                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={() => addToCart(true)}
                  className="h-12 rounded-full border-2 border-[#4a3933] bg-white text-base font-bold text-[#4a3933] transition hover:bg-[#4a3933] hover:text-white disabled:opacity-50"
                >
                  Comprar ahora
                </button>
              </div>
              <p className="mt-3 text-center text-[11px] text-[#887870]">
                Al pagar eliges <strong className="text-[#4a3933]">50% de adelanto</strong> o el total, con tarjeta o Yape.
              </p>
            </section>

            <ul className="grid grid-cols-1 gap-3 text-xs text-[#6b5a50] sm:grid-cols-3">
              <li className="flex items-center gap-2"><HandHeart className="h-4 w-4 shrink-0 text-[#c8a96b]" /> Hecho a mano para ti</li>
              <li className="flex items-center gap-2"><Truck className="h-4 w-4 shrink-0 text-[#c8a96b]" /> Delivery, recojo o envío a todo el Perú</li>
              <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 shrink-0 text-[#c8a96b]" /> Paga con tarjeta o Yape, 50% o total</li>
            </ul>
          </div>
        </div>

        {suggested.length > 0 && (
          <section className="mt-16 border-t border-sage/15 pt-12 md:mt-24">
            <div className="mb-8 flex flex-col items-center text-center md:mb-10">
              <span className="mb-2 text-[11px] font-bold uppercase tracking-[0.25em] text-[#c8a96b]">Complementos & regalos</span>
              <h2 className="font-serif text-2xl font-bold text-[#4a3933] md:text-3xl">También podría interesarte</h2>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
              {suggested.map(sp => <ProductCard key={sp.id} product={sp} />)}
            </div>
          </section>
        )}
      </div>

      {/* Barra fija en celular: precio y botón siempre a la mano */}
      {!isOutOfStock && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#e8dcdc] bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_24px_-12px_rgba(74,57,51,0.25)] backdrop-blur md:hidden">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-[#887870]">{quantity} × {product.name}</p>
              <p className="font-serif text-lg font-bold text-[#4a3933]">{formatCurrency(total)}</p>
            </div>
            <Button
              onClick={() => addToCart(false)}
              className="h-11 rounded-full border-none bg-[#c8a96b] px-5 text-white hover:bg-[#b59555]"
            >
              <ShoppingBag className="mr-2 h-4 w-4" /> Agregar
            </Button>
          </div>
        </div>
      )}

      {isCardModalOpen && (
        <PhraseCardModal
          value={card}
          onChange={setCard}
          productName={product.name}
          onClose={() => {
            setIsCardModalOpen(false);
            if (!card.text.trim()) setHasPhraseCard(false);
          }}
          onSave={() => {
            if (!card.text.trim()) {
              toast.error('Falta la dedicatoria', { description: 'Escribe un mensaje para la tarjeta.' });
              return;
            }
            setHasPhraseCard(true);
            setIsCardModalOpen(false);
            toast.success('Tarjeta guardada', { description: 'Se incluirá con tu pedido.' });
          }}
        />
      )}
    </div>
  );
}
