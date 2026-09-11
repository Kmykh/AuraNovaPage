export interface CreateCampaignRequest {
  name: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface UpdateCampaignRequest {
  name: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface CampaignResponse {
  id: string;
  name: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  stages: CampaignStageResponse[];
  products: CampaignProductResponse[];
}

export interface CreateCampaignStageRequest {
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface UpdateCampaignStageRequest {
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface CampaignStageResponse {
  id: string;
  campaignId: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}

export interface AddCampaignProductRequest {
  productId: string;
  isActive: boolean;
}

export interface CampaignProductResponse {
  id: string;
  campaignId: string;
  productId: string;
  productName: string;
  productImageUrl?: string | null;
  productBasePrice: number;
  isActive: boolean;
  createdAt: string;
  stagePrices: CampaignProductStagePriceResponse[];
}

export interface SetCampaignProductPriceRequest {
  price: number;
}

export interface CampaignProductStagePriceResponse {
  id: string;
  campaignProductId: string;
  campaignStageId: string;
  campaignStageName: string;
  price: number;
  createdAt: string;
}
