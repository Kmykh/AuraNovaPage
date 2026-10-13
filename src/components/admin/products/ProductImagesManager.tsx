"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ImagePlus, Star, Trash2 } from 'lucide-react';
import { getImageUrl } from '@/lib/formatters';

export const MAX_PRODUCT_IMAGES = 8;

/** Foto de la galería: ya guardada (path) o recién elegida (file, se sube al guardar). */
export interface GalleryItem {
  key: string;
  path?: string;
  file?: File;
  preview: string;
}

export function galleryFromPaths(paths: string[]): GalleryItem[] {
  return paths.map(path => ({ key: path, path, preview: getImageUrl(path) }));
}

interface ProductImagesManagerProps {
  items: GalleryItem[];
  onChange: (items: GalleryItem[]) => void;
  disabled?: boolean;
}

/**
 * Galería del producto en el panel: varias fotos, la primera es la portada (la que se ve en el catálogo).
 * Se reordena arrastrando o con las flechas.
 */
export function ProductImagesManager({ items, onChange, disabled }: ProductImagesManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const remaining = MAX_PRODUCT_IMAGES - items.length;

  // Libera las vistas previas locales al quitar fotos o salir de la página
  const previews = useRef(new Set<string>());
  useEffect(() => {
    const created = previews.current;
    return () => created.forEach(url => URL.revokeObjectURL(url));
  }, []);

  const addFiles = useCallback((files: FileList | File[]) => {
    const images = Array.from(files).filter(f => f.type.startsWith('image/')).slice(0, Math.max(0, remaining));
    if (images.length === 0) return;
    const added = images.map(file => {
      const preview = URL.createObjectURL(file);
      previews.current.add(preview);
      return { key: `${file.name}-${file.size}-${preview}`, file, preview };
    });
    onChange([...items, ...added]);
  }, [items, onChange, remaining]);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length || from === to) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };

  const remove = (index: number) => {
    const item = items[index];
    if (item.file) {
      URL.revokeObjectURL(item.preview);
      previews.current.delete(item.preview);
    }
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {items.map((item, index) => (
          <div
            key={item.key}
            draggable={!disabled}
            onDragStart={() => setDragIndex(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (dragIndex !== null) move(dragIndex, index);
              setDragIndex(null);
            }}
            onDragEnd={() => setDragIndex(null)}
            className={`group relative aspect-square overflow-hidden rounded-2xl border bg-[#FAF9F6] ${
              index === 0 ? 'border-gold ring-2 ring-gold/30' : 'border-sage/20'
            } ${dragIndex === index ? 'opacity-40' : ''} ${disabled ? '' : 'cursor-grab active:cursor-grabbing'}`}
          >
            <Image
              src={item.preview}
              alt={`Foto ${index + 1}`}
              fill
              sizes="160px"
              unoptimized={!!item.file}
              className="object-cover"
            />

            {index === 0 ? (
              <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-white shadow">
                <Star size={10} className="fill-white" /> Portada
              </span>
            ) : (
              <button
                type="button"
                onClick={() => move(index, 0)}
                disabled={disabled}
                className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-brown opacity-0 shadow transition group-hover:opacity-100 focus:opacity-100"
              >
                Hacer portada
              </button>
            )}
            {item.file && (
              <span className="absolute right-2 top-2 rounded-full bg-emerald-600 px-2 py-0.5 text-[9px] font-bold uppercase text-white">Nueva</span>
            )}

            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent p-1.5 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => move(index, index - 1)}
                  disabled={disabled || index === 0}
                  className="rounded-full bg-white/90 p-1 text-brown disabled:opacity-30"
                  aria-label="Mover a la izquierda"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, index + 1)}
                  disabled={disabled || index === items.length - 1}
                  className="rounded-full bg-white/90 p-1 text-brown disabled:opacity-30"
                  aria-label="Mover a la derecha"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
              <button
                type="button"
                onClick={() => remove(index)}
                disabled={disabled}
                className="rounded-full bg-white/90 p-1 text-rose-600"
                aria-label="Quitar foto"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}

        {remaining > 0 && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
            }}
            className={`flex aspect-square flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed text-center transition ${
              isDragging ? 'border-gold bg-gold/5' : 'border-sage/25 bg-[#FAF9F6] hover:border-gold/60'
            }`}
          >
            <ImagePlus size={24} className="text-gold" />
            <span className="px-2 text-[11px] font-bold text-brown">{items.length === 0 ? 'Agregar fotos' : 'Agregar más'}</span>
            <span className="text-[10px] text-sage">Quedan {remaining}</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) addFiles(e.target.files);
          e.target.value = '';
        }}
      />

      <p className="mt-2 text-[11px] text-sage">
        La primera foto es la portada del catálogo. Arrastra para ordenar. Se optimizan solas al guardar (WebP liviano).
      </p>
    </div>
  );
}
