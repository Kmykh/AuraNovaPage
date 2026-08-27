"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAdminPayment, useConfirmPayment, useRejectPayment } from '@/hooks/use-admin-payments';
import { getPaymentStatusInfo, getPaymentMethodLabel } from '@/lib/payment-helpers';
import { formatDate } from '@/lib/order-helpers';
import { formatCurrency, getImageUrl } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ArrowLeft, AlertCircle, FileImage, CheckCircle, XCircle } from 'lucide-react';
import { ApiProblemDetails } from '@/lib/api-errors';
import { PaymentStatus } from '@/types/enums';

export function AdminPaymentDetail({ id }: { id: string }) {
  const { data: payment, isLoading, error, refetch } = useAdminPayment(id);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectNotes, setRejectNotes] = useState('');
  const [imageError, setImageError] = useState(false);

  // El hook de confirm necesita orderId para invalidar la orden, pero podemos pasarlo si está disponible
  const orderId = payment?.orderId || '';
  const { mutate: confirmPayment, isPending: isConfirming } = useConfirmPayment(id, orderId);
  const { mutate: rejectPayment, isPending: isRejecting } = useRejectPayment(id, orderId);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton variant="rect" className="w-full h-32 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton variant="rect" className="w-full h-64 rounded-2xl" />
          <Skeleton variant="rect" className="w-full h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !payment) {
    const isNotFound = error instanceof ApiProblemDetails && error.status === 404;
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-sage/20 shadow-sm max-w-2xl mx-auto">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <h2 className="text-xl font-serif text-brown font-semibold mb-2">
          {isNotFound ? 'Pago no encontrado' : 'Error al cargar'}
        </h2>
        <p className="text-sage max-w-md mb-6">
          {isNotFound ? 'El pago que buscas no existe en el sistema.' : 'Ocurrió un error de conexión.'}
        </p>
        <div className="flex gap-3">
          <Link href="/admin/pagos">
            <Button variant="outline">Volver a pagos</Button>
          </Link>
          {!isNotFound && <Button onClick={() => refetch()}>Reintentar</Button>}
        </div>
      </div>
    );
  }

  const statusKey = typeof payment.status === 'string' ? (PaymentStatus as any)[payment.status] ?? payment.status : payment.status;
  const statusInfo = getPaymentStatusInfo(statusKey);
  const isReported = statusKey === PaymentStatus.Reported || statusKey === 'Reported';

  const handleConfirm = () => {
    confirmPayment(undefined, {
      onSuccess: () => setShowConfirmModal(false)
    });
  };

  const handleReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectNotes.trim()) return;
    rejectPayment({ notes: rejectNotes.trim() }, {
      onSuccess: () => {
        setShowRejectModal(false);
        setRejectNotes('');
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-4">
          <Link href="/admin/pagos" className="text-sage hover:text-brown transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-bold text-brown">Comprobante de {payment.orderCode}</h1>
            <p className="text-sm text-sage mt-1">Registrado el {formatDate(payment.createdAt)}</p>
          </div>
        </div>
        
        <Link href={`/admin/pedidos/${payment.orderId}`}>
          <Button variant="outline" className="h-9">Ver pedido completo</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Info Column */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-sage/10">
            <div className="flex justify-between items-start mb-6 border-b border-sage/10 pb-6">
              <div>
                <p className="text-sm text-sage mb-1">Monto del pago</p>
                <p className="text-3xl font-serif font-bold text-brown">{formatCurrency(payment.amount)}</p>
              </div>
              <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-${statusInfo.color}/10 text-${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-sage">Cliente</span>
                <span className="font-medium text-brown">{payment.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sage">Método de pago</span>
                <span className="font-medium text-brown">{getPaymentMethodLabel(payment.method)}</span>
              </div>
              {payment.confirmedAt && (
                <div className="flex justify-between">
                  <span className="text-sage">Fecha de confirmación</span>
                  <span className="font-medium text-brown">{formatDate(payment.confirmedAt)}</span>
                </div>
              )}
            </div>

            {payment.notes && (
              <div className="mt-6 p-4 bg-[#FAFAFA] rounded-xl border border-sage/20">
                <p className="text-xs text-sage mb-1">Notas del rechazo / administración:</p>
                <p className="text-sm text-brown whitespace-pre-wrap">{payment.notes}</p>
              </div>
            )}
          </div>

          {isReported && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-sage/10 flex flex-col sm:flex-row gap-3">
              <Button 
                className="flex-1 bg-sage hover:bg-sage/90 text-white" 
                onClick={() => setShowConfirmModal(true)}
              >
                <CheckCircle size={18} className="mr-2" />
                Confirmar Pago
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 text-rose hover:bg-rose/5 hover:text-rose border-rose/30"
                onClick={() => setShowRejectModal(true)}
              >
                <XCircle size={18} className="mr-2" />
                Rechazar
              </Button>
            </div>
          )}
        </div>

        {/* Evidence Column */}
        <div className="bg-[#FAFAFA] p-6 rounded-2xl border border-sage/20 flex flex-col">
          <h3 className="font-medium text-brown mb-4 flex items-center gap-2">
            <FileImage size={18} /> Evidencia Adjunta
          </h3>
          
          {payment.evidenceUrl ? (
            <div className="flex-1 flex flex-col">
              <div className="relative w-full aspect-[3/4] bg-cream/30 rounded-xl overflow-hidden border border-sage/20 mb-4 flex items-center justify-center">
                {!imageError ? (
                  <Image 
                    src={getImageUrl(payment.evidenceUrl)} 
                    alt={`Evidencia del pedido ${payment.orderCode}`}
                    fill
                    className="object-contain"
                    onError={() => setImageError(true)}
                    unoptimized
                  />
                ) : (
                  <div className="text-sage text-center p-6">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Preview no disponible para este formato.</p>
                  </div>
                )}
              </div>
              <a 
                href={getImageUrl(payment.evidenceUrl)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button variant="outline" className="w-full">Abrir comprobante completo</Button>
              </a>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-sage text-center">
              <FileImage className="w-12 h-12 mb-3 opacity-20" />
              <p>No se ha adjuntado ningún comprobante todavía.</p>
            </div>
          )}
        </div>
      </div>

      {/* Confirm Modal */}
      <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)}>
        <div className="p-6 text-center max-w-sm mx-auto">
          <CheckCircle className="w-12 h-12 text-sage mx-auto mb-4" />
          <h2 className="text-xl font-serif text-brown font-semibold mb-2">¿Confirmar este pago?</h2>
          <p className="text-sage text-sm mb-6">
            Al confirmar, el pedido pasará automáticamente a estado &quot;Pago Confirmado&quot; y el cliente será notificado.
          </p>
          <div className="flex flex-col gap-2">
            <Button onClick={handleConfirm} disabled={isConfirming} className="w-full bg-sage hover:bg-sage/90">
              {isConfirming ? 'Confirmando...' : 'Confirmar pago'}
            </Button>
            <Button variant="outline" onClick={() => setShowConfirmModal(false)} disabled={isConfirming} className="w-full">
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal isOpen={showRejectModal} onClose={() => setShowRejectModal(false)}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4 text-rose">
            <XCircle className="w-6 h-6" />
            <h2 className="text-xl font-serif font-semibold text-brown">Rechazar comprobante</h2>
          </div>
          <p className="text-sage text-sm mb-6">
            Indica el motivo del rechazo para que pueda revisarse posteriormente. Este mensaje puede ser visto por el equipo.
          </p>
          <form onSubmit={handleReject} className="space-y-4">
            <div>
              <textarea 
                required
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                maxLength={2000}
                disabled={isRejecting}
                className="w-full px-4 py-3 bg-[#FAFAFA] border border-sage/30 rounded-xl focus:ring-1 focus:ring-rose/50 outline-none resize-none"
                rows={4}
                placeholder="Ej. El número de operación no coincide, monto incompleto..."
              />
              <p className="text-right text-xs text-sage mt-1">{rejectNotes.length}/2000</p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowRejectModal(false)} disabled={isRejecting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={!rejectNotes.trim() || isRejecting} className="bg-rose hover:bg-rose/90 text-white">
                {isRejecting ? 'Rechazando...' : 'Rechazar pago'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
