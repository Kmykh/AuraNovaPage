import { toast as sonnerToast, ExternalToast } from 'sonner';

/**
 * Envoltorio sobre Sonner para centralizar el uso de notificaciones
 * en caso de que se necesiten configuraciones por defecto.
 */
export const toast = {
  success: (message: string, data?: ExternalToast) => {
    return sonnerToast.success(message, data);
  },
  error: (message: string, data?: ExternalToast) => {
    return sonnerToast.error(message, data);
  },
  warning: (message: string, data?: ExternalToast) => {
    return sonnerToast.warning(message, data);
  },
  info: (message: string, data?: ExternalToast) => {
    return sonnerToast.info(message, data);
  },
  default: (message: string, data?: ExternalToast) => {
    return sonnerToast(message, data);
  }
};
