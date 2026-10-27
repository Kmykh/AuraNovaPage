"use client";

import React, { useState } from 'react';
import { Check, Map, MapPin, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateDeliveryZone, useCreateMeetingPoint, useUpdateDeliveryZone, useUpdateMeetingPoint } from '@/hooks/use-admin-shipping';
import { DeliveryZoneAdminResponse, MeetingPointAdminResponse } from '@/types/admin-shipping';
import { formatCurrency } from '@/lib/formatters';
import { CostPicker, PanelActions, PanelField, panelInput, SidePanel } from '../shared/SidePanel';

const DISTRICT_SUGGESTIONS = ['Huancayo', 'El Tambo', 'Chilca', 'Pilcomayo', 'Huancán', 'Sapallanga', 'San Jerónimo', 'San Agustín de Cajas'];

const splitDistricts = (value: string) => value.split(',').map(d => d.trim()).filter(Boolean);

/** Cómo aparece la opción al pagar (misma idea que la tarjeta del checkout). */
function CustomerPreview({ icon: Icon, title, detail, cost }: { icon: React.ElementType; title: string; detail: string; cost: number | null }) {
  return (
    <div className="rounded-2xl border border-gold/25 bg-gradient-to-br from-[#fffdf8] to-[#faf4ea] p-4">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Así lo ve el cliente al pagar</p>
      <div className="flex items-center gap-3 rounded-xl border-2 border-[#c8a96b] bg-white p-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fdf8ee] text-[#b08a4e]"><Icon size={17} /></span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-bold text-brown">{title || 'Nombre'}</span>
          <span className="block truncate text-xs text-sage">{detail || '—'}</span>
        </span>
        <span className={`shrink-0 text-sm font-bold ${cost === 0 ? 'text-emerald-700' : 'text-brown'}`}>
          {cost === null ? 'S/ —' : cost === 0 ? 'Gratis' : formatCurrency(cost)}
        </span>
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#c8a96b] text-white"><Check size={12} strokeWidth={3} /></span>
      </div>
    </div>
  );
}

/* ───────────────────────── Zona de delivery ───────────────────────── */

export function DeliveryZonePanel({ isOpen, zone, onClose }: { isOpen: boolean; zone: DeliveryZoneAdminResponse | null; onClose: () => void }) {
  // Se vuelve a montar al cambiar de zona: el formulario parte de sus datos
  return (
    <SidePanel
      isOpen={isOpen}
      onClose={onClose}
      icon={MapPin}
      title={zone ? 'Editar zona de delivery' : 'Nueva zona de delivery'}
      subtitle="Los distritos que cubre y lo que paga el cliente por el envío."
    >
      <ZoneForm key={zone?.id ?? 'new'} zone={zone} onClose={onClose} />
    </SidePanel>
  );
}

