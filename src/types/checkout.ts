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
  DeliveredToAgency = 9,
  Cancelled = 10
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
  selectedColors?: string[];
  selectedFlowerTypes?: string[];
  selectedPrimaryColor?: string | null;
  selectedSecondaryColor?: string | null;
  selectedFlowerType?: string | null;
  selectedFlowerColor?: string | null;
  /** Claves de los accesorios; sin la lista el backend usa hasLights/hasButterfly */
  selectedAccessories?: string[];
  hasLights?: boolean;
  hasButterfly?: boolean;
  hasPhraseCard?: boolean;
  phraseText?: string | null;
  phraseFont?: string | null;
  phraseTo?: string | null;
  phraseFrom?: string | null;
  /** marfil, rosa, pergamino, noir, salvia o foto */
  phraseTheme?: string | null;
  /** Foto propia de fondo (data URL comprimida). El servidor la guarda en privado. */
  cardBackgroundImage?: string | null;
}

export interface CreateOrderDeliveryRequest {
  type: string;
  deliveryZoneId?: string;
  meetingPointId?: string;
  deliveryAddress?: string;
  department?: string;
  province?: string;
  district?: string;
  /** Quién recibe (regalos) y datos para la agencia en envíos nacionales */
  recipientName?: string;
  recipientPhone?: string;
  /** DNI u otro documento de quien recoge en la agencia */
  recipientDocument?: string;
  deliveryReference?: string;
  /** Shalom u Olva */
  preferredAgency?: string;
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
