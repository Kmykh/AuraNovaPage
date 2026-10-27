import React from 'react';
import Image from 'next/image';
import yapeLogo from '@/app/(public)/images/yape-logo.png';

/** Marcas de tarjeta que acepta Mercado Pago en Perú, detectadas por los primeros dígitos. */
export type CardBrand = 'visa' | 'master' | 'amex' | 'diners';

/** payment_method_id de Mercado Pago (visa, debvisa, master, debmaster…) → marca para mostrar. */
export function brandFromMethod(methodId?: string | null): CardBrand | null {
  if (!methodId) return null;
  if (methodId.includes('visa')) return 'visa';
  if (methodId.includes('master')) return 'master';
  if (methodId.includes('amex')) return 'amex';
  if (methodId.includes('diners')) return 'diners';
  return null;
}

type IconProps = { className?: string };

export function VisaLogo({ className = 'h-5 w-auto' }: IconProps) {
  return (
    <svg viewBox="0 0 32 20" className={className} role="img" aria-label="Visa">
      <rect width="32" height="20" rx="3" fill="#fff" />
      <text x="16" y="14.2" textAnchor="middle" fontFamily="Arial Black, Arial, Helvetica, sans-serif" fontSize="10" fontStyle="italic" fontWeight="900" fill="#1A1F71" letterSpacing="-0.3">VISA</text>
    </svg>
  );
}

export function MastercardLogo({ className = 'h-5 w-auto' }: IconProps) {
  return (
    <svg viewBox="0 0 32 20" className={className} role="img" aria-label="Mastercard">
      <circle cx="11" cy="10" r="9" fill="#EB001B" />
      <circle cx="21" cy="10" r="9" fill="#F79E1B" />
      <path fill="#FF5F00" d="M16 2.5a9 9 0 0 1 0 15 9 9 0 0 1 0-15Z" />
    </svg>
  );
}

export function AmexLogo({ className = 'h-5 w-auto' }: IconProps) {
  return (
    <svg viewBox="0 0 32 20" className={className} role="img" aria-label="American Express">
      <rect width="32" height="20" rx="3" fill="#2E77BC" />
      <text x="16" y="13.4" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="7.5" fontWeight="700" fill="#fff" letterSpacing="0.4">AMEX</text>
    </svg>
  );
}

export function DinersLogo({ className = 'h-5 w-auto' }: IconProps) {
  return (
    <svg viewBox="0 0 32 20" className={className} role="img" aria-label="Diners Club">
      <circle cx="16" cy="10" r="9" fill="#0079BE" />
      <circle cx="16" cy="10" r="6.2" fill="#fff" />
      <path fill="#0079BE" d="M14.6 5.6a4.6 4.6 0 0 0 0 8.8V5.6Zm2.8 0v8.8a4.6 4.6 0 0 0 0-8.8Z" />
    </svg>
  );
}

export function BrandLogo({ brand, className }: { brand: CardBrand; className?: string }) {
  switch (brand) {
    case 'visa': return <VisaLogo className={className} />;
    case 'master': return <MastercardLogo className={className} />;
    case 'amex': return <AmexLogo className={className} />;
    case 'diners': return <DinersLogo className={className} />;
  }
}

/** Logo oficial de Yape (imagen), para el selector del medio de pago y el formulario. */
export function YapeLogo({ className = 'h-9 w-9' }: IconProps) {
  return <Image src={yapeLogo} alt="Yape" className={`rounded-[22%] object-cover ${className}`} sizes="48px" />;
}

/** Tarjeta pequeña para el selector "Tarjeta" (con chip dorado). */
export function CardMethodIcon({ className = 'h-9 w-9' }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect width="40" height="40" rx="11" fill="#4a3933" />
      <rect x="7" y="11" width="26" height="18" rx="3.5" fill="#fdf8ee" />
      <rect x="7" y="15" width="26" height="3.2" fill="#c8a96b" />
      <rect x="10.5" y="21.5" width="6" height="4.2" rx="1" fill="#d8b878" />
      <rect x="20" y="23" width="9.5" height="1.6" rx=".8" fill="#d9cfc8" />
    </svg>
  );
}

/** Chip dorado de la tarjeta. */
export function CardChip({ className = 'h-8 w-11' }: IconProps) {
  return (
    <svg viewBox="0 0 44 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="chip-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f3dfa9" />
          <stop offset=".5" stopColor="#c8a96b" />
          <stop offset="1" stopColor="#a8864a" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="42" height="30" rx="6" fill="url(#chip-gold)" />
      <path d="M1 11h13m16 0h13M1 21h13m16 0h13M14 1v30m16-30v30M14 11h16v10H14z" stroke="#8f6d28" strokeOpacity=".55" strokeWidth="1.2" fill="none" />
    </svg>
  );
}

/** Ícono de pago sin contacto. */
export function Contactless({ className = 'h-6 w-6' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M8.5 8.5a5 5 0 0 1 0 7" />
      <path d="M12 6a8.5 8.5 0 0 1 0 12" />
      <path d="M15.5 3.5a12 12 0 0 1 0 17" />
    </svg>
  );
}