function ZoneForm({ zone, onClose }: { zone: DeliveryZoneAdminResponse | null; onClose: () => void }) {
  const [name, setName] = useState(zone?.name ?? '');
  const [districts, setDistricts] = useState<string[]>(zone ? splitDistricts(zone.district) : []);
  const [districtInput, setDistrictInput] = useState('');
  const [cost, setCost] = useState(zone ? zone.cost.toFixed(2) : '');
  const [submitted, setSubmitted] = useState(false);
  const [keepOpen, setKeepOpen] = useState(false);
  const { mutate: create, isPending: creating } = useCreateDeliveryZone();
  const { mutate: update, isPending: updating } = useUpdateDeliveryZone();
  const saving = creating || updating;

  const addDistrict = (raw: string) => {
    const value = raw.replace(/,/g, '').trim();
    if (!value || districts.some(d => d.toLowerCase() === value.toLowerCase())) return;
    setDistricts(prev => [...prev, value]);
    // La primera zona suele llamarse como su distrito
    if (!name.trim() && districts.length === 0) setName(value);
    setDistrictInput('');
  };

  const costValue = cost.trim() === '' ? null : parseFloat(cost);
  const errors = {
    name: !name.trim() ? 'Ponle un nombre a la zona.' : null,
    districts: districts.length === 0 ? 'Agrega al menos un distrito.' : null,
    cost: costValue === null || isNaN(costValue) || costValue < 0 ? 'Elige el costo del envío (puede ser gratis).' : null,
  };
  const valid = !errors.name && !errors.districts && !errors.cost;

  const save = () => {
    setSubmitted(true);
    if (!valid) return;
    const data = { name: name.trim(), district: districts.join(', '), cost: costValue! };
    const done = {
      onSuccess: () => {
        toast.success(zone ? 'Zona actualizada' : `Zona "${data.name}" creada`);
        if (keepOpen) {
          setName(''); setDistricts([]); setCost(''); setSubmitted(false);
        } else onClose();
      },
      onError: () => toast.error('No se pudo guardar la zona. Intenta de nuevo.'),
    };
    if (zone) update({ id: zone.id, data }, done);
    else create(data, done);
  };

  return (
    <>
      <form id="shipping-form" onSubmit={e => { e.preventDefault(); save(); }} className="space-y-5 pb-24 sm:pb-20">
        <PanelField label="Distritos que cubre" htmlFor="zone-district" error={submitted ? errors.districts : null} hint="Escribe y presiona Enter, o toca una sugerencia.">
          <div className="rounded-xl border border-sage/20 bg-white p-2 focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/20">
            <div className="flex flex-wrap gap-1.5">
              {districts.map(d => (
                <span key={d} className="inline-flex items-center gap-1 rounded-lg bg-gold/10 py-1 pl-2.5 pr-1 text-xs font-semibold text-brown">
                  {d}
                  <button type="button" onClick={() => setDistricts(prev => prev.filter(x => x !== d))} className="rounded p-0.5 text-sage hover:text-rose-600" aria-label={`Quitar ${d}`}>
                    <X size={12} />
                  </button>
                </span>
              ))}
              <input
                id="zone-district"
                value={districtInput}
                onChange={e => {
                  if (e.target.value.endsWith(',')) addDistrict(e.target.value);
                  else setDistrictInput(e.target.value);
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') { e.preventDefault(); addDistrict(districtInput); }
                  if (e.key === 'Backspace' && !districtInput && districts.length) setDistricts(prev => prev.slice(0, -1));
                }}
                onBlur={() => districtInput && addDistrict(districtInput)}
                placeholder={districts.length ? 'Otro distrito…' : 'Ej. El Tambo'}
                className="min-w-[8rem] flex-1 bg-transparent px-1.5 py-1 text-sm text-brown outline-none placeholder:text-sage/50"
              />
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {DISTRICT_SUGGESTIONS.filter(s => !districts.some(d => d.toLowerCase() === s.toLowerCase())).map(s => (
              <button key={s} type="button" onClick={() => addDistrict(s)} className="inline-flex items-center gap-1 rounded-full border border-dashed border-sage/30 px-2.5 py-1 text-[11px] font-medium text-sage hover:border-gold hover:text-brown">
                <Plus size={11} /> {s}
              </button>
            ))}
          </div>
        </PanelField>

        <PanelField label="Nombre de la zona" htmlFor="zone-name" error={submitted ? errors.name : null} hint="Es lo que el cliente elige al pagar.">
          <input id="zone-name" value={name} onChange={e => setName(e.target.value)} maxLength={80} placeholder="Ej. El Tambo y alrededores" className={panelInput} />
        </PanelField>

        <PanelField label="Costo del envío" htmlFor="zone-cost" error={submitted ? errors.cost : null}>
          <CostPicker id="zone-cost" value={cost} onChange={setCost} presets={[0, 5, 7, 10, 12, 15]} />
        </PanelField>

        <CustomerPreview icon={MapPin} title={name.trim()} detail={districts.join(', ')} cost={costValue !== null && !isNaN(costValue) ? costValue : null} />
      </form>
      <PanelActions saving={saving} label={zone ? 'Guardar cambios' : 'Crear zona'} onCancel={onClose} onSave={save} {...(zone ? {} : { keepOpen, onKeepOpen: setKeepOpen })} />
    </>
  );
}

