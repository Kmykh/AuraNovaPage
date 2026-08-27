export enum DeliveryType {
  Delivery = 0,
  MeetingPoint = 1,
  NationalShipping = 2,
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
  Cancelled = 9,
}

export enum QuoteStatus {
  Pending = 0,
  Ready = 1,
  Rejected = 2,
}

export enum PaymentMethod {
  Yape = 0,
}

export enum PaymentStatus {
  Pending = 0,
  Reported = 1,
  Confirmed = 2,
  Rejected = 3,
}

export enum NotificationType {
  OrderCreated = 0,
  QuoteReady = 1,
  PaymentReported = 2,
  PaymentConfirmed = 3,
  PaymentRejected = 4,
  OrderPreparing = 5,
  OrderReady = 6,
  OrderShipped = 7,
  OrderDelivered = 8,
  OrderCancelled = 9,
}

export enum NotificationChannel {
  WhatsApp = 0,
}

export enum NotificationStatus {
  Generated = 0,
  Opened = 1,
  Sent = 2,
  Failed = 3,
}
