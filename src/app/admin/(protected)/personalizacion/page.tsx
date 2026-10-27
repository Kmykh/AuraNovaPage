import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { PersonalizationEditor } from '@/components/admin/personalization/PersonalizationEditor';

export const metadata: Metadata = {
  title: 'Personalización | Aura Nova',
  robots: { index: false, follow: false }
};

export default function PersonalizationPage() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-[24px] bg-sage/10" />}>
      <PersonalizationEditor />
    </Suspense>
  );
}
