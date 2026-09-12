"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart.store';
import { useMounted } from '@/hooks/use-mounted';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { OrderSuccess, OrderDetailsSnapshot } from './OrderSuccess';
import { formatCurrency } from '@/lib/formatters';
import { toast } from 'sonner';
import { Package, Truck, MapPin, Map, Info, AlertTriangle, User, Phone, Mail, Flower2, Palette, Sparkles, Receipt, ShieldCheck, CheckCircle2, Navigation, Compass } from 'lucide-react';
import { useDeliveryZones, useMeetingPoints, useCreateOrder } from '@/hooks/use-checkout';
import { DeliveryType, CreateOrderRequest, CreateOrderResponse } from '@/types/checkout';
import { ApiProblemDetails, isTransientApiError } from '@/lib/api-errors';
import { TransientApiErrorState } from '@/components/shared/TransientApiErrorState';
import Image from 'next/image';
import flo1 from '../images/flo1.png';

export function CheckoutClient() {
  const isMounted = useMounted();
  const router = useRouter();
  
  const { items, getSubtotal, clearCart } = useCartStore();
  
  const { data: deliveryZones, isLoading: isLoadingZones } = useDeliveryZones();
  const { data: meetingPoints, isLoading: isLoadingPoints } = useMeetingPoints();
  const { mutate: createOrder, isPending: isSubmitting } = useCreateOrder();

  const [createdOrder, setCreatedOrder] = useState<CreateOrderResponse | null>(null);
  const [orderSnapshot, setOrderSnapshot] = useState<OrderDetailsSnapshot | null>(null);
  const [isContingencyMode, setIsContingencyMode] = useState(false);

  // Customer Form State
  const [customer, setCustomer] = useState({ name: '', phone: '', email: '' });
  
  // Delivery State
  const [deliveryType, setDeliveryType] = useState<DeliveryType>(DeliveryType.Delivery);
  const [deliveryZoneId, setDeliveryZoneId] = useState<string>('');
  const [meetingPointId, setMeetingPointId] = useState<string>('');
  const [address, setAddress] = useState('');
  
  // Location State (Common to all)
  const [location, setLocation] = useState({ department: 'Junín', province: 'Huancayo', district: '' });

  // Redirigir si el carrito está vacío y no hay orden creada
  useEffect(() => {
    if (isMounted && items.length === 0 && !createdOrder) {
      router.push('/productos');
      toast.info('Tu carrito está vacío, te hemos redirigido al catálogo.');
    }
  }, [isMounted, items.length, createdOrder, router]);

  if (!isMounted || (items.length === 0 && !createdOrder)) {
    return (
      <div className="w-full flex justify-center py-20">
        <div className="h-8 w-8 border-4 border-sage/20 border-t-gold rounded-full animate-spin"></div>
      </div>
    );
  }

  if (createdOrder) {
    return <OrderSuccess order={createdOrder} orderDetails={orderSnapshot} />;
  }

  // Cálculos visuales
  const subtotal = getSubtotal();
  let estimatedDeliveryCost = 0;
  
  const selectedZone = deliveryZones?.find(z => z.id === deliveryZoneId);
  const selectedMeetingPoint = meetingPoints?.find(p => p.id === meetingPointId);

  if (deliveryType === DeliveryType.Delivery && deliveryZoneId && deliveryZones) {
    if (selectedZone) estimatedDeliveryCost = selectedZone.cost;
  } else if (deliveryType === DeliveryType.MeetingPoint && meetingPointId && meetingPoints) {
    if (selectedMeetingPoint) estimatedDeliveryCost = selectedMeetingPoint.cost;
  }

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validaciones básicas
    if (!customer.name.trim() || !customer.phone.trim() || !customer.email.trim()) {
      toast.error('Faltan datos personales', { description: 'Por favor completa tu nombre, teléfono y correo electrónico.' });
      return;
    }
    
    if (!location.department.trim() || !location.province.trim() || !location.district.trim()) {
      toast.error('Faltan datos de ubicación', { description: 'Completa departamento, provincia y distrito.' });
      return;
    }

    if (deliveryType === DeliveryType.Delivery && (!deliveryZoneId || !address.trim())) {
      toast.error('Faltan datos de entrega', { description: 'Selecciona una zona e ingresa tu dirección.' });
      return;
    }

    if (deliveryType === DeliveryType.MeetingPoint && !meetingPointId) {
      toast.error('Faltan datos de recojo', { description: 'Selecciona un punto de encuentro.' });
      return;
    }

    if (deliveryType === DeliveryType.NationalShipping && !address.trim()) {
      toast.error('Faltan datos de envío', { description: 'Completa tu dirección de destino.' });
      return;
    }

    // 2. Construir payload
    const request: CreateOrderRequest = {
      customer: {
        name: customer.name.trim(),
        phone: customer.phone.trim(),
        email: customer.email.trim()
      },
      items: items.map(i => ({ 
        productId: i.productId, 
        quantity: i.quantity,
        selectedPrimaryColor: i.selectedPrimaryColor,
        selectedSecondaryColor: i.selectedSecondaryColor,
        selectedFlowerType: i.selectedFlowerType,
        selectedFlowerColor: i.selectedFlowerColor,
        hasLights: i.hasLights,
        hasButterfly: i.hasButterfly,
        hasPhraseCard: i.hasPhraseCard,
        phraseText: i.phraseText,
        phraseFont: i.phraseFont
      })),
      delivery: {
        type: deliveryType.toString(),
        deliveryZoneId: deliveryType === DeliveryType.Delivery ? deliveryZoneId : undefined,
        meetingPointId: deliveryType === DeliveryType.MeetingPoint ? meetingPointId : undefined,
        deliveryAddress: deliveryType === DeliveryType.Delivery || deliveryType === DeliveryType.NationalShipping ? address.trim() : undefined,
        department: location.department.trim(),
        province: location.province.trim(),
        district: location.district.trim()
      }
    };

    // 3. Mutar
    createOrder(request, {
      onSuccess: async (data) => {
        const snapshot: OrderDetailsSnapshot = {
          customer: {
            name: customer.name.trim(),
            phone: customer.phone.trim(),
            email: customer.email.trim()
          },
          items: items.map(i => ({
            productId: i.productId,
            name: i.name,
            quantity: i.quantity,
            price: i.price,
            selectedPrimaryColor: i.selectedPrimaryColor,
            selectedSecondaryColor: i.selectedSecondaryColor,
            selectedFlowerType: i.selectedFlowerType,
            selectedFlowerColor: i.selectedFlowerColor,
            hasLights: i.hasLights,
            hasButterfly: i.hasButterfly,
            hasPhraseCard: i.hasPhraseCard,
            phraseText: i.phraseText,
            phraseFont: i.phraseFont
          })),
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

        setCreatedOrder(data);
        clearCart();
        window.scrollTo(0, 0);

        // Disparar silenciosamente el envío de correo de confirmación
        if (customer.email.trim()) {
          try {
            await fetch('/api/send-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                order: data,
                customer: {
                  name: customer.name.trim(),
                  email: customer.email.trim()
                },
                items: items,
                subtotal: subtotal,
                deliveryType: deliveryType,
                estimatedDeliveryCost: estimatedDeliveryCost,
                emailType: data.status === 0 ? 'quote_received' : 'receipt'
              })
            });
          } catch (error) {
            console.error("No se pudo enviar el correo de confirmación", error);
          }
        }
      },
      onError: (error) => {
        if (isTransientApiError(error)) {
          // Entrar en modo contingencia: no se borran datos, se ofrece alternativa WhatsApp
          setIsContingencyMode(true);
          window.scrollTo(0, 0);
        } else if (error instanceof ApiProblemDetails) {
          toast.error('Revisa los datos de tu pedido', { description: error.detail });
        } else {
          toast.error('Error al procesar', { description: 'Ocurrió un error con tu pedido.' });
        }
      }
    });
  };

  const generateWhatsAppMessage = () => {
    let msg = `Hola Aura Nova. Quiero realizar un pedido, pero el sistema está presentando una dificultad temporal.\n\n`;
    msg += `*Mis datos:*\nNombre: ${customer.name}\nTeléfono: ${customer.phone}\nCorreo: ${customer.email}\n\n`;
    
    msg += `*Productos seleccionados:*\n`;
    items.forEach(item => {
      msg += `- ${item.quantity}x ${item.name} (${formatCurrency(item.price * item.quantity)})\n`;
    });
    
    msg += `\n*Modalidad de entrega:*\n`;
    if (deliveryType === DeliveryType.Delivery) {
      msg += `Delivery\nUbicación: ${location.department}, ${location.province}, ${location.district}\nDirección: ${address}\n`;
    } else if (deliveryType === DeliveryType.MeetingPoint) {
      msg += `Punto de Encuentro\nUbicación: ${location.department}, ${location.province}, ${location.district}\n`;
    } else {
      msg += `Envío Nacional\nUbicación: ${location.department}, ${location.province}, ${location.district}\nDirección: ${address}\n`;
    }
    
    msg += `\nQuisiera continuar la coordinación de mi pedido.`;
    return msg;
  };

  if (isContingencyMode) {
    return (
      <div className="w-full py-10">
        <TransientApiErrorState 
          title="No pudimos confirmar tu pedido en este momento"
          message="Parece que nuestros servidores están experimentando una alta demanda o un problema técnico temporal. Tus datos y carrito siguen intactos. Puedes reintentar enviar el formulario o continuar tu compra de inmediato por WhatsApp con nuestra asesora de ventas."
          onRetry={() => setIsContingencyMode(false)}
          whatsappMessage={generateWhatsAppMessage()}
        />
      </div>
    );
  }

  return (
    <>
      <div className="text-center flex flex-col items-center max-w-xl mx-auto mb-16">
        <h1 className="font-serif text-[3.5rem] sm:text-[4.5rem] font-bold text-[#4a3933] mb-2 leading-[0.9] tracking-tighter">
          Finaliza
        </h1>
        <div className="flex items-center gap-4">
          <h2 className="text-2xl sm:text-3xl text-[#d38b8b] font-serif italic tracking-wide">
            tu pedido
          </h2>
        </div>
      </div>

      <form onSubmit={handleCreateOrder} className="w-full flex flex-col lg:flex-row gap-8 lg:gap-12 relative z-10">
      
      {/* Columna Izquierda - Formularios integrados con estética Atelier */}
      <div className="flex-1 space-y-8 sm:space-y-10">
        
        {/* BLOQUE 1: DATOS PERSONALES */}
        <section className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-7 sm:p-9 shadow-[0_15px_40px_-10px_rgba(200,169,107,0.12)] border border-[#c8a96b]/20 hover:border-[#c8a96b]/35 transition-all relative overflow-hidden">
          
          {/* Header de Bloque 1 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-5 border-b border-[#e8dcdc]/80">
            <div className="flex items-center gap-3.5">
              <span className="flex items-center justify-center w-9 h-9 rounded-full bg-[#fcf9f2] text-[#8f6d28] border border-[#c8a96b]/35 font-serif font-bold text-sm shadow-2xs">
                1
              </span>
              <div>
                <span className="text-[10px] font-serif uppercase tracking-[0.2em] text-[#c8a96b] font-bold block">
                  Identificación y Contacto
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#4a3933]">
                  Tus Datos
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#856d56] bg-[#fcf9f2] px-3.5 py-1.5 rounded-full border border-[#c8a96b]/20 w-fit">
              <ShieldCheck className="w-3.5 h-3.5 text-[#c8a96b]" />
              <span className="font-medium">Datos 100% protegidos</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-1.5 mb-1.5 ml-1">
                <User className="w-3.5 h-3.5 text-[#c8a96b]" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#887870]">Nombre completo *</span>
              </div>
              <Input 
                value={customer.name}
                onChange={e => setCustomer({ ...customer, name: e.target.value })}
                required
                placeholder="Ej. María López Flores"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5 ml-1">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#887870]">
                  <Phone className="w-3.5 h-3.5 text-[#c8a96b]" />
                  <span>WhatsApp / Teléfono *</span>
                </span>
              </div>
              <Input 
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
                helperText="Te enviaremos foto de tu detalle terminado antes de despacharlo."
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1.5 ml-1">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#887870]">
                  <Mail className="w-3.5 h-3.5 text-[#c8a96b]" />
                  <span>Correo electrónico *</span>
                </span>
                <span className="text-[10px] text-[#887870]">
                  Para ticket y seguimiento
                </span>
              </div>
              <Input 
                type="email"
                value={customer.email}
                onChange={e => setCustomer({ ...customer, email: e.target.value })}
                required
                placeholder="ejemplo@correo.com"
                helperText="Te enviaremos el ticket de confirmación y el código de seguimiento de tu pedido."
              />
            </div>
          </div>
        </section>

        {/* BLOQUE 2: MODALIDAD DE ENTREGA */}
        <section className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-7 sm:p-9 shadow-[0_15px_40px_-10px_rgba(200,169,107,0.12)] border border-[#c8a96b]/20 hover:border-[#c8a96b]/35 transition-all relative overflow-hidden">
          
          {/* Header de Bloque 2 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-5 border-b border-[#e8dcdc]/80">
            <div className="flex items-center gap-3.5">
              <span className="flex items-center justify-center w-9 h-9 rounded-full bg-[#fcf9f2] text-[#8f6d28] border border-[#c8a96b]/35 font-serif font-bold text-sm shadow-2xs">
                2
              </span>
              <div>
                <span className="text-[10px] font-serif uppercase tracking-[0.2em] text-[#c8a96b] font-bold block">
                  Modalidad y Dirección
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#4a3933]">
                  Entrega
                </h2>
              </div>
            </div>
            <span className="text-xs font-serif italic text-[#887870]">
              Huancayo y envíos a todo el Perú
            </span>
          </div>

          {/* Selector de Modalidades */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 mb-8">
            {/* Opción 1: Delivery Huancayo */}
            <button
              type="button"
              onClick={() => {
                setDeliveryType(DeliveryType.Delivery);
                setLocation(prev => ({ ...prev, department: 'Junín', province: 'Huancayo' }));
              }}
              className={`group relative flex flex-col p-5 rounded-3xl transition-all duration-300 text-left border ${
                deliveryType === DeliveryType.Delivery 
                  ? 'border-[#c8a96b] bg-gradient-to-b from-[#fdfbf7] to-white shadow-md ring-2 ring-[#c8a96b]/20' 
                  : 'border-[#e8dcdc]/80 bg-white/70 hover:bg-white hover:border-[#c8a96b]/40 hover:shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                  deliveryType === DeliveryType.Delivery ? 'bg-[#c8a96b] text-white shadow-sm' : 'bg-[#faf7f2] text-[#887870] group-hover:text-[#c8a96b]'
                }`}>
                  <Truck className="w-5 h-5" />
                </div>
                {deliveryType === DeliveryType.Delivery ? (
                  <CheckCircle2 className="w-5 h-5 text-[#c8a96b]" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-stone-300" />
                )}
              </div>
              <span className="font-serif font-bold text-base text-[#4a3933] block mb-0.5">
                Delivery a Domicilio
              </span>
              <span className="text-xs text-[#887870] block">
                Solo Huancayo y distritos
              </span>
              <span className="inline-block mt-3 text-[10px] font-bold uppercase tracking-wider text-[#8f6d28] bg-[#fcf9f2] px-2.5 py-1 rounded-full border border-[#c8a96b]/20 w-fit">
                Directo a tu puerta
              </span>
            </button>

            {/* Opción 2: Punto de Encuentro */}
            <button
              type="button"
              onClick={() => {
                setDeliveryType(DeliveryType.MeetingPoint);
                setLocation(prev => ({ ...prev, department: 'Junín', province: 'Huancayo' }));
              }}
              className={`group relative flex flex-col p-5 rounded-3xl transition-all duration-300 text-left border ${
                deliveryType === DeliveryType.MeetingPoint 
                  ? 'border-[#c8a96b] bg-gradient-to-b from-[#fdfbf7] to-white shadow-md ring-2 ring-[#c8a96b]/20' 
                  : 'border-[#e8dcdc]/80 bg-white/70 hover:bg-white hover:border-[#c8a96b]/40 hover:shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                  deliveryType === DeliveryType.MeetingPoint ? 'bg-[#c8a96b] text-white shadow-sm' : 'bg-[#faf7f2] text-[#887870] group-hover:text-[#c8a96b]'
                }`}>
                  <Compass className="w-5 h-5" />
                </div>
                {deliveryType === DeliveryType.MeetingPoint ? (
                  <CheckCircle2 className="w-5 h-5 text-[#c8a96b]" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-stone-300" />
                )}
              </div>
              <span className="font-serif font-bold text-base text-[#4a3933] block mb-0.5">
                Punto de Encuentro
              </span>
              <span className="text-xs text-[#887870] block">
                Plazas y puntos céntricos
              </span>
              <span className="inline-block mt-3 text-[10px] font-bold uppercase tracking-wider text-[#8f6d28] bg-[#fcf9f2] px-2.5 py-1 rounded-full border border-[#c8a96b]/20 w-fit">
                Recojo coordinado
              </span>
            </button>

            {/* Opción 3: Envíos Nacionales */}
            <button
              type="button"
              onClick={() => {
                setDeliveryType(DeliveryType.NationalShipping);
                setLocation(prev => ({ ...prev, department: '', province: '' }));
              }}
              className={`group relative flex flex-col p-5 rounded-3xl transition-all duration-300 text-left border ${
                deliveryType === DeliveryType.NationalShipping 
                  ? 'border-[#c8a96b] bg-gradient-to-b from-[#fdfbf7] to-white shadow-md ring-2 ring-[#c8a96b]/20' 
                  : 'border-[#e8dcdc]/80 bg-white/70 hover:bg-white hover:border-[#c8a96b]/40 hover:shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                  deliveryType === DeliveryType.NationalShipping ? 'bg-[#c8a96b] text-white shadow-sm' : 'bg-[#faf7f2] text-[#887870] group-hover:text-[#c8a96b]'
                }`}>
                  <Map className="w-5 h-5" />
                </div>
                {deliveryType === DeliveryType.NationalShipping ? (
                  <CheckCircle2 className="w-5 h-5 text-[#c8a96b]" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-stone-300" />
                )}
              </div>
              <span className="font-serif font-bold text-base text-[#4a3933] block mb-0.5">
                Envíos a Provincias
              </span>
              <span className="text-xs text-[#887870] block">
                Todo el territorio nacional
              </span>
              <span className="inline-block mt-3 text-[10px] font-bold uppercase tracking-wider text-[#d38b8b] bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100 w-fit">
                Olva / Shalom
              </span>
            </button>
          </div>

          {/* Formulario Dinámico según Modalidad */}
          <div className="bg-[#faf7f2]/90 rounded-3xl p-6 sm:p-7 border border-[#e8dcdc]/80 shadow-2xs">
            {deliveryType === DeliveryType.Delivery && (
              <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                {isLoadingZones ? (
                  <div className="h-13 bg-white rounded-2xl animate-pulse shadow-inner"></div>
                ) : deliveryZones && deliveryZones.length > 0 ? (
                  <>
                    <div>
                      <div className="flex items-center justify-between mb-1.5 ml-1">
                        <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#887870]">
                          <MapPin className="w-3.5 h-3.5 text-[#c8a96b]" />
                          <span>Zona de reparto en Huancayo *</span>
                        </span>
                        <span className="text-[10px] text-[#8f6d28] font-medium">El Tambo, Huancayo, Chilca</span>
                      </div>
                      <select 
                        value={deliveryZoneId}
                        onChange={e => setDeliveryZoneId(e.target.value)}
                        required
                        className="flex h-13 w-full rounded-2xl border border-[#e8dcdc] bg-white px-5 py-3 text-sm text-[#4a3933] font-medium shadow-xs hover:border-[#c8a96b]/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#c8a96b]/15 focus:border-[#c8a96b] transition-all"
                      >
                        <option value="" disabled>Selecciona tu zona de reparto...</option>
                        {deliveryZones.map(z => (
                          <option key={z.id} value={z.id}>
                            {z.name} ({z.district}) — {formatCurrency(z.cost)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5 ml-1">
                        <Navigation className="w-3.5 h-3.5 text-[#c8a96b]" />
                        <span className="text-xs font-bold uppercase tracking-widest text-[#887870]">Dirección exacta de entrega *</span>
                      </div>
                      <Input 
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        required
                        placeholder="Ej. Av. Ferrocarril 450, Interior 2B (Ref: Frente al parque)"
                      />
                      {deliveryZoneId && (
                        <div className="mt-3 flex items-start gap-2.5 text-[#8f6d28] bg-[#fdfbf7] p-3.5 rounded-2xl border border-[#c8a96b]/30 text-xs">
                          <CheckCircle2 className="w-4 h-4 text-[#c8a96b] flex-shrink-0 mt-0.5" />
                          <p className="leading-relaxed">
                            Zona configurada: <strong>{deliveryZones.find(z => z.id === deliveryZoneId)?.name}</strong> ({deliveryZones.find(z => z.id === deliveryZoneId)?.district}). Entregaremos tu pedido en este rango.
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
              <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                {isLoadingPoints ? (
                  <div className="h-13 bg-white rounded-2xl animate-pulse shadow-inner"></div>
                ) : meetingPoints && meetingPoints.length > 0 ? (
                  <div>
                    <div className="flex items-center justify-between mb-1.5 ml-1">
                      <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#887870]">
                        <Compass className="w-3.5 h-3.5 text-[#c8a96b]" />
                        <span>Selecciona el Punto de Encuentro *</span>
                      </span>
                      <span className="text-[10px] text-[#8f6d28] font-medium">Puntos céntricos seguros</span>
                    </div>
                    <select 
                      value={meetingPointId}
                      onChange={e => setMeetingPointId(e.target.value)}
                      required
                      className="flex h-13 w-full rounded-2xl border border-[#e8dcdc] bg-white px-5 py-3 text-sm text-[#4a3933] font-medium shadow-xs hover:border-[#c8a96b]/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#c8a96b]/15 focus:border-[#c8a96b] transition-all"
                    >
                      <option value="" disabled>Selecciona un punto céntrico...</option>
                      {meetingPoints.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} — {p.cost === 0 ? 'Gratis' : formatCurrency(p.cost)}
                        </option>
                      ))}
                    </select>

                    {meetingPointId && (
                      <div className="mt-4 p-4 rounded-2xl bg-[#fdfbf7] border border-[#c8a96b]/30 text-xs space-y-1">
                        <div className="flex items-center gap-1.5 text-[#8f6d28] font-bold">
                          <MapPin className="w-3.5 h-3.5 text-[#c8a96b]" />
                          <span>Punto Seleccionado: {meetingPoints.find(p => p.id === meetingPointId)?.name}</span>
                        </div>
                        <p className="text-[#6d5b52] pl-5">
                          <strong>Dirección / Referencia:</strong> {meetingPoints.find(p => p.id === meetingPointId)?.address}
                        </p>
                      </div>
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
              <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                {/* Banner Boutique Olva / Shalom */}
                <div className="bg-gradient-to-br from-[#fffcf7] to-[#fbf5eb] text-[#4a3933] border border-[#c8a96b]/35 p-5 rounded-2xl shadow-2xs">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#c8a96b]/15 flex items-center justify-center flex-shrink-0 text-[#8f6d28]">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div className="text-xs space-y-1.5">
                      <p className="font-bold text-[#8f6d28] uppercase tracking-wider text-[11px] flex items-center gap-2">
                        <span>Aviso Oficial: Envíos Nacionales</span>
                        <span className="bg-rose-100 text-rose-700 text-[9px] px-2 py-0.5 rounded-full font-bold">Olva / Shalom</span>
                      </p>
                      <p className="text-[#6d5b52] leading-relaxed">
                        Despachamos pedidos a todo el Perú exclusivamente a través de <strong>Olva Courier</strong> o <strong>Shalom</strong> (modalidad pago en destino o entrega en agencia según cobertura).
                      </p>
                      <p className="text-[#887870] text-[11px]">
                        Al confirmar tu orden, coordinaremos vía WhatsApp la agencia exacta y sucursal de tu mayor comodidad.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 mb-1.5 ml-1">
                    <Navigation className="w-3.5 h-3.5 text-[#c8a96b]" />
                    <span className="text-xs font-bold uppercase tracking-widest text-[#887870]">Dirección o Agencia de destino *</span>
                  </div>
                  <Input 
                    value={address} 
                    onChange={e => setAddress(e.target.value)} 
                    required 
                    placeholder="Ej. Agencia Shalom El Agustino o tu dirección exacta" 
                  />
                </div>
              </div>
            )}
            
            {/* Ubicación Común integrada */}
            <div className="mt-8 pt-6 border-t border-[#e8dcdc]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
                <div className="flex items-center gap-2 text-sm font-bold text-[#4a3933] font-serif">
                  <MapPin className="w-4 h-4 text-[#c8a96b]" />
                  <span>Ubicación Geográfica de Destino</span>
                </div>
                <span className="text-[10px] text-[#887870] bg-white px-2.5 py-1 rounded-full border border-[#e8dcdc] w-fit">
                  {deliveryType !== DeliveryType.NationalShipping ? 'Fijado en Huancayo, Junín' : 'Completa tu provincia/departamento'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#887870] ml-1 mb-1 block">
                    Departamento *
                  </label>
                  <Input 
                    value={location.department} 
                    onChange={e => setLocation({ ...location, department: e.target.value })} 
                    placeholder="Ej. Junín o Lima" 
                    required
                    disabled={deliveryType !== DeliveryType.NationalShipping} 
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#887870] ml-1 mb-1 block">
                    Provincia *
                  </label>
                  <Input 
                    value={location.province} 
                    onChange={e => setLocation({ ...location, province: e.target.value })} 
                    placeholder="Ej. Huancayo" 
                    required
                    disabled={deliveryType !== DeliveryType.NationalShipping} 
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#887870] ml-1 mb-1 block">
                    Distrito *
                  </label>
                  <Input 
                    value={location.district} 
                    onChange={e => setLocation({ ...location, district: e.target.value })} 
                    placeholder={deliveryType !== DeliveryType.NationalShipping ? "Ej. El Tambo, Huancayo, Chilca..." : "Ej. Miraflores, Trujillo..."} 
                    required
                  />
                </div>
              </div>
            </div>

          </div>
        </section>
      </div>

      {/* Columna Derecha - Ticket de Orden (Resumen Completo antes del pago) */}
      <div className="w-full lg:w-[440px] flex-shrink-0">
        <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(200,169,107,0.2)] border border-[#c8a96b]/30 sticky top-28 relative overflow-hidden">
          
          {/* Floral decoration top right */}
          <div className="absolute -top-10 -right-10 w-[120px] h-[120px] pointer-events-none z-10 mix-blend-multiply opacity-75">
            <Image src={flo1} alt="" width={120} height={120} className="object-contain rotate-[15deg]"  style={{ width: 'auto', height: 'auto' }} />
          </div>

          {/* Ticket Header */}
          <div className="border-b border-[#e8dcdc] pb-5 mb-5 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-serif uppercase tracking-[0.25em] text-[#c8a96b] font-bold">
                Aura Nova • Atelier
              </span>
              <span className="bg-[#fcf9f2] text-[#8f6d28] border border-[#c8a96b]/30 text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                Ticket Pre-Pago
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#4a3933] mt-1 flex items-center gap-2">
              <Receipt className="w-6 h-6 text-[#c8a96b]" />
              <span>Ticket de Orden</span>
            </h2>
            <p className="text-[11px] text-[#887870] mt-0.5">
              Revisa todos los datos de tu pedido artesanal antes de procesar el pago.
            </p>
          </div>

          {/* SECTION 1: CUSTOMER DATA */}
          <div className="bg-[#faf7f2] rounded-2xl p-3.5 mb-4 border border-[#e8dcdc]/80 relative z-10">
            <div className="flex items-center gap-1.5 text-[10px] font-serif uppercase tracking-wider text-[#8f6d28] font-bold mb-2">
              <User className="w-3.5 h-3.5 text-[#c8a96b]" />
              <span>Datos del Cliente</span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between items-center text-[#4a3933]">
                <span className="text-[#887870] text-[11px]">Nombre:</span>
                <span className="font-bold truncate max-w-[200px] text-right">
                  {customer.name.trim() || <span className="text-stone-400 font-normal italic">Por completar</span>}
                </span>
              </div>
              <div className="flex justify-between items-center text-[#4a3933]">
                <span className="text-[#887870] text-[11px]">Teléfono:</span>
                <span className="font-medium">
                  {customer.phone.trim() || <span className="text-stone-400 font-normal italic">Por completar</span>}
                </span>
              </div>
              <div className="flex justify-between items-center text-[#4a3933]">
                <span className="text-[#887870] text-[11px]">Correo:</span>
                <span className="font-medium truncate max-w-[200px] text-right">
                  {customer.email.trim() || <span className="text-stone-400 font-normal italic">Por completar</span>}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 2: DELIVERY DATA */}
          <div className="bg-[#faf7f2] rounded-2xl p-3.5 mb-5 border border-[#e8dcdc]/80 relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-[10px] font-serif uppercase tracking-wider text-[#8f6d28] font-bold">
                <Truck className="w-3.5 h-3.5 text-[#c8a96b]" />
                <span>Modalidad de Entrega</span>
              </div>
              <span className="text-[10px] font-bold text-[#d38b8b]">
                {deliveryType === DeliveryType.Delivery && 'Delivery Huancayo'}
                {deliveryType === DeliveryType.MeetingPoint && 'Punto de Encuentro'}
                {deliveryType === DeliveryType.NationalShipping && 'Envío Nacional'}
              </span>
            </div>
            <div className="space-y-1.5 text-xs text-[#4a3933]">
              {deliveryType === DeliveryType.Delivery && (
                <>
                  <div className="flex justify-between items-start">
                    <span className="text-[#887870] text-[11px]">Zona:</span>
                    <span className="font-bold text-right">{selectedZone?.name || <span className="text-stone-400 font-normal italic">Sin seleccionar</span>}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-[#887870] text-[11px]">Dirección:</span>
                    <span className="font-medium text-right max-w-[220px] truncate">{address.trim() || <span className="text-stone-400 font-normal italic">Por ingresar</span>}</span>
                  </div>
                </>
              )}

              {deliveryType === DeliveryType.MeetingPoint && (
                <>
                  <div className="flex justify-between items-start">
                    <span className="text-[#887870] text-[11px]">Punto:</span>
                    <span className="font-bold text-right">{selectedMeetingPoint?.name || <span className="text-stone-400 font-normal italic">Sin seleccionar</span>}</span>
                  </div>
                  {selectedMeetingPoint?.address && (
                    <div className="flex justify-between items-start text-[11px]">
                      <span className="text-[#887870]">Referencia:</span>
                      <span className="text-stone-600 text-right max-w-[200px]">{selectedMeetingPoint.address}</span>
                    </div>
                  )}
                </>
              )}

              {deliveryType === DeliveryType.NationalShipping && (
                <>
                  <div className="flex justify-between items-start">
                    <span className="text-[#887870] text-[11px]">Agencia / Dir:</span>
                    <span className="font-medium text-right max-w-[220px] truncate">{address.trim() || <span className="text-stone-400 font-normal italic">Olva o Shalom</span>}</span>
                  </div>
                </>
              )}

              <div className="flex justify-between items-center pt-1 border-t border-black/5 text-[11px]">
                <span className="text-[#887870]">Destino:</span>
                <span className="font-medium text-right">
                  {location.district ? `${location.district}, ` : ''}{location.province}, {location.department}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 3: ITEMS LIST WITH FULL CUSTOMIZATION */}
          <div className="relative z-10 mb-5">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-dashed border-[#d38b8b]/30">
              <span className="text-[10px] font-serif uppercase tracking-wider text-[#887870] font-bold">
                Detalle de Detalles ({items.reduce((a, b) => a + b.quantity, 0)})
              </span>
              <span className="text-[10px] text-[#887870]">Cant. x Precio</span>
            </div>

            <div className="space-y-4 max-h-[38vh] overflow-y-auto pr-1.5 custom-scrollbar">
              {items.map(item => (
                <div key={item.cartItemId || item.productId} className="bg-white/80 rounded-2xl p-3 border border-[#e8dcdc]/60 shadow-2xs space-y-2">
                  <div className="flex gap-3 items-center">
                    {item.imageUrl ? (
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#faf7f2] border border-[#e8dcdc]/60 flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-[#faf7f2] flex items-center justify-center flex-shrink-0 text-[#d38b8b]/40">
                        <Package className="w-5 h-5" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="text-xs font-serif font-bold text-[#4a3933] truncate leading-tight">
                          {item.name}
                        </h4>
                        <span className="text-xs font-bold text-[#c8a96b] whitespace-nowrap">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#887870]">
                        {item.quantity} x {formatCurrency(item.price)}
                      </p>
                    </div>
                  </div>

                  {/* Personalization Specs */}
                  {(item.selectedPrimaryColor || item.selectedSecondaryColor || item.selectedFlowerType || item.selectedFlowerColor || item.hasLights || item.hasButterfly || item.hasPhraseCard || item.phraseText) && (
                    <div className="pt-2 border-t border-black/5 space-y-1.5">
                      <div className="flex flex-wrap gap-1 text-[9px]">
                        {item.selectedPrimaryColor && (
                          <span className="bg-[#fcf9f2] text-[#8f6d28] border border-[#c8a96b]/30 px-1.5 py-0.5 rounded-md">
                            Base: {item.selectedPrimaryColor}
                          </span>
                        )}
                        {item.selectedSecondaryColor && (
                          <span className="bg-[#fcf9f2] text-[#8f6d28] border border-[#c8a96b]/30 px-1.5 py-0.5 rounded-md">
                            Secundario: {item.selectedSecondaryColor}
                          </span>
                        )}
                        {item.selectedFlowerType && (
                          <span className="bg-[#fcf9f2] text-[#8f6d28] border border-[#c8a96b]/30 px-1.5 py-0.5 rounded-md">
                            Flor: {item.selectedFlowerType}
                          </span>
                        )}
                        {item.selectedFlowerColor && (
                          <span className="bg-[#fcf9f2] text-[#8f6d28] border border-[#c8a96b]/30 px-1.5 py-0.5 rounded-md">
                            Color flor: {item.selectedFlowerColor}
                          </span>
                        )}
                        {item.hasLights && (
                          <span className="bg-[#fff8eb] text-[#b58129] border border-[#e8be66]/40 px-1.5 py-0.5 rounded-md">
                            ✨ Luces LED
                          </span>
                        )}
                        {item.hasButterfly && (
                          <span className="bg-[#fff5f5] text-[#b85b6b] border border-[#e8a3b0]/40 px-1.5 py-0.5 rounded-md">
                            🦋 Mariposa
                          </span>
                        )}
                      </div>

                      {/* Dedication Card Quote in Ticket */}
                      {(item.hasPhraseCard || item.phraseText) && (
                        <div className="bg-[#fdfbf7] p-2 rounded-xl border border-[#c8a96b]/25 text-[10px] space-y-0.5">
                          <div className="flex items-center justify-between text-[#8f6d28] font-bold text-[9px]">
                            <span className="flex items-center gap-1">
                              <Mail className="w-2.5 h-2.5" /> Dedicatoria:
                            </span>
                            {item.phraseFont && (
                              <span className="font-normal text-stone-400">({item.phraseFont})</span>
                            )}
                          </div>
                          {item.phraseText && (
                            <p className="font-serif italic text-[#4a3933] line-clamp-2">
                              “{item.phraseText}”
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 4: ACCOUNTING & TOTALS */}
          <div className="pt-4 border-t border-dashed border-[#d38b8b]/30 space-y-2.5 mb-5 text-xs relative z-10">
            <div className="flex justify-between text-[#887870]">
              <span className="font-medium">Subtotal</span>
              <span className="text-[#4a3933] font-bold">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-[#887870]">
              <span className="font-medium">
                {deliveryType === DeliveryType.Delivery && 'Costo de Delivery'}
                {deliveryType === DeliveryType.MeetingPoint && 'Costo Punto de Encuentro'}
                {deliveryType === DeliveryType.NationalShipping && 'Envío Nacional (Agencia)'}
              </span>
              <span className="text-[#4a3933] font-bold">
                {deliveryType === DeliveryType.NationalShipping ? 'Pago en destino (Olva/Shalom)' : formatCurrency(estimatedDeliveryCost)}
              </span>
            </div>

            <div className="pt-3 border-t border-[#e8dcdc] flex justify-between items-end">
              <div>
                <span className="text-[10px] uppercase tracking-widest font-serif font-bold text-[#887870] block">
                  Total Estimado
                </span>
                <span className="text-[10px] text-stone-400">Impuestos y detalles incluidos</span>
              </div>
              <span className="text-3xl font-serif font-bold text-[#c8a96b] tracking-tight">
                {formatCurrency(subtotal + estimatedDeliveryCost)}
              </span>
            </div>
          </div>

          {/* Barcode & Signature */}
          <div className="my-4 pt-3 border-t border-dashed border-black/10 flex flex-col items-center gap-1.5 opacity-75 relative z-10">
            <div className="flex gap-[3px] h-6 items-end">
              {Array.from({ length: 28 }).map((_, i) => (
                <div 
                  key={i} 
                  className="bg-[#4a3933]" 
                  style={{ 
                    width: i % 4 === 0 ? '3px' : i % 3 === 0 ? '1.5px' : '2px', 
                    height: i % 2 === 0 ? '100%' : '75%' 
                  }} 
                />
              ))}
            </div>
            <span className="text-[8px] tracking-[0.25em] font-mono uppercase text-[#887870]">
              AURA-NOVA-ORDER-TICKET
            </span>
          </div>

          <Button 
            type="submit" 
            className="w-full h-14 text-xs tracking-widest uppercase flex items-center justify-center gap-2.5 rounded-full bg-[#4a3933] hover:bg-[#382b26] text-white font-sans font-bold shadow-xl shadow-[#4a3933]/20 transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:pointer-events-none relative z-10"
            disabled={isSubmitting || items.some(i => !i.isAvailable)}
          >
            {isSubmitting ? 'Procesando orden...' : 'Confirmar Pedido y Continuar'}
          </Button>

          <p className="text-[10px] text-[#887870] uppercase tracking-wider font-bold text-center mt-4 flex items-center justify-center gap-1.5 relative z-10">
            <Sparkles className="w-3.5 h-3.5 text-[#c8a96b]" /> Pago seguro vía Transferencia / Yape / Plin
          </p>
        </div>
      </div>
    </form>
    </>
  );
}
