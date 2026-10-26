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
import { Package, Truck, User, Phone, Mail, Sparkles, Receipt, ShieldCheck } from 'lucide-react';
import { useDeliveryZones, useMeetingPoints, useCreateOrder } from '@/hooks/use-checkout';
import { DeliveryType, CreateOrderRequest, CreateOrderResponse } from '@/types/checkout';
import { ApiProblemDetails, isTransientApiError } from '@/lib/api-errors';
import { TransientApiErrorState } from '@/components/shared/TransientApiErrorState';
import Image from 'next/image';
import { ItemOptions } from '@/components/shared/ItemOptions';
import { DeliveryDetailsForm } from '@/components/checkout/DeliveryDetailsForm';
import { DeliveryFormValue, deliveryCost, describeDelivery, emptyDelivery, toDeliveryRequest, validateDelivery } from '@/lib/delivery-form';
import { itemColors, itemFlowers } from '@/lib/product-options';
import { CardThemeId, cardSummary } from '@/lib/card-design';
import { CardArt } from '@/components/card/CardArt';
import { PurchaseSteps } from '../carrito/CartClient';
import { isValidPeruPhone, readSavedCustomer, saveCustomer } from '@/lib/saved-customer';
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

  // Customer Form State: se recuerdan los datos del último pedido en este navegador
  const [customer, setCustomer] = useState(readSavedCustomer);
  
  // Entrega: solo los datos que aplican a cada modalidad
  const [delivery, setDelivery] = useState<DeliveryFormValue>(emptyDelivery);
  const deliveryType = delivery.type;
  const address = delivery.address;

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
  
  const selectedZone = deliveryZones?.find(z => z.id === delivery.zoneId);
  const selectedMeetingPoint = meetingPoints?.find(p => p.id === delivery.meetingPointId);
  estimatedDeliveryCost = deliveryCost(delivery, deliveryZones, meetingPoints);
  const deliveryRequest = toDeliveryRequest(delivery, deliveryZones);
  const location = {
    department: deliveryRequest.department ?? '',
    province: deliveryRequest.province ?? '',
    district: deliveryRequest.district ?? '',
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validaciones básicas
    if (!customer.name.trim() || !customer.phone.trim() || !customer.email.trim()) {
      toast.error('Faltan datos personales', { description: 'Por favor completa tu nombre, teléfono y correo electrónico.' });
      return;
    }
    
    if (!isValidPeruPhone(customer.phone)) {
      toast.error('Revisa tu número de WhatsApp', { description: 'Debe tener 9 dígitos y empezar con 9 (ej. 987654321).' });
      return;
    }

    const deliveryError = validateDelivery(delivery);
    if (deliveryError) {
      toast.error('Revisa los datos de entrega', { description: deliveryError });
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
        selectedColors: itemColors(i),
        selectedFlowerTypes: itemFlowers(i),
        hasLights: i.hasLights,
        hasButterfly: i.hasButterfly,
        hasPhraseCard: i.hasPhraseCard,
        phraseText: i.phraseText,
        phraseFont: i.phraseFont,
        phraseTo: i.phraseTo,
        phraseFrom: i.phraseFrom,
        phraseTheme: i.phraseTheme === 'foto' && !i.cardPhoto ? 'marfil' : i.phraseTheme ?? i.phraseBackground,
        // La foto solo viaja si el cliente eligió "Tu foto"; el servidor la guarda en privado
        cardBackgroundImage: i.phraseTheme === 'foto' ? i.cardPhoto : undefined,
      })),
      delivery: deliveryRequest
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
            selectedColors: itemColors(i),
            selectedFlowerTypes: itemFlowers(i),
            hasLights: i.hasLights,
            hasButterfly: i.hasButterfly,
            hasPhraseCard: i.hasPhraseCard,
            phraseText: i.phraseText ? cardSummary({ text: i.phraseText, to: i.phraseTo ?? '', from: i.phraseFrom ?? '' }) : undefined,
            phraseFont: i.phraseFont
          })),
          delivery: {
            type: deliveryType,
            zoneName: selectedZone?.name,
            meetingPointName: selectedMeetingPoint?.name,
            meetingPointAddress: selectedMeetingPoint?.address,
            address: address.trim(),
            department: location.department,
            province: location.province,
            district: location.district
          }
        };

        setOrderSnapshot(snapshot);
        saveCustomer({ name: customer.name.trim(), phone: customer.phone.trim(), email: customer.email.trim() });
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
      const colors = itemColors(item);
      const flowers = itemFlowers(item);
      if (colors.length) msg += `  Colores: ${colors.join(' / ')}\n`;
      if (flowers.length) msg += `  Flores: ${flowers.join(' / ')}\n`;
      if (item.hasLights) msg += `  Con luces\n`;
      if (item.hasButterfly) msg += `  Con mariposas\n`;
      if (item.phraseText) msg += `  Tarjeta: ${cardSummary({ text: item.phraseText, to: item.phraseTo ?? '', from: item.phraseFrom ?? '' })}\n`;
    });
    
    msg += `\n*Modalidad de entrega:*\n`;
    msg += `${describeDelivery(delivery, deliveryZones, meetingPoints)}\n`;
    if (delivery.isGift) msg += `Recibe: ${delivery.recipientName} (${delivery.recipientPhone})\n`;
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
      <header className="mx-auto mb-10 max-w-xl text-center">
        <PurchaseSteps current={2} />
        <h1 className="mt-6 font-serif text-4xl font-bold tracking-tight text-[#4a3933] sm:text-5xl">Entrega y datos</h1>
        <p className="mt-2 text-sm text-[#887870]">Dinos cómo te lo entregamos y a quién avisamos. En el siguiente paso pagas.</p>
      </header>

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

              {delivery.isGift && delivery.recipientName.trim() && (
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-[#887870]">Recibe:</span>
                  <span className="font-medium text-right">{delivery.recipientName.trim()}</span>
                </div>
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
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#faf7f2] border border-[#e8dcdc]/60 flex-shrink-0">
                        <Image src={item.imageUrl} alt={item.name} fill sizes="56px" className="object-cover" />
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
                  {(itemColors(item).length > 0 || itemFlowers(item).length > 0 || item.hasLights || item.hasButterfly || item.hasPhraseCard || item.phraseText) && (
                    <div className="pt-2 border-t border-black/5 space-y-1.5">
                      <ItemOptions
                        colors={itemColors(item)}
                        flowers={itemFlowers(item)}
                        hasLights={item.hasLights}
                        hasButterfly={item.hasButterfly}
                      />

                      {/* Tarjeta tal como se imprimirá */}
                      {item.hasPhraseCard && item.phraseText && (
                        <div className="grid grid-cols-[6.5rem_1fr] items-center gap-2.5 rounded-xl bg-[#fdfbf7] p-1.5">
                          <CardArt
                            design={{
                              text: item.phraseText, font: item.phraseFont ?? 'Elegante/Cursiva', to: item.phraseTo ?? '', from: item.phraseFrom ?? '',
                              theme: (item.phraseTheme === 'foto' && !item.cardPhoto ? 'marfil' : item.phraseTheme ?? 'marfil') as CardThemeId,
                              photo: item.cardPhoto,
                            }}
                          />
                          <p className="line-clamp-3 font-serif text-[10px] italic text-[#4a3933]">
                            {item.phraseTo ? `Para ${item.phraseTo}: ` : ''}“{item.phraseText}”
                          </p>
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
                {deliveryType === DeliveryType.NationalShipping && `Envío por ${delivery.agency || 'agencia'}${delivery.district ? ` a ${delivery.district}` : ''}`}
              </span>
              <span className="text-[#4a3933] font-bold">
                {deliveryType === DeliveryType.NationalShipping ? 'Lo pagas al recoger' : formatCurrency(estimatedDeliveryCost)}
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
            {isSubmitting ? 'Procesando pedido…' : `Confirmar pedido · ${formatCurrency(subtotal + estimatedDeliveryCost)}`}
          </Button>

          <p className="text-[10px] text-[#887870] uppercase tracking-wider font-bold text-center mt-4 flex items-center justify-center gap-1.5 relative z-10">
            <Sparkles className="w-3.5 h-3.5 text-[#c8a96b]" /> Pago seguro con tarjeta o Yape vía Mercado Pago
          </p>
        </div>
      </div>
    </form>
    </>
  );
}
