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
      .withUrl(HUB_URL)
      .withAutomaticReconnect([0, 1500, 3000, 5000, 10000, 30000])
      .configureLogging(LogLevel.Warning)
      .build();

    connectionRef.current = connection;

    // ── Parseo robusto del estado completo inicial ──
    const handleLiveState = (state?: Record<string, unknown> | null) => {
      if (!state) return;
      const text = (state.currentLiveText ?? state.liveText ?? state.text ?? '') as string;
      const active = Boolean(
        state.isTikTokLiveActive ?? 
        state.isLiveActive ?? 
        state.isActive ?? 
        state.isLive ?? 
        false
      );
      const username = (state.tikTokUsername ?? state.username ?? null) as string | null;

      setLiveText(text);
      setIsLiveActive(active);
      if (username) setTikTokUsername(username);
    };

    // ── Parseo robusto del toggle on/off ──
    const handleTikTokLiveState = (data?: Record<string, unknown> | boolean | null) => {
      if (data === null || data === undefined) return;
      if (typeof data === 'boolean') {
        setIsLiveActive(data);
        return;
      }
      const active = Boolean(
        data.isActive ?? 
        data.isTikTokLiveActive ?? 
        data.isLiveActive ?? 
        data.isLive ?? 
        false
      );
      const username = (data.tikTokUsername ?? data.username ?? null) as string | null;

      setIsLiveActive(active);
      if (username) setTikTokUsername(username);
    };

    // Escuchar múltiples nombres de evento para máxima compatibilidad
    connection.on('ReceiveLiveState', handleLiveState);
    connection.on('ReceiveTikTokLiveState', handleTikTokLiveState);
    connection.on('ReceiveLiveStatus', handleTikTokLiveState);

    // Texto en vivo letra por letra
    connection.on('ReceiveLiveTyping', (text?: string | null) => {
      setLiveText(text || '');
    });
    connection.on('ReceiveLiveText', (text?: string | null) => {
      setLiveText(text || '');
    });

    connection.onreconnected(() => setIsConnected(true));
    connection.onclose(() => setIsConnected(false));

    connection
      .start()
      .then(() => setIsConnected(true))
      .catch((err) => {
        if (err?.message?.includes('stopped during negotiation')) return;
        console.warn('[LiveHub Public] Error conectando:', err);
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
      .withAutomaticReconnect([0, 1500, 3000, 5000, 10000])
      .configureLogging(LogLevel.Information)
      .build();

    connectionRef.current = connection;

    const handleLiveState = (state?: Record<string, unknown> | null) => {
      if (!state) return;
      const text = (state.currentLiveText ?? state.liveText ?? state.text ?? '') as string;
      const active = Boolean(
        state.isTikTokLiveActive ?? 
        state.isLiveActive ?? 
        state.isActive ?? 
        state.isLive ?? 
        false
      );
      const username = (state.tikTokUsername ?? state.username ?? '') as string;

      setLiveText(text);
      setIsLiveActive(active);
      if (username) setTikTokUsername(username);
    };

    const handleTikTokLiveState = (data?: Record<string, unknown> | boolean | null) => {
      if (data === null || data === undefined) return;
      if (typeof data === 'boolean') {
        setIsLiveActive(data);
        return;
      }
      const active = Boolean(
        data.isActive ?? 
        data.isTikTokLiveActive ?? 
        data.isLiveActive ?? 
        data.isLive ?? 
        false
      );
      const username = (data.tikTokUsername ?? data.username ?? '') as string;

      setIsLiveActive(active);
      if (username) setTikTokUsername(username);
    };

    connection.on('ReceiveLiveState', handleLiveState);
    connection.on('ReceiveTikTokLiveState', handleTikTokLiveState);
    connection.on('ReceiveLiveStatus', handleTikTokLiveState);

    connection.on('ReceiveLiveTyping', (text?: string | null) => {
      setLiveText(text || '');
    });
    connection.on('ReceiveLiveText', (text?: string | null) => {
      setLiveText(text || '');
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
        console.warn('[LiveHub Admin] Conexión:', err);
        setIsConnected(false);
      });

    return () => {
      connection.stop();
    };
  }, []);

  // ── Encender / Apagar Live ──
  const toggleLiveStream = useCallback(async (active: boolean, username?: string | null) => {
    setError(null);
    setIsLiveActive(active);

    const conn = connectionRef.current;
    if (conn && conn.state === HubConnectionState.Connected) {
      try {
        // Enviar toggle tanto de TikTok como de Texto para abrir compuertas
        await conn.invoke('ToggleTikTokLive', active, username || null);
        await conn.invoke('ToggleLiveText', active).catch(() => {});
      } catch (err: unknown) {
        console.warn('[LiveHub Admin] Hub invoke error:', err);
        try {
          await conn.invoke('ToggleLive', active, username || null);
        } catch {
          const errStr = (err as Error)?.message || String(err);
          if (errStr.includes('not authorized') || errStr.includes('403') || errStr.includes('Unauthorized')) {
            setError('Error de autorización: Tu rol debe estar permitido en el backend ([Authorize(Roles = "Admin,SuperAdmin")]).');
          }
        }
      }
    }

    // Fallback a REST API
    try {
      await apiClient.post('/api/LiveBroadcast/toggle', { 
        isActive: active, 
        username: username || null 
      });
    } catch {
      try {
        await apiClient.post('/api/admin/live/toggle', { isActive: active });
      } catch {}
    }
  }, []);

  // ── Emitir texto en tiempo real ──
  const streamLiveText = useCallback((text: string) => {
    setLiveText(text);
    const conn = connectionRef.current;
    if (conn && conn.state === HubConnectionState.Connected) {
      // Aseguramos que la compuerta de texto esté abierta en el backend
      conn.invoke('ToggleLiveText', true)
        .then(() => conn.invoke('StreamLiveText', text))
        .catch(() => {
          conn.invoke('StreamLiveText', text).catch(console.error);
        });
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
    toggleTikTokLive: toggleLiveStream,
  };
}
