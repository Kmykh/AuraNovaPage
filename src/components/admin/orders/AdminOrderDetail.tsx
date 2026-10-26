"use client";

import React from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  AlertCircle, ArrowLeft, User, Truck, Package, ExternalLink, Phone, MessageCircle, Mail, MapPin, Sparkles, Download, CreditCard,
} from 'lucide-react';
import { useAdminOrder } from '@/hooks/use-admin-orders';
import { useConfirmPayment, useRejectPayment } from '@/hooks/use-admin-payments';
import { getOrderStatusInfo, getDeliveryTypeLabel, formatDate, nextAdminAction } from '@/lib/order-helpers';
import { formatCurrency, getImageUrl } from '@/lib/formatters';
import { statusName, deliveryTypeName } from '@/lib/tracking-progress';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { ApiProblemDetails } from '@/lib/api-errors';
import { DeliveryType } from '@/types/enums';

import { OrderStatusChangeForm } from './OrderStatusChangeForm';
import { OrderStatusHistory } from './OrderStatusHistory';
import { OrderNotifications } from './OrderNotifications';
import { OrderTimeline } from './OrderTimeline';
import { OrderActions, whatsappLink } from './OrderActions';
import { OrderEmailCard } from './OrderEmailCard';
import { ConfirmPaymentModal, RejectPaymentModal } from './PaymentReviewModals';
import { WorkshopPreparationCard } from './WorkshopPreparationCard';
import { OrderPaymentsCard } from './OrderPaymentsCard';

const STATUS_BADGE: Record<string, string> = {
  gold: 'bg-amber-50 text-amber-700 border-amber-200',
  rose: 'bg-rose-50 text-rose-600 border-rose-200',
  sage: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  brown: 'bg-stone-100 text-stone-700 border-stone-200',
};

const cardClass = 'rounded-[24px] border border-sage/10 bg-white p-5 shadow-sm sm:p-6';

