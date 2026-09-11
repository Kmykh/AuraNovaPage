import React from 'react';
import { Metadata } from 'next';
import { CampaignWizard } from '../../nueva/CampaignWizard';

export const metadata: Metadata = {
  title: 'Editar Campaña | AuraNova Admin',
};

export default async function EditarCampanaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CampaignWizard mode="edit" campaignId={id} />;
}
