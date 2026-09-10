import React from 'react';
import { PublicTrackingResponse } from '@/types/tracking';
import { MapPin, Package, ShoppingBag, Truck } from 'lucide-react';

interface TrackingOrderDetailsProps {
  tracking: PublicTrackingResponse;
}

export function TrackingOrderDetails({ tracking }: TrackingOrderDetailsProps) {
  const { delivery, items } = tracking;
  
  if (!delivery && (!items || items.length === 0) && !tracking.shippingProvider) return null;

  return (
    <div className="w-full relative">
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
        
        {/* Productos (Items) */}
        {items && items.length > 0 && (
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-[#fdf5f5] p-3 rounded-full text-[#d38b8b]">
                <ShoppingBag size={20} />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#4a3933] italic">Productos</h3>
            </div>
            
            <div className="space-y-4">
              {items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 bg-[#faf7f2] rounded-2xl border border-[#c8a96b]/20 hover:border-[#c8a96b]/40 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#c8a96b] shadow-sm">
                      <Package size={18} />
                    </div>
                    <span className="font-medium text-[#4a3933]">{item.productName}</span>
                  </div>
                  <div className="bg-white px-4 py-1.5 rounded-lg shadow-sm border border-gray-100">
                    <span className="text-sm font-bold text-[#887870]">x{item.quantity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Separador en Desktop */}
        {items && items.length > 0 && delivery && (
          <div className="hidden lg:block w-px bg-gradient-to-b from-transparent via-[#d38b8b]/20 to-transparent"></div>
        )}
        
        {/* Información de Envío (Delivery) */}
        {delivery && (
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-[#fdf5f5] p-3 rounded-full text-[#d38b8b]">
                <MapPin size={20} />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#4a3933] italic">Información de Entrega</h3>
            </div>
            
            <div className="bg-[#faf7f2] p-6 rounded-2xl border border-[#c8a96b]/20 space-y-5">
              
              {delivery.meetingPointName ? (
                <div>
                  <p className="text-xs uppercase tracking-widest font-semibold text-[#887870] mb-1">Punto de Encuentro</p>
                  <p className="text-[#4a3933] font-medium text-lg">{delivery.meetingPointName}</p>
                </div>
              ) : delivery.deliveryAddress ? (
                <div>
                  <p className="text-xs uppercase tracking-widest font-semibold text-[#887870] mb-1">Dirección de Envío</p>
                  <p className="text-[#4a3933] font-medium text-lg leading-relaxed">{delivery.deliveryAddress}</p>
                </div>
              ) : null}

              {(delivery.district || delivery.province || delivery.department) && (
                <div className="pt-4 border-t border-[#c8a96b]/20">
                  <p className="text-xs uppercase tracking-widest font-semibold text-[#887870] mb-1">Ubicación</p>
                  <p className="text-[#4a3933] font-medium">
                    {[delivery.district, delivery.province, delivery.department].filter(Boolean).join(', ')}
                  </p>
                </div>
              )}
              
              {delivery.deliveryZoneName && (
                <div className="pt-4 border-t border-[#c8a96b]/20">
                  <p className="text-xs uppercase tracking-widest font-semibold text-[#887870] mb-1">Zona de Delivery</p>
                  <span className="inline-block bg-white px-4 py-1.5 rounded-lg shadow-sm border border-[#c8a96b]/30 text-[#4a3933] font-medium text-sm mt-1">
                    {delivery.deliveryZoneName}
                  </span>
                </div>
              )}
              
            </div>
            
            {/* Información de Agencia de Envíos */}
            {(tracking.shippingProvider || tracking.shippingTrackingCode) && (
              <div className="mt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-[#fdf5f5] p-2.5 rounded-full text-[#d38b8b]">
                    <Truck size={18} />
                  </div>
                  <h4 className="font-serif text-xl font-bold text-[#4a3933] italic">Envío por Agencia</h4>
                </div>
                
                <div className="bg-[#faf7f2] p-5 rounded-2xl border border-[#c8a96b]/20 space-y-3 shadow-inner">
                  {tracking.shippingProvider && (
                    <div className="flex justify-between items-center bg-white px-4 py-3 rounded-xl shadow-sm">
                      <span className="text-sm font-medium text-[#887870]">Agencia</span>
                      <span className="font-bold text-[#4a3933]">{tracking.shippingProvider}</span>
                    </div>
                  )}
                  {tracking.shippingTrackingCode && (
                    <div className="flex justify-between items-center bg-white px-4 py-3 rounded-xl shadow-sm border border-[#c8a96b]/20">
                      <span className="text-sm font-medium text-[#887870]">Tracking/Clave</span>
                      <span className="font-bold text-[#c8a96b] tracking-wider font-mono">{tracking.shippingTrackingCode}</span>
                    </div>
                  )}
                  {tracking.shippingProofUrl && (
                    <div className="pt-2 text-center">
                      <a href={tracking.shippingProofUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-[#d38b8b] hover:text-[#c8a96b] transition-colors underline decoration-[#d38b8b]/30 underline-offset-4">
                        Ver boleta/comprobante de envío adjunto
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        )}
        
      </div>
    </div>
  );
}
