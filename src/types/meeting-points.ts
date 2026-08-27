export interface MeetingPointResponse {
  id: string;
  name: string;
  address: string;
  cost: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
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
