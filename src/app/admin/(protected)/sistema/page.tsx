import React from 'react';
import { Metadata } from 'next';
import { Wrench } from 'lucide-react';
import { WebhookHealthCard } from '@/components/admin/system/WebhookHealthCard';
import { EmailSettingsCard } from '@/components/admin/system/EmailSettingsCard';

export const metadata: Metadata = {
  title: 'Sistema | Aura Nova',
  robots: { index: false, follow: false }
};

/** Solo el SuperAdmin (desarrollador): conexiones con Mercado Pago y el correo. */
export default function SystemPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="flex items-center gap-2 font-serif text-2xl font-bold text-brown">
          <Wrench className="text-gold" /> Sistema
        </h1>
        <p className="mt-1 text-sage">Estado de las conexiones. Solo lo ves tú como SuperAdmin; el equipo no necesita esta sección.</p>
      </div>
      <WebhookHealthCard />
      <EmailSettingsCard />
    </div>
  );
}
