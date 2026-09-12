/** Estado completo del directo, enviado al conectarse (hidratación inicial) */
export interface LiveState {
  currentLiveText: string;
  isLiveTextActive?: boolean;
  isTikTokLiveActive: boolean;
  tikTokUsername: string | null;
  viewerCount: number;
  totalLikes: number;
}

/** Estado on/off del TikTok Live */
export interface TikTokLiveStatePayload {
  isActive: boolean;
  tikTokUsername: string | null;
}

/** Estadísticas de TikTok en tiempo real */
export interface TikTokStats {
  viewerCount: number;
  totalLikes: number;
}

/** Comentario de un espectador de TikTok */
export interface TikTokComment {
  username: string;
  comment: string;
  userAvatarUrl: string | null;
}
