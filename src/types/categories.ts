export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  isActive: boolean;
}

export type ProductAudience = 'Chicos' | 'Chicas' | 'Unisex';
