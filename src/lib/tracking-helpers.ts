import { OrderStatus, DeliveryType } from '@/types/enums';

export function getOrderStatusLabel(status: OrderStatus | string): string {
  const key = typeof status === 'string' ? (OrderStatus as any)[status] ?? status : status;
  switch (key) {
    case OrderStatus.WaitingQuote: return "Esperando cotización";
    case OrderStatus.QuoteReady: return "Cotización lista";
    case OrderStatus.WaitingPayment: return "Pendiente de pago";
    case OrderStatus.PaymentReported: return "Pago reportado";
    case OrderStatus.PaymentConfirmed: return "Pago confirmado";
    case OrderStatus.Preparing: return "Preparando tu pedido";
    case OrderStatus.Ready: return "Pedido listo";
    case OrderStatus.Shipped: return "Pedido enviado";
    case OrderStatus.Delivered: return "Pedido entregado";
    case OrderStatus.Cancelled: return "Pedido cancelado";
    default: return "Desconocido";
  }
}

export function getOrderStatusDescription(status: OrderStatus | string): string {
  const key = typeof status === 'string' ? (OrderStatus as any)[status] ?? status : status;
  switch (key) {
    case OrderStatus.WaitingQuote: return "Estamos calculando el costo de envío.";
    case OrderStatus.QuoteReady: return "Tu envío ya fue cotizado.";
    case OrderStatus.WaitingPayment: return "Tu pedido está pendiente de pago.";
    case OrderStatus.PaymentReported: return "Recibimos tu comprobante y está en revisión.";
    case OrderStatus.PaymentConfirmed: return "Tu pago fue confirmado.";
    case OrderStatus.Preparing: return "Estamos preparando tu detalle.";
    case OrderStatus.Ready: return "Tu pedido está listo.";
    case OrderStatus.Shipped: return "Tu pedido está en camino.";
    case OrderStatus.Delivered: return "Tu pedido fue entregado.";
    case OrderStatus.Cancelled: return "Este pedido fue cancelado.";
    default: return "El estado de tu pedido no pudo ser determinado.";
  }
}

export function getDeliveryTypeLabel(deliveryType: number | string): string {
  const key = typeof deliveryType === 'string' ? (DeliveryType as any)[deliveryType] ?? deliveryType : deliveryType;
  switch (key) {
    case 0: return "Delivery";
    case 1: return "Punto de encuentro";
    case 2: return "Envío a todo el Perú";
    default: return "Envío estándar";
  }
}
