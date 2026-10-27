import { ItemAccessory } from './products';
import { OrderStatus, DeliveryType } from './enums';

export interface TrackingTimelineEvent {
  status: OrderStatus;
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
