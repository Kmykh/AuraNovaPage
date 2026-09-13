import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ShoppingBag, Search } from 'lucide-react';
import flo from './(public)/images/flo.png';
import flo2 from './(public)/images/flo2.png';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#faf7f2] flex flex-col items-center justify-center px-6 py-20 relative overflow-hidden font-sans select-none">
      
      {/* ─── FONDOS BOTÁNICOS SUTILES ─── */}
      <div className="absolute top-10 -left-20 w-80 h-80 opacity-15 pointer-events-none animate-spin-slow mix-blend-multiply">
        <Image src={flo2} alt="" fill sizes="320px" className="object-contain" />
      </div>
      
      <div className="absolute -bottom-10 -right-20 w-80 h-80 opacity-15 pointer-events-none animate-spin-slow mix-blend-multiply">
        <Image src={flo} alt="" fill sizes="320px" className="object-contain" />
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#c8a96b]/5 rounded-full blur-3xl pointer-events-none" />

      {/* ─── CONTENEDOR PRINCIPAL CON ESPACIADO GENEROSO ─── */}
      <div className="relative z-10 max-w-lg w-full text-center flex flex-col items-center">
        
        {/* Flor / Mariposa decorativa flotante */}
        <div className="relative w-20 h-20 mb-8 flex items-center justify-center">
          <div className="relative w-full h-full animate-float-gentle">
            <Image 
              src={flo} 
              alt="Aura Nova" 
              fill 
              sizes="80px" 
              className="object-contain drop-shadow-sm opacity-90"
              priority
            />
          </div>
        </div>

        {/* Número 404 minimalista y fino */}
        <div className="mb-4">
          <span className="text-8xl sm:text-9xl font-extralight tracking-widest text-[#3b2b25] block leading-none font-sans">
            404
          </span>
        </div>

        {/* Tag sutil bien separado */}
        <div className="mb-6">
          <span className="inline-block text-[11px] font-normal uppercase tracking-[0.35em] text-[#8c6d58] border-b border-[#8c6d58]/30 pb-1">
            Página no encontrada
          </span>
        </div>

        {/* Título y descripción con tipografía fina y neutral (estilo Roboto/Inter) */}
        <div className="space-y-3 mb-10 max-w-md">
          <h1 className="text-2xl sm:text-3xl font-light text-[#3b2b25] tracking-tight leading-snug">
            Esta flor aún no ha florecido aquí
          </h1>
          <p className="text-sm font-light text-[#7a6b63] leading-relaxed">
            La página que buscas no existe, ha cambiado de lugar o fue retirada de temporada. Te invitamos a continuar explorando nuestras creaciones.
          </p>
        </div>

        {/* Botones de acción minimalistas en tono marrón oscuro */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto mb-8">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#3b2b25] hover:bg-[#2a1d19] text-[#faf7f2] font-normal text-xs uppercase tracking-widest transition-all duration-300 shadow-sm hover:scale-[1.02] active:scale-[0.98]"
          >
            <ArrowLeft size={14} />
            <span>Volver al inicio</span>
          </Link>

          <Link
            href="/productos"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-transparent hover:bg-white text-[#3b2b25] font-normal text-xs uppercase tracking-widest border border-[#3b2b25]/25 hover:border-[#3b2b25] transition-all duration-300 shadow-xs hover:scale-[1.02] active:scale-[0.98]"
          >
            <ShoppingBag size={14} />
            <span>Ver catálogo</span>
          </Link>
        </div>

        {/* Enlace sutil de rastreo */}
        <div>
          <Link
            href="/seguimiento"
            className="inline-flex items-center gap-1.5 text-xs font-light text-[#7a6b63] hover:text-[#3b2b25] transition-colors"
          >
            <Search size={13} className="opacity-70" />
            <span>¿Buscabas rastrear tu pedido? Haz clic aquí</span>
          </Link>
        </div>

      </div>

      {/* Pie minimalista */}
      <footer className="absolute bottom-6 text-center text-[10px] uppercase tracking-[0.2em] text-[#8c6d58]/60 font-light">
        Aura Nova • El arte de regalar
      </footer>

    </div>
  );
}
