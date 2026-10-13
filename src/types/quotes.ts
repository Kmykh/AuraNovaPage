import { QuoteStatus, DeliveryType } from './enums';

export interface QuoteResponse {
  quoteId: string;
  orderId: string;
  orderCode: string;
  status: QuoteStatus;
  shippingCost: number | null;
  customizationCost?: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string | null;
  customerName?: string;
  customerPhone?: string;
  deliveryType?: 'Delivery' | 'MeetingPoint' | 'NationalShipping' | string;
  isCustomOrder?: boolean;
  referenceImageUrl?: string | null;
  customizationNotes?: string | null;
  // Brief del pedido personalizado (URLs firmadas y temporales)
  referenceImages?: string[];
  referenceLinks?: string[];
  desiredDate?: string | null;
  occasion?: string | null;
  budgetRange?: string | null;
}

export interface UpdateQuoteRequest {
  shippingCost: number;
  customizationCost?: number;
  notes?: string;
}
