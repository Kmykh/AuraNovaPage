import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { CampaignDetailClient } from './CampaignDetailClient';

export const metadata: Metadata = {
  title: 'Detalle de Campaña | AuraNova Admin',
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminCampaignDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Suspense fallback={<div className="p-8 text-sage">Cargando...</div>}>
      <CampaignDetailClient campaignId={id} />
    </Suspense>
  );
}