export function AdminOrderDetail({ id }: { id: string }) {
  const { data: order, isLoading, error, refetch } = useAdminOrder(id);
  const confirmPaymentMutation = useConfirmPayment(order?.payment?.id || '', id);
  const rejectPaymentMutation = useRejectPayment(order?.payment?.id || '', id);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = React.useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = React.useState(false);

  // El backend ya pasa el pedido a "Pago confirmado" al confirmar el pago
  const handleConfirmPayment = () => {
    confirmPaymentMutation.mutate(undefined, {
      onSuccess: () => {
        setIsConfirmModalOpen(false);
        toast.success('Pago confirmado');
        refetch();
      },
      onError: () => toast.error('No se pudo confirmar el pago.'),
    });
  };

  const handleRejectPayment = (reason: string) => {
    rejectPaymentMutation.mutate({ notes: reason || 'Comprobante inválido' }, {
      onSuccess: () => {
        setIsRejectModalOpen(false);
        toast.success('Comprobante rechazado. El cliente puede subir otro.');
        refetch();
      },
      onError: () => toast.error('No se pudo rechazar el comprobante.'),
    });
  };

  const handleDownloadEvidence = async (url: string) => {
    try {
      const res = await fetch(getImageUrl(url), { mode: 'cors' });
      const blobUrl = URL.createObjectURL(await res.blob());
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `Comprobante_${order?.orderCode || 'pago'}.webp`;
      link.click();
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(getImageUrl(url), '_blank', 'noopener,noreferrer');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="rect" className="h-24 w-full rounded-2xl" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Skeleton variant="rect" className="h-48 w-full rounded-2xl" />
            <Skeleton variant="rect" className="h-64 w-full rounded-2xl" />
          </div>
          <Skeleton variant="rect" className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    const isNotFound = error instanceof ApiProblemDetails && error.status === 404;
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center justify-center rounded-2xl border border-sage/20 bg-white py-20 text-center shadow-sm">
        <AlertCircle className="mb-4 h-12 w-12 text-red-400" />
        <h2 className="mb-2 font-serif text-xl font-semibold text-brown">{isNotFound ? 'Pedido no encontrado' : 'Error al cargar'}</h2>
        <p className="mb-6 max-w-md text-sage">{isNotFound ? 'El pedido que buscas no existe.' : 'Ocurrió un error de conexión.'}</p>
        <div className="flex gap-3">
          <Link href="/admin/pedidos"><Button variant="outline">Volver a pedidos</Button></Link>
          {!isNotFound && <Button onClick={() => refetch()}>Reintentar</Button>}
        </div>
      </div>
    );
  }

  const status = statusName(order.status);
  const delivery = deliveryTypeName(order.deliveryType);
  const statusInfo = getOrderStatusInfo(order.status, order.deliveryType);
  const action = nextAdminAction(status, delivery);
  const customerPhone = order.customer?.phone;
  const firstName = order.customer?.name?.split(' ')[0] ?? '';

  return (
    <div className="max-w-6xl space-y-6">
      {/* Cabecera */}
      <div className="flex flex-wrap items-center gap-4 rounded-[24px] border border-sage/10 bg-white p-5 shadow-sm sm:p-6">
        <Link href="/admin/pedidos" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream/50 text-sage transition-colors hover:bg-gold/10 hover:text-gold" aria-label="Volver a pedidos">
          <ArrowLeft size={20} />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-serif text-2xl font-bold text-brown sm:text-3xl">Pedido <span className="text-gold">{order.orderCode}</span></h1>
            <span className={`rounded-full border px-3 py-1 text-xs font-bold ${STATUS_BADGE[statusInfo.color] ?? STATUS_BADGE.sage}`}>
              {statusInfo.label}
            </span>
            {order.isCustomOrder && (
              <span className="inline-flex items-center gap-1 rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-xs font-bold text-gold">
                <Sparkles size={12} /> Personalizado
              </span>
            )}
          </div>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-2 text-sm text-sage">
            <span>{formatDate(order.createdAt)}</span>
            <span className="h-1 w-1 rounded-full bg-sage/30" />
            <span>{getDeliveryTypeLabel(order.deliveryType)}</span>
            <span className="h-1 w-1 rounded-full bg-sage/30" />
            <span className="font-mono text-xs">Seguimiento: {order.trackingToken}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="font-serif text-2xl font-bold text-brown">
            {order.total != null ? formatCurrency(order.total) : <span className="font-sans text-sm font-semibold text-amber-600">Sin precio</span>}
          </p>
          {action.label && <p className="text-xs font-semibold text-[#b08a4e]">{action.label}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        {/* Columna principal */}
        <div className="space-y-6 lg:col-span-2">
          <OrderActions
            key={`${order.status}-${order.total}`}
            order={order}
            onReviewPayment={() => setIsConfirmModalOpen(true)}
            onRejectPayment={() => setIsRejectModalOpen(true)}
          />

          <WorkshopPreparationCard order={order} />

          {order.payment && <OrderPaymentsCard payment={order.payment} />}

          {/* Comprobante ya revisado (o rechazado): queda a mano para consultarlo */}
          {order.payment?.evidenceUrl && status !== 'PaymentReported' && (
            <section className={cardClass}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="flex items-center gap-2 font-serif text-lg font-bold text-brown">
                  <CreditCard size={18} className="text-gold" /> Comprobante de pago
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadEvidence(order.payment!.evidenceUrl!)}
                  className="flex items-center gap-1.5 rounded-full text-xs"
                >
                  <Download className="h-3.5 w-3.5" /> Descargar
                </Button>
              </div>
              <div className="mt-4 flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => window.open(getImageUrl(order.payment!.evidenceUrl!), '_blank', 'noopener,noreferrer')}
                  className="h-24 w-20 shrink-0 overflow-hidden rounded-xl border border-sage/15 bg-stone-50"
                  title="Ver comprobante"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={getImageUrl(order.payment.evidenceUrl)} alt="Comprobante" className="h-full w-full object-cover" />
                </button>
                <dl className="text-sm">
                  <div className="flex gap-2"><dt className="text-sage">Estado:</dt><dd className="font-semibold text-brown">{order.payment.paymentStatus === 'Confirmed' ? 'Confirmado' : order.payment.paymentStatus === 'Rejected' ? 'Rechazado' : order.payment.paymentStatus}</dd></div>
                  <div className="flex gap-2"><dt className="text-sage">Monto:</dt><dd className="font-semibold text-brown">{formatCurrency(order.payment.amount)}</dd></div>
                  {order.payment.verifiedAt && <div className="flex gap-2"><dt className="text-sage">Revisado:</dt><dd className="text-brown">{formatDate(order.payment.verifiedAt)}</dd></div>}
                </dl>
              </div>
            </section>
          )}

          <OrderTimeline order={order} />

          <OrderStatusHistory orderId={id} deliveryType={order.deliveryType} />
        </div>

        {/* Columna lateral */}
        <div className="space-y-6">
          <section className={cardClass}>
            <h3 className="mb-4 flex items-center gap-2 font-serif text-lg font-bold text-brown">
              <User size={18} className="text-gold" /> Cliente
            </h3>
            <p className="font-semibold text-brown">{order.customer?.name}</p>
            <div className="mt-2 space-y-1.5 text-sm text-sage">
              {customerPhone && <p className="flex items-center gap-2"><Phone size={14} /> {customerPhone}</p>}
              {order.customer?.email && <p className="flex items-center gap-2 break-all"><Mail size={14} /> {order.customer.email}</p>}
            </div>
            <div className="mt-4 space-y-2">
              {customerPhone && (
                <a
                  href={whatsappLink(customerPhone, `Hola ${firstName} 🌸 Te escribimos de Aura Nova por tu pedido ${order.orderCode}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-2.5 text-sm font-bold text-white hover:bg-[#1ebe5b]"
                >
                  <MessageCircle size={16} /> Escribir por WhatsApp
                </a>
              )}
              <OrderEmailCard order={order} />
            </div>
          </section>

          <section className={cardClass}>
            <h3 className="mb-4 flex items-center gap-2 font-serif text-lg font-bold text-brown">
              <Truck size={18} className="text-gold" /> Entrega
            </h3>
            <div className="space-y-2 text-sm text-sage">
              <p className="font-semibold text-brown">{getDeliveryTypeLabel(order.deliveryType)}</p>
              {order.delivery?.meetingPoint && <p className="flex gap-2"><MapPin size={14} className="mt-0.5 shrink-0" /> {order.delivery.meetingPoint}</p>}
              {order.delivery?.deliveryZone && <p className="flex gap-2"><MapPin size={14} className="mt-0.5 shrink-0" /> Zona {order.delivery.deliveryZone}</p>}
              {order.delivery?.deliveryAddress && <p className="pl-6 text-brown">{order.delivery.deliveryAddress}</p>}
              {(order.delivery?.district || order.delivery?.province) && (
                <p className="pl-6">{[order.delivery?.district, order.delivery?.province, order.delivery?.department].filter(Boolean).join(', ')}</p>
              )}
              {order.deliveryType === DeliveryType.NationalShipping && !order.deliveryCost && (
                <p className="rounded-lg bg-[#fdf8ee] px-3 py-2 text-xs text-[#8c6d36]">El envío lo paga el cliente en destino.</p>
              )}
            </div>

            {order.shippingProvider && (
              <div className="mt-4 rounded-xl border border-gold/30 bg-[#fffdf8] p-3 text-sm">
                <p className="flex items-center gap-2 font-semibold text-brown"><Package size={14} className="text-gold" /> {order.shippingProvider}</p>
                {order.shippingTrackingCode && <p className="mt-1 text-sage">Código: <span className="font-mono text-brown">{order.shippingTrackingCode}</span></p>}
                {order.shippingProofUrl && (
                  <a href={order.shippingProofUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-gold hover:underline">
                    Ver constancia <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            )}
          </section>

          <OrderStatusChangeForm
            orderId={id}
            currentStatus={order.status}
            deliveryType={order.deliveryType}
            customerName={order.customer?.name}
            customerPhone={order.customer?.phone}
            orderCode={order.orderCode}
          />

          <OrderNotifications orderId={id} />
        </div>
      </div>

      <ConfirmPaymentModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmPayment}
        isPending={confirmPaymentMutation.isPending}
        orderCode={order.orderCode}
        orderTotal={order.total}
        paymentAmount={order.payment?.amount}
        paymentMethod={order.payment?.paymentMethod}
        evidenceUrl={order.payment?.evidenceUrl}
        customerName={order.customer?.name}
      />

      <RejectPaymentModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onReject={handleRejectPayment}
        isPending={rejectPaymentMutation.isPending}
        orderCode={order.orderCode}
      />
    </div>
  );
}
