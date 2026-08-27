export interface DeliveryZoneAdminResponse {
  id: string;
  name: string;
  district: string;
  cost: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface MeetingPointAdminResponse {
  id: string;
  name: string;
  address: string;
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

export interface CreateMeetingPointRequest {
  name: string;
  address: string;
  cost: number;
}

export interface UpdateMeetingPointRequest {
  name: string;
  address: string;
  cost: number;
}
