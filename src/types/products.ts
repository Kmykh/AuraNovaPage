export interface ProductResponse {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string;
}

export interface UpdateProductRequest {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
}

export interface UpdateProductStockRequest {
  stock: number;
}

export interface UpdateProductAvailabilityRequest {
  isAvailable: boolean;
}
