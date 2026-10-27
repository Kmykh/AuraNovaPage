"use client";

import { useAdminPayment } from '@/hooks/use-admin-payments';
import { RedirectToOrder } from '@/components/admin/shared/RedirectToOrder';

export function PaymentRedirect({ id }: { id: string }) {
  const { data, isError } = useAdminPayment(id);
  return <RedirectToOrder orderId={data?.orderId} failed={isError} />;
}
