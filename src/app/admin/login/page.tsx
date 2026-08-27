import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, ArrowLeft } from 'lucide-react';

import muroromano from '../../(public)/images/muroromano.png';
import estatuo from '../../(public)/images/estatuo.png';

export const metadata: Metadata = {
  title: 'Acceso Exclusivo | Aura Nova',
  description: 'Ingreso al panel de administración',
  robots: {
    index: false,
    follow: false
  }
};

import { Suspense } from 'react';
import { AdminLoginForm } from '@/components/admin/AdminLoginForm';

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#faf7f2] flex flex-col md:flex-row relative overflow-hidden font-sans">
      
      {/* Decorative Background for Mobile */}
      <div className="absolute inset-0 pointer-events-none md:hidden overflow-hidden">
        <div className="absolute -top-10 -left-10 w-64 h-64 opacity-20"
             style={{ maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 70%)', WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 70%)' }}>
           <Image src={muroromano} alt="" fill className="object-cover" />
        </div>
      </div>

      {/* Left Panel - Branding (Hidden on small screens) */}
      <div className="hidden md:flex md:w-1/2 relative bg-[#efece6] flex-col justify-between p-12 overflow-hidden border-r border-[#4a3933]/5">
        <div className="relative z-20">
          <Link href="/" className="inline-flex items-center text-[#887870] hover:text-[#c8a96b] transition-colors text-sm font-medium tracking-widest uppercase mb-12">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a la tienda
          </Link>
        </div>

        <div className="relative z-20 max-w-md mt-auto mb-auto">
          <p className="font-sans text-xs tracking-[0.4em] uppercase text-[#c8a96b] font-bold mb-6 flex items-center gap-3">
             <span className="w-8 h-[1px] bg-[#c8a96b]/50"></span>
             Panel Administrativo
          </p>
          <h1 className="font-serif text-5xl lg:text-7xl text-[#4a3933] mb-6 font-light tracking-tight">
            Gestión <br/><span className="font-serif italic text-[#c8a96b] font-normal tracking-wide">Aura Nova</span>
          </h1>
          <p className="text-lg text-[#887870] leading-relaxed">
            Acceso exclusivo al sistema de administración. Gestiona el catálogo, revisa los pedidos y continúa creando detalles que celebran la vida.
          </p>
        </div>

        <div className="relative z-20 text-xs text-[#887870] tracking-widest uppercase mt-auto">
          &copy; {new Date().getFullYear()} Aura Nova
        </div>

        {/* Decoraciones Griegas en el panel izquierdo */}
        <div className="absolute top-0 right-0 w-[400px] h-[100%] opacity-[0.15] pointer-events-none translate-x-1/4"
             style={{ maskImage: 'radial-gradient(ellipse at center left, black 30%, transparent 70%)', WebkitMaskImage: 'radial-gradient(ellipse at center left, black 30%, transparent 70%)' }}>
          <Image src={estatuo} alt="" fill className="object-contain object-bottom" />
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative z-10">
        
        {/* Mobile Header (Only visible on small screens) */}
        <div className="md:hidden text-center mb-10 mt-8 w-full max-w-sm mx-auto">
          <Link href="/" className="inline-flex items-center text-[#887870] hover:text-[#c8a96b] transition-colors text-[10px] font-medium tracking-[0.2em] uppercase mb-8">
            <ArrowLeft className="w-3 h-3 mr-2" />
            Volver a la tienda
          </Link>
          <div className="flex justify-center items-center mb-4">
             <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-[#c8a96b]/60"></div>
             <Sparkles className="text-[#c8a96b] w-5 h-5 mx-3" />
             <div className="w-8 h-[1px] bg-gradient-to-l from-transparent to-[#c8a96b]/60"></div>
          </div>
          <h1 className="font-serif text-4xl text-[#4a3933]">
            Aura Nova
          </h1>
        </div>

        {/* Login Container */}
        <div className="w-full max-w-md bg-white/60 backdrop-blur-xl md:bg-white p-8 md:p-12 rounded-[2rem] shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-[#4a3933]/5 relative">
          
          <div className="hidden md:flex justify-center items-center mb-8">
             <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-[#c8a96b]/60"></div>
             <Sparkles className="text-[#c8a96b] w-6 h-6 mx-4" />
             <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-[#c8a96b]/60"></div>
          </div>

          <h2 className="text-2xl font-serif text-[#4a3933] text-center mb-2 font-medium">
            Bienvenido de vuelta
          </h2>
          <p className="text-center text-sm text-[#887870] mb-8">
            Ingresa tus credenciales para continuar
          </p>
          
          <Suspense fallback={<div className="h-48 flex items-center justify-center text-[#c8a96b] animate-pulse font-serif italic">Preparando acceso...</div>}>
            <AdminLoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
