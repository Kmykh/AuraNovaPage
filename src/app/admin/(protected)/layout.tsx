"use client";

import React, { useState } from 'react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminHeader } from '@/components/layout/AdminHeader';

import { AdminRouteGuard } from '@/components/admin/AdminRouteGuard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AdminRouteGuard>
      <div className="flex h-screen bg-[#FAFAFA] overflow-hidden font-sans">
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <div className="flex flex-1 flex-col overflow-hidden">
          <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
          
          <main className="flex-1 overflow-y-auto bg-cream/10 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminRouteGuard>
  );
}
