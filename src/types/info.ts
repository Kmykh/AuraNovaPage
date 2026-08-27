export interface PaymentInfoResponse {
  yape?: {
    method: number;
    holderName: string;
    phoneNumber?: string;
    qrImageUrl: string | null;
  };
}

export interface PublicBusinessSettingsResponse {
  businessName: string;
  whatsappNumber: string;
  yape?: {
    holderName: string;
    qrImageUrl: string | null;
  };
  trackingBaseUrl: string;
}
