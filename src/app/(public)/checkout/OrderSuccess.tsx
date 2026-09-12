"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreateOrderResponse } from '@/types/checkout';
import Image from 'next/image';
import flo1 from '@/app/(public)/images/flo1.png';
import flo2 from '@/app/(public)/images/flo2.png';
import flo4 from '@/app/(public)/images/flo4.png';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Home, CheckCircle2, Info } from 'lucide-react';

export interface OrderDetailsSnapshot {
  customer?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  items?: {
    productId?: string;
    name: string;
    quantity: number;
    price: number;
    selectedPrimaryColor?: string;
    selectedSecondaryColor?: string;
    selectedFlowerType?: string;
    selectedFlowerColor?: string;
    hasLights?: boolean;
    hasButterfly?: boolean;
    hasPhraseCard?: boolean;
    phraseText?: string;
    phraseFont?: string;
  }[];
  delivery?: {
    type?: string | number;
    zoneName?: string;
    meetingPointName?: string;
    meetingPointAddress?: string;
    address?: string;
    department?: string;
    province?: string;
    district?: string;
  };
}

interface OrderSuccessProps {
  order: CreateOrderResponse;
  orderDetails?: OrderDetailsSnapshot | null;
}

export function OrderSuccess({ order, orderDetails }: OrderSuccessProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [snapshot, setSnapshot] = useState<OrderDetailsSnapshot | null>(orderDetails || null);

  useEffect(() => {
    if (!snapshot && typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem('latestOrderSnapshot');
        if (stored) {
          setSnapshot(JSON.parse(stored));
        }
      } catch (e) {
        console.error("Error recuperando snapshot de orden", e);
      }
    }
  }, [snapshot]);

  useEffect(() => {
    setMounted(true);
    // Iniciar impresión rápido
    const timer1 = setTimeout(() => setShowContent(true), 500);
    // Mostrar info después de que termine la impresión
    const timer2 = setTimeout(() => setShowInfo(true), 3500);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const isPaymentRequired = order.status === 2 || (order.status as any) === 'WaitingPayment';

  const orderCode = order.orderCode || (order as any).OrderCode;
  const trackingToken = order.trackingToken || (order as any).TrackingToken || (order as any).token || '';

  const handleProceed = () => {
    if (isPaymentRequired) {
      sessionStorage.setItem('tempPaymentContext', JSON.stringify({
        orderCode: orderCode,
        total: order.total || (order as any).Total,
        shippingCost: order.deliveryCost || (order as any).DeliveryCost || 0,
        status: isPaymentRequired ? 2 : order.status
      }));
      router.push(`/pago/${order.id || (order as any).Id}`);
    } else {
      router.push(`/seguimiento?code=${orderCode}&token=${trackingToken}`);
    }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(val);
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('es-PE', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  if (!mounted) return null;

  console.log("OrderSuccess Rendered: Horizontal Layout Active");

  return (
    <div className="w-full flex flex-col items-center justify-start relative z-10">
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[400px] opacity-40 pointer-events-none translate-x-1/4 -translate-y-1/4 animate-spin-slow mix-blend-multiply">
        <Image src={flo4} alt="" width={400} height={400}  style={{ width: 'auto', height: 'auto' }} />
      </div>
      <div className="absolute bottom-0 left-0 w-[300px] opacity-30 pointer-events-none -translate-x-1/4 translate-y-1/4 animate-float-gentle mix-blend-multiply">
        <Image src={flo2} alt="" width={300} height={300}  style={{ width: 'auto', height: 'auto' }} />
      </div>
      <div className="absolute top-1/2 left-10 w-[150px] opacity-20 pointer-events-none -translate-y-1/2 animate-float mix-blend-multiply rotate-45">
        <Image src={flo1} alt="" width={150} height={150}  style={{ width: 'auto', height: 'auto' }} />
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .ticket-edge-bottom {
          background-image: radial-gradient(circle at 6px 6px, transparent 6px, #fdfdfd 6.5px);
          background-size: 12px 12px;
          background-position: center bottom;
          background-repeat: repeat-x;
          height: 12px;
          width: 100%;
          transform: rotate(180deg);
        }
        .printing-mask {
          mask-image: linear-gradient(to bottom, black 95%, transparent 100%);
          -webkit-mask-image: linear-gradient(to bottom, black 95%, transparent 100%);
        }
      `}} />

      <div className="relative w-full max-w-5xl mx-auto flex flex-col md:flex-row gap-12 px-4 md:px-8">
        
        {/* Top Section: POS on Left, Info on Right */}
          {/* LEFT: POS Machine */}
          <div className="w-full md:w-[360px] flex-shrink-0 flex flex-col items-center relative z-20">
            {/* Machine */}
            <div className="w-full bg-gradient-to-b from-[#2a2a2c] to-[#1c1c1e] rounded-[2.5rem] p-8 text-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6),inset_0_2px_10px_rgba(255,255,255,0.15),inset_0_-5px_20px_rgba(0,0,0,0.8)] relative border-b-[6px] border-[#0a0a0a] border-t border-[#444]/60 ring-1 ring-black overflow-hidden z-20">
              {/* Highlight/Glare effect */}
              <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/5 to-transparent pointer-events-none rounded-t-[2.5rem]"></div>
              
              {/* Gold line accent */}
              <div className="absolute bottom-10 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#c8a96b]/30 to-transparent"></div>
              
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border border-[#34d399]/30 flex items-center justify-center">
                    <CheckCircle2 className="text-[#34d399] w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-medium text-sm text-white/90">Pedido Confirmado</h2>
                    <p className="font-semibold text-xl">{formatCurrency(order.total || (order as any).Total || 0)}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center relative z-10">
                <div className="flex items-center gap-2 text-[#34d399] text-xs font-medium bg-[#34d399]/10 px-4 py-1.5 rounded-full border border-[#34d399]/20">
                  <CheckCircle2 size={14} /> Listo
                </div>
                <div className="text-[#c8a96b]/50">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                </div>
              </div>
              
              {/* Machine Slot Edge */}
              <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-black to-transparent opacity-80 z-20"></div>
              {/* Machine Slot Shadow */}
              <div className="absolute -bottom-2 left-6 right-6 h-5 bg-black blur-[6px] rounded-full -z-10"></div>
            </div>

            {/* Receipt Wrapper (Handles printing animation) */}
            <div className="w-[88%] relative z-10 -mt-10 flex flex-col items-center">
              <div 
                className={`w-full overflow-hidden transition-all ease-[cubic-bezier(0.25,1,0.5,1)] ${showContent ? 'max-h-[3200px] duration-[3500ms]' : 'max-h-0 duration-0'}`}
              >
                <div className={`w-full transition-transform ease-out ${showContent ? 'translate-y-0 duration-[3500ms]' : '-translate-y-[120%] duration-0'}`}>
                  {/* The actual ticket */}
                  <div className="bg-[#fdfdfd] pt-14 pb-8 px-4 sm:px-5 shadow-xl border-x border-[#e5e5e5] relative text-[#2a2a2a]">
                    <div className="space-y-3.5 text-xs font-mono">
                      
                      {/* Header Atelier */}
                      <div className="text-center pb-3 border-b border-dashed border-[#ccc]">
                        <div className="font-bold tracking-widest text-sm text-[#1a1a1a]">AURA NOVA</div>
                        <div className="text-[10px] text-[#777] uppercase tracking-wider">Atelier de Detalles Florales</div>
                        <div className="text-[9px] text-[#888] mt-0.5">Huancayo, Junín • Perú</div>
                      </div>

                      {/* Meta: Pedido & Fecha */}
                      <div className="text-[11px] space-y-1 pb-3 border-b border-dashed border-[#ccc]">
                        <div className="flex justify-between">
                          <span className="text-[#777]">PEDIDO:</span>
                          <span className="font-bold text-[#1a1a1a]">{orderCode}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#777]">FECHA:</span>
                          <span>{formatDate(order.createdAt || new Date().toISOString())}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#777]">ESTADO:</span>
                          <span className="font-bold text-[#b58129]">{isPaymentRequired ? 'POR ABONAR (50% O 100%)' : 'CONFIRMADO'}</span>
                        </div>
                      </div>

                      {/* DATOS DEL CLIENTE */}
                      {snapshot?.customer && (
                        <div className="text-[11px] space-y-1 pb-3 border-b border-dashed border-[#ccc]">
                          <div className="text-[10px] uppercase font-bold text-[#777] tracking-wider mb-1">
                            DATOS DEL CLIENTE
                          </div>
                          {snapshot.customer.name && (
                            <div className="flex justify-between">
                              <span className="text-[#777]">Cliente:</span>
                              <span className="font-bold text-right max-w-[170px] truncate">{snapshot.customer.name}</span>
                            </div>
                          )}
                          {snapshot.customer.phone && (
                            <div className="flex justify-between">
                              <span className="text-[#777]">Tel/WSP:</span>
                              <span>{snapshot.customer.phone}</span>
                            </div>
                          )}
                          {snapshot.customer.email && (
                            <div className="flex justify-between">
                              <span className="text-[#777]">Email:</span>
                              <span className="text-right max-w-[170px] truncate">{snapshot.customer.email}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* ENTREGA Y DESTINO */}
                      {snapshot?.delivery && (
                        <div className="text-[11px] space-y-1 pb-3 border-b border-dashed border-[#ccc]">
                          <div className="text-[10px] uppercase font-bold text-[#777] tracking-wider mb-1">
                            ENTREGA Y DESTINO
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#777]">Modalidad:</span>
                            <span className="font-bold text-right">
                              {String(snapshot.delivery.type) === '0' || snapshot.delivery.type === 'Delivery' ? 'Delivery Huancayo' :
                               String(snapshot.delivery.type) === '1' || snapshot.delivery.type === 'MeetingPoint' ? 'Punto de Encuentro' :
                               'Envío Nacional (Olva/Shalom)'}
                            </span>
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
                              <span className="text-right pl-2 leading-tight">{snapshot.delivery.address}</span>
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

                      {/* DETALLE DE PRODUCTOS */}
                      <div className="pb-3 border-b border-dashed border-[#ccc]">
                        <div className="flex justify-between text-[10px] uppercase font-bold text-[#777] tracking-wider mb-2">
                          <span>DETALLE ARTESANAL</span>
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
                                
                                {/* Especificaciones de personalización */}
                                <div className="text-[10px] text-[#555] space-y-0.5 pl-2 border-l border-stone-300">
                                  {item.selectedPrimaryColor && <div>• Base: {item.selectedPrimaryColor}</div>}
                                  {item.selectedSecondaryColor && <div>• Secundario: {item.selectedSecondaryColor}</div>}
                                  {item.selectedFlowerType && <div>• Flor: {item.selectedFlowerType}</div>}
                                  {item.selectedFlowerColor && <div>• Color flor: {item.selectedFlowerColor}</div>}
                                  {item.hasLights && <div>• Luces LED incluidas ✨</div>}
                                  {item.hasButterfly && <div>• Mariposa decorativa 🦋</div>}
                                  {(item.hasPhraseCard || item.phraseText) && (
                                    <div className="italic text-[#4a3933] bg-[#f8f5ee] p-1.5 rounded mt-1">
                                      💌 “{item.phraseText}” {item.phraseFont ? `(${item.phraseFont})` : ''}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex justify-between text-[11px]">
                            <span>1x Detalle seleccionado</span>
                            <span>{formatCurrency(order.subtotal || (order as any).Subtotal || 0)}</span>
                          </div>
                        )}
                      </div>

                      {/* TOTALES */}
                      <div className="space-y-1.5 text-[11px] pb-3 border-b border-dashed border-[#ccc]">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span>{formatCurrency(order.subtotal || (order as any).Subtotal || 0)}</span>
                        </div>

                        {((order.deliveryCost !== null && order.deliveryCost !== undefined) || ((order as any).DeliveryCost !== null && (order as any).DeliveryCost !== undefined)) && (
                          <div className="flex justify-between">
                            <span>Costo de Envío</span>
                            <span>{formatCurrency(order.deliveryCost ?? (order as any).DeliveryCost ?? 0)}</span>
                          </div>
                        )}

                        <div className="flex justify-between font-bold text-sm text-[#b85b6b] pt-1">
                          <span>TOTAL A PAGAR</span>
                          <span>{formatCurrency(order.total || (order as any).Total || 0)}</span>
                        </div>
                      </div>

                      {/* CLAVE Y CÓDIGO */}
                      <div className="text-[10px] text-[#777] space-y-1 pt-1">
                        <div className="flex justify-between items-center">
                          <span>CLAVE DE RASTREO:</span>
                          <span className="font-bold bg-[#f3ece2] text-[#4a3933] px-1.5 py-0.5 rounded tracking-wider">{trackingToken}</span>
                        </div>
                      </div>

                      {/* Simulated Barcode */}
                      <div className="pt-3 flex flex-col items-center opacity-85">
                        <div className="flex gap-[2px] h-8 items-end">
                          {Array.from({ length: 32 }).map((_, i) => (
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
                          {orderCode}
                        </div>
                        <div className="text-[8px] text-[#999] uppercase tracking-wider text-center mt-2">
                          *** GRACIAS POR TU PREFERENCIA ***
                        </div>
                      </div>

                    </div>
                  </div>
                  {/* Ticket jagged edge */}
                  <div className="ticket-edge-bottom w-full shadow-xl"></div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT: Texts and Action */}
          <div className="flex-1 flex flex-col justify-center items-center md:items-start text-center md:text-left mt-12 md:mt-0">
            <h1 className="text-4xl md:text-5xl font-serif text-[#4a3933] font-bold mb-4">
              {isPaymentRequired ? '¡Casi listo!' : '¡Pedido confirmado!'}
            </h1>
            
            <div className="flex items-center gap-4 w-full justify-center md:justify-start mb-6">
              <div className="h-[1px] w-12 bg-[#c8a96b]/30"></div>
              <svg className="text-[#c8a96b] w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              <div className="h-[1px] w-12 bg-[#c8a96b]/30"></div>
            </div>
            
            <p className="text-[#887870] text-sm md:text-base max-w-md mb-8">
              {isPaymentRequired 
                ? 'Tu pedido está en espera. Abona el 50% o el total para empezar a prepararlo.' 
                : 'Gracias por tu compra. Tu pedido ha sido recibido y pronto llegará para crear sonrisas.'}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 mb-12 w-full justify-center md:justify-start">
              <div className="flex items-center gap-2 text-[#34d399] text-sm font-semibold bg-[#34d399]/10 px-5 py-2 rounded-full border border-[#34d399]/20 w-fit">
                <CheckCircle2 size={16} /> Listo
              </div>
              
              <Button 
                onClick={handleProceed}
                className={`h-10 text-xs tracking-widest uppercase flex items-center justify-center gap-2 rounded-full font-sans font-bold transition-all hover:scale-[1.02] shadow-lg px-8 ${isPaymentRequired ? 'bg-[#4a3933] hover:bg-[#3d2e29] text-white shadow-[#4a3933]/20' : 'bg-[#71a37c] hover:bg-[#5b8764] text-white shadow-[#71a37c]/30'}`}
              >
                {isPaymentRequired ? 'IR A PAGAR AHORA' : 'VER ESTADO'} <ArrowRight size={16} />
              </Button>
            </div>

            {/* Info Text (Replacing Cards) */}
            <div className={`space-y-6 w-full text-[#887870] text-sm max-w-md transition-all duration-700 ${showInfo ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-[#fdf5f5] text-[#d38b8b] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </div>
                <p className="leading-relaxed">
                  Guarda tu <strong>código de pedido</strong> para hacerle seguimiento. Te enviaremos una copia al correo y te contactaremos por WhatsApp en breve.
                </p>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-[#e8efe9] text-[#71a37c] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                </div>
                <p className="leading-relaxed">
                  Con tu código podrás ingresar a nuestra sección de rastreo y ver el estado de tu envío en tiempo real.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
  );
}
