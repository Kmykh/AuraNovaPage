"use client";

import { useEffect, useRef, useCallback, useState } from 'react';
import { HubConnectionBuilder, HubConnection, LogLevel, HubConnectionState } from '@microsoft/signalr';
import { AuthSession } from '@/lib/auth-storage';

const HUB_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://auranova-backend.onrender.com') + '/hubs/live';

// Helpers para parsear tanto camelCase como PascalCase de C# ASP.NET Core
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractBoolean(obj: any, ...keys: string[]): boolean {
  if (obj === null || obj === undefined) return false;
  if (typeof obj === 'boolean') return obj;
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null) {
      return Boolean(obj[key]);
    }
  }
  return false;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractString(obj: any, ...keys: string[]): string | null {
  if (obj === null || obj === undefined) return null;
  if (typeof obj === 'string') return obj;
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null) {
      return String(obj[key]);
    }
  }
  return null;
}

// ────────────────────────────────────────────────────
//  Hook para CLIENTES PÚBLICOS (oyentes anónimos)
// ────────────────────────────────────────────────────
export function useLivePublic() {
  const connectionRef = useRef<HubConnection | null>(null);

  const [liveText, setLiveText] = useState('');
  const [isTikTokActive, setIsTikTokActive] = useState(false);
  const [tikTokUsername, setTikTokUsername] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(LogLevel.Warning)
      .build();

    connectionRef.current = connection;

    // ── Hidratación inicial (acepta camelCase y PascalCase de C#) ──
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    connection.on('ReceiveLiveState', (state: any) => {
      if (!state) return;
      const text = extractString(state, 'currentLiveText', 'CurrentLiveText', 'liveText', 'LiveText', 'text', 'Text') || '';
      const active = extractBoolean(state, 'isTikTokLiveActive', 'IsTikTokLiveActive', 'isActive', 'IsActive', 'isLiveActive', 'IsLiveActive', 'isLive', 'IsLive');
      const user = extractString(state, 'tikTokUsername', 'TikTokUsername', 'username', 'Username');

      setLiveText(text);
      setIsTikTokActive(active);
      if (user) setTikTokUsername(user);
    });

    // ── Texto en vivo letra por letra ──
    connection.on('ReceiveLiveTyping', (text?: string | null) => {
      setLiveText(text || '');
    });

    // ── TikTok on/off (acepta camelCase, PascalCase y booleano directo) ──
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleTikTokLive = (data: any) => {
      if (data === null || data === undefined) return;
      const active = extractBoolean(data, 'isActive', 'IsActive', 'isTikTokLiveActive', 'IsTikTokLiveActive', 'isLiveActive', 'IsLiveActive', 'isLive', 'IsLive');
      const user = extractString(data, 'tikTokUsername', 'TikTokUsername', 'username', 'Username');

      setIsTikTokActive(active);
      if (user) setTikTokUsername(user);
    };

    connection.on('ReceiveTikTokLiveState', handleTikTokLive);
    connection.on('ReceiveLiveStatus', handleTikTokLive);

    connection.onreconnected(() => setIsConnected(true));
    connection.onclose(() => setIsConnected(false));

    connection
      .start()
      .then(() => setIsConnected(true))
      .catch((err) => {
        if (err?.message?.includes('stopped during negotiation')) return;
        console.warn('[LiveHub Public] Conexión:', err);
      });

    return () => {
      connection.stop();
    };
  }, []);

  return {
    liveText,
    isTikTokActive,
    isLiveActive: isTikTokActive, // alias
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

    // Escuchar el estado inicial (acepta camelCase y PascalCase)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    connection.on('ReceiveLiveState', (state: any) => {
      if (!state) return;
      const text = extractString(state, 'currentLiveText', 'CurrentLiveText', 'liveText', 'LiveText') || '';
      const textActive = extractBoolean(state, 'isLiveTextActive', 'IsLiveTextActive');
      const tikTokActive = extractBoolean(state, 'isTikTokLiveActive', 'IsTikTokLiveActive', 'isActive', 'IsActive');
      const user = extractString(state, 'tikTokUsername', 'TikTokUsername') || '';

      setLiveText(text);
      setIsLiveTextActive(textActive);
      setIsTikTokActive(tikTokActive);
      if (user) setTikTokUsername(user);
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleTikTokLive = (data: any) => {
      if (data === null || data === undefined) return;
      const active = extractBoolean(data, 'isActive', 'IsActive', 'isTikTokLiveActive', 'IsTikTokLiveActive');
      const user = extractString(data, 'tikTokUsername', 'TikTokUsername');

      setIsTikTokActive(active);
      if (user) setTikTokUsername(user);
    };

    connection.on('ReceiveTikTokLiveState', handleTikTokLive);
    connection.on('ReceiveLiveStatus', handleTikTokLive);

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
        setError('No se pudo conectar al Hub de transmisión.');
      });

    return () => {
      connection.stop();
    };
  }, []);

  // ── Acciones del Admin ──
  const toggleLiveText = useCallback((active: boolean) => {
    setIsLiveTextActive(active);
    const conn = connectionRef.current;
    if (conn && conn.state === HubConnectionState.Connected) {
      conn.invoke('ToggleLiveText', active).catch(console.error);
    }
  }, []);

  const streamLiveText = useCallback((text: string) => {
    const conn = connectionRef.current;
    if (conn && conn.state === HubConnectionState.Connected) {
      conn.invoke('StreamLiveText', text).catch(console.error);
    }
  }, []);

  const toggleTikTokLive = useCallback((active: boolean, username: string | null = null) => {
    setIsTikTokActive(active); // Actualización optimista inmediata en UI
    const conn = connectionRef.current;
    if (conn && conn.state === HubConnectionState.Connected) {
      conn.invoke('ToggleTikTokLive', active, username).catch((err) => {
        console.error('[LiveHub] ToggleTikTokLive error:', err);
        // Fallback por si el método en backend requiere string vacío en vez de null
        conn.invoke('ToggleTikTokLive', active, username || '').catch(console.error);
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
