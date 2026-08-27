import React from 'react';
import { TrackingDeliveryInfo, TrackingItem } from '@/types/tracking';
import { MapPin, Package, ShoppingBag } from 'lucide-react';

interface TrackingOrderDetailsProps {
  delivery?: TrackingDeliveryInfo;
  items?: TrackingItem[];
}

export function TrackingOrderDetails({ delivery, items }: TrackingOrderDetailsProps) {
  if (!delivery && (!items || items.length === 0)) return null;

  return (
    <div className="w-full bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-[0_20px_50px_-15px_rgba(211,139,139,0.15)] border border-[#d38b8b]/10 relative">
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
          </div>
        )}
        
      </div>
    </div>
  );
}
