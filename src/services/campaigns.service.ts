import { apiClient } from '../lib/api-client';
import { 
  CampaignResponse, 
  CreateCampaignRequest, 
  UpdateCampaignRequest,
  CampaignStageResponse,
  CreateCampaignStageRequest,
  UpdateCampaignStageRequest,
  CampaignProductResponse,
  AddCampaignProductRequest,
  CampaignProductStagePriceResponse,
  SetCampaignProductPriceRequest
} from '../types/campaigns';

export const CampaignsService = {
  // --- Campaigns ---
  getAll: async (): Promise<CampaignResponse[]> => {
    const { data } = await apiClient.get<CampaignResponse[]>('/api/admin/campaigns');
    return data;
  },
  
  getById: async (id: string): Promise<CampaignResponse> => {
    const { data } = await apiClient.get<CampaignResponse>(`/api/admin/campaigns/${id}`);
    return data;
  },

  create: async (request: CreateCampaignRequest): Promise<CampaignResponse> => {
    const { data } = await apiClient.post<CampaignResponse>('/api/admin/campaigns', request);
    return data;
  },

  update: async (id: string, request: UpdateCampaignRequest): Promise<CampaignResponse> => {
    const { data } = await apiClient.put<CampaignResponse>(`/api/admin/campaigns/${id}`, request);
    return data;
  },

  toggleStatus: async (id: string, isActive: boolean): Promise<void> => {
    await apiClient.patch(`/api/admin/campaigns/${id}/toggle-status`, isActive, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/admin/campaigns/${id}`);
  },

  // --- Stages ---
  addStage: async (campaignId: string, request: CreateCampaignStageRequest): Promise<CampaignStageResponse> => {
    const { data } = await apiClient.post<CampaignStageResponse>(`/api/admin/campaigns/${campaignId}/stages`, request);
    return data;
  },

  updateStage: async (campaignId: string, stageId: string, request: UpdateCampaignStageRequest): Promise<CampaignStageResponse> => {
    const { data } = await apiClient.put<CampaignStageResponse>(`/api/admin/campaigns/${campaignId}/stages/${stageId}`, request);
    return data;
  },

  deleteStage: async (campaignId: string, stageId: string): Promise<void> => {
    await apiClient.delete(`/api/admin/campaigns/${campaignId}/stages/${stageId}`);
  },

  // --- Products ---
  addProduct: async (campaignId: string, request: AddCampaignProductRequest): Promise<CampaignProductResponse> => {
    const { data } = await apiClient.post<CampaignProductResponse>(`/api/admin/campaigns/${campaignId}/products`, request);
    return data;
  },

  removeProduct: async (campaignId: string, productId: string): Promise<void> => {
    await apiClient.delete(`/api/admin/campaigns/${campaignId}/products/${productId}`);
  },

  // --- Stage Prices ---
  setProductStagePrice: async (campaignId: string, productId: string, stageId: string, request: SetCampaignProductPriceRequest): Promise<CampaignProductStagePriceResponse> => {
    const { data } = await apiClient.post<CampaignProductStagePriceResponse>(`/api/admin/campaigns/${campaignId}/products/${productId}/stages/${stageId}/price`, request);
    return data;
  }
};
