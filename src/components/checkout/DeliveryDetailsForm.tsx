"use client";

import React from 'react';
import { AlertTriangle, CheckCircle2, Compass, Gift, Map, MapPin, Truck } from 'lucide-react';
import { DeliveryType, DeliveryZoneResponse, MeetingPointResponse } from '@/types/checkout';
import { Input } from '@/components/ui/Input';
import { formatCurrency } from '@/lib/formatters';
import { NationalShippingFields } from './NationalShippingFields';
import { DeliveryFormValue, LOCAL_DEPARTMENT, LOCAL_PROVINCE } from '@/lib/delivery-form';

interface DeliveryDetailsFormProps {
  value: DeliveryFormValue;
  onChange: (value: DeliveryFormValue) => void;
  zones?: DeliveryZoneResponse[];
  points?: MeetingPointResponse[];
  isLoadingZones?: boolean;
  isLoadingPoints?: boolean;
}

const selectClass =
  'flex h-13 w-full rounded-2xl border border-[#e8dcdc] bg-white px-5 py-3 text-sm font-medium text-[#4a3933] shadow-xs transition-all hover:border-[#c8a96b]/50 focus:border-[#c8a96b] focus:outline-none focus:ring-4 focus:ring-[#c8a96b]/15';

const OPTIONS = [
  { type: DeliveryType.Delivery, icon: Truck, title: 'Delivery', hint: 'A tu puerta en Huancayo' },
  { type: DeliveryType.MeetingPoint, icon: Compass, title: 'Punto de encuentro', hint: 'Recojo coordinado en Huancayo' },
  { type: DeliveryType.NationalShipping, icon: Map, title: 'Envío a provincias', hint: 'Shalom u Olva, todo el Perú' },
];

function FieldLabel({ htmlFor, children, hint }: { htmlFor?: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-1.5 ml-1 flex items-center justify-between gap-2">
      <label htmlFor={htmlFor} className="text-xs font-bold uppercase tracking-widest text-[#887870]">{children}</label>
      {hint && <span className="text-[10px] text-[#8f6d28]">{hint}</span>}
    </div>
  );
}

/**
 * Entrega del pedido: solo pide lo que aplica a cada modalidad. Delivery: zona y dirección (la zona ya define
 * el distrito). Punto de encuentro: el punto. Provincias: destino, agencia y DNI de quien recoge.
 */
