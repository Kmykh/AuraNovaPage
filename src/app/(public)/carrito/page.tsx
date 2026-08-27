import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';
import { CartClient } from './CartClient';

import flo1 from '../images/flo1.png';
import flo2 from '../images/flo2.png';
import flo5 from '../images/flo5.png';

export const metadata: Metadata = {
  title: 'Tu carrito | Aura Nova',
  description: 'Revisa tus detalles seleccionados antes de continuar.',
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full bg-[#faf7f2] overflow-hidden pt-28 pb-24">
      
      {/* Background Flowers */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[10%] -left-16 w-[250px] md:w-[350px] opacity-80 animate-float-gentle mix-blend-multiply">
          <Image src={flo1} alt="" width={350} height={350} className="object-contain" />
        </div>
        <div className="absolute top-[40%] -right-16 w-[200px] md:w-[300px] opacity-90 animate-float-delayed mix-blend-multiply">
          <Image src={flo5} alt="" width={300} height={300} className="object-contain rotate-12" />
        </div>
        <div className="absolute bottom-[5%] left-[20%] w-[120px] md:w-[150px] opacity-50 animate-spin-slow mix-blend-multiply">
          <Image src={flo2} alt="" width={150} height={150} className="object-contain" />
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        
        {/* Top Header */}
        <div className="text-center flex flex-col items-center max-w-xl mx-auto mb-16">
          <h1 className="font-serif text-[3.5rem] sm:text-[4.5rem] font-bold text-[#4a3933] mb-2 leading-[0.9] tracking-tighter">
            Tu carrito
          </h1>
          <div className="flex items-center gap-4">
            <h2 className="text-2xl sm:text-3xl text-[#d38b8b] font-serif italic tracking-wide">
              de detalles
            </h2>
          </div>
        </div>

        <div className="w-full">
          <CartClient />
        </div>
      </div>
    </div>
  );
}
