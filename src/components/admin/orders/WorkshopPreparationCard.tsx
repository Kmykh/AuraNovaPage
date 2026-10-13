"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Download, Printer, Package, ClipboardList, Megaphone } from 'lucide-react';
import { toast } from 'sonner';
import { AdminOrderDetailItem, AdminOrderDetailResponse } from '@/types/orders';
import { Button } from '@/components/ui/Button';
import { ItemOptions } from '@/components/shared/ItemOptions';
import { formatCurrency, getImageUrl } from '@/lib/formatters';
import { itemColors, itemFlowers } from '@/lib/product-options';
import { deliveryTypeName } from '@/lib/tracking-progress';
import { CustomOrderBriefPanel } from './CustomOrderBriefPanel';

interface WorkshopPreparationCardProps {
  order: AdminOrderDetailResponse;
}

/** "Qué pidió": productos con su foto y personalización, dedicatorias listas para imprimir y el total. */
export function WorkshopPreparationCard({ order }: WorkshopPreparationCardProps) {
  const { items, orderCode } = order;
  const customerName = order.customer?.name;
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);
  const units = items.reduce((sum, item) => sum + item.quantity, 0);
  const isNational = deliveryTypeName(order.deliveryType) === 'NationalShipping';

  // Generador de Tarjeta Dedicatoria en Alta Resolución (1600x1000 PNG)
  const handleDownloadDedicationCard = async (item: AdminOrderDetailItem, index: number) => {
    if (!item.phraseText) {
      toast.error('Este artículo no cuenta con texto de dedicatoria.');
      return;
    }

    setDownloadingIndex(index);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1600;
      canvas.height = 1000;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('No se pudo inicializar el lienzo para la tarjeta.');
      }

      // 1. Fondo Pergamino Floral Suave
      const grad = ctx.createLinearGradient(0, 0, 1600, 1000);
      grad.addColorStop(0, '#fffdfa');
      grad.addColorStop(0.5, '#faf5ec');
      grad.addColorStop(1, '#f3ebd9');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1600, 1000);

      // 2. Marco Doble Dorado de Lujo
      const accent = '#c8a96b';
      ctx.strokeStyle = accent;
      ctx.lineWidth = 4;
      ctx.strokeRect(40, 40, 1600 - 80, 1000 - 80);

      ctx.lineWidth = 1.5;
      ctx.strokeRect(55, 55, 1600 - 110, 1000 - 110);

      // Ornamentos en Esquinas
      const cornerSize = 40;
      ctx.fillStyle = accent;
      ctx.fillRect(50, 50, cornerSize, 3);
      ctx.fillRect(50, 50, 3, cornerSize);
      ctx.fillRect(1600 - 50 - cornerSize, 50, cornerSize, 3);
      ctx.fillRect(1600 - 50, 50, 3, cornerSize);
      ctx.fillRect(50, 1000 - 50, cornerSize, 3);
      ctx.fillRect(50, 1000 - 50 - cornerSize, 3, cornerSize);
      ctx.fillRect(1600 - 50 - cornerSize, 1000 - 50, cornerSize, 3);
      ctx.fillRect(1600 - 50, 1000 - 50 - cornerSize, 3, cornerSize);

      // 3. Encabezado Oficial Aura Nova
      ctx.textAlign = 'center';
      ctx.fillStyle = accent;
      ctx.font = '600 24px "Playfair Display", Georgia, serif';
      ctx.fillText('✦   A U R A   N O V A   ✦', 800, 130);

      ctx.font = 'italic 17px "Playfair Display", Georgia, serif';
      ctx.fillStyle = '#887870';
      ctx.fillText('Atelier de Detalles Florales • Huancayo', 800, 165);

      ctx.beginPath();
      ctx.moveTo(620, 195);
      ctx.lineTo(980, 195);
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 4. Código de Pedido / Cliente
      ctx.font = 'bold 16px monospace';
      ctx.fillStyle = '#b58129';
      ctx.fillText(`PEDIDO: ${orderCode}${customerName ? ` • CLIENTE: ${customerName}` : ''}`, 800, 240);

      // 5. Texto de la Dedicatoria Centrado
      const fontName = item.phraseFont || 'Elegante/Cursiva';
      const fontStyle = fontName.toLowerCase().includes('cursiva') || fontName.toLowerCase().includes('elegante')
        ? 'italic 40px "Playfair Display", Georgia, serif'
        : fontName.toLowerCase().includes('clásica')
        ? '36px "Playfair Display", Georgia, serif'
        : '34px system-ui, -apple-system, sans-serif';

      ctx.font = fontStyle;
      ctx.fillStyle = '#3d2e28';

      const maxWidth = 1250;
      const words = item.phraseText.trim().split(' ');
      const lines: string[] = [];
      let currentLine = words[0] || '';

      for (let i = 1; i < words.length; i++) {
        const testLine = currentLine + ' ' + words[i];
        const metrics = ctx.measureText(testLine);
        if (metrics.width < maxWidth) {
          currentLine = testLine;
        } else {
          lines.push(currentLine);
          currentLine = words[i];
        }
      }
      lines.push(currentLine);

      const lineHeight = 58;
      const totalTextHeight = lines.length * lineHeight;
      const startY = Math.max(340, 520 - totalTextHeight / 2);

      // Comillas decorativas superiores
      ctx.fillStyle = accent;
      ctx.font = 'italic 50px "Playfair Display", Georgia, serif';
      ctx.fillText('“', 800, startY - 25);

      ctx.font = fontStyle;
      ctx.fillStyle = '#3d2e28';
      lines.forEach((line, i) => {
        ctx.fillText(line, 800, startY + (i * lineHeight));
      });

      // Comillas inferiores
      ctx.fillStyle = accent;
      ctx.font = 'italic 50px "Playfair Display", Georgia, serif';
      ctx.fillText('”', 800, startY + (lines.length * lineHeight) + 20);

      // 6. Pie de Tarjeta
      ctx.font = '13px monospace';
      ctx.fillStyle = '#9e8c80';
      ctx.fillText(`TIPOGRAFÍA: ${fontName.toUpperCase()} • PRODUCTO: ${item.productName.toUpperCase()}`, 800, 930);

      // Convertir a Blob y descargar
      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error('Error al generar el archivo de imagen.');
          return;
        }
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `Dedicatoria_${orderCode}_${item.productName.replace(/\s+/g, '_')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
        toast.success('Tarjeta dedicatoria descargada en alta resolución (1600x1000 PNG)');
      }, 'image/png');

    } catch (err) {
      console.error(err);
      toast.error('Ocurrió un error al preparar la tarjeta dedicatoria.');
    } finally {
      setDownloadingIndex(null);
    }
  };

  const handlePrintCard = (item: AdminOrderDetailItem) => {
    if (!item.phraseText) return;
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      toast.error('Permite ventanas emergentes para imprimir la tarjeta.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Tarjeta Dedicatoria - ${orderCode}</title>
          <style>
            @page { size: landscape; margin: 15mm; }
            body {
              margin: 0;
              padding: 40px;
              font-family: 'Playfair Display', Georgia, serif;
              background-color: #faf7f2;
              color: #3d2e28;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 80vh;
            }
            .card-box {
              border: 3px double #c8a96b;
              padding: 40px;
              max-width: 650px;
              text-align: center;
              background: #fffdfa;
              border-radius: 12px;
              box-shadow: 0 4px 20px rgba(0,0,0,0.05);
            }
            .header {
              letter-spacing: 4px;
              font-size: 14px;
              color: #c8a96b;
              font-weight: bold;
              margin-bottom: 20px;
            }
            .order {
              font-family: monospace;
              font-size: 11px;
              color: #887870;
              margin-bottom: 25px;
            }
            .text {
              font-size: 24px;
              font-style: italic;
              line-height: 1.5;
              margin: 25px 0;
            }
            .meta {
              font-size: 10px;
              color: #a09085;
              letter-spacing: 1px;
              text-transform: uppercase;
              margin-top: 30px;
              font-family: monospace;
            }
          </style>
        </head>
        <body>
          <div class="card-box">
            <div class="header">✦ AURA NOVA ATELIER ✦</div>
            <div class="order">PEDIDO: ${orderCode}</div>
            <div class="text">“${item.phraseText}”</div>
            <div class="meta">TIPOGRAFÍA: ${item.phraseFont || 'Elegante'} • ${item.productName}</div>
          </div>
          <script>
            window.onload = () => {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
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
                      Tarjeta dedicatoria{item.phraseFont ? ` · ${item.phraseFont.split('/')[0]}` : ''}
                    </span>
                    {item.phraseText && (
                      <div className="flex gap-2">
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
                          onClick={() => handlePrintCard(item)}
                          className="flex h-8 items-center gap-1.5 rounded-full border-[#c8a96b]/40 text-xs text-[#4a3933]"
                        >
                          <Printer className="h-3.5 w-3.5 text-[#c8a96b]" /> Imprimir
                        </Button>
                      </div>
                    )}
                  </div>
                  <p className="mt-2 font-serif text-lg italic leading-relaxed text-[#4a3933]">
                    {item.phraseText ? `“${item.phraseText}”` : <span className="text-sm not-italic text-[#c06b6b]">Pidió tarjeta pero no escribió mensaje: confirmar con el cliente.</span>}
                  </p>
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
