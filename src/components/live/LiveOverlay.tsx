"use client";

import React from 'react';
import { useLivePublic } from '@/hooks/use-live-signalr';
import { LiveBanner } from './LiveBanner';
import { TikTokLiveNotice } from './TikTokLiveNotice';

/**
 * Wrapper global inyectado en el layout público.
 * - LiveBanner: Anuncio en vivo en tiempo real que aparece en la parte superior.
 * - TikTokLiveNotice: Aviso flotante en la esquina inferior derecha avisando que estamos en Live por TikTok con ofertas.
 */
export function LiveOverlay() {
  const {
    liveText,
    isLiveActive,
    tikTokUsername,
    isConnected,
  } = useLivePublic();

  return (
    <>
      <LiveBanner text={liveText} isConnected={isConnected} />
      <TikTokLiveNotice
        isActive={isLiveActive}
        tikTokUsername={tikTokUsername}
      />
    </>
  );
}
