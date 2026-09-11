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
  stock: number;
  imageUrl: string | null;
  isAvailable: boolean;
  availableColors: string[];
  availableFlowerTypes: string[];
  allowsLights: boolean;
  allowsButterfly: boolean;
  allowsPhraseCard: boolean;
  createdAt: string;
  updatedAt: string | null;
  category?: Category | null;
  audience?: ProductAudience | null;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string;
  availableColors?: string[];
  availableFlowerTypes?: string[];
  allowsLights?: boolean;
  allowsButterfly?: boolean;
  allowsPhraseCard?: boolean;
  categoryId?: string | null;
  audience?: ProductAudience | null;
}

export interface UpdateProductRequest {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  availableColors?: string[];
  availableFlowerTypes?: string[];
  allowsLights?: boolean;
  allowsButterfly?: boolean;
  allowsPhraseCard?: boolean;
  categoryId?: string | null;
  audience?: ProductAudience | null;
}

export interface UpdateProductStockRequest {
  stock: number;
}

export interface UpdateProductAvailabilityRequest {
  isAvailable: boolean;
}
