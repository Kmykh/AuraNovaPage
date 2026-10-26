"use client";

import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, Loader2, MapPin, Search, Wallet } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { PERU_DEPARTMENTS, SHIPPING_AGENCIES, ShippingAgency, loadUbigeo, normalizeText, searchDistricts } from '@/lib/peru';
import { DeliveryFormValue } from '@/lib/delivery-form';

const selectClass =
  'flex h-12 w-full rounded-2xl border border-[#e8dcdc] bg-white px-4 text-sm font-medium text-[#4a3933] transition hover:border-[#c8a96b]/50 focus:border-[#c8a96b] focus:outline-none focus:ring-4 focus:ring-[#c8a96b]/15 disabled:bg-[#faf7f2] disabled:text-[#b7a9a0]';

const AGENCY_HINT: Record<ShippingAgency, string> = {
  Shalom: 'Recojo en su agencia',
  Olva: 'Recojo en agencia o a domicilio',
};

interface Props {
  value: DeliveryFormValue;
  set: (patch: Partial<DeliveryFormValue>) => void;
}

/**
 * Envío a provincias como lo pide el cliente ("por Shalom a Carabayllo"): agencia, destino buscando
 * el distrito y, si la sabe, la sucursal. Hoy paga sus detalles; el envío lo paga al recoger.
 */
export function NationalShippingFields({ value, set }: Props) {
  const { data: ubigeo, isLoading } = useQuery({ queryKey: ['ubigeo-pe'], queryFn: loadUbigeo, staleTime: Infinity });
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const matches = useMemo(() => (ubigeo && isSearching ? searchDistricts(ubigeo, query) : []), [ubigeo, query, isSearching]);
  const provinces = ubigeo && value.department ? Object.keys(ubigeo[value.department] ?? {}) : [];
  const districts = ubigeo && value.department && value.province ? ubigeo[value.department]?.[value.province] ?? [] : [];
  const destination = value.district && value.province && value.department
    ? `${value.district}, ${value.province}${normalizeText(value.province) === normalizeText(value.department) ? '' : ` (${value.department})`}`
    : null;

  return (
    <div className="space-y-5">
      {/* 1. Agencia */}
      <div>
        <p className="mb-2 ml-1 text-xs font-bold uppercase tracking-widest text-[#887870]">¿Por qué agencia?</p>
        <div className="grid grid-cols-2 gap-2.5" role="radiogroup" aria-label="Agencia de envío">
          {SHIPPING_AGENCIES.map(agency => {
            const active = value.agency === agency;
            return (
              <button
                key={agency}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => set({ agency })}
                className={`flex items-center justify-between gap-2 rounded-2xl border p-3.5 text-left transition ${
                  active ? 'border-[#c8a96b] bg-white shadow-sm ring-2 ring-[#c8a96b]/20' : 'border-[#e8dcdc] bg-white/70 hover:border-[#c8a96b]/40'
                }`}
              >
                <span>
                  <span className="block font-serif text-lg font-bold text-[#4a3933]">{agency}</span>
                  <span className="block text-[11px] text-[#887870]">{AGENCY_HINT[agency]}</span>
                </span>
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${active ? 'border-[#c8a96b] bg-[#c8a96b] text-white' : 'border-[#d9cfc8]'}`}>
                  {active && <Check className="h-3 w-3" strokeWidth={3} />}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Destino */}
      <div>
        <p className="mb-2 ml-1 text-xs font-bold uppercase tracking-widest text-[#887870]">¿A qué distrito?</p>
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#c8a96b]" />
          <input
            value={query}
            onChange={e => { setQuery(e.target.value); setIsSearching(true); }}
            onFocus={() => setIsSearching(true)}
            onBlur={() => setTimeout(() => setIsSearching(false), 150)}
            placeholder="Escribe tu distrito, ej. Carabayllo"
            aria-label="Buscar distrito"
            autoComplete="off"
            className="h-12 w-full rounded-2xl border border-[#e8dcdc] bg-white pl-11 pr-10 text-sm text-[#4a3933] outline-none transition placeholder:text-[#b7a9a0] focus:border-[#c8a96b] focus:ring-4 focus:ring-[#c8a96b]/15"
          />
          {isLoading && <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[#c8a96b]" />}
          {matches.length > 0 && (
            <ul className="absolute inset-x-0 top-full z-20 mt-1.5 max-h-72 overflow-y-auto rounded-2xl border border-[#e8dcdc] bg-white p-1.5 shadow-xl" role="listbox">
              {matches.map(match => (
                <li key={`${match.department}-${match.province}-${match.district}`}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={value.district === match.district && value.province === match.province}
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => {
                      set({ department: match.department, province: match.province, district: match.district });
                      setQuery('');
                      setIsSearching(false);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm hover:bg-[#faf7f2]"
                  >
                    <MapPin className="h-4 w-4 shrink-0 text-[#c8a96b]" />
                    <span className="font-semibold text-[#4a3933]">{match.district}</span>
                    <span className="truncate text-xs text-[#887870]">{match.province}, {match.department}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Selección manual (y confirmación de lo buscado) */}
        <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          <select
            aria-label="Departamento"
            value={value.department}
            onChange={e => set({ department: e.target.value, province: '', district: '' })}
            className={selectClass}
          >
            <option value="" disabled>Departamento</option>
            {PERU_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select
            aria-label="Provincia"
            value={value.province}
            onChange={e => set({ province: e.target.value, district: '' })}
            disabled={!provinces.length}
            className={selectClass}
          >
            <option value="" disabled>Provincia</option>
            {provinces.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select
            aria-label="Distrito"
            value={value.district}
            onChange={e => set({ district: e.target.value })}
            disabled={!districts.length}
            className={selectClass}
          >
            <option value="" disabled>Distrito</option>
            {districts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {destination && value.agency && (
          <p className="mt-3 flex items-center gap-2 rounded-2xl border border-[#c8a96b]/30 bg-white px-4 py-3 text-sm text-[#4a3933]">
            <Check className="h-4 w-4 shrink-0 text-[#4f755b]" />
            <span>Enviamos por <strong>{value.agency}</strong> a <strong>{destination}</strong>.</span>
          </p>
        )}
      </div>

      {/* 3. Sucursal opcional */}
      <Input
        label="Sucursal de la agencia (opcional)"
        value={value.address}
        onChange={e => set({ address: e.target.value })}
        placeholder={`Ej. ${value.agency || 'Shalom'} Av. Túpac Amaru`}
        maxLength={200}
        helperText="¿No la sabes? Te enviamos a la más cercana a tu distrito y te confirmamos por WhatsApp."
      />

      {/* 4. Cómo se paga */}
      <div className="flex items-start gap-3 rounded-2xl border border-[#c8a96b]/30 bg-[#fffdf8] p-4 text-sm text-[#6b5a50]">
        <Wallet className="mt-0.5 h-5 w-5 shrink-0 text-[#c8a96b]" />
        <p className="leading-relaxed">
          <strong className="text-[#4a3933]">Hoy pagas tus detalles</strong> (50% de adelanto o el total). El envío lo pagas en{' '}
          {value.agency || 'la agencia'} al recoger; lo cobran según el destino y el tamaño del paquete.
        </p>
      </div>
    </div>
  );
}
