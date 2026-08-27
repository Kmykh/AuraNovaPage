"use client";

import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { paymentsService } from '@/services/payments.service';

interface TrackingPaymentUploadProps {
  orderCode: string;
  trackingToken: string;
  onSuccess: () => void;
}

export function TrackingPaymentUpload({ orderCode, trackingToken, onSuccess }: TrackingPaymentUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // Basic validation
      if (!selectedFile.type.startsWith('image/')) {
        toast.error('Por favor selecciona una imagen válida (JPG, PNG, WEBP).');
        return;
      }
      
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('La imagen no debe pesar más de 5MB.');
        return;
      }

      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const clearSelection = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setIsUploading(true);
      // Utilizamos el servicio de pagos. Asumimos que el backend acepta el orderCode como identificador público.
      await paymentsService.uploadPaymentEvidence(orderCode, file);

      toast.success('¡Comprobante subido exitosamente!');
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error('Hubo un problema al subir tu comprobante. Intenta nuevamente.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full relative mt-4">
      <h3 className="font-serif text-xl font-bold text-[#d38b8b] italic mb-2 text-center md:text-left">Sube tu comprobante aquí</h3>
      <p className="text-sm text-[#887870] font-medium mb-6 text-center md:text-left">Hemos detectado que tu pedido está pendiente de pago. Por favor sube la captura de pantalla de tu transferencia para poder procesarlo.</p>

      {!file ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[#c8a96b]/40 bg-[#fdf5f5] rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#faf7f2] hover:border-[#c8a96b] transition-all duration-300 group shadow-inner"
        >
          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-md transition-all">
            <Upload className="w-6 h-6 text-[#c8a96b]" />
          </div>
          <p className="text-sm font-bold text-[#4a3933] mb-1">Haz clic para seleccionar una imagen</p>
          <p className="text-xs text-[#887870] font-medium">JPG, PNG o WEBP (Máx. 5MB)</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="relative rounded-3xl overflow-hidden border border-[#d38b8b]/20 bg-[#faf7f2] p-3 flex items-center gap-4 shadow-inner">
            <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-white border border-[#e8dcdc] shadow-sm">
              {preview && <img src={preview} alt="Vista previa" className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#4a3933] truncate">{file.name}</p>
              <p className="text-xs text-[#887870] font-medium mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button 
              onClick={clearSelection}
              disabled={isUploading}
              className="p-3 mr-2 bg-white rounded-full text-[#887870] hover:text-rose hover:shadow-sm transition-all disabled:opacity-50"
            >
              <X size={18} />
            </button>
          </div>

          <Button 
            className="w-full h-14 rounded-full bg-[#c8a96b] hover:bg-[#b89759] text-white font-bold tracking-wider shadow-xl shadow-[#c8a96b]/20 transition-all hover:-translate-y-1"
            onClick={handleUpload} 
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                Subiendo comprobante...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-3" />
                Confirmar y enviar
              </>
            )}
          </Button>
        </div>
      )}

      <input 
        type="file" 
        accept="image/jpeg,image/png,image/webp" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileChange}
      />
    </div>
  );
}
