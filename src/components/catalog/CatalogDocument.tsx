"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Printer, Loader2 } from 'lucide-react';
import { useProducts } from '@/hooks/use-products';
import { useBusinessSettings } from '@/hooks/use-info';
import { ProductResponse } from '@/types/products';
import { formatCurrency, formatStageName, getImageUrl } from '@/lib/formatters';
import { productAccessoryKeys } from '@/lib/product-options';
import { SITE_URL } from '@/lib/site';

import flo1 from '@/app/(public)/images/flo1.png';
import flo5 from '@/app/(public)/images/flo5.png';
import flo2 from '@/app/(public)/images/flo2.png';

export interface CatalogOptions {
  categoryId: string;      // 'todas' o el id
  showPrices: boolean;
  title: string;
  perPage: 4 | 6;
}

export function readCatalogOptions(params: URLSearchParams): CatalogOptions {
  return {
    categoryId: params.get('categoria') || 'todas',
    showPrices: params.get('precios') !== '0',
    title: (params.get('titulo') || 'Catálogo de temporada').slice(0, 60),
    perPage: params.get('porPagina') === '6' ? 6 : 4,
  };
}

interface CategoryGroup {
  name: string;
  products: ProductResponse[];
}

function chunk<T>(items: T[], size: number): T[][] {
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += size) pages.push(items.slice(i, i + size));
  return pages;
}

function customizationHints(product: ProductResponse): string[] {
  const hints: string[] = [];
  // Accesorios por su clave ("luces", "perlas-doradas" → "perlas doradas")
  for (const key of productAccessoryKeys(product)) hints.push(key === 'luces' ? 'luces LED' : key.replace(/-/g, ' '));
  if (product.allowsPhraseCard) hints.push('tarjeta con frase');
  return hints;
}

/**
 * Convierte la foto a JPEG de ~720 px. Al imprimir, Chrome incrusta los WebP sin compresión (un catálogo de
 * 40 productos pesaba ~38 MB); los JPEG los incrusta tal cual y el PDF queda en unos pocos MB.
 */
