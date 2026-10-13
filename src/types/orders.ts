import { OrderStatus, DeliveryType } from './enums';

export interface CreateOrderCustomerRequest {
  name: string;
  phone: string;
  email?: string | null;
}

export interface CreateOrderItemRequest {
  productId: string;
  quantity: number;
  selectedColors?: string[];
  selectedFlowerTypes?: string[];
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
  /** Enlaces de inspiración (Pinterest, TikTok, Instagram…). Las imágenes se envían como archivos. */
  referenceLinks?: string[];
  /** "YYYY-MM-DD" */
  desiredDate?: string | null;
  occasion?: string | null;
  budgetRange?: string | null;
}

export interface AdminOrderListProduct {
  productName: string;
  quantity: number;
  imageUrl?: string | null;
  colors: string[];
  hasExtras: boolean;
}

export interface AdminOrderListItemResponse {
  id: string;
  orderCode: string;
  customerName: string;
  customerPhone?: string;
  deliveryType?: DeliveryType | string;
  trackingToken?: string;
  status: OrderStatus | string;
  subtotal?: number;
  deliveryCost?: number | null;
  customizationCost?: number;
  total: number | null;
  createdAt: string;
  updatedAt?: string | null;
  isCustomOrder?: boolean;
  itemCount?: number;
  items?: AdminOrderListProduct[];
  referenceImageCount?: number;
  paymentStatus?: string | null;
  desiredDate?: string | null;
  occasion?: string | null;
  deliveryPlace?: string | null;
}

export interface AdminOrderCountsResponse {
  byStatus: Record<string, number>;
  total: number;
}

/** Resumen que lee la página de pago, siempre desde el backend. */
export interface OrderPaymentSummary {
  orderId: string;
  orderCode: string;
  status: string;
  statusLabel: string;
  deliveryType: string;
  deliveryPlace?: string | null;
  isCustomOrder: boolean;
  subtotal: number;
  deliveryCost: number | null;
  customizationCost: number;
  total: number | null;
  quoteNotes?: string | null;
  quotedAt?: string | null;
  paymentStatus?: string | null;
  paymentAmount?: number | null;
  paymentRejectionReason?: string | null;
  createdAt: string;
  items: OrderSummaryItem[];
}

export interface OrderSummaryItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  imageUrl?: string | null;
  selectedColors?: string[];
  selectedFlowerTypes?: string[];
  hasLights?: boolean;
  hasButterfly?: boolean;
  hasPhraseCard?: boolean;
  phraseText?: string | null;
}

export interface AdminOrderDetailItem {
  productId: string;
  productName: string;
  imageUrl?: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  selectedColors?: string[];
  selectedFlowerTypes?: string[];
  appliedCampaignName?: string | null;
  appliedCampaignStageName?: string | null;
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

export interface AdminOrderQuote {
  quoteId?: string;
  quoteStatus: string;
  shippingCost: number;
  customizationCost: number;
  notes?: string | null;
  quotedAt?: string | null;
}

export interface AdminOrderPayment {
  id?: string;
  paymentStatus: string;
  paymentMethod: string;
  amount: number;
  createdAt: string;
  verifiedAt?: string | null;
  evidenceUrl?: string | null;
}

export interface AdminOrderNotification {
  type: string;
  channel: string;
  status: string;
  createdAt: string;
}

export interface AdminOrderDetailResponse {
  id: string;
  orderCode: string;
  trackingToken: string;
  status: OrderStatus;
  subtotal: number;
  deliveryCost: number | null;
  customizationCost: number;
  total: number | null;
  deliveryType: DeliveryType;
  hasPaymentEvidence?: boolean;
  isCustomOrder?: boolean;
  referenceImageUrl?: string | null;
  customizationNotes?: string | null;
  // Brief del pedido personalizado (URLs firmadas y temporales)
  referenceImages?: string[];
  referenceLinks?: string[];
  desiredDate?: string | null;
  occasion?: string | null;
  budgetRange?: string | null;
  
  // Timing
  startedAt?: string | null;
  estimatedReadyAt?: string | null;
  readyAt?: string | null;
  deliveredToAgencyAt?: string | null;

  // Shipping
  shippingProvider?: string | null;
  shippingTrackingCode?: string | null;
  shippingProofUrl?: string | null;

  customer: AdminOrderDetailCustomer;
  delivery: AdminOrderDetailDelivery;
  quote?: AdminOrderQuote | null;
  payment?: AdminOrderPayment | null;
  items: AdminOrderDetailItem[];
  statusHistory: OrderStatusHistoryResponse[];
  notifications: AdminOrderNotification[];
  createdAt: string;
  updatedAt?: string | null;
}

export interface SetEstimatedReadyDateRequest {
  estimatedDate: string; // ISO 8601 string
}

export interface DeliverToAgencyRequest {
  provider: string;
  trackingCode: string;
  proofFile?: File | null;
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
