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

interface OrderSuccessProps {
  order: CreateOrderResponse;
}

export function OrderSuccess({ order }: OrderSuccessProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

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
        <Image src={flo4} alt="" width={400} height={400} />
      </div>
      <div className="absolute bottom-0 left-0 w-[300px] opacity-30 pointer-events-none -translate-x-1/4 translate-y-1/4 animate-float-gentle mix-blend-multiply">
        <Image src={flo2} alt="" width={300} height={300} />
      </div>
      <div className="absolute top-1/2 left-10 w-[150px] opacity-20 pointer-events-none -translate-y-1/2 animate-float mix-blend-multiply rotate-45">
        <Image src={flo1} alt="" width={150} height={150} />
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
            <div className="w-[85%] relative z-10 -mt-10 flex flex-col items-center">
              <div 
                className={`w-full overflow-hidden transition-all ease-[cubic-bezier(0.25,1,0.5,1)] ${showContent ? 'max-h-[800px] duration-[3000ms]' : 'max-h-0 duration-0'}`}
              >
                <div className={`w-full transition-transform ease-out ${showContent ? 'translate-y-0 duration-[3000ms]' : '-translate-y-[120%] duration-0'}`}>
                  {/* The actual ticket */}
                  <div className="bg-[#fdfdfd] pt-14 pb-8 px-5 shadow-xl border-x border-[#e5e5e5] relative">
                    <div className="space-y-4 text-xs font-mono text-[#333]">
                      <div className="flex justify-between uppercase tracking-wider border-b border-dashed border-[#ccc] pb-4 mb-4">
                        <span className="text-[#888]">PEDIDO</span>
                        <span className="font-bold">{orderCode}</span>
                      </div>

                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>{formatCurrency(order.subtotal || (order as any).Subtotal || 0)}</span>
                      </div>

                      {((order.deliveryCost !== null && order.deliveryCost !== undefined) || ((order as any).DeliveryCost !== null && (order as any).DeliveryCost !== undefined)) && (
                        <div className="flex justify-between">
                          <span>Envío</span>
                          <span>{formatCurrency(order.deliveryCost ?? (order as any).DeliveryCost ?? 0)}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between font-bold text-sm border-t border-dashed border-[#ccc] pt-4 mt-4 text-[#d38b8b]">
                        <span>TOTAL</span>
                        <span>{formatCurrency(order.total || (order as any).Total || 0)}</span>
                      </div>

                      <div className="border-t border-dashed border-[#ccc] pt-4 mt-4 text-[10px] text-[#888]">
                        <div className="flex justify-between mb-2">
                          <span className="flex items-center gap-1"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> Fecha</span>
                          <span>{formatDate(order.createdAt || new Date().toISOString())}</span>
                        </div>
                        <div className="flex justify-between items-center mt-3">
                          <span className="flex items-center gap-1"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> Clave de pedido</span>
                          <span className="font-bold bg-[#f3ece2] text-[#4a3933] px-2 py-1 rounded">{trackingToken}</span>
                        </div>
                      </div>

                      {/* Simulated Barcode */}
                      <div className="mt-6 mb-2 flex justify-center opacity-70">
                        <div className="flex gap-[2px] h-10 items-end">
                          {Array.from({ length: 30 }).map((_, i) => (
                            <div key={i} className="bg-black" style={{ width: Math.random() > 0.5 ? '2px' : '3px', height: Math.random() > 0.3 ? '100%' : '70%' }}></div>
                          ))}
                        </div>
                      </div>
                      <div className="text-center text-[8px] tracking-[0.3em] text-[#888] font-bold uppercase">{orderCode}</div>
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
