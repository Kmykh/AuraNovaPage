"use client";

import React, { useState } from 'react';
import {
  Calendar, Play, CheckCircle2, Truck, Send, Copy, MessageCircle, ZoomIn, X, Check, Hourglass, Store, PartyPopper, Ban,
} from 'lucide-react';
import { toast } from 'sonner';
import { OrderStatus, DeliveryType } from '@/types/enums';
import { AdminOrderDetailResponse } from '@/types/orders';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  useStartPreparation, useSetEstimatedReadyDate, useMarkAsReady, useDeliverToAgency, useChangeOrderStatus,
} from '@/hooks/use-admin-orders';
import { useUpdateQuote } from '@/hooks/use-admin-quotes';
import { formatCurrency, getImageUrl } from '@/lib/formatters';
import { formatDate } from '@/lib/order-helpers';
import { ApiProblemDetails } from '@/lib/api-errors';
import { SITE_URL } from '@/lib/site';

interface OrderActionsProps {
  order: AdminOrderDetailResponse;
  onReviewPayment: () => void;
  onRejectPayment: () => void;
}

export function whatsappLink(phone: string | undefined, text: string) {
  const digits = (phone ?? '').replace(/\D/g, '');
  const number = digits.length === 9 ? `51${digits}` : digits;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

const primaryButton = 'flex items-center gap-2 rounded-full bg-[#4a3933] text-white hover:bg-[#3a2d28]';
const successButton = 'flex items-center gap-2 rounded-full bg-[#71a37c] text-white hover:bg-[#588562]';

/** Tarjeta "Siguiente paso": lo que toca hacer ahora con el pedido y el botón para hacerlo. */
export function OrderActions({ order, onReviewPayment, onRejectPayment }: OrderActionsProps) {
  const [isEstimatedDateModalOpen, setIsEstimatedDateModalOpen] = useState(false);
  const [isDeliverAgencyModalOpen, setIsDeliverAgencyModalOpen] = useState(false);
  const [estimatedDate, setEstimatedDate] = useState('');
  // La agencia que eligió el cliente al comprar viene marcada
  const [agencyData, setAgencyData] = useState<{ provider: string; trackingCode: string; proofFile: File | null }>({
    provider: order.delivery?.preferredAgency ?? '', trackingCode: '', proofFile: null,
  });

  // Cotización: parte del precio ya guardado (cuando es una corrección)
  const [quotePrice, setQuotePrice] = useState<string>(order.customizationCost ? String(order.customizationCost) : '');
  const [quoteNotes, setQuoteNotes] = useState<string>(order.quote?.notes ?? '');

  const { mutate: startPreparation, isPending: isStartingPrep } = useStartPreparation(order.id);
  const { mutate: setEstimated, isPending: isSettingEstimated } = useSetEstimatedReadyDate(order.id);
  const { mutate: markReady, isPending: isMarkingReady } = useMarkAsReady(order.id);
  const { mutate: deliverAgency, isPending: isDeliveringAgency } = useDeliverToAgency(order.id);
  const { mutate: changeStatus, isPending: isChangingStatus } = useChangeOrderStatus(order.id);
  const { mutate: updateQuote, isPending: isQuoting } = useUpdateQuote(order.quote?.quoteId ?? '', order.id);

  const status = order.status;
  const isNational = order.deliveryType === DeliveryType.NationalShipping;
  const deliveryCost = order.deliveryCost ?? 0;
  const priceValue = parseFloat(quotePrice || '0');
  const safePrice = isNaN(priceValue) ? 0 : priceValue;
  const quoteTotal = order.subtotal + deliveryCost + safePrice;
  const paymentLink = `${SITE_URL}/pago/${order.id}`;
  const firstName = order.customer?.name?.split(' ')[0] ?? '';

  const handleQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!order.quote?.quoteId) {
      toast.error('Este pedido no tiene una cotización asociada.');
      return;
    }
    if (!(quoteTotal > 0)) {
      toast.error('Ingresa el precio del pedido.');
      return;
    }
    updateQuote(
      { shippingCost: deliveryCost, customizationCost: safePrice, notes: quoteNotes.trim() || undefined },
      {
        onError: (error) => {
          toast.error(error instanceof ApiProblemDetails && error.detail ? error.detail : 'No se pudo enviar la cotización.');
        },
      },
    );
  };

  const copyPaymentLink = async () => {
    try {
      await navigator.clipboard.writeText(paymentLink);
      toast.success('Enlace de pago copiado.');
    } catch {
      toast.info(paymentLink);
    }
  };

  const handleSetEstimatedDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!estimatedDate) return;
    setEstimated({ estimatedDate: new Date(estimatedDate).toISOString() }, {
      onSuccess: () => setIsEstimatedDateModalOpen(false),
    });
  };

  const handleDeliverAgency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agencyData.provider || !agencyData.trackingCode) {
      toast.error('Agencia y código de seguimiento son obligatorios.');
      return;
    }
    deliverAgency(agencyData, { onSuccess: () => setIsDeliverAgencyModalOpen(false) });
  };

  let title = 'Siguiente paso';
  let body: React.ReactNode = null;

  if (status === OrderStatus.WaitingQuote || status === OrderStatus.QuoteReady) {
    const isRequote = status === OrderStatus.QuoteReady;
    title = isRequote ? 'Cotización enviada' : 'Pon el precio y envía la cotización';
    body = (
      <form onSubmit={handleQuote} className="space-y-4">
        {isRequote && (
          <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
            El cliente aún no la acepta. Puedes corregir el precio o, si ya te confirmó por WhatsApp, pasar el pedido a pago.
          </p>
        )}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="quote-price" className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-sage">
              {order.isCustomOrder ? 'Precio del diseño' : 'Personalización extra'}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-brown">S/</span>
              <input
                id="quote-price"
                type="number"
                min="0"
                step="0.10"
                value={quotePrice}
                onChange={e => setQuotePrice(e.target.value)}
                className="w-full rounded-xl border border-sage/20 bg-[#FAF9F6] py-2.5 pl-9 pr-3 text-lg font-bold text-brown outline-none focus:border-gold focus:bg-white"
                placeholder="0.00"
                required={order.isCustomOrder}
              />
            </div>
          </div>
          <div className="rounded-xl bg-[#faf7f2] p-3 text-sm">
            {order.subtotal > 0 && (
              <div className="flex justify-between text-sage"><span>Productos</span><span>{formatCurrency(order.subtotal)}</span></div>
            )}
            <div className="flex justify-between text-sage">
              <span>Entrega</span>
              <span>{isNational && !order.deliveryCost ? 'Paga en destino' : formatCurrency(deliveryCost)}</span>
            </div>
            <div className="mt-1 flex justify-between border-t border-sage/15 pt-1 font-bold text-brown">
              <span>Total a cobrar</span><span>{formatCurrency(quoteTotal)}</span>
            </div>
          </div>
        </div>
        <div>
          <label htmlFor="quote-notes" className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-sage">Nota para el cliente (opcional)</label>
          <textarea
            id="quote-notes"
            rows={2}
            maxLength={2000}
            value={quoteNotes}
            onChange={e => setQuoteNotes(e.target.value)}
            className="w-full resize-none rounded-xl border border-sage/20 bg-[#FAF9F6] px-3 py-2 text-sm text-brown outline-none focus:border-gold focus:bg-white"
            placeholder="Ej. Incluye caja de lujo y 12 rosas eternas. Listo en 3 días."
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={isQuoting} className="flex items-center gap-2 rounded-full bg-[#c8a96b] px-5 text-white hover:bg-[#b09355]">
            <Send className="h-4 w-4" /> {isQuoting ? 'Enviando…' : isRequote ? 'Actualizar precio' : 'Enviar cotización'}
          </Button>
          {isRequote && (
            <Button
              type="button"
              variant="outline"
              disabled={isChangingStatus}
              onClick={() => changeStatus({ status: OrderStatus.WaitingPayment, comment: 'Cotización aceptada (confirmada por el equipo).' })}
              className="rounded-full"
            >
              Aceptó por WhatsApp → pasar a pago
            </Button>
          )}
        </div>
      </form>
    );
  } else if (status === OrderStatus.WaitingPayment) {
    title = 'Esperando el pago';
    body = (
      <div className="space-y-3">
        <p className="flex items-center gap-2 text-sm text-brown">
          <Hourglass className="h-4 w-4 shrink-0 text-amber-600" />
          <span>El cliente debe pagar <strong>{formatCurrency(order.total)}</strong> (o el 50% de adelanto) con tarjeta o Yape desde su enlace de pago.</span>
        </p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={copyPaymentLink} className="flex items-center gap-2 rounded-full text-xs">
            <Copy className="h-3.5 w-3.5" /> Copiar enlace de pago
          </Button>
          {order.customer?.phone && (
            <a
              href={whatsappLink(order.customer.phone, `Hola ${firstName} 🌸 Tu pedido ${order.orderCode} está listo para pago (${formatCurrency(order.total)}). Puedes pagar con tarjeta o Yape (50% o total) aquí: ${paymentLink}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-xs font-bold text-white hover:bg-[#1ebe5b]"
            >
              <MessageCircle className="h-3.5 w-3.5" /> Recordar por WhatsApp
            </a>
          )}
        </div>
      </div>
    );
  } else if (status === OrderStatus.PaymentReported) {
    title = 'Revisa el comprobante';
    const evidence = order.payment?.evidenceUrl;
    body = (
      <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-[170px_1fr]">
        {evidence ? (
          <button
            type="button"
            onClick={onReviewPayment}
            className="group relative h-52 overflow-hidden rounded-2xl border border-[#c8a96b]/30 bg-stone-50"
            title="Ampliar comprobante"
          >
            {/* URL firmada y temporal: se muestra tal cual */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={getImageUrl(evidence)} alt="Comprobante" className="h-full w-full object-contain p-1.5 transition group-hover:scale-105" />
            <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-brown shadow">
              <ZoomIn className="h-3 w-3" /> Ampliar
            </span>
          </button>
        ) : (
          <div className="flex h-52 items-center justify-center rounded-2xl bg-stone-50 text-xs text-sage">Sin imagen</div>
        )}
        <div className="space-y-3">
          <dl className="space-y-1.5 rounded-xl bg-[#faf7f2] p-3 text-sm">
            <div className="flex justify-between"><dt className="text-sage">Debe pagar</dt><dd className="font-bold text-brown">{formatCurrency(order.total)}</dd></div>
            {order.total != null && (
              <div className="flex justify-between"><dt className="text-sage">Adelanto 50%</dt><dd className="text-brown">{formatCurrency(order.total * 0.5)}</dd></div>
            )}
            {order.payment?.createdAt && (
              <div className="flex justify-between"><dt className="text-sage">Pago generado</dt><dd className="text-brown">{formatDate(order.payment.createdAt)}</dd></div>
            )}
          </dl>
          <p className="text-xs text-sage">Compara en tu Yape el monto, la fecha y el nombre antes de confirmar.</p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={onReviewPayment} className={successButton}>
              <Check className="h-4 w-4" /> Confirmar pago
            </Button>
            <Button onClick={onRejectPayment} variant="outline" className="flex items-center gap-1.5 rounded-full border-red-200 text-red-500 hover:bg-red-50">
              <X className="h-4 w-4" /> Rechazar
            </Button>
          </div>
        </div>
      </div>
    );
  } else if (status === OrderStatus.PaymentConfirmed) {
    title = 'Pago confirmado: a preparar';
    body = (
      <Button onClick={() => startPreparation()} disabled={isStartingPrep} className={primaryButton}>
        <Play className="h-4 w-4" /> {isStartingPrep ? 'Iniciando…' : 'Empezar a preparar'}
      </Button>
    );
  } else if (status === OrderStatus.Preparing) {
    title = 'En el taller';
    body = (
      <div className="space-y-3">
        {order.estimatedReadyAt && (
          <p className="text-sm text-sage">Fecha estimada: <strong className="text-brown">{formatDate(order.estimatedReadyAt)}</strong></p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => markReady()} disabled={isMarkingReady} className={successButton}>
            <CheckCircle2 className="h-4 w-4" /> {isMarkingReady ? 'Actualizando…' : 'Marcar como listo'}
          </Button>
          <Button onClick={() => setIsEstimatedDateModalOpen(true)} variant="outline" className="flex items-center gap-2 rounded-full">
            <Calendar className="h-4 w-4" /> {order.estimatedReadyAt ? 'Cambiar fecha estimada' : 'Fijar fecha estimada'}
          </Button>
        </div>
      </div>
    );
  } else if (status === OrderStatus.Ready && (order.payment?.balanceDue ?? 0) > 0 && (order.payment?.amountPaid ?? 0) > 0) {
    // Regla del negocio: con solo el adelanto, el pedido no sale hasta que pague el saldo
    title = 'Listo, esperando el saldo';
    body = (
      <p className="flex items-start gap-2 rounded-xl bg-[#faf7f2] p-3 text-sm text-brown">
        <Hourglass className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <span>
          La entrega se habilita cuando el cliente pague el saldo de <strong>{formatCurrency(order.payment?.balanceDue)}</strong>.
          Ya le avisamos que su pedido está listo; puedes recordárselo con el botón de arriba.
        </span>
      </p>
    );
  } else if (status === OrderStatus.Ready) {
    title = 'Listo para entregar';
    body = isNational ? (
      <Button onClick={() => setIsDeliverAgencyModalOpen(true)} className={primaryButton}>
        <Truck className="h-4 w-4" /> Registrar entrega a la agencia
      </Button>
    ) : order.deliveryType === DeliveryType.Delivery ? (
      <Button onClick={() => changeStatus({ status: OrderStatus.Shipped })} disabled={isChangingStatus} className={primaryButton}>
        <Truck className="h-4 w-4" /> {isChangingStatus ? 'Actualizando…' : 'Salió a reparto'}
      </Button>
    ) : (
      <Button onClick={() => changeStatus({ status: OrderStatus.Delivered })} disabled={isChangingStatus} className={primaryButton}>
        <Store className="h-4 w-4" /> {isChangingStatus ? 'Actualizando…' : 'Entregado en el punto'}
      </Button>
    );
  } else if (status === OrderStatus.Shipped || status === OrderStatus.DeliveredToAgency) {
    title = status === OrderStatus.Shipped ? 'En camino' : 'En la agencia';
    body = (
      <Button onClick={() => changeStatus({ status: OrderStatus.Delivered })} disabled={isChangingStatus} className={successButton}>
        <CheckCircle2 className="h-4 w-4" /> {isChangingStatus ? 'Actualizando…' : status === OrderStatus.Shipped ? 'Marcar entregado' : 'El cliente lo recibió'}
      </Button>
    );
  } else if (status === OrderStatus.Delivered) {
    title = 'Pedido entregado';
    body = <p className="flex items-center gap-2 text-sm text-emerald-700"><PartyPopper className="h-4 w-4" /> Todo listo. ¡Buen trabajo!</p>;
  } else if (status === OrderStatus.Cancelled) {
    title = 'Pedido cancelado';
    body = <p className="flex items-center gap-2 text-sm text-stone-500"><Ban className="h-4 w-4" /> No requiere más acciones.</p>;
  }

  // Pagó solo el adelanto: hay que cobrar el saldo antes de entregar
  const balanceDue = order.payment?.balanceDue ?? 0;
  const showBalance = balanceDue > 0 && (order.payment?.amountPaid ?? 0) > 0 && status !== OrderStatus.Cancelled;
  const balanceNotice = showBalance ? (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
      <span>Pagó el adelanto. <strong>Saldo pendiente: {formatCurrency(balanceDue)}</strong> — cóbralo antes de entregar.</span>
      <span className="flex gap-2">
        <Button type="button" variant="outline" onClick={copyPaymentLink} className="flex h-8 items-center gap-1.5 rounded-full bg-white text-xs">
          <Copy className="h-3.5 w-3.5" /> Enlace de pago
        </Button>
        {order.customer?.phone && (
          <a
            href={whatsappLink(order.customer.phone, `Hola ${firstName} 🌸 Te falta pagar ${formatCurrency(balanceDue)} de tu pedido ${order.orderCode}. Puedes pagarlo con tarjeta o Yape aquí: ${paymentLink}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-[#25D366] px-3 text-xs font-bold text-white hover:bg-[#1ebe5b]"
          >
            <MessageCircle className="h-3.5 w-3.5" /> Recordar
          </a>
        )}
      </span>
    </div>
  ) : null;

  return (
    <section className="rounded-[24px] border-2 border-[#c8a96b]/40 bg-gradient-to-br from-white to-[#fffaf0] p-5 shadow-sm sm:p-6">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b08a4e]">Siguiente paso</p>
      <h2 className="mb-4 mt-0.5 font-serif text-xl font-bold text-brown">{title}</h2>
      {balanceNotice}
      {body}

      <Modal isOpen={isEstimatedDateModalOpen} onClose={() => setIsEstimatedDateModalOpen(false)} title="Fecha estimada">
        <form onSubmit={handleSetEstimatedDate} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-sage" htmlFor="estimated-date">Fecha y hora</label>
            <input
              id="estimated-date"
              type="datetime-local"
              required
              value={estimatedDate}
              onChange={(e) => setEstimatedDate(e.target.value)}
              className="w-full rounded-xl border border-sage/20 px-4 py-2 outline-none focus:border-gold"
            />
            <p className="mt-2 text-xs text-sage">El cliente la verá en su seguimiento.</p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsEstimatedDateModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={isSettingEstimated}>Guardar fecha</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isDeliverAgencyModalOpen} onClose={() => setIsDeliverAgencyModalOpen(false)} title="Entrega a la agencia">
        <form onSubmit={handleDeliverAgency} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-sage" htmlFor="agency-provider">Agencia</label>
            <select
              id="agency-provider"
              required
              value={agencyData.provider}
              onChange={(e) => setAgencyData({ ...agencyData, provider: e.target.value })}
              className="w-full rounded-xl border border-sage/20 bg-white px-4 py-2 outline-none focus:border-gold"
            >
              <option value="">Selecciona una agencia</option>
              <option value="Olva">Olva</option>
              <option value="Shalom">Shalom</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-sage" htmlFor="agency-code">Código de seguimiento de la agencia</label>
            <input
              id="agency-code"
              type="text"
              required
              placeholder="Ej. 123456789"
              value={agencyData.trackingCode}
              onChange={(e) => setAgencyData({ ...agencyData, trackingCode: e.target.value })}
              className="w-full rounded-xl border border-sage/20 px-4 py-2 outline-none focus:border-gold"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-sage" htmlFor="agency-proof">Foto de la constancia (opcional)</label>
            <input
              id="agency-proof"
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setAgencyData({ ...agencyData, proofFile: e.target.files?.[0] ?? null })}
              className="w-full rounded-xl border border-sage/20 px-4 py-2 outline-none focus:border-gold"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsDeliverAgencyModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={isDeliveringAgency}>{isDeliveringAgency ? 'Guardando…' : 'Registrar entrega'}</Button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
