"use client";

import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { AlertCircle, Camera, CheckCircle2, Loader2, RefreshCw, UploadCloud } from 'lucide-react';
import { useUploadPaymentEvidence } from '@/hooks/use-payments';
import { Button } from '@/components/ui/Button';
import { ApiProblemDetails } from '@/lib/api-errors';
import { compressImage } from '@/lib/compress-image';

interface PaymentEvidenceUploaderProps {
  orderId: string;
  onSuccess: () => void;
}

// Se acepta la foto tal cual sale del celular: se reduce en el navegador antes de subirla
const MAX_ORIGINAL_SIZE = 25 * 1024 * 1024;
const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const formatSize = (bytes: number) => (bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`);

export function PaymentEvidenceUploader({ orderId, onSuccess }: PaymentEvidenceUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { mutate: uploadEvidence, isPending } = useUploadPaymentEvidence();

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const pickFile = async (selected: File | undefined) => {
    setErrorMsg(null);
    if (!selected) return;

    if (!ALLOWED_TYPES.includes(selected.type)) {
      setErrorMsg('Sube una foto o captura en JPG, PNG o WEBP.');
      return;
    }
    if (selected.size > MAX_ORIGINAL_SIZE) {
      setErrorMsg('La imagen es demasiado grande. Envía una captura de pantalla de tu Yape.');
      return;
    }

    setIsPreparing(true);
    // Fotos de celular de 5-12 MB quedan en ~300 KB: suben rápido aun con datos móviles
    const compressed = await compressImage(selected, 2000, 0.85);
    setIsPreparing(false);

    if (compressed.size > MAX_UPLOAD_SIZE) {
      setErrorMsg('No pudimos reducir la imagen. Envía una captura de pantalla de tu Yape.');
      return;
    }

    setOriginalSize(selected.size);
    setFile(compressed);
    setPreviewUrl(URL.createObjectURL(compressed));
  };

  const clearFile = () => {
    setFile(null);
    setOriginalSize(null);
    setPreviewUrl(null);
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg('Primero elige la captura de tu pago.');
      return;
    }

    setProgress(0);
    uploadEvidence(
      { orderId, file, onProgress: setProgress },
      {
        onSuccess: () => {
          toast.success('¡Comprobante recibido!');
          onSuccess();
        },
        onError: (error) => {
          setProgress(null);
          setErrorMsg(error instanceof ApiProblemDetails
            ? error.detail || 'No pudimos validar tu comprobante.'
            : 'No pudimos comunicarnos con Aura Nova. Revisa tu conexión e inténtalo de nuevo.');
        },
      },
    );
  };

  const busy = isPending || isPreparing;

  return (
    <div className="flex h-full flex-col justify-between space-y-4 rounded-[2.2rem] border border-[#c8a96b]/25 bg-white/90 p-5 shadow-[0_15px_35px_-10px_rgba(200,169,107,0.12)] backdrop-blur-xl sm:p-6">
      <div className="flex items-center gap-2.5 border-b border-[#e8dcdc]/70 pb-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#c8a96b]/30 bg-[#fcf9f2] text-xs font-bold text-[#8f6d28]">2</span>
        <div>
          <span className="block font-serif text-[9px] font-bold uppercase tracking-[0.2em] text-[#c8a96b]">Último paso</span>
          <h3 className="font-serif text-lg font-bold leading-tight text-[#4a3933] sm:text-xl">Sube la captura de tu pago</h3>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-1 flex-col justify-between space-y-4">
        {!file ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              void pickFile(e.dataTransfer.files?.[0]);
            }}
            className={`group flex min-h-[190px] flex-1 flex-col items-center justify-center rounded-2xl border-2 border-dashed p-5 text-center transition ${
              isDragging ? 'border-[#c8a96b] bg-white' : 'border-[#c8a96b]/35 bg-[#fdfbf7] hover:border-[#c8a96b] hover:bg-white'
            }`}
          >
            {isPreparing ? (
              <>
                <Loader2 className="mb-2 h-8 w-8 animate-spin text-[#c8a96b]" />
                <p className="text-sm font-semibold text-[#4a3933]">Preparando tu imagen…</p>
              </>
            ) : (
              <>
                <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-[#c8a96b]/30 bg-white text-[#c8a96b] transition group-hover:scale-110">
                  <UploadCloud className="h-6 w-6" />
                </span>
                <p className="mb-0.5 font-serif text-sm font-bold text-[#4a3933]">Toca para elegir tu captura</p>
                <p className="text-[11px] text-[#887870]">o arrástrala aquí. Debe verse el monto, la fecha y el nombre.</p>
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-[#8c6d36] ring-1 ring-[#c8a96b]/30">
                  <Camera className="h-3.5 w-3.5" /> Captura de pantalla o foto
                </span>
              </>
            )}
          </button>
        ) : (
          <div className="flex flex-1 flex-col space-y-2.5">
            <div className="relative flex h-[220px] w-full items-center justify-center overflow-hidden rounded-2xl border border-[#c8a96b]/30 bg-white">
              {previewUrl && (
                // Vista previa local (blob): no pasa por el optimizador de imágenes
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="Vista previa del comprobante" className="h-full w-full object-contain p-2" />
              )}
              {!isPending && (
                <button
                  type="button"
                  onClick={clearFile}
                  className="absolute right-2 top-2 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-[#4a3933] shadow-md hover:bg-[#fcf9f2]"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Cambiar
                </button>
              )}
            </div>
            <p className="flex items-center justify-between rounded-xl border border-[#e8dcdc] bg-[#faf7f2] px-3 py-2 text-xs text-[#4a3933]">
              <span className="flex items-center gap-1.5 font-medium"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Imagen lista</span>
              <span className="font-mono text-[10px] text-[#887870]">
                {originalSize && originalSize > file.size ? `${formatSize(originalSize)} → ${formatSize(file.size)}` : formatSize(file.size)}
              </span>
            </p>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => void pickFile(e.target.files?.[0])}
          aria-label="Seleccionar comprobante de pago"
        />

        {errorMsg && (
          <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700" aria-live="polite">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
            <p>{errorMsg}</p>
          </div>
        )}

        {progress !== null && isPending && (
          <div aria-live="polite">
            <div className="h-2 w-full overflow-hidden rounded-full bg-[#f1e9e4]">
              <div className="h-full rounded-full bg-gradient-to-r from-[#c8a96b] to-[#d38b8b] transition-all" style={{ width: `${Math.max(progress, 5)}%` }} />
            </div>
            <p className="mt-1 text-center text-[11px] text-[#887870]">{progress < 100 ? `Subiendo… ${progress}%` : 'Verificando…'}</p>
          </div>
        )}

        <Button
          type="submit"
          className="h-12 w-full rounded-full bg-[#4a3933] text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-[#4a3933]/20 transition hover:-translate-y-0.5 hover:bg-[#382b26] disabled:pointer-events-none disabled:opacity-50"
          disabled={!file || busy}
        >
          {isPending ? 'Enviando comprobante…' : 'Enviar comprobante'}
        </Button>
      </form>
    </div>
  );
}
