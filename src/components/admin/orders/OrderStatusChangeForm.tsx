"use client";

import React, { useState } from 'react';
import { useChangeOrderStatus, useOrderNotifications } from '@/hooks/use-admin-orders';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { WhatsAppFallbackButton } from '@/components/shared/WhatsAppFallbackButton';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { ApiProblemDetails } from '@/lib/api-errors';
import { DeliveryType, OrderStatus } from '@/types/enums';

interface OrderStatusChangeFormProps {
  orderId: string;
  currentStatus: number;
  deliveryType?: number | string;
  customerName?: string;
  customerPhone?: string;
  orderCode?: string;
}

export function OrderStatusChangeForm({ orderId, currentStatus, deliveryType, customerName, customerPhone, orderCode }: OrderStatusChangeFormProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [comment, setComment] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<{status: string, comment: string} | null>(null);

  const { mutate: changeStatus, isPending } = useChangeOrderStatus(orderId);
  const { data: notifications } = useOrderNotifications(orderId);

  const getBeautifulPhrase = (status: number) => {
    switch (status) {
      case OrderStatus.QuoteReady: return "Hemos preparado una cotización especial con mucho cariño para ti ✨";
      case OrderStatus.WaitingPayment: return "Tu pedido está casi listo. Solo falta confirmar tu pago para empezar la magia 💫";
      case OrderStatus.PaymentReported: return "¡Gracias! Hemos recibido tu comprobante y lo estamos verificando con detalle 🔍";
      case OrderStatus.PaymentConfirmed: return "¡Pago confirmado! Empezamos a preparar tus piezas únicas con mucho amor 💖";
      case OrderStatus.Preparing: return "Nuestros artesanos ya están dedicando su talento para crear tu pedido especial 🎨";
      case OrderStatus.Ready: return "¡Tu pedido ha florecido! Está perfectamente empacado y listo para iluminar tu día 🌸";
      case OrderStatus.Shipped: return "Tus flores eternas ya están en camino y muy pronto llegarán a tus manos 🚚";
      case OrderStatus.Delivered: return "¡Entregado con éxito! Gracias por dejar que AuraNova sea parte de tus momentos especiales ✨";
      case OrderStatus.Cancelled: return "Lamentamos que tu pedido no haya podido completarse. ¡Siempre serás bienvenido en AuraNova! 🌙";
      default: return "";
    }
  };

  const handleStatusSelect = (val: number) => {
    setSelectedStatus(val.toString());
    // Si el comentario está vacío o es una de las frases automáticas anteriores, lo actualizamos.
    const currentIsAuto = Object.values(OrderStatus).some(s => typeof s === 'number' && comment === getBeautifulPhrase(s as number));
    if (!comment.trim() || currentIsAuto) {
      setComment(getBeautifulPhrase(val));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStatus) return;

    setErrorMsg(null);
    
    // Obtenemos el texto del estado (ej: "Preparing", "Shipped") en vez del número
    const statusString = OrderStatus[parseInt(selectedStatus, 10)];

    changeStatus(
      {
        status: statusString,
        comment: comment.trim() || undefined,
      },
      {
        onSuccess: () => {
          setLastUpdate({
            status: nextOptions.find(o => o.value.toString() === selectedStatus)?.label || statusString,
            comment: comment.trim()
          });
          setSelectedStatus('');
          setComment('');
          setShowSuccessModal(true);
        },
        onError: (err) => {
          if (err instanceof ApiProblemDetails) {
            if (err.status === 400) setErrorMsg('No se puede realizar ese cambio de estado. Consulta las reglas del backend.');
            else if (err.status === 403) setErrorMsg('No tienes permisos para cambiar el estado.');
            else if (err.status === 409) setErrorMsg('El pedido cambió antes de completar esta acción.');
            else setErrorMsg(err.title || 'Ocurrió un error inesperado.');
          } else {
            setErrorMsg('Ocurrió un error de conexión.');
          }
        }
      }
    );
  };

  const getAvailableNextStates = (status: number | string) => {
    const options: { value: number; label: string }[] = [];
    
    // Si viene como string ("PaymentConfirmed"), lo convertimos a número (4)
    const statusKey = typeof status === 'string' 
      ? (OrderStatus as any)[status] ?? parseInt(status as string, 10)
      : status;

    const canCancel = statusKey < 8; // No se cancela si está entregado o ya cancelado
    
    const deliveryTypeKey = typeof deliveryType === 'string' 
      ? (DeliveryType as any)[deliveryType] ?? deliveryType 
      : deliveryType;
    
    // Si no es Delivery ni Envio Nacional, entonces es Punto de Encuentro (no tiene envío)
    const requiresShipping = deliveryTypeKey === DeliveryType.Delivery || deliveryTypeKey === DeliveryType.NationalShipping;

    switch (statusKey) {
      case OrderStatus.WaitingQuote: options.push({ value: OrderStatus.QuoteReady, label: 'Cotización Lista' }); break;
      case OrderStatus.QuoteReady: options.push({ value: OrderStatus.WaitingPayment, label: 'Esperando Pago' }); break;
      case OrderStatus.WaitingPayment:
        options.push({ value: OrderStatus.PaymentReported, label: 'Pago Reportado' });
        options.push({ value: OrderStatus.PaymentConfirmed, label: 'Pago Confirmado' });
        break;
      case OrderStatus.PaymentReported: options.push({ value: OrderStatus.PaymentConfirmed, label: 'Pago Confirmado' }); break;
      case OrderStatus.PaymentConfirmed: options.push({ value: OrderStatus.Preparing, label: 'Preparando' }); break;
      case OrderStatus.Preparing: options.push({ value: OrderStatus.Ready, label: 'Listo' }); break;
      case OrderStatus.Ready: 
        if (requiresShipping) {
          options.push({ value: OrderStatus.Shipped, label: 'En Camino' });
        } else {
          options.push({ value: OrderStatus.Delivered, label: 'Entregado' }); // Directo a entregado
        }
        break;
      case OrderStatus.Shipped: options.push({ value: OrderStatus.Delivered, label: 'Entregado' }); break;
    }
    
    if (canCancel) {
      options.push({ value: OrderStatus.Cancelled, label: 'Cancelado' });
    }

    return options;
  };

  const nextOptions = getAvailableNextStates(currentStatus);

  // If there are no next states (e.g., Delivered or Cancelled)
  if (nextOptions.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-sage/10 text-center">
        <p className="text-sage text-sm font-medium">Este pedido ha finalizado y ya no admite cambios de estado.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-sage/10">
      <h3 className="font-serif text-lg text-brown font-semibold mb-4">Actualizar estado</h3>
      
      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm flex gap-3 border border-red-200 mb-4">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{errorMsg}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-brown mb-3">Siguientes estados lógicos:</label>
          <div className="flex flex-wrap gap-2">
            {nextOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleStatusSelect(opt.value)}
                disabled={isPending}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedStatus === opt.value.toString()
                    ? opt.value === 9 
                      ? 'bg-rose text-white border-transparent' 
                      : 'bg-gold text-white border-transparent'
                    : 'bg-cream text-sage border border-sage/20 hover:border-gold hover:text-gold'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-brown mb-2">
            Comentario (opcional)
          </label>
          <textarea 
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={2000}
            disabled={isPending}
            className="w-full px-4 py-3 bg-[#FAFAFA] border border-sage/30 rounded-xl focus:ring-1 focus:ring-gold outline-none resize-none text-sm text-brown"
            rows={2}
            placeholder="Escribe aquí si necesitas dejar una nota interna..."
          />
        </div>

        <Button 
          type="submit" 
          disabled={!selectedStatus || isPending}
          className="w-full"
        >
          {isPending ? 'Actualizando...' : 'Confirmar cambio'}
        </Button>
      </form>

      <Modal 
        isOpen={showSuccessModal} 
        onClose={() => setShowSuccessModal(false)}
        title="¡Estado actualizado!"
      >
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
            <CheckCircle size={32} />
          </div>
          <p className="text-brown font-serif text-lg font-medium mb-3">Recuerda notificar al cliente</p>
          <p className="text-sage text-sm mb-8 leading-relaxed px-4">
            El pedido pasó a estado <strong>"{lastUpdate?.status}"</strong> exitosamente. Envíale un mensaje por WhatsApp al cliente para que esté al tanto.
          </p>
          
          <div className="w-full space-y-3">
            <WhatsAppFallbackButton 
              phone={customerPhone || ''}
              message={
                notifications?.filter(n => n.channel === 0 && n.status === 0)
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]?.message 
                || `Hola ${customerName || ''}. Tu pedido ${orderCode || ''} ha sido actualizado a: ${lastUpdate?.status}.\n\n${lastUpdate?.comment ? `Nota: ${lastUpdate.comment}` : ''}`
              }
              label="Notificar por WhatsApp"
              className="w-full h-12 shadow-md shadow-green-500/20"
            />
            <Button 
              variant="outline" 
              className="w-full h-12" 
              onClick={() => setShowSuccessModal(false)}
            >
              Cerrar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
