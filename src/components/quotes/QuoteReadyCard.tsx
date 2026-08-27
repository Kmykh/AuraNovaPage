"use client";

import React, { useState } from 'react';
import { useAcceptQuote } from '@/hooks/use-accept-quote';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/formatters';
import { toast } from 'sonner';
import { Map, PackageCheck, AlertTriangle } from 'lucide-react';
import { ApiProblemDetails } from '@/lib/api-errors';

interface QuoteReadyCardProps {
  orderId: string;
  orderCode: string;
  subtotal: number | null;
  shippingCost: number; // Mapeado del contexto para el propósito de Fase 8
  onAcceptSuccess: () => void;
}

export function QuoteReadyCard({ orderId, orderCode, subtotal, shippingCost, onAcceptSuccess }: QuoteReadyCardProps) {
  const { mutate: acceptQuote, isPending } = useAcceptQuote();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAccept = () => {
    setErrorMsg(null);
    acceptQuote(orderId, {
      onSuccess: () => {
        toast.success('Cotización aceptada', { description: 'Ahora puedes proceder con el pago.' });
        onAcceptSuccess();
      },
      onError: (error) => {
        if (error instanceof ApiProblemDetails) {
          setErrorMsg(error.detail || 'La cotización ya no está disponible para aceptar.');
        } else {
          setErrorMsg('No pudimos conectarnos con Aura Nova. Inténtalo nuevamente.');
        }
      }
    });
  };

  const estimatedTotal = subtotal !== null ? subtotal + shippingCost : null;

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="bg-white rounded-3xl border border-sage/30 shadow-sm overflow-hidden">
        
        {/* Header */}
        <div className="bg-cream/50 px-8 py-6 border-b border-sage/20 flex items-center gap-4">
          <div className="bg-white p-3 rounded-xl border border-sage/10 shadow-sm text-gold">
            <PackageCheck className="w-8 h-8" />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-semibold text-brown">Cotización lista</h2>
            <p className="text-sm text-sage">Pedido <span className="font-medium text-brown">{orderCode}</span></p>
          </div>
        </div>

        {/* Body */}
        <div className="p-8">
          <div className="bg-sage/5 rounded-2xl p-6 border border-sage/10 mb-8">
            <h3 className="text-sm font-medium uppercase tracking-wider text-sage mb-4 flex items-center gap-2">
              <Map className="w-4 h-4" />
              Detalles del envío nacional
            </h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-brown">
                <span>Subtotal (Productos)</span>
                <span className="font-medium">{subtotal !== null ? formatCurrency(subtotal) : '---'}</span>
              </div>
              <div className="flex justify-between text-brown">
                <span>Costo de envío cotizado</span>
                <span className="font-medium">{formatCurrency(shippingCost)}</span>
              </div>
              <div className="border-t border-sage/20 pt-3 mt-2 flex justify-between text-brown text-lg font-bold">
                <span>Total a pagar</span>
                <span>{estimatedTotal !== null ? formatCurrency(estimatedTotal) : '---'}</span>
              </div>
            </div>
            
            <p className="text-xs text-sage mt-4 leading-relaxed">
              * El total mostrado es un estimado basado en la cotización. El monto final confirmado te será proporcionado por el backend al procesar tu pago.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 flex items-start gap-2 text-red-600 bg-red-50 p-4 rounded-xl text-sm border border-red-100" aria-live="polite">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>{errorMsg}</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button 
              size="lg" 
              className="w-full text-base py-6"
              onClick={handleAccept}
              disabled={isPending}
            >
              {isPending ? 'Procesando...' : 'Aceptar cotización y pagar'}
            </Button>
            <p className="text-center text-xs text-sage mt-2">
              Al aceptar, serás redirigido al flujo de pago con Yape.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
