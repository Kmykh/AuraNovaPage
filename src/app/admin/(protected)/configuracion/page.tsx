import React from 'react';
import { Metadata } from 'next';
import { BusinessSettingsForm } from '@/components/admin/settings/BusinessSettingsForm';

export const metadata: Metadata = {
  title: 'Configuración de Negocio | Aura Nova',
  description: 'Administración central de Aura Nova',
  robots: { index: false, follow: false }
};

export default function BusinessSettingsPage() {
  return (
    <div className="py-6">
      <BusinessSettingsForm />
    </div>
  );
}
