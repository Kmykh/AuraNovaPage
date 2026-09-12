"use client";

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { OrderSuccess, OrderDetailsSnapshot } from '../checkout/OrderSuccess';
import { formatCurrency } from '@/lib/formatters';
import { toast } from 'sonner';
import { 
  Upload, X, MapPin, Truck, Map, Package, 
  ArrowRight, ArrowLeft, Sparkles, AlertTriangle, Info, Check 
} from 'lucide-react';
import { useDeliveryZones, useMeetingPoints } from '@/hooks/use-checkout';
import { DeliveryType, CreateOrderResponse } from '@/types/checkout';
import { CreateCustomOrderRequest } from '@/types/orders';
import { OrdersService } from '@/services/orders.service';
import { useMounted } from '@/hooks/use-mounted';

import flo1 from '../images/flo1.png';

const INSPIRATION_TAGS = [
  'Rosas & Lirios 🌹',
  'Girasoles radiantes 🌻',
  'Caja sorpresa con luces ✨',
  'Diseño pastel romántico 🌸',
  'Mariposas & Toques dorados 🦋',
  'Flores eternas de colección 💫',
];

export function CustomOrderClient() {
  const isMounted = useMounted();
  const router = useRouter();
  
  const { data: deliveryZones, isLoading: isLoadingZones } = useDeliveryZones();
  const { data: meetingPoints, isLoading: isLoadingPoints } = useMeetingPoints();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<CreateOrderResponse | null>(null);
  const [orderSnapshot, setOrderSnapshot] = useState<OrderDetailsSnapshot | null>(null);
  const [step, setStep] = useState<1 | 2>(1);

  // Form State
  const [customer, setCustomer] = useState({ name: '', phone: '', email: '' });
  const [customizationNotes, setCustomizationNotes] = useState('');
  
  // Delivery State
  const [deliveryType, setDeliveryType] = useState<DeliveryType>(DeliveryType.Delivery);
  const [deliveryZoneId, setDeliveryZoneId] = useState<string>('');
  const [meetingPointId, setMeetingPointId] = useState<string>('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState({ department: 'Junín', province: 'Huancayo', district: '' });

  // Image State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Archivo muy grande', { description: 'La imagen no debe pesar más de 5MB.' });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Archivo muy grande', { description: 'La imagen no debe pesar más de 5MB.' });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleAddInspiration = (tag: string) => {
    setCustomizationNotes(prev => {
      if (!prev.trim()) return tag;
      if (prev.includes(tag)) return prev;
      return `${prev}, ${tag}`;
    });
  };

  const handleProceedToStep2 = () => {
    if (!customizationNotes.trim()) {
      toast.error('Cuéntanos tu idea', { description: 'Por favor descríbenos qué diseño o arreglo deseas antes de continuar.' });
      return;
    }
    setStep(2);
    window.scrollTo({ top: 80, behavior: 'smooth' });
  };

  // Cálculo de costo estimado de entrega (idéntico a /checkout)
  let estimatedDeliveryCost = 0;
  if (deliveryType === DeliveryType.Delivery && deliveryZoneId && deliveryZones) {
    const zone = deliveryZones.find(z => z.id === deliveryZoneId);
    if (zone) estimatedDeliveryCost = zone.cost;
  } else if (deliveryType === DeliveryType.MeetingPoint && meetingPointId && meetingPoints) {
    const point = meetingPoints.find(p => p.id === meetingPointId);
    if (point) estimatedDeliveryCost = point.cost;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customer.name.trim() || !customer.phone.trim() || !customer.email.trim()) {
      toast.error('Faltan datos personales', { description: 'Por favor completa tu nombre, teléfono y correo.' });
      return;
    }

    if (!customizationNotes.trim()) {
      toast.error('Faltan detalles', { description: 'Por favor descríbenos qué diseño deseas.' });
      setStep(1);
      return;
    }

    if (deliveryType === DeliveryType.Delivery && (!deliveryZoneId || !address.trim() || !location.district.trim())) {
      toast.error('Faltan datos de entrega', { description: 'Completa tu distrito, zona y dirección exacta.' });
      return;
    }

    if (deliveryType === DeliveryType.MeetingPoint && !meetingPointId) {
      toast.error('Faltan datos de recojo', { description: 'Selecciona un punto de encuentro en Huancayo.' });
      return;
    }

    if (deliveryType === DeliveryType.NationalShipping && (!location.department.trim() || !location.province.trim() || !location.district.trim() || !address.trim())) {
      toast.error('Faltan datos de envío', { description: 'Completa tu departamento, provincia, distrito y dirección de destino.' });
      return;
    }

    try {
      setIsSubmitting(true);
      
      let referenceImageUrl = null;
      if (imageFile) {
        referenceImageUrl = await convertFileToBase64(imageFile);
      }

      const request: CreateCustomOrderRequest = {
        customer: {
          name: customer.name.trim(),
          phone: customer.phone.trim(),
          email: customer.email.trim()
        },
        delivery: {
          type: deliveryType.toString(),
          deliveryZoneId: deliveryType === DeliveryType.Delivery ? deliveryZoneId : undefined,
          meetingPointId: deliveryType === DeliveryType.MeetingPoint ? meetingPointId : undefined,
          deliveryAddress: deliveryType === DeliveryType.Delivery || deliveryType === DeliveryType.NationalShipping ? address.trim() : undefined,
          department: location.department.trim(),
          province: location.province.trim(),
          district: location.district.trim()
        },
        customizationNotes: customizationNotes.trim(),
        referenceImageUrl: referenceImageUrl
      };

      const selectedZone = deliveryZones?.find(z => z.id === deliveryZoneId);
      const selectedMeetingPoint = meetingPoints?.find(p => p.id === meetingPointId);

      const snapshot: OrderDetailsSnapshot = {
        customer: {
          name: customer.name.trim(),
          phone: customer.phone.trim(),
          email: customer.email.trim()
        },
        items: [{
          name: 'Detalle Artesanal Personalizado (A Medida)',
          quantity: 1,
          price: 0,
          phraseText: customizationNotes.trim() ? `Idea: ${customizationNotes.trim()}` : undefined
        }],
        delivery: {
          type: deliveryType,
          zoneName: selectedZone?.name,
          meetingPointName: selectedMeetingPoint?.name,
          meetingPointAddress: selectedMeetingPoint?.address,
          address: address.trim(),
          department: location.department.trim(),
          province: location.province.trim(),
          district: location.district.trim()
        }
      };

      setOrderSnapshot(snapshot);
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem('latestOrderSnapshot', JSON.stringify(snapshot));
        } catch (e) {
          console.error(e);
        }
      }

      const response = await OrdersService.createCustomOrder(request);
      setCreatedOrder(response);
      window.scrollTo(0, 0);
      toast.success('¡Solicitud personalizada enviada!');
    } catch (error: any) {
      console.error(error);
      toast.error('Error al enviar la solicitud', { description: error?.response?.data?.message || 'Inténtalo de nuevo más tarde.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isMounted) return null;

  if (createdOrder) {
    return <OrderSuccess order={createdOrder} orderDetails={orderSnapshot} />;
  }

  return (
    <div className={`mx-auto px-4 sm:px-6 w-full animate-in fade-in duration-500 transition-all ${step === 1 ? 'max-w-4xl' : 'max-w-7xl'}`}>
      
      {/* Encabezado Editorial Boutique */}
      <div className="text-center flex flex-col items-center max-w-2xl mx-auto mb-12 md:mb-16">
        <div className="flex items-center gap-2 mb-3">
          <span className="h-px w-6 bg-[#c8a96b]" />
          <span className="text-[10px] md:text-[11px] font-serif uppercase tracking-[0.25em] text-[#c8a96b] font-bold">
            Atelier Personalizado • Creaciones a Medida
          </span>
          <span className="h-px w-6 bg-[#c8a96b]" />
        </div>
        
        {step === 1 ? (
          <>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-[#4a3933] mb-2 leading-[0.95] tracking-tight">
              Pide tu Personalizado
            </h1>
            <h2 className="text-xl sm:text-2xl text-[#d38b8b] font-serif italic tracking-wide">
              Diseño exclusivo hecho a mano para ti
            </h2>
            <p className="text-[#887870] text-sm md:text-base mt-3 max-w-xl leading-relaxed">
              Cuéntanos tu idea, flores o temática especial. Sube una foto de referencia y nuestros floristas artesanos crearán una propuesta única.
            </p>
          </>
        ) : (
          <>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-[#4a3933] mb-2 leading-[0.95] tracking-tight">
              Finaliza tu Solicitud
            </h1>
            <h2 className="text-xl sm:text-2xl text-[#d38b8b] font-serif italic tracking-wide">
              Datos de contacto y entrega
            </h2>
          </>
        )}
      </div>

      <form onSubmit={handleSubmit} className="w-full">
        
        {/* ========================================================================= */}
        {/* PASO 1: CUÉNTANOS TU IDEA (Entrada Refinada y Moderna)                      */}
        {/* ========================================================================= */}
        {step === 1 && (
          <div className="bg-white/85 backdrop-blur-xl border border-[#c8a96b]/20 shadow-[0_20px_50px_-15px_rgba(200,169,107,0.12)] rounded-[2.5rem] p-6 sm:p-10 md:p-12 relative overflow-hidden animate-in slide-in-from-right-4 fade-in duration-300">
            
            {/* Adorno Floral en la Esquina */}
            <div className="absolute -top-10 -right-10 w-[130px] h-[130px] pointer-events-none z-10 mix-blend-multiply opacity-70">
              <Image src={flo1} alt="" width={130} height={130} className="object-contain rotate-[15deg]"  style={{ width: 'auto', height: 'auto' }} />
            </div>

            <div className="flex items-center gap-4 mb-8 border-b border-[#e8dcdc] pb-5 relative z-10">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[#fdf5f5] text-[#d38b8b] text-lg font-serif italic shadow-sm">
                1
              </span>
              <div>
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#4a3933]">
                  Cuéntanos tu Visión
                </h2>
                <p className="text-xs text-[#887870] font-serif mt-0.5">
                  Describe los detalles que harán inolvidable este regalo
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              
              {/* Lado Izquierdo: Descripción e Inspiraciones Rápidas */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-[#887870] block mb-2">
                    Describe tu diseño ideal *
                  </label>
                  
                  {/* Píldoras de Inspiración Rápida */}
                  <div className="mb-3">
                    <p className="text-[10px] text-[#887870] font-serif italic mb-1.5 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#c8a96b]" />
                      <span>Ideas para agregar a tu mensaje (toca para incluir):</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {INSPIRATION_TAGS.map((tag, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleAddInspiration(tag)}
                          className="text-[10px] px-2.5 py-1 rounded-full bg-[#faf7f2] hover:bg-[#c8a96b]/15 text-[#4a3933] border border-[#e8dcdc] hover:border-[#c8a96b] transition-all"
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    required
                    className="w-full bg-[#faf8f5] border border-[#e8dcdc] rounded-2xl p-4 min-h-[190px] outline-none focus:border-[#c8a96b] focus:ring-4 focus:ring-[#c8a96b]/15 transition-all resize-none text-sm text-[#4a3933] placeholder:text-stone-400 leading-relaxed shadow-inner"
                    placeholder="Ej. Quiero un bouquet elegante con rosas rojas y lirios blancos, envoltura color crema, luces cálidas y un lazo dorado para un cumpleaños muy especial..."
                    value={customizationNotes}
                    onChange={e => setCustomizationNotes(e.target.value)}
                  />
                  <div className="flex justify-between items-center text-[11px] text-[#887870] mt-1.5 px-1">
                    <span>Sé tan específico como desees con colores y temática.</span>
                    <span>{customizationNotes.length} caracteres</span>
                  </div>
                </div>
              </div>
              
              {/* Lado Derecho: Zona de Carga de Imagen de Referencia */}
              <div className="space-y-4 flex flex-col">
                <label className="text-xs font-bold uppercase tracking-widest text-[#887870] block">
                  Foto de referencia (Opcional)
                </label>
                
                <div 
                  className={`relative w-full flex-1 min-h-[220px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden cursor-pointer ${
                    imagePreview 
                      ? 'border-[#c8a96b] bg-white shadow-sm' 
                      : isDragging 
                        ? 'border-[#c8a96b] bg-[#c8a96b]/10 scale-[1.01]' 
                        : 'border-[#e8dcdc] hover:border-[#c8a96b] bg-[#faf8f5]'
                  }`}
                  onClick={() => !imagePreview && fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                >
                  {imagePreview ? (
                    <div className="relative w-full h-full min-h-[220px] flex items-center justify-center p-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imagePreview} alt="Preview" className="w-full h-full max-h-[200px] object-contain rounded-xl shadow-xs" />
                      
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(null); }}
                        className="absolute top-4 right-4 bg-[#4a3933]/80 hover:bg-red-500 text-white p-2 rounded-full shadow-md transition-all hover:scale-110"
                        title="Quitar imagen"
                      >
                        <X size={15} />
                      </button>

                      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full shadow-sm border border-black/5 flex items-center gap-1.5 text-[10px] font-medium text-[#4a3933]">
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Foto adjunta con éxito</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-6 flex flex-col items-center">
                      <div className="bg-white p-4 rounded-full text-[#c8a96b] mb-3 shadow-sm border border-[#e8dcdc]/60 group-hover:scale-105 transition-transform">
                        <Upload size={26} />
                      </div>
                      <p className="text-[#4a3933] text-sm font-semibold">
                        Haz clic o arrastra tu imagen aquí
                      </p>
                      <p className="text-xs text-[#887870] mt-1">
                        Sube capturas de Pinterest, Instagram o fotos de referencia
                      </p>
                      <span className="text-[10px] text-[#887870]/70 mt-2 bg-white px-2.5 py-0.5 rounded-full border border-[#e8dcdc]">
                        JPG, PNG, WEBP hasta 5MB
                      </span>
                    </div>
                  )}
                  
                  <input 
                    type="file" 
                    accept="image/png, image/jpeg, image/webp"
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleImageChange}
                  />
                </div>
              </div>

            </div>

            {/* Pie de Acción Paso 1 */}
            <div className="mt-10 pt-6 border-t border-[#e8dcdc] flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
              <span className="text-xs text-[#887870] font-serif italic">
                Paso 1 de 2 • Detalles de tu creación
              </span>

              <Button 
                type="button" 
                onClick={handleProceedToStep2}
                className="w-full sm:w-auto h-13 px-8 text-sm tracking-widest uppercase flex items-center justify-center gap-2.5 rounded-full bg-[#4a3933] hover:bg-[#3d2e29] text-white font-sans font-bold shadow-xl shadow-[#4a3933]/20 transition-all duration-300 hover:-translate-y-0.5"
              >
                <span>Continuar a Datos & Entrega</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PASO 2: IDÉNTICO AL ESTILO Y ESTRUCTURA DE /checkout                      */}
        {/* ========================================================================= */}
        {step === 2 && (
          <div className="w-full flex flex-col lg:flex-row gap-8 lg:gap-12 relative z-10 animate-in slide-in-from-right-4 fade-in duration-300">
            
            {/* Columna Izquierda - Formularios integrados (Idéntico a /checkout) */}
            <div className="flex-1 space-y-16">
              
              {/* Botón para volver al Paso 1 */}
              <div>
                <button 
                  type="button" 
                  onClick={() => setStep(1)} 
                  className="inline-flex items-center gap-2 text-xs font-serif font-bold uppercase tracking-widest text-[#887870] hover:text-[#4a3933] transition-colors py-1 px-3 rounded-full bg-white/70 hover:bg-white border border-[#e8dcdc]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>← Modificar descripción o foto de mi diseño</span>
                </button>
              </div>

              {/* BLOQUE 1: DATOS PERSONALES (Idéntico a /checkout) */}
              <section className="relative">
                <h2 className="font-serif text-3xl font-bold text-[#4a3933] mb-8 flex items-center gap-4">
                  <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[#fdf5f5] text-[#d38b8b] text-lg font-serif italic shadow-sm">1</span>
                  Tus Datos
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                  <Input 
                    label="Nombre completo" 
                    value={customer.name}
                    onChange={e => setCustomer({ ...customer, name: e.target.value })}
                    required
                    placeholder="Ej. María López"
                  />
                  <Input 
                    label="Teléfono (WhatsApp)" 
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={customer.phone}
                    onChange={e => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setCustomer({ ...customer, phone: val });
                    }}
                    required
                    placeholder="Ej. 987654321"
                  />
                  <div className="md:col-span-2">
                    <Input 
                      label="Correo electrónico" 
                      type="email"
                      value={customer.email}
                      onChange={e => setCustomer({ ...customer, email: e.target.value })}
                      required
                      placeholder="Para enviarte la cotización detallada de tu pedido"
                    />
                  </div>
                </div>
              </section>

              <div className="w-full h-px bg-[#e8dcdc]"></div>

              {/* BLOQUE 2: MODALIDAD DE ENTREGA (Idéntico a /checkout) */}
              <section className="relative">
                <h2 className="font-serif text-3xl font-bold text-[#4a3933] mb-8 flex items-center gap-4">
                  <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[#fdf5f5] text-[#d38b8b] text-lg font-serif italic shadow-sm">2</span>
                  Entrega
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                  <button
                    type="button"
                    onClick={() => {
                      setDeliveryType(DeliveryType.Delivery);
                      setLocation(prev => ({ ...prev, department: 'Junín', province: 'Huancayo' }));
                    }}
                    className={`flex flex-col items-center justify-center p-6 rounded-[2rem] transition-all border-2 ${
                      deliveryType === DeliveryType.Delivery 
                        ? 'border-[#d38b8b] bg-white text-[#4a3933] shadow-md' 
                        : 'border-transparent bg-white shadow-sm text-[#887870] hover:border-[#d38b8b]/30'
                    }`}
                  >
                    <Truck className={`w-8 h-8 mb-3 ${deliveryType === DeliveryType.Delivery ? 'text-[#d38b8b]' : 'text-[#887870]/50'}`} />
                    <span className="font-bold text-sm uppercase tracking-widest text-center">Delivery<br/><span className="text-[9px] text-[#887870] tracking-normal font-medium normal-case">(Solo Huancayo)</span></span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDeliveryType(DeliveryType.MeetingPoint);
                      setLocation(prev => ({ ...prev, department: 'Junín', province: 'Huancayo' }));
                    }}
                    className={`flex flex-col items-center justify-center p-6 rounded-[2rem] transition-all border-2 ${
                      deliveryType === DeliveryType.MeetingPoint 
                        ? 'border-[#d38b8b] bg-white text-[#4a3933] shadow-md' 
                        : 'border-transparent bg-white shadow-sm text-[#887870] hover:border-[#d38b8b]/30'
                    }`}
                  >
                    <MapPin className={`w-8 h-8 mb-3 ${deliveryType === DeliveryType.MeetingPoint ? 'text-[#d38b8b]' : 'text-[#887870]/50'}`} />
                    <span className="font-bold text-xs uppercase tracking-widest text-center">Punto de<br/>encuentro<br/><span className="text-[9px] text-[#887870] tracking-normal font-medium normal-case">(Solo Huancayo)</span></span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDeliveryType(DeliveryType.NationalShipping);
                      setLocation(prev => ({ ...prev, department: '', province: '' }));
                    }}
                    className={`flex flex-col items-center justify-center p-6 rounded-[2rem] transition-all border-2 ${
                      deliveryType === DeliveryType.NationalShipping 
                        ? 'border-[#d38b8b] bg-white text-[#4a3933] shadow-md' 
                        : 'border-transparent bg-white shadow-sm text-[#887870] hover:border-[#d38b8b]/30'
                    }`}
                  >
                    <Map className={`w-8 h-8 mb-3 ${deliveryType === DeliveryType.NationalShipping ? 'text-[#d38b8b]' : 'text-[#887870]/50'}`} />
                    <span className="font-bold text-xs uppercase tracking-widest text-center">Envíos a<br/>todo el país</span>
                  </button>
                </div>

                {/* Formulario Dinámico según Modalidad (Idéntico a /checkout) */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm">
                  {deliveryType === DeliveryType.Delivery && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                      {isLoadingZones ? (
                        <div className="h-12 bg-[#faf7f2] rounded-2xl animate-pulse shadow-inner"></div>
                      ) : deliveryZones && deliveryZones.length > 0 ? (
                        <>
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-[#887870] ml-1 mb-1.5">Zona de reparto</label>
                            <select 
                              value={deliveryZoneId}
                              onChange={e => setDeliveryZoneId(e.target.value)}
                              required
                              className="flex h-13 w-full rounded-2xl border border-[#e8dcdc]/80 bg-white px-5 py-3 text-sm text-[#4a3933] font-medium shadow-sm hover:border-[#d38b8b]/40 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#d38b8b]/15 focus:border-[#d38b8b]/60 transition-all"
                            >
                              <option value="" disabled>Selecciona tu zona...</option>
                              {deliveryZones.map(z => (
                                <option key={z.id} value={z.id}>
                                  {z.name} ({z.district}) - {formatCurrency(z.cost)}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <Input 
                              label="Dirección exacta de entrega" 
                              value={address}
                              onChange={e => setAddress(e.target.value)}
                              required
                              placeholder="Ej. Av. Larco 123, Dpto 402"
                            />
                            {deliveryZoneId && (
                              <div className="mt-3 flex items-start gap-3 text-[#c8a96b] bg-[#fcf9f2] p-4 rounded-xl border border-[#c8a96b]/20">
                                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                                <p className="text-xs leading-relaxed font-medium">
                                  Asegúrate de que esta dirección se encuentre en <strong>{deliveryZones.find(z => z.id === deliveryZoneId)?.district || 'el distrito seleccionado'}</strong>.
                                </p>
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-3 text-red-500 bg-red-50 p-5 rounded-2xl">
                          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                          <p className="text-sm font-medium">No hay zonas de delivery disponibles en este momento. Por favor elige otra modalidad.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {deliveryType === DeliveryType.MeetingPoint && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                      {isLoadingPoints ? (
                        <div className="h-12 bg-[#faf7f2] rounded-2xl animate-pulse shadow-inner"></div>
                      ) : meetingPoints && meetingPoints.length > 0 ? (
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest text-[#887870] ml-1 mb-1.5">Punto de encuentro</label>
                          <select 
                            value={meetingPointId}
                            onChange={e => setMeetingPointId(e.target.value)}
                            required
                            className="flex h-13 w-full rounded-2xl border border-[#e8dcdc]/80 bg-white px-5 py-3 text-sm text-[#4a3933] font-medium shadow-sm hover:border-[#d38b8b]/40 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#d38b8b]/15 focus:border-[#d38b8b]/60 transition-all"
                          >
                            <option value="" disabled>Selecciona un punto...</option>
                            {meetingPoints.map(p => (
                              <option key={p.id} value={p.id}>
                                {p.name} - {formatCurrency(p.cost)}
                              </option>
                            ))}
                          </select>
                          {meetingPointId && (
                            <p className="text-sm text-[#887870] mt-4 ml-1">
                              <span className="font-bold text-[#4a3933]">Dirección:</span> {meetingPoints.find(p => p.id === meetingPointId)?.address}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 text-red-500 bg-red-50 p-5 rounded-2xl">
                          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                          <p className="text-sm font-medium">No hay puntos de encuentro disponibles en este momento. Por favor elige otra modalidad.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {deliveryType === DeliveryType.NationalShipping && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="bg-[#fff9f5] text-[#4a3933] border border-[#f0d6c9] p-5 rounded-2xl flex gap-3.5 items-start shadow-xs">
                        <Truck className="w-5 h-5 text-[#8f2d3b] flex-shrink-0 mt-0.5" />
                        <div className="text-xs leading-relaxed space-y-1.5">
                          <p className="font-bold text-[#8f2d3b] uppercase tracking-wider text-[11px]">
                            Aviso de Envíos Nacionales (Provincias)
                          </p>
                          <p className="text-[#6d5b52]">
                            Los envíos a nivel nacional se realizan exclusivamente mediante las agencias <strong>Olva Courier</strong> o <strong>Shalom</strong> (Modalidad pago en destino o entrega según cobertura).
                          </p>
                          <p className="text-[#887870] text-[11px]">
                            Una vez confirmada tu orden, coordinaremos contigo vía WhatsApp la agencia (<strong>Olva Courier</strong> o <strong>Shalom</strong>) y sucursal de tu mayor preferencia.
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-6">
                        <div>
                          <Input label="Dirección de destino" required value={address} onChange={e => setAddress(e.target.value)} placeholder="Agencia o dirección exacta" />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Ubicación Común integrada (Idéntico a /checkout) */}
                  <div className="mt-10 pt-8 border-t border-[#e8dcdc]">
                    <h3 className="font-serif text-xl font-bold text-[#4a3933] mb-6">Ubicación del envío</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input label="Departamento" required value={location.department} onChange={e => setLocation({ ...location, department: e.target.value })} placeholder="Ej. Lima" disabled={deliveryType !== DeliveryType.NationalShipping} />
                      <Input label="Provincia" required value={location.province} onChange={e => setLocation({ ...location, province: e.target.value })} placeholder="Ej. Lima" disabled={deliveryType !== DeliveryType.NationalShipping} />
                      <div className="md:col-span-2">
                        <Input label="Distrito" required value={location.district} onChange={e => setLocation({ ...location, district: e.target.value })} placeholder={deliveryType !== DeliveryType.NationalShipping ? "Ej. El Tambo, Chilca..." : "Ej. Miraflores"} />
                      </div>
                    </div>
                  </div>

                </div>
              </section>
            </div>

            {/* Columna Derecha - Boleta Sticky (Idéntico a /checkout) */}
            <div className="w-full lg:w-[420px] flex-shrink-0">
              <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_20px_50px_-15px_rgba(211,139,139,0.15)] sticky top-32 relative">
                
                {/* Floral decoration top right */}
                <div className="absolute -top-10 -right-10 w-[120px] h-[120px] pointer-events-none z-20 mix-blend-multiply opacity-80">
                  <Image src={flo1} alt="" width={120} height={120} className="object-contain rotate-[15deg]"  style={{ width: 'auto', height: 'auto' }} />
                </div>

                <h2 className="font-serif text-3xl font-bold text-[#4a3933] mb-8 border-b border-[#e8dcdc] pb-6 flex items-center justify-between">
                  Tu Solicitud
                </h2>
                
                {/* Preview del Producto Personalizado */}
                <div className="space-y-6 mb-8 pr-2">
                  <div className="flex gap-4 items-center group relative z-10">
                    {imagePreview ? (
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white shadow-sm flex-shrink-0 border border-[#e8dcdc]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imagePreview} alt="Referencia" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-[#fdf5f5] flex items-center justify-center flex-shrink-0 border border-[#d38b8b]/20">
                        <Sparkles className="w-6 h-6 text-[#c8a96b]" />
                      </div>
                    )}
                    <div className="flex-1 flex flex-col min-w-0">
                      <span className="text-sm font-bold text-[#4a3933] truncate">Detalle Personalizado</span>
                      <span className="text-xs text-[#887870] mt-0.5 line-clamp-2 italic leading-relaxed">
                        &ldquo;{customizationNotes}&rdquo;
                      </span>
                      {imagePreview && (
                        <span className="text-[10px] text-[#c8a96b] font-medium mt-1 inline-flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600" /> Foto de referencia incluida
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Desglose */}
                <div className="pt-6 border-t border-dashed border-[#d38b8b]/30 space-y-4 mb-8 text-sm">
                  <div className="flex justify-between text-[#887870]">
                    <span className="font-medium">Diseño Artesanal</span>
                    <span className="text-[#4a3933] font-serif font-bold italic">Cotización a medida</span>
                  </div>
                  <div className="flex justify-between text-[#887870]">
                    <span className="font-medium">{deliveryType === DeliveryType.Delivery ? 'Delivery' : deliveryType === DeliveryType.MeetingPoint ? 'Punto de encuentro' : 'Envío nacional'}</span>
                    <span className="text-[#4a3933] font-bold">{deliveryType === DeliveryType.NationalShipping ? 'Pago en destino' : formatCurrency(estimatedDeliveryCost)}</span>
                  </div>
                </div>
                
                {/* Total a pagar ahora */}
                <div className="pt-6 border-t border-[#e8dcdc] mb-8 relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-3 text-[10px] uppercase tracking-widest font-bold text-[#887870]">A pagar ahora</div>
                  <div className="flex justify-between items-end text-[#4a3933] mt-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#887870] mb-2">Total</span>
                    <span className="text-3xl font-serif font-bold text-[#c8a96b]">S/ 0.00*</span>
                  </div>
                  <p className="text-xs text-[#887870] font-medium mt-3 leading-relaxed bg-[#fcf9f2] p-3.5 rounded-xl border border-[#c8a96b]/20">
                    * Evaluaremos tu diseño y el destino de entrega. Te contactaremos vía WhatsApp y correo con la cotización exacta antes de proceder con el armado.
                  </p>
                </div>
                
                {/* Botón de Enviar Pedido */}
                <Button 
                  type="submit" 
                  className="w-full h-14 text-sm tracking-widest uppercase flex items-center justify-center gap-2.5 rounded-full bg-[#4a3933] hover:bg-[#3d2e29] text-white font-sans font-bold shadow-xl shadow-[#4a3933]/20 transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:pointer-events-none relative z-10"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Enviando solicitud...' : 'Solicitar Cotización'}
                </Button>
                
                <p className="text-[10px] text-[#887870] uppercase tracking-widest font-bold text-center mt-6 flex items-center justify-center gap-2 relative z-10">
                  <Info className="w-3 h-3 text-[#c8a96b]" /> Atelier Aura Nova • Atención 100% personalizada
                </p>
              </div>
            </div>

          </div>
        )}

      </form>
    </div>
  );
}
