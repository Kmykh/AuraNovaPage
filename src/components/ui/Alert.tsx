import React, { ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

interface AlertProps {
  variant?: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  message: ReactNode;
  action?: ReactNode;
  className?: string;
}

const variantConfig = {
  success: {
    container: 'bg-sage/10 border-sage/30 text-sage',
    icon: <CheckCircle2 className="h-5 w-5 text-sage" />,
  },
  warning: {
    container: 'bg-amber-50 border-amber-200 text-amber-800',
    icon: <AlertTriangle className="h-5 w-5 text-amber-600" />,
  },
  error: {
    container: 'bg-red-50 border-red-200 text-red-800',
    icon: <AlertCircle className="h-5 w-5 text-red-600" />,
  },
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-800',
    icon: <Info className="h-5 w-5 text-blue-600" />,
  },
};

export function Alert({ variant = 'info', title, message, action, className = '' }: AlertProps) {
  const config = variantConfig[variant];

  return (
    <div className={`relative w-full rounded-lg border p-4 flex gap-3 ${config.container} ${className}`}>
      <div className="flex-shrink-0 mt-0.5">{config.icon}</div>
      <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          {title && <h5 className="font-semibold leading-none tracking-tight mb-1">{title}</h5>}
          <div className="text-sm opacity-90">{message}</div>
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  );
}
