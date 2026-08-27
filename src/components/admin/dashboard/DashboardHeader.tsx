import React from 'react';
import { Button } from '@/components/ui/Button';
import { RefreshCw } from 'lucide-react';

interface DashboardHeaderProps {
  onRefresh: () => void;
  isFetching: boolean;
  lastUpdated?: number; // timestamp
}

export function DashboardHeader({ onRefresh, isFetching, lastUpdated }: DashboardHeaderProps) {
  // Formatear la hora de última actualización si existe
  const timeString = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-brown">Dashboard</h1>
        <p className="text-sage text-sm sm:text-base mt-1">
          Resumen de la actividad de Aura Nova.
        </p>
      </div>
      
      <div className="flex items-center gap-4">
        {timeString && (
          <span className="text-xs text-sage hidden sm:inline-block">
            Actualizado a las {timeString}
          </span>
        )}
        <Button 
          variant="outline" 
          onClick={onRefresh}
          disabled={isFetching}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          {isFetching ? 'Actualizando...' : 'Actualizar'}
        </Button>
      </div>
    </div>
  );
}
