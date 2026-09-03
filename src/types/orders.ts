import { OrderStatus, DeliveryType } from './enums';

export interface CreateOrderCustomerRequest {
  name: string;
  phone: string;
  email?: string | null;
}

export interface CreateOrderItemRequest {
  productId: string;
  quantity: number;
  selectedPrimaryColor?: string;
  selectedSecondaryColor?: string;
  selectedFlowerType?: string;
  selectedFlowerColor?: string;
  hasLights?: boolean;
  hasButterfly?: boolean;
  hasPhraseCard?: boolean;
  phraseText?: string;
  phraseFont?: string;
}

export interface CreateOrderDeliveryRequest {
  type: string;
  deliveryZoneId?: string;
  meetingPointId?: string;
  deliveryAddress?: string;
  department?: string;
  province?: string;
  district?: string;
}

export interface CreateOrderRequest {
  customer: CreateOrderCustomerRequest;
  items: CreateOrderItemRequest[];
  delivery: CreateOrderDeliveryRequest;
}

export interface CreateOrderResponse {
  id: string;
  orderCode: string;
  trackingToken: string;
  status: OrderStatus;
  subtotal: number;
  deliveryCost: number | null;
  total: number | null;
  createdAt: string;
}

export interface CreateCustomOrderRequest {
  customer: CreateOrderCustomerRequest;
  delivery: CreateOrderDeliveryRequest;
  referenceImageUrl?: string | null;
  customizationNotes?: string | null;
}

export interface AdminOrderListItemResponse {
  id: string;
  orderCode: string;
  customerName: string;
  status: OrderStatus;
  total: number | null;
  createdAt: string;
  isCustomOrder?: boolean;
}

export interface AdminOrderDetailItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  selectedPrimaryColor?: string;
  selectedSecondaryColor?: string;
  selectedFlowerType?: string;
  selectedFlowerColor?: string;
  hasLights?: boolean;
  hasButterfly?: boolean;
  hasPhraseCard?: boolean;
  phraseText?: string;
  phraseFont?: string;
}

export interface AdminOrderDetailCustomer {
  name: string;
  phone: string;
  email: string | null;
}

export interface AdminOrderDetailDelivery {
  deliveryZone: string | null;
  meetingPoint: string | null;
  deliveryAddress: string | null;
  department: string | null;
  province: string | null;
  district: string | null;
}

export interface AdminOrderDetailResponse {
  id: string;
  orderCode: string;
  trackingToken: string;
  status: OrderStatus;
  subtotal: number;
  deliveryCost: number | null;
  total: number | null;
  deliveryType: DeliveryType;
  hasPaymentEvidence?: boolean;
  isCustomOrder?: boolean;
  referenceImageUrl?: string | null;
  customizationNotes?: string | null;
  customizationCost?: number | null;
  customer: AdminOrderDetailCustomer;
  delivery: AdminOrderDetailDelivery;
  items: AdminOrderDetailItem[];
  createdAt: string;
}

export interface ChangeOrderStatusRequest {
  status: OrderStatus | string;
  comment?: string;
}

export interface OrderStatusChangeResponse {
  orderId: string;
  oldStatus: OrderStatus;
  newStatus: OrderStatus;
  comment: string | null;
}

export interface OrderStatusHistoryResponse {
  id: string;
  status: OrderStatus;
  comment: string | null;
  createdAt: string;
}
