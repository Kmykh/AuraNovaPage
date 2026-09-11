import React from 'react';
import { Metadata } from 'next';
import { CampaignsListClient } from './CampaignsListClient';

export const metadata: Metadata = {
  title: 'Campañas | AuraNova Admin',
};

export default function AdminCampaignsPage() {
  return <CampaignsListClient />;
}
