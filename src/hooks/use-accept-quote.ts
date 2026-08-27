import { useMutation } from '@tanstack/react-query';
import { checkoutService } from '@/services/checkout.service';

export function useAcceptQuote() {
  return useMutation<{ success: boolean; message: string }, Error, string>({
    mutationFn: (orderId: string) => checkoutService.acceptQuote(orderId),
  });
}
