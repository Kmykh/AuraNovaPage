import React from 'react';
import { Metadata } from 'next';
import { CampaignWizard } from './CampaignWizard';

export const metadata: Metadata = {
  title: 'Nueva Campaña | AuraNova Admin',
};

export default function NuevaCampanaPage() {
  return <CampaignWizard />;
}
