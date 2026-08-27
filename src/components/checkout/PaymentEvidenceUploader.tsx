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
    <div className="bg-cream/40 rounded-xl border border-sage/20 p-6 sm:p-8 h-full">
      <h2 className="font-serif text-2xl font-medium text-brown mb-2">Envía tu comprobante</h2>
      <p className="text-sm text-sage mb-8">Sube la captura de pantalla de la transferencia.</p>

      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        {!file ? (
          <div 
            className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-sage/30 rounded-xl p-8 bg-white/50 hover:bg-white transition-colors cursor-pointer min-h-[300px]"
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud className="w-12 h-12 text-gold mb-4" strokeWidth={1.5} />
            <p className="font-medium text-brown mb-1">Haz clic para seleccionar imagen</p>
            <p className="text-xs text-sage text-center">Solo JPG, PNG o WEBP. Máximo 5 MB.</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            <div className="relative w-full rounded-xl overflow-hidden bg-white border border-sage/20 min-h-[300px] flex items-center justify-center group">
              {previewUrl && (
                <Image 
                  src={previewUrl} 
                  alt="Vista previa del comprobante" 
                  fill 
                  className="object-contain" 
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              )}
              
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                <button 
                  type="button"
                  onClick={clearFile}
                  className="bg-white text-brown font-medium px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-cream transition-colors"
                >
                  <X className="w-4 h-4" /> Cambiar imagen
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-3 mt-4 bg-white p-3 rounded-lg border border-sage/10">
              <div className="bg-sage/10 p-2 rounded-md">
                <FileImage className="w-5 h-5 text-sage" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-brown truncate">{file.name}</p>
                <p className="text-xs text-sage">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
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
          <div className="mt-4 flex items-start gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm border border-red-100" aria-live="polite">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>{errorMsg}</p>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-sage/20">
          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={!file || isPending}
          >
            {isPending ? 'Enviando comprobante...' : 'Enviar comprobante'}
          </Button>
        </div>
      </form>
    </div>
  );
}
