import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'pending';
}

const variantStyles = {
  success: 'bg-sage/20 text-sage',
  warning: 'bg-amber-100 text-amber-800',
  error: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
  neutral: 'bg-gray-100 text-gray-800',
  pending: 'bg-gold/20 text-gold',
};

export function Badge({ className = '', variant = 'neutral', children, ...props }: BadgeProps) {
  return (
    <div
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
