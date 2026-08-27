import { apiClient } from '../lib/api-client';
import { 
  ProductResponse, 
  CreateProductRequest, 
  UpdateProductRequest, 
  UpdateProductStockRequest, 
  UpdateProductAvailabilityRequest 
} from '../types/products';

export const AdminProductsService = {
  createProduct: async (request: CreateProductRequest): Promise<ProductResponse> => {
    const { data } = await apiClient.post<ProductResponse>('/api/admin/products', request);
    return data;
  },

  getProducts: async (): Promise<ProductResponse[]> => {
    const { data } = await apiClient.get<ProductResponse[]>('/api/admin/products');
    return data;
  },

  getProduct: async (id: string): Promise<ProductResponse> => {
    const { data } = await apiClient.get<ProductResponse>(`/api/admin/products/${id}`);
    return data;
  },

  updateProduct: async (id: string, request: UpdateProductRequest): Promise<ProductResponse> => {
    const { data } = await apiClient.put<ProductResponse>(`/api/admin/products/${id}`, request);
    return data;
  },

  updateStock: async (id: string, request: UpdateProductStockRequest): Promise<{ message: string }> => {
    const { data } = await apiClient.patch<{ message: string }>(`/api/admin/products/${id}/stock`, request);
    return data;
  },

  updateAvailability: async (id: string, request: UpdateProductAvailabilityRequest): Promise<{ message: string }> => {
    const { data } = await apiClient.patch<{ message: string }>(`/api/admin/products/${id}/availability`, request);
    return data;
  },

  uploadImage: async (file: File): Promise<{ imageUrl: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post<{ imageUrl: string }>('/api/admin/products/upload-image', formData);
    return data;
  }
};
