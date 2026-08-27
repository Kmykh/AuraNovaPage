import React, { useState } from 'react';
import Image from 'next/image';
import { PublicTrackingResponse } from '@/types/tracking';
import { getDeliveryTypeLabel } from '@/lib/tracking-helpers';
import { formatCurrency } from '@/lib/formatters';
import { Check, Copy, Package, CalendarClock, MapPin } from 'lucide-react';

import flo1 from '@/app/(public)/images/flo1.png';
import flo2 from '@/app/(public)/images/flo2.png';

interface TrackingStatusCardProps {
  tracking: PublicTrackingResponse;
}

export function TrackingStatusCard({ tracking }: TrackingStatusCardProps) {
  const [copied, setCopied] = useState(false);
  
  const handleCopyCode = () => {
    navigator.clipboard.writeText(tracking.orderCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const deliveryTypeLabel = getDeliveryTypeLabel(tracking.deliveryType);

  const completedCount = tracking.timeline?.filter(t => t.completed).length || 0;
  const totalCount = tracking.timeline?.length || 1;
  const progressPercentage = Math.max(0, (completedCount - 1) / (totalCount - 1) * 100);

  return (
    <div className="w-full relative animate-scale-in bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-[0_20px_50px_-15px_rgba(211,139,139,0.15)] border border-[#d38b8b]/10">
      
      {/* Header Info - Borderless */}
      <div className="flex flex-col md:flex-row justify-between items-center w-full mb-6 gap-8">
        
        <div className="text-center md:text-left flex flex-col items-center md:items-start">
           <p className="text-xs uppercase tracking-[0.2em] text-[#887870] font-bold mb-2">Código de Pedido</p>
           <div className="flex items-center gap-3">
             <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#4a3933] drop-shadow-sm">{tracking.orderCode}</h2>
             <button 
               onClick={handleCopyCode}
               className="p-2 rounded-xl hover:bg-[#faf7f2] transition-colors text-[#c8a96b] flex items-center justify-center border border-[#e8dcdc] shadow-sm"
               title="Copiar código"
             >
               {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
             </button>
           </div>
           
           {/* Status Badge */}
           <div className="mt-4 inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#fdf5f5] shadow-sm border border-[#d38b8b]/20">
             <span className="relative flex h-3 w-3">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c8a96b] opacity-75"></span>
               <span className="relative inline-flex rounded-full h-3 w-3 bg-[#c8a96b]"></span>
             </span>
             <span className="text-sm font-bold text-[#d38b8b] uppercase tracking-wider">{tracking.statusLabel}</span>
           </div>
        </div>
        
        <div className="flex gap-8 text-center md:text-right bg-[#faf7f2] p-6 rounded-3xl border border-[#e8dcdc]/50 shadow-inner">
           <div>
             <p className="text-xs uppercase tracking-widest text-[#887870] font-bold mb-1">Modalidad</p>
             <p className="font-serif text-xl font-bold text-[#4a3933]">{deliveryTypeLabel}</p>
           </div>
           <div className="w-px bg-[#e8dcdc]"></div>
           <div>
             <p className="text-xs uppercase tracking-widest text-[#887870] font-bold mb-1">Total</p>
             <p className="font-serif text-xl font-bold text-[#c8a96b]">
               {tracking.total !== null ? formatCurrency(tracking.total) : '---'}
             </p>
           </div>
        </div>
      </div>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-[#e8dcdc] to-transparent my-10"></div>

      {/* Horizontal Timeline */}
      <div className="w-full relative pb-4 pt-16">
        <div className="w-full relative px-2 sm:px-12">
          
          {/* Connecting Base Line */}
          <div className="absolute top-5 left-12 right-12 h-1 bg-[#f0e8e8] rounded-full z-0"></div>
          
          {/* Fill Line for Completed */}
          <div className="absolute top-5 left-12 h-1 bg-gradient-to-r from-[#d38b8b] to-[#c8a96b] rounded-full z-0 transition-all duration-1000 shadow-sm" 
               style={{ width: `calc(${progressPercentage}% - ${progressPercentage === 100 ? '24px' : '0px'})` }}></div>

          <div className="relative z-10 flex justify-between items-start">
            {tracking.timeline?.map((event, idx) => {
              const isCompleted = event.completed;
              return (
                <div key={idx} className={`relative flex flex-col items-center group flex-1 min-w-[60px] sm:min-w-[100px] max-w-[150px] text-center transition-opacity duration-500 ${isCompleted ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}>
                  
                  {/* Flower image on top of node if completed */}
                  {isCompleted && (
                    <div className="absolute -top-14 animate-float-gentle opacity-80 mix-blend-multiply pointer-events-none drop-shadow-md z-20">
                      <Image src={idx % 2 === 0 ? flo1 : flo2} alt="" width={65} height={65} className="object-contain" />
                    </div>
                  )}

                  {/* Timeline Node */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors duration-500 mb-4 shadow-md
                    ${isCompleted ? 'bg-white border-[3px] border-[#c8a96b] text-[#c8a96b]' : 'bg-[#faf7f2] border-[3px] border-[#e8dcdc] text-[#887870]/40'}`}>
                    {isCompleted ? <Check size={20} strokeWidth={3} /> : <Package size={20} strokeWidth={2} />}
                  </div>
                  
                  <div>
                    <p className={`font-bold text-sm leading-tight ${isCompleted ? 'text-[#4a3933]' : 'text-[#887870]'}`}>{event.label}</p>
                    {event.createdAt && isCompleted && (
                      <p className="text-[11px] text-[#887870] font-medium mt-2 bg-[#faf7f2] px-2 py-1 rounded-md inline-block border border-[#e8dcdc]/50">
                        {new Date(event.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
    </div>
  );
}
