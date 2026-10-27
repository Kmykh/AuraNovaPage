import { Category, ProductAudience } from './categories';

export interface ProductResponse {
  id: string;
  name: string;
  description: string | null;
  price: number;
  effectivePrice: number;
  isCampaignActive: boolean;
  campaignName?: string;
  campaignStageName?: string;
  /** Hasta cuándo dura el precio de la etapa actual */
  campaignStageEndsAt?: string | null;
  /** Solo en el detalle: etapas de la campaña con el precio de este producto */
  campaignStages?: ProductCampaignStage[] | null;
  stock: number;
  /** Portada (la primera de `images`) */
  imageUrl: string | null;
  /** Galería en orden, incluye la portada */
  images?: string[];
  isAvailable: boolean;
  availableColors: string[];
  availableFlowerTypes: string[];
  allowsLights: boolean;
  allowsButterfly: boolean;
  allowsPhraseCard: boolean;
  /** Cuántos colores y tipos de flor puede elegir el cliente (1 = flor por unidad); vacío = hasta 5 */
  maxChoices?: number | null;
  createdAt: string;
  updatedAt: string | null;
  category?: Category | null;
  audience?: ProductAudience | null;
}

export interface ProductCampaignStage {
  name: string;
  startDate: string;
  endDate: string;
  price: number;
  isCurrent: boolean;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string;
  /** Galería completa en orden (la primera es la portada) */
  imageUrls?: string[];
  availableColors?: string[];
  availableFlowerTypes?: string[];
  allowsLights?: boolean;
  allowsButterfly?: boolean;
  allowsPhraseCard?: boolean;
  maxChoices?: number | null;
  categoryId?: string | null;
  audience?: ProductAudience | null;
}

export interface UpdateProductRequest {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  imageUrls?: string[];
  availableColors?: string[];
  availableFlowerTypes?: string[];
  allowsLights?: boolean;
  allowsButterfly?: boolean;
  allowsPhraseCard?: boolean;
  maxChoices?: number | null;
  categoryId?: string | null;
  audience?: ProductAudience | null;
}

export interface ColorOption {
  name: string;
  /** "#rrggbb" o "multicolor" */
  hex: string;
}

export interface CustomizationOptions {
  colors: ColorOption[];
  flowerTypes: string[];
}

export interface UpdateProductStockRequest {
  stock: number;
}

export interface UpdateProductAvailabilityRequest {
  isAvailable: boolean;
}
