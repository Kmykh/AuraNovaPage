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
      .withUrl(HUB_URL) // Sin token → conexión anónima
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(LogLevel.Warning)
      .build();

    connectionRef.current = connection;

    // ── Hidratación inicial ──
    connection.on('ReceiveLiveState', (state: LiveState) => {
      setLiveText(state.currentLiveText || '');
      setIsLiveActive(state.isTikTokLiveActive);
      setTikTokUsername(state.tikTokUsername || null);
    });

    // ── Texto letra por letra ──
    connection.on('ReceiveLiveTyping', (text: string) => {
      setLiveText(text);
    });

    // ── Live on/off ──
    connection.on('ReceiveTikTokLiveState', (data: TikTokLiveStatePayload) => {
      setIsLiveActive(data.isActive);
      setTikTokUsername(data.tikTokUsername || null);
    });

    connection.onreconnected(() => setIsConnected(true));
    connection.onclose(() => setIsConnected(false));

    connection
      .start()
      .then(() => setIsConnected(true))
      .catch((err) => {
        if (err?.message?.includes('stopped during negotiation')) {
          return; // Ignoramos el error inofensivo de React Strict Mode
        }
        console.warn('[LiveHub] Conexión fallida:', err);
      });

    return () => {
      connection.stop();
    };
  }, []);

  return {
    liveText,
    isLiveActive,
    isTikTokActive: isLiveActive, // alias de compatibilidad
    tikTokUsername,
    isConnected,
  };
}

// ────────────────────────────────────────────────────
//  Hook para SUPERADMIN (emisor autenticado)
// ────────────────────────────────────────────────────
export function useLiveAdmin() {
  const connectionRef = useRef<HubConnection | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [liveText, setLiveText] = useState('');
  const [isLiveTextActive, setIsLiveTextActive] = useState(false);
  const [isLiveActive, setIsLiveActive] = useState(false);
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

    // Escuchar el estado inicial (el admin también lo recibe)
    connection.on('ReceiveLiveState', (state: LiveState) => {
      setLiveText(state.currentLiveText || '');
      setIsLiveTextActive(state.isLiveTextActive || false);
      setIsLiveActive(state.isTikTokLiveActive);
      setTikTokUsername(state.tikTokUsername || '');
    });

    connection.on('ReceiveTikTokLiveState', (data: TikTokLiveStatePayload) => {
      setIsLiveActive(data.isActive);
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
        if (err?.message?.includes('stopped during negotiation')) {
          return; // Ignoramos el error inofensivo de React Strict Mode
        }
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
      conn.invoke('ToggleLiveText', active).catch(console.error);
    }
  }, []);

  const streamLiveText = useCallback((text: string) => {
    const conn = connectionRef.current;
    if (conn && conn.state === HubConnectionState.Connected) {
      conn.invoke('StreamLiveText', text).catch(console.error);
    }
  }, []);

  const toggleLiveStream = useCallback((active: boolean, username?: string | null) => {
    const conn = connectionRef.current;
    if (conn && conn.state === HubConnectionState.Connected) {
      setIsLiveActive(active);
      conn.invoke('ToggleTikTokLive', active, username || null).catch(console.error);
    }
  }, []);

  return {
    isConnected,
    error,
    liveText,
    setLiveText,
    isLiveTextActive,
    toggleLiveText,
    isLiveActive,
    isTikTokActive: isLiveActive, // alias de compatibilidad
    tikTokUsername,
    setTikTokUsername,
    streamLiveText,
    toggleLiveStream,
    toggleTikTokLive: toggleLiveStream, // alias de compatibilidad
  };
}
