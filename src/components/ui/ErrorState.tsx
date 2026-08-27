import React from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ 
  title = 'Ha ocurrido un error', 
  message = 'Hubo un problema procesando tu solicitud. Por favor, inténtalo de nuevo más tarde.', 
  onRetry,
  className = '' 
}: ErrorStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 bg-red-50/50 rounded-xl border border-red-100 min-h-[300px] ${className}`}>
      <AlertCircle className="h-12 w-12 text-red-400 mb-4" strokeWidth={1.5} />
      <h3 className="text-lg font-semibold text-red-800 mb-2">{title}</h3>
      <p className="text-sm text-red-600/80 max-w-sm mb-6">{message}</p>
      
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="border-red-200 text-red-700 hover:bg-red-50 focus-visible:ring-red-400">
          <RefreshCcw className="mr-2 h-4 w-4" />
          Reintentar
        </Button>
      )}
    </div>
  );
}
