import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Home, ShoppingBag, Search, Sparkles } from 'lucide-react';
import flo from './(public)/images/flo.png';
import flo2 from './(public)/images/flo2.png';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#faf7f2] flex flex-col items-center justify-center px-4 py-16 sm:py-24 relative overflow-hidden font-sans select-none">
      
      {/* ─── FONDOS DECORATIVOS BOTÁNICOS ─── */}
      <div className="absolute top-1/4 -left-20 w-72 sm:w-96 h-72 sm:h-96 opacity-25 pointer-events-none animate-spin-slow mix-blend-multiply">
        <Image src={flo2} alt="" fill sizes="400px" className="object-contain" />
      </div>
      
      <div className="absolute bottom-10 -right-16 w-64 sm:w-80 h-64 sm:h-80 opacity-20 pointer-events-none animate-spin-slow mix-blend-multiply">
        <Image src={flo} alt="" fill sizes="320px" className="object-contain" />
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[#c8a96b]/10 via-[#d38b8b]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* ─── CONTENEDOR PRINCIPAL ─── */}
      <div className="relative z-10 max-w-xl w-full text-center space-y-6">
        
        {/* Ilustración de flor flotante */}
        <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
          <div className="absolute inset-0 bg-[#c8a96b]/15 rounded-full blur-xl animate-pulse" />
          <div className="relative w-full h-full animate-float-gentle">
            <Image 
              src={flo} 
              alt="Aura Nova Flor" 
              fill 
              sizes="120px" 
              className="object-contain drop-shadow-md"
              priority
            />
          </div>
        </div>

        {/* Número 404 estilizado */}
        <div className="space-y-2">
          <span className="font-serif font-black text-6xl sm:text-8xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#4a3933] via-[#c8a96b] to-[#4a3933] drop-shadow-sm">
            404
          </span>
          <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-[#c8a96b]">
            <Sparkles size={14} />
            <span>Página no encontrada</span>
            <Sparkles size={14} />
          </div>
        </div>

        {/* Texto poético y claro */}
        <div className="space-y-3 px-4">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#4a3933] leading-snug">
            Esta flor aún no ha florecido aquí
          </h1>
          <p className="text-sm sm:text-base text-[#887870] max-w-md mx-auto leading-relaxed">
            La página que buscas no existe, ha cambiado de lugar o fue retirada de temporada. Te invitamos a continuar explorando nuestras creaciones.
          </p>
        </div>

        {/* ─── BOTONES DE NAVEGACIÓN ─── */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5 px-4">
          {/* Botón Principal: Inicio */}
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-[#4a3933] hover:bg-[#392c27] text-[#faf7f2] font-serif italic text-sm sm:text-base shadow-lg shadow-[#4a3933]/20 hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <Home size={17} className="text-[#c8a96b]" />
            <span>Volver al inicio</span>
          </Link>

          {/* Botón Secundario: Catálogo */}
          <Link
            href="/productos"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-white/90 hover:bg-white text-[#4a3933] font-bold text-xs uppercase tracking-wider border border-[#c8a96b]/30 shadow-sm hover:border-[#c8a96b] hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <ShoppingBag size={16} className="text-[#c8a96b]" />
            <span>Ver catálogo</span>
          </Link>
        </div>

        {/* Enlace adicional: Seguimiento */}
        <div className="pt-3">
          <Link
            href="/seguimiento"
            className="inline-flex items-center gap-1.5 text-xs text-[#887870] hover:text-[#c8a96b] font-medium transition-colors"
          >
            <Search size={13} />
            <span>¿Buscabas rastrear un pedido existente? Haz clic aquí</span>
          </Link>
        </div>

      </div>

      {/* Pie sutil */}
      <footer className="absolute bottom-6 text-center text-[11px] text-[#887870]/60">
        Aura Nova • El arte de regalar
      </footer>

    </div>
  );
}
