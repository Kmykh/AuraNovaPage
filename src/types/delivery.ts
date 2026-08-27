export interface DeliveryZoneResponse {
  id: string;
  name: string;
  district: string;
  cost: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateDeliveryZoneRequest {
  name: string;
  district: string;
  cost: number;
}

export interface UpdateDeliveryZoneRequest {
  name: string;
  district: string;
  cost: number;
}

export interface UpdateAvailabilityRequest {
  isActive: boolean;
}
