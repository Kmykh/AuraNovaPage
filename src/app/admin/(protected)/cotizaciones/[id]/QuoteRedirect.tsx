"use client";

import { useAdminQuote } from '@/hooks/use-admin-quotes';
import { RedirectToOrder } from '@/components/admin/shared/RedirectToOrder';

export function QuoteRedirect({ id }: { id: string }) {
  const { data, isError } = useAdminQuote(id);
  return <RedirectToOrder orderId={data?.orderId} failed={isError} />;
}
