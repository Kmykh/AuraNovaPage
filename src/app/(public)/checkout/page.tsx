import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';
import { CheckoutClient } from './CheckoutClient';

import flo1 from '../images/flo1.png';
import flo2 from '../images/flo2.png';
import flo6 from '../images/flo6.png';

export const metadata: Metadata = {
  title: 'Finaliza tu pedido | Aura Nova',
  description: 'Completa los datos de tu pedido y elige cómo deseas recibirlo.',
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full bg-[#faf7f2] overflow-hidden pt-28 pb-24">
      
      {/* Background Flowers */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[5%] -left-16 w-[200px] md:w-[300px] opacity-80 animate-float-gentle mix-blend-multiply">
          <Image src={flo6} alt="" width={300} height={300} className="object-contain" />
        </div>
        <div className="absolute bottom-[20%] -right-10 w-[150px] md:w-[250px] opacity-90 animate-float-delayed mix-blend-multiply">
          <Image src={flo1} alt="" width={250} height={250} className="object-contain rotate-[30deg]" />
        </div>
        <div className="absolute bottom-[2%] left-[10%] w-[100px] md:w-[150px] opacity-40 animate-spin-slow mix-blend-multiply">
          <Image src={flo2} alt="" width={150} height={150} className="object-contain" />
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        <div className="w-full">
          <CheckoutClient />
        </div>
      </div>
    </div>
  );
}
