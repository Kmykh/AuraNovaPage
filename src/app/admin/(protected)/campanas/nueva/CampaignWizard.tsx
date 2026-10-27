"use client";

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ArrowLeft, ArrowRight, Check, Heart, Loader2, Percent, Plus, Save, Search, Sparkles, X,
} from 'lucide-react';
import { CampaignsService } from '@/services/campaigns.service';
import { useAdminProducts } from '@/hooks/use-admin-products';
import { useCampaignDetail } from '@/hooks/use-admin-campaigns';
import { CampaignResponse } from '@/types/campaigns';
import { getImageUrl, formatCurrency } from '@/lib/formatters';

/* ─── Fechas (siempre en hora local, como "YYYY-MM-DD") ─── */
const pad = (n: number) => String(n).padStart(2, '0');
const toYmd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromYmd = (ymd: string) => new Date(`${ymd}T00:00:00`);
const addDays = (ymd: string, days: number) => { const d = fromYmd(ymd); d.setDate(d.getDate() + days); return toYmd(d); };
const daysBetween = (a: string, b: string) => Math.round((fromYmd(b).getTime() - fromYmd(a).getTime()) / 86_400_000);
const fmtDay = (ymd: string) => fromYmd(ymd).toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' });
const startIso = (ymd: string) => new Date(`${ymd}T00:00:00`).toISOString();
const endIso = (ymd: string) => new Date(`${ymd}T23:59:59`).toISOString();

/** n-ésimo domingo del mes (Día de la Madre: 2º de mayo; del Padre: 3º de junio). */
function nthSunday(year: number, month: number, n: number) {
  const first = new Date(year, month, 1);
  return new Date(year, month, 1 + ((7 - first.getDay()) % 7) + 7 * (n - 1));
}

/** Fechas especiales en Perú: se usa la próxima que viene. */
const OCCASIONS: { label: string; date: (year: number) => Date; preventa: number }[] = [
  { label: 'San Valentín', date: y => new Date(y, 1, 14), preventa: 14 },
  { label: 'Día de la Mujer', date: y => new Date(y, 2, 8), preventa: 7 },
  { label: 'Día de la Madre', date: y => nthSunday(y, 4, 2), preventa: 21 },
  { label: 'Día del Padre', date: y => nthSunday(y, 5, 3), preventa: 14 },
  { label: 'Primavera', date: y => new Date(y, 8, 23), preventa: 10 },
  { label: 'Navidad', date: y => new Date(y, 11, 25), preventa: 21 },
];

const PREVENTA_CHOICES = [7, 10, 14, 21];

/* ─── Tipos ─── */
interface ProductLine {
  productId: string;
  productName: string;
  productImageUrl: string | null;
  productBasePrice: number;
  preventaPrice: string;
  diaCentralPrice: string;
}

interface WizardInitial {
  name: string;
  description: string;
  centralDate: string;
  preventaStart: string;
  /** Al editar se respeta un fin de campaña posterior al día central */
  campaignEnd: string;
  products: ProductLine[];
}

interface CampaignWizardProps {
  mode?: 'create' | 'edit';
  campaignId?: string;
}

const priceFrom = (base: number, discount: number) => (Math.round(base * (1 - discount / 100) * 10) / 10).toFixed(2);
const isPrice = (value: string) => { const n = parseFloat(value); return !isNaN(n) && n > 0; };

// La etapa de preventa y la del día central (las que crea este asistente)
const stagesOf = (campaign?: CampaignResponse) => ({
  preventa: campaign?.stages?.find(s => s.name.toLowerCase().includes('preventa')) || campaign?.stages?.[0],
  central: campaign?.stages?.find(s => s.name.toLowerCase().includes('central')) || campaign?.stages?.[1],
});

