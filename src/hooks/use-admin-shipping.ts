import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminShippingService } from '@/services/admin-shipping.service';
import {
  CreateDeliveryZoneRequest,
  UpdateDeliveryZoneRequest,
  CreateMeetingPointRequest,
  UpdateMeetingPointRequest
} from '@/types/admin-shipping';
import { toast } from 'sonner';

// --- Delivery Zones Hooks ---

export function useAdminDeliveryZones() {
  return useQuery({
    queryKey: ['admin-delivery-zones'],
    queryFn: AdminShippingService.getDeliveryZones,
  });
}

export function useCreateDeliveryZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDeliveryZoneRequest) => AdminShippingService.createDeliveryZone(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-delivery-zones'] });
    }
  });
}

export function useUpdateDeliveryZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDeliveryZoneRequest }) => 
      AdminShippingService.updateDeliveryZone(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-delivery-zones'] });
    }
  });
}

export function useToggleDeliveryZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => AdminShippingService.toggleDeliveryZoneAvailability(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-delivery-zones'] });
      // Invalidate public query too, so checkout updates immediately
      queryClient.invalidateQueries({ queryKey: ['delivery-zones'] });
    }
  });
}

// --- Meeting Points Hooks ---

export function useAdminMeetingPoints() {
  return useQuery({
    queryKey: ['admin-meeting-points'],
    queryFn: AdminShippingService.getMeetingPoints,
  });
}

export function useCreateMeetingPoint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMeetingPointRequest) => AdminShippingService.createMeetingPoint(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-meeting-points'] });
    }
  });
}

export function useUpdateMeetingPoint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMeetingPointRequest }) => 
      AdminShippingService.updateMeetingPoint(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-meeting-points'] });
    }
  });
}

export function useToggleMeetingPoint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => AdminShippingService.toggleMeetingPointAvailability(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-meeting-points'] });
      // Invalidate public query too, so checkout updates immediately
      queryClient.invalidateQueries({ queryKey: ['meeting-points'] });
    }
  });
}
