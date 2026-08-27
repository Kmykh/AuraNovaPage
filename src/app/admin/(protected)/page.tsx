import React from 'react';
import { Metadata } from 'next';
import { DashboardSummary } from '@/components/admin/dashboard/DashboardSummary';

export const metadata: Metadata = {
  title: 'Dashboard | Aura Nova',
  description: 'Resumen de la actividad de Aura Nova',
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminDashboardPage() {
  return (
    <div className="py-2 sm:py-6">
      <DashboardSummary />
    </div>
  );
}
