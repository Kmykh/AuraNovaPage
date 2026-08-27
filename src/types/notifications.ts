import { NotificationType, NotificationChannel, NotificationStatus } from './enums';

export interface NotificationResponse {
  id: string;
  orderId: string;
  orderCode: string;
  type: NotificationType;
  channel: NotificationChannel;
  status: NotificationStatus;
  recipient: string;
  message: string;
  channelUrl: string | null;
  createdAt: string;
}

export interface WhatsAppPreparationResponse {
  notificationId: string;
  status: NotificationStatus;
  phone: string;
  message: string;
  whatsappUrl: string;
}
