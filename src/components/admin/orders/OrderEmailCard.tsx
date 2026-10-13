"use client";

import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import { toast } from 'sonner';
import { AdminOrderDetailResponse } from '@/types/orders';
import { OrderStatus } from '@/types/enums';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

/** Vista previa y reenvío del correo de confirmación al cliente. */
export function OrderEmailCard({ order }: { order: AdminOrderDetailResponse }) {
  const [isOpen, setIsOpen] = useState(false);
  const [html, setHtml] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const payload = (preview: boolean) => JSON.stringify({
    order,
    customer: order.customer,
    items: order.items || [],
    subtotal: order.subtotal || 0,
    deliveryType: order.deliveryType,
    estimatedDeliveryCost: order.deliveryCost || 0,
    emailType: order.isCustomOrder || order.status === OrderStatus.WaitingQuote ? 'quote_received' : 'receipt',
    preview,
  });

  const openPreview = async () => {
    setIsGenerating(true);
    setHtml(null);
    setIsOpen(true);
    try {
      const res = await fetch('/api/send-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload(true) });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.html) setHtml(data.html);
      else toast.error('No se pudo generar la vista previa.');
    } catch {
      toast.error('Error de conexión al generar la vista previa.');
    } finally {
      setIsGenerating(false);
    }
  };

  const send = async () => {
    if (!order.customer?.email) {
      toast.error('El cliente no tiene correo registrado.');
      return;
    }
    setIsSending(true);
    try {
      const res = await fetch('/api/send-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload(false) });
      if (res.ok) {
        toast.success('Correo enviado.');
        setIsOpen(false);
      } else {
        toast.error('Hubo un error al enviar el correo.');
      }
    } catch {
      toast.error('Error de red al enviar el correo.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <Button
        onClick={openPreview}
        variant="outline"
        disabled={!order.customer?.email}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-brown/30 text-brown hover:bg-brown/5"
        title={order.customer?.email ? undefined : 'El cliente no dejó correo'}
      >
        <Mail className="h-4 w-4" /> Reenviar correo
      </Button>

      <Modal isOpen={isOpen} onClose={() => !isSending && setIsOpen(false)} title="Reenviar correo">
        <div className="space-y-4">
          <div className="rounded-lg border border-[#c8a96b]/20 bg-[#fcf9f2] p-3 text-xs text-brown">
            <p><strong>Para:</strong> {order.customer?.email}</p>
            <p><strong>Asunto:</strong> Pedido {order.orderCode} — Aura Nova</p>
          </div>
          <div className="relative flex h-[400px] items-center justify-center overflow-hidden rounded-xl border border-sage/20 bg-white">
            {isGenerating ? (
              <div className="flex flex-col items-center text-sage">
                <div className="mb-3 h-8 w-8 animate-spin rounded-full border-4 border-sage/20 border-t-gold" />
                <p className="text-sm font-medium">Generando vista previa…</p>
              </div>
            ) : html ? (
              <iframe srcDoc={html} className="h-full w-full border-none" title="Vista previa del correo" sandbox="" />
            ) : (
              <p className="text-sm text-sage">No se pudo cargar la vista previa.</p>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isSending}>Cancelar</Button>
            <Button onClick={send} disabled={isGenerating || isSending || !html} className="bg-gold text-white hover:bg-gold/90">
              <Mail className="mr-2 h-4 w-4" /> {isSending ? 'Enviando…' : 'Enviar ahora'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
