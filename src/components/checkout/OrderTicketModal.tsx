"use client";

import React, { useRef } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Printer, Receipt, Check, Copy, Sparkles, MapPin, User, Package, Heart } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { OrderDetailsSnapshot } from '@/app/(public)/checkout/OrderSuccess';
import { toast } from 'sonner';

interface OrderTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderCode: string;
  total: number | null;
  shippingCost?: number;
  snapshot: OrderDetailsSnapshot | null;
}

export function OrderTicketModal({
  isOpen,
  onClose,
  orderCode,
  total,
  shippingCost = 0,
  snapshot
}: OrderTicketModalProps) {
  const [copied, setCopied] = React.useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);

  const calculatedSubtotal = total !== null ? Math.max(0, total - shippingCost) : null;
  const halfTotal = total !== null ? total * 0.5 : null;

  const handleCopyCode = () => {
    if (!orderCode) return;
    navigator.clipboard.writeText(orderCode);
    setCopied(true);
    toast.success('Código de pedido copiado', { description: orderCode });
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const deliveryTypeLabel = () => {
    if (!snapshot?.delivery?.type) return 'A coordinar';
    const t = String(snapshot.delivery.type);
    if (t === '0' || t === 'Delivery') return 'Delivery Huancayo';
    if (t === '1' || t === 'MeetingPoint') return 'Punto de Encuentro';
    return 'Envío Nacional (Olva/Shalom)';
  };

  const formattedDate = new Date().toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-md"
      title=""
      footer={
        <div className="w-full flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="flex items-center gap-1.5 text-xs text-[#4a3933] border-[#c8a96b]/40 hover:bg-[#faf7f2] rounded-full"
          >
            <Printer className="w-3.5 h-3.5 text-[#c8a96b]" />
            Imprimir / Guardar
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onClose}
            className="bg-[#4a3933] hover:bg-[#382b26] text-white text-xs px-5 rounded-full"
          >
            Cerrar Ticket
          </Button>
        </div>
      }
    >
      {/* Styles for authentic ticket perforations */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #aura-printable-ticket, #aura-printable-ticket * {
            visibility: visible;
          }
          #aura-printable-ticket {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
        .ticket-sawtooth-top {
          background-image: radial-gradient(circle at 6px 0px, transparent 6px, #fdfdfd 6.5px);
          background-size: 12px 12px;
          background-position: center top;
          background-repeat: repeat-x;
          height: 10px;
          width: 100%;
        }
        .ticket-sawtooth-bottom {
          background-image: radial-gradient(circle at 6px 12px, transparent 6px, #fdfdfd 6.5px);
          background-size: 12px 12px;
          background-position: center bottom;
          background-repeat: repeat-x;
          height: 10px;
          width: 100%;
        }
      `}} />

      <div id="aura-printable-ticket" ref={ticketRef} className="w-full flex flex-col items-center">
        {/* Jagged Top Edge */}
        <div className="ticket-sawtooth-top drop-shadow-xs"></div>

        {/* Thermal Paper Body */}
        <div className="w-full bg-[#fdfdfd] px-5 py-4 text-[#2a2a2a] shadow-md border-x border-[#e8dcdc]/60">
          <div className="space-y-3.5 text-xs font-mono">
            
            {/* Header Brand */}
            <div className="text-center pb-3 border-b border-dashed border-[#ccc]">
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#faf7f2] border border-[#c8a96b]/30 mb-1 text-[#c8a96b]">
                <Receipt className="w-4 h-4" />
              </div>
              <div className="font-bold tracking-widest text-base text-[#1a1a1a] font-serif">AURA NOVA</div>
              <div className="text-[10px] text-[#777] uppercase tracking-wider">Atelier de Detalles Florales</div>
              <div className="text-[9px] text-[#888] mt-0.5">Huancayo, Junín • Perú</div>
            </div>

            {/* Meta: Código, Fecha, Estado */}
            <div className="text-[11px] space-y-1 pb-3 border-b border-dashed border-[#ccc]">
              <div className="flex justify-between items-center">
                <span className="text-[#777]">PEDIDO:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[#1a1a1a] text-xs">{orderCode || '---'}</span>
                  <button 
                    type="button" 
                    onClick={handleCopyCode} 
                    className="p-1 hover:bg-[#f3ece2] rounded text-[#887870] transition-colors"
                    title="Copiar código"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-[#c8a96b]" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-[#777]">FECHA:</span>
                <span>{formattedDate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#777]">ESTADO:</span>
                <span className="font-bold text-[#b58129] bg-[#fdf6e7] px-1.5 py-0.5 rounded text-[10px]">
                  ESPERANDO ABONO
                </span>
              </div>
            </div>

            {/* Datos del Cliente */}
            {snapshot?.customer && (
              <div className="text-[11px] space-y-1 pb-3 border-b border-dashed border-[#ccc]">
                <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-[#777] tracking-wider mb-1">
                  <User className="w-3 h-3 text-[#c8a96b]" />
                  <span>DATOS DEL CLIENTE</span>
                </div>
                {snapshot.customer.name && (
                  <div className="flex justify-between">
                    <span className="text-[#777]">Cliente:</span>
                    <span className="font-bold text-right max-w-[190px] truncate">{snapshot.customer.name}</span>
                  </div>
                )}
                {snapshot.customer.phone && (
                  <div className="flex justify-between">
                    <span className="text-[#777]">Tel/WSP:</span>
                    <span className="font-bold">{snapshot.customer.phone}</span>
                  </div>
                )}
                {snapshot.customer.email && (
                  <div className="flex justify-between">
                    <span className="text-[#777]">Email:</span>
                    <span className="text-right max-w-[190px] truncate">{snapshot.customer.email}</span>
                  </div>
                )}
              </div>
            )}

            {/* Entrega y Destino */}
            {snapshot?.delivery && (
              <div className="text-[11px] space-y-1 pb-3 border-b border-dashed border-[#ccc]">
                <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-[#777] tracking-wider mb-1">
                  <MapPin className="w-3 h-3 text-[#c8a96b]" />
                  <span>ENTREGA Y DESTINO</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#777]">Modalidad:</span>
                  <span className="font-bold text-right">{deliveryTypeLabel()}</span>
                </div>
                {snapshot.delivery.zoneName && (
                  <div className="flex justify-between">
                    <span className="text-[#777]">Zona:</span>
                    <span className="text-right">{snapshot.delivery.zoneName}</span>
                  </div>
                )}
                {snapshot.delivery.meetingPointName && (
                  <div className="flex justify-between">
                    <span className="text-[#777]">Punto:</span>
                    <span className="text-right">{snapshot.delivery.meetingPointName}</span>
                  </div>
                )}
                {snapshot.delivery.address && (
                  <div className="flex justify-between items-start">
                    <span className="text-[#777] shrink-0">Dirección:</span>
                    <span className="text-right pl-2 leading-tight font-medium">{snapshot.delivery.address}</span>
                  </div>
                )}
                {(snapshot.delivery.district || snapshot.delivery.province || snapshot.delivery.department) && (
                  <div className="flex justify-between items-start">
                    <span className="text-[#777] shrink-0">Destino:</span>
                    <span className="text-right pl-2 leading-tight">
                      {[snapshot.delivery.district, snapshot.delivery.province, snapshot.delivery.department].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Detalle de Productos y Personalización */}
            <div className="pb-3 border-b border-dashed border-[#ccc]">
              <div className="flex justify-between text-[10px] uppercase font-bold text-[#777] tracking-wider mb-2">
                <span className="flex items-center gap-1">
                  <Package className="w-3 h-3 text-[#c8a96b]" /> DETALLE DEL PEDIDO
                </span>
                <span>IMPORTE</span>
              </div>

              {snapshot?.items && snapshot.items.length > 0 ? (
                <div className="space-y-3">
                  {snapshot.items.map((item, idx) => (
                    <div key={idx} className="text-[11px] leading-tight space-y-1">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-[#1a1a1a] pr-2">
                          {item.quantity}x {item.name}
                        </span>
                        <span className="font-bold shrink-0 text-right">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                      
                      {/* Atributos y personalización */}
                      <div className="text-[10px] text-[#555] space-y-0.5 pl-2 border-l border-stone-300">
                        {item.selectedPrimaryColor && <div>• Base: <span className="font-semibold">{item.selectedPrimaryColor}</span></div>}
                        {item.selectedSecondaryColor && <div>• Secundario: <span className="font-semibold">{item.selectedSecondaryColor}</span></div>}
                        {item.selectedFlowerType && <div>• Flor: <span className="font-semibold">{item.selectedFlowerType}</span></div>}
                        {item.selectedFlowerColor && <div>• Color flor: <span className="font-semibold">{item.selectedFlowerColor}</span></div>}
                        {item.hasLights && <div className="text-[#b58129] font-medium">• Luces LED incluidas ✨</div>}
                        {item.hasButterfly && <div className="text-[#71a37c] font-medium">• Mariposa decorativa 🦋</div>}
                        {(item.hasPhraseCard || item.phraseText) && (
                          <div className="italic text-[#4a3933] bg-[#f8f5ee] p-1.5 rounded mt-1 border border-[#e8dcdc]/60">
                            <span className="not-italic font-bold">💌 Dedicatoria:</span> “{item.phraseText}” 
                            {item.phraseFont ? <span className="text-[9px] text-[#887870] block">Tipografía: {item.phraseFont}</span> : null}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex justify-between text-[11px]">
                  <span>1x Detalle seleccionado</span>
                  <span>{total !== null ? formatCurrency(total) : '---'}</span>
                </div>
              )}
            </div>

            {/* Totales y Desglose */}
            <div className="space-y-1.5 text-[11px] pb-3 border-b border-dashed border-[#ccc]">
              {calculatedSubtotal !== null && (
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(calculatedSubtotal)}</span>
                </div>
              )}

              {shippingCost > 0 ? (
                <div className="flex justify-between">
                  <span>Costo de Envío</span>
                  <span>{formatCurrency(shippingCost)}</span>
                </div>
              ) : (
                <div className="flex justify-between text-[#71a37c]">
                  <span>Costo de Envío</span>
                  <span className="font-semibold">Gratis</span>
                </div>
              )}

              <div className="flex justify-between font-bold text-sm text-[#b85b6b] pt-1 border-t border-dotted border-[#e0d5c5]">
                <span>TOTAL DEL PEDIDO</span>
                <span>{total !== null ? formatCurrency(total) : '---'}</span>
              </div>

              {halfTotal !== null && (
                <div className="flex justify-between text-[10px] text-[#4a3933] bg-[#faf7f2] p-1.5 rounded border border-[#c8a96b]/20 mt-1">
                  <span>Mínimo para confirmar (50%):</span>
                  <span className="font-bold text-[#b58129]">{formatCurrency(halfTotal)}</span>
                </div>
              )}
            </div>

            {/* Simulación de Código de Barras */}
            <div className="pt-2 flex flex-col items-center opacity-85">
              <div className="flex gap-[2px] h-7 items-end">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div 
                    key={i} 
                    className="bg-black" 
                    style={{ 
                      width: i % 4 === 0 ? '3px' : i % 3 === 0 ? '1.5px' : '2px', 
                      height: i % 2 === 0 ? '100%' : '70%' 
                    }} 
                  />
                ))}
              </div>
              <div className="text-center text-[9px] tracking-[0.3em] text-[#555] font-bold uppercase mt-1">
                {orderCode || 'AURA-NOVA'}
              </div>
              <div className="text-[8px] text-[#999] uppercase tracking-wider text-center mt-1">
                *** HECHO CON AMOR EN NUESTRO ATELIER ***
              </div>
            </div>

          </div>
        </div>

        {/* Jagged Bottom Edge */}
        <div className="ticket-sawtooth-bottom drop-shadow-xs"></div>
      </div>
    </Modal>
  );
}
