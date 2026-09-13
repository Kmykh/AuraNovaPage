"use client";

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductSectionSliderProps {
  children: React.ReactNode;
  theme?: 'campaign' | 'gold';
  className?: string;
}

export function ProductSectionSlider({
  children,
  theme = 'gold',
  className = ''
}: ProductSectionSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [itemsCount, setItemsCount] = useState(0);

  // Convert children to array
  const items = React.Children.toArray(children);

  useEffect(() => {
    setItemsCount(items.length);
  }, [items.length]);

  const updateActiveIndex = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const scrollLeft = container.scrollLeft;
    const containerCenter = scrollLeft + container.clientWidth / 2;
    const childNodes = Array.from(container.children) as HTMLElement[];
    if (childNodes.length === 0) return;

    let closestIndex = 0;
    let minDiff = Infinity;

    childNodes.forEach((child, idx) => {
      const childCenter = child.offsetLeft + child.offsetWidth / 2;
      const diff = Math.abs(childCenter - containerCenter);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = idx;
      }
    });

    setActiveIndex(closestIndex);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let timeoutId: NodeJS.Timeout;
    const onScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateActiveIndex, 40);
    };

    container.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      clearTimeout(timeoutId);
      container.removeEventListener('scroll', onScroll);
    };
  }, [updateActiveIndex]);

  const scrollToIndex = (index: number) => {
    const container = containerRef.current;
    if (!container) return;
    const childNodes = Array.from(container.children) as HTMLElement[];
    if (childNodes[index]) {
      childNodes[index].scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
      setActiveIndex(index);
    }
  };

  const isCampaign = theme === 'campaign';
  const activePillColor = isCampaign ? 'bg-[#4A3933]' : 'bg-[#c8a96b]';

  return (
    <div className={`w-full relative ${className}`}>
      {/* ── Apple-style Centered Snap Track on Mobile / Responsive Grid on Desktop ── */}
      <div
        ref={containerRef}
        className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 overflow-x-auto sm:overflow-visible snap-x snap-mandatory scroll-smooth no-scrollbar -mx-4 sm:mx-0 px-[11vw] sm:px-0 py-3 items-stretch"
      >
        {items.map((child, idx) => {
          const isChildActive = activeIndex === idx;
          return (
            <div
              key={idx}
              className="w-[78vw] max-w-[305px] shrink-0 snap-center sm:w-auto sm:max-w-none sm:shrink sm:snap-none flex flex-col transition-transform duration-300"
            >
              {React.isValidElement(child)
                ? React.cloneElement(child as React.ReactElement<{ isActive?: boolean }>, {
                    isActive: isChildActive
                  })
                : child}
            </div>
          );
        })}
      </div>

      {/* ── Apple-style Minimalist Controls (Mobile Only) ── */}
      {itemsCount > 1 && (
        <div className="flex sm:hidden flex-col items-center gap-2 mt-3">
          {/* Floating Pill Controller */}
          <div className="flex items-center gap-2.5 bg-white/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <button
              onClick={() => scrollToIndex(Math.max(0, activeIndex - 1))}
              disabled={activeIndex === 0}
              className="w-6 h-6 rounded-full flex items-center justify-center text-[#4A3933] hover:bg-black/5 active:scale-90 transition-all disabled:opacity-20 disabled:pointer-events-none"
              aria-label="Producto anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Apple Pagination Dots */}
            <div className="flex items-center gap-1.5 px-0.5">
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => scrollToIndex(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ease-out ${
                    activeIndex === i
                      ? `w-5 ${activePillColor} shadow-xs`
                      : 'w-1.5 bg-stone-300/80 hover:bg-stone-400'
                  }`}
                  aria-label={`Ir al producto ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => scrollToIndex(Math.min(itemsCount - 1, activeIndex + 1))}
              disabled={activeIndex >= itemsCount - 1}
              className="w-6 h-6 rounded-full flex items-center justify-center text-[#4A3933] hover:bg-black/5 active:scale-90 transition-all disabled:opacity-20 disabled:pointer-events-none"
              aria-label="Siguiente producto"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <span className="text-[11px] text-stone-400 font-sans tracking-wide">
            Desliza para explorar ({activeIndex + 1} de {itemsCount})
          </span>
        </div>
      )}
    </div>
  );
}
