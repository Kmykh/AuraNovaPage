"use client";

import React from 'react';
import { Edit2, Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

/** Encabezado de una lista de envíos: título, cuántas están activas y el botón para agregar. */
export function ShippingListHeader({ icon: Icon, title, hint, actionLabel, onAction }: {
  icon: React.ElementType; title: string; hint: string; actionLabel: string; onAction: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-sage/10 bg-[#FAFAFA] px-5 py-4">
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold"><Icon size={18} /></span>
        <div className="min-w-0">
          <h2 className="font-serif text-lg font-semibold text-brown">{title}</h2>
          <p className="text-xs text-sage">{hint}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onAction}
        className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl bg-brown px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brown/90"
      >
        <Plus size={15} /> {actionLabel}
      </button>
    </div>
  );
}

/** Fila de zona o punto: nombre, detalle, costo ("Gratis" si es 0), interruptor para mostrarla y editar. */
export function ShippingRow({ name, detail, cost, isActive, onToggle, onEdit, toggling }: {
  name: string;
  detail: React.ReactNode;
  cost: number;
  isActive: boolean;
  onToggle: () => void;
  onEdit: () => void;
  toggling?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 px-5 py-4 transition-colors hover:bg-cream/20 ${isActive ? '' : 'bg-[#FAFAFA]'}`}>
      <div className={`min-w-0 flex-1 ${isActive ? '' : 'opacity-60'}`}>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h3 className="truncate font-semibold text-brown">{name}</h3>
          <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${cost > 0 ? 'bg-gold/10 text-[#8c6d36]' : 'bg-emerald-50 text-emerald-700'}`}>
            {cost > 0 ? formatCurrency(cost) : 'Gratis'}
          </span>
          {!isActive && <span className="text-[11px] font-semibold text-sage">Oculta en la tienda</span>}
        </div>
        <div className="mt-1 text-sm text-sage">{detail}</div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={isActive}
        aria-label={isActive ? `Ocultar ${name}` : `Mostrar ${name}`}
        title={isActive ? 'Visible para el cliente' : 'Oculta para el cliente'}
        onClick={onToggle}
        disabled={toggling}
        className={`relative h-6 w-11 shrink-0 rounded-full transition disabled:opacity-50 ${isActive ? 'bg-emerald-500' : 'bg-sage/30'}`}
      >
        <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${isActive ? 'left-6' : 'left-1'}`} />
      </button>
      <button
        type="button"
        onClick={onEdit}
        className="shrink-0 rounded-xl border border-sage/20 p-2 text-brown hover:bg-cream"
        aria-label={`Editar ${name}`}
      >
        <Edit2 size={15} />
      </button>
    </div>
  );
}
