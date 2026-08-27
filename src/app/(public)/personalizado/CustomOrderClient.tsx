"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { OrderSuccess } from '../checkout/OrderSuccess';
import { toast } from 'sonner';
import { Upload, X, MapPin, Truck, Map, Package } from 'lucide-react';
import { useDeliveryZones, useMeetingPoints } from '@/hooks/use-checkout';
import { DeliveryType, CreateOrderResponse } from '@/types/checkout';
import { CreateCustomOrderRequest } from '@/types/orders';
import { OrdersService } from '@/services/orders.service';
import { useMounted } from '@/hooks/use-mounted';

export function CustomOrderClient() {
  const isMounted = useMounted();
  const router = useRouter();
  
  const { data: deliveryZones, isLoading: isLoadingZones } = useDeliveryZones();
  const { data: meetingPoints, isLoading: isLoadingPoints } = useMeetingPoints();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<CreateOrderResponse | null>(null);
  const [step, setStep] = useState(1);

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

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customer.name.trim() || !customer.phone.trim() || !customer.email.trim()) {
      toast.error('Faltan datos personales', { description: 'Por favor completa tu nombre, teléfono y correo.' });
      return;
    }

    if (!customizationNotes.trim()) {
      toast.error('Faltan detalles', { description: 'Por favor descríbenos qué diseño deseas.' });
      return;
    }

    if (deliveryType === DeliveryType.Delivery && (!deliveryZoneId || !address.trim() || !location.district.trim())) {
      toast.error('Faltan datos de entrega', { description: 'Completa tu distrito, zona y dirección.' });
      return;
    }

    if (deliveryType === DeliveryType.MeetingPoint && !meetingPointId) {
      toast.error('Faltan datos de recojo', { description: 'Selecciona un punto de encuentro.' });
      return;
    }

    if (deliveryType === DeliveryType.NationalShipping && (!location.department.trim() || !location.province.trim() || !location.district.trim() || !address.trim())) {
      toast.error('Faltan datos de envío', { description: 'Completa tu ubicación y dirección de destino.' });
      return;
    }

    try {
      setIsSubmitting(true);
      
      let referenceImageUrl = null;
      if (imageFile) {
        // Convert to Base64 to send in JSON payload as backend expects a string in CreateCustomOrderRequest
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

      const response = await OrdersService.createCustomOrder(request);
      setCreatedOrder(response);
      window.scrollTo(0, 0);
      toast.success('¡Solicitud enviada!');
    } catch (error: any) {
      console.error(error);
      toast.error('Error al enviar la solicitud', { description: error?.response?.data?.message || 'Inténtalo de nuevo más tarde.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isMounted) return null;

  if (createdOrder) {
    return <OrderSuccess order={createdOrder} />;
  }

  return (
    <div className={`mx-auto px-4 sm:px-6 w-full animate-in fade-in duration-500 transition-all ${step === 1 ? 'max-w-4xl' : 'max-w-7xl'}`}>
      
      <div className="text-center mb-10">
        <h1 className="font-serif text-3xl md:text-5xl text-[#c8a96b] font-bold italic mb-4">
          Pide tu Personalizado
        </h1>
        <p className="text-[#887870] md:text-lg max-w-2xl mx-auto">
          Cuéntanos tu idea, sube una foto de referencia y haremos realidad tu diseño. Enviaremos una cotización detallada tras revisar tu solicitud.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-md border border-[#c8a96b]/20 p-6 md:p-10 rounded-2xl shadow-xl flex flex-col gap-10 w-full transition-all">
        
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
            <h2 className="text-[#4a3933] font-serif text-2xl font-bold flex items-center gap-2 border-b border-[#4a3933]/10 pb-3">
              <span className="bg-[#4a3933] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
              Cuéntanos tu idea
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-[#887870] block">Describe tu diseño ideal *</label>
                <textarea
                  required
                  className="w-full bg-[#faf7f2] border border-[#d38b8b]/30 rounded-xl p-4 min-h-[200px] outline-none focus:border-[#c8a96b] focus:ring-1 focus:ring-[#c8a96b] transition-all resize-none text-[#4a3933]"
                  placeholder="Ej. Quiero una canasta con rosas rojas y tulipanes blancos, y un globo que diga 'Feliz Aniversario'..."
                  value={customizationNotes}
                  onChange={e => setCustomizationNotes(e.target.value)}
                />
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-semibold text-[#887870] block">Foto de referencia (Opcional)</label>
                
                <div 
                  className={`relative w-full h-[200px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden ${imagePreview ? 'border-[#c8a96b]' : 'border-[#d38b8b]/40 hover:border-[#c8a96b] bg-[#faf7f2]'}`}
                  onClick={() => !imagePreview && fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(null); }}
                        className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-red-500 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <div className="text-center p-4 cursor-pointer flex flex-col items-center">
                      <div className="bg-white p-3 rounded-full text-[#c8a96b] mb-3 shadow-sm">
                        <Upload size={24} />
                      </div>
                      <p className="text-[#887870] text-sm font-medium">Click para subir imagen</p>
                      <p className="text-xs text-[#887870]/70 mt-1">JPG, PNG hasta 5MB</p>
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

            <div className="pt-6 border-t border-[#4a3933]/10 flex justify-end">
              <Button 
                type="button" 
                onClick={() => {
                  if (!customizationNotes.trim()) {
                    toast.error('Faltan detalles', { description: 'Por favor descríbenos qué diseño deseas.' });
                    return;
                  }
                  setStep(2);
                }}
                className="w-full md:w-auto px-10 h-12 text-base bg-[#c8a96b] hover:bg-[#b89759] text-white shadow-lg shadow-[#c8a96b]/20 rounded-xl"
              >
                Continuar al Paso 2
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 animate-in slide-in-from-right-4 fade-in duration-300">
            {/* Columna Izquierda - Formularios */}
            <div className="flex-1 space-y-10">
              {/* Sección: Datos Personales */}
              <div className="space-y-6">
                <h2 className="text-[#4a3933] font-serif text-2xl font-bold flex items-center gap-2 border-b border-[#4a3933]/10 pb-3">
                  <span className="bg-[#4a3933] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                  Tus Datos
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input
                    label="Nombre Completo *"
                    placeholder="Ej. Juan Pérez"
                    value={customer.name}
                    onChange={e => setCustomer({...customer, name: e.target.value})}
                    required
                  />
                  <Input
                    label="Teléfono / WhatsApp *"
                    placeholder="Ej. 987654321"
                    value={customer.phone}
                    onChange={e => setCustomer({...customer, phone: e.target.value})}
                    required
                  />
                  <div className="md:col-span-2">
                    <Input
                      label="Correo Electrónico *"
                      type="email"
                      placeholder="Para enviarte la cotización detallada"
                      value={customer.email}
                      onChange={e => setCustomer({...customer, email: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Sección: Entrega */}
              <div className="space-y-6">
                <h2 className="text-[#4a3933] font-serif text-2xl font-bold flex items-center gap-2 border-b border-[#4a3933]/10 pb-3">
                  <span className="bg-[#4a3933] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                  Método de Entrega
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setDeliveryType(DeliveryType.Delivery);
                      setLocation({ department: 'Junín', province: 'Huancayo', district: '' });
                    }}
                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                      deliveryType === DeliveryType.Delivery ? 'border-[#c8a96b] bg-[#c8a96b]/10 text-[#4a3933]' : 'border-gray-200 text-gray-500 hover:border-[#c8a96b]/50'
                    }`}
                  >
                    <Truck size={24} className={deliveryType === DeliveryType.Delivery ? 'text-[#c8a96b]' : ''} />
                    <span className="font-semibold text-sm">Delivery Local</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeliveryType(DeliveryType.MeetingPoint);
                      setLocation({ department: 'Junín', province: 'Huancayo', district: '' });
                    }}
                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                      deliveryType === DeliveryType.MeetingPoint ? 'border-[#c8a96b] bg-[#c8a96b]/10 text-[#4a3933]' : 'border-gray-200 text-gray-500 hover:border-[#c8a96b]/50'
                    }`}
                  >
                    <MapPin size={24} className={deliveryType === DeliveryType.MeetingPoint ? 'text-[#c8a96b]' : ''} />
                    <span className="font-semibold text-sm">Punto de Encuentro</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeliveryType(DeliveryType.NationalShipping);
                      setLocation({ department: '', province: '', district: '' });
                    }}
                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                      deliveryType === DeliveryType.NationalShipping ? 'border-[#c8a96b] bg-[#c8a96b]/10 text-[#4a3933]' : 'border-gray-200 text-gray-500 hover:border-[#c8a96b]/50'
                    }`}
                  >
                    <Map size={24} className={deliveryType === DeliveryType.NationalShipping ? 'text-[#c8a96b]' : ''} />
                    <span className="font-semibold text-sm">Envío Nacional</span>
                  </button>
                </div>

                <div className="bg-[#faf7f2] p-6 rounded-xl border border-[#d38b8b]/20 mt-4 space-y-5">
                  {deliveryType === DeliveryType.Delivery && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="text-xs font-semibold text-[#887870] uppercase tracking-wider mb-2 block">Distrito</label>
                          <select
                            className="w-full bg-white border border-gray-200 rounded-lg p-3 outline-none focus:border-[#c8a96b] transition-all"
                            value={location.district}
                            onChange={e => setLocation({...location, district: e.target.value})}
                            required
                          >
                            <option value="">Seleccione Distrito...</option>
                            <option value="Huancayo">Huancayo</option>
                            <option value="El Tambo">El Tambo</option>
                            <option value="Chilca">Chilca</option>
                          </select>
                        </div>
                        <div className="flex-1">
                          <label className="text-xs font-semibold text-[#887870] uppercase tracking-wider mb-2 block">Zona</label>
                          <select
                            className="w-full bg-white border border-gray-200 rounded-lg p-3 outline-none focus:border-[#c8a96b] transition-all"
                            value={deliveryZoneId}
                            onChange={e => setDeliveryZoneId(e.target.value)}
                            required
                            disabled={isLoadingZones}
                          >
                            <option value="">Seleccione Zona...</option>
                            {deliveryZones?.filter(z => z.district === location.district || location.district === '').map(zone => (
                              <option key={zone.id} value={zone.id}>{zone.name} (S/ {zone.cost.toFixed(2)})</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <Input
                        label="Dirección Completa"
                        placeholder="Calle, número, referencia..."
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  {deliveryType === DeliveryType.MeetingPoint && (
                    <div className="animate-in fade-in slide-in-from-top-4">
                      <label className="text-xs font-semibold text-[#887870] uppercase tracking-wider mb-2 block">Selecciona un Punto (Huancayo)</label>
                      <div className="grid gap-3">
                        {isLoadingPoints ? (
                          <div className="text-center text-sm py-4">Cargando puntos...</div>
                        ) : meetingPoints?.map(point => (
                          <label key={point.id} className={`flex items-center p-3 border rounded-xl cursor-pointer transition-colors ${meetingPointId === point.id ? 'border-[#c8a96b] bg-white' : 'border-gray-200 hover:bg-white/50'}`}>
                            <input
                              type="radio"
                              name="meetingPoint"
                              className="mr-3 text-[#c8a96b] focus:ring-[#c8a96b]"
                              checked={meetingPointId === point.id}
                              onChange={() => setMeetingPointId(point.id)}
                            />
                            <div className="flex-1">
                              <p className="font-semibold text-sm text-[#4a3933]">{point.name}</p>
                              <p className="text-xs text-gray-500">{point.address}</p>
                            </div>
                            <span className="font-semibold text-[#c8a96b] whitespace-nowrap">
                              {point.cost === 0 ? 'Gratis' : `+ S/ ${point.cost.toFixed(2)}`}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {deliveryType === DeliveryType.NationalShipping && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Departamento"
                          placeholder="Ej. Lima"
                          value={location.department}
                          onChange={e => setLocation({...location, department: e.target.value})}
                          required
                        />
                        <Input
                          label="Provincia"
                          placeholder="Ej. Lima"
                          value={location.province}
                          onChange={e => setLocation({...location, province: e.target.value})}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Distrito"
                          placeholder="Ej. Miraflores"
                          value={location.district}
                          onChange={e => setLocation({...location, district: e.target.value})}
                          required
                        />
                        <Input
                          label="Agencia o Dirección"
                          placeholder="Ej. Agencia Shalom o Calle..."
                          value={address}
                          onChange={e => setAddress(e.target.value)}
                          required
                        />
                      </div>
                      <p className="text-xs text-[#887870] italic">
                        * El costo de envío a provincia se agregará a la cotización final.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Columna Derecha - Boleta Sticky */}
            <div className="w-full lg:w-[420px] flex-shrink-0">
              <div className="bg-[#faf7f2] rounded-[2.5rem] p-10 shadow-[0_20px_50px_-15px_rgba(211,139,139,0.15)] sticky top-32 relative border border-[#c8a96b]/20">
                <h2 className="font-serif text-3xl font-bold text-[#4a3933] mb-8 border-b border-[#e8dcdc] pb-6 flex items-center justify-between">
                  Tu Cotización
                </h2>
                <div className="space-y-6 mb-8 pr-2 custom-scrollbar">
                  <div className="flex gap-4 items-center group relative z-10">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white shadow-sm flex-shrink-0 border border-[#d38b8b]/20 flex items-center justify-center">
                      {imagePreview ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={imagePreview} alt="Personalizado" className="w-full h-full object-cover" />
                        </>
                      ) : (
                        <Package className="w-6 h-6 text-[#d38b8b]/40" />
                      )}
                    </div>
                    <div className="flex-1 flex flex-col min-w-0">
                      <span className="text-sm font-bold text-[#4a3933] truncate">Pedido Personalizado</span>
                      <span className="text-xs text-[#887870] mt-0.5 line-clamp-2">{customizationNotes || 'Diseño a medida'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-dashed border-[#d38b8b]/30 space-y-4 mb-8 text-sm">
                  <div className="flex justify-between text-[#887870]">
                    <span className="font-medium">Subtotal</span>
                    <span className="text-[#4a3933] font-bold italic">Por cotizar</span>
                  </div>
                  <div className="flex justify-between text-[#887870]">
                    <span className="font-medium">{deliveryType === DeliveryType.Delivery ? 'Delivery' : deliveryType === DeliveryType.MeetingPoint ? 'Punto de encuentro' : 'Envío nacional'}</span>
                    <span className="text-[#4a3933] font-bold italic">Por cotizar</span>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-[#e8dcdc] mb-10 relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#faf7f2] px-3 text-[10px] uppercase tracking-widest font-bold text-[#887870]">A pagar ahora</div>
                  <div className="flex justify-between items-end text-[#4a3933] mt-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#887870] mb-2">Total Estimado</span>
                    <span className="text-3xl font-serif font-bold text-[#c8a96b]">S/ 0.00*</span>
                  </div>
                  <p className="text-center text-xs font-medium text-[#887870] mt-4 leading-relaxed bg-white/60 p-3 rounded-xl">
                    * Evaluaremos tu diseño y el destino de envío. En breve te contactaremos con el precio final por WhatsApp o Correo.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <Button 
                    type="submit" 
                    className="w-full h-14 text-lg bg-[#c8a96b] hover:bg-[#b89759] text-white shadow-xl shadow-[#c8a96b]/20"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'ENVIANDO...' : 'SOLICITAR COTIZACIÓN'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="w-full h-12"
                  >
                    Volver al Diseño
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
