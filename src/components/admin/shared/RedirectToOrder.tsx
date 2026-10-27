"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * Las páginas sueltas de cotización y de comprobante repetían el detalle del pedido
 * (ficha, precio y revisión del pago ya están ahí): los enlaces viejos llevan al pedido.
 */
export function RedirectToOrder({ orderId, failed }: { orderId?: string | null; failed?: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (orderId) router.replace(`/admin/pedidos/${orderId}`);
    else if (failed) router.replace('/admin/pedidos');
  }, [orderId, failed, router]);

  return (
    <div className="flex items-center justify-center gap-2 py-24 text-sm text-sage">
      <Loader2 className="h-4 w-4 animate-spin" /> Abriendo el pedido…
    </div>
  );
}
