import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { TrackingResult } from '../TrackingClient';
import { normalizeTrackingCode } from '@/lib/tracking-code';

export const metadata: Metadata = {
  title: 'Seguimiento de pedido | Aura Nova',
  description: 'Consulta el estado de tu pedido Aura Nova.',
  // Página privada de cada cliente: no debe aparecer en buscadores
  robots: { index: false, follow: false },
};

interface TrackingCodePageProps {
  params: Promise<{ codigo: string }>;
}

export default async function TrackingCodePage({ params }: TrackingCodePageProps) {
  const { codigo } = await params;
  const raw = decodeURIComponent(codigo);
  const code = normalizeTrackingCode(raw);

  if (!code) redirect('/seguimiento?invalido=1');
  // Una sola URL por pedido: /seguimiento/K7M3-Q9XA
  if (code !== raw) redirect(`/seguimiento/${code}`);

  return (
    <div className="min-h-[80vh]">
      <TrackingResult trackingCode={code} />
    </div>
  );
}
