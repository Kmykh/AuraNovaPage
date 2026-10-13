import { ColorOption, ProductResponse } from '@/types/products';

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
