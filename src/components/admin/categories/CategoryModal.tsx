"use client";

import React, { useState, useEffect } from 'react';
import { Category } from '@/types/categories';
import { useCreateCategory, useUpdateCategory } from '@/hooks/use-categories';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { ApiProblemDetails } from '@/lib/api-errors';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null; // If null, it's create mode
}

export function CategoryModal({ isOpen, onClose, category }: CategoryModalProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { mutateAsync: createCategory, isPending: isCreating } = useCreateCategory();
  const { mutateAsync: updateCategory, isPending: isUpdating } = useUpdateCategory(category?.id || '');

  const isPending = isCreating || isUpdating;

  useEffect(() => {
    if (isOpen) {
      if (category) {
        setName(category.name);
        setSlug(category.slug);
        setDescription(category.description || '');
        setIsActive(category.isActive);
      } else {
        setName('');
        setSlug('');
        setDescription('');
        setIsActive(true);
      }
      setErrorMsg(null);
    }
  }, [isOpen, category]);

  // Auto-generate slug from name if user hasn't typed anything in slug
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    if (!category) {
      setSlug(newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      const payload = {
        name,
        slug,
        description: description || undefined,
        isActive
      };

      if (category) {
        await updateCategory(payload);
      } else {
        await createCategory(payload);
      }
      onClose();
    } catch (error: any) {
      if (error instanceof ApiProblemDetails && error.status === 409) {
        setErrorMsg('El slug ingresado ya existe. Por favor, elige otro o modifica el nombre.');
      } else if (error instanceof ApiProblemDetails && error.status === 400) {
        setErrorMsg('Verifica que todos los campos sean correctos.');
      } else {
        setErrorMsg('Ocurrió un error al guardar la categoría.');
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => !isPending && onClose()} title={category ? 'Editar Categoría' : 'Nueva Categoría'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">
            {errorMsg}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-brown mb-1">Nombre *</label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={handleNameChange}
            disabled={isPending}
            className="w-full px-3 py-2 border border-sage/30 rounded-lg focus:ring-1 focus:ring-gold outline-none"
            placeholder="Ej. Flores Eternas"
          />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-brown mb-1">Slug (URL) *</label>
          <input
            id="slug"
            type="text"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            disabled={isPending}
            className="w-full px-3 py-2 border border-sage/30 rounded-lg focus:ring-1 focus:ring-gold outline-none"
            placeholder="ej-flores-eternas"
          />
          <p className="text-xs text-sage mt-1">Este identificador se usará en la URL y no debe contener espacios.</p>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-brown mb-1">Descripción</label>
          <textarea
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isPending}
            className="w-full px-3 py-2 border border-sage/30 rounded-lg focus:ring-1 focus:ring-gold outline-none resize-none"
            placeholder="Opcional..."
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              disabled={isPending}
            />
            <div className="w-11 h-6 bg-sage/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
          </label>
          <span className="text-sm font-medium text-brown">
            Categoría Activa
          </span>
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-sage/10 mt-6">
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Guardando...' : 'Guardar Categoría'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
