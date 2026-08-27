import { apiClient } from '../lib/api-client';
import { ProductResponse } from '../types/products';

export const ProductsService = {
  getProducts: async (): Promise<ProductResponse[]> => {
    const { data } = await apiClient.get<ProductResponse[]>('/api/products');
    return data;
  },
  
  getProductById: async (id: string): Promise<ProductResponse> => {
    const { data } = await apiClient.get<ProductResponse>(`/api/products/${id}`);
    return data;
  }
};
