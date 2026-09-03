export interface ProductResponse {
  id: string;
  name: string;
  description: string | null;
  price: number;
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
}

export interface UpdateProductStockRequest {
  stock: number;
}

export interface UpdateProductAvailabilityRequest {
  isAvailable: boolean;
}
