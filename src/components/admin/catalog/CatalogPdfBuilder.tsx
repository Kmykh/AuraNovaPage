"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, Download, ExternalLink, Loader2, LayoutGrid, Tag, Eye, EyeOff } from 'lucide-react';
import { useCategories } from '@/hooks/use-categories';

export function CatalogPdfBuilder() {
  const { data: categories } = useCategories();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [title, setTitle] = useState('Catálogo de temporada');
  const [categoryId, setCategoryId] = useState('todas');
  const [showPrices, setShowPrices] = useState(true);
  const [perPage, setPerPage] = useState<4 | 6>(4);
  // La vista previa avisa para qué configuración terminó de cargar; si cambian las opciones, deja de estar lista
  const [readyFor, setReadyFor] = useState<string | null>(null);
  const [productCount, setProductCount] = useState<number | null>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams({
      categoria: categoryId,
      precios: showPrices ? '1' : '0',
      titulo: title.trim() || 'Catálogo de temporada',
      porPagina: String(perPage),
    });
    return params.toString();
  }, [categoryId, showPrices, title, perPage]);
  const ready = readyFor === query;

  // La vista previa avisa cuando cargó productos y fotos
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.data?.type !== 'catalog-ready') return;
      setReadyFor(event.data.query ?? null);
      setProductCount(event.data.products ?? null);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const download = () => {
    const frame = iframeRef.current?.contentWindow;
    if (!frame) return;
    frame.focus();
    frame.print();
  };

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[340px_1fr]">
      {/* Opciones */}
      <aside className="h-fit space-y-6 rounded-[24px] border border-sage/10 bg-white p-6 shadow-sm xl:sticky xl:top-24">
        <div>
          <label htmlFor="catalog-title" className="text-xs font-bold uppercase tracking-wider text-sage">Título de la portada</label>
          <input
            id="catalog-title"
            value={title}
            maxLength={60}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-2 w-full rounded-xl border border-sage/20 bg-cream/40 px-4 py-2.5 text-sm text-brown outline-none focus:border-gold focus:ring-4 focus:ring-gold/15"
          />
        </div>

        <div>
          <label htmlFor="catalog-category" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sage">
            <Tag className="h-3.5 w-3.5" /> Categoría
          </label>
          <select
            id="catalog-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="mt-2 w-full rounded-xl border border-sage/20 bg-cream/40 px-4 py-2.5 text-sm text-brown outline-none focus:border-gold"
          >
            <option value="todas">Todo el catálogo</option>
            {(categories ?? []).map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>

        <div>
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sage">
            <LayoutGrid className="h-3.5 w-3.5" /> Productos por hoja
          </span>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {([4, 6] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setPerPage(option)}
                className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                  perPage === option ? 'border-gold bg-gold/10 text-brown' : 'border-sage/20 text-sage hover:border-gold'
                }`}
              >
                {option === 4 ? '4 · fotos grandes' : '6 · compacto'}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowPrices((value) => !value)}
          className="flex w-full items-center justify-between rounded-xl border border-sage/20 px-4 py-3 text-sm text-brown transition hover:border-gold"
        >
          <span className="flex items-center gap-2 font-semibold">
            {showPrices ? <Eye className="h-4 w-4 text-gold" /> : <EyeOff className="h-4 w-4 text-sage" />}
            {showPrices ? 'Mostrar precios' : 'Sin precios (mayoristas)'}
          </span>
          <span className={`relative h-6 w-11 rounded-full transition ${showPrices ? 'bg-gold' : 'bg-sage/30'}`}>
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${showPrices ? 'left-[22px]' : 'left-0.5'}`} />
          </span>
        </button>

        <div className="space-y-2 border-t border-sage/10 pt-5">
          <button
            type="button"
            onClick={download}
            disabled={!ready}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-brown px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-brown/90 disabled:opacity-50"
          >
            {ready ? <Download className="h-4 w-4" /> : <Loader2 className="h-4 w-4 animate-spin" />}
            {ready ? 'Descargar PDF' : 'Preparando catálogo…'}
          </button>
          <a
            href={`/catalogo-pdf?${query}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-full border border-sage/20 px-5 py-2.5 text-sm font-semibold text-brown transition hover:border-gold"
          >
            <ExternalLink className="h-4 w-4" /> Abrir en otra pestaña
          </a>
          <p className="pt-1 text-xs leading-relaxed text-sage">
            En la ventana de impresión elige <strong>“Guardar como PDF”</strong>. Desde el celular usa “Abrir en otra pestaña”
            y toca “Descargar PDF”.
            {productCount !== null && <> El catálogo tiene <strong>{productCount}</strong> productos disponibles.</>}
          </p>
        </div>
      </aside>

      {/* Vista previa en vivo */}
      <div className="overflow-hidden rounded-[24px] border border-sage/10 bg-[#e9e4de] shadow-inner">
        <div className="flex items-center gap-2 border-b border-sage/10 bg-white/70 px-5 py-3 text-xs font-semibold text-sage">
          <BookOpen className="h-4 w-4 text-gold" /> Vista previa
        </div>
        <iframe
          key={query}
          ref={iframeRef}
          src={`/catalogo-pdf?${query}&embebido=1`}
          title="Vista previa del catálogo"
          className="h-[78vh] w-full bg-[#e9e4de]"
        />
      </div>
    </div>
  );
}
