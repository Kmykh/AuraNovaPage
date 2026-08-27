"use client";

import React from 'react';
import { Button } from '@/components/ui/Button';

interface WhatsAppFallbackButtonProps {
  phone: string;
  message: string;
  label?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  className?: string;
}

export function WhatsAppFallbackButton({
  phone,
  message,
  label = 'Continuar por WhatsApp',
  variant = 'primary',
  className
}: WhatsAppFallbackButtonProps) {
  
  const handleWhatsApp = () => {
    // Sanitizar teléfono: remover espacios, signos +, etc. (solo si es necesario, pero wa.me acepta +)
    // El backend debe devolver el teléfono limpio, asumimos que es seguro.
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${phone}?text=${encodedMessage}`;
    
    // Validar seguridad de la URL para evitar javascript injections (aunque wa.me base url ya es segura)
    if (url.startsWith('https://wa.me/')) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Button 
      variant={variant} 
      onClick={handleWhatsApp}
      className={className}
    >
      {label}
    </Button>
  );
}
