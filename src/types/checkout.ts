export enum DeliveryType {
  Delivery = 0,
  MeetingPoint = 1,
  NationalShipping = 2
}

export enum OrderStatus {
  WaitingQuote = 0,
  QuoteReady = 1,
  WaitingPayment = 2,
  PaymentReported = 3,
  PaymentConfirmed = 4,
  Preparing = 5,
  Ready = 6,
  Shipped = 7,
  Delivered = 8,
  Cancelled = 9
}

export interface DeliveryZoneResponse {
  id: string;
  name: string;
  district: string;
  cost: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface MeetingPointResponse {
  id: string;
  name: string;
  address: string;
  cost: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateOrderCustomerRequest {
  name: string;
  phone: string;
  email?: string | null;
}

export interface CreateOrderItemRequest {
  productId: string;
  quantity: number;
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
