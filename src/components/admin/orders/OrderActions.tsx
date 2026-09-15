"use client";

import React, { useState } from 'react';
import { OrderStatus, DeliveryType, PaymentStatus } from '@/types/enums';
import { formatDate } from '@/lib/order-helpers';
import { AdminOrderDetailResponse } from '@/types/orders';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useStartPreparation, useSetEstimatedReadyDate, useMarkAsReady, useDeliverToAgency, useChangeOrderStatus } from '@/hooks/use-admin-orders';
import { AlertCircle, Calendar, Play, CheckCircle2, Truck, XCircle, DollarSign, ExternalLink, Mail, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface OrderActionsProps {
  order: AdminOrderDetailResponse;
}

export function OrderActions({ order }: OrderActionsProps) {
  const [isConfirmPaymentModalOpen, setIsConfirmPaymentModalOpen] = useState(false);
  const [isEstimatedDateModalOpen, setIsEstimatedDateModalOpen] = useState(false);
  const [isDeliverAgencyModalOpen, setIsDeliverAgencyModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  // States for modals
  const [estimatedDate, setEstimatedDate] = useState('');
  const [agencyData, setAgencyData] = useState<{ provider: string; trackingCode: string; proofFile: File | null }>({ provider: '', trackingCode: '', proofFile: null });
  const [emailPreviewHtml, setEmailPreviewHtml] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  
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

  const loadEmailPreview = async () => {
    setIsGeneratingPreview(true);
    setEmailPreviewHtml(null);
    setIsEmailModalOpen(true);
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order: order,
          customer: order.customer,
          items: order.items || [],
          subtotal: order.subtotal || 0,
          deliveryType: order.deliveryType,
          estimatedDeliveryCost: order.deliveryCost || 0,
          emailType: order.status === 0 ? 'quote_received' : 'receipt',
          preview: true
        })
      });
      if (!res.ok) throw new Error('Error al generar preview');
      const data = await res.json();
      if (data.html) {
        setEmailPreviewHtml(data.html);
      } else {
        toast.error('No se pudo generar la previsualización');
      }
    } catch (error) {
      toast.error('Error de conexión al generar preview');
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  const handleSendEmail = async () => {
    if (!order.customer?.email) {
      toast.error('El cliente no tiene un correo electrónico registrado.');
      return;
    }
    setIsSendingEmail(true);
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order: order,
          customer: order.customer,
          items: order.items || [],
          subtotal: order.subtotal || 0,
          deliveryType: order.deliveryType,
          estimatedDeliveryCost: order.deliveryCost || 0,
          emailType: order.status === 0 ? 'quote_received' : 'receipt',
          preview: false
        })
      });
      if (res.ok) {
        toast.success('Correo enviado exitosamente.');
        setIsEmailModalOpen(false);
      } else {
        toast.error('Hubo un error al enviar el correo.');
      }
    } catch (error) {
      toast.error('Error de red al enviar correo.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Rendering logic based on status
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-sage/10 mb-6">
      <h3 className="font-serif text-lg text-brown font-semibold mb-4">Acciones Operativas</h3>
      
      <div className="flex flex-wrap gap-3">
        {order.status === OrderStatus.PaymentConfirmed && (
          <Button onClick={() => startPreparation()} disabled={isStartingPrep} className="bg-sage text-white hover:bg-sage/90">
            <Play className="w-4 h-4 mr-2" />
            {isStartingPrep ? 'Iniciando...' : 'Iniciar Elaboración'}
          </Button>
        )}

        {order.status === OrderStatus.Preparing && (
          <>
            <Button onClick={() => setIsEstimatedDateModalOpen(true)} variant="outline" className="border-sage text-sage hover:bg-sage/10">
              <Calendar className="w-4 h-4 mr-2" />
              Fijar Fecha Estimada
            </Button>
            <Button onClick={() => markReady()} disabled={isMarkingReady} className="bg-sage text-white hover:bg-sage/90">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {isMarkingReady ? 'Actualizando...' : 'Marcar como Listo'}
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
          <Button onClick={() => changeStatus({ status: OrderStatus.Delivered })} disabled={isChangingStatus} className="bg-brown text-white hover:bg-brown/90">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            {isChangingStatus ? 'Actualizando...' : 'Marcar Entregado'}
          </Button>
        )}

        {order.status === OrderStatus.DeliveredToAgency && (
          <Button onClick={() => changeStatus({ status: OrderStatus.Delivered })} disabled={isChangingStatus} className="bg-brown text-white hover:bg-brown/90">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            {isChangingStatus ? 'Actualizando...' : 'Marcar Recibido por Cliente'}
          </Button>
        )}

        {order.status === OrderStatus.WaitingPayment && (
          <span className="text-xs text-[#887870] italic">
            Esperando que el cliente adjunte el comprobante de pago.
          </span>
        )}

        {order.status === OrderStatus.PaymentReported && (
          <span className="text-xs font-semibold text-[#b58129] bg-[#fdf6e7] px-3 py-1.5 rounded-full border border-[#c8a96b]/30 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            Comprobante recibido: revísalo en la sección de Comprobante
          </span>
        )}

        <div className="w-full h-px bg-sage/10 my-2"></div>
        <Button onClick={loadEmailPreview} variant="outline" className="border-brown text-brown hover:bg-brown/5">
          <Mail className="w-4 h-4 mr-2" />
          Previsualizar y Reenviar Correo
        </Button>
      </div>

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
            <select 
              required
              value={agencyData.provider}
              onChange={(e) => setAgencyData({...agencyData, provider: e.target.value})}
              className="w-full px-4 py-2 border border-sage/20 rounded-xl outline-none focus:border-gold bg-white"
            >
              <option value="">Selecciona una agencia</option>
              <option value="Olva">Olva</option>
              <option value="Shalom">Shalom</option>
              <option value="Otro">Otro</option>
            </select>
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
            <label className="block text-sm text-sage mb-1">Constancia de entrega a agencia</label>
            <input 
              type="file" 
              accept="image/*,.pdf"
              onChange={(e) => {
                const file = e.target.files ? e.target.files[0] : null;
                setAgencyData({...agencyData, proofFile: file});
              }}
              className="w-full px-4 py-2 border border-sage/20 rounded-xl outline-none focus:border-gold"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsDeliverAgencyModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={isDeliveringAgency}>
              {isDeliveringAgency ? 'Subiendo constancia...' : 'Registrar Entrega'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Previsualizar y Enviar Correo */}
      <Modal isOpen={isEmailModalOpen} onClose={() => !isSendingEmail && setIsEmailModalOpen(false)} title="Previsualizar y Reenviar Correo">
        <div className="space-y-4">
          <div className="bg-[#fcf9f2] p-3 rounded-lg border border-[#c8a96b]/20 text-xs text-brown">
            <p><strong>Destinatario:</strong> {order.customer?.email || <span className="text-red-500 font-bold">No hay correo registrado</span>}</p>
            <p><strong>Asunto:</strong> Confirmación de Pedido {order.orderCode} - Aura Nova</p>
          </div>
          
          <div className="border border-sage/20 rounded-xl overflow-hidden bg-white h-[400px] flex items-center justify-center relative">
            {isGeneratingPreview ? (
              <div className="flex flex-col items-center text-sage">
                <div className="w-8 h-8 border-4 border-sage/20 border-t-gold rounded-full animate-spin mb-3"></div>
                <p className="text-sm font-medium">Generando preview...</p>
              </div>
            ) : emailPreviewHtml ? (
              <iframe 
                srcDoc={emailPreviewHtml} 
                className="w-full h-full border-none"
                title="Email Preview"
              />
            ) : (
              <p className="text-sage text-sm">No se pudo cargar la vista previa.</p>
            )}
          </div>
          
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsEmailModalOpen(false)} disabled={isSendingEmail}>Cancelar</Button>
            <Button onClick={handleSendEmail} disabled={isGeneratingPreview || isSendingEmail || !order.customer?.email || !emailPreviewHtml} className="bg-gold text-white hover:bg-gold/90">
              <Mail className="w-4 h-4 mr-2" />
              {isSendingEmail ? 'Enviando...' : 'Reenviar Correo Ahora'}
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
