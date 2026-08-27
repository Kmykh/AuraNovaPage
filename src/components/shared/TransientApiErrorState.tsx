"use client";

import React from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { WhatsAppFallbackButton } from './WhatsAppFallbackButton';
import { useQuery } from '@tanstack/react-query';
import { BusinessSettingsService } from '@/services/business-settings.service';

interface TransientApiErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  whatsappMessage?: string;
  showRetry?: boolean;
}

export function TransientApiErrorState({
  title = 'Estamos teniendo una dificultad temporal',
  message = 'No pudimos procesar tu solicitud en este momento debido a un problema de conexión con nuestros servidores. Tus datos están seguros.',
  onRetry,
  whatsappMessage,
  showRetry = true,
}: TransientApiErrorStateProps) {
  
  // Obtener la configuración del negocio para sacar el WhatsApp real.
  // Es importante manejar el error de ESTA llamada también de forma silente.
  const { data: settings } = useQuery({
    queryKey: ['business-settings'],
    queryFn: BusinessSettingsService.getPublicBusinessSettings,
    staleTime: 5 * 60 * 1000,
    retry: 1 // Solo reintenta 1 vez si esto también cae
  });

  const phone = settings?.whatsappNumber;

  return (
    <div className="w-full bg-white rounded-xl border border-rose/30 p-8 flex flex-col items-center justify-center text-center shadow-sm max-w-2xl mx-auto">
      <div className="w-16 h-16 bg-rose/10 rounded-full flex items-center justify-center mb-6 text-rose">
        <AlertCircle size={32} />
      </div>
      
      <h3 className="font-serif text-2xl font-medium text-brown mb-3">
        {title}
      </h3>
      
      <p className="text-sage mb-8 max-w-lg leading-relaxed">
        {message}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
        {showRetry && onRetry && (
          <Button variant="outline" onClick={onRetry} className="flex items-center gap-2">
            <RefreshCcw size={16} />
            Reintentar
          </Button>
        )}

        {phone && whatsappMessage ? (
          <WhatsAppFallbackButton 
            phone={phone} 
            message={whatsappMessage} 
            label="Continuar por WhatsApp"
          />
        ) : whatsappMessage && !phone ? (
          <p className="text-sm text-sage/80 italic mt-2">
            Contáctanos por nuestros canales habituales en redes sociales.
          </p>
        ) : null}
      </div>
    </div>
  );
}
