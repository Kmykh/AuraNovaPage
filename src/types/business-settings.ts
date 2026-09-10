export interface PublicBusinessSettingsYape {
  holderName: string;
  qrImageUrl: string | null;
}

export interface PublicBusinessSettingsResponse {
  businessName: string;
  whatsappNumber: string;
  yape: PublicBusinessSettingsYape;
}

export interface AdminBusinessSettingsResponse {
  businessName: string;
  whatsappNumber: string;
  yapeHolderName: string;
  yapeQrImageUrl: string | null;
}

export interface UpdateBusinessSettingsRequest {
  businessName: string;
  whatsappNumber: string;
  yapeHolderName: string;
}
