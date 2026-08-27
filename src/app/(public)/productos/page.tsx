import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import { CatalogClient } from './CatalogClient';

import flo1 from '../images/flo1.png';
import flo4 from '../images/flo4.png';
import flo from '../images/flo.png';

export const metadata: Metadata = {
  title: 'Aura Nova | Nuestros detalles',
  description: 'Descubre los detalles y regalos de Aura Nova. Cuidado premium para resaltar tu belleza natural.',
};

export default function ProductsPage() {
  return (
    <div className="relative min-h-screen bg-cream overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft Background Gradients */}
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-rose/5 rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-20 left-0 w-[600px] h-[600px] bg-gold/5 rounded-full blur-3xl opacity-60" />
        
        {/* Floating Flowers */}
        <div className="absolute top-10 -left-10 w-[150px] md:w-[200px] opacity-20 animate-float-gentle">
          <Image src={flo1} alt="" width={200} height={200} className="drop-shadow-sm" />
        </div>
        
        <div className="absolute top-1/4 -right-12 w-[180px] md:w-[240px] opacity-15 animate-float-gentle-reverse" style={{ animationDelay: '1.5s' }}>
          <Image src={flo4} alt="" width={240} height={240} className="drop-shadow-sm" />
        </div>
        
        <div className="absolute bottom-1/4 left-10 w-[80px] md:w-[100px] opacity-30 animate-butterfly">
          <Image src={flo} alt="" width={100} height={100} className="drop-shadow-sm" />
        </div>
      </div>

      <div className="relative z-10 flex flex-col gap-8 pt-28 pb-12 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-6">
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-brown mb-4">
            Nuestros detalles
          </h1>
          <p className="text-sage text-base md:text-lg">
            Una colección delicada pensada en el cuidado de tu piel y tu bienestar.
          </p>
        </div>
        
        <CatalogClient />
      </div>
    </div>
  );
}
