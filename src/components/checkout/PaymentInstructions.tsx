"use client";

import React from 'react';
import Image from 'next/image';
import { usePaymentInfo } from '@/hooks/use-payments';
import { AlertTriangle, Info, QrCode, Lightbulb } from 'lucide-react';
import { getImageUrl } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { isTransientApiError } from '@/lib/api-errors';
import { TransientApiErrorState } from '@/components/shared/TransientApiErrorState';

export function PaymentInstructions() {
  const { data: info, isLoading, error, refetch } = usePaymentInfo();

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-sage/20 p-8">
        <Skeleton variant="text" className="w-1/2 h-8 mb-8" />
        <div className="flex justify-center mb-8">
          <Skeleton variant="rect" className="w-48 h-48 rounded-2xl" />
        </div>
        <Skeleton variant="text" className="w-full h-4 mb-2" />
        <Skeleton variant="text" className="w-3/4 h-4 mb-6" />
        <Skeleton variant="rect" className="w-full h-24 rounded-lg" />
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
      <div className="bg-white rounded-xl border border-sage/20 p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
        <AlertTriangle className="w-12 h-12 text-gold mb-4" />
        <h3 className="font-serif text-xl text-brown mb-2">Pago temporalmente no disponible</h3>
        <p className="text-sage">Nuestro método de pago está deshabilitado por el momento. Por favor, intenta más tarde.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="font-serif text-3xl font-bold text-[#d38b8b] italic mb-8 text-center md:text-left">Instrucciones de pago</h2>
      
      <div className="flex flex-col gap-10 items-center">
        {/* Información del Yape */}
        <div className="flex flex-col items-center justify-center w-full">
          {info.qrImageUrl ? (
            <div className="bg-[#faf7f2] p-6 rounded-[2rem] border-2 border-[#d38b8b]/10 mb-8 w-full max-w-[320px] aspect-square relative shadow-inner flex-shrink-0">
              <Image 
                src={getImageUrl(info.qrImageUrl)} 
                alt="QR de Yape"
                fill
                className="object-contain p-4 mix-blend-multiply"
                sizes="(max-width: 768px) 100vw, 400px"
                priority
              />
            </div>
          ) : (
            <div className="bg-[#faf7f2] w-full max-w-[320px] aspect-square rounded-[2rem] border-2 border-[#d38b8b]/10 mb-8 flex flex-col items-center justify-center text-[#887870]/40 shadow-inner">
              <QrCode className="w-24 h-24 mb-4" strokeWidth={1} />
              <span className="text-lg font-bold">QR no disponible</span>
            </div>
          )}

          <div className="text-center bg-[#fdf5f5] w-full max-w-[360px] py-8 px-6 rounded-[2.5rem] border border-[#d38b8b]/20 shadow-sm">
            <p className="text-sm text-[#d38b8b] font-bold uppercase tracking-[0.3em] mb-2">{info.method}</p>
            <p className="text-2xl md:text-3xl font-bold text-[#4a3933]">{info.holderName}</p>
            {info.phoneNumber && (
              <p className="text-3xl md:text-4xl text-[#c8a96b] font-bold mt-2 tracking-widest font-mono drop-shadow-sm">{info.phoneNumber}</p>
            )}
            {info.businessName && (
              <p className="text-sm text-[#887870] font-medium mt-4 bg-white/50 py-2 rounded-xl inline-block px-4">
                Pago a nombre de <strong className="text-[#4a3933]">{info.businessName}</strong>
              </p>
            )}
          </div>
        </div>

        {/* Instrucciones Paso a Paso */}
        <div className="w-full space-y-6">
          <div className="bg-[#fdf5f5] p-5 rounded-2xl border border-[#d38b8b]/30 flex items-start sm:items-center gap-4 text-left shadow-sm max-w-md mx-auto md:mx-0">
            <div className="bg-white p-3 rounded-full text-[#d38b8b] shadow-sm flex-shrink-0">
              <Lightbulb size={24} strokeWidth={2.5} />
            </div>
            <p className="text-[#887870] font-medium text-sm leading-relaxed">
              <strong className="text-[#d38b8b] block mb-1">Pagos flexibles</strong>
              Recuerda que puedes abonar el <strong className="text-[#4a3933]">50% como adelanto</strong> para confirmar tu pedido, o el 100% del total.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-[#4a3933] text-xl mb-4 text-center md:text-left">¿Cómo pagar?</h3>
            <ol className="list-decimal pl-5 space-y-3 text-base text-[#887870] font-medium leading-relaxed marker:text-[#c8a96b] marker:font-bold max-w-md mx-auto md:mx-0">
              <li>Abre tu aplicación de <strong>{info.method}</strong>.</li>
              <li>Escanea el código QR que aparece arriba {info.phoneNumber && 'o utiliza el número indicado'}.</li>
              <li>Realiza el abono (el 50% o el total).</li>
              <li>Guarda una captura de pantalla del comprobante exitoso.</li>
              <li>Sube la evidencia en el formulario adjunto.</li>
            </ol>
          </div>

          <div className="mt-8 bg-[#faf7f2] p-6 rounded-2xl flex items-start gap-4 border-l-4 border-[#c8a96b] max-w-md mx-auto md:mx-0">
            <Info className="w-6 h-6 text-[#c8a96b] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[#887870] font-medium leading-relaxed">
              Revisaremos tu comprobante a la brevedad. Tu pedido comenzará a prepararse únicamente después de que el pago sea confirmado por nuestro equipo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
