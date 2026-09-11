import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CampaignsService } from '../services/campaigns.service';
import { 
  CreateCampaignRequest, 
  UpdateCampaignRequest,
  CreateCampaignStageRequest,
  UpdateCampaignStageRequest,
  AddCampaignProductRequest,
  SetCampaignProductPriceRequest
} from '../types/campaigns';

export function useAdminCampaigns() {
  return useQuery({
    queryKey: ['admin-campaigns'],
    queryFn: CampaignsService.getAll,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useCampaignDetail(id: string) {
  return useQuery({
    queryKey: ['admin-campaign', id],
    queryFn: () => CampaignsService.getById(id),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!id,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCampaignRequest) => CampaignsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
    },
  });
}

export function useUpdateCampaign(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateCampaignRequest) => CampaignsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['admin-campaign', id] });
    },
  });
}

export function useToggleCampaignStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => CampaignsService.toggleStatus(id, isActive),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['admin-campaign', variables.id] });
    },
  });
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => CampaignsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
    },
  });
}

// --- Stages Mutations ---

export function useAddCampaignStage(campaignId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCampaignStageRequest) => CampaignsService.addStage(campaignId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaign', campaignId] });
    },
  });
}

export function useUpdateCampaignStage(campaignId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ stageId, data }: { stageId: string; data: UpdateCampaignStageRequest }) => CampaignsService.updateStage(campaignId, stageId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaign', campaignId] });
    },
  });
}

export function useDeleteCampaignStage(campaignId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (stageId: string) => CampaignsService.deleteStage(campaignId, stageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaign', campaignId] });
    },
  });
}

// --- Products Mutations ---

export function useAddCampaignProduct(campaignId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AddCampaignProductRequest) => CampaignsService.addProduct(campaignId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaign', campaignId] });
    },
  });
}

export function useRemoveCampaignProduct(campaignId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => CampaignsService.removeProduct(campaignId, productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaign', campaignId] });
    },
  });
}

// --- Product Stage Prices Mutations ---

export function useSetCampaignProductPrice(campaignId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, stageId, data }: { productId: string; stageId: string; data: SetCampaignProductPriceRequest }) => 
      CampaignsService.setProductStagePrice(campaignId, productId, stageId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaign', campaignId] });
    },
  });
}
