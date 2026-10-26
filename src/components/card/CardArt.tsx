"use client";

import React from 'react';
import Image from 'next/image';
import { CardDesign, cardFont, cardTheme } from '@/lib/card-design';

type Placement = NonNullable<ReturnType<typeof cardTheme>['decoration']>['css'];

/** Posición de la ilustración en la tarjeta (el giro va como transform). */
function placement({ rotate, ...position }: Placement): React.CSSProperties {
  return { ...position, transform: rotate ? `rotate(${rotate}deg)` : undefined };
}

interface CardArtProps {
  design: CardDesign;
  className?: string;
  /** Texto de ejemplo cuando aún no hay mensaje */
  placeholder?: string;
}

/**
 * La tarjeta tal como se imprime, a cualquier tamaño: los textos se escalan con el ancho de la tarjeta
 * (unidades cqw), así se ve igual en la miniatura del carrito, en el editor y en el panel.
 */
export function CardArt({ design, className = '', placeholder = 'Tu mensaje aparecerá aquí…' }: CardArtProps) {
  const theme = cardTheme(design.theme);
  const font = cardFont(design.font);
  const photo = design.theme === 'foto' ? design.photo : null;
  const text = design.text.trim();
  const decoration = theme.decoration;

  return (
    <div
      className={`@container relative aspect-[16/10] w-full select-none overflow-hidden rounded-[2.2cqw] shadow-[0_1.5cqw_4cqw_-1.5cqw_rgba(74,57,51,0.35)] ${className}`}
      style={{ background: `linear-gradient(135deg, ${theme.stops[0]}, ${theme.stops[1]}, ${theme.stops[2]})` }}
      aria-label="Vista previa de la tarjeta"
    >
      {photo && (
        // Foto del cliente (data URL local o URL firmada del panel)
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt="" className="absolute inset-0 h-full w-full object-cover" />
      )}

      {decoration && (
        <div
          className="pointer-events-none absolute"
          style={{
            ...placement(decoration.css),
            opacity: decoration.alpha,
            mixBlendMode: decoration.blend === 'multiply' ? 'multiply' : undefined,
          }}
        >
          <Image src={decoration.image} alt="" className="h-auto w-full" sizes="240px" />
        </div>
      )}

      {/* Marco doble */}
      <div className="pointer-events-none absolute inset-[2.5%] rounded-[1.5cqw] border-[0.28cqw]" style={{ borderColor: theme.accent }} />
      <div className="pointer-events-none absolute inset-[3.5%] rounded-[1.2cqw] border-[0.1cqw]" style={{ borderColor: theme.accent }} />

      <div
        className={`absolute flex flex-col items-center text-center ${
          photo ? 'inset-x-[14%] inset-y-[15%] rounded-[2.2cqw] bg-[#fffcf6]/[0.86] px-[4cqw] py-[3cqw] backdrop-blur-[2px]' : 'inset-[7%] py-[1cqw]'
        }`}
      >
        <p className="font-serif text-[1.7cqw] font-semibold tracking-[0.5em]" style={{ color: theme.accent }}>✦ AURA NOVA ✦</p>
        <span className="mt-[1cqw] h-px w-[19%]" style={{ backgroundColor: theme.accent }} />

        {design.to.trim() && (
          <p className="mt-[2cqw] font-serif text-[2.4cqw] font-semibold" style={{ color: theme.accent }}>
            Para: {design.to.trim()}
          </p>
        )}

        <div className="flex w-full flex-1 items-center justify-center">
          {text ? (
            <p
              className={`w-full break-words leading-[1.45] ${font.css} ${text.length > 120 ? 'text-[2.4cqw]' : text.length > 70 ? 'text-[2.8cqw]' : 'text-[3.1cqw]'}`}
              style={{ color: theme.ink }}
            >
              &ldquo;{text}&rdquo;
            </p>
          ) : (
            <p className="font-serif text-[2.2cqw] italic opacity-60" style={{ color: theme.meta }}>{placeholder}</p>
          )}
        </div>

        {design.from.trim() && (
          <p className="font-serif text-[2.4cqw] italic" style={{ color: theme.accent }}>Con todo mi amor, {design.from.trim()}</p>
        )}
      </div>
    </div>
  );
}

/** Miniatura del diseño para el selector de temáticas. */
export function ThemeSwatch({ themeId, photo }: { themeId: string; photo?: string | null }) {
  const theme = cardTheme(themeId);
  return (
    <span
      className="relative block aspect-[16/10] w-full overflow-hidden rounded-lg border border-black/5"
      style={{ background: `linear-gradient(135deg, ${theme.stops[0]}, ${theme.stops[1]}, ${theme.stops[2]})` }}
    >
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : theme.decoration ? (
        <span className="absolute" style={{ ...placement(theme.decoration.css), opacity: theme.decoration.alpha + 0.15, mixBlendMode: theme.decoration.blend === 'multiply' ? 'multiply' : undefined }}>
          <Image src={theme.decoration.image} alt="" className="h-auto w-full" sizes="80px" />
        </span>
      ) : null}
      <span className="absolute inset-[6%] rounded-md border" style={{ borderColor: theme.accent }} />
    </span>
  );
}
