import React from 'react';
import { Metadata } from 'next';
import { AdminAuditLogsList } from '@/components/admin/audit/AdminAuditLogsList';

export const metadata: Metadata = {
  title: 'Auditoría | Aura Nova',
  description: 'Módulo de auditoría administrativa de Aura Nova',
  robots: { index: false, follow: false }
};

export default function AuditLogsPage() {
  return (
    <div className="py-6">
      <AdminAuditLogsList />
    </div>
  );
}
