"use client";

import { useEffect, useRef, useCallback, useState } from 'react';
import { HubConnectionBuilder, HubConnection, LogLevel, HubConnectionState } from '@microsoft/signalr';
import { AuthSession } from '@/lib/auth-storage';
import { apiClient } from '@/lib/api-client';
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
    connection.on('ReceiveLiveState', (state?: LiveState | null) => {
      if (!state) return;
      setLiveText(state.currentLiveText || '');
      setIsLiveActive(Boolean(state.isTikTokLiveActive));
      setTikTokUsername(state.tikTokUsername || null);
    });

    // ── Texto letra por letra ──
    connection.on('ReceiveLiveTyping', (text?: string | null) => {
      setLiveText(text || '');
    });

    // ── Live on/off ──
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
        if (err?.message?.includes('stopped during negotiation')) {
          return;
        }
        console.warn('[LiveHub Public] Conexión fallida:', err);
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
//  Hook para ADMINISTRADORES
// ────────────────────────────────────────────────────
export function useLiveAdmin() {
  const connectionRef = useRef<HubConnection | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [liveText, setLiveText] = useState('');
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [tikTokUsername, setTikTokUsername] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = AuthSession.getToken() || '';

    const connection = new HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(LogLevel.Information)
      .build();

    connectionRef.current = connection;

    // Escuchar el estado inicial
    connection.on('ReceiveLiveState', (state?: LiveState | null) => {
      if (!state) return;
      setLiveText(state.currentLiveText || '');
      setIsLiveActive(Boolean(state.isTikTokLiveActive));
      setTikTokUsername(state.tikTokUsername || '');
    });

    connection.on('ReceiveTikTokLiveState', (data?: TikTokLiveStatePayload | null) => {
      if (!data) return;
      setIsLiveActive(Boolean(data.isActive));
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
          return;
        }
        console.warn('[LiveHub Admin] Error al conectar:', err);
        // No bloqueamos si falla la negociación inicial de WebSockets
        setIsConnected(false);
      });

    return () => {
      connection.stop();
    };
  }, []);

  // ── Acciones de activación / desactivación ──
  const toggleLiveStream = useCallback(async (active: boolean, username?: string | null) => {
    setError(null);
    setIsLiveActive(active);

    let signalrSuccess = false;

    // 1. Intentar vía SignalR Hub
    const conn = connectionRef.current;
    if (conn && conn.state === HubConnectionState.Connected) {
      try {
        await conn.invoke('ToggleTikTokLive', active, username || null);
        signalrSuccess = true;
      } catch (err: unknown) {
        console.warn('[LiveHub Admin] SignalR invoke error:', err);
        const errStr = (err as Error)?.message || String(err);
        if (errStr.includes('not authorized') || errStr.includes('403') || errStr.includes('Unauthorized')) {
          setError('No estás autorizado en el Hub de SignalR. Asegúrate de permitir el rol Admin y SuperAdmin en el backend.');
        }
      }
    }

    // 2. Intentar vía HTTP Controller REST (LiveBroadcastController)
    try {
      await apiClient.post('/api/LiveBroadcast/toggle', { 
        isActive: active, 
        username: username || null 
      });
      setError(null); // Si el controller REST respondió OK, limpiamos errores
    } catch (apiErr: unknown) {
      const errObj = apiErr as { status?: number; message?: string };
      if (errObj?.status === 403) {
        setError('No estás autorizado (Error 403). En tu LiveBroadcastController.cs, cambia [Authorize(Roles = "SuperAdmin")] a [Authorize(Roles = "Admin,SuperAdmin")] o [Authorize].');
        setIsLiveActive(!active); // Revertir
      } else if (errObj?.status === 401) {
        setError('Tu sesión ha expirado o el token es inválido. Por favor inicia sesión de nuevo.');
        setIsLiveActive(!active); // Revertir
      } else if (!signalrSuccess && errObj?.status !== 404) {
        // Solo avisar si ambos fallaron y no fue un simple 404 de ruta no implementada
        console.warn('[LiveHub Admin] API endpoint error:', apiErr);
      }
    }
  }, []);

  const streamLiveText = useCallback((text: string) => {
    const conn = connectionRef.current;
    if (conn && conn.state === HubConnectionState.Connected) {
      conn.invoke('StreamLiveText', text).catch(console.error);
    }
  }, []);

  return {
    isConnected,
    error,
    setError,
    liveText,
    setLiveText,
    isLiveActive,
    tikTokUsername,
    setTikTokUsername,
    streamLiveText,
    toggleLiveStream,
    toggleTikTokLive: toggleLiveStream, // alias de compatibilidad
  };
}
