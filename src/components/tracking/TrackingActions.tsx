"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PublicTrackingResponse } from '@/types/tracking';
import { OrderStatus } from '@/types/checkout';
import { Button } from '@/components/ui/Button';
import { Link2, CreditCard, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface TrackingActionsProps {
  trackingToken: string;
  tracking: PublicTrackingResponse;
}

export function TrackingActions({ trackingToken, tracking }: TrackingActionsProps) {
  const router = useRouter();
  
  // Buscar contexto en sessionStorage sincrónicamente (sólo primer renderizado seguro en Nextjs client)
  const [orderId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const rawContext = sessionStorage.getItem('tempPaymentContext');
        if (rawContext) {
          const context = JSON.parse(rawContext);
          if (context.orderCode === tracking.orderCode && context.orderId) {
            return context.orderId;
          }
        }
      } catch {
        // Ignorar
      }
    }
    return null;
  });

  const handleShare = async () => {
    const url = `${window.location.origin}/seguimiento?code=${tracking.orderCode}&token=${trackingToken}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Seguimiento de mi pedido en Aura Nova',
          text: `Revisa el estado de mi pedido ${tracking.orderCode}`,
          url
        });
        return;
      } catch {
        // Fallback a clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      toast.success('Enlace copiado', { description: 'Puedes pegarlo para compartirlo con quien quieras.' });
    } catch {
      toast.error('No se pudo copiar el enlace');
    }
  };

  const handlePaymentNavigation = () => {
    if (orderId) {
      router.push(`/pago/${orderId}`);
    } else {
      // Si el orderId se perdió (cerró navegador), indicarle que debe ir por su enlace original
      toast.info('Contexto perdido', {
        description: 'Para proteger tu seguridad, debes continuar el pago desde el enlace enviado a tu WhatsApp o correo al crear el pedido.'
      });
    }
  };

  return (
    <div className="flex flex-col gap-4 mt-6">
      {/* Cotización Lista -> Aceptar */}
      {tracking.status === OrderStatus.QuoteReady && (
        <Button 
          className="w-full h-14 rounded-full bg-[#c8a96b] hover:bg-[#b89759] text-white font-bold tracking-wider shadow-xl shadow-[#c8a96b]/20 transition-all hover:-translate-y-1"
          onClick={handlePaymentNavigation}
        >
          {orderId ? "Aceptar cotización y continuar" : "Ir al flujo de cotización"}
        </Button>
      )}

      {/* Pendiente de Pago -> Yape */}
      {tracking.status === OrderStatus.WaitingPayment && (
        <Button 
          className="w-full h-14 rounded-full bg-[#c8a96b] hover:bg-[#b89759] text-white font-bold tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-[#c8a96b]/20 transition-all hover:-translate-y-1"
          onClick={handlePaymentNavigation}
        >
          <CreditCard className="w-5 h-5" />
          Continuar con el pago
        </Button>
      )}

      <Button 
        variant="outline" 
        className="w-full h-14 rounded-full border-2 border-[#c8a96b]/30 text-[#c8a96b] font-bold tracking-wider hover:bg-[#c8a96b]/10 hover:border-[#c8a96b] transition-all flex items-center justify-center gap-2 shadow-sm"
        onClick={handleShare}
      >
        <Link2 className="w-5 h-5" />
        Copiar enlace de seguimiento
      </Button>
      
      {/* Mensaje de ayuda si el tracking se abrió huérfano y requiere acciones */}
      {!orderId && (tracking.status === OrderStatus.WaitingPayment || tracking.status === OrderStatus.QuoteReady) && (
        <p className="text-xs text-sage mt-2 text-center flex items-start gap-1">
          <ExternalLink className="w-3 h-3 flex-shrink-0 mt-0.5" />
          <span>No puedes realizar acciones desde esta vista pública por seguridad. Usa el enlace oficial de tu pedido.</span>
        </p>
      )}
    </div>
  );
}
