import { CreateOrderDeliveryRequest, DeliveryType, DeliveryZoneResponse, MeetingPointResponse } from '@/types/checkout';
import { isValidPeruPhone } from '@/lib/saved-customer';
import { isValidDni, ShippingAgency } from '@/lib/peru';

/** Datos de entrega que se piden en el checkout y en el pedido personalizado. */
export interface DeliveryFormValue {
  type: DeliveryType;
  zoneId: string;
  meetingPointId: string;
  /** Delivery: dirección exacta. Envío nacional: agencia/sucursal o dirección de destino. */
  address: string;
  reference: string;
  department: string;
  province: string;
  district: string;
  agency: ShippingAgency | '';
  /** Envío nacional: no sabe la sucursal y pide que elijamos la más cercana (si no, la sucursal es obligatoria) */
  branchUnknown: boolean;
  /** Lo recibe otra persona (regalo) */
  isGift: boolean;
  recipientName: string;
  recipientPhone: string;
  /** DNI de quien recoge en la agencia (envío nacional) */
  recipientDocument: string;
}

export const LOCAL_DEPARTMENT = 'Junín';
export const LOCAL_PROVINCE = 'Huancayo';

export const emptyDelivery = (): DeliveryFormValue => ({
  type: DeliveryType.Delivery,
  zoneId: '',
  meetingPointId: '',
  address: '',
  reference: '',
  department: LOCAL_DEPARTMENT,
  province: LOCAL_PROVINCE,
  district: '',
  agency: '',
  branchUnknown: false,
  isGift: false,
  recipientName: '',
  recipientPhone: '',
  recipientDocument: '',
});

export function deliveryCost(value: DeliveryFormValue, zones?: DeliveryZoneResponse[], points?: MeetingPointResponse[]): number {
  if (value.type === DeliveryType.Delivery) return zones?.find(z => z.id === value.zoneId)?.cost ?? 0;
  if (value.type === DeliveryType.MeetingPoint) return points?.find(p => p.id === value.meetingPointId)?.cost ?? 0;
  return 0;
}

/** Primer dato que falta o está mal, o null si se puede continuar. */
export function validateDelivery(value: DeliveryFormValue): string | null {
  if (value.type === DeliveryType.Delivery) {
    if (!value.zoneId) return 'Elige tu zona de reparto.';
    if (value.address.trim().length < 6) return 'Escribe la dirección exacta de entrega.';
  }
  if (value.type === DeliveryType.MeetingPoint && !value.meetingPointId) return 'Elige el punto de encuentro.';
  if (value.type === DeliveryType.NationalShipping) {
    if (!value.agency) return 'Elige la agencia (Shalom u Olva).';
    if (!value.department || !value.province.trim() || !value.district.trim()) return 'Elige el distrito a donde lo enviamos.';
    // En un distrito hay varias sucursales: la escribe o marca a propósito que no la sabe
    if (!value.branchUnknown && value.address.trim().length < 3) return `Escribe la sucursal de ${value.agency} o marca "No sé cuál sucursal".`;
    if (value.isGift && value.recipientName.trim().split(/\s+/).length < 2) return 'Escribe el nombre y apellido de quien recoge (como figura en su DNI).';
    if (!isValidDni(value.recipientDocument)) return value.isGift ? 'Ingresa el DNI de 8 dígitos de quien recoge.' : 'Ingresa tu DNI de 8 dígitos: la agencia lo pide al entregar.';
  }
  if (value.isGift) {
    if (value.recipientName.trim().length < 2) return 'Escribe el nombre de quien recibe.';
    if (!isValidPeruPhone(value.recipientPhone.replace(/\s/g, ''))) return 'Revisa el celular de quien recibe (9 dígitos).';
  }
  return null;
}

/** Lo que se envía al backend según la modalidad (solo los datos que aplican). */
export function toDeliveryRequest(value: DeliveryFormValue, zones?: DeliveryZoneResponse[]): CreateOrderDeliveryRequest {
  const recipient = value.isGift
    ? { recipientName: value.recipientName.trim(), recipientPhone: value.recipientPhone.replace(/\s/g, '') }
    : {};

  if (value.type === DeliveryType.Delivery) {
    return {
      type: value.type.toString(),
      deliveryZoneId: value.zoneId,
      deliveryAddress: value.address.trim(),
      deliveryReference: value.reference.trim() || undefined,
      department: LOCAL_DEPARTMENT,
      province: LOCAL_PROVINCE,
      district: zones?.find(z => z.id === value.zoneId)?.district ?? '',
      ...recipient,
    };
  }

  if (value.type === DeliveryType.MeetingPoint) {
    return {
      type: value.type.toString(),
      meetingPointId: value.meetingPointId,
      department: LOCAL_DEPARTMENT,
      province: LOCAL_PROVINCE,
      ...recipient,
    };
  }

  return {
    type: value.type.toString(),
    // La sucursal elegida o, si no la sabe, el pedido de que elijamos la más cercana
    deliveryAddress: branchText(value),
    deliveryReference: value.reference.trim() || undefined,
    department: value.department,
    province: value.province.trim(),
    district: value.district.trim(),
    preferredAgency: value.agency || undefined,
    recipientDocument: value.recipientDocument.replace(/\s/g, ''),
    ...recipient,
  };
}

/** Sucursal de la agencia tal como la ve el taller. */
export function branchText(value: DeliveryFormValue): string {
  return value.branchUnknown
    ? `Elegir la más cercana a ${value.district || 'su distrito'} y confirmar por WhatsApp`
    : value.address.trim();
}

/** Texto corto para resúmenes y el mensaje de WhatsApp de respaldo. */
export function describeDelivery(value: DeliveryFormValue, zones?: DeliveryZoneResponse[], points?: MeetingPointResponse[]): string {
  if (value.type === DeliveryType.Delivery) {
    const zone = zones?.find(z => z.id === value.zoneId);
    return `Delivery en Huancayo${zone ? ` (${zone.name})` : ''}: ${value.address}${value.reference ? ` — ${value.reference}` : ''}`;
  }
  if (value.type === DeliveryType.MeetingPoint) {
    const point = points?.find(p => p.id === value.meetingPointId);
    return `Punto de encuentro: ${point?.name ?? 'por elegir'}`;
  }
  const destination = [value.district, value.province, value.department].filter(Boolean).join(', ');
  const branch = ` — sucursal: ${branchText(value)}`;
  return `Envío por ${value.agency || 'agencia'} a ${destination}${branch} (el envío se paga al recoger)`;
}
