"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { usePaymentInfo } from '@/hooks/use-payments';
import { AlertTriangle, Info, QrCode, Copy, Check, Sparkles, Smartphone } from 'lucide-react';
import { getImageUrl, formatCurrency } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { isTransientApiError } from '@/lib/api-errors';
import { TransientApiErrorState } from '@/components/shared/TransientApiErrorState';
import { toast } from 'sonner';

interface PaymentInstructionsProps {
  total?: number | null;
  orderCode?: string;
}

export function PaymentInstructions({ total, orderCode }: PaymentInstructionsProps) {
  const { data: info, isLoading, error, refetch } = usePaymentInfo();
  const [copied, setCopied] = useState(false);
  const [isQrExpanded, setIsQrExpanded] = useState(false);

  const handleCopyPhone = () => {
    if (!info?.phoneNumber) return;
    navigator.clipboard.writeText(info.phoneNumber);
    setCopied(true);
    toast.success('Número copiado al portapapeles', { description: info.phoneNumber });
    setTimeout(() => setCopied(false), 2500);
  };

  if (isLoading) {
    return (
      <div className="bg-white/90 backdrop-blur-xl rounded-[2.2rem] border border-[#c8a96b]/25 p-6 shadow-sm">
        <Skeleton variant="text" className="w-1/3 h-6 mb-4" />
        <div className="flex gap-4 items-center mb-4">
          <Skeleton variant="rect" className="w-32 h-32 rounded-2xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" className="w-3/4 h-5" />
            <Skeleton variant="text" className="w-1/2 h-6" />
            <Skeleton variant="text" className="w-2/3 h-4" />
          </div>
        </div>
        <Skeleton variant="rect" className="w-full h-16 rounded-xl" />
      </div>
    );
  }

  if (error) {
    if (isTransientApiError(error)) {
      return (
        <TransientApiErrorState 
          title="La información de pago no está disponible temporalmente"
          message="Nuestros servidores están experimentando una dificultad técnica. Si lo deseas, puedes coordinar o informar tu pago directamente por WhatsApp."
          onRetry={() => refetch()}
          whatsappMessage="Hola Aura Nova. He intentado cargar la página de pago, pero no está disponible. Quisiera coordinar el abono de mi pedido."
        />
      );
    }
    
    return (
      <ErrorState 
        title="No pudimos cargar la información de pago" 
        message="Por favor, intenta nuevamente en unos segundos."
        onRetry={() => refetch()}
      />
    );
  }

  if (!info) return null;

  if (!info.enabled) {
    return (
      <div className="bg-white/90 backdrop-blur-xl rounded-[2.2rem] border border-[#c8a96b]/25 p-6 text-center flex flex-col items-center justify-center min-h-[300px]">
        <AlertTriangle className="w-10 h-10 text-gold mb-3" />
        <h3 className="font-serif text-lg font-bold text-brown mb-1">Pago temporalmente no disponible</h3>
        <p className="text-sage text-sm">Nuestro método de pago está en mantenimiento. Por favor, contáctanos por WhatsApp.</p>
      </div>
    );
  }

  const halfTotal = total ? total * 0.5 : null;

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-[2.2rem] p-5 sm:p-6 shadow-[0_15px_35px_-10px_rgba(200,169,107,0.12)] border border-[#c8a96b]/25 space-y-4">
      {/* Header Compacto */}
      <div className="flex items-center justify-between pb-3 border-b border-[#e8dcdc]/70">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-full bg-[#fcf9f2] text-[#8f6d28] border border-[#c8a96b]/30 flex items-center justify-center font-bold text-xs shadow-2xs">
            1
          </span>
          <div>
            <span className="text-[9px] font-serif uppercase tracking-[0.2em] text-[#c8a96b] font-bold block">
              Método de Pago
            </span>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-[#4a3933] leading-tight">
              Paga con {info.method}
            </h3>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#71a37c] bg-[#eef7f0] border border-[#71a37c]/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#71a37c]" /> Verificado
        </span>
      </div>

      {/* QR + Datos en Fila Compacta */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 items-center bg-[#fdfbf7] p-4 rounded-2xl border border-[#c8a96b]/20">
        {/* QR Thumbnail */}
        <div className="shrink-0 flex flex-col items-center">
          {info.qrImageUrl ? (
            <div 
              className="relative w-32 h-32 sm:w-36 sm:h-36 bg-white p-2 rounded-2xl border border-[#c8a96b]/30 shadow-xs cursor-pointer group hover:shadow-md transition-all"
              onClick={() => setIsQrExpanded(true)}
              title="Clic para ampliar código QR"
            >
              <Image 
                src={getImageUrl(info.qrImageUrl)} 
                alt="QR de Yape"
                fill
                className="object-contain p-1 group-hover:scale-105 transition-transform"
                sizes="150px"
                priority
              />
              <span className="absolute bottom-1 right-1 bg-[#4a3933]/80 text-white text-[8px] px-1.5 py-0.5 rounded-md backdrop-blur-xs font-mono">
                Ampliar
              </span>
            </div>
          ) : (
            <div className="w-32 h-32 sm:w-36 sm:h-36 bg-white rounded-2xl border border-[#c8a96b]/30 flex flex-col items-center justify-center text-[#887870]/40">
              <QrCode className="w-12 h-12 mb-1" strokeWidth={1} />
              <span className="text-[10px] font-medium">QR no disponible</span>
            </div>
          )}
        </div>

        {/* Account Details & Quick Copy */}
        <div className="flex-1 w-full text-center sm:text-left space-y-2">
          <div>
            <span className="text-[10px] text-[#887870] uppercase font-bold tracking-wider block">
              Titular de la cuenta
            </span>
            <p className="font-serif text-base sm:text-lg font-bold text-[#4a3933] leading-snug">
              {info.holderName}
            </p>
            {info.businessName && (
              <p className="text-[11px] text-[#856d56] font-medium">
                Pago a nombre de <strong className="text-[#4a3933]">{info.businessName}</strong>
              </p>
            )}
          </div>

          {info.phoneNumber && (
            <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="font-mono text-xl sm:text-2xl font-bold text-[#c8a96b] tracking-wider">
                {info.phoneNumber}
              </span>
              <button
                type="button"
                onClick={handleCopyPhone}
                className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-white hover:bg-[#fcf9f2] text-[#4a3933] border border-[#c8a96b]/30 px-2.5 py-1 rounded-full shadow-2xs hover:shadow-xs transition-all active:scale-95"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-[#c8a96b]" />}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
          )}

          {/* Opciones de abono 50% o 100% */}
          {total !== null && total !== undefined && (
            <div className="pt-1.5 flex flex-wrap gap-2 text-[11px]">
              {halfTotal !== null && (
                <div className="bg-white/80 border border-[#c8a96b]/30 px-2.5 py-1 rounded-xl shadow-2xs">
                  <span className="text-[#887870]">Adelanto 50%: </span>
                  <strong className="text-[#c8a96b] font-serif">{formatCurrency(halfTotal)}</strong>
                </div>
              )}
              <div className="bg-white/80 border border-[#c8a96b]/30 px-2.5 py-1 rounded-xl shadow-2xs">
                <span className="text-[#887870]">Total 100%: </span>
                <strong className="text-[#4a3933] font-serif">{formatCurrency(total)}</strong>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pasos Rápidos en Píldoras Compactas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center text-[10px] text-[#887870]">
        <div className="bg-[#faf7f2] p-2 rounded-xl border border-black/5 font-medium">
          <strong className="text-[#4a3933] block text-[11px]">1. Abre tu Yape</strong>
          Escanea el QR o envía al número
        </div>
        <div className="bg-[#faf7f2] p-2 rounded-xl border border-black/5 font-medium">
          <strong className="text-[#4a3933] block text-[11px]">2. Abona 50% o 100%</strong>
          Guarda la captura del comprobante
        </div>
        <div className="bg-[#faf7f2] p-2 rounded-xl border border-black/5 font-medium">
          <strong className="text-[#4a3933] block text-[11px]">3. Sube la captura</strong>
          Adjúntala en el panel adjunto
        </div>
      </div>

      {/* Modal para ampliar QR si el usuario hace clic */}
      {isQrExpanded && info.qrImageUrl && (
        <div 
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsQrExpanded(false)}
        >
          <div className="bg-white p-6 rounded-[2.5rem] max-w-sm w-full text-center relative space-y-3 shadow-2xl">
            <h4 className="font-serif text-xl font-bold text-[#4a3933]">Código QR {info.method}</h4>
            <div className="relative w-64 h-64 mx-auto rounded-2xl overflow-hidden border border-[#c8a96b]/25 bg-[#faf7f2]">
              <Image 
                src={getImageUrl(info.qrImageUrl)} 
                alt="QR de Yape Ampliado"
                fill
                className="object-contain p-3"
              />
            </div>
            <p className="text-xs text-[#887870]">
              {info.holderName} • <strong className="font-mono text-[#c8a96b]">{info.phoneNumber}</strong>
            </p>
            <button 
              type="button"
              onClick={() => setIsQrExpanded(false)}
              className="px-6 py-2 rounded-full bg-[#4a3933] text-white text-xs font-bold uppercase tracking-wider"
            >
              Cerrar vista
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

