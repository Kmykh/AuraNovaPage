"use client";

import React, { useState } from 'react';
import { useAdminBusinessSettings, useUpdateBusinessSettings } from '@/hooks/use-business-settings';
import { AdminBusinessSettingsResponse } from '@/types/business-settings';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { ApiProblemDetails } from '@/lib/api-errors';
import { AlertCircle, Building, Check, Loader2, Save, Smartphone } from 'lucide-react';

/** Datos del negocio que se muestran en la tienda: nombre, WhatsApp y usuario de TikTok. */
export function BusinessSettingsForm() {
  const { data: settings, isLoading, error, refetch } = useAdminBusinessSettings();

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-serif font-bold text-brown">Configuración</h1>
        <p className="mt-1 text-sage">Los datos del negocio, los correos a clientes y las opciones para tus productos.</p>
      </div>

      {isLoading ? (
        <Skeleton variant="rect" className="h-72 w-full rounded-[24px]" />
      ) : error || !settings ? (
        <div className="flex flex-col items-center justify-center rounded-[24px] border border-sage/15 bg-white py-16 text-center shadow-sm">
          <AlertCircle className="mb-4 h-10 w-10 text-red-400" />
          <h2 className="mb-2 font-serif text-xl font-semibold text-brown">
            {error instanceof ApiProblemDetails && error.status === 403 ? 'Acceso denegado' : 'No pudimos cargar la configuración'}
          </h2>
          <Button onClick={() => refetch()} variant="outline">Reintentar</Button>
        </div>
      ) : (
        // Se monta con los datos ya cargados: el formulario parte de lo guardado
        <SettingsForm settings={settings} />
      )}
    </div>
  );
}

function SettingsForm({ settings }: { settings: AdminBusinessSettingsResponse }) {
  const { mutate: updateSettings, isPending } = useUpdateBusinessSettings();
  const [businessName, setBusinessName] = useState(settings.businessName || '');
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber || '');
  const [tikTokUsername, setTikTokUsername] = useState(settings.tikTokUsername || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const changed = {
    businessName: businessName !== settings.businessName,
    whatsappNumber: whatsappNumber !== settings.whatsappNumber,
    tikTokUsername: tikTokUsername !== (settings.tikTokUsername || ''),
  };
  const hasChanges = changed.businessName || changed.whatsappNumber || changed.tikTokUsername;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!businessName.trim() || !whatsappNumber.trim()) {
      setErrorMsg('El nombre del negocio y el WhatsApp son obligatorios.');
      return;
    }
    updateSettings(
      { businessName: businessName.trim(), whatsappNumber: whatsappNumber.trim(), tikTokUsername: tikTokUsername.trim() || null },
      {
        onError: (err) => {
          if (err instanceof ApiProblemDetails && err.status === 409) setErrorMsg('La configuración cambió antes de guardar. Recarga e intenta de nuevo.');
          else if (err instanceof ApiProblemDetails && err.status === 400) setErrorMsg(err.detail || 'Revisa los datos: el WhatsApp debe tener 9 dígitos.');
          else setErrorMsg('No se pudo guardar. Revisa tu conexión.');
        },
      },
    );
  };

  const inputClass = (isChanged: boolean) =>
    `w-full rounded-xl border bg-white px-4 py-3 pl-11 text-brown outline-none transition-all ${
      isChanged ? 'border-gold bg-gold/5 focus:ring-2 focus:ring-gold/40' : 'border-sage/30 focus:ring-2 focus:ring-sage/20'
    }`;

  return (
    <form onSubmit={handleSubmit} className="rounded-[24px] border border-sage/15 bg-white p-5 shadow-sm sm:p-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-gold"><Building size={20} /></span>
          <div>
            <h2 className="text-lg font-bold text-brown">Datos del negocio</h2>
            <p className="text-xs text-sage">Lo que ven tus clientes en la tienda, el contacto y los avisos.</p>
          </div>
        </div>
        <button
          type="submit"
          disabled={!hasChanges || isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-[#c8a96b] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#b09355] disabled:bg-sage/15 disabled:text-sage disabled:shadow-none"
        >
          {isPending ? <Loader2 size={16} className="animate-spin" /> : hasChanges ? <Save size={16} /> : <Check size={16} />}
          {hasChanges ? 'Guardar cambios' : 'Todo guardado'}
        </button>
      </div>

      {errorMsg && (
        <p className="mb-5 flex gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-600" role="alert">
          <AlertCircle className="h-5 w-5 shrink-0" /> {errorMsg}
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <label className="block">
          <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-brown">Nombre del negocio <span className="text-rose">*</span></span>
          <span className="relative block">
            <input
              type="text"
              required
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
              disabled={isPending}
              className={inputClass(changed.businessName)}
              placeholder="Ej. Aura Nova"
            />
            <Building className={`absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 ${changed.businessName ? 'text-gold' : 'text-sage/60'}`} />
          </span>
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-brown">WhatsApp <span className="text-rose">*</span></span>
          <span className="relative block">
            <input
              type="tel"
              required
              value={whatsappNumber}
              onChange={e => setWhatsappNumber(e.target.value)}
              disabled={isPending}
              className={inputClass(changed.whatsappNumber)}
              placeholder="Ej. 959746278"
            />
            <Smartphone className={`absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 ${changed.whatsappNumber ? 'text-gold' : 'text-sage/60'}`} />
          </span>
          <span className="mt-2 block text-xs text-sage">Aparece en la tienda, el contacto y los avisos a clientes.</span>
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-brown">
            TikTok <span className="font-normal normal-case text-sage/70">(opcional)</span>
          </span>
          <span className="relative block">
            <input
              type="text"
              value={tikTokUsername}
              onChange={e => setTikTokUsername(e.target.value.replace(/^@/, ''))}
              disabled={isPending}
              className={inputClass(changed.tikTokUsername)}
              placeholder="aura.nova40"
            />
            <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-mono font-bold ${changed.tikTokUsername ? 'text-gold' : 'text-sage/60'}`}>@</span>
          </span>
          <span className="mt-2 block text-xs text-sage">Para el aviso de TikTok Live en tu web.</span>
        </label>
      </div>
    </form>
  );
}
