"use client";

import React, { useEffect, useRef, useState } from 'react';

type Variant = 'up' | 'fade' | 'left' | 'right' | 'scale';

const HIDDEN: Record<Variant, string> = {
  up: 'opacity-0 translate-y-10',
  fade: 'opacity-0',
  left: 'opacity-0 -translate-x-10',
  right: 'opacity-0 translate-x-10',
  scale: 'opacity-0 scale-95',
};

/** Aparece suave al entrar en pantalla (una sola vez). Con "reducir movimiento" se muestra sin animar. */
export function Reveal({ children, variant = 'up', delay = 0, className = '', as: Tag = 'div' }: {
  children: React.ReactNode;
  variant?: Variant;
  /** Milisegundos: para escalonar elementos de una misma fila */
  delay?: number;
  className?: string;
  as?: 'div' | 'section' | 'li' | 'span';
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) {
        setShown(true);
        observer.disconnect();
      }
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as React.Ref<never>}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${shown ? 'translate-x-0 translate-y-0 scale-100 opacity-100' : HIDDEN[variant]} ${className}`}
    >
      {children}
    </Tag>
  );
}
