import React from 'react';
import { BrandLogo, CardBrand, CardChip, Contactless } from './PaymentIcons';

interface CardPreviewProps {
  brand: CardBrand | null;
  /** Primeros dígitos que entrega Mercado Pago al escribir (el número completo nunca llega a la página). */
  bin: string;
  holder: string;
  expiryReady: boolean;
  /** Se voltea mientras escribe el código de seguridad. */
  flipped: boolean;
}

/** Agrupa como en la tarjeta real: Amex 4-6-5, el resto 4-4-4-4; lo que no se conoce queda en puntos. */
function maskedNumber(bin: string, brand: CardBrand | null) {
  const groups = brand === 'amex' ? [4, 6, 5] : [4, 4, 4, 4];
  const digits = bin.replace(/\D/g, '');
  let index = 0;
  return groups.map(size => {
    let group = '';
    for (let i = 0; i < size; i++, index++) group += digits[index] ?? '•';
    return group;
  }).join(' ');
}

/** Vista de la tarjeta que se va llenando mientras el cliente escribe (con los colores de Aura Nova). */
export function CardPreview({ brand, bin, holder, expiryReady, flipped }: CardPreviewProps) {
  const face = 'absolute inset-0 overflow-hidden rounded-[1.4rem] [backface-visibility:hidden] shadow-[0_24px_40px_-18px_rgba(58,45,40,0.65)]';

  return (
    <div className="@container mx-auto w-full max-w-[340px] [perspective:1200px]" aria-hidden="true">
      <div
        className={`relative aspect-[1.586] w-full transition-transform duration-700 ease-out [transform-style:preserve-3d] ${flipped ? '[transform:rotateY(180deg)]' : ''}`}
      >
        {/* Frente */}
        <div className={`${face} bg-[linear-gradient(135deg,#5e4a42_0%,#4a3933_45%,#2e231f_100%)] text-[#fdf8ee]`}>
          <svg className="absolute inset-0 h-full w-full opacity-[0.18]" viewBox="0 0 340 214" preserveAspectRatio="none">
            <circle cx="300" cy="-10" r="120" fill="none" stroke="#e8c98a" strokeWidth="1" />
            <circle cx="300" cy="-10" r="90" fill="none" stroke="#e8c98a" strokeWidth="1" />
            <circle cx="-20" cy="240" r="110" fill="none" stroke="#e8c98a" strokeWidth="1" />
            <path d="M0 150 C 90 110, 200 190, 340 130" fill="none" stroke="#e8c98a" strokeWidth="1.2" />
          </svg>
          <div className="relative flex h-full flex-col justify-between p-[7%]">
            <div className="flex items-start justify-between">
              <span className="font-serif text-[4.6cqw] font-bold tracking-wide text-[#e8c98a]">Aura Nova</span>
              <span className="flex h-7 items-center">{brand ? <BrandLogo brand={brand} className="h-7 w-auto" /> : <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#e8c98a]/70">Tarjeta</span>}</span>
            </div>
            <div className="flex items-center gap-3">
              <CardChip className="h-[26px] w-9" />
              <Contactless className="h-5 w-5 text-[#e8c98a]/80" />
            </div>
            <p className="whitespace-nowrap font-mono text-[5.6cqw] tracking-[0.1em] text-white">{maskedNumber(bin, brand)}</p>
            <div className="flex items-end justify-between gap-3 text-[10px] uppercase tracking-[0.18em]">
              <span className="min-w-0">
                <span className="block text-[#e8c98a]/70">Titular</span>
                <span className="block truncate text-[13px] font-semibold tracking-[0.08em] text-white">{holder.trim() || 'Nombre del titular'}</span>
              </span>
              <span className="shrink-0 text-right">
                <span className="block text-[#e8c98a]/70">Vence</span>
                <span className="block font-mono text-[13px] font-semibold text-white">{expiryReady ? '••/••' : 'MM/AA'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Reverso: el código de seguridad */}
        <div className={`${face} [transform:rotateY(180deg)] bg-[linear-gradient(135deg,#4a3933_0%,#2e231f_100%)]`}>
          <div className="mt-[11%] h-[18%] bg-[#1a1411]" />
          <div className="mx-[7%] mt-[8%] flex items-center gap-3">
            <div className="h-9 flex-1 rounded bg-[repeating-linear-gradient(90deg,#f6efe4_0_8px,#ece1d2_8px_16px)]" />
            <div className="flex h-9 w-14 items-center justify-center rounded bg-white font-mono text-sm font-bold tracking-widest text-[#4a3933]">•••</div>
          </div>
          <p className="mx-[7%] mt-3 text-right text-[10px] uppercase tracking-[0.18em] text-[#e8c98a]/80">Código de seguridad</p>
        </div>
      </div>
    </div>
  );
}
