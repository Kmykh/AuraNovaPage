"use client";

import React, { useState } from 'react';
import { AdminOrderDetailItem } from '@/types/orders';
import { Button } from '@/components/ui/Button';
import { 
  Sparkles, 
  Download, 
  Printer, 
  Heart, 
  CheckCircle2, 
  FileText, 
  Palette, 
  Layers, 
  Image as ImageIcon,
  ExternalLink,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { NewFeatureBadge } from '@/components/admin/shared/NewFeatureBadge';
import { NewFeatureExplanation } from '@/components/admin/shared/NewFeatureExplanation';

interface WorkshopPreparationCardProps {
  items: AdminOrderDetailItem[];
  orderCode: string;
  customerName?: string;
  isCustomOrder?: boolean;
  customizationNotes?: string | null;
  referenceImageUrl?: string | null;
}

export function WorkshopPreparationCard({
  items,
  orderCode,
  customerName,
  isCustomOrder,
  customizationNotes,
  referenceImageUrl
}: WorkshopPreparationCardProps) {
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);

  // Helper para descargar imagen desde URL
  const handleDownloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url, { mode: 'cors' });
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      toast.success('Imagen descargada correctamente', { description: filename });
    } catch {
      // Fallback si CORS bloquea el fetch directo
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.info('Abriendo imagen para guardar...', { description: filename });
    }
  };

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
    <div className="bg-white rounded-[24px] shadow-sm border border-[#c8a96b]/35 overflow-hidden">
      {/* Cabecera del Taller de Preparación */}
      <div className="p-6 sm:p-7 bg-gradient-to-r from-[#faf7f2] via-[#fffdfa] to-[#faf7f2] border-b border-[#c8a96b]/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-8 h-8 rounded-full bg-[#fdf6e7] border border-[#c8a96b]/40 flex items-center justify-center text-[#c8a96b] shrink-0">
              <Palette className="w-4 h-4" />
            </span>
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#c8a96b]">
              Hoja de Taller Artesanal
            </span>
            <NewFeatureBadge label="NUEVO" size="sm" />
            <span className="text-[11px] font-bold bg-[#71a37c]/15 text-[#527d5c] border border-[#71a37c]/30 px-2 py-0.5 rounded-full">
              Para Armado de Ramo
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#4a3933]">
            Personalización y Detalles de Elaboración
          </h2>
          <p className="text-xs text-[#887870] mt-0.5">
            Especificaciones seleccionadas por el cliente para el armado físico del ramo y sus accesorios.
          </p>
        </div>

        <div className="text-left sm:text-right shrink-0 bg-white/80 border border-[#c8a96b]/30 px-4 py-2 rounded-2xl shadow-2xs">
          <span className="text-[10px] text-[#887870] uppercase font-bold block">Pedido</span>
          <span className="font-mono font-bold text-sm text-[#4a3933]">{orderCode}</span>
        </div>
      </div>

      {/* Lista de Ramos y Artículos */}
      <div className="p-6 sm:p-7 space-y-6">
        {/* Guía Explicativa de Novedad para Trabajadores */}
        <NewFeatureExplanation
          id="workshop_sheet_guide"
          title="Ficha de Taller: Personalización de Ramos y Dedicatorias"
          badgeLabel="NUEVO"
          whatChanged="Se integró esta ficha dedicada exclusivamente al trabajo manual en el taller. Ahora se muestran con exactitud las flores y su color, los colores de envoltura (principal y secundario) y si lleva luces LED o mariposa 3D. Además, incluye la descarga directa de la dedicatoria en alta resolución (PNG) lista para imprimir."
          howToUse={[
            "Revisa los bloques '🌸 Tipo de Flores' y 'Paleta del Ramo' antes de iniciar la confección.",
            "Verifica en 'Accesorios & Extras' si lleva Luces LED o Mariposa 3D para incorporarlas al arreglo.",
            "Haz clic en 'Descargar Tarjeta (PNG)' para obtener la tarjeta dedicatoria en 1600x1000 px lista para imprimir o pulsa 'Imprimir' para enviarla directamente.",
            "Si el pedido es personalizado, revisa las notas del cliente y descarga su foto de referencia como guía visual."
          ]}
          tips="Tip para floristas: Al descargar la tarjeta PNG obtienes las medidas exactas listas para recortar y colocar en el soporte del ramo."
        />

        {items.map((item, idx) => {
          const hasCustomization = Boolean(
            item.selectedPrimaryColor ||
            item.selectedSecondaryColor ||
            item.selectedFlowerType ||
            item.selectedFlowerColor ||
            item.hasLights ||
            item.hasButterfly ||
            item.hasPhraseCard ||
            item.phraseText
          );

          return (
            <div 
              key={idx} 
              className="bg-[#fdfbf7] rounded-2xl border border-[#c8a96b]/25 p-5 sm:p-6 shadow-2xs hover:shadow-xs transition-shadow space-y-5"
            >
              {/* Encabezado del Producto */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#e8dcdc]">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-[#4a3933] text-white flex items-center justify-center font-mono font-bold text-sm">
                    {item.quantity}x
                  </span>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#4a3933]">
                      {item.productName}
                    </h3>
                    <span className="text-[11px] text-[#887870]">
                      Cantidad a preparar: <strong>{item.quantity} {item.quantity === 1 ? 'unidad' : 'unidades'}</strong>
                    </span>
                  </div>
                </div>

                {hasCustomization ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8f6d28] bg-[#fcf9f2] border border-[#c8a96b]/40 px-3 py-1 rounded-full">
                    <Sparkles className="w-3.5 h-3.5 text-[#c8a96b]" />
                    Ramo Personalizado
                  </span>
                ) : (
                  <span className="text-xs text-[#887870] bg-white border border-stone-200 px-3 py-1 rounded-full">
                    Diseño de Colección Estándar
                  </span>
                )}
              </div>

              {/* Grilla de Especificaciones del Ramo */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 1. Flores & Tipo */}
                <div className="bg-white p-4 rounded-xl border border-[#e8dcdc]/80 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#c8a96b]">
                    <span>🌸 Tipo de Flores</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div>
                      <span className="text-[#887870] block text-[10px] uppercase font-semibold">Flor Seleccionada:</span>
                      <p className="font-bold text-[#4a3933] text-sm">
                        {item.selectedFlowerType || 'Según catálogo base'}
                      </p>
                    </div>
                    {item.selectedFlowerColor && (
                      <div>
                        <span className="text-[#887870] block text-[10px] uppercase font-semibold">Color de la Flor:</span>
                        <span className="inline-flex items-center gap-1.5 font-semibold text-[#4a3933] bg-[#faf7f2] px-2.5 py-1 rounded-lg border border-[#c8a96b]/20 mt-0.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#c8a96b]" />
                          {item.selectedFlowerColor}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Paleta de Colores de Envoltura / Base */}
                <div className="bg-white p-4 rounded-xl border border-[#e8dcdc]/80 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#c8a96b]">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Paleta del Ramo</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div>
                      <span className="text-[#887870] block text-[10px] uppercase font-semibold">Color Principal / Base:</span>
                      <p className="font-bold text-[#4a3933] text-sm">
                        {item.selectedPrimaryColor || 'Estándar'}
                      </p>
                    </div>
                    {item.selectedSecondaryColor && (
                      <div>
                        <span className="text-[#887870] block text-[10px] uppercase font-semibold">Color Secundario:</span>
                        <p className="font-semibold text-[#4a3933]">
                          {item.selectedSecondaryColor}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Accesorios y Luces */}
                <div className="bg-white p-4 rounded-xl border border-[#e8dcdc]/80 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#c8a96b]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Accesorios & Extras</span>
                  </div>
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#4a3933] font-medium flex items-center gap-1">
                        ✨ Luces LED cálidas:
                      </span>
                      {item.hasLights ? (
                        <span className="font-bold text-[#b58129] bg-[#fdf6e7] px-2 py-0.5 rounded-md border border-[#c8a96b]/30">
                          SÍ INCLUIR
                        </span>
                      ) : (
                        <span className="text-[#887870] text-[11px]">No incluido</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#4a3933] font-medium flex items-center gap-1">
                        🦋 Mariposa 3D decorativa:
                      </span>
                      {item.hasButterfly ? (
                        <span className="font-bold text-[#71a37c] bg-[#eef7f0] px-2 py-0.5 rounded-md border border-[#71a37c]/30">
                          SÍ INCLUIR
                        </span>
                      ) : (
                        <span className="text-[#887870] text-[11px]">No incluido</span>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* Tarjeta Dedicatoria Personalizada */}
              {(item.hasPhraseCard || item.phraseText) && (
                <div className="bg-white rounded-2xl border-2 border-dashed border-[#c8a96b]/40 p-5 sm:p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#fdf5f5] text-[#b85b6b] flex items-center justify-center">
                        <Heart className="w-4 h-4 fill-current" />
                      </div>
                      <div>
                        <span className="text-[10px] font-serif uppercase tracking-[0.2em] text-[#c8a96b] font-bold block">
                          Dedicatoria Impresa para el Ramo
                        </span>
                        <h4 className="font-serif text-base font-bold text-[#4a3933]">
                          Tarjeta de Mensaje Personal
                        </h4>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {item.phraseFont && (
                        <span className="text-[11px] font-mono font-semibold bg-[#faf7f2] border border-[#c8a96b]/30 text-[#4a3933] px-3 py-1 rounded-full">
                          Fuente: {item.phraseFont}
                        </span>
                      )}

                      {/* Botón Descargar Tarjeta PNG */}
                      <div className="flex items-center gap-1.5">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleDownloadDedicationCard(item, idx)}
                          disabled={downloadingIndex === idx}
                          className="bg-[#4a3933] hover:bg-[#382b26] text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-xs flex items-center gap-1.5"
                        >
                          <Download className="w-3.5 h-3.5 text-[#c8a96b]" />
                          {downloadingIndex === idx ? 'Generando...' : 'Descargar Tarjeta (PNG)'}
                        </Button>
                        <NewFeatureBadge label="NUEVO" size="sm" />
                      </div>

                      {/* Botón Imprimir Tarjeta */}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handlePrintCard(item)}
                        className="border-[#c8a96b]/40 text-[#4a3933] hover:bg-[#faf7f2] text-xs font-bold rounded-full flex items-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5 text-[#c8a96b]" />
                        Imprimir
                      </Button>
                    </div>
                  </div>

                  {/* Vista Previa de la Dedicatoria tipo Postal */}
                  <div className="bg-[#fcf9f2] p-4 sm:p-5 rounded-xl border border-[#c8a96b]/30 relative text-center">
                    <span className="text-[10px] text-[#c8a96b] uppercase tracking-widest font-bold block mb-1">
                      ✦ Mensaje a Imprimir ✦
                    </span>
                    <p className="font-serif italic text-lg sm:text-xl text-[#3d2e28] leading-relaxed max-w-2xl mx-auto px-4">
                      &ldquo;{item.phraseText}&rdquo;
                    </p>
                  </div>
                </div>
              )}

            </div>
          );
        })}

        {/* Sección de Pedido Especial / Personalizado (Foto de Referencia y Notas) */}
        {isCustomOrder && (
          <div className="bg-[#faf7f2] rounded-2xl border border-[#c8a96b]/30 p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 text-[#4a3933] font-serif font-bold text-base">
              <ImageIcon className="w-5 h-5 text-[#c8a96b]" />
              <span>Pedido Personalizado Especial del Cliente</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Notas del Cliente */}
              <div className="space-y-2">
                <span className="text-xs uppercase font-bold tracking-wider text-[#887870] block">
                  Descripción e Instrucciones del Cliente:
                </span>
                <div className="bg-white p-4 rounded-xl border border-[#c8a96b]/20 text-sm text-[#4a3933] whitespace-pre-wrap leading-relaxed">
                  {customizationNotes || 'Sin instrucciones adicionales.'}
                </div>
              </div>

              {/* Imagen de Referencia con Descarga */}
              {referenceImageUrl && (
                <div className="space-y-2">
                  <span className="text-xs uppercase font-bold tracking-wider text-[#887870] block">
                    Foto de Referencia Subida por el Cliente:
                  </span>
                  <div className="bg-white p-3 rounded-xl border border-[#c8a96b]/20 flex flex-col sm:flex-row items-center gap-4">
                    <a 
                      href={referenceImageUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="relative w-32 h-32 rounded-lg overflow-hidden border border-[#c8a96b]/30 shrink-0 hover:opacity-90 transition-opacity block"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={referenceImageUrl} 
                        alt="Referencia del cliente" 
                        className="w-full h-full object-cover" 
                      />
                    </a>
                    <div className="space-y-2 text-center sm:text-left">
                      <p className="text-xs text-[#887870]">
                        Utiliza esta foto como guía de estilo para el arreglo artesanal.
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleDownloadImage(referenceImageUrl, `Referencia_${orderCode}.jpg`)}
                        className="bg-[#4a3933] hover:bg-[#382b26] text-white text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5 text-[#c8a96b]" />
                        Descargar Foto Referencia
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
