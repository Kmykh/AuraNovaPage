import { OrderStatus, DeliveryType } from './enums';

export interface TrackingTimelineEvent {
  status: OrderStatus;
  label: string;
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
}

export interface PublicTrackingResponse {
  orderCode: string;
  status: OrderStatus;
  statusLabel: string;
  deliveryType: DeliveryType;
  total: number | null;
  subtotal?: number | null;
  deliveryCost?: number | null;
  customizationCost?: number | null;
  isCustomOrder?: boolean;
  timeline: TrackingTimelineEvent[];
  delivery?: TrackingDeliveryInfo;
  items?: TrackingItem[];
}
