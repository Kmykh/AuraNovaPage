import React from 'react';
import MaintenanceScreen from '@/components/shared/MaintenanceScreen';

export default function Layout({ children }: { children: React.ReactNode }) {
  if (process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true') {
    return <MaintenanceScreen />;
  }
  
  return <>{children}</>;
}
