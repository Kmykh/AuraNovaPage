import React from 'react';
import { Metadata } from 'next';
import { HomeClient } from './HomeClient';

export const metadata: Metadata = {
  title: 'Aura Nova | Detalles hechos con cariño',
  description: 'Descubre los detalles de Aura Nova y encuentra un regalo para momentos especiales. Cuidado premium y regalos inolvidables.',
  openGraph: {
    title: 'Aura Nova | Detalles hechos con cariño',
    description: 'Descubre los detalles de Aura Nova y encuentra un regalo para momentos especiales.',
    type: 'website',
  }
};

export default function HomePage() {
  return <HomeClient />;
}