/** Crear o editar una campaña: ocasión y fechas, productos con precios, y revisar. */
export function CampaignWizard({ mode = 'create', campaignId }: CampaignWizardProps) {
  const { data: detail, isLoading } = useCampaignDetail(campaignId || '');

  if (mode === 'edit' && (isLoading || !detail)) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-sage">
        <Loader2 className="h-8 w-8 animate-spin text-[#c8a96b]" />
        <span className="text-sm font-medium">Cargando la campaña…</span>
      </div>
    );
  }

  // Se monta con los datos ya cargados: el formulario parte de lo guardado
  return <WizardForm mode={mode} campaignId={campaignId} detail={mode === 'edit' ? detail : undefined} initial={initialFrom(mode === 'edit' ? detail : undefined)} />;
}

function initialFrom(detail?: CampaignResponse): WizardInitial {
  if (!detail) return { name: '', description: '', centralDate: '', preventaStart: '', campaignEnd: '', products: [] };
  const { preventa, central } = stagesOf(detail);
  const centralDate = toYmd(new Date(central?.startDate ?? detail.endDate));
  return {
    name: detail.name,
    description: detail.description ?? '',
    centralDate,
    preventaStart: toYmd(new Date(preventa?.startDate ?? detail.startDate)),
    campaignEnd: toYmd(new Date(detail.endDate)),
    products: detail.products.map(p => {
      const pre = p.stagePrices.find(sp => sp.campaignStageId === preventa?.id)?.price;
      const dia = p.stagePrices.find(sp => sp.campaignStageId === central?.id)?.price;
      return {
        productId: p.productId,
        productName: p.productName,
        productImageUrl: p.productImageUrl ?? null,
        productBasePrice: p.productBasePrice,
        preventaPrice: pre !== undefined ? pre.toFixed(2) : '',
        diaCentralPrice: dia !== undefined ? dia.toFixed(2) : '',
      };
    }),
  };
}

