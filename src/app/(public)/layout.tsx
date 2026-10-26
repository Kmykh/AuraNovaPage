import React from 'react';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { LiveOverlay } from '@/components/live/LiveOverlay';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-cream text-brown">
      <LiveOverlay />
      <PublicNavbar />
      {/* overflow-x-clip (no overflow-hidden): recorta las decoraciones sin romper los elementos "sticky" */}
      <main className="flex-1 w-full overflow-x-clip">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
