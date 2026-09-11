"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useUploadPaymentEvidence } from '@/hooks/use-payments';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { UploadCloud, FileImage, X, AlertCircle } from 'lucide-react';
import { ApiProblemDetails } from '@/lib/api-errors';

interface PaymentEvidenceUploaderProps {
  orderId: string;
  onSuccess: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function PaymentEvidenceUploader({ orderId, onSuccess }: PaymentEvidenceUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { mutate: uploadEvidence, isPending } = useUploadPaymentEvidence();

  // Prevenir leaks de memoria con Object URLs
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const selectedFile = e.target.files?.[0];
    
    if (!selectedFile) return;

    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setErrorMsg('Formato no permitido. Usa JPG, PNG o WEBP.');
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setErrorMsg('El archivo supera el tamaño máximo de 5 MB.');
      return;
    }

    setFile(selectedFile);
    
    // Crear preview seguro
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const clearFile = () => {
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg('Selecciona un archivo primero.');
      return;
    }

    uploadEvidence(
      { orderId, file },
      {
        onSuccess: () => {
          toast.success('Comprobante enviado exitosamente');
          onSuccess();
        },
        onError: (error) => {
          if (error instanceof ApiProblemDetails) {
            // Manejar errores como 400, 409, 413
            setErrorMsg(error.detail || 'Hubo un error validando tu comprobante.');
          } else {
            setErrorMsg('No pudimos comunicarnos con Aura Nova. Revisa tu conexión e inténtalo nuevamente.');
          }
        }
      }
    );
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-[2.2rem] p-5 sm:p-6 shadow-[0_15px_35px_-10px_rgba(200,169,107,0.12)] border border-[#c8a96b]/25 flex flex-col justify-between h-full space-y-4">
      {/* Header Compacto */}
      <div className="flex items-center justify-between pb-3 border-b border-[#e8dcdc]/70">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-full bg-[#fcf9f2] text-[#8f6d28] border border-[#c8a96b]/30 flex items-center justify-center font-bold text-xs shadow-2xs">
            2
          </span>
          <div>
            <span className="text-[9px] font-serif uppercase tracking-[0.2em] text-[#c8a96b] font-bold block">
              Confirmación
            </span>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-[#4a3933] leading-tight">
              Envía tu Comprobante
            </h3>
          </div>
        </div>
        <span className="text-[10px] text-[#887870] font-medium">
          JPG, PNG o WEBP
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between space-y-4">
        {!file ? (
          <div 
            className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-[#c8a96b]/35 hover:border-[#c8a96b] rounded-2xl p-5 bg-[#fdfbf7] hover:bg-white transition-all cursor-pointer min-h-[170px] text-center group shadow-2xs"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-10 h-10 rounded-full bg-white border border-[#c8a96b]/30 flex items-center justify-center text-[#c8a96b] mb-2 group-hover:scale-110 transition-transform shadow-2xs">
              <UploadCloud className="w-5 h-5" />
            </div>
            <p className="font-serif font-bold text-sm text-[#4a3933] mb-0.5">
              Haz clic o arrastra tu captura aquí
            </p>
            <p className="text-[11px] text-[#887870]">
              Foto o captura legible de tu transferencia (hasta 5 MB)
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col space-y-2.5">
            <div className="relative w-full rounded-2xl overflow-hidden bg-white border border-[#c8a96b]/30 h-[170px] flex items-center justify-center group shadow-2xs">
              {previewUrl && (
                <Image 
                  src={previewUrl} 
                  alt="Vista previa del comprobante" 
                  fill 
                  className="object-contain p-2" 
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              )}
              
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-xs">
                <button 
                  type="button"
                  onClick={clearFile}
                  className="bg-white text-[#4a3933] font-bold text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-md hover:bg-[#fcf9f2] transition-colors"
                >
                  <X className="w-3.5 h-3.5" /> Cambiar captura
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between bg-[#faf7f2] px-3 py-2 rounded-xl border border-[#e8dcdc] text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <FileImage className="w-4 h-4 text-[#c8a96b] shrink-0" />
                <span className="font-medium text-[#4a3933] truncate max-w-[200px]">{file.name}</span>
              </div>
              <span className="text-[10px] text-[#887870] font-mono shrink-0">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
          </div>
        )}

        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/jpeg, image/png, image/webp" 
          onChange={handleFileChange}
          aria-label="Seleccionar comprobante de pago"
        />

        {errorMsg && (
          <div className="flex items-start gap-2 text-rose-700 bg-rose-50 p-2.5 rounded-xl text-xs border border-rose-200" aria-live="polite">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-500" />
            <p>{errorMsg}</p>
          </div>
        )}

        <div className="pt-2">
          <Button 
            type="submit" 
            className="w-full h-12 text-xs font-bold uppercase tracking-widest rounded-full bg-[#4a3933] hover:bg-[#382b26] text-white shadow-lg shadow-[#4a3933]/20 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:pointer-events-none" 
            disabled={!file || isPending}
          >
            {isPending ? 'Validando y enviando comprobante...' : 'Confirmar y Enviar Comprobante'}
          </Button>
        </div>
      </form>
    </div>
  );
}
