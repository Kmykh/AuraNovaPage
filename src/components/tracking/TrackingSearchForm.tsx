"use client";

import React, { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Search, Package, ShieldCheck, Sparkles } from 'lucide-react';
import Image from 'next/image';

import flo1 from '../../app/(public)/images/flo1.png';
import flo2 from '../../app/(public)/images/flo2.png';
import flo5 from '../../app/(public)/images/flo5.png';
import flo6 from '../../app/(public)/images/flo6.png';

export function TrackingSearchForm() {
  const router = useRouter();

  // State for order code (6 digits after PED-)
  const [orderDigits, setOrderDigits] = useState<string[]>(Array(6).fill(''));
  const orderRefs = useRef<(HTMLInputElement | null)[]>([]);

  // State for security token (8 chars: XXXX-XXXX)
  const [tokenChars, setTokenChars] = useState<string[]>(Array(8).fill(''));
  const tokenRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    orderRefs.current[0]?.focus();
  }, []);

  const handleOrderChange = (index: number, value: string) => {
    if (!/^[0-9a-zA-Z]*$/.test(value)) return;

    const newDigits = [...orderDigits];
    newDigits[index] = value.toUpperCase().slice(-1); // Only take last char if they type fast
    setOrderDigits(newDigits);

    // Auto focus next
    if (value && index < 5) {
      orderRefs.current[index + 1]?.focus();
    }
  };

  const handleOrderKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!orderDigits[index] && index > 0) {
        orderRefs.current[index - 1]?.focus();
      }
      const newDigits = [...orderDigits];
      newDigits[index] = '';
      setOrderDigits(newDigits);
    } else if (e.key === 'ArrowLeft' && index > 0) {
      orderRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      orderRefs.current[index + 1]?.focus();
    }
  };

  const handleOrderPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').toUpperCase().replace(/[^0-9A-Z]/g, '');

    // If they paste the whole "PED-000003", extract the last 6 chars
    let relevantData = pastedData;
    if (pastedData.startsWith('PED')) {
      relevantData = pastedData.replace('PED', '');
    }

    const newDigits = [...orderDigits];
    for (let i = 0; i < 6; i++) {
      if (relevantData[i]) {
        newDigits[i] = relevantData[i];
      }
    }
    setOrderDigits(newDigits);

    // Focus last filled or next empty
    const nextEmptyIndex = newDigits.findIndex(d => !d);
    if (nextEmptyIndex !== -1) {
      orderRefs.current[nextEmptyIndex]?.focus();
    } else {
      tokenRefs.current[0]?.focus();
    }
  };

  const handleTokenChange = (index: number, value: string) => {
    if (!/^[0-9a-zA-Z]*$/.test(value)) return;

    const newChars = [...tokenChars];
    newChars[index] = value.toUpperCase().slice(-1);
    setTokenChars(newChars);

    // Auto focus next
    if (value && index < 7) {
      tokenRefs.current[index + 1]?.focus();
    }
  };

  const handleTokenKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!tokenChars[index] && index > 0) {
        tokenRefs.current[index - 1]?.focus();
      }
      const newChars = [...tokenChars];
      newChars[index] = '';
      setTokenChars(newChars);
    } else if (e.key === 'ArrowLeft' && index > 0) {
      tokenRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 7) {
      tokenRefs.current[index + 1]?.focus();
    }
  };

  const handleTokenPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').toUpperCase().replace(/[^0-9A-Z]/g, '');

    const newChars = [...tokenChars];
    for (let i = 0; i < 8; i++) {
      if (pastedData[i]) {
        newChars[i] = pastedData[i];
      }
    }
    setTokenChars(newChars);

    const nextEmptyIndex = newChars.findIndex(c => !c);
    if (nextEmptyIndex !== -1) {
      tokenRefs.current[nextEmptyIndex]?.focus();
    } else {
      tokenRefs.current[7]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalOrderCode = `PED-${orderDigits.join('')}`;
    const finalToken = `${tokenChars.slice(0, 4).join('')}-${tokenChars.slice(4, 8).join('')}`;

    if (finalOrderCode.length !== 10 || finalToken.length !== 9) return;

    const params = new URLSearchParams();
    params.set('code', finalOrderCode);
    params.set('token', finalToken);

    router.push(`/seguimiento?${params.toString()}`);
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full bg-[#faf7f2] overflow-hidden pt-28 pb-24">
      
      {/* Background Flowers */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[45%] -left-20 w-[300px] md:w-[450px] opacity-80 animate-float-gentle mix-blend-multiply">
          <Image src={flo1} alt="" width={450} height={450} className="object-contain" />
        </div>
        <div className="absolute top-[30%] -right-16 w-[200px] md:w-[350px] opacity-90 animate-float-delayed mix-blend-multiply">
          <Image src={flo5} alt="" width={350} height={350} className="object-contain rotate-12" />
        </div>
        <div className="absolute bottom-[10%] left-[15%] w-[120px] md:w-[180px] opacity-50 animate-spin-slow mix-blend-multiply">
          <Image src={flo2} alt="" width={180} height={180} className="object-contain" />
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        
        {/* Top Hero Section: Text Left, Form Right */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center mb-20 mt-8">
          
          {/* Left: Text Content */}
          <div className="text-center lg:text-left flex flex-col items-center lg:items-start max-w-xl mx-auto lg:mx-0">
            <h1 className="font-serif text-[4rem] sm:text-[5.5rem] lg:text-[7rem] font-bold text-[#4a3933] mb-2 leading-[0.9] tracking-tighter">
              Sigue el rastro
            </h1>
            <div className="flex items-center gap-4 mb-8">
              <span className="text-rose/40"><Sparkles size={24} /></span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl text-[#d38b8b] font-serif italic tracking-wide">
                de tu detalle
              </h2>
              <span className="text-gold/60"><Sparkles size={20} /></span>
            </div>
            <p className="text-[#887870] text-lg max-w-sm leading-relaxed">
              Ingresa tus datos para ver el estado de tu pedido en tiempo real.
            </p>
          </div>

          {/* Right: The Form Card */}
          <div className="w-full max-w-md mx-auto relative mt-8 lg:mt-0">
            {/* The white card */}
            <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-[0_20px_50px_-15px_rgba(211,139,139,0.15)] relative z-10">
              
              {/* Floral decoration on the card corner */}
              <div className="absolute -top-14 -right-14 w-[160px] h-[160px] pointer-events-none z-20 mix-blend-multiply opacity-90">
                <Image src={flo1} alt="" width={160} height={160} className="object-contain rotate-[15deg]" />
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-8 relative z-10">
                
                {/* Order Code Section */}
                <div>
                  <div className="flex items-start gap-4 mb-5">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#fdf5f5] text-[#d38b8b]">
                      <Package size={20} />
                    </div>
                    <div>
                      <h3 className="text-[#4a3933] font-serif font-bold text-lg">Código de pedido</h3>
                      <p className="text-[#887870] text-xs leading-snug">Ingresa el código que recibiste al realizar tu compra.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full">
                    <div className="flex items-center justify-center h-12 px-4 bg-[#faf7f2] border border-transparent rounded-2xl font-mono text-sm text-[#4a3933] font-bold shadow-inner">
                      PED
                    </div>
                    <span className="text-[#d38b8b]/30 font-bold">-</span>
                    <div className="flex gap-1.5 w-full justify-between">
                      {orderDigits.map((digit, idx) => (
                        <input
                          key={`order-${idx}`}
                          ref={(el) => { orderRefs.current[idx] = el; }}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOrderChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOrderKeyDown(idx, e)}
                          onPaste={handleOrderPaste}
                          className="w-full max-w-[42px] h-12 text-center rounded-2xl bg-[#faf7f2] border border-transparent text-[#4a3933] font-mono text-base font-bold focus:bg-white focus:border-[#d38b8b]/40 focus:ring-4 focus:ring-[#d38b8b]/10 outline-none transition-all shadow-inner"
                          required
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Security Token Section */}
                <div>
                  <div className="flex items-start gap-4 mb-5">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#fdf5f5] text-[#d38b8b]">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <h3 className="text-[#4a3933] font-serif font-bold text-lg">Token de seguridad</h3>
                      <p className="text-[#887870] text-xs leading-snug">Ingresa el token de seguridad para proteger tu compra.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 w-full justify-between">
                    {tokenChars.slice(0, 4).map((char, idx) => (
                      <input
                        key={`token-a-${idx}`}
                        ref={(el) => { tokenRefs.current[idx] = el; }}
                        type="text"
                        maxLength={1}
                        value={char}
                        onChange={(e) => handleTokenChange(idx, e.target.value)}
                        onKeyDown={(e) => handleTokenKeyDown(idx, e)}
                        onPaste={handleTokenPaste}
                        className="w-full max-w-[38px] h-12 text-center rounded-2xl bg-[#faf7f2] border border-transparent text-[#4a3933] font-mono text-base font-bold focus:bg-white focus:border-[#d38b8b]/40 focus:ring-4 focus:ring-[#d38b8b]/10 outline-none transition-all shadow-inner"
                        required
                      />
                    ))}

                    <span className="text-[#d38b8b]/30 font-bold">-</span>

                    {tokenChars.slice(4, 8).map((char, idx) => (
                      <input
                        key={`token-b-${idx}`}
                        ref={(el) => { tokenRefs.current[idx + 4] = el; }}
                        type="text"
                        maxLength={1}
                        value={char}
                        onChange={(e) => handleTokenChange(idx + 4, e.target.value)}
                        onKeyDown={(e) => handleTokenKeyDown(idx + 4, e)}
                        onPaste={handleTokenPaste}
                        className="w-full max-w-[38px] h-12 text-center rounded-2xl bg-[#faf7f2] border border-transparent text-[#4a3933] font-mono text-base font-bold focus:bg-white focus:border-[#d38b8b]/40 focus:ring-4 focus:ring-[#d38b8b]/10 outline-none transition-all shadow-inner"
                        required
                      />
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full h-14 text-sm tracking-widest uppercase flex items-center justify-center gap-2.5 rounded-full bg-[#c8a96b] hover:bg-[#b89759] text-white font-sans font-bold shadow-xl shadow-[#c8a96b]/20 transition-all duration-300 hover:-translate-y-1"
                  >
                    <Search className="w-5 h-5" />
                    Consultar estado
                  </Button>
                  <div className="flex items-center justify-center gap-2 mt-5 text-[#887870] text-[10px] font-medium">
                    <ShieldCheck size={14} className="text-[#c8a96b]" />
                    Tus datos están protegidos y son 100% seguros
                  </div>
                </div>
                
              </form>
            </div>
          </div>
        </div>

        {/* Features Banner */}
        <div className="w-full max-w-5xl bg-white rounded-3xl p-8 sm:p-10 shadow-[0_8px_30px_rgba(211,139,139,0.08)] mb-8 flex flex-col sm:flex-row flex-wrap justify-between gap-8 sm:gap-4 relative z-10">
          
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left flex-1 min-w-[200px]">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#fdf5f5] text-[#d38b8b] mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
            </div>
            <h4 className="text-[#4a3933] font-bold text-sm mb-1">Rastreo en tiempo real</h4>
            <p className="text-[#887870] text-xs">Consulta el estado actualizado de tu pedido.</p>
          </div>
          
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left flex-1 min-w-[200px]">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#fdf5f5] text-[#d38b8b] mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="15" height="13" x="1" y="6" rx="2" ry="2"/><path d="M16 8h2.5c1.1 0 2 .9 2 2v6h-4.5"/><path d="M9 19h0"/><path d="M19 19h0"/></svg>
            </div>
            <h4 className="text-[#4a3933] font-bold text-sm mb-1">Envíos seguros</h4>
            <p className="text-[#887870] text-xs">Llegamos con cuidado hasta donde estés.</p>
          </div>
          
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left flex-1 min-w-[200px]">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#fdf5f5] text-[#d38b8b] mb-4">
              <ShieldCheck size={20} />
            </div>
            <h4 className="text-[#4a3933] font-bold text-sm mb-1">Compra protegida</h4>
            <p className="text-[#887870] text-xs">Tu información y compra están 100% seguras.</p>
          </div>
          
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left flex-1 min-w-[200px]">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#fdf5f5] text-[#d38b8b] mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
            </div>
            <h4 className="text-[#4a3933] font-bold text-sm mb-1">¿Necesitas ayuda?</h4>
            <p className="text-[#887870] text-xs">Nuestro equipo está listo para ayudarte.</p>
          </div>

        </div>

        {/* Where to find code section */}
        <div className="w-full max-w-5xl bg-white rounded-3xl p-8 sm:p-10 shadow-[0_8px_30px_rgba(211,139,139,0.08)] flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="max-w-md text-center md:text-left">
            <h3 className="text-2xl font-serif text-[#d38b8b] italic font-bold mb-4 flex items-center justify-center md:justify-start gap-2">
              ¿Dónde encuentro mi código? <span className="text-rose/40"><Sparkles size={16} /></span>
            </h3>
            <p className="text-[#887870] text-sm leading-relaxed">
              Tu código de pedido se encuentra en el comprobante que recibiste por WhatsApp o al correo electrónico tras confirmar la compra.
            </p>
          </div>
          
          <div className="flex-shrink-0 relative">
            {/* Visual representation of a ticket/receipt */}
            <div className="bg-[#fdf5f5] border border-[#d38b8b]/20 rounded-2xl p-6 flex flex-col items-center justify-center shadow-inner relative overflow-hidden">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-white rounded-r-full" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-white rounded-l-full" />
              <div className="absolute top-0 bottom-0 right-8 border-r-2 border-dashed border-[#d38b8b]/30" />
              
              <span className="text-[#d38b8b] text-[10px] font-bold uppercase tracking-widest mb-3 relative z-10">Ejemplo</span>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm relative z-10 border border-[#d38b8b]/20">
                <span className="text-[#4a3933] font-mono font-bold text-sm">PED-</span>
                <div className="flex gap-1">
                  {['1','2','3','4','5','6'].map((n) => (
                    <span key={n} className="w-6 h-8 flex items-center justify-center bg-[#fdf5f5] text-[#4a3933] font-mono text-sm border border-[#d38b8b]/30 rounded-md">
                      {n}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            {/* WhatsApp Icon overlapping */}
            <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg text-white border-4 border-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