function toPrintJpeg(src: string, maxSize = 720, quality = 0.82): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      const context = canvas.getContext('2d');
      if (!context) return resolve(null);
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
      try {
        resolve(canvas.toDataURL('image/jpeg', quality));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/** Espera a que todas las fotos estén descargadas antes de imprimir (si no, salen en blanco). */
async function waitForImages(root: HTMLElement) {
  const images = Array.from(root.querySelectorAll('img'));
  await Promise.all(images.map((img) => (img.complete ? Promise.resolve() : new Promise<void>((resolve) => {
    img.addEventListener('load', () => resolve(), { once: true });
    img.addEventListener('error', () => resolve(), { once: true });
  }))));
}

export function CatalogDocument() {
  const params = useSearchParams();
  const options = useMemo(() => readCatalogOptions(new URLSearchParams(params.toString())), [params]);
  const embedded = params.get('embebido') === '1';

  const { data: products, isLoading } = useProducts();
  const { data: settings } = useBusinessSettings();
  // Lista para imprimir cuando cargaron las fotos de esta configuración
  const optionsKey = useMemo(() => {
    const copy = new URLSearchParams(params.toString());
    copy.delete('embebido');
    return copy.toString();
  }, [params]);
  const [readyFor, setReadyFor] = useState<string | null>(null);
  const [printImages, setPrintImages] = useState<Record<string, string> | null>(null);
  const ready = readyFor === optionsKey && printImages !== null;

  // Versión JPEG de cada foto para el PDF
  useEffect(() => {
    if (!products) return;
    let cancelled = false;
    const withImage = products.filter((p) => p.imageUrl);
    void Promise.all(withImage.map(async (p) => [p.id, await toPrintJpeg(getImageUrl(p.imageUrl))] as const))
      .then((entries) => {
        if (cancelled) return;
        setPrintImages(Object.fromEntries(entries.filter((entry): entry is readonly [string, string] => entry[1] !== null)));
      });
    return () => { cancelled = true; };
  }, [products]);

  const groups = useMemo<CategoryGroup[]>(() => {
    const filtered = (products ?? []).filter((p) =>
      options.categoryId === 'todas' || p.category?.id === options.categoryId);

    const byCategory = new Map<string, ProductResponse[]>();
    for (const product of filtered) {
      const name = product.category?.name ?? 'Otros detalles';
      byCategory.set(name, [...(byCategory.get(name) ?? []), product]);
    }

    return [...byCategory.entries()]
      .map(([name, items]) => ({ name, products: items.sort((a, b) => a.name.localeCompare(b.name, 'es')) }))
      .sort((a, b) => a.name.localeCompare(b.name, 'es'));
  }, [products, options.categoryId]);

  const totalProducts = groups.reduce((sum, g) => sum + g.products.length, 0);

  // Páginas de productos con su número (la portada es la 1)
  const productPages = useMemo(
    () => groups
      .flatMap((group) => chunk(group.products, options.perPage).map((items) => ({ category: group.name, items })))
      .map((page, index) => ({ ...page, number: index + 2 })),
    [groups, options.perPage]
  );
  const whatsapp = settings?.whatsappNumber || '51950482596';
  const whatsappDisplay = whatsapp.replace(/\D/g, '').replace(/^51(\d{3})(\d{3})(\d{3})$/, '+51 $1 $2 $3');
  const siteHost = SITE_URL.replace(/^https?:\/\//, '');
  const monthYearRaw = new Date().toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
  const monthYear = monthYearRaw.charAt(0).toUpperCase() + monthYearRaw.slice(1); // "Octubre de 2026"

  // El nombre del PDF al guardar sale del título del documento
  useEffect(() => {
    document.title = `Catalogo-AuraNova-${new Date().toISOString().slice(0, 10)}`;
  }, []);

  // Avisa a la página del panel (vista previa) cuando el catálogo está listo para imprimir
  useEffect(() => {
    if (isLoading || !products || printImages === null) return;
    let cancelled = false;
    const root = document.getElementById('catalogo');
    if (!root) return;
    void waitForImages(root).then(() => {
      if (cancelled) return;
      setReadyFor(optionsKey);
      window.parent?.postMessage({ type: 'catalog-ready', products: totalProducts, query: optionsKey }, window.location.origin);
    });
    return () => { cancelled = true; };
  }, [isLoading, products, groups, totalProducts, optionsKey, printImages]);

  return (
    <div className="catalog-screen min-h-screen bg-[#e9e4de] py-8 print:bg-white print:py-0">
      <style>{`
        @page { size: A4; margin: 0; }
        @media print {
          html, body { background: #fff !important; }
          .catalog-screen > :not(#catalogo) { display: none !important; }
          .catalog-page { box-shadow: none !important; margin: 0 !important; }
        }
        .catalog-page {
          width: 210mm; height: 297mm; overflow: hidden; position: relative;
          break-after: page; page-break-after: always;
          -webkit-print-color-adjust: exact; print-color-adjust: exact;
        }
        .catalog-page:last-child { break-after: auto; page-break-after: auto; }
      `}</style>

      {!embedded && (
        <div className="mx-auto mb-6 flex max-w-[210mm] items-center justify-between gap-3 px-2">
          <p className="text-sm text-[#5e4a42]">
            {isLoading ? 'Cargando productos…' : `${totalProducts} productos · ${options.showPrices ? 'con precios' : 'sin precios'}`}
          </p>
          <button
            onClick={() => window.print()}
            disabled={!ready}
            className="inline-flex items-center gap-2 rounded-full bg-[#4a3933] px-5 py-2.5 text-sm font-bold text-white shadow-lg disabled:opacity-50"
          >
            {ready ? <Printer className="h-4 w-4" /> : <Loader2 className="h-4 w-4 animate-spin" />}
            Descargar PDF
          </button>
        </div>
      )}

      <div id="catalogo" className="mx-auto flex w-fit flex-col gap-6 print:gap-0">
        {/* ── Portada ── */}
        <section className="catalog-page flex flex-col bg-[#faf7f2] shadow-2xl">
          <div className="absolute -right-24 -top-16 w-[120mm] opacity-90 mix-blend-multiply">
            <Image src={flo5} alt="" priority style={{ width: '100%', height: 'auto' }} />
          </div>
          <div className="absolute -bottom-20 -left-24 w-[110mm] rotate-12 opacity-80 mix-blend-multiply">
            <Image src={flo1} alt="" priority style={{ width: '100%', height: 'auto' }} />
          </div>

          <div className="relative z-10 flex flex-1 flex-col justify-center px-[22mm]">
            <p className="text-[11pt] font-semibold uppercase tracking-[0.45em] text-[#d38b8b]">Huancayo · Perú</p>
            <h1 className="mt-4 font-serif text-[64pt] font-bold leading-[0.95] text-[#4a3933]">Aura Nova</h1>
            <p className="mt-3 font-serif text-[20pt] italic text-[#b08a4e]">Detalles florales hechos a mano</p>

            <div className="mt-14 h-px w-24 bg-[#c8a96b]" />
            <h2 className="mt-8 font-serif text-[30pt] font-bold leading-tight text-[#4a3933]">{options.title}</h2>
            <p className="mt-2 text-[12pt] text-[#887870]">{monthYear}</p>

            {groups.length > 1 && (
              <ul className="mt-10 grid max-w-[120mm] grid-cols-2 gap-x-8 gap-y-2 text-[11pt] text-[#5e4a42]">
                {groups.map((group) => (
                  <li key={group.name} className="flex justify-between border-b border-dotted border-[#d9cfc8] pb-1">
                    <span>{group.name}</span>
                    <span className="font-semibold text-[#b08a4e]">{group.products.length}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Contacto a la derecha: la flor decorativa ocupa la esquina izquierda */}
          <footer className="relative z-10 flex justify-end px-[22mm] pb-[16mm] text-right text-[10pt] text-[#5e4a42]">
            <div>
              <p className="font-semibold uppercase tracking-widest text-[#887870]">Pedidos</p>
              <p className="mt-1 text-[13pt] font-bold text-[#4a3933]">WhatsApp {whatsappDisplay}</p>
              <p className="mt-1 font-serif text-[13pt] italic text-[#b08a4e]">{siteHost}</p>
            </div>
          </footer>
        </section>

        {/* ── Páginas de productos ── */}
        {productPages.map(({ category, items: pageProducts, number }) => {
            const rows = options.perPage === 6 ? 3 : 2;
            return (
              <section key={number} className="catalog-page flex flex-col bg-white px-[14mm] pb-[12mm] pt-[12mm] shadow-2xl">
                <header className="flex items-end justify-between border-b border-[#efe6dd] pb-3">
                  <div>
                    <p className="text-[8pt] font-semibold uppercase tracking-[0.4em] text-[#d38b8b]">Aura Nova</p>
                    <h2 className="font-serif text-[22pt] font-bold leading-none text-[#4a3933]">{category}</h2>
                  </div>
                  <div className="w-[16mm] opacity-80 mix-blend-multiply">
                    <Image src={flo2} alt="" style={{ width: '100%', height: 'auto' }} />
                  </div>
                </header>

                <div
                  className="mt-5 grid flex-1 grid-cols-2 gap-x-[8mm] gap-y-[6mm]"
                  style={{ gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` }}
                >
                  {pageProducts.map((product) => (
                    <CatalogCard
                      key={product.id}
                      product={product}
                      imageSrc={printImages?.[product.id] ?? null}
                      showPrices={options.showPrices}
                      compact={options.perPage === 6}
                    />
                  ))}
                </div>

                <footer className="mt-4 flex items-center justify-between border-t border-[#efe6dd] pt-3 text-[8.5pt] text-[#887870]">
                  <span>Pide por WhatsApp {whatsappDisplay}</span>
                  <span className="font-serif italic text-[#b08a4e]">{siteHost}</span>
                  <span>{number}</span>
                </footer>
              </section>
            );
          })}

        {/* ── Cómo pedir ── */}
        <section className="catalog-page flex flex-col justify-center bg-gradient-to-br from-[#4a3933] to-[#6b5145] px-[22mm] text-white shadow-2xl">
          <div className="absolute -right-20 bottom-0 w-[95mm] opacity-25">
            <Image src={flo5} alt="" style={{ width: '100%', height: 'auto' }} />
          </div>
          <p className="text-[11pt] font-semibold uppercase tracking-[0.45em] text-[#e8c98a]">Es muy fácil</p>
          <h2 className="mt-3 font-serif text-[40pt] font-bold leading-tight">¿Cómo hacer tu pedido?</h2>

          <ol className="relative z-10 mt-12 space-y-9">
            {[
              ['Elige tu detalle', `Pídelo en ${siteHost} o escríbenos por WhatsApp con el nombre del producto.`],
              ['Paga en la web', 'Con tarjeta o Yape a través de Mercado Pago: el 50% de adelanto o el total. Se confirma al instante.'],
              ['Recíbelo con cariño', 'Delivery en Huancayo, recojo en punto de encuentro o envío a todo el Perú.'],
            ].map(([title, text], index) => (
              <li key={title} className="flex gap-6">
                <span className="flex h-[14mm] w-[14mm] shrink-0 items-center justify-center rounded-full bg-[#c8a96b] font-serif text-[20pt] font-bold">{index + 1}</span>
                <div>
                  <p className="font-serif text-[18pt] font-bold">{title}</p>
                  <p className="mt-1 max-w-[120mm] text-[11.5pt] leading-relaxed text-[#eadfd6]">{text}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="relative z-10 mt-14 rounded-[6mm] bg-white/10 p-[8mm]">
            <p className="font-serif text-[16pt] font-bold">¿Quieres algo único?</p>
            <p className="mt-1 text-[11pt] text-[#eadfd6]">
              Envíanos la foto de tu idea y creamos un diseño a tu medida: {siteHost}/personalizado
            </p>
            <p className="mt-4 text-[14pt] font-bold text-[#e8c98a]">WhatsApp {whatsappDisplay}</p>
          </div>
        </section>
      </div>
    </div>
  );
}

function CatalogCard({ product, imageSrc, showPrices, compact }: { product: ProductResponse; imageSrc: string | null; showPrices: boolean; compact: boolean }) {
  const onSale = product.isCampaignActive && product.effectivePrice < product.price;
  const hints = customizationHints(product);

  return (
    <article className="flex min-h-0 flex-col overflow-hidden rounded-[5mm] border border-[#efe6dd] bg-[#fffdfa]">
      <div className="relative min-h-0 flex-1 bg-[#faf7f2]">
        {imageSrc && (
          // JPEG generado en el navegador (data URL): liviano al imprimir
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageSrc} alt={product.name} className="absolute inset-0 h-full w-full object-cover" />
        )}
        {showPrices && onSale && (
          <span className="absolute left-[3mm] top-[3mm] rounded-full bg-[#d38b8b] px-[3mm] py-[1mm] text-[8pt] font-bold uppercase tracking-wider text-white">
            {formatStageName(product.campaignStageName)}
          </span>
        )}
      </div>

      <div className={compact ? 'px-[4mm] py-[3mm]' : 'px-[5mm] py-[4mm]'}>
        <h3 className={`font-serif font-bold leading-tight text-[#4a3933] ${compact ? 'text-[11pt] line-clamp-1' : 'text-[13pt] line-clamp-2'}`}>
          {product.name}
        </h3>
        {!compact && product.description && (
          <p className="mt-[1.5mm] line-clamp-2 text-[8.5pt] leading-snug text-[#887870]">{product.description}</p>
        )}
        {hints.length > 0 && (
          <p className="mt-[1.5mm] line-clamp-1 text-[7.5pt] font-medium text-[#b08a4e]">Personalízalo: {hints.join(' · ')}</p>
        )}
        {showPrices && (
          <div className="mt-[2mm] flex items-baseline gap-[2mm]">
            <span className={`font-bold text-[#4a3933] ${compact ? 'text-[12pt]' : 'text-[14pt]'}`}>{formatCurrency(product.effectivePrice ?? product.price)}</span>
            {onSale && <span className="text-[9pt] text-[#b3a69e] line-through">{formatCurrency(product.price)}</span>}
          </div>
        )}
      </div>
    </article>
  );
}
