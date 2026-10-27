import { ItemAccessory } from './products';
import { OrderStatus, DeliveryType } from './enums';

export interface TrackingTimelineEvent {
  status: OrderStatus;
  /** status, payment, refund, rejection o cancelled */
  kind?: 'status' | 'payment' | 'refund' | 'rejection' | 'cancelled';
  label: string;
  description?: string;
  completed: boolean;
  createdAt: string;
}

export interface TrackingDeliveryInfo {
  deliveryAddress?: string;
  district?: string;
  province?: string;
  department?: string;
  meetingPointName?: string;
  deliveryZoneName?: string;
}

export interface TrackingItem {
  productName: string;
  quantity: number;
  unitPrice?: number;
  imageUrl?: string;
  selectedColors?: string[];
  selectedFlowerTypes?: string[];
  accessories?: ItemAccessory[];
  hasLights?: boolean;
  hasButterfly?: boolean;
  hasPhraseCard?: boolean;
  phraseText?: string | null;
}

/** Un cobro o una devolución, con su medio y fecha. */
export interface TrackingMoneyMovement {
  kind: 'payment' | 'refund';
  amount: number;
  /** Yape, Visa, Mastercard… */
  method: string;
  isDeposit: boolean;
  date?: string | null;
}

export type TrackingPaymentState = 'unpaid' | 'processing' | 'deposit' | 'paid' | 'none' | 'refund_pending' | 'refunded';

/** El dinero del pedido explicado para el cliente. */
export interface TrackingPayment {
  state: TrackingPaymentState;
  total: number;
  charged: number;
  refunded: number;
  netPaid: number;
  balanceDue: number;
  movements: TrackingMoneyMovement[];
}

export interface PublicTrackingResponse {
  /** Id interno: para subir el comprobante o aceptar la cotización desde el seguimiento. */
  orderId?: string;
  orderCode: string;
  customerFirstName?: string;
  status: OrderStatus;
  statusLabel: string;
  deliveryType: DeliveryType;
  
  isCustomOrder?: boolean;
  referenceImageUrl?: string;
  customizationNotes?: string;
  notes?: string;

  // Brief del pedido personalizado (URLs firmadas y temporales)
  referenceImages?: string[];
  referenceLinks?: string[];
  desiredDate?: string | null;
  occasion?: string | null;
  budgetRange?: string | null;

  // Legacy flat fields
  total?: number | null;
  subtotal?: number | null;
  deliveryCost?: number | null;
  customizationCost?: number | null;
  shippingProvider?: string;
  shippingTrackingCode?: string;
  shippingProofUrl?: string;

  // New structured fields
  costs?: {
    subtotal: number;
    deliveryCost?: number;
    customizationCost: number;
    total?: number;
    /** Pagado con Mercado Pago y saldo pendiente (solo si se pagó el adelanto) */
    amountPaid?: number;
    balanceDue?: number;
  };

  /** Lo pagado y lo devuelto (backend nuevo); sin esto se usa `costs` */
  payment?: TrackingPayment;

  estimates?: {
    createdAt: string;
    startedAt?: string;
    estimatedReadyAt?: string;
  };

  nationalShippingDetails?: {
    provider?: string;
    trackingCode?: string;
    proofUrl?: string;
  };

  timeline: TrackingTimelineEvent[];
  delivery?: TrackingDeliveryInfo;
  items: TrackingItem[];
}
