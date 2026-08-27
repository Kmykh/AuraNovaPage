export interface PublicBusinessSettingsYape {
  holderName: string;
  qrImageUrl: string | null;
}

export interface PublicBusinessSettingsResponse {
  businessName: string;
  whatsappNumber: string;
  yape: PublicBusinessSettingsYape;
  trackingBaseUrl: string;
}

export interface AdminBusinessSettingsResponse {
  businessName: string;
  whatsappNumber: string;
  yapeHolderName: string;
  yapeQrImageUrl: string | null;
  trackingBaseUrl: string;
}

export interface UpdateBusinessSettingsRequest {
  businessName: string;
  whatsappNumber: string;
  yapeHolderName: string;
  trackingBaseUrl: string;
}
