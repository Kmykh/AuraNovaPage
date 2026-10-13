import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { TrackingSearchForm } from '@/components/tracking/TrackingSearchForm';
import { normalizeTrackingCode } from '@/lib/tracking-code';

export const metadata: Metadata = {
  title: 'Seguimiento de pedido | Aura Nova',
  description: 'Consulta el estado de tu pedido Aura Nova con tu código de seguimiento.',
};

interface SeguimientoPageProps {
  searchParams: Promise<{
    code?: string;
    token?: string;
    codigo?: string;
    invalido?: string;
  }>;
}

export default async function SeguimientoPage({ searchParams }: SeguimientoPageProps) {
  const params = await searchParams;

  // Enlaces anteriores (?code=…&token=…): el token es el código de seguimiento
  const fromLink = normalizeTrackingCode(params.codigo ?? params.token);
  if (fromLink) redirect(`/seguimiento/${fromLink}`);

  return (
    <div className="min-h-[80vh]">
      <TrackingSearchForm invalidCode={params.invalido === '1'} />
    </div>
  );
}
