"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart.store';
import { useMounted } from '@/hooks/use-mounted';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { OrderSuccess } from './OrderSuccess';
import { formatCurrency } from '@/lib/formatters';
import { toast } from 'sonner';
import { Package, Truck, MapPin, Map, Info, AlertTriangle } from 'lucide-react';
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
    return <OrderSuccess order={createdOrder} />;
  }

  // Cálculos visuales
  const subtotal = getSubtotal();
  let estimatedDeliveryCost = 0;
  
  if (deliveryType === DeliveryType.Delivery && deliveryZoneId && deliveryZones) {
    const zone = deliveryZones.find(z => z.id === deliveryZoneId);
    if (zone) estimatedDeliveryCost = zone.cost;
  } else if (deliveryType === DeliveryType.MeetingPoint && meetingPointId && meetingPoints) {
    const point = meetingPoints.find(p => p.id === meetingPointId);
    if (point) estimatedDeliveryCost = point.cost;
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
      
      {/* Columna Izquierda - Formularios integrados al fondo */}
      <div className="flex-1 space-y-16">
        
        {/* BLOQUE 1: DATOS PERSONALES */}
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
                placeholder="Para enviarte el comprobante de tu pedido"
              />
            </div>
          </div>
        </section>

        <div className="w-full h-px bg-[#e8dcdc]"></div>

        {/* BLOQUE 2: MODALIDAD DE ENTREGA */}
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

          {/* Formulario Dinámico según Modalidad */}
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
                <div className="bg-[#fcf9f2] text-[#c8a96b] border border-[#c8a96b]/20 p-5 rounded-2xl flex gap-3 items-start">
                  <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed font-medium text-[#887870]">
                    <strong className="text-[#c8a96b]">Importante:</strong> El costo del envío a provincia será cotizado según tu destino y peso del paquete tras generar el pedido.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <Input label="Dirección de destino" required value={address} onChange={e => setAddress(e.target.value)} placeholder="Agencia o dirección exacta" />
                  </div>
                </div>
              </div>
            )}
            
            {/* Ubicación Común integrada */}
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

      {/* Columna Derecha - Boleta (Resumen Sticky) */}
      <div className="w-full lg:w-[420px] flex-shrink-0">
        <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_20px_50px_-15px_rgba(211,139,139,0.15)] sticky top-32 relative">
          
          {/* Floral decoration top right */}
          <div className="absolute -top-10 -right-10 w-[120px] h-[120px] pointer-events-none z-20 mix-blend-multiply opacity-80">
            <Image src={flo1} alt="" width={120} height={120} className="object-contain rotate-[15deg]" />
          </div>

          <h2 className="font-serif text-3xl font-bold text-[#4a3933] mb-8 border-b border-[#e8dcdc] pb-6 flex items-center justify-between">
            Tu Boleta
          </h2>
          
          <div className="space-y-6 mb-8 max-h-[45vh] overflow-y-auto pr-2 custom-scrollbar">
            {items.map(item => (
              <div key={item.productId} className="flex gap-4 items-center group relative z-10">
                {item.imageUrl ? (
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white shadow-sm flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-[#fdf5f5] flex items-center justify-center flex-shrink-0">
                    <Package className="w-6 h-6 text-[#d38b8b]/40" />
                  </div>
                )}
                <div className="flex-1 flex flex-col min-w-0">
                  <span className="text-sm font-bold text-[#4a3933] truncate">{item.name}</span>
                  <span className="text-xs text-[#887870] mt-0.5">Cant: {item.quantity}</span>
                  {(item.selectedPrimaryColor || item.selectedFlowerType || item.hasLights || item.hasButterfly || item.hasPhraseCard) && (
                    <div className="mt-1 flex flex-wrap gap-1 text-[10px] text-[#887870]">
                      {item.selectedPrimaryColor && <span className="bg-[#e8dcdc]/40 px-1.5 py-0.5 rounded">{item.selectedPrimaryColor}</span>}
                      {item.selectedFlowerType && <span className="bg-[#e8dcdc]/40 px-1.5 py-0.5 rounded">{item.selectedFlowerType}</span>}
                      {item.hasLights && <span className="bg-[#c8a96b]/10 text-[#b59555] px-1.5 py-0.5 rounded">Luces</span>}
                      {item.hasButterfly && <span className="bg-[#c8a96b]/10 text-[#b59555] px-1.5 py-0.5 rounded">Mariposa</span>}
                      {item.hasPhraseCard && <span className="bg-[#e8dcdc]/40 px-1.5 py-0.5 rounded">Tarjeta</span>}
                    </div>
                  )}
                </div>
                <div className="text-[#4a3933] font-medium text-sm whitespace-nowrap">
                  {formatCurrency(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>
          
          <div className="pt-6 border-t border-dashed border-[#d38b8b]/30 space-y-4 mb-8 text-sm">
            <div className="flex justify-between text-[#887870]">
              <span className="font-medium">Subtotal</span>
              <span className="text-[#4a3933] font-bold">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-[#887870]">
              <span className="font-medium">{deliveryType === DeliveryType.Delivery ? 'Delivery' : deliveryType === DeliveryType.MeetingPoint ? 'Punto de encuentro' : 'Envío nacional'}</span>
              <span className="text-[#4a3933] font-bold">{deliveryType === DeliveryType.NationalShipping ? 'Por cotizar' : formatCurrency(estimatedDeliveryCost)}</span>
            </div>
          </div>
          
          <div className="pt-6 border-t border-[#e8dcdc] mb-10 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-3 text-[10px] uppercase tracking-widest font-bold text-[#887870]">Total a pagar</div>
            <div className="flex justify-between items-end text-[#4a3933] mt-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[#887870] mb-2">Total</span>
              <span className="text-4xl font-serif font-bold text-[#c8a96b]">{deliveryType === DeliveryType.NationalShipping ? 'Por cotizar' : formatCurrency(subtotal + estimatedDeliveryCost)}</span>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-14 text-sm tracking-widest uppercase flex items-center justify-center gap-2.5 rounded-full bg-[#4a3933] hover:bg-[#3d2e29] text-white font-sans font-bold shadow-xl shadow-[#4a3933]/20 transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:pointer-events-none relative z-10"
            disabled={isSubmitting || items.some(i => !i.isAvailable)}
          >
            {isSubmitting ? 'Procesando...' : 'Confirmar pedido'}
          </Button>
          <p className="text-[10px] text-[#887870] uppercase tracking-widest font-bold text-center mt-6 flex items-center justify-center gap-2 relative z-10">
            <Info className="w-3 h-3 text-[#c8a96b]" /> Pago seguro vía transferencia / Yape
          </p>
        </div>
      </div>
    </form>
    </>
  );
}
