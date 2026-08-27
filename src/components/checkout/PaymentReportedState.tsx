import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, FileSearch } from 'lucide-react';

interface PaymentReportedStateProps {
  orderCode: string;
}

export function PaymentReportedState({ orderCode }: PaymentReportedStateProps) {
  return (
    <div className="max-w-2xl mx-auto py-12 text-center">
      <div className="bg-cream rounded-3xl border border-sage/20 p-8 md:p-12 shadow-sm">
        <div className="inline-flex relative mb-8">
          <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-70"></div>
          <div className="relative bg-green-50 text-green-600 w-20 h-20 flex items-center justify-center rounded-full border border-green-200">
            <CheckCircle2 className="w-10 h-10" />
          </div>
        </div>
        
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-brown mb-4">
          Comprobante enviado
        </h2>
        
        <p className="text-sage text-lg mb-8 max-w-lg mx-auto">
          Hemos recibido tu comprobante de pago. Nuestro equipo lo revisará y confirmará tu pedido a la brevedad.
        </p>

        <div className="bg-white inline-flex flex-col items-center px-8 py-4 rounded-xl border border-sage/10 mb-10">
          <span className="text-xs text-sage uppercase tracking-wider font-medium mb-1">Tu código de pedido</span>
          <span className="text-2xl font-bold text-brown">{orderCode || 'Recibido'}</span>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/productos" tabIndex={-1}>
            <Button variant="outline" className="w-full sm:w-auto">
              Volver al inicio
            </Button>
          </Link>
          
          <Link href="/seguimiento" tabIndex={-1}>
            <Button className="w-full sm:w-auto flex items-center justify-center gap-2">
              <FileSearch className="w-4 h-4" />
              Consultar estado
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
