"use client";

import React, { useState } from 'react';
import { Link2, Pencil, Tags } from 'lucide-react';
import { toast } from 'sonner';
import { Category } from '@/types/categories';
import { useCreateCategory, useUpdateCategory } from '@/hooks/use-categories';
import { ApiProblemDetails } from '@/lib/api-errors';
import { PanelActions, PanelField, panelInput, SidePanel } from '../shared/SidePanel';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null; // null = crear
}

const MAX_DESCRIPTION = 300;

/** "Ramos para Él" → "ramos-para-el": sin tildes ni espacios, para el enlace de la tienda. */
const toSlug = (value: string) =>
  value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '').slice(0, 80);

/** Crear o editar una categoría en el panel lateral, con la vista de cómo queda en el catálogo. */
export function CategoryModal({ isOpen, onClose, category }: CategoryModalProps) {
  return (
    <SidePanel
      isOpen={isOpen}
      onClose={onClose}
      icon={Tags}
      title={category ? 'Editar categoría' : 'Nueva categoría'}
      subtitle="Agrupa tus productos en el catálogo y en los filtros de la tienda."
    >
      <CategoryForm key={category?.id ?? 'new'} category={category ?? null} onClose={onClose} />
    </SidePanel>
  );
}

function CategoryForm({ category, onClose }: { category: Category | null; onClose: () => void }) {
  const [name, setName] = useState(category?.name ?? '');
  const [description, setDescription] = useState(category?.description ?? '');
  const [isActive, setIsActive] = useState(category?.isActive ?? true);
  // El enlace se arma solo con el nombre; se puede cambiar si hace falta
  const [slug, setSlug] = useState(category?.slug ?? '');
  const [editingSlug, setEditingSlug] = useState(false);
  const [slugTouched, setSlugTouched] = useState(!!category);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [keepOpen, setKeepOpen] = useState(false);

  const { mutateAsync: createCategory, isPending: creating } = useCreateCategory();
  const { mutateAsync: updateCategory, isPending: updating } = useUpdateCategory(category?.id || '');
  const saving = creating || updating;

  const effectiveSlug = slugTouched ? toSlug(slug) : toSlug(name);
  const slugChanged = !!category && effectiveSlug !== category.slug;
  const errors = {
    name: !name.trim() ? 'Escribe el nombre de la categoría.' : null,
    slug: !effectiveSlug ? 'El enlace no puede quedar vacío.' : null,
  };

  const save = async () => {
    setSubmitted(true);
    setServerError(null);
    if (errors.name || errors.slug) return;
    const payload = { name: name.trim(), slug: effectiveSlug, description: description.trim() || undefined, isActive };
    try {
      if (category) await updateCategory(payload);
      else await createCategory(payload);
      toast.success(category ? 'Categoría actualizada' : `Categoría "${payload.name}" creada`);
      if (keepOpen) {
        setName(''); setDescription(''); setIsActive(true); setSlug(''); setSlugTouched(false); setEditingSlug(false); setSubmitted(false);
      } else onClose();
    } catch (error) {
      setServerError(error instanceof ApiProblemDetails && error.status === 409
        ? `Ya existe una categoría con el enlace "${effectiveSlug}". Cambia el nombre o el enlace.`
        : error instanceof ApiProblemDetails && error.detail ? error.detail : 'No se pudo guardar la categoría. Intenta de nuevo.');
    }
  };

  return (
    <>
      <form onSubmit={e => { e.preventDefault(); save(); }} className="space-y-5 pb-24 sm:pb-20">
        {serverError && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">{serverError}</p>}

        <PanelField label="Nombre" htmlFor="category-name" error={submitted ? errors.name : null}>
          <input
            id="category-name"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={150}
            placeholder="Ej. Ramos para ella"
            autoFocus={!category}
            className={`${panelInput} font-semibold`}
          />
        </PanelField>

        {/* Enlace: automático, editable solo si se necesita */}
        <div className="rounded-xl bg-[#FAF9F6] px-3.5 py-3">
          <div className="flex items-center gap-2 text-xs text-sage">
            <Link2 size={13} className="shrink-0 text-gold" />
            <span className="min-w-0 flex-1 truncate">
              Enlace: <span className="font-mono text-brown">/productos?category={effectiveSlug || '…'}</span>
            </span>
            {!editingSlug && (
              <button type="button" onClick={() => { setEditingSlug(true); setSlugTouched(true); setSlug(effectiveSlug); }} className="inline-flex items-center gap-1 font-semibold hover:text-brown">
                <Pencil size={12} /> Cambiar
              </button>
            )}
          </div>
          {editingSlug && (
            <input
              value={slug}
              onChange={e => setSlug(e.target.value.toLowerCase().replace(/\s/g, '-'))}
              maxLength={80}
              aria-label="Enlace de la categoría"
              className={`${panelInput} mt-2 font-mono text-xs`}
            />
          )}
          {submitted && errors.slug && <p className="mt-1.5 text-xs font-semibold text-rose-600">{errors.slug}</p>}
          {slugChanged && <p className="mt-1.5 text-xs font-semibold text-amber-700">Si ya compartiste el enlace anterior, dejará de mostrar esta categoría.</p>}
        </div>

        <PanelField label="Descripción (opcional)" htmlFor="category-description" hint={`${description.length}/${MAX_DESCRIPTION} · Aparece debajo del título en el catálogo.`}>
          <textarea
            id="category-description"
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value.slice(0, MAX_DESCRIPTION))}
            placeholder="Ej. Flores eternas armadas a mano para sorprenderla."
            className={`${panelInput} resize-none`}
          />
        </PanelField>

        <button
          type="button"
          role="switch"
          aria-checked={isActive}
          onClick={() => setIsActive(v => !v)}
          className="flex w-full items-center gap-3 rounded-xl border border-sage/15 bg-white px-3.5 py-3 text-left"
        >
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-brown">{isActive ? 'Visible en la tienda' : 'Oculta en la tienda'}</span>
            <span className="block text-xs text-sage">{isActive ? 'Aparece en el catálogo y en los filtros.' : 'Puedes prepararla y mostrarla después.'}</span>
          </span>
          <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${isActive ? 'bg-emerald-500' : 'bg-sage/30'}`}>
            <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${isActive ? 'left-6' : 'left-1'}`} />
          </span>
        </button>

        {/* Vista del catálogo */}
        <div className="rounded-2xl border border-gold/25 bg-gradient-to-br from-[#fffdf8] to-[#faf4ea] p-4">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Así se ve en el catálogo</p>
          <div className={isActive ? '' : 'opacity-50'}>
            <h3 className="font-serif text-2xl font-bold leading-tight text-brown">{name.trim() || 'Nombre de la categoría'}</h3>
            {description.trim() && <p className="mt-1 text-sm text-[#6b5a50]">{description.trim()}</p>}
            <div className="mt-3 h-px bg-gradient-to-r from-gold/50 to-transparent" />
          </div>
        </div>
      </form>

      <PanelActions saving={saving} label={category ? 'Guardar cambios' : 'Crear categoría'} onCancel={onClose} onSave={save} {...(category ? {} : { keepOpen, onKeepOpen: setKeepOpen })} />
    </>
  );
}
