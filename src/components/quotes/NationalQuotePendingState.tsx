import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Truck, Map, Clock } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

interface NationalQuotePendingStateProps {
  orderCode: string;
  total: number | null;
}

export function NationalQuotePendingState({ orderCode, total }: NationalQuotePendingStateProps) {
  return (
    <div className="max-w-2xl mx-auto py-12 text-center">
      <div className="bg-cream/30 rounded-3xl border border-sage/20 p-8 md:p-12 shadow-sm relative overflow-hidden">
        {/* Background Decals */}
        <div className="absolute -top-10 -right-10 text-sage/5 transform rotate-12">
          <Map className="w-48 h-48" strokeWidth={1} />
        </div>
        
        <div className="relative z-10">
          <div className="inline-flex relative mb-6">
            <div className="absolute inset-0 bg-gold/20 rounded-full animate-ping opacity-50"></div>
            <div className="relative bg-white text-gold w-20 h-20 flex items-center justify-center rounded-full border border-gold/20 shadow-sm">
              <Clock className="w-10 h-10" />
            </div>
          </div>
          
          <h2 className="font-serif text-3xl font-semibold text-brown mb-4">
            Esperando cotización
          </h2>
          
          <p className="text-sage text-lg mb-8 max-w-lg mx-auto leading-relaxed">
            Hemos recibido tu pedido con envío a provincia. Nuestro equipo está 
            calculando el costo de envío exacto para tu destino.
          </p>

          <div className="bg-white inline-flex flex-col items-center px-8 py-4 rounded-xl border border-sage/10 mb-8 shadow-sm">
            <span className="text-xs text-sage uppercase tracking-wider font-medium mb-1">Código de pedido</span>
            <span className="text-2xl font-bold text-brown tracking-widest">{orderCode || 'Recibido'}</span>
            
            {total !== null && (
              <div className="mt-3 pt-3 border-t border-sage/10 w-full">
                <span className="text-xs text-sage uppercase tracking-wider font-medium block mb-1">Subtotal (Productos)</span>
                <span className="text-lg font-medium text-brown">{formatCurrency(total)}</span>
              </div>
            )}
          </div>

          <div className="bg-gold/10 border border-gold/20 rounded-xl p-5 mb-8 text-left text-sm flex gap-3 max-w-md mx-auto">
            <Truck className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
            <p className="text-brown">
              Te informaremos a la brevedad para que puedas revisar el costo total y decidir si deseas continuar con la compra.
            </p>
          </div>

          <div className="flex flex-col justify-center gap-4">
            <Link href="/productos" tabIndex={-1}>
              <Button variant="outline" className="w-full sm:w-auto px-8">
                Volver al catálogo
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
