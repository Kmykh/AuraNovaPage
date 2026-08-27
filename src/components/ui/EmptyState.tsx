import React, { ReactNode } from 'react';
import { PackageOpen } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 bg-cream/30 rounded-xl border border-sage/10 min-h-[300px] ${className}`}>
      <div className="h-16 w-16 mb-4 rounded-full bg-cream flex items-center justify-center text-gold">
        {icon || <PackageOpen size={32} strokeWidth={1.5} />}
      </div>
      <h3 className="text-lg font-semibold text-brown mb-1">{title}</h3>
      {description && <p className="text-sm text-sage max-w-sm mb-6">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}
