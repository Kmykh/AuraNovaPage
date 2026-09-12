"use client";

import { useEffect, useRef, useCallback, useState } from 'react';
import { HubConnectionBuilder, HubConnection, LogLevel, HubConnectionState } from '@microsoft/signalr';
import { AuthSession } from '@/lib/auth-storage';
import type { LiveState, TikTokLiveStatePayload, TikTokStats, TikTokComment } from '@/types/live';

const HUB_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://auranova-backend.onrender.com') + '/hubs/live';

// ────────────────────────────────────────────────────
//  Hook para CLIENTES PÚBLICOS (oyentes anónimos)
// ────────────────────────────────────────────────────
export function useLivePublic() {
  const connectionRef = useRef<HubConnection | null>(null);

  const [liveText, setLiveText] = useState('');
  const [isTikTokActive, setIsTikTokActive] = useState(false);
  const [tikTokUsername, setTikTokUsername] = useState<string | null>(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [totalLikes, setTotalLikes] = useState(0);
  const [comments, setComments] = useState<TikTokComment[]>([]);
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
      setIsTikTokActive(state.isTikTokLiveActive);
      setTikTokUsername(state.tikTokUsername);
      setViewerCount(state.viewerCount);
      setTotalLikes(state.totalLikes);
    });

    // ── Texto letra por letra ──
    connection.on('ReceiveLiveTyping', (text: string) => {
      setLiveText(text);
    });

    // ── TikTok on/off ──
    connection.on('ReceiveTikTokLiveState', (data: TikTokLiveStatePayload) => {
      setIsTikTokActive(data.isActive);
      setTikTokUsername(data.tikTokUsername);
    });

    // ── Estadísticas ──
    connection.on('ReceiveTikTokStats', (stats: TikTokStats) => {
      setViewerCount(stats.viewerCount);
      setTotalLikes(stats.totalLikes);
    });

    // ── Comentarios (mantener últimos 50) ──
    connection.on('ReceiveTikTokComment', (c: TikTokComment) => {
      setComments(prev => [...prev.slice(-49), c]);
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
    isTikTokActive,
    tikTokUsername,
    viewerCount,
    totalLikes,
    comments,
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
  const [isTikTokActive, setIsTikTokActive] = useState(false);
  const [tikTokUsername, setTikTokUsername] = useState('');
  const [viewerCount, setViewerCount] = useState(0);
  const [totalLikes, setTotalLikes] = useState(0);
  const [comments, setComments] = useState<TikTokComment[]>([]);
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
      setIsTikTokActive(state.isTikTokLiveActive);
      setTikTokUsername(state.tikTokUsername || '');
      setViewerCount(state.viewerCount);
      setTotalLikes(state.totalLikes);
    });

    connection.on('ReceiveTikTokStats', (stats: TikTokStats) => {
      setViewerCount(stats.viewerCount);
      setTotalLikes(stats.totalLikes);
    });

    connection.on('ReceiveTikTokComment', (c: TikTokComment) => {
      setComments(prev => [...prev.slice(-99), c]);
    });

    connection.on('ReceiveTikTokLiveState', (data: TikTokLiveStatePayload) => {
      setIsTikTokActive(data.isActive);
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
  const streamLiveText = useCallback((text: string) => {
    const conn = connectionRef.current;
    if (conn && conn.state === HubConnectionState.Connected) {
      conn.invoke('StreamLiveText', text).catch(console.error);
    }
  }, []);

  const toggleTikTokLive = useCallback((active: boolean, username: string | null) => {
    const conn = connectionRef.current;
    if (conn && conn.state === HubConnectionState.Connected) {
      conn.invoke('ToggleTikTokLive', active, username).catch(console.error);
    }
  }, []);

  return {
    isConnected,
    error,
    liveText,
    setLiveText,
    isTikTokActive,
    tikTokUsername,
    setTikTokUsername,
    viewerCount,
    totalLikes,
    comments,
    streamLiveText,
    toggleTikTokLive,
  };
}
