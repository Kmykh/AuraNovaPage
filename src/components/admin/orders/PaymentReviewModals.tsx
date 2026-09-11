"use client";

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, XCircle, Download, ExternalLink, AlertTriangle, ShieldCheck, CreditCard } from 'lucide-react';
import { formatCurrency, getImageUrl } from '@/lib/formatters';
import { toast } from 'sonner';

interface ConfirmPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
  orderCode: string;
  orderTotal: number | null;
  paymentAmount?: number;
  paymentMethod?: string;
  evidenceUrl?: string | null;
  customerName?: string;
}

export function ConfirmPaymentModal({
  isOpen,
  onClose,
  onConfirm,
  isPending,
  orderCode,
  orderTotal,
  paymentAmount,
  paymentMethod = 'Yape',
  evidenceUrl,
  customerName
}: ConfirmPaymentModalProps) {
  const [isZoomed, setIsZoomed] = useState(false);

  const handleDownload = async () => {
    if (!evidenceUrl) return;
    try {
      const fullUrl = getImageUrl(evidenceUrl);
      const res = await fetch(fullUrl, { mode: 'cors' });
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `Comprobante_${orderCode}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      toast.success('Comprobante descargado');
    } catch {
      window.open(getImageUrl(evidenceUrl), '_blank');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-xl"
      title="Verificar y Confirmar Pago"
      footer={
        <div className="w-full flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="text-xs"
          >
            Volver
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="bg-[#71a37c] hover:bg-[#588562] text-white text-xs font-bold uppercase tracking-wider rounded-full px-6 shadow-sm flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            {isPending ? 'Confirmando pago...' : 'Sí, Aprobar y Confirmar Pago'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Banner de Información */}
        <div className="bg-[#faf7f2] p-4 rounded-2xl border border-[#c8a96b]/30 flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-[#fdf6e7] text-[#c8a96b] flex items-center justify-center shrink-0 mt-0.5">
            <CreditCard className="w-5 h-5" />
          </div>
          <div className="text-xs space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#4a3933] text-sm font-serif">Pedido {orderCode}</span>
              {customerName && <span className="text-[#887870]">({customerName})</span>}
            </div>
            <p className="text-[#887870]">
              Método reportado: <strong className="text-[#4a3933]">{paymentMethod}</strong>
            </p>
          </div>
        </div>

        {/* Comparativa de Montos */}
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-2xs">
            <span className="text-[10px] text-[#887870] uppercase font-bold block">Total del Pedido</span>
            <span className="text-lg font-serif font-bold text-[#4a3933]">
              {orderTotal !== null ? formatCurrency(orderTotal) : '---'}
            </span>
          </div>
          <div className="bg-[#f2f8f3] p-3 rounded-xl border border-[#71a37c]/30 shadow-2xs">
            <span className="text-[10px] text-[#527d5c] uppercase font-bold block">Monto en Comprobante</span>
            <span className="text-lg font-serif font-bold text-[#2d5736]">
              {paymentAmount !== undefined && paymentAmount !== null ? formatCurrency(paymentAmount) : (orderTotal !== null ? formatCurrency(orderTotal) : '---')}
            </span>
          </div>
        </div>

        {/* Captura del Comprobante */}
        {evidenceUrl && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#887870]">
                Captura del Comprobante:
              </span>
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#c8a96b] hover:text-[#a0824b] hover:underline"
              >
                <Download className="w-3.5 h-3.5" /> Descargar comprobante
              </button>
            </div>

            <div 
              className="relative w-full h-56 bg-stone-100 rounded-2xl overflow-hidden border border-[#c8a96b]/30 flex items-center justify-center group cursor-pointer"
              onClick={() => setIsZoomed(!isZoomed)}
              title="Clic para ampliar"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getImageUrl(evidenceUrl)}
                alt="Comprobante de pago"
                className={`w-full h-full object-contain p-2 transition-transform duration-300 ${isZoomed ? 'scale-150' : 'group-hover:scale-105'}`}
              />
              <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded-md backdrop-blur-xs font-mono">
                {isZoomed ? 'Reducir' : 'Clic para ampliar'}
              </span>
            </div>
          </div>
        )}

        {/* Aviso de Transición de Estado */}
        <div className="bg-[#eef7f0] border border-[#71a37c]/25 p-3 rounded-xl flex items-start gap-2.5 text-xs text-[#355b3d]">
          <ShieldCheck className="w-4 h-4 text-[#71a37c] shrink-0 mt-0.5" />
          <p>
            Al confirmar, el pedido pasará a <strong>Pago Confirmado</strong> y quedará habilitado para que los artesanos comiencen la preparación de las flores en el taller.
          </p>
        </div>
      </div>
    </Modal>
  );
}

interface RejectPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReject: (reason: string) => void;
  isPending: boolean;
  orderCode: string;
}

export function RejectPaymentModal({
  isOpen,
  onClose,
  onReject,
  isPending,
  orderCode
}: RejectPaymentModalProps) {
  const [reason, setReason] = useState('');
  const [preset, setPreset] = useState('');

  const PRESETS = [
    'Monto insuficiente o incompleto respecto al total acordado',
    'Comprobante borroso o ilegible',
    'Número de operación no figura en la cuenta bancaria',
    'Comprobante duplicado o ya utilizado'
  ];

  const handleSelectPreset = (p: string) => {
    setPreset(p);
    setReason(p);
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error('Indica el motivo del rechazo.');
      return;
    }
    onReject(reason.trim());
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-lg"
      title="Rechazar Comprobante de Pago"
    >
      <form onSubmit={handleConfirmReject} className="space-y-4">
        <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl flex items-start gap-2 text-xs text-rose-800">
          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <p>
            El comprobante del pedido <strong>{orderCode}</strong> será rechazado. El cliente será notificado para que pueda adjuntar un nuevo comprobante válido.
          </p>
        </div>

        {/* Motivos Rápidos */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#887870]">
            Motivos frecuentes:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className={`text-left text-xs px-2.5 py-1.5 rounded-lg border transition-all ${preset === p ? 'bg-rose-100 border-rose-300 text-rose-900 font-semibold' : 'bg-white border-stone-200 text-stone-700 hover:border-rose-300'}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Campo de Texto */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#887870]">
            Detalle del motivo (visible en notas internas):
          </label>
          <textarea
            required
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Describe la razón por la que se rechaza el comprobante..."
            className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:border-rose-400 focus:ring-1 focus:ring-rose-400 outline-none resize-none"
          />
        </div>

        <div className="flex justify-end gap-2.5 pt-2 border-t border-stone-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isPending || !reason.trim()}
            className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider rounded-full px-5 flex items-center gap-1.5"
          >
            <XCircle className="w-4 h-4" />
            {isPending ? 'Rechazando...' : 'Rechazar Comprobante'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
