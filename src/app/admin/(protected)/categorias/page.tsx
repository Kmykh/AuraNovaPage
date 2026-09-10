"use client";

import React, { useState } from 'react';
import { useAdminCategories, useToggleCategoryStatus } from '@/hooks/use-categories';
import { Button } from '@/components/ui/Button';
import { Plus, Edit2, Tags, Search } from 'lucide-react';
import { CategoryModal } from '@/components/admin/categories/CategoryModal';
import { Category } from '@/types/categories';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';

export default function AdminCategoriesPage() {
  const { data: categories, isLoading, isError, refetch } = useAdminCategories();
  const { mutate: toggleStatus, isPending: isToggling } = useToggleCategoryStatus();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const handleCreate = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    toggleStatus({ id, isActive: !currentStatus });
  };

  const filteredCategories = categories?.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-brown flex items-center gap-2">
            <Tags className="text-gold" />
            Categorías
          </h1>
          <p className="text-sage mt-1">
            Gestiona las categorías de tus productos para el catálogo.
          </p>
        </div>
        <Button onClick={handleCreate} className="whitespace-nowrap shrink-0">
          <Plus size={18} className="mr-2" />
          Nueva Categoría
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-sage/10 overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-sage/10 bg-[#FAFAFA] flex items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-sage w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar categoría..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-sage/20 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition-all"
            />
          </div>
          <span className="text-sm font-medium text-sage/80 whitespace-nowrap hidden sm:inline-block">
            {filteredCategories?.length || 0} categorías
          </span>
        </div>

        {/* Table/List Content */}
        {isLoading ? (
          <div className="p-8 flex justify-center text-sage">Cargando categorías...</div>
        ) : isError ? (
          <div className="p-8">
            <ErrorState title="Error" message="No pudimos cargar las categorías." onRetry={() => refetch()} />
          </div>
        ) : !filteredCategories || filteredCategories.length === 0 ? (
          <div className="p-8">
            <EmptyState 
              title={searchQuery ? "No hay resultados" : "No hay categorías"} 
              description={searchQuery ? "Prueba con otro término de búsqueda." : "Comienza creando tu primera categoría."}
              icon={<Tags size={32} />}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#FAFAFA] text-sage font-medium uppercase tracking-wider text-xs border-b border-sage/10">
                <tr>
                  <th className="px-6 py-4">Nombre</th>
                  <th className="px-6 py-4">Slug</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage/10 text-brown">
                {filteredCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-sage/5 transition-colors">
                    <td className="px-6 py-4 font-medium">
                      {category.name}
                      {category.description && (
                        <p className="text-xs text-sage font-normal truncate max-w-xs mt-0.5" title={category.description}>
                          {category.description}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sage">{category.slug}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={category.isActive}
                            onChange={() => handleToggleStatus(category.id, category.isActive)}
                            disabled={isToggling}
                          />
                          <div className="w-9 h-5 bg-sage/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                        </label>
                        <span className={`text-xs font-semibold ${category.isActive ? 'text-green-600' : 'text-sage'}`}>
                          {category.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-2 text-sage hover:text-gold hover:bg-gold/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gold"
                        title="Editar categoría"
                      >
                        <Edit2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CategoryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        category={selectedCategory} 
      />
    </div>
  );
}
