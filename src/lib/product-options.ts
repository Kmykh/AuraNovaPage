import { AccessoryOption, ColorOption, ItemAccessory, ProductResponse } from '@/types/products';
import { formatCurrency } from '@/lib/formatters';

/** El cliente deja que el taller combine los colores (mismo texto que guarda el backend). */
export const MIXED_COLORS = 'Surtido multicolor';

/** Paleta inicial; la real viene de /api/customization-options y el panel la puede editar. */
export const DEFAULT_COLORS: ColorOption[] = [
  { name: 'Rojo', hex: '#ef4444' },
  { name: 'Rosado', hex: '#f472b6' },
  { name: 'Rosa Pastel', hex: '#fbcfe8' },
  { name: 'Blanco', hex: '#ffffff' },
  { name: 'Amarillo', hex: '#facc15' },
  { name: 'Azul', hex: '#3b82f6' },
  { name: 'Celeste', hex: '#93c5fd' },
  { name: 'Morado', hex: '#8b5cf6' },
  { name: 'Lila', hex: '#c4b5fd' },
  { name: 'Fucsia', hex: '#d946ef' },
  { name: 'Naranja', hex: '#fb923c' },
  { name: 'Champagne', hex: '#fef3c7' },
  { name: 'Vino Tinto', hex: '#881337' },
  { name: 'Multicolor', hex: 'multicolor' },
];

/**
 * Color que el cliente pide aunque no esté en la lista: "A pedido: Verde menta (#98FB98)".
 * Mismo formato que valida el backend; el taller ve el nombre y el tono exacto.
 */
