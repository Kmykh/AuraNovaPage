import { useQuery, useMutation } from '@tanstack/react-query';
import { checkoutService } from '@/services/checkout.service';
import { CreateOrderRequest, CreateOrderResponse } from '@/types/checkout';

export function useDeliveryZones() {
  return useQuery({
    queryKey: ['delivery-zones'],
    queryFn: checkoutService.getDeliveryZones,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useMeetingPoints() {
  return useQuery({
    queryKey: ['meeting-points'],
    queryFn: checkoutService.getMeetingPoints,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateOrder() {
  return useMutation<CreateOrderResponse, Error, CreateOrderRequest>({
    mutationFn: (data: CreateOrderRequest) => checkoutService.createOrder(data),
  });
}
