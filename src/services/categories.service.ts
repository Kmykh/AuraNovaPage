import { apiClient } from '../lib/api-client';
import { Category } from '../types/categories';

export const CategoriesService = {
  getCategories: async (): Promise<Category[]> => {
    const { data } = await apiClient.get<Category[]>('/api/categories');
    return data;
  },
  getAdminCategories: async (): Promise<Category[]> => {
    const { data } = await apiClient.get<Category[]>('/api/admin/categories');
    return data;
  },
  createCategory: async (categoryData: Partial<Category>): Promise<Category> => {
    const { data } = await apiClient.post<Category>('/api/admin/categories', categoryData);
    return data;
  },
  updateCategory: async (id: string, categoryData: Partial<Category>): Promise<Category> => {
    const { data } = await apiClient.put<Category>(`/api/admin/categories/${id}`, categoryData);
    return data;
  },
  updateCategoryStatus: async (id: string, isActive: boolean): Promise<void> => {
    await apiClient.patch(`/api/admin/categories/${id}/status`, { isActive });
  }
};
