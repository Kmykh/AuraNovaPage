import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'dark' | 'light';
}

export function Logo({ className = '', variant = 'dark' }: LogoProps) {
  return (
    <div className={`font-serif tracking-wide font-semibold ${variant === 'dark' ? 'text-brown' : 'text-cream'} ${className}`}>
      Aura Nova
    </div>
  );
}
