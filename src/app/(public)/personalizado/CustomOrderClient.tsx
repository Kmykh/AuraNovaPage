"use client";

import React, { useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  ArrowLeft, ArrowRight, CalendarHeart, Check, CreditCard, ImagePlus, Link2, Loader2, MessageCircle, PartyPopper,
  Plus, Sparkles, Upload, Wallet, X, Gift, Palette,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { OrderSuccess, OrderDetailsSnapshot } from '../checkout/OrderSuccess';
import { DeliveryDetailsForm } from '@/components/checkout/DeliveryDetailsForm';
import { compressImage } from '@/lib/compress-image';
import { formatCurrency } from '@/lib/formatters';
import { useDeliveryZones, useMeetingPoints } from '@/hooks/use-checkout';
import { CreateOrderResponse, DeliveryType } from '@/types/checkout';
import { CreateCustomOrderRequest } from '@/types/orders';
import { OrdersService } from '@/services/orders.service';
import { useMounted } from '@/hooks/use-mounted';
import { isValidPeruPhone, readSavedCustomer, saveCustomer } from '@/lib/saved-customer';
import { DeliveryFormValue, deliveryCost, describeDelivery, emptyDelivery, toDeliveryRequest, validateDelivery } from '@/lib/delivery-form';
import { ApiProblemDetails } from '@/lib/api-errors';

const MAX_REFERENCE_IMAGES = 5;
const MAX_REFERENCE_LINKS = 5;
const MAX_ORIGINAL_IMAGE_BYTES = 15 * 1024 * 1024;
const MAX_NOTES = 1800;

const OCCASIONS = ['Cumpleaños', 'Aniversario', 'San Valentín', 'Día de la Madre', 'Graduación', 'Solo porque sí'];
const BUDGETS = ['Hasta S/ 60', 'S/ 60 – 100', 'S/ 100 – 150', 'Más de S/ 150', 'Aún no lo sé'];
const STYLES = ['Rosas y lirios', 'Girasoles', 'Caja sorpresa con luces', 'Tonos pastel', 'Mariposas y dorado', 'Flores eternas'];

const HOW_IT_WORKS = [
  { icon: Sparkles, title: 'Cuéntanos tu idea', text: 'Una foto, un enlace o tu descripción.' },
  { icon: MessageCircle, title: 'Te enviamos el precio', text: 'Por WhatsApp y correo, sin compromiso.' },
  { icon: CreditCard, title: 'Aceptas y pagas', text: 'El 50% de adelanto o el total.' },
  { icon: Gift, title: 'Lo creamos para ti', text: 'Hecho a mano y entregado a tiempo.' },
];

interface ReferenceImage {
  file: File;
  preview: string;
}

function isValidLink(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

/** Hoy en Perú (YYYY-MM-DD), para no permitir fechas pasadas. */
function todayInPeru() {
  return new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function Chip({ active, onClick, children, tone = 'gold' }: { active: boolean; onClick: () => void; children: React.ReactNode; tone?: 'gold' | 'rose' }) {
  const activeClass = tone === 'rose' ? 'border-[#d38b8b] bg-[#d38b8b] text-white' : 'border-[#c8a96b] bg-[#c8a96b] text-white';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
        active ? activeClass : 'border-[#e8dcdc] bg-white text-[#4a3933] hover:border-[#c8a96b]'
      }`}
    >
      {active && <Check className="h-3 w-3" />}
      {children}
    </button>
  );
}

function SectionTitle({ number, title, hint }: { number?: number; title: string; hint?: string }) {
  return (
    <div className="mb-4 flex items-start gap-3">
      {number !== undefined && (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#fdf5f5] font-serif text-sm font-bold text-[#d38b8b]">{number}</span>
      )}
      <div>
        <h2 className="font-serif text-xl font-bold text-[#4a3933] sm:text-2xl">{title}</h2>
        {hint && <p className="text-xs text-[#887870] sm:text-sm">{hint}</p>}
      </div>
    </div>
  );
}

export function CustomOrderClient() {
  const isMounted = useMounted();
  const { data: deliveryZones, isLoading: isLoadingZones } = useDeliveryZones();
  const { data: meetingPoints, isLoading: isLoadingPoints } = useMeetingPoints();

  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<CreateOrderResponse | null>(null);
  const [orderSnapshot, setOrderSnapshot] = useState<OrderDetailsSnapshot | null>(null);

  // Paso 1: la idea
  const [images, setImages] = useState<ReferenceImage[]>([]);
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [links, setLinks] = useState<string[]>([]);
  const [linkInput, setLinkInput] = useState('');
  const [notes, setNotes] = useState('');
  const [styles, setStyles] = useState<string[]>([]);
  const [occasion, setOccasion] = useState('');
  const [desiredDate, setDesiredDate] = useState('');
  const [budgetRange, setBudgetRange] = useState('');

  // Paso 2: contacto y entrega
  const [customer, setCustomer] = useState(readSavedCustomer);
  const [delivery, setDelivery] = useState<DeliveryFormValue>(emptyDelivery);

  const hasReference = images.length > 0 || links.length > 0;
  const estimatedDeliveryCost = deliveryCost(delivery, deliveryZones, meetingPoints);

  const addImages = async (fileList: FileList | File[] | null | undefined) => {
    const files = Array.from(fileList ?? []).filter((f) => f.type.startsWith('image/'));
    if (files.length === 0) return;

    const room = MAX_REFERENCE_IMAGES - images.length;
    if (room <= 0) {
      toast.error(`Máximo ${MAX_REFERENCE_IMAGES} fotos`, { description: 'Quita alguna para agregar otra.' });
      return;
    }
    if (files.length > room) toast.info(`Solo se agregarán ${room} foto(s)`, { description: `El máximo es ${MAX_REFERENCE_IMAGES}.` });
    if (files.some((f) => f.size > MAX_ORIGINAL_IMAGE_BYTES)) toast.error('Alguna foto es muy pesada', { description: 'Cada imagen debe pesar menos de 15 MB.' });

    setIsProcessingImages(true);
    try {
      // Se comprimen en el celular: suben rápido incluso con datos móviles
      const accepted = files.filter((f) => f.size <= MAX_ORIGINAL_IMAGE_BYTES).slice(0, room);
      const compressed = await Promise.all(accepted.map((file) => compressImage(file)));
      setImages((prev) => [...prev, ...compressed.map((file) => ({ file, preview: URL.createObjectURL(file) }))]);
    } finally {
      setIsProcessingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const addLink = () => {
    const value = linkInput.trim();
    if (!value) return;
    if (!isValidLink(value)) {
      toast.error('Enlace no válido', { description: 'Pega el enlace completo, por ejemplo https://pin.it/...' });
      return;
    }
    if (links.length >= MAX_REFERENCE_LINKS) {
      toast.error(`Máximo ${MAX_REFERENCE_LINKS} enlaces`);
      return;
    }
    if (!links.includes(value)) setLinks((prev) => [...prev, value]);
    setLinkInput('');
  };

  /** La descripción final: lo que escribió más los estilos que marcó. */
  const composedNotes = () => {
    const text = notes.trim() || (hasReference ? 'Quiero un diseño como el de mis referencias.' : '');
    return styles.length ? `${text}\n\nEstilos que me gustan: ${styles.join(' · ')}` : text;
  };

  const goToStep2 = () => {
    if (!hasReference && notes.trim().length < 10) {
      toast.error('Cuéntanos tu idea', { description: 'Sube una foto, pega un enlace o describe el diseño (al menos unas palabras).' });
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (customer.name.trim().length < 3) {
      toast.error('Escribe tu nombre completo');
      return;
    }
    if (!isValidPeruPhone(customer.phone)) {
      toast.error('Revisa tu WhatsApp', { description: 'Debe tener 9 dígitos y empezar con 9 (ej. 987654321).' });
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(customer.email.trim())) {
      toast.error('Revisa tu correo', { description: 'Ahí te enviamos la cotización y el seguimiento.' });
      return;
    }
    const deliveryError = validateDelivery(delivery);
    if (deliveryError) {
      toast.error('Revisa los datos de entrega', { description: deliveryError });
      return;
    }

    const deliveryRequest = toDeliveryRequest(delivery, deliveryZones);
    const request: CreateCustomOrderRequest = {
      customer: { name: customer.name.trim(), phone: customer.phone.trim(), email: customer.email.trim() },
      delivery: deliveryRequest,
      customizationNotes: composedNotes(),
      referenceLinks: links,
      desiredDate: desiredDate || null,
      occasion: occasion || null,
      budgetRange: budgetRange || null,
    };

    const selectedZone = deliveryZones?.find(z => z.id === delivery.zoneId);
    const selectedPoint = meetingPoints?.find(p => p.id === delivery.meetingPointId);
    const snapshot: OrderDetailsSnapshot = {
      customer: request.customer as OrderDetailsSnapshot['customer'],
      items: [{ name: 'Detalle personalizado (a medida)', quantity: 1, price: 0, phraseText: `Idea: ${composedNotes()}` }],
      delivery: {
        type: delivery.type,
        zoneName: selectedZone?.name,
        meetingPointName: selectedPoint?.name,
        meetingPointAddress: selectedPoint?.address,
        address: delivery.address.trim(),
        department: deliveryRequest.department,
        province: deliveryRequest.province,
        district: deliveryRequest.district,
      },
    };

    setIsSubmitting(true);
    try {
      const response = await OrdersService.createCustomOrderWithImages(request, images.map((image) => image.file));
      saveCustomer(request.customer as { name: string; phone: string; email: string });
      try {
        sessionStorage.setItem('latestOrderSnapshot', JSON.stringify(snapshot));
      } catch {
        // Sin almacenamiento disponible: el ticket se arma con los datos de la respuesta
      }
      setOrderSnapshot(snapshot);
      setCreatedOrder(response);
      window.scrollTo(0, 0);
      toast.success('¡Recibimos tu idea!');
    } catch (error) {
      toast.error('No pudimos enviar tu solicitud', {
        description: error instanceof ApiProblemDetails && error.detail ? error.detail : 'Inténtalo de nuevo en unos segundos.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isMounted) return null;
  if (createdOrder) return <OrderSuccess order={createdOrder} orderDetails={orderSnapshot} />;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 animate-in fade-in duration-500 sm:px-6">
      {/* Encabezado */}
      <header className="mx-auto mb-8 max-w-2xl text-center">
        <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#c8a96b]">Atelier personalizado</span>
        <h1 className="mt-2 font-serif text-4xl font-bold leading-tight text-[#4a3933] sm:text-5xl">Diseña tu detalle a medida</h1>
        <p className="mt-3 text-sm text-[#887870] sm:text-base">Envíanos tu idea y te respondemos con el precio. Solo pagas si te gusta.</p>
      </header>

      {/* Cómo funciona */}
      <ol className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {HOW_IT_WORKS.map((item, index) => (
          <li key={item.title} className="rounded-2xl border border-[#e8dcdc]/80 bg-white/80 p-3 text-center sm:p-4">
            <span className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#fdf8ee] text-[#c8a96b]">
              <item.icon className="h-4 w-4" />
            </span>
            <p className="text-xs font-bold text-[#4a3933] sm:text-sm">{index + 1}. {item.title}</p>
            <p className="mt-0.5 text-[11px] text-[#887870] sm:text-xs">{item.text}</p>
          </li>
        ))}
      </ol>

      {/* Pasos */}
      <nav className="mb-6 flex items-center justify-center gap-2 text-xs font-bold sm:text-sm" aria-label="Pasos">
        {[{ n: 1, label: 'Tu idea' }, { n: 2, label: 'Contacto y entrega' }].map((item, index) => {
          const active = step === item.n;
          const done = step > item.n;
          return (
            <React.Fragment key={item.n}>
              {index > 0 && <span className="h-px w-8 bg-[#e8dcdc] sm:w-16" />}
              <button
                type="button"
                onClick={() => (item.n === 1 ? setStep(1) : goToStep2())}
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 transition ${active ? 'bg-[#4a3933] text-white' : done ? 'bg-[#fdf8ee] text-[#8c6d36]' : 'text-[#887870]'}`}
                aria-current={active ? 'step' : undefined}
              >
                <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${active ? 'bg-white text-[#4a3933]' : 'bg-[#e8dcdc] text-[#4a3933]'}`}>
                  {done ? <Check className="h-3 w-3" /> : item.n}
                </span>
                {item.label}
              </button>
            </React.Fragment>
          );
        })}
      </nav>

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="space-y-6 rounded-[2rem] border border-[#c8a96b]/20 bg-white/90 p-5 shadow-[0_20px_50px_-15px_rgba(200,169,107,0.12)] animate-in fade-in duration-300 sm:p-8">
            {/* Fotos */}
            <section>
              <SectionTitle number={1} title="¿Tienes una foto del modelo?" hint="Capturas de Pinterest, TikTok, Instagram o tus propias fotos. Es lo que más nos ayuda." />
              <div
                className={`rounded-2xl border-2 border-dashed p-3 transition ${isDragging ? 'border-[#c8a96b] bg-[#c8a96b]/10' : 'border-[#e8dcdc] bg-[#faf8f5]'}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); void addImages(e.dataTransfer.files); }}
              >
                {images.length === 0 && !isProcessingImages ? (
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="flex min-h-[170px] w-full flex-col items-center justify-center p-6 text-center">
                    <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-[#e8dcdc] bg-white text-[#c8a96b] shadow-sm">
                      <Upload size={24} />
                    </span>
                    <span className="text-sm font-semibold text-[#4a3933]">Toca para subir fotos</span>
                    <span className="mt-1 text-xs text-[#887870]">o arrástralas aquí · hasta {MAX_REFERENCE_IMAGES} fotos</span>
                  </button>
                ) : (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {images.map((image, index) => (
                      <div key={image.preview} className="relative aspect-square overflow-hidden rounded-xl border border-[#e8dcdc] bg-white">
                        {/* Vista previa local (blob) */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={image.preview} alt={`Referencia ${index + 1}`} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute right-1.5 top-1.5 rounded-full bg-[#4a3933]/80 p-1.5 text-white shadow transition hover:bg-red-500"
                          aria-label={`Quitar foto ${index + 1}`}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    {isProcessingImages && (
                      <div className="flex aspect-square items-center justify-center rounded-xl border border-[#e8dcdc] bg-white">
                        <Loader2 className="h-5 w-5 animate-spin text-[#c8a96b]" />
                      </div>
                    )}
                    {images.length < MAX_REFERENCE_IMAGES && !isProcessingImages && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-[#e8dcdc] bg-white text-[#c8a96b] transition hover:border-[#c8a96b]"
                      >
                        <ImagePlus size={20} />
                        <span className="text-[10px] font-semibold">Agregar</span>
                      </button>
                    )}
                  </div>
                )}
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  multiple
                  ref={fileInputRef}
                  className="hidden"
                  onChange={(e) => { void addImages(e.target.files); e.target.value = ''; }}
                />
              </div>

              <div className="mt-3 flex gap-2">
                <div className="relative flex-1">
                  <Link2 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#c8a96b]" />
                  <input
                    type="url"
                    inputMode="url"
                    value={linkInput}
                    onChange={(e) => setLinkInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLink(); } }}
                    placeholder="¿O un enlace? Pégalo aquí (Pinterest, TikTok…)"
                    className="w-full rounded-full border border-[#e8dcdc] bg-[#faf8f5] py-2.5 pl-10 pr-3 text-sm text-[#4a3933] outline-none transition focus:border-[#c8a96b] focus:ring-4 focus:ring-[#c8a96b]/15"
                  />
                </div>
                <button type="button" onClick={addLink} className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-[#4a3933] text-white hover:bg-[#5e4a42]" aria-label="Agregar enlace">
                  <Plus size={18} />
                </button>
              </div>
              {links.length > 0 && (
                <ul className="mt-2.5 flex flex-wrap gap-1.5">
                  {links.map((link) => (
                    <li key={link} className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-[#e8dcdc] bg-white py-1 pl-3 pr-1.5 text-xs text-[#5e4a42]">
                      <span className="max-w-[220px] truncate">{link.replace(/^https?:\/\/(www\.)?/, '')}</span>
                      <button type="button" onClick={() => setLinks((prev) => prev.filter((l) => l !== link))} className="rounded-full p-0.5 hover:text-red-500" aria-label="Quitar enlace">
                        <X size={12} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Descripción */}
            <section className="border-t border-[#f1e9e4] pt-6">
              <SectionTitle number={2} title="Cuéntanos cómo lo imaginas" hint={hasReference ? 'Opcional: colores, flores, mensaje o cambios respecto a la foto.' : 'Colores, flores, tamaño, mensaje… mientras más detalles, mejor.'} />
              <textarea
                className="min-h-[140px] w-full resize-none rounded-2xl border border-[#e8dcdc] bg-[#faf8f5] p-4 text-sm leading-relaxed text-[#4a3933] outline-none transition placeholder:text-stone-400 focus:border-[#c8a96b] focus:ring-4 focus:ring-[#c8a96b]/15"
                placeholder="Ej. Un ramo con rosas rojas y lirios blancos, envoltura crema y luces cálidas, para un cumpleaños."
                value={notes}
                maxLength={MAX_NOTES}
                onChange={(e) => setNotes(e.target.value)}
              />
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="mr-1 flex items-center gap-1 text-[11px] text-[#887870]"><Palette className="h-3.5 w-3.5 text-[#c8a96b]" /> Estilos:</span>
                {STYLES.map(style => (
                  <Chip key={style} active={styles.includes(style)} onClick={() => setStyles(prev => prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style])}>
                    {style}
                  </Chip>
                ))}
              </div>
            </section>

            {/* Ocasión, fecha y presupuesto */}
            <section className="grid grid-cols-1 gap-6 border-t border-[#f1e9e4] pt-6 md:grid-cols-3">
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#887870]">
                  <PartyPopper className="h-3.5 w-3.5 text-[#d38b8b]" /> Ocasión
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {OCCASIONS.map(option => (
                    <Chip key={option} tone="rose" active={occasion === option} onClick={() => setOccasion(occasion === option ? '' : option)}>{option}</Chip>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="desired-date" className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#887870]">
                  <CalendarHeart className="h-3.5 w-3.5 text-[#c8a96b]" /> ¿Para cuándo?
                </label>
                <input
                  id="desired-date"
                  type="date"
                  min={todayInPeru()}
                  value={desiredDate}
                  onChange={(e) => setDesiredDate(e.target.value)}
                  className="w-full rounded-2xl border border-[#e8dcdc] bg-[#faf8f5] px-4 py-3 text-sm text-[#4a3933] outline-none focus:border-[#c8a96b] focus:ring-4 focus:ring-[#c8a96b]/15"
                />
                <p className="mt-1.5 text-[11px] text-[#887870]">Te confirmamos si llegamos a tiempo.</p>
              </div>
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#887870]">
                  <Wallet className="h-3.5 w-3.5 text-[#c8a96b]" /> Presupuesto
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {BUDGETS.map(option => (
                    <Chip key={option} active={budgetRange === option} onClick={() => setBudgetRange(budgetRange === option ? '' : option)}>{option}</Chip>
                  ))}
                </div>
              </div>
            </section>

            <div className="flex flex-col-reverse items-center justify-between gap-3 border-t border-[#f1e9e4] pt-6 sm:flex-row">
              <p className="text-xs text-[#887870]">Sin compromiso: primero te enviamos el precio.</p>
              <Button
                type="button"
                onClick={goToStep2}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#4a3933] px-8 text-sm font-bold text-white hover:bg-[#3d2e29] sm:w-auto"
              >
                Continuar <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 items-start gap-6 animate-in fade-in duration-300 lg:grid-cols-[1fr_380px] lg:gap-8">
            <div className="space-y-6">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 rounded-full border border-[#e8dcdc] bg-white/80 px-3 py-1.5 text-xs font-bold text-[#887870] hover:text-[#4a3933]"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Volver a mi idea
              </button>

              <section className="rounded-[2rem] border border-[#c8a96b]/20 bg-white/90 p-5 sm:p-7">
                <SectionTitle number={3} title="Tus datos" hint="Te enviamos la cotización por WhatsApp y correo." />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input label="Nombre completo *" value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })} placeholder="Ej. María López" autoComplete="name" />
                  <Input
                    label="WhatsApp *"
                    type="tel"
                    inputMode="numeric"
                    maxLength={9}
                    value={customer.phone}
                    onChange={e => setCustomer({ ...customer, phone: e.target.value.replace(/\D/g, '') })}
                    placeholder="987654321"
                    autoComplete="tel-national"
                  />
                  <div className="sm:col-span-2">
                    <Input label="Correo *" type="email" value={customer.email} onChange={e => setCustomer({ ...customer, email: e.target.value })} placeholder="tucorreo@ejemplo.com" autoComplete="email" />
                  </div>
                </div>
              </section>

              <section className="rounded-[2rem] border border-[#c8a96b]/20 bg-white/90 p-5 sm:p-7">
                <SectionTitle number={4} title="¿Cómo te lo entregamos?" />
                <DeliveryDetailsForm
                  value={delivery}
                  onChange={setDelivery}
                  zones={deliveryZones}
                  points={meetingPoints}
                  isLoadingZones={isLoadingZones}
                  isLoadingPoints={isLoadingPoints}
                />
              </section>
            </div>

            {/* Resumen */}
            <aside className="space-y-4 rounded-[2rem] border border-[#c8a96b]/30 bg-white p-5 shadow-[0_20px_50px_-15px_rgba(211,139,139,0.15)] sm:p-6 lg:sticky lg:top-28">
              <h2 className="font-serif text-2xl font-bold text-[#4a3933]">Tu solicitud</h2>
              {images.length > 0 ? (
                <div className="grid grid-cols-4 gap-1.5">
                  {images.slice(0, 4).map((image, index) => (
                    <div key={image.preview} className="relative aspect-square overflow-hidden rounded-lg border border-[#e8dcdc]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={image.preview} alt={`Referencia ${index + 1}`} className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-xl bg-[#fdf8ee] p-3 text-xs text-[#8c6d36]">
                  <Sparkles className="h-4 w-4 shrink-0" /> {links.length ? `${links.length} enlace(s) de referencia` : 'Diseño según tu descripción'}
                </div>
              )}
              {(notes.trim() || styles.length > 0) && (
                <p className="line-clamp-4 rounded-xl bg-[#faf7f2] p-3 text-xs italic leading-relaxed text-[#5e4a42]">“{composedNotes()}”</p>
              )}
              {(occasion || desiredDate || budgetRange) && (
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  {occasion && <span className="rounded-full bg-[#fdf5f5] px-2.5 py-1 font-semibold text-[#b56f6f]">{occasion}</span>}
                  {desiredDate && (
                    <span className="rounded-full bg-[#fdf8ee] px-2.5 py-1 font-semibold text-[#8c6d36]">
                      Para el {new Date(`${desiredDate}T12:00:00`).toLocaleDateString('es-PE', { day: 'numeric', month: 'long' })}
                    </span>
                  )}
                  {budgetRange && <span className="rounded-full bg-[#f3f0ea] px-2.5 py-1 font-semibold text-[#6b5a50]">{budgetRange}</span>}
                </div>
              )}

              <dl className="space-y-2 border-t border-dashed border-[#e8dcdc] pt-4 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-[#887870]">Diseño</dt>
                  <dd className="text-right font-semibold text-[#4a3933]">Te enviamos el precio</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[#887870]">Entrega</dt>
                  <dd className="text-right font-semibold text-[#4a3933]">
                    {delivery.type === DeliveryType.NationalShipping ? 'Se paga en destino' : formatCurrency(estimatedDeliveryCost)}
                  </dd>
                </div>
              </dl>
              <p className="text-xs leading-relaxed text-[#887870]">{describeDelivery(delivery, deliveryZones, meetingPoints)}</p>

              <div className="rounded-xl border border-[#c8a96b]/25 bg-[#fffdf8] p-3 text-xs leading-relaxed text-[#6b5a50]">
                <strong className="text-[#4a3933]">Hoy no pagas nada.</strong> Cuando te enviemos la cotización, la aceptas y pagas el 50% o el total con tarjeta o Yape.
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex h-13 w-full items-center justify-center gap-2 rounded-full bg-[#4a3933] text-sm font-bold text-white hover:bg-[#3d2e29] disabled:opacity-50"
              >
                {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Enviando…</> : 'Enviar mi solicitud'}
              </Button>
            </aside>
          </div>
        )}
      </form>
    </div>
  );
}
