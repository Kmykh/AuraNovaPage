import { useQuery, useMutation } from '@tanstack/react-query';
import { paymentsService } from '@/services/payments.service';
import { PaymentResponse } from '@/types/payments';

export function usePaymentInfo() {
  return useQuery({
    queryKey: ['payment-info'],
    queryFn: paymentsService.getPaymentInfo,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUploadPaymentEvidence() {
  return useMutation<PaymentResponse, Error, { orderId: string; file: File; onProgress?: (percent: number) => void }>({
    mutationFn: ({ orderId, file, onProgress }) => paymentsService.uploadPaymentEvidence(orderId, file, onProgress),
  });
}
