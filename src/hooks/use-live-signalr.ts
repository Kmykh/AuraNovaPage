"use client";

import { useEffect, useRef, useCallback, useState } from 'react';
import { HubConnectionBuilder, HubConnection, LogLevel, HubConnectionState } from '@microsoft/signalr';
import { AuthSession } from '@/lib/auth-storage';
import type { LiveState, TikTokLiveStatePayload } from '@/types/live';

const HUB_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://auranova-backend.onrender.com') + '/hubs/live';

// ────────────────────────────────────────────────────
//  Hook para CLIENTES PÚBLICOS (oyentes anónimos)
// ────────────────────────────────────────────────────
export function useLivePublic() {
  const connectionRef = useRef<HubConnection | null>(null);

  const [liveText, setLiveText] = useState('');
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [tikTokUsername, setTikTokUsername] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(LogLevel.Warning)
      .build();

    connectionRef.current = connection;

    // ── Hidratación inicial ──
    connection.on('ReceiveLiveState', (state?: LiveState | null) => {
      if (!state) return;
      setLiveText(state.currentLiveText || '');
      setIsLiveActive(Boolean(state.isTikTokLiveActive));
      setTikTokUsername(state.tikTokUsername || null);
    });

    // ── Texto en tiempo real letra por letra ──
    connection.on('ReceiveLiveTyping', (text?: string | null) => {
      setLiveText(text || '');
    });

    // ── TikTok on/off ──
    connection.on('ReceiveTikTokLiveState', (data?: TikTokLiveStatePayload | null) => {
      if (!data) return;
      setIsLiveActive(Boolean(data.isActive));
      setTikTokUsername(data.tikTokUsername || null);
    });

    connection.onreconnected(() => setIsConnected(true));
    connection.onclose(() => setIsConnected(false));

    connection
      .start()
      .then(() => setIsConnected(true))
      .catch((err) => {
        if (err?.message?.includes('stopped during negotiation')) return;
        console.warn('[LiveHub Public] Conexión fallida:', err);
      });

    return () => {
      connection.stop();
    };
  }, []);

  return {
    liveText,
    isLiveActive,
    isTikTokActive: isLiveActive, // alias
    tikTokUsername,
    isConnected,
  };
}

// ────────────────────────────────────────────────────
//  Hook para SUPERADMIN / ADMIN (emisor autenticado)
// ────────────────────────────────────────────────────
export function useLiveAdmin() {
  const connectionRef = useRef<HubConnection | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [liveText, setLiveText] = useState('');
  const [isLiveTextActive, setIsLiveTextActive] = useState(false);
  const [isTikTokActive, setIsTikTokActive] = useState(false);
  const [tikTokUsername, setTikTokUsername] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => AuthSession.getToken() || '',
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(LogLevel.Information)
      .build();

    connectionRef.current = connection;

    // Escuchar el estado inicial
    connection.on('ReceiveLiveState', (state?: LiveState | null) => {
      if (!state) return;
      setLiveText(state.currentLiveText || '');
      setIsLiveTextActive(Boolean(state.isLiveTextActive));
      setIsTikTokActive(Boolean(state.isTikTokLiveActive));
      setTikTokUsername(state.tikTokUsername || '');
    });

    connection.on('ReceiveTikTokLiveState', (data?: TikTokLiveStatePayload | null) => {
      if (!data) return;
      setIsTikTokActive(Boolean(data.isActive));
      setTikTokUsername(data.tikTokUsername || '');
    });

    connection.onreconnected(() => setIsConnected(true));
    connection.onclose(() => setIsConnected(false));

    connection
      .start()
      .then(() => {
        setIsConnected(true);
        setError(null);
      })
      .catch((err) => {
        if (err?.message?.includes('stopped during negotiation')) return;
        console.error('[LiveHub Admin] Error:', err);
        setError('No se pudo conectar al Hub de transmisión. Verifica tu sesión.');
      });

    return () => {
      connection.stop();
    };
  }, []);

  // ── Acciones del Admin ──
  const toggleLiveText = useCallback((active: boolean) => {
    const conn = connectionRef.current;
    if (conn && conn.state === HubConnectionState.Connected) {
      setIsLiveTextActive(active);
      conn.invoke('ToggleLiveText', active).catch((err) => {
        console.error('[LiveHub] ToggleLiveText error:', err);
      });
    }
  }, []);

  const streamLiveText = useCallback((text: string) => {
    const conn = connectionRef.current;
    if (conn && conn.state === HubConnectionState.Connected) {
      conn.invoke('StreamLiveText', text).catch((err) => {
        console.error('[LiveHub] StreamLiveText error:', err);
      });
    }
  }, []);

  const toggleTikTokLive = useCallback((active: boolean, username: string | null = null) => {
    const conn = connectionRef.current;
    if (conn && conn.state === HubConnectionState.Connected) {
      setIsTikTokActive(active);
      conn.invoke('ToggleTikTokLive', active, username).catch((err) => {
        console.error('[LiveHub] ToggleTikTokLive error:', err);
        const errStr = String(err?.message || err);
        if (errStr.includes('not authorized') || errStr.includes('403') || errStr.includes('Unauthorized')) {
          setError('No estás autorizado para activar el live. En tu backend C#, permite [Authorize(Roles = "Admin,SuperAdmin")].');
        }
      });
    }
  }, []);

  return {
    isConnected,
    error,
    liveText,
    setLiveText,
    isLiveTextActive,
    toggleLiveText,
    isTikTokActive,
    isLiveActive: isTikTokActive, // alias
    tikTokUsername,
    setTikTokUsername,
    streamLiveText,
    toggleTikTokLive,
    toggleLiveStream: toggleTikTokLive, // alias
  };
}
