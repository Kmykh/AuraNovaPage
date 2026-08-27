import React, { useEffect, useState } from 'react';
import Image from 'next/image';

import flo1 from '@/app/(public)/images/flo1.png';
import flo2 from '@/app/(public)/images/flo2.png';
import flo4 from '@/app/(public)/images/flo4.png';
import flo from '@/app/(public)/images/flo.png';

interface WaterfallLoaderProps {
  message?: string;
  subMessage?: string;
}

export function FlowerWaterfallLoader({ message = "Cargando...", subMessage }: WaterfallLoaderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const flowers = [
    { src: flo1, size: 120, left: '10%', delay: '0s', duration: '7s' },
    { src: flo2, size: 80, left: '25%', delay: '2s', duration: '9s' },
    { src: flo4, size: 150, left: '50%', delay: '1s', duration: '8s' },
    { src: flo, size: 60, left: '70%', delay: '3.5s', duration: '10s' },
    { src: flo1, size: 100, left: '85%', delay: '1.5s', duration: '7.5s' },
    { src: flo2, size: 90, left: '40%', delay: '4s', duration: '8.5s' },
    { src: flo4, size: 130, left: '15%', delay: '2.5s', duration: '9.5s' },
    { src: flo, size: 70, left: '80%', delay: '0.5s', duration: '6.5s' },
  ];

  return (
    <div className="relative w-full h-[60vh] min-h-[400px] flex flex-col items-center justify-center overflow-hidden bg-cream rounded-3xl border border-sage/10 shadow-sm">
      
      {/* Falling Flowers */}
      {mounted && flowers.map((f, idx) => (
        <div 
          key={idx}
          className="absolute -top-[200px] opacity-0 animate-waterfall mix-blend-multiply"
          style={{ 
            left: f.left, 
            animationDelay: f.delay,
            animationDuration: f.duration
          }}
        >
          <Image src={f.src} alt="" width={f.size} height={f.size} className="drop-shadow-md" />
        </div>
      ))}

      {/* Loading Content */}
      <div className="relative z-10 bg-white/70 backdrop-blur-md px-10 py-8 rounded-2xl border border-white shadow-lg text-center animate-fade-in-up">
        <div className="inline-flex gap-2 mb-4">
          <div className="w-2.5 h-2.5 rounded-full bg-gold animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2.5 h-2.5 rounded-full bg-gold animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2.5 h-2.5 rounded-full bg-gold animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <h3 className="font-serif text-2xl text-brown font-semibold mb-2">{message}</h3>
        {subMessage && <p className="text-sage text-sm">{subMessage}</p>}
      </div>
    </div>
  );
}
