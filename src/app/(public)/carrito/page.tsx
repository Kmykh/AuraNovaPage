import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import { CartClient, PurchaseSteps } from './CartClient';

import flo1 from '../images/flo1.png';
import flo5 from '../images/flo5.png';

export const metadata: Metadata = {
  title: 'Tu carrito | Aura Nova',
  description: 'Revisa tus detalles seleccionados antes de continuar.',
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full overflow-x-clip bg-[#faf7f2] pb-32 pt-28 lg:pb-24">
      {/* Flores solo en los bordes de pantallas grandes: no tapan el contenido */}
      <div className="pointer-events-none absolute inset-0 z-0 hidden xl:block">
        <div className="absolute -left-24 top-[12%] w-[260px] opacity-40 mix-blend-multiply">
          <Image src={flo1} alt="" className="h-auto w-full" />
        </div>
        <div className="absolute -right-24 top-[45%] w-[240px] rotate-12 opacity-40 mix-blend-multiply">
          <Image src={flo5} alt="" className="h-auto w-full" />
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="mb-10 text-center">
          <PurchaseSteps current={1} />
          <h1 className="mt-6 font-serif text-4xl font-bold tracking-tight text-[#4a3933] sm:text-5xl">Tu carrito</h1>
          <p className="mt-2 text-sm text-[#887870]">Revisa tus detalles y continúa para elegir cómo te los entregamos.</p>
        </header>

        <CartClient />
      </div>
    </div>
  );
}