export function DeliveryDetailsForm({ value, onChange, zones, points, isLoadingZones, isLoadingPoints }: DeliveryDetailsFormProps) {
  const set = (patch: Partial<DeliveryFormValue>) => onChange({ ...value, ...patch });
  const zone = zones?.find(z => z.id === value.zoneId);
  const point = points?.find(p => p.id === value.meetingPointId);
  const isNational = value.type === DeliveryType.NationalShipping;

  const chooseType = (type: DeliveryType) => {
    if (type === value.type) return;
    onChange({
      ...value,
      type,
      address: '',
      reference: '',
      // Huancayo para delivery y punto de encuentro; el destino se elige en provincias
      department: type === DeliveryType.NationalShipping ? '' : LOCAL_DEPARTMENT,
      province: type === DeliveryType.NationalShipping ? '' : LOCAL_PROVINCE,
      district: '',
      // Shalom es la agencia más usada: viene marcada
      agency: type === DeliveryType.NationalShipping ? value.agency || 'Shalom' : value.agency,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Modalidad de entrega">
        {OPTIONS.map(option => {
          const active = value.type === option.type;
          return (
            <button
              key={option.type}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => chooseType(option.type)}
              className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition sm:flex-col sm:items-start ${
                active ? 'border-[#c8a96b] bg-gradient-to-b from-[#fdfbf7] to-white shadow-md ring-2 ring-[#c8a96b]/20' : 'border-[#e8dcdc] bg-white/70 hover:border-[#c8a96b]/40'
              }`}
            >
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${active ? 'bg-[#c8a96b] text-white' : 'bg-[#faf7f2] text-[#887870]'}`}>
                <option.icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-serif text-base font-bold text-[#4a3933]">{option.title}</span>
                <span className="block text-xs text-[#887870]">{option.hint}</span>
              </span>
              {active && <CheckCircle2 className="h-5 w-5 shrink-0 text-[#c8a96b] sm:hidden" />}
            </button>
          );
        })}
      </div>

      <div className="space-y-5 rounded-3xl border border-[#e8dcdc]/80 bg-[#faf7f2]/90 p-5 sm:p-6">
        {value.type === DeliveryType.Delivery && (
          isLoadingZones ? (
            <div className="h-13 animate-pulse rounded-2xl bg-white" />
          ) : zones && zones.length > 0 ? (
            <>
              <div>
                <FieldLabel htmlFor="delivery-zone" hint="El costo depende de la zona">Zona de reparto *</FieldLabel>
                <select id="delivery-zone" value={value.zoneId} onChange={e => set({ zoneId: e.target.value })} className={selectClass}>
                  <option value="" disabled>Elige tu zona…</option>
                  {zones.map(z => (
                    <option key={z.id} value={z.id}>{z.name} ({z.district}) — {formatCurrency(z.cost)}</option>
                  ))}
                </select>
              </div>
              <Input
                label="Dirección exacta *"
                value={value.address}
                onChange={e => set({ address: e.target.value })}
                placeholder="Ej. Jr. Puno 450, interior 2B"
                autoComplete="street-address"
                helperText={zone ? `Debe estar dentro de ${zone.name} (${zone.district}).` : undefined}
              />
              <Input
                label="Referencia (opcional)"
                value={value.reference}
                onChange={e => set({ reference: e.target.value })}
                placeholder="Ej. Frente al parque, puerta verde, 3er piso"
                maxLength={250}
              />
            </>
          ) : (
            <p className="flex items-center gap-3 rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-600">
              <AlertTriangle className="h-5 w-5 shrink-0" /> No hay zonas de delivery disponibles ahora. Elige otra modalidad.
            </p>
          )
        )}

        {value.type === DeliveryType.MeetingPoint && (
          isLoadingPoints ? (
            <div className="h-13 animate-pulse rounded-2xl bg-white" />
          ) : points && points.length > 0 ? (
            <div>
              <FieldLabel htmlFor="meeting-point">Punto de encuentro *</FieldLabel>
              <select id="meeting-point" value={value.meetingPointId} onChange={e => set({ meetingPointId: e.target.value })} className={selectClass}>
                <option value="" disabled>Elige un punto…</option>
                {points.map(p => (
                  <option key={p.id} value={p.id}>{p.name} — {p.cost === 0 ? 'Gratis' : formatCurrency(p.cost)}</option>
                ))}
              </select>
              {point && (
                <p className="mt-3 flex items-start gap-2 rounded-2xl border border-[#c8a96b]/30 bg-white p-3.5 text-xs text-[#6d5b52]">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#c8a96b]" />
                  <span><strong>{point.name}</strong> · {point.address}. Te escribiremos para coordinar el día y la hora.</span>
                </p>
              )}
            </div>
          ) : (
            <p className="flex items-center gap-3 rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-600">
              <AlertTriangle className="h-5 w-5 shrink-0" /> No hay puntos de encuentro disponibles ahora. Elige otra modalidad.
            </p>
          )
        )}

        {isNational && (
          <>
            <NationalShippingFields value={value} set={set} />
            {!value.isGift && (
              <Input
                label="Tu DNI *"
                inputMode="numeric"
                maxLength={8}
                value={value.recipientDocument}
                onChange={e => set({ recipientDocument: e.target.value.replace(/\D/g, '') })}
                placeholder="8 dígitos"
                helperText="La agencia lo pide para entregarte el paquete."
              />
            )}
          </>
        )}

        {/* ¿Quién recibe? */}
        <div className="rounded-2xl border border-[#e8dcdc] bg-white p-4">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={value.isGift}
              onChange={e => set({ isGift: e.target.checked })}
              className="h-5 w-5 rounded border-[#e8dcdc] accent-[#c8a96b]"
            />
            <span className="flex items-center gap-2 text-sm font-semibold text-[#4a3933]">
              <Gift className="h-4 w-4 text-[#d38b8b]" />
              {isNational ? 'Lo recoge otra persona' : 'Es un regalo: lo recibe otra persona'}
            </span>
          </label>
          {value.isGift && (
            <div className={`mt-4 grid grid-cols-1 gap-4 ${isNational ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
              <Input label="Nombre de quien recibe *" value={value.recipientName} onChange={e => set({ recipientName: e.target.value })} placeholder="Ej. Ana Pérez" maxLength={120} />
              <Input
                label="Su celular *"
                type="tel"
                inputMode="numeric"
                maxLength={9}
                value={value.recipientPhone}
                onChange={e => set({ recipientPhone: e.target.value.replace(/\D/g, '') })}
                placeholder="987654321"
              />
              {isNational && (
                <Input
                  label="Su DNI *"
                  inputMode="numeric"
                  maxLength={8}
                  value={value.recipientDocument}
                  onChange={e => set({ recipientDocument: e.target.value.replace(/\D/g, '') })}
                  placeholder="8 dígitos"
                />
              )}
            </div>
          )}
          {value.isGift && !isNational && (
            <p className="mt-3 text-xs text-[#887870]">Coordinamos con esa persona la entrega para que la sorpresa salga perfecta.</p>
          )}
        </div>
      </div>
    </div>
  );
}
