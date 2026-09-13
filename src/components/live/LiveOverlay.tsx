"use client";

import React from 'react';
import { useLivePublic } from '@/hooks/use-live-signalr';
import { LiveBanner } from './LiveBanner';
import { LiveStatusWidget } from './LiveStatusWidget';

/**
 * Wrapper global inyectado en el layout público.
 * Muestra el banner de anuncio en vivo cuando hay texto activo,
 * y la píldora informativa que avisa elegantemente si estamos en vivo o fuera del aire.
 */
export function LiveOverlay() {
  const {
    liveText,
    isTikTokActive,
    tikTokUsername,
    isConnected,
  } = useLivePublic();

  return (
    <>
      <LiveBanner text={liveText} isConnected={isConnected} />
      <LiveStatusWidget
        isActive={isTikTokActive}
        tikTokUsername={tikTokUsername}
      />
    </>
  );
}
