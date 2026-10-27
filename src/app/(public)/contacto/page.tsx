import React from 'react';
import { Metadata } from 'next';
import { ContactSection } from '../home/ContactSection';

export const metadata: Metadata = {
  title: 'Contacto | Aura Nova',
  description: 'Escríbenos por WhatsApp, Instagram, TikTok o correo. Detalles florales hechos a mano en Huancayo con envíos a todo el Perú.',
};

export default function ContactPage() {
  return (
    <div className="min-h-[80vh] bg-cream pt-20 sm:pt-24">
      <ContactSection withFaq />
    </div>
  );
}
