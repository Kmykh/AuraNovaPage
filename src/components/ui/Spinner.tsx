import React from 'react';
import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  color?: 'primary' | 'secondary' | 'brown' | 'white';
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

const colorClasses = {
  primary: 'text-gold',
  secondary: 'text-rose',
  brown: 'text-brown',
  white: 'text-cream',
};

export function Spinner({ size = 'md', className = '', color = 'primary' }: SpinnerProps) {
  return (
    <Loader2 
      className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`} 
    />
  );
}
