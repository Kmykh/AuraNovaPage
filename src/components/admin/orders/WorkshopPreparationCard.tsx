"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Download, Printer, Package, ClipboardList, Megaphone, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { AdminOrderDetailItem, AdminOrderDetailResponse } from '@/types/orders';
import { Button } from '@/components/ui/Button';
import { ItemOptions } from '@/components/shared/ItemOptions';
import { formatCurrency, getImageUrl } from '@/lib/formatters';
import { itemColors, itemFlowers } from '@/lib/product-options';
import { deliveryTypeName } from '@/lib/tracking-progress';
import { CustomOrderBriefPanel } from './CustomOrderBriefPanel';
import { CardArt } from '@/components/card/CardArt';
import { cardTheme, designFromOrder, downloadCard, renderCard } from '@/lib/card-design';

interface WorkshopPreparationCardProps {
  order: AdminOrderDetailResponse;
}

/** "Qué pidió": productos con su foto y personalización, dedicatorias listas para imprimir y el total. */
export function WorkshopPreparationCard({ order }: WorkshopPreparationCardProps) {
  const { items, orderCode } = order;
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);
  const units = items.reduce((sum, item) => sum + item.quantity, 0);
  const isNational = deliveryTypeName(order.deliveryType) === 'NationalShipping';

  const footer = `Pedido ${orderCode} • Aura Nova`;

  // PNG en alta resolución (1600×1000), igual a lo que diseñó el cliente
  const handleDownloadDedicationCard = async (item: AdminOrderDetailItem, index: number) => {
    setDownloadingIndex(index);
    try {
      await downloadCard(designFromOrder(item), `Tarjeta_${orderCode}_${item.productName}`, footer);
      toast.success('Tarjeta descargada (1600×1000 PNG)');
    } catch {
      toast.error('No se pudo generar la tarjeta.', {
        description: item.cardBackgroundUrl ? 'La foto del cliente no se pudo leer. Abre la foto y vuelve a intentarlo.' : undefined,
      });
    } finally {
      setDownloadingIndex(null);
    }
  };

  const handlePrintCard = async (item: AdminOrderDetailItem, index: number) => {
    // La ventana se abre antes de generar la imagen para que el navegador no la bloquee
    const printWindow = window.open('', '_blank', 'width=900,height=650');
    if (!printWindow) {
      toast.error('Permite ventanas emergentes para imprimir la tarjeta.');
      return;
    }
    setDownloadingIndex(index);
    try {
      const canvas = await renderCard(designFromOrder(item), footer);
      printWindow.document.write(`<!DOCTYPE html><html><head><title>Tarjeta ${orderCode}</title>
        <style>@page{size:landscape;margin:10mm}html,body{margin:0;height:100%;display:flex;align-items:center;justify-content:center;background:#fff}
        img{max-width:100%;max-height:100%}</style></head>
        <body><img src="${canvas.toDataURL('image/png')}" onload="window.print()" /></body></html>`);
      printWindow.document.close();
    } catch {
      printWindow.close();
      toast.error('No se pudo preparar la tarjeta para imprimir.');
    } finally {
      setDownloadingIndex(null);
    }
  };

  return (
    <section className="overflow-hidden rounded-[24px] border border-[#c8a96b]/30 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8dcdc] bg-gradient-to-r from-[#faf7f2] to-white px-5 py-4 sm:px-7">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fdf6e7] text-[#c8a96b]">
            <ClipboardList className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-serif text-xl font-bold text-[#4a3933]">Qué pidió</h2>
            <p className="text-xs text-[#887870]">
              {order.isCustomOrder && items.length === 0
                ? 'Diseño personalizado según sus referencias'
                : `${units} ${units === 1 ? 'unidad' : 'unidades'} · ${items.length} ${items.length === 1 ? 'producto' : 'productos'}`}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5 sm:p-7">
        {order.isCustomOrder && (
          <div className="space-y-4">
            {order.customizationNotes && (
              <blockquote className="rounded-2xl border-l-4 border-[#c8a96b] bg-[#faf7f2] px-4 py-3 text-sm italic leading-relaxed text-[#5e4a42]">
                “{order.customizationNotes}”
              </blockquote>
            )}
            <CustomOrderBriefPanel
              brief={{
                orderCode,
                referenceImageUrl: order.referenceImageUrl,
                referenceImages: order.referenceImages,
                referenceLinks: order.referenceLinks,
                desiredDate: order.desiredDate,
                occasion: order.occasion,
                budgetRange: order.budgetRange,
              }}
            />
          </div>
        )}

        {items.map((item, index) => {
          const colors = itemColors(item);
          const flowers = itemFlowers(item);
          return (
            <article key={`${item.productId}-${index}`} className="rounded-2xl border border-[#e8dcdc] bg-[#fffdfa] p-4">
              <div className="flex gap-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-[#e8dcdc] bg-[#faf7f2] sm:h-24 sm:w-24">
                  {item.imageUrl ? (
                    <Image src={getImageUrl(item.imageUrl)} alt={item.productName} fill sizes="96px" className="object-cover" />
                  ) : (
                    <Package className="absolute inset-0 m-auto h-6 w-6 text-[#d38b8b]/40" />
                  )}
                  <span className="absolute left-1 top-1 rounded-md bg-[#4a3933] px-1.5 py-0.5 font-mono text-[11px] font-bold text-white">
                    {item.quantity}×
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-serif text-base font-bold leading-tight text-[#4a3933] sm:text-lg">{item.productName}</h3>
                      <p className="text-xs text-[#887870]">{item.quantity} × {formatCurrency(item.unitPrice)}</p>
                    </div>
                    <span className="font-bold text-[#4a3933]">{formatCurrency(item.subtotal)}</span>
                  </div>

                  {item.appliedCampaignName && (
                    <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-[#8f2d3b]/10 px-2 py-0.5 text-[10px] font-bold text-[#8f2d3b]">
                      <Megaphone size={10} /> {item.appliedCampaignName}{item.appliedCampaignStageName ? ` · ${item.appliedCampaignStageName}` : ''}
                    </span>
                  )}

                  <ItemOptions
                    className="mt-2.5"
                    size="md"
                    colors={colors}
                    flowers={flowers}
                    hasLights={item.hasLights}
                    hasButterfly={item.hasButterfly}
                  />
                  {colors.length === 0 && flowers.length === 0 && !item.hasLights && !item.hasButterfly && !item.hasPhraseCard && (
                    <p className="mt-2 text-xs text-[#887870]">Tal como en el catálogo (sin personalización).</p>
                  )}
                </div>
              </div>

              {(item.hasPhraseCard || item.phraseText) && (
                <div className="mt-4 rounded-2xl border-2 border-dashed border-[#c8a96b]/40 bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c8a96b]">
                      Tarjeta · {cardTheme(designFromOrder(item).theme).name}{item.phraseFont ? ` · ${item.phraseFont.split('/')[0]}` : ''}
                    </span>
                    {item.phraseText && (
                      <div className="flex gap-2">
                        {item.cardBackgroundUrl && (
                          <a href={item.cardBackgroundUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[#c8a96b]/40 px-3 text-xs text-[#4a3933] hover:bg-[#faf7f2]">
                            <ImageIcon className="h-3.5 w-3.5 text-[#c8a96b]" /> Foto
                          </a>
                        )}
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadDedicationCard(item, index)}
                          disabled={downloadingIndex === index}
                          className="flex h-8 items-center gap-1.5 rounded-full border-[#c8a96b]/40 text-xs text-[#4a3933]"
                        >
                          <Download className="h-3.5 w-3.5 text-[#c8a96b]" /> {downloadingIndex === index ? 'Generando…' : 'PNG'}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handlePrintCard(item, index)}
                          disabled={downloadingIndex === index}
                          className="flex h-8 items-center gap-1.5 rounded-full border-[#c8a96b]/40 text-xs text-[#4a3933]"
                        >
                          <Printer className="h-3.5 w-3.5 text-[#c8a96b]" /> Imprimir
                        </Button>
                      </div>
                    )}
                  </div>
                  {item.phraseText ? (
                    <div className="mt-3 max-w-md">
                      <CardArt design={designFromOrder(item)} />
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-[#c06b6b]">Pidió tarjeta pero no escribió mensaje: confirmar con el cliente.</p>
                  )}
                </div>
              )}
            </article>
          );
        })}

        <dl className="ml-auto max-w-xs space-y-1.5 border-t border-[#e8dcdc] pt-4 text-sm">
          {order.subtotal > 0 && (
            <div className="flex justify-between text-[#887870]"><dt>Productos</dt><dd className="font-medium text-[#4a3933]">{formatCurrency(order.subtotal)}</dd></div>
          )}
          {order.customizationCost > 0 && (
            <div className="flex justify-between text-[#887870]"><dt>{order.isCustomOrder ? 'Precio del diseño' : 'Personalización'}</dt><dd className="font-medium text-[#4a3933]">{formatCurrency(order.customizationCost)}</dd></div>
          )}
          <div className="flex justify-between text-[#887870]">
            <dt>Entrega</dt>
            <dd className="font-medium text-[#4a3933]">
              {isNational && !order.deliveryCost ? 'Paga en destino' : order.deliveryCost ? formatCurrency(order.deliveryCost) : 'Gratis'}
            </dd>
          </div>
          <div className="flex justify-between border-t border-[#e8dcdc] pt-2 font-serif text-lg font-bold text-[#4a3933]">
            <dt>Total</dt>
            <dd className={order.total != null ? 'text-[#b08a4e]' : 'text-sm font-sans font-semibold text-amber-600'}>
              {order.total != null ? formatCurrency(order.total) : 'Falta poner precio'}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
