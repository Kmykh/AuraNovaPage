"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart.store';
import { useMounted } from '@/hooks/use-mounted';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { OrderSuccess, OrderDetailsSnapshot } from './OrderSuccess';
import { formatCurrency } from '@/lib/formatters';
import { toast } from 'sonner';
import { ArrowRight, Package, User, Phone, Mail, ShieldCheck } from 'lucide-react';
import { useDeliveryZones, useMeetingPoints, useCreateOrder } from '@/hooks/use-checkout';
import { DeliveryType, CreateOrderRequest, CreateOrderResponse } from '@/types/checkout';
import { ApiProblemDetails, isTransientApiError } from '@/lib/api-errors';
import { TransientApiErrorState } from '@/components/shared/TransientApiErrorState';
import Image from 'next/image';
import { ItemOptions } from '@/components/shared/ItemOptions';
import { DeliveryDetailsForm } from '@/components/checkout/DeliveryDetailsForm';
import { DeliveryFormValue, deliveryCost, describeDelivery, emptyDelivery, toDeliveryRequest, validateDelivery } from '@/lib/delivery-form';
import { itemAccessories, itemColors, itemFlowers } from '@/lib/product-options';
import { cardSummary } from '@/lib/card-design';
import { PurchaseSteps } from '../carrito/CartClient';
import { isValidPeruPhone, readSavedCustomer, saveCustomer } from '@/lib/saved-customer';

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
        // El backend cobra cada accesorio con el precio de la configuración
        selectedAccessories: i.accessories?.map(a => a.key),
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
            accessories: itemAccessories(i),
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
      const accessories = itemAccessories(item);
      if (accessories.length) msg += `  Con: ${accessories.map(a => a.name).join(', ')}\n`;
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

      {/* Columna derecha: solo lo que cambia el precio (los datos ya están en el formulario y el ticket sale al confirmar) */}
      <aside className="w-full flex-shrink-0 lg:w-[400px]">
        <div className="sticky top-28 overflow-hidden rounded-[2rem] border border-[#c8a96b]/30 bg-white/95 shadow-[0_25px_60px_-20px_rgba(200,169,107,0.3)] backdrop-blur-xl">
          <div className="flex items-baseline justify-between gap-3 border-b border-[#efe6dd] px-6 pb-4 pt-6">
            <h2 className="font-serif text-2xl font-bold text-[#4a3933]">Tu pedido</h2>
            <Link href="/carrito" className="text-xs font-bold text-[#b08a4e] hover:text-[#4a3933]">
              {items.reduce((a, b) => a + b.quantity, 0)} {items.reduce((a, b) => a + b.quantity, 0) === 1 ? 'detalle' : 'detalles'} · Editar
            </Link>
          </div>

          <ul className="max-h-[42vh] divide-y divide-[#f1e9e4] overflow-y-auto px-6 custom-scrollbar">
            {items.map(item => (
              <li key={item.cartItemId || item.productId} className="flex gap-3 py-3.5">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[#e8dcdc]/60 bg-[#faf7f2]">
                  {item.imageUrl
                    ? <Image src={item.imageUrl} alt="" fill sizes="56px" className="object-cover" />
                    : <Package className="absolute inset-0 m-auto h-5 w-5 text-[#d38b8b]/40" />}
                  {item.quantity > 1 && (
                    <span className="absolute right-0.5 top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#4a3933] px-1 text-[10px] font-bold text-white">{item.quantity}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-sm font-bold text-[#4a3933]">{item.name}</p>
                    <span className="shrink-0 text-sm font-bold text-[#4a3933]">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                  {item.quantity > 1 && <p className="text-[11px] text-[#887870]">{item.quantity} × {formatCurrency(item.price)}</p>}
                  <ItemOptions
                    className="mt-1.5"
                    colors={itemColors(item)}
                    flowers={itemFlowers(item)}
                    accessories={item.accessories}
                    hasLights={item.hasLights}
                    hasButterfly={item.hasButterfly}
                    hasPhraseCard={item.hasPhraseCard && !!item.phraseText}
                  />
                </div>
              </li>
            ))}
          </ul>

          <dl className="space-y-2 border-t border-dashed border-[#e8dcdc] bg-[#fdfbf8] px-6 py-4 text-sm">
            <div className="flex justify-between text-[#887870]">
              <dt>Productos</dt>
              <dd className="font-semibold text-[#4a3933]">{formatCurrency(subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-3 text-[#887870]">
              <dt className="min-w-0">
                Entrega
                <span className="block truncate text-[11px]">
                  {deliveryType === DeliveryType.Delivery && (selectedZone ? `Delivery · ${selectedZone.name}` : 'Delivery · elige tu zona')}
                  {deliveryType === DeliveryType.MeetingPoint && (selectedMeetingPoint ? `Recojo · ${selectedMeetingPoint.name}` : 'Recojo · elige el punto')}
                  {deliveryType === DeliveryType.NationalShipping && `Envío por ${delivery.agency || 'agencia'}`}
                </span>
              </dt>
              <dd className="shrink-0 font-semibold text-[#4a3933]">
                {deliveryType === DeliveryType.NationalShipping
                  ? 'Al recoger'
                  : estimatedDeliveryCost === 0 && (selectedZone || selectedMeetingPoint) ? 'Gratis' : formatCurrency(estimatedDeliveryCost)}
              </dd>
            </div>
            <div className="flex items-end justify-between border-t border-[#e8dcdc] pt-3">
              <dt className="text-xs font-bold uppercase tracking-widest text-[#887870]">Total</dt>
              <dd className="font-serif text-3xl font-bold text-[#4a3933]">{formatCurrency(subtotal + estimatedDeliveryCost)}</dd>
            </div>
          </dl>

          <div className="px-6 pb-6 pt-1">
            <Button
              type="submit"
              className="flex h-14 w-full items-center justify-center gap-2.5 rounded-full bg-[#4a3933] font-sans text-xs font-bold uppercase tracking-widest text-white shadow-xl shadow-[#4a3933]/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#382b26] disabled:pointer-events-none disabled:opacity-50"
              disabled={isSubmitting || items.some(i => !i.isAvailable)}
            >
              {isSubmitting ? 'Procesando pedido…' : <>Confirmar pedido <ArrowRight className="h-4 w-4" /></>}
            </Button>
            <p className="mt-3 flex items-start justify-center gap-1.5 text-center text-[11px] leading-snug text-[#887870]">
              <ShieldCheck className="mt-px h-3.5 w-3.5 shrink-0 text-[#c8a96b]" />
              En el siguiente paso pagas el 50% o el total, con tarjeta o Yape.
            </p>
          </div>
        </div>
      </aside>
    </form>
    </>
  );
}
