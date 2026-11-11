"use client";

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { PERU, PHONE_COUNTRIES, composePhone, parsePhone } from '@/lib/phone';

interface PhoneFieldProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  helperText?: string;
}

/** WhatsApp con el país al lado: Perú por defecto; desde otro país se elige su código. */
export function PhoneField({ id = 'customer-phone', value, onChange, helperText }: PhoneFieldProps) {
  const { country, national } = parsePhone(value);
  const isPeru = country.iso === PERU.iso;

  return (
    <div>
      <div className="flex h-13 overflow-hidden rounded-2xl border border-[#e8dcdc] bg-white shadow-xs transition focus-within:border-[#c8a96b] focus-within:ring-4 focus-within:ring-[#c8a96b]/15">
        {/* Selector nativo (cómodo en el celular) con el país y su código a la vista */}
        <label className="relative flex shrink-0 items-center gap-1 border-r border-[#efe6dd] bg-[#faf7f2] pl-4 pr-3 text-sm font-bold text-[#4a3933]">
          <span>{country.iso}</span>
          <span className="font-semibold text-[#887870]">+{country.dial}</span>
          <ChevronDown className="h-3.5 w-3.5 text-[#b08a4e]" />
          <select
            aria-label="País de tu WhatsApp"
            value={country.iso}
            onChange={e => {
              const next = PHONE_COUNTRIES.find(c => c.iso === e.target.value) ?? PERU;
              onChange(composePhone(next, national));
            }}
            className="absolute inset-0 cursor-pointer opacity-0"
          >
            {PHONE_COUNTRIES.map(c => <option key={c.iso} value={c.iso}>{c.name} (+{c.dial})</option>)}
          </select>
        </label>
        <input
          id={id}
          type="tel"
          inputMode="numeric"
          autoComplete={isPeru ? 'tel-national' : 'tel'}
          value={national}
          maxLength={isPeru ? 9 : 13}
          onChange={e => onChange(composePhone(country, e.target.value))}
          placeholder={isPeru ? '987654321' : 'Tu número sin el código'}
          className="min-w-0 flex-1 bg-transparent px-4 text-sm font-medium text-[#4a3933] outline-none placeholder:text-[#b7a9a0]"
        />
      </div>
      {!isPeru ? (
        <p className="ml-1 mt-1.5 text-xs font-medium text-[#8f6d28]">
          Compras desde {country.name}: te escribimos a este WhatsApp y el pedido se entrega en el Perú.
        </p>
      ) : helperText ? (
        <p className="ml-1 mt-1.5 text-xs text-[#887870]">{helperText}</p>
      ) : null}
    </div>
  );
}
