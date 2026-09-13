/** Estado completo del directo, enviado al conectarse (hidratación inicial) */
export interface LiveState {
  currentLiveText: string;
  isLiveTextActive?: boolean;
  isTikTokLiveActive: boolean;
  tikTokUsername?: string | null;
  // Campos opcionales por compatibilidad con respuestas antiguas del backend
  viewerCount?: number;
  totalLikes?: number;
}

/** Estado on/off del directo */
export interface TikTokLiveStatePayload {
  isActive: boolean;
  tikTokUsername?: string | null;
}
