"use client";

import React, { useState } from 'react';
import { OrderStatus, DeliveryType, PaymentStatus } from '@/types/enums';
import { formatDate } from '@/lib/order-helpers';
import { AdminOrderDetailResponse } from '@/types/orders';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useStartPreparation, useSetEstimatedReadyDate, useMarkAsReady, useDeliverToAgency, useChangeOrderStatus } from '@/hooks/use-admin-orders';
import { AlertCircle, Calendar, Play, CheckCircle2, Truck, XCircle, DollarSign, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface OrderActionsProps {
  order: AdminOrderDetailResponse;
}

export function OrderActions({ order }: OrderActionsProps) {
  const [isConfirmPaymentModalOpen, setIsConfirmPaymentModalOpen] = useState(false);
  const [isEstimatedDateModalOpen, setIsEstimatedDateModalOpen] = useState(false);
  const [isDeliverAgencyModalOpen, setIsDeliverAgencyModalOpen] = useState(false);

  // States for modals
  const [estimatedDate, setEstimatedDate] = useState('');
  const [agencyData, setAgencyData] = useState({ provider: '', trackingCode: '', proofUrl: '' });
  
  // Mutations
  const { mutate: startPreparation, isPending: isStartingPrep } = useStartPreparation(order.id);
  const { mutate: setEstimated, isPending: isSettingEstimated } = useSetEstimatedReadyDate(order.id);
  const { mutate: markReady, isPending: isMarkingReady } = useMarkAsReady(order.id);
  const { mutate: deliverAgency, isPending: isDeliveringAgency } = useDeliverToAgency(order.id);
  const { mutate: changeStatus, isPending: isChangingStatus } = useChangeOrderStatus(order.id);

  const handleConfirmPayment = (status: number) => {
    // If order.payment is missing, we can't confirm payment this way easily unless we fetch paymentId
    // But paymentId wasn't exposed. Wait, backend didn't expose paymentId directly in order detail, but maybe the mutation for payment confirmation takes paymentId?
    // Let's fallback to changeStatus if paymentId is missing
    if (status === PaymentStatus.Confirmed) {
        changeStatus({ status: OrderStatus.PaymentConfirmed, comment: 'Pago verificado y confirmado.' }, {
            onSuccess: () => setIsConfirmPaymentModalOpen(false)
        });
    } else {
        changeStatus({ status: OrderStatus.WaitingPayment, comment: 'Pago rechazado. Evidencia no válida.' }, {
            onSuccess: () => setIsConfirmPaymentModalOpen(false)
        });
    }
  };

  const handleStartPrep = () => {
    if (confirm('¿Estás seguro de iniciar la elaboración de este pedido?')) {
      startPreparation();
    }
  };

  const handleSetEstimatedDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!estimatedDate) return;
    // Convierte a ISO
    const isoDate = new Date(estimatedDate).toISOString();
    setEstimated({ estimatedDate: isoDate }, {
      onSuccess: () => setIsEstimatedDateModalOpen(false)
    });
  };

  const handleDeliverAgency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agencyData.provider || !agencyData.trackingCode) {
      toast.error('Proveedor y código de seguimiento son requeridos');
      return;
    }
    deliverAgency(agencyData, {
      onSuccess: () => setIsDeliverAgencyModalOpen(false)
    });
  };

  // Rendering logic based on status
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-sage/10 mb-6">
      <h3 className="font-serif text-lg text-brown font-semibold mb-4">Acciones Operativas</h3>
      
      <div className="flex flex-wrap gap-3">
        {order.status === OrderStatus.PaymentReported && (
          <Button onClick={() => setIsConfirmPaymentModalOpen(true)} className="bg-gold text-white hover:bg-gold/90">
            <DollarSign className="w-4 h-4 mr-2" />
            Verificar Pago
          </Button>
        )}

        {order.status === OrderStatus.PaymentConfirmed && (
          <Button onClick={handleStartPrep} disabled={isStartingPrep} className="bg-sage text-white hover:bg-sage/90">
            <Play className="w-4 h-4 mr-2" />
            Iniciar Elaboración
          </Button>
        )}

        {order.status === OrderStatus.Preparing && (
          <>
            <Button onClick={() => setIsEstimatedDateModalOpen(true)} variant="outline" className="border-sage text-sage hover:bg-sage/10">
              <Calendar className="w-4 h-4 mr-2" />
              Fijar Fecha Estimada
            </Button>
            <Button onClick={() => confirm('¿Marcar pedido como listo?') && markReady()} disabled={isMarkingReady} className="bg-sage text-white hover:bg-sage/90">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Marcar como Listo
            </Button>
          </>
        )}

        {order.status === OrderStatus.Ready && order.deliveryType === DeliveryType.NationalShipping && (
          <Button onClick={() => setIsDeliverAgencyModalOpen(true)} className="bg-brown text-white hover:bg-brown/90">
            <Truck className="w-4 h-4 mr-2" />
            Entregar a Agencia
          </Button>
        )}

        {order.status === OrderStatus.Ready && order.deliveryType !== DeliveryType.NationalShipping && (
          <Button onClick={() => confirm('¿Marcar como Entregado?') && changeStatus({ status: OrderStatus.Delivered })} disabled={isChangingStatus} className="bg-brown text-white hover:bg-brown/90">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Marcar Entregado
          </Button>
        )}

        {order.status === OrderStatus.DeliveredToAgency && (
          <Button onClick={() => confirm('¿Confirmar que el cliente recibió el pedido?') && changeStatus({ status: OrderStatus.Delivered })} disabled={isChangingStatus} className="bg-brown text-white hover:bg-brown/90">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Marcar Recibido
          </Button>
        )}
      </div>

      {/* Modal Verificar Pago */}
      <Modal isOpen={isConfirmPaymentModalOpen} onClose={() => setIsConfirmPaymentModalOpen(false)} title="Verificar Evidencia de Pago">
        <div className="space-y-4">
          <div className="bg-cream/30 p-4 rounded-lg">
            <p className="text-sm text-brown font-medium mb-2">Información del pago reportado:</p>
            {order.payment ? (
                <ul className="text-sm text-sage space-y-1">
                    <li>Método: {order.payment.paymentMethod}</li>
                    <li>Monto reportado: {order.payment.amount}</li>
                    <li>Fecha: {formatDate(order.payment.createdAt)}</li>
                </ul>
            ) : (
                <p className="text-sm text-sage italic">Información de pago adjunta al pedido.</p>
            )}
            {order.referenceImageUrl && (
                <div className="mt-4">
                    <p className="text-sm text-brown mb-2">Evidencia (Opcional si subida):</p>
                    <a href={order.referenceImageUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-gold text-sm hover:underline">
                        Ver imagen de evidencia <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                </div>
            )}
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" onClick={() => handleConfirmPayment(PaymentStatus.Rejected)} className="border-red-200 text-red-600 hover:bg-red-50">
              <XCircle className="w-4 h-4 mr-2" />
              Rechazar
            </Button>
            <Button onClick={() => handleConfirmPayment(PaymentStatus.Confirmed)} className="bg-sage text-white hover:bg-sage/90">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Confirmar Pago
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Fecha Estimada */}
      <Modal isOpen={isEstimatedDateModalOpen} onClose={() => setIsEstimatedDateModalOpen(false)} title="Fecha Estimada de Disponibilidad">
        <form onSubmit={handleSetEstimatedDate} className="space-y-4">
          <div>
            <label className="block text-sm text-sage mb-1">Fecha y Hora</label>
            <input 
              type="datetime-local" 
              required
              value={estimatedDate}
              onChange={(e) => setEstimatedDate(e.target.value)}
              className="w-full px-4 py-2 border border-sage/20 rounded-xl outline-none focus:border-gold"
            />
            <p className="text-xs text-sage mt-2">Esta fecha será visible para el cliente y los notificará (si aplica).</p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsEstimatedDateModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={isSettingEstimated}>Guardar Fecha</Button>
          </div>
        </form>
      </Modal>

      {/* Modal Entregar a Agencia */}
      <Modal isOpen={isDeliverAgencyModalOpen} onClose={() => setIsDeliverAgencyModalOpen(false)} title="Registrar Entrega a Agencia">
        <form onSubmit={handleDeliverAgency} className="space-y-4">
          <div>
            <label className="block text-sm text-sage mb-1">Proveedor (Courier)</label>
            <input 
              type="text" 
              required
              placeholder="Ej. Olva Courier, Shalom"
              value={agencyData.provider}
              onChange={(e) => setAgencyData({...agencyData, provider: e.target.value})}
              className="w-full px-4 py-2 border border-sage/20 rounded-xl outline-none focus:border-gold"
            />
          </div>
          <div>
            <label className="block text-sm text-sage mb-1">Código de Seguimiento</label>
            <input 
              type="text" 
              required
              placeholder="Ej. 123456789"
              value={agencyData.trackingCode}
              onChange={(e) => setAgencyData({...agencyData, trackingCode: e.target.value})}
              className="w-full px-4 py-2 border border-sage/20 rounded-xl outline-none focus:border-gold"
            />
          </div>
          <div>
            <label className="block text-sm text-sage mb-1">URL de Evidencia (Opcional)</label>
            <input 
              type="url" 
              placeholder="https://..."
              value={agencyData.proofUrl}
              onChange={(e) => setAgencyData({...agencyData, proofUrl: e.target.value})}
              className="w-full px-4 py-2 border border-sage/20 rounded-xl outline-none focus:border-gold"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsDeliverAgencyModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={isDeliveringAgency}>Registrar Entrega</Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
