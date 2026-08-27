import { PaymentMethod, PaymentStatus } from './enums';

export interface PaymentInfoResponse {
  enabled: boolean;
  method: string;
  holderName: string;
  qrImageUrl: string | null;
  businessName: string;
  phoneNumber?: string; // Adding it optional just in case
}

export interface PaymentResponse {
  id: string;
  orderId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  evidenceUrl: string | null;
  createdAt: string;
}

export interface AdminPaymentResponse {
  id: string;
  orderId: string;
  orderCode: string;
  customerName: string;
  customerPhone?: string;
  method: PaymentMethod | string;
  status: PaymentStatus | string;
  amount: number;
  evidenceUrl?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  verifiedAt?: string | null;
}

export interface AdminPaymentDetailResponse extends AdminPaymentResponse {
  confirmedAt?: string | null;
}

export interface RejectPaymentRequest {
  notes?: string;
}
