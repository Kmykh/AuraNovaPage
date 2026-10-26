import { NotificationType, NotificationChannel, NotificationStatus } from './enums';

export interface NotificationResponse {
  id: string;
  orderId: string;
  orderCode: string;
  type: NotificationType;
  channel: NotificationChannel;
  status: NotificationStatus;
  recipient: string;
  customerName?: string | null;
  subject?: string | null;
  message: string;
  channelUrl: string | null;
  errorMessage?: string | null;
  sentAt?: string | null;
  createdAt: string;
}

export interface WhatsAppPreparationResponse {
  notificationId: string;
  status: NotificationStatus;
  phone: string;
  message: string;
  whatsappUrl: string;
}
