import React from 'react';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { LiveOverlay } from '@/components/live/LiveOverlay';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-cream text-brown">
      <LiveOverlay />
      <PublicNavbar />
      <main className="flex-1 w-full overflow-hidden">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
