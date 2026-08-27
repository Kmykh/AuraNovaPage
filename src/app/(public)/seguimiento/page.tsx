import React from 'react';
import { Metadata } from 'next';
import { TrackingClient } from './TrackingClient';

export const metadata: Metadata = {
  title: 'Seguimiento de pedido | Aura Nova',
  description: 'Consulta el estado de tu pedido Aura Nova.',
};

interface SeguimientoPageProps {
  searchParams: Promise<{
    code?: string;
    token?: string;
  }>;
}

export default async function SeguimientoPage({ searchParams }: SeguimientoPageProps) {
  const params = await searchParams;
  const initialCode = params.code || '';
  const initialToken = params.token || '';

  return (
    <div className="min-h-[80vh]">
      <TrackingClient initialCode={initialCode} initialToken={initialToken} />
    </div>
  );
}