/* ───────────────────────── Punto de encuentro ───────────────────────── */

export function MeetingPointPanel({ isOpen, point, onClose }: { isOpen: boolean; point: MeetingPointAdminResponse | null; onClose: () => void }) {
  return (
    <SidePanel
      isOpen={isOpen}
      onClose={onClose}
      icon={Map}
      title={point ? 'Editar punto de encuentro' : 'Nuevo punto de encuentro'}
      subtitle="Un lugar conocido donde el cliente recoge su pedido."
    >
      <PointForm key={point?.id ?? 'new'} point={point} onClose={onClose} />
    </SidePanel>
  );
}

function PointForm({ point, onClose }: { point: MeetingPointAdminResponse | null; onClose: () => void }) {
  const [name, setName] = useState(point?.name ?? '');
  const [address, setAddress] = useState(point?.address ?? '');
  const [cost, setCost] = useState(point ? point.cost.toFixed(2) : '0.00');
  const [submitted, setSubmitted] = useState(false);
  const [keepOpen, setKeepOpen] = useState(false);
  const { mutate: create, isPending: creating } = useCreateMeetingPoint();
  const { mutate: update, isPending: updating } = useUpdateMeetingPoint();
  const saving = creating || updating;

  const costValue = cost.trim() === '' ? null : parseFloat(cost);
  const errors = {
    name: !name.trim() ? 'Ponle un nombre al punto.' : null,
    address: !address.trim() ? 'Escribe la dirección o una referencia clara.' : null,
    cost: costValue === null || isNaN(costValue) || costValue < 0 ? 'Elige el costo (puede ser gratis).' : null,
  };
  const valid = !errors.name && !errors.address && !errors.cost;

  const save = () => {
    setSubmitted(true);
    if (!valid) return;
    const data = { name: name.trim(), address: address.trim(), cost: costValue! };
    const done = {
      onSuccess: () => {
        toast.success(point ? 'Punto actualizado' : `Punto "${data.name}" creado`);
        if (keepOpen) {
          setName(''); setAddress(''); setCost('0.00'); setSubmitted(false);
        } else onClose();
      },
      onError: () => toast.error('No se pudo guardar el punto. Intenta de nuevo.'),
    };
    if (point) update({ id: point.id, data }, done);
    else create(data, done);
  };

  return (
    <>
      <form id="shipping-form" onSubmit={e => { e.preventDefault(); save(); }} className="space-y-5 pb-24 sm:pb-20">
        <PanelField label="Nombre" htmlFor="point-name" error={submitted ? errors.name : null} hint="Un lugar que todos ubiquen: un parque, un centro comercial…">
          <input id="point-name" value={name} onChange={e => setName(e.target.value)} maxLength={80} placeholder="Ej. Parque Huamanmarca" className={panelInput} autoFocus={!point} />
        </PanelField>
        <PanelField label="Dirección o referencia" htmlFor="point-address" error={submitted ? errors.address : null}>
          <input id="point-address" value={address} onChange={e => setAddress(e.target.value)} maxLength={200} placeholder="Ej. Frente a la catedral, Jr. Puno" className={panelInput} />
        </PanelField>
        <PanelField label="Costo para el cliente" htmlFor="point-cost" error={submitted ? errors.cost : null}>
          <CostPicker id="point-cost" value={cost} onChange={setCost} presets={[0, 3, 5]} />
        </PanelField>
        <CustomerPreview icon={Map} title={name.trim()} detail={address.trim()} cost={costValue !== null && !isNaN(costValue) ? costValue : null} />
      </form>
      <PanelActions saving={saving} label={point ? 'Guardar cambios' : 'Crear punto'} onCancel={onClose} onSave={save} {...(point ? {} : { keepOpen, onKeepOpen: setKeepOpen })} />
    </>
  );
}
