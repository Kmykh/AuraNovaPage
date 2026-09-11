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
}

export interface PublicTrackingResponse {
  orderCode: string;
  customerFirstName?: string;
  status: OrderStatus;
  statusLabel: string;
  deliveryType: DeliveryType;
  
  isCustomOrder?: boolean;
  referenceImageUrl?: string;
  customizationNotes?: string;
  notes?: string;

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