function WizardForm({ mode, campaignId, detail, initial }: {
  mode: 'create' | 'edit'; campaignId?: string; detail?: CampaignResponse; initial: WizardInitial;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [today] = useState(() => toYmd(new Date()));
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState<string | null>(null);

  // Paso 1
  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description);
  const [centralDate, setCentralDate] = useState(initial.centralDate);
  const [preventaStart, setPreventaStart] = useState(initial.preventaStart);

  // Paso 2
  const [lines, setLines] = useState<ProductLine[]>(initial.products);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [preDiscount, setPreDiscount] = useState('10');
  const [centralDiscount, setCentralDiscount] = useState('0');
  const { data: allProducts } = useAdminProducts();

  // La preventa termina el día anterior al día central; la campaña va de la preventa al día central
  const preventaEnd = centralDate ? addDays(centralDate, -1) : '';
  const preventaDays = preventaStart && centralDate ? daysBetween(preventaStart, centralDate) : 0;
  const campaignEnd = initial.campaignEnd && centralDate && initial.campaignEnd > centralDate ? initial.campaignEnd : centralDate;

  const dateError = !centralDate || !preventaStart
    ? null
    : preventaDays < 1 ? 'La preventa debe empezar antes de la fecha especial.'
    : mode === 'create' && centralDate < today ? 'La fecha especial ya pasó: elige una próxima.'
    : null;
  const step1Valid = name.trim().length > 0 && !!centralDate && !!preventaStart && !dateError;
  const step2Valid = lines.length > 0 && lines.every(l => isPrice(l.preventaPrice) && isPrice(l.diaCentralPrice));

  const pickOccasion = (occasion: typeof OCCASIONS[number]) => {
    const year = fromYmd(today).getFullYear();
    let date = toYmd(occasion.date(year));
    if (date < today) date = toYmd(occasion.date(year + 1));
    setName(`${occasion.label} ${fromYmd(date).getFullYear()}`);
    setCentralDate(date);
    setPreventaStart(addDays(date, -occasion.preventa));
  };

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of allProducts ?? []) if (p.category) map.set(p.category.id, p.category.name);
    return [...map.entries()];
  }, [allProducts]);

  const available = (allProducts ?? []).filter(p =>
    !lines.some(l => l.productId === p.id) &&
    (!categoryFilter || p.category?.id === categoryFilter) &&
    p.name.toLowerCase().includes(search.trim().toLowerCase()));

  // Al agregar, el precio sale del descuento rápido (luego se puede cambiar)
  const addProducts = (products: { id: string; name: string; imageUrl: string | null; price: number }[]) => {
    const pre = parseFloat(preDiscount) || 0;
    const cen = parseFloat(centralDiscount) || 0;
    setLines(prev => [...prev, ...products.map(p => ({
      productId: p.id,
      productName: p.name,
      productImageUrl: p.imageUrl,
      productBasePrice: p.price,
      preventaPrice: priceFrom(p.price, pre),
      diaCentralPrice: priceFrom(p.price, cen),
    }))]);
  };

  const applyDiscountToAll = () => {
    const pre = parseFloat(preDiscount) || 0;
    const cen = parseFloat(centralDiscount) || 0;
    setLines(prev => prev.map(l => ({ ...l, preventaPrice: priceFrom(l.productBasePrice, pre), diaCentralPrice: priceFrom(l.productBasePrice, cen) })));
    toast.success('Precios actualizados', { description: `Preventa -${pre}% · Día central ${cen ? `-${cen}%` : 'precio normal'}` });
  };

  const updatePrice = (productId: string, field: 'preventaPrice' | 'diaCentralPrice', value: string) => {
    if (value && !/^\d*\.?\d{0,2}$/.test(value)) return;
    setLines(prev => prev.map(l => (l.productId === productId ? { ...l, [field]: value } : l)));
  };

  /* ─── Guardar (mismas llamadas que antes, con avance visible) ─── */
  const handleSave = async () => {
    const stagesData = {
      preventa: { name: 'Preventa', startDate: startIso(preventaStart), endDate: endIso(preventaEnd), isActive: true },
      central: { name: 'Día Central', startDate: startIso(centralDate), endDate: endIso(centralDate), isActive: true },
    };
    const campaignData = { name: name.trim(), description: description.trim() || null, startDate: startIso(preventaStart), endDate: endIso(campaignEnd) };

    try {
      setSaving('Guardando la campaña…');
      let id = campaignId;
      let preventaId: string;
      let centralId: string;
      const existingIds = new Set(detail?.products.map(p => p.productId) ?? []);

      if (mode === 'edit' && id && detail) {
        await CampaignsService.update(id, { ...campaignData, isActive: detail.isActive });
        const { preventa, central } = stagesOf(detail);
        setSaving('Guardando las fechas…');
        if (preventa) { await CampaignsService.updateStage(id, preventa.id, stagesData.preventa); preventaId = preventa.id; }
        else preventaId = (await CampaignsService.addStage(id, stagesData.preventa)).id;
        if (central) { await CampaignsService.updateStage(id, central.id, stagesData.central); centralId = central.id; }
        else centralId = (await CampaignsService.addStage(id, stagesData.central)).id;

        const keep = new Set(lines.map(l => l.productId));
        for (const existing of existingIds) {
          if (!keep.has(existing)) await CampaignsService.removeProduct(id, existing);
        }
      } else {
        const created = await CampaignsService.create({ ...campaignData, isActive: true });
        id = created.id;
        setSaving('Guardando las fechas…');
        preventaId = (await CampaignsService.addStage(id, stagesData.preventa)).id;
        centralId = (await CampaignsService.addStage(id, stagesData.central)).id;
      }

      for (const [index, line] of lines.entries()) {
        setSaving(`Guardando precios ${index + 1} de ${lines.length}…`);
        if (!existingIds.has(line.productId)) await CampaignsService.addProduct(id!, { productId: line.productId, isActive: true });
        await CampaignsService.setProductStagePrice(id!, line.productId, preventaId, { price: parseFloat(line.preventaPrice) });
        await CampaignsService.setProductStagePrice(id!, line.productId, centralId, { price: parseFloat(line.diaCentralPrice) });
      }

      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['admin-campaign', id] });
      toast.success(mode === 'edit' ? 'Campaña actualizada' : 'Campaña creada', { description: 'Con sus fechas y precios por producto.' });
      router.push(`/admin/campanas/${id}`);
    } catch (err: unknown) {
      const detailMsg = (err as { response?: { data?: { detail?: string; Message?: string } }; message?: string });
      toast.error('No se pudo guardar la campaña', {
        description: detailMsg?.response?.data?.detail || detailMsg?.response?.data?.Message || detailMsg?.message || 'Intenta de nuevo.',
      });
      setSaving(null);
    }
  };

  const steps = [
    { num: 1, label: 'Ocasión y fechas', short: 'Fechas' },
    { num: 2, label: 'Productos y precios', short: 'Precios' },
    { num: 3, label: 'Revisar', short: 'Revisar' },
  ];
  const back = () => (mode === 'edit' && campaignId ? router.push(`/admin/campanas/${campaignId}`) : router.push('/admin/campanas'));

  return (
    <div className="mx-auto max-w-3xl pb-12 animate-in fade-in duration-500">
      <div className="mb-6 flex items-center gap-3">
        <button type="button" onClick={back} className="rounded-full p-2 text-sage transition-colors hover:bg-sage/10 hover:text-brown" aria-label="Volver">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-serif text-2xl font-bold text-brown">{mode === 'edit' ? 'Editar campaña' : 'Nueva campaña'}</h1>
          <p className="text-sm text-sage">Precios especiales para una fecha: preventa y el día central.</p>
        </div>
      </div>

      {/* Pasos */}
      <ol className="mb-6 grid grid-cols-3 gap-2">
        {steps.map(s => {
          const done = step > s.num;
          const active = step === s.num;
          return (
            <li key={s.num}>
              <button
                type="button"
                onClick={() => (done ? setStep(s.num) : undefined)}
                disabled={!done}
                className={`flex w-full items-center gap-2 rounded-2xl border px-3 py-2.5 text-left transition ${
                  active ? 'border-brown bg-brown text-white' : done ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-emerald-300' : 'border-sage/15 bg-white text-sage'
                }`}
              >
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${active ? 'bg-white/15 text-[#e8c98a]' : done ? 'bg-emerald-600 text-white' : 'bg-sage/10'}`}>
                  {done ? <Check size={14} strokeWidth={3} /> : s.num}
                </span>
                <span className="truncate text-xs font-bold"><span className="sm:hidden">{s.short}</span><span className="hidden sm:inline">{s.label}</span></span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="overflow-hidden rounded-[24px] border border-sage/10 bg-white shadow-sm">
        {/* ─── Paso 1 ─── */}
        {step === 1 && (
          <div className="space-y-6 p-5 sm:p-8">
            {mode === 'create' && (
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sage"><Sparkles size={13} className="text-gold" /> Empieza con una fecha especial</p>
                <div className="flex flex-wrap gap-2">
                  {OCCASIONS.map(o => (
                    <button
                      key={o.label}
                      type="button"
                      onClick={() => pickOccasion(o)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition ${
                        name.startsWith(o.label) ? 'border-gold bg-gold/10 text-brown' : 'border-sage/20 bg-white text-[#6b5a50] hover:border-gold/50'
                      }`}
                    >
                      <Heart size={13} className="text-[#b07474]" /> {o.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-sage" htmlFor="campaign-name">Nombre</label>
              <input
                id="campaign-name"
                type="text"
                value={name}
                maxLength={80}
                onChange={e => setName(e.target.value)}
                placeholder="Ej. Día de la Madre 2027"
                className="w-full rounded-xl border border-sage/20 px-4 py-3 font-medium text-brown outline-none transition placeholder:text-sage/40 focus:border-gold focus:ring-2 focus:ring-gold/20"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-sage" htmlFor="central-date">Fecha especial (día central)</label>
                <input
                  id="central-date"
                  type="date"
                  value={centralDate}
                  min={mode === 'create' ? today : undefined}
                  onChange={e => {
                    setCentralDate(e.target.value);
                    if (e.target.value && !preventaStart) setPreventaStart(addDays(e.target.value, -14));
                  }}
                  className="w-full rounded-xl border border-sage/20 bg-white px-4 py-3 text-sm font-medium text-brown outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-sage" htmlFor="preventa-start">Preventa desde</label>
                <input
                  id="preventa-start"
                  type="date"
                  value={preventaStart}
                  max={preventaEnd || undefined}
                  onChange={e => setPreventaStart(e.target.value)}
                  className="w-full rounded-xl border border-sage/20 bg-white px-4 py-3 text-sm font-medium text-brown outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
                />
                {centralDate && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {PREVENTA_CHOICES.map(days => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => setPreventaStart(addDays(centralDate, -days))}
                        className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${preventaDays === days ? 'border-gold bg-gold/10 text-brown' : 'border-sage/20 text-sage hover:border-gold/50'}`}
                      >
                        {days === 7 ? '1 semana antes' : days === 14 ? '2 semanas' : days === 21 ? '3 semanas' : `${days} días`}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {dateError && <p className="text-sm font-semibold text-rose-600">{dateError}</p>}

            {/* Cómo queda */}
            {centralDate && preventaStart && !dateError && (
              <div className="rounded-2xl border border-gold/25 bg-gradient-to-br from-[#fffdf8] to-[#faf4ea] p-4">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-gold">Así queda tu campaña</p>
                <div className="grid grid-cols-[auto_1fr] items-stretch gap-x-3 gap-y-2 text-sm">
                  <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-[#c8a96b]" />
                  <p><strong className="text-brown">Preventa</strong> <span className="text-[#6b5a50]">· {fmtDay(preventaStart)} al {fmtDay(preventaEnd)} ({preventaDays} {preventaDays === 1 ? 'día' : 'días'})</span></p>
                  <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-[#b07474]" />
                  <p><strong className="text-brown">Día central</strong> <span className="text-[#6b5a50]">· {fmtDay(centralDate)}, todo el día</span></p>
                </div>
                <p className="mt-3 text-xs text-sage">Antes y después de estas fechas cada producto vuelve a su precio normal.</p>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-sage" htmlFor="campaign-desc">Descripción (opcional)</label>
              <textarea
                id="campaign-desc"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
                placeholder="Notas internas o el mensaje de la promoción"
                className="w-full resize-none rounded-xl border border-sage/20 px-4 py-3 text-sm text-brown outline-none transition placeholder:text-sage/40 focus:border-gold focus:ring-2 focus:ring-gold/20"
              />
            </div>
          </div>
        )}

        {/* ─── Paso 2 ─── */}
        {step === 2 && (
          <div className="space-y-6 p-5 sm:p-8">
            <div className="rounded-2xl border border-sage/15 bg-[#FAF9F6] p-4">
              <p className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sage"><Percent size={13} className="text-gold" /> Descuento rápido</p>
              <div className="flex flex-wrap items-end gap-3">
                <label className="text-xs font-semibold text-sage">
                  Preventa
                  <span className="mt-1 flex items-center rounded-xl border border-sage/20 bg-white pr-3">
                    <input type="text" inputMode="numeric" value={preDiscount} onChange={e => /^\d{0,2}$/.test(e.target.value) && setPreDiscount(e.target.value)} className="w-14 rounded-xl px-3 py-2 text-sm font-bold text-brown outline-none" aria-label="Descuento de preventa" />
                    <span className="text-sm text-sage">%</span>
                  </span>
                </label>
                <label className="text-xs font-semibold text-sage">
                  Día central
                  <span className="mt-1 flex items-center rounded-xl border border-sage/20 bg-white pr-3">
                    <input type="text" inputMode="numeric" value={centralDiscount} onChange={e => /^\d{0,2}$/.test(e.target.value) && setCentralDiscount(e.target.value)} className="w-14 rounded-xl px-3 py-2 text-sm font-bold text-brown outline-none" aria-label="Descuento del día central" />
                    <span className="text-sm text-sage">%</span>
                  </span>
                </label>
                <button
                  type="button"
                  onClick={applyDiscountToAll}
                  disabled={lines.length === 0}
                  className="rounded-xl bg-brown px-4 py-2.5 text-sm font-semibold text-white hover:bg-brown/90 disabled:opacity-40"
                >
                  Aplicar a todos
                </button>
              </div>
              <p className="mt-2 text-[11px] text-sage">Los productos que agregues toman estos descuentos. Puedes cambiar cada precio abajo.</p>
            </div>

            {lines.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-sage">En la campaña ({lines.length})</p>
                <ul className="space-y-2">
                  {lines.map(line => (
                    <li key={line.productId} className="grid grid-cols-[3rem_1fr_auto] items-center gap-3 rounded-2xl border border-sage/15 bg-white p-3 sm:grid-cols-[3rem_1fr_auto_auto_auto]">
                      <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-sage/10 bg-[#FAF9F6]">
                        {line.productImageUrl && <Image src={getImageUrl(line.productImageUrl)} alt="" fill sizes="48px" className="object-cover" />}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-brown">{line.productName}</p>
                        <p className="text-xs text-sage">Normal {formatCurrency(line.productBasePrice)}</p>
                      </div>
                      <button type="button" onClick={() => setLines(prev => prev.filter(l => l.productId !== line.productId))} className="rounded-lg p-1.5 text-sage hover:bg-rose-50 hover:text-rose-500 sm:order-last" aria-label={`Quitar ${line.productName}`}>
                        <X size={16} />
                      </button>
                      <div className="col-span-3 grid grid-cols-2 gap-2 sm:col-span-1 sm:contents">
                        {(['preventaPrice', 'diaCentralPrice'] as const).map(field => {
                          const value = line[field];
                          const n = parseFloat(value);
                          const off = !isNaN(n) && line.productBasePrice > 0 ? Math.round((1 - n / line.productBasePrice) * 100) : null;
                          return (
                            <label key={field} className="block">
                              <span className="flex items-center justify-between gap-2 text-[10px] font-bold uppercase text-sage">
                                {field === 'preventaPrice' ? 'Preventa' : 'Día central'}
                                {off !== null && off !== 0 && <span className={off > 0 ? 'text-emerald-600' : 'text-rose-500'}>{off > 0 ? `-${off}%` : `+${-off}%`}</span>}
                              </span>
                              <span className={`mt-0.5 flex items-center rounded-lg border bg-white pl-2.5 ${isPrice(value) ? 'border-sage/20' : 'border-rose-300'}`}>
                                <span className="text-xs text-sage">S/</span>
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  value={value}
                                  onChange={e => updatePrice(line.productId, field, e.target.value)}
                                  placeholder="0.00"
                                  className="w-full min-w-0 rounded-lg px-2 py-1.5 text-sm font-bold text-brown outline-none sm:w-20"
                                />
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="border-t border-sage/10 pt-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-wider text-sage">Agregar productos</p>
                {available.length > 1 && (
                  <button type="button" onClick={() => addProducts(available)} className="text-xs font-semibold text-gold hover:text-brown">
                    + Agregar los {available.length} de la lista
                  </button>
                )}
              </div>
              <div className="relative mb-3">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-sage/60" />
                <input
                  type="text"
                  placeholder="Buscar producto…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-sage/20 bg-[#FAF9F6] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-gold focus:bg-white"
                />
              </div>
              {categories.length > 1 && (
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {[['', 'Todas'] as [string, string], ...categories].map(([id, label]) => (
                    <button
                      key={id || 'all'}
                      type="button"
                      onClick={() => setCategoryFilter(id)}
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${categoryFilter === id ? 'border-brown bg-brown text-white' : 'border-sage/20 text-sage hover:border-gold/50'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
              <div className="grid max-h-72 grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                {available.length === 0 ? (
                  <p className="col-span-full py-6 text-center text-xs text-sage">{search || categoryFilter ? 'Sin resultados.' : 'Ya agregaste todos los productos.'}</p>
                ) : available.map(product => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => addProducts([product])}
                    className="flex items-center gap-3 rounded-xl border border-sage/10 bg-[#FAF9F6] p-2.5 text-left transition hover:border-gold/50 hover:bg-gold/5"
                  >
                    <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-sage/10 bg-white">
                      {product.imageUrl && <Image src={getImageUrl(product.imageUrl)} alt="" fill sizes="40px" className="object-cover" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-brown">{product.name}</span>
                      <span className="text-xs text-sage">{formatCurrency(product.price)}</span>
                    </span>
                    <Plus size={16} className="shrink-0 text-gold" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── Paso 3 ─── */}
        {step === 3 && (
          <div className="space-y-5 p-5 sm:p-8">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gold">Revisa antes de {mode === 'edit' ? 'guardar' : 'crear'}</p>
              <h2 className="font-serif text-2xl font-bold text-brown">{name}</h2>
              {description.trim() && <p className="mt-1 text-sm text-[#6b5a50]">{description}</p>}
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#c8a96b]/30 bg-[#fffdf8] p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[#8c6d36]">Preventa</p>
                <p className="mt-1 text-sm font-semibold text-brown">{fmtDay(preventaStart)} al {fmtDay(preventaEnd)}</p>
                <p className="text-xs text-sage">{preventaDays} {preventaDays === 1 ? 'día' : 'días'}</p>
              </div>
              <div className="rounded-2xl border border-[#b07474]/30 bg-[#fdf7f7] p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[#9c5365]">Día central</p>
                <p className="mt-1 text-sm font-semibold text-brown">{fmtDay(centralDate)}</p>
                <p className="text-xs text-sage">Todo el día</p>
              </div>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-sage/15">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead className="bg-[#FAF9F6] text-[11px] uppercase tracking-wider text-sage">
                  <tr>
                    <th className="px-4 py-2.5 font-bold">Producto</th>
                    <th className="px-4 py-2.5 font-bold">Normal</th>
                    <th className="px-4 py-2.5 font-bold">Preventa</th>
                    <th className="px-4 py-2.5 font-bold">Día central</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sage/10">
                  {lines.map(line => (
                    <tr key={line.productId}>
                      <td className="px-4 py-2.5 font-semibold text-brown">{line.productName}</td>
                      <td className="px-4 py-2.5 text-sage">{formatCurrency(line.productBasePrice)}</td>
                      <td className="px-4 py-2.5 font-bold text-brown">{formatCurrency(parseFloat(line.preventaPrice))}</td>
                      <td className="px-4 py-2.5 font-bold text-brown">{formatCurrency(parseFloat(line.diaCentralPrice))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {mode === 'create' && <p className="text-xs text-sage">Se crea activa: los precios se aplican solos en cada fecha. Puedes pausarla cuando quieras.</p>}
          </div>
        )}

        {/* Navegación */}
        <div className="flex items-center justify-between gap-3 border-t border-sage/10 bg-[#FAF9F6] px-5 py-4 sm:px-8">
          <button
            type="button"
            onClick={() => (step > 1 ? setStep(s => s - 1) : back())}
            disabled={!!saving}
            className="inline-flex items-center gap-1.5 rounded-xl border border-sage/30 px-4 py-2.5 text-sm font-semibold text-sage hover:text-brown disabled:opacity-50"
          >
            {step > 1 ? <><ArrowLeft size={16} /> Anterior</> : 'Cancelar'}
          </button>

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(s => s + 1)}
              disabled={step === 1 ? !step1Valid : !step2Valid}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#c8a96b] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#b09355] disabled:opacity-50"
            >
              Siguiente <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              disabled={!!saving || !step1Valid || !step2Valid}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-700 disabled:opacity-60"
            >
              {saving ? <><Loader2 size={16} className="animate-spin" /> {saving}</> : <><Save size={16} /> {mode === 'edit' ? 'Guardar cambios' : 'Crear campaña'}</>}
            </button>
          )}
        </div>
        {step === 2 && !step2Valid && lines.length > 0 && (
          <p className="border-t border-sage/10 bg-rose-50/60 px-5 py-2 text-xs font-semibold text-rose-600 sm:px-8">Cada producto necesita precio de preventa y de día central.</p>
        )}
      </div>
    </div>
  );
}
