"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, PackageOpen, X, ZoomIn } from 'lucide-react';
import { getImageUrl } from '@/lib/formatters';

interface ProductGalleryProps {
  images: string[];
  name: string;
  badge?: React.ReactNode;
}

/** Cuánto se acerca el recuadro de zoom (la lupa cubre 1/ZOOM de la foto). */
const ZOOM = 2.5;
/** Tamaño de la foto principal: el zoom y la vista ampliada la reutilizan mientras llega la grande. */
const GALLERY_SIZES = '(max-width: 768px) 100vw, 45vw';

/**
 * Galería del producto: deslizar en celular, flechas y miniaturas en computadora, lupa al pasar el mouse
 * y vista ampliada. Solo la primera foto se carga de inmediato; las demás se piden al verlas (cuida el consumo de Supabase).
 */
export function ProductGallery({ images, name, badge }: ProductGalleryProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState<number | null>(null);
  // Fotos ya pedidas: la actual y la siguiente. El resto no se descarga hasta que el cliente llega a ella.
  const [seen, setSeen] = useState<number[]>([0, 1]);
  const count = images.length;
  // Lupa: solo con mouse y con la foto al lado de la personalización (computadora y tablet horizontal)
  const wrapRef = useRef<HTMLDivElement>(null);
  const [lens, setLens] = useState(false);

  const onLensEnter = () => {
    if (window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 768px)').matches) setLens(true);
  };
  // La posición va en variables CSS: mover el mouse no vuelve a pintar React
  const onLensMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const node = wrapRef.current;
    if (!node) return;
    const rect = e.currentTarget.getBoundingClientRect();
    node.style.setProperty('--zx', Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)).toFixed(4));
    node.style.setProperty('--zy', Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height)).toFixed(4));
  };

  const markSeen = useCallback((index: number) => {
    setSeen(prev => (prev.includes(index) && prev.includes(index + 1) ? prev : [...prev, index, index + 1]));
  }, []);

  const goTo = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const next = (index + count) % count;
    markSeen(next);
    track.scrollTo({ left: next * track.clientWidth, behavior: 'smooth' });
    setActive(next);
  }, [count, markSeen]);

  const onScroll = () => {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;
    const index = Math.round(track.scrollLeft / track.clientWidth);
    if (index !== active) {
      markSeen(index);
      setActive(index);
    }
  };

  // Teclado en la vista ampliada
  useEffect(() => {
    if (zoomed === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoomed(null);
      if (e.key === 'ArrowRight') setZoomed(z => (z === null ? z : (z + 1) % count));
      if (e.key === 'ArrowLeft') setZoomed(z => (z === null ? z : (z - 1 + count) % count));
    };
    window.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [zoomed, count]);

  if (count === 0) {
    return (
      <div className="relative flex aspect-[4/5] w-full items-center justify-center rounded-[2rem] bg-[#F9F8F6] text-[#887870]/40">
        <PackageOpen size={64} strokeWidth={1} />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div ref={wrapRef} className="relative [--zx:0.5] [--zy:0.5]">
      <div
        className="group relative overflow-hidden rounded-[1.75rem] bg-[#F9F8F6] shadow-[0_8px_40px_rgba(74,57,51,0.08)] md:rounded-[2rem]"
        onMouseEnter={onLensEnter}
        onMouseMove={onLensMove}
        onMouseLeave={() => setLens(false)}
      >
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="flex aspect-[4/5] w-full snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((src, index) => (
            <button
              key={`${src}-${index}`}
              type="button"
              onClick={() => setZoomed(index)}
              className="relative h-full w-full shrink-0 snap-center cursor-zoom-in"
              aria-label={`Ampliar foto ${index + 1} de ${name}`}
            >
              {seen.includes(index) && (
                <Image
                  src={getImageUrl(src)}
                  alt={index === 0 ? name : `${name} — foto ${index + 1}`}
                  fill
                  sizes={GALLERY_SIZES}
                  priority={index === 0}
                  className="object-cover"
                />
              )}
            </button>
          ))}
        </div>

        {badge && <div className="pointer-events-none absolute left-4 top-4 z-10">{badge}</div>}

        {/* Lupa: el cuadro que se ve aumentado al lado */}
        {lens && (
          <span
            aria-hidden
            className="pointer-events-none absolute z-20 rounded-xl border-2 border-white/90 bg-white/20 shadow-[0_0_0_9999px_rgba(74,57,51,0.18)] backdrop-brightness-110"
            style={{
              width: `${100 / ZOOM}%`,
              height: `${100 / ZOOM}%`,
              left: `calc(var(--zx) * ${100 - 100 / ZOOM}%)`,
              top: `calc(var(--zy) * ${100 - 100 / ZOOM}%)`,
            }}
          />
        )}

        <span className={`pointer-events-none absolute bottom-4 right-4 z-10 hidden items-center gap-1.5 rounded-full bg-white/85 px-3 py-1.5 text-[11px] font-semibold text-[#4a3933] shadow-sm backdrop-blur transition-opacity [@media(hover:hover)_and_(min-width:768px)]:inline-flex ${lens ? 'opacity-0' : ''}`}>
          <ZoomIn className="h-3.5 w-3.5" /> Pasa el mouse para ver de cerca · clic para ampliar
        </span>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(active - 1)}
              className="absolute left-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#4a3933] shadow-md opacity-0 transition group-hover:opacity-100 md:flex"
              aria-label="Foto anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => goTo(active + 1)}
              className="absolute right-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#4a3933] shadow-md opacity-0 transition group-hover:opacity-100 md:flex"
              aria-label="Foto siguiente"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Puntos (celular) */}
            <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 md:hidden">
              {images.map((_, index) => (
                <span
                  key={index}
                  className={`h-1.5 rounded-full transition-all ${index === active ? 'w-5 bg-white' : 'w-1.5 bg-white/60'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Recuadro de zoom al lado de la foto (encima de la personalización mientras se mira) */}
      {lens && (
        <div
          aria-hidden
          className="pointer-events-none absolute left-[calc(100%+1.5rem)] top-0 z-30 hidden aspect-[4/5] w-full overflow-hidden rounded-[2rem] border border-white bg-[#F9F8F6] shadow-[0_30px_70px_-20px_rgba(74,57,51,0.55)] animate-in fade-in zoom-in-95 duration-200 md:block"
        >
          {/* Primero la foto que ya está en pantalla (sale al instante) y encima la de alta calidad cuando llega */}
          {[GALLERY_SIZES, '1600px'].map(size => (
            <Image
              key={size}
              src={getImageUrl(images[active])}
              alt=""
              fill
              sizes={size}
              className="object-cover"
              style={{ transform: `scale(${ZOOM})`, transformOrigin: 'calc(var(--zx) * 100%) calc(var(--zy) * 100%)' }}
            />
          ))}
        </div>
      )}
      </div>

      {count > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((src, index) => (
            <button
              key={`thumb-${src}-${index}`}
              type="button"
              onClick={() => goTo(index)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition sm:h-20 sm:w-20 ${
                index === active ? 'border-[#c8a96b] shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
              aria-label={`Ver foto ${index + 1}`}
            >
              <Image src={getImageUrl(src)} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {zoomed !== null && createPortal(
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-stone-950/90 p-4 backdrop-blur-sm"
          onClick={() => setZoomed(null)}
          role="dialog"
          aria-label={`Fotos de ${name}`}
        >
          <button className="absolute right-4 top-4 rounded-full bg-white/15 p-2.5 text-white hover:bg-white/25" aria-label="Cerrar">
            <X className="h-5 w-5" />
          </button>
          {count > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setZoomed((zoomed - 1 + count) % count); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-3 text-white hover:bg-white/25"
                aria-label="Foto anterior"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setZoomed((zoomed + 1) % count); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-3 text-white hover:bg-white/25"
                aria-label="Foto siguiente"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
          <div className="relative h-[85vh] w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            {/* La versión ya cargada aparece al instante; la grande la reemplaza al llegar */}
            <Image src={getImageUrl(images[zoomed])} alt="" fill sizes={GALLERY_SIZES} className="object-contain" />
            <Image
              src={getImageUrl(images[zoomed])}
              alt={`${name} — foto ${zoomed + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
          {count > 1 && (
            <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
              {zoomed + 1} / {count}
            </span>
          )}
        </div>,
        document.body,
      )}
    </div>
  );
}
