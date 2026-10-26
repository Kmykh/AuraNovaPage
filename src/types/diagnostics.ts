import { NotificationStatus, NotificationType } from './enums';

export interface EmailDeliveryLog {
  id: string;
  orderCode?: string | null;
  type: NotificationType | string;
  status: NotificationStatus | string;
  recipient: string;
  errorMessage?: string | null;
  createdAt: string;
  sentAt?: string | null;
}

/** Estado de los correos automáticos (nunca incluye la API key). */
export interface EmailStatusResponse {
  configured: boolean;
  provider: string;
  fromAddress?: string | null;
  fromName?: string | null;
  replyTo?: string | null;
  /** Qué falta configurar, si algo falta */
  problem?: string | null;
  recent: EmailDeliveryLog[];
}

export interface EmailTestResponse {
  ok: boolean;
  provider: string;
  message: string;
}
