"use client";

import React from 'react';
import { useLivePublic } from '@/hooks/use-live-signalr';
import { LiveBanner } from './LiveBanner';
import { TikTokLiveWidget } from './TikTokLiveWidget';

/**
 * Wrapper global que se inyecta en el layout público.
 * Conecta al hub de forma anónima y renderiza condicionalmente
 * el banner de texto en vivo y el widget de TikTok.
 */
export function LiveOverlay() {
  const {
    liveText,
    isTikTokActive,
    tikTokUsername,
    viewerCount,
    totalLikes,
    comments,
    isConnected,
  } = useLivePublic();

  return (
    <>
      <LiveBanner text={liveText} isConnected={isConnected} />
      <TikTokLiveWidget
        isActive={isTikTokActive}
        tikTokUsername={tikTokUsername}
        viewerCount={viewerCount}
        totalLikes={totalLikes}
        comments={comments}
      />
    </>
  );
}
