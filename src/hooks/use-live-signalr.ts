"use client";

import { useEffect, useRef, useCallback, useState } from 'react';
import { HubConnectionBuilder, HubConnection, LogLevel, HubConnectionState } from '@microsoft/signalr';
import { AuthSession } from '@/lib/auth-storage';
import { apiClient } from '@/lib/api-client';

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
    // 1. Hidratación inmediata vía REST API por si el WebSocket demora
    apiClient.get('/api/live/state')
      .then((res) => {
        if (res.data) {
          const text = extractString(res.data, 'currentLiveText', 'CurrentLiveText', 'liveText', 'text') || '';
          const active = extractBoolean(res.data, 'isTikTokLiveActive', 'IsTikTokLiveActive', 'isActive', 'IsActive', 'isLiveActive');
          const user = extractString(res.data, 'tikTokUsername', 'TikTokUsername', 'username');

          if (text) setLiveText(text);
          if (active) setIsTikTokActive(active);
          if (user) setTikTokUsername(user);
        }
      })
      .catch(() => {});

    // 2. Conexión SignalR para tiempo real
    const connection = new HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(LogLevel.Warning)
      .build();

    connectionRef.current = connection;

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

    connection.on('ReceiveLiveTyping', (text?: string | null) => {
      setLiveText(text || '');
    });

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
    // Hidratar estado vía REST inicial
    apiClient.get('/api/live/state')
      .then((res) => {
        if (res.data) {
          const text = extractString(res.data, 'currentLiveText', 'CurrentLiveText', 'liveText') || '';
          const textActive = extractBoolean(res.data, 'isLiveTextActive', 'IsLiveTextActive');
          const tikTokActive = extractBoolean(res.data, 'isTikTokLiveActive', 'IsTikTokLiveActive', 'isActive', 'IsActive');
          const user = extractString(res.data, 'tikTokUsername', 'TikTokUsername') || '';

          if (text) setLiveText(text);
          setIsLiveTextActive(textActive);
          setIsTikTokActive(tikTokActive);
          if (user) setTikTokUsername(user);
        }
      })
      .catch(() => {});

    const connection = new HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => AuthSession.getToken() || '',
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(LogLevel.Information)
      .build();

    connectionRef.current = connection;

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
    setLiveText(text);
    const conn = connectionRef.current;
    if (conn && conn.state === HubConnectionState.Connected) {
      conn.invoke('StreamLiveText', text).catch(console.error);
    }
    // Fallback REST endpoint
    apiClient.post('/api/live/stream-text', { text }).catch(() => {});
  }, []);

  const toggleTikTokLive = useCallback(async (active: boolean, username: string | null = null) => {
    setIsTikTokActive(active);
    setError(null);

    let signalrSuccess = false;
    let restSuccess = false;

    // 1. Intentar vía SignalR Hub
    const conn = connectionRef.current;
    if (conn && conn.state === HubConnectionState.Connected) {
      try {
        await conn.invoke('ToggleTikTokLive', active, username);
        signalrSuccess = true;
      } catch (err: unknown) {
        console.warn('[LiveHub] Hub ToggleTikTokLive error:', err);
      }
    }

    // 2. Intentar vía REST API endpoint en LiveBroadcastController
    try {
      await apiClient.post('/api/live/toggle', { isActive: active, username: username || 'aura.nova40' });
      restSuccess = true;
    } catch {
      // Endpoint REST puede no estar desplegado aún en backend
    }

    // Si ambos fallaron porque el backend C# no tiene el método ToggleTikTokLive ni el endpoint REST
    if (!signalrSuccess && !restSuccess) {
      setError('Aviso: El backend C# no tiene registrado el método ToggleTikTokLive en LiveHub ni el endpoint /api/live/toggle. Revisa las instrucciones en pantalla para agregarlo.');
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
