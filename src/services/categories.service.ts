import { apiClient } from '../lib/api-client';
import { Category } from '../types/categories';

export const CategoriesService = {
  getCategories: async (): Promise<Category[]> => {
    const { data } = await apiClient.get<Category[]>('/api/categories');
    return data;
  }
};