export const CUSTOM_COLOR_PREFIX = 'A pedido: ';
const CUSTOM_COLOR_PATTERN = /^A pedido:\s*(.+?)\s*\((#[0-9a-f]{6})\)$/i;
/** Letras (con tildes), números, espacios y . ' - (igual que el backend), hasta 30 caracteres */
export const CUSTOM_COLOR_NAME_MAX = 30;
export const cleanCustomColorName = (value: string) => value.replace(/[^\p{L}\p{N} .'-]/gu, '').slice(0, CUSTOM_COLOR_NAME_MAX);

export function customColorValue(name: string, hex: string): string {
  return `${CUSTOM_COLOR_PREFIX}${cleanCustomColorName(name).trim()} (${hex.toUpperCase()})`;
}

export function parseCustomColor(value: string): { name: string; hex: string } | null {
  const match = CUSTOM_COLOR_PATTERN.exec(value.trim());
  return match ? { name: match[1], hex: match[2].toLowerCase() } : null;
}

/** Texto para mostrar: el color a pedido sin el código ("Verde menta · a pedido"). */
export function colorLabel(value: string): string {
  const custom = parseCustomColor(value);
  return custom ? `${custom.name} · a pedido` : value;
}

/** Tonos extra para el panel "Otro color" (los que el producto ya ofrece no se repiten). */
export const EXTRA_TONES: ColorOption[] = [
  { name: 'Verde menta', hex: '#98e2c6' },
  { name: 'Verde esmeralda', hex: '#2e8b57' },
  { name: 'Verde olivo', hex: '#7a8450' },
  { name: 'Turquesa', hex: '#40c4c4' },
  { name: 'Azul cielo', hex: '#87ceeb' },
  { name: 'Azul marino', hex: '#1f3a68' },
  { name: 'Lavanda', hex: '#b497d6' },
  { name: 'Fucsia', hex: '#e0218a' },
  { name: 'Coral', hex: '#ff7f6e' },
  { name: 'Durazno', hex: '#ffb38a' },
  { name: 'Salmón', hex: '#f4a08c' },
  { name: 'Terracota', hex: '#c8643b' },
  { name: 'Mostaza', hex: '#d4a017' },
  { name: 'Dorado', hex: '#c9a227' },
  { name: 'Crema', hex: '#f5ebd7' },
  { name: 'Beige', hex: '#d8c3a5' },
  { name: 'Café', hex: '#7b4b2a' },
  { name: 'Burdeos', hex: '#6d1a36' },
  { name: 'Plateado', hex: '#c0c0c8' },
  { name: 'Negro', hex: '#222222' },
];

/** Mientras el negocio no configure los suyos (igual que el backend): sin costo. */
export const DEFAULT_ACCESSORIES: AccessoryOption[] = [
  { key: 'luces', name: 'Luces LED', price: 0, active: true },
  { key: 'mariposas', name: 'Mariposas', price: 0, active: true },
];

/** Claves que ofrece el producto; los anteriores solo tenían luces y mariposas como sí/no. */
export function productAccessoryKeys(product: Pick<ProductResponse, 'availableAccessories' | 'allowsLights' | 'allowsButterfly'>): string[] {
  if (product.availableAccessories?.length) return product.availableAccessories;
  return [product.allowsLights && 'luces', product.allowsButterfly && 'mariposas'].filter(Boolean) as string[];
}

/** Accesorios activos del negocio que ofrece el producto, en el orden de la configuración. */
export function productAccessories(
  product: Pick<ProductResponse, 'availableAccessories' | 'allowsLights' | 'allowsButterfly'>,
  catalog: AccessoryOption[] = DEFAULT_ACCESSORIES,
): ItemAccessory[] {
  const keys = productAccessoryKeys(product);
  return catalog
    .filter(a => a.active && a.key && keys.includes(a.key))
    .map(a => ({ key: a.key!, name: a.name, price: a.price }));
}

/** Accesorios de un ítem; en carritos y pedidos anteriores, luces y mariposas como sí/no. */
export function itemAccessories(item: { accessories?: ItemAccessory[] | null; hasLights?: boolean; hasButterfly?: boolean }): ItemAccessory[] {
  if (item.accessories?.length) return item.accessories;
  const legacy: ItemAccessory[] = [];
  if (item.hasLights) legacy.push({ key: 'luces', name: 'Luces LED', price: 0 });
  if (item.hasButterfly) legacy.push({ key: 'mariposas', name: 'Mariposas', price: 0 });
  return legacy;
}

/** "+S/ 1.00" o "Incluido". */
export const accessoryPriceLabel = (price: number) => (price > 0 ? `+${formatCurrency(price)}` : 'Incluido');

export const DEFAULT_FLOWER_TYPES = [
  'Rosas', 'Girasoles', 'Tulipanes', 'Lirios', 'Orquídeas', 'Margaritas', 'Claveles', 'Hortensias',
  'Peonías', 'Crisantemos', 'Gerberas', 'Gypsophila (Lluvia)', 'Astromelias', 'Lavanda', 'Flores Silvestres',
];

const MULTICOLOR_BACKGROUND = 'conic-gradient(from 45deg, #ef4444, #facc15, #22c55e, #3b82f6, #d946ef, #ef4444)';
const UNKNOWN_BACKGROUND = 'linear-gradient(135deg, #e8dcdc, #c8a96b)';

const normalize = (value: string) => value.trim().toLocaleLowerCase('es');

/** Fondo CSS de la muestra de un color, buscando por nombre en la paleta. */
export function colorBackground(name: string, palette: ColorOption[] = DEFAULT_COLORS): string {
  if (normalize(name) === normalize(MIXED_COLORS)) return MULTICOLOR_BACKGROUND;
  const custom = parseCustomColor(name);
  if (custom) return custom.hex;
  const option = palette.find(c => normalize(c.name) === normalize(name))
    ?? DEFAULT_COLORS.find(c => normalize(c.name) === normalize(name));
  if (!option) return UNKNOWN_BACKGROUND;
  return option.hex === 'multicolor' ? MULTICOLOR_BACKGROUND : option.hex;
}

/** Colores muy claros necesitan borde para verse sobre fondos blancos. */
export function isLightColor(name: string, palette: ColorOption[] = DEFAULT_COLORS): boolean {
  const hex = colorBackground(name, palette);
  if (!hex.startsWith('#') || hex.length !== 7) return false;
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 215;
}

interface LegacyOptions {
  selectedColors?: string[] | null;
  selectedFlowerTypes?: string[] | null;
  selectedPrimaryColor?: string | null;
  selectedSecondaryColor?: string | null;
  selectedFlowerType?: string | null;
  selectedFlowerColor?: string | null;
}

const splitLegacy = (...values: (string | null | undefined)[]) =>
  values.filter(Boolean).flatMap(v => v!.split(',')).map(v => v.trim()).filter(Boolean);

/** Colores de un ítem: la lista nueva o, en pedidos/carritos anteriores, los campos con comas. */
export function itemColors(item: LegacyOptions): string[] {
  if (item.selectedColors?.length) return item.selectedColors;
  return splitLegacy(item.selectedPrimaryColor, item.selectedSecondaryColor)
    .map(c => (c === 'Surtido (Varios colores)' ? MIXED_COLORS : c));
}

export function itemFlowers(item: LegacyOptions): string[] {
  if (item.selectedFlowerTypes?.length) return item.selectedFlowerTypes;
  return splitLegacy(item.selectedFlowerType, item.selectedFlowerColor);
}

/** Galería del producto (con productos anteriores que solo tienen portada). */
export function productImages(product: Pick<ProductResponse, 'images' | 'imageUrl'>): string[] {
  if (product.images?.length) return product.images;
  return product.imageUrl ? [product.imageUrl] : [];
}
