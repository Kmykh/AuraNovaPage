"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Compass, Map, Minus, PackageOpen, Plus, ShieldCheck, Trash2, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { ItemOptions } from '@/components/shared/ItemOptions';
import { CardArt } from '@/components/card/CardArt';
import { itemColors, itemFlowers } from '@/lib/product-options';
import { CartItem, useCartStore } from '@/store/cart.store';
import { useMounted } from '@/hooks/use-mounted';
import { useDeliveryZones, useMeetingPoints } from '@/hooks/use-checkout';
import { formatCurrency } from '@/lib/formatters';
import { cardTheme, CardThemeId } from '@/lib/card-design';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

import flo1 from '../images/flo1.png';
import flo2 from '../images/flo2.png';

const keyOf = (item: CartItem) => item.cartItemId || item.productId;

/** Pasos de la compra: el cliente sabe dónde está y qué falta. */
export function PurchaseSteps({ current }: { current: 1 | 2 | 3 }) {
  const steps = ['Carrito', 'Entrega y datos', 'Pago'];
  return (
    <ol className="flex items-center justify-center gap-2 text-[11px] font-bold sm:gap-3 sm:text-xs" aria-label="Pasos de la compra">
      {steps.map((label, index) => {
        const step = index + 1;
        const state = step < current ? 'done' : step === current ? 'current' : 'next';
        return (
          <li key={label} className="flex items-center gap-2 sm:gap-3">
            {index > 0 && <span className={`h-px w-6 sm:w-10 ${step <= current ? 'bg-[#c8a96b]' : 'bg-[#e8dcdc]'}`} />}
            <span className={`flex items-center gap-1.5 ${state === 'next' ? 'text-[#b7a9a0]' : 'text-[#4a3933]'}`} aria-current={state === 'current' ? 'step' : undefined}>
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                state === 'current' ? 'bg-[#4a3933] text-white' : state === 'done' ? 'bg-[#c8a96b] text-white' : 'border border-[#e8dcdc] text-[#b7a9a0]'
              }`}>{step}</span>
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function CartLine({ item, onDecrease, onIncrease, onRemove }: {
  item: CartItem; onDecrease: () => void; onIncrease: () => void; onRemove: () => void;
}) {
  const unavailable = !item.isAvailable;
  const hasCard = item.hasPhraseCard && !!item.phraseText;
  const theme = (item.phraseTheme ?? item.phraseBackground ?? 'marfil') as CardThemeId;
  // Si la foto no se pudo guardar en el navegador, la tarjeta se imprime con el diseño clásico
  const design = {
    text: item.phraseText ?? '', font: item.phraseFont ?? 'Elegante/Cursiva', to: item.phraseTo ?? '', from: item.phraseFrom ?? '',
    theme: theme === 'foto' && !item.cardPhoto ? 'marfil' as CardThemeId : theme, photo: item.cardPhoto,
  };

  return (
    <article className={`rounded-[1.75rem] border border-white bg-white/90 p-4 shadow-[0_12px_30px_-18px_rgba(74,57,51,0.35)] backdrop-blur sm:p-5 ${unavailable ? 'opacity-60' : ''}`}>
      <div className="grid grid-cols-[5.5rem_1fr] gap-4 sm:grid-cols-[7rem_1fr]">
        <Link href={`/productos/${item.productId}`} className="relative block aspect-square overflow-hidden rounded-2xl border border-[#efe6dd] bg-[#faf7f2]">
          {item.imageUrl ? (
            <Image src={item.imageUrl} alt={item.name} fill sizes="112px" className="object-cover" />
          ) : (
            <PackageOpen className="absolute inset-0 m-auto h-7 w-7 text-[#d38b8b]/40" strokeWidth={1} />
          )}
        </Link>

        <div className="min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link href={`/productos/${item.productId}`} className="font-serif text-lg font-bold leading-tight text-[#4a3933] hover:text-[#8f6d28] sm:text-xl">
                {item.name}
              </Link>
              <p className="text-xs text-[#887870]">{formatCurrency(item.price)} c/u</p>
            </div>
            <p className="shrink-0 font-serif text-lg font-bold text-[#4a3933] sm:text-xl">{formatCurrency(item.price * item.quantity)}</p>
          </div>

          <ItemOptions
            className="mt-2.5"
            colors={itemColors(item)}
            flowers={itemFlowers(item)}
            hasLights={item.hasLights}
            hasButterfly={item.hasButterfly}
          />

          {unavailable && (
            <span className="mt-2 inline-block rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-rose-500">Agotado</span>
          )}
        </div>
      </div>

      {hasCard && (
        <div className="mt-4 grid grid-cols-[7.5rem_1fr] items-center gap-3 rounded-2xl bg-[#fbf7f0] p-2.5 sm:grid-cols-[9rem_1fr]">
          <CardArt design={design} />
          <div className="min-w-0 text-xs">
            <p className="font-bold text-[#4a3933]">Tarjeta · {cardTheme(design.theme).name}</p>
            {item.phraseTo && <p className="text-[#8f6d28]">Para: {item.phraseTo}</p>}
            <p className="mt-0.5 line-clamp-2 font-serif italic text-[#6b5a50]">“{item.phraseText}”</p>
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-[#f1e9e4] pt-3">
        <div className="flex items-center rounded-full border border-[#e8dcdc] bg-[#faf7f2] p-0.5">
          <button
            type="button"
            onClick={onDecrease}
            disabled={item.quantity <= 1}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#4a3933] transition hover:bg-white disabled:opacity-30"
            aria-label="Quitar uno"
          >
            <Minus size={13} />
          </button>
          <span className="w-8 text-center text-sm font-bold text-[#4a3933]" aria-live="polite">{item.quantity}</span>
          <button
            type="button"
            onClick={onIncrease}
            disabled={item.quantity >= item.stock || unavailable}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#4a3933] transition hover:bg-white disabled:opacity-30"
            aria-label="Agregar uno"
          >
            <Plus size={13} />
          </button>
        </div>
        <button type="button" onClick={onRemove} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-[#887870] transition hover:bg-rose-50 hover:text-rose-600">
          <Trash2 size={13} /> Quitar
        </button>
      </div>
    </article>
  );
}

export function CartClient() {
  const isMounted = useMounted();
  const { items, updateQuantity, removeItem, clearCart, getSubtotal } = useCartStore();
  const { data: zones } = useDeliveryZones();
  const { data: points } = useMeetingPoints();
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  if (!isMounted) {
    return (
      <div className="flex w-full justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-sage/20 border-t-gold" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="relative flex w-full flex-col items-center justify-center overflow-hidden rounded-[2.5rem] border border-[#efe6dd] bg-white/60 px-6 py-24 text-center">
        <div className="pointer-events-none absolute -right-6 top-0 w-44 opacity-25 mix-blend-multiply"><Image src={flo1} alt="" className="h-auto w-full" /></div>
        <div className="pointer-events-none absolute -left-6 bottom-0 w-32 opacity-30 mix-blend-multiply"><Image src={flo2} alt="" className="h-auto w-full" /></div>
        <PackageOpen className="mb-5 h-14 w-14 text-[#c8a96b]/70" strokeWidth={1} />
        <h2 className="font-serif text-3xl font-bold text-[#4a3933]">Tu carrito está vacío</h2>
        <p className="mt-2 max-w-sm text-sm text-[#887870]">Elige un detalle del catálogo, personalízalo y aparecerá aquí.</p>
        <Link href="/productos" className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#4a3933] px-7 py-3 text-sm font-bold text-white transition hover:bg-[#3a2d28]">
          Ver el catálogo <ArrowRight className="h-4 w-4 text-[#c8a96b]" />
        </Link>
      </div>
    );
  }

  const decrease = (item: CartItem) => updateQuantity(keyOf(item), item.quantity - 1);
  const increase = (item: CartItem) => {
    if (item.quantity < item.stock) updateQuantity(keyOf(item), item.quantity + 1);
    else toast.warning('No hay más stock disponible', { description: 'Llegaste al máximo para este detalle.' });
  };
  const remove = (item: CartItem) => {
    removeItem(keyOf(item));
    toast.success('Quitado del carrito', { description: item.name });
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = getSubtotal();
  const deposit = Math.round((subtotal / 2) * 100) / 100;
  const blocked = items.some(item => !item.isAvailable);
  const cheapestZone = zones?.length ? Math.min(...zones.map(zone => zone.cost)) : null;
  const cheapestPoint = points?.length ? Math.min(...points.map(point => point.cost)) : null;

  return (
    <>
      <div className="grid w-full grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_380px] lg:gap-10">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#887870]">{totalItems} {totalItems === 1 ? 'detalle' : 'detalles'}</p>
            <button type="button" onClick={() => setIsClearModalOpen(true)} className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-[#887870] hover:bg-rose-50 hover:text-rose-600">
              <Trash2 size={13} /> Vaciar
            </button>
          </div>

          <div className="space-y-4">
            {items.map(item => (
              <CartLine key={keyOf(item)} item={item} onDecrease={() => decrease(item)} onIncrease={() => increase(item)} onRemove={() => remove(item)} />
            ))}
          </div>

          <Link href="/productos" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#8f6d28] hover:text-[#4a3933]">
            <ArrowRight className="h-4 w-4 rotate-180" /> Seguir viendo detalles
          </Link>
        </div>

        {/* Resumen */}
        <aside className="rounded-[2rem] border border-[#c8a96b]/30 bg-white p-6 shadow-[0_24px_50px_-28px_rgba(74,57,51,0.4)] sm:p-7 lg:sticky lg:top-28">
          <h2 className="font-serif text-2xl font-bold text-[#4a3933]">Resumen</h2>

          <dl className="mt-5 space-y-2 text-sm">
            <div className="flex justify-between text-[#6b5a50]">
              <dt>Productos ({totalItems})</dt>
              <dd className="font-semibold text-[#4a3933]">{formatCurrency(subtotal)}</dd>
            </div>
            <div className="flex justify-between text-[#6b5a50]">
              <dt>Entrega</dt>
              <dd className="text-xs text-[#887870]">La eliges en el siguiente paso</dd>
            </div>
          </dl>

          <ul className="mt-3 space-y-2 rounded-2xl bg-[#faf7f2] p-3.5 text-xs text-[#6b5a50]">
            <li className="flex items-center gap-2.5">
              <Truck className="h-4 w-4 shrink-0 text-[#c8a96b]" />
              <span className="flex-1">Delivery en Huancayo</span>
              <span className="font-semibold text-[#4a3933]">{cheapestZone != null ? `desde ${formatCurrency(cheapestZone)}` : '—'}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Compass className="h-4 w-4 shrink-0 text-[#c8a96b]" />
              <span className="flex-1">Punto de encuentro</span>
              <span className="font-semibold text-[#4a3933]">{cheapestPoint == null ? '—' : cheapestPoint === 0 ? 'Gratis' : `desde ${formatCurrency(cheapestPoint)}`}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Map className="h-4 w-4 shrink-0 text-[#c8a96b]" />
              <span className="flex-1">Envío a provincias (Shalom u Olva)</span>
              <span className="text-right font-semibold text-[#4a3933]">Pagas en la agencia</span>
            </li>
          </ul>

          <div className="mt-5 flex items-end justify-between border-t border-[#efe6dd] pt-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#887870]">Total de productos</span>
            <span className="font-serif text-3xl font-bold text-[#4a3933]">{formatCurrency(subtotal)}</span>
          </div>
          <p className="mt-2 rounded-xl border border-[#c8a96b]/25 bg-[#fffdf8] p-3 text-xs leading-relaxed text-[#6b5a50]">
            Al pagar eliges: <strong className="text-[#4a3933]">adelanto del 50% ({formatCurrency(deposit)})</strong> o el total, con tarjeta o Yape.
          </p>

          <Link
            href="/checkout"
            aria-disabled={blocked}
            className={`mt-5 flex h-13 w-full items-center justify-center gap-2 rounded-full bg-[#4a3933] text-sm font-bold text-white shadow-lg shadow-[#4a3933]/20 transition hover:bg-[#3a2d28] ${blocked ? 'pointer-events-none opacity-50' : ''}`}
          >
            Continuar: entrega y datos <ArrowRight className="h-4 w-4 text-[#c8a96b]" />
          </Link>
          {blocked && <p className="mt-2 text-center text-xs text-rose-600">Quita los detalles agotados para continuar.</p>}
          <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-[#887870]">
            <ShieldCheck className="h-3.5 w-3.5 text-[#c8a96b]" /> Pago seguro con Mercado Pago
          </p>
        </aside>
      </div>

      {/* Celular: el total y el botón siempre a la mano */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#e8dcdc] bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_24px_-12px_rgba(74,57,51,0.25)] backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-[#887870]">{totalItems} {totalItems === 1 ? 'detalle' : 'detalles'}</p>
            <p className="font-serif text-lg font-bold text-[#4a3933]">{formatCurrency(subtotal)}</p>
          </div>
          <Link
            href="/checkout"
            aria-disabled={blocked}
            className={`inline-flex h-11 items-center gap-2 rounded-full bg-[#4a3933] px-5 text-sm font-bold text-white ${blocked ? 'pointer-events-none opacity-50' : ''}`}
          >
            Continuar <ArrowRight className="h-4 w-4 text-[#c8a96b]" />
          </Link>
        </div>
      </div>

      <Modal isOpen={isClearModalOpen} onClose={() => setIsClearModalOpen(false)} title="¿Vaciar el carrito?">
        <div className="p-6">
          <p className="mb-6 text-sage">Se quitarán todos los detalles y sus personalizaciones.</p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsClearModalOpen(false)}>Cancelar</Button>
            <Button
              className="border-transparent bg-red-600 text-white hover:bg-red-700"
              onClick={() => { clearCart(); setIsClearModalOpen(false); toast.success('Carrito vaciado'); }}
            >
              Sí, vaciar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
