"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { 
  useAdminBusinessSettings, 
  useUpdateBusinessSettings, 
  useUploadYapeQr, 
  useDeleteYapeQr 
} from '@/hooks/use-business-settings';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ApiProblemDetails } from '@/lib/api-errors';
import { getImageUrl } from '@/lib/formatters';
import { ImageCropperModal } from '@/components/ui/ImageCropperModal';
import { AlertCircle, UploadCloud, Trash2, Smartphone, Building, Search, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

export function BusinessSettingsForm() {
  const { data: settings, isLoading, error, refetch } = useAdminBusinessSettings();
  
  // Mutations
  const { mutate: updateSettings, isPending: isUpdating } = useUpdateBusinessSettings();
  const { mutate: uploadQr, isPending: isUploading } = useUploadYapeQr();
  const { mutate: deleteQr, isPending: isDeleting } = useDeleteYapeQr();

  // Text fields state
  const [businessName, setBusinessName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [yapeHolderName, setYapeHolderName] = useState('');
  const [trackingBaseUrl, setTrackingBaseUrl] = useState('');
  const [textErrorMsg, setTextErrorMsg] = useState<string | null>(null);
  
  // File state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showTextPreviewModal, setShowTextPreviewModal] = useState(false);
  
  // Crop state
  const [showCropper, setShowCropper] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);

  const [initialized, setInitialized] = useState(false);
  
  if (settings && !initialized) {
    setBusinessName(settings.businessName || '');
    setWhatsappNumber(settings.whatsappNumber || '');
    setYapeHolderName(settings.yapeHolderName || '');
    setTrackingBaseUrl(settings.trackingBaseUrl || '');
    setInitialized(true);
  }

  // Clean object URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (tempImageSrc) URL.revokeObjectURL(tempImageSrc);
    };
  }, [previewUrl, tempImageSrc]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        <Skeleton variant="rect" className="w-full h-[500px] rounded-2xl" />
        <Skeleton variant="rect" className="w-full h-[400px] rounded-2xl" />
      </div>
    );
  }

  if (error || !settings) {
    const isForbidden = error instanceof ApiProblemDetails && error.status === 403;
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-sage/20 shadow-sm max-w-2xl mx-auto">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <h2 className="text-xl font-serif text-brown font-semibold mb-2">
          {isForbidden ? 'Acceso denegado' : 'No pudimos cargar la configuración del negocio'}
        </h2>
        <p className="text-sage max-w-md mb-6">
          {isForbidden 
            ? 'No tienes permisos para modificar la configuración.' 
            : 'Ocurrió un error de conexión con Aura Nova.'}
        </p>
        {!isForbidden && <Button onClick={() => refetch()} variant="outline">Reintentar</Button>}
      </div>
    );
  }

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTextErrorMsg(null);

    if (!businessName.trim() || !whatsappNumber.trim() || !yapeHolderName.trim() || !trackingBaseUrl.trim()) {
      setTextErrorMsg('Todos los campos de texto son obligatorios.');
      return;
    }

    try {
      new URL(trackingBaseUrl);
    } catch {
      setTextErrorMsg('La URL de seguimiento no tiene un formato válido (ej. https://auranova.pe/seguimiento).');
      return;
    }

    if (trackingBaseUrl.toLowerCase().startsWith('javascript:') || trackingBaseUrl.toLowerCase().startsWith('data:')) {
      setTextErrorMsg('Formato de URL no permitido.');
      return;
    }

    // Open confirmation modal instead of saving directly
    setShowTextPreviewModal(true);
  };

  const executeTextSave = () => {
    updateSettings(
      {
        businessName: businessName.trim(),
        whatsappNumber: whatsappNumber.trim(),
        yapeHolderName: yapeHolderName.trim(),
        trackingBaseUrl: trackingBaseUrl.trim()
      },
      {
        onSuccess: () => {
          setShowTextPreviewModal(false);
          toast.success('Configuración guardada correctamente.');
        },
        onError: (err) => {
          setShowTextPreviewModal(false);
          if (err instanceof ApiProblemDetails) {
            if (err.status === 400) setTextErrorMsg('Revisa los datos de configuración.');
            else if (err.status === 409) setTextErrorMsg('La configuración cambió antes de guardar. Recarga e intenta nuevamente.');
            else setTextErrorMsg(err.title || 'Error al guardar configuración.');
          } else {
            setTextErrorMsg('Error de red al guardar.');
          }
        }
      }
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (< 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('El archivo supera el límite permitido (5MB).');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate mime type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Formato de imagen no permitido. Usa JPG, PNG o WEBP.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (tempImageSrc) URL.revokeObjectURL(tempImageSrc);
    const url = URL.createObjectURL(file);
    setTempImageSrc(url);
    setShowCropper(true);
  };

  const handleCropComplete = (croppedFile: File) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(croppedFile);
    const url = URL.createObjectURL(croppedFile);
    setPreviewUrl(url);
    setShowCropper(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error('El archivo supera el límite permitido (5MB).');
        return;
      }

      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('Formato de imagen no permitido. Usa JPG, PNG o WEBP.');
        return;
      }

      if (tempImageSrc) URL.revokeObjectURL(tempImageSrc);
      const url = URL.createObjectURL(file);
      setTempImageSrc(url);
      setShowCropper(true);
    }
  };

  const handleQrSubmit = () => {
    if (!selectedFile) return;
    
    uploadQr(selectedFile, {
      onSuccess: () => {
        setSelectedFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      },
      onError: (err) => {
        if (err instanceof ApiProblemDetails) {
          if (err.status === 413) toast.error('El archivo supera el límite permitido.');
          else if (err.status === 415) toast.error('Formato de imagen no permitido.');
          else toast.error('No se pudo cargar el QR.');
        } else {
          toast.error('No pudimos comunicarnos con Aura Nova.');
        }
      }
    });
  };

  const handleDeleteQr = () => {
    deleteQr(undefined, {
      onSuccess: () => setShowDeleteModal(false),
      onError: () => toast.error('No se pudo eliminar el QR.')
    });
  };

  const hasUnsavedTextChanges = 
    businessName !== settings.businessName || 
    whatsappNumber !== settings.whatsappNumber || 
    yapeHolderName !== settings.yapeHolderName || 
    trackingBaseUrl !== settings.trackingBaseUrl;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="mb-6">
        <h1 className="text-3xl font-serif font-bold text-brown">Configuración del negocio</h1>
        <p className="text-sage mt-1">Administra la información que utiliza Aura Nova en su tienda y comunicación.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Col: General Settings Form */}
        <div className="bg-[#FFFDF8] rounded-2xl shadow-sm border border-sage/20 overflow-hidden">
          <div className="p-6 border-b border-sage/10 bg-white/50">
            <h2 className="text-lg font-serif font-bold text-brown flex items-center gap-2">
              <Building size={20} className="text-gold" /> Información General
            </h2>
          </div>
          
          <div className="p-6">
            {textErrorMsg && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm flex gap-3 border border-red-200 mb-6">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{textErrorMsg}</p>
              </div>
            )}

            <form onSubmit={handleTextSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-brown mb-2 uppercase tracking-wide" htmlFor="businessName">
                  Nombre del negocio <span className="text-rose">*</span>
                </label>
                <div className="relative">
                  <input 
                    id="businessName"
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    disabled={isUpdating}
                    className={`w-full px-4 py-3 pl-11 bg-white border rounded-xl outline-none transition-all ${businessName !== settings.businessName ? 'border-gold bg-gold/5 focus:ring-2 focus:ring-gold/50' : 'border-sage/30 focus:ring-2 focus:ring-sage/20'}`}
                    placeholder="Ej. Aura Nova"
                  />
                  <Building className={`w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${businessName !== settings.businessName ? 'text-gold' : 'text-sage/60'}`} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brown mb-2 uppercase tracking-wide" htmlFor="whatsappNumber">
                  Número de WhatsApp <span className="text-rose">*</span>
                </label>
                <div className="relative">
                  <input 
                    id="whatsappNumber"
                    type="tel"
                    required
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    disabled={isUpdating}
                    className={`w-full px-4 py-3 pl-11 bg-white border rounded-xl outline-none transition-all ${whatsappNumber !== settings.whatsappNumber ? 'border-gold bg-gold/5 focus:ring-2 focus:ring-gold/50' : 'border-sage/30 focus:ring-2 focus:ring-sage/20'}`}
                    placeholder="Ej. 959746278"
                  />
                  <Smartphone className={`w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${whatsappNumber !== settings.whatsappNumber ? 'text-gold' : 'text-sage/60'}`} />
                </div>
                <p className="text-xs text-sage mt-2">Los clientes verán este número en la página de inicio y contacto.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-brown mb-2 uppercase tracking-wide" htmlFor="trackingUrl">
                  URL base de seguimiento <span className="text-rose">*</span>
                </label>
                <div className="relative">
                  <input 
                    id="trackingUrl"
                    type="url"
                    required
                    value={trackingBaseUrl}
                    onChange={(e) => setTrackingBaseUrl(e.target.value)}
                    disabled={isUpdating}
                    className={`w-full px-4 py-3 pl-11 bg-white border rounded-xl outline-none transition-all ${trackingBaseUrl !== settings.trackingBaseUrl ? 'border-gold bg-gold/5 focus:ring-2 focus:ring-gold/50' : 'border-sage/30 focus:ring-2 focus:ring-sage/20'}`}
                    placeholder="https://auranova.pe/seguimiento"
                  />
                  <LinkIcon className={`w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${trackingBaseUrl !== settings.trackingBaseUrl ? 'text-gold' : 'text-sage/60'}`} />
                </div>
                <p className="text-xs text-sage mt-2">Esta URL se usará para construir los enlaces de seguimiento. (ej. /seguimiento?token=X)</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-brown mb-2 uppercase tracking-wide" htmlFor="yapeHolder">
                  Titular de Yape <span className="text-rose">*</span>
                </label>
                <div className="relative">
                  <input 
                    id="yapeHolder"
                    type="text"
                    required
                    value={yapeHolderName}
                    onChange={(e) => setYapeHolderName(e.target.value)}
                    disabled={isUpdating}
                    className={`w-full px-4 py-3 pl-11 bg-white border rounded-xl outline-none transition-all ${yapeHolderName !== settings.yapeHolderName ? 'border-gold bg-gold/5 focus:ring-2 focus:ring-gold/50' : 'border-sage/30 focus:ring-2 focus:ring-sage/20'}`}
                    placeholder="Nombre completo"
                  />
                  <Search className={`w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${yapeHolderName !== settings.yapeHolderName ? 'text-gold' : 'text-sage/60'}`} />
                </div>
                <p className="text-xs text-sage mt-2">El nombre del titular asociado a la cuenta receptora de pagos.</p>
              </div>

              <div className="pt-6 border-t border-sage/20">
                <Button 
                  type="submit" 
                  disabled={!hasUnsavedTextChanges} 
                  className={`w-full py-4 text-base transition-all rounded-xl ${hasUnsavedTextChanges ? 'bg-gold hover:bg-gold/90 text-white shadow-lg' : 'bg-sage/10 text-sage/50'}`}
                >
                  Confirmar cambios
                </Button>
                {!hasUnsavedTextChanges && (
                  <p className="text-xs text-center text-sage mt-3 flex items-center justify-center gap-1">
                    <AlertCircle size={14} /> Todos los cambios están guardados.
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Col: QR Management */}
        <div className="bg-white rounded-2xl shadow-sm border border-sage/10 overflow-hidden">
          <div className="p-6 border-b border-sage/10 bg-[#FAFAFA]">
            <h2 className="text-lg font-serif font-semibold text-brown flex items-center gap-2">
              <UploadCloud size={20} className="text-gold" /> Código QR de Yape
            </h2>
          </div>
          
          <div className="p-6 flex flex-col items-center">
            <div className="w-full max-w-sm">
              <div 
                className={`relative aspect-square w-full rounded-2xl overflow-hidden flex flex-col items-center justify-center mb-6 transition-all border-2 ${isDragging ? 'bg-gold/10 border-gold border-dashed scale-105' : 'bg-cream/30 border-sage/20 border-solid'}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {(previewUrl || settings.yapeQrImageUrl) ? (
                  <Image 
                    src={previewUrl || getImageUrl(settings.yapeQrImageUrl!)} 
                    alt="Código QR de Yape de Aura Nova"
                    fill
                    className="object-contain p-4"
                    unoptimized
                  />
                ) : (
                  <div className="text-center p-6 opacity-40">
                    <AlertCircle className="w-12 h-12 text-sage mx-auto mb-2" />
                    <p className="text-sm text-sage">No hay un código QR configurado.</p>
                  </div>
                )}

                {previewUrl && (
                  <div className="absolute inset-0 bg-cream/90 backdrop-blur-sm flex items-center justify-center p-6 border-2 border-gold rounded-2xl z-10">
                    <div className="text-center space-y-5 w-full">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                        <UploadCloud className="w-8 h-8 text-gold" />
                      </div>
                      <div>
                        <p className="text-lg font-serif font-bold text-brown">Nuevo código QR listo</p>
                        <p className="text-xs text-sage mt-1">Este QR reemplazará al actual.</p>
                      </div>
                      
                      <div className="space-y-3 pt-2">
                        <Button onClick={handleQrSubmit} disabled={isUploading} className="w-full bg-gold hover:bg-gold/90 text-white rounded-xl py-3 shadow-md">
                          {isUploading ? 'Guardando...' : 'Guardar y Publicar'}
                        </Button>
                        <Button variant="outline" onClick={() => {
                          setSelectedFile(null);
                          URL.revokeObjectURL(previewUrl);
                          setPreviewUrl(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }} disabled={isUploading} className="w-full bg-white/50 border-sage/20 text-brown hover:bg-white rounded-xl py-3">
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {!previewUrl && (
                <div className="space-y-4">
                  <div>
                    <input 
                      type="file" 
                      accept="image/jpeg, image/png, image/webp" 
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      aria-label="Seleccionar imagen de QR"
                    />
                    <Button 
                      variant="outline" 
                      className="w-full bg-[#FAFAFA]" 
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <UploadCloud size={16} className="mr-2" /> Seleccionar imagen QR (JPG, PNG, WEBP)
                    </Button>
                  </div>
                  
                  {settings.yapeQrImageUrl && (
                    <Button 
                      variant="outline" 
                      className="w-full text-rose hover:bg-rose/5 hover:text-rose border-rose/20"
                      onClick={() => setShowDeleteModal(true)}
                    >
                      <Trash2 size={16} className="mr-2" /> Eliminar QR actual
                    </Button>
                  )}
                  <p className="text-xs text-center text-sage">
                    Tamaño máximo 5MB. Asegúrate de que el QR sea legible.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete QR Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <div className="p-6 text-center max-w-sm mx-auto">
          <Trash2 className="w-12 h-12 text-rose mx-auto mb-4" />
          <h2 className="text-xl font-serif text-brown font-semibold mb-2">¿Eliminar el código QR actual?</h2>
          <p className="text-sage text-sm mb-6">
            Los clientes dejarán de ver el QR en la pantalla de pagos mientras no se cargue uno nuevo.
          </p>
          <div className="flex flex-col gap-2">
            <Button onClick={handleDeleteQr} disabled={isDeleting} className="w-full bg-rose hover:bg-rose/90 text-white">
              {isDeleting ? 'Eliminando...' : 'Eliminar QR'}
            </Button>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={isDeleting} className="w-full">
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Preview Settings Modal */}
      <Modal isOpen={showTextPreviewModal} onClose={() => setShowTextPreviewModal(false)} maxWidth="max-w-md">
        <div className="p-8">
          <h2 className="text-2xl font-serif font-bold text-brown mb-2 text-center">Confirmar actualización</h2>
          <p className="text-sage text-center text-sm mb-8">
            Revisa los nuevos datos del negocio antes de guardarlos. Así los verán tus clientes.
          </p>

          <div className="space-y-4 bg-[#FFFDF8] border border-sage/20 p-5 rounded-2xl mb-8">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-sage/70 font-bold mb-1">Nombre del Negocio</p>
              <p className={`font-serif text-lg ${businessName !== settings.businessName ? 'text-gold font-bold' : 'text-brown'}`}>{businessName}</p>
            </div>
            
            <div className="h-px bg-sage/10 w-full" />
            
            <div>
              <p className="text-[10px] uppercase tracking-widest text-sage/70 font-bold mb-1">WhatsApp</p>
              <p className={`text-base ${whatsappNumber !== settings.whatsappNumber ? 'text-gold font-bold' : 'text-brown'}`}>{whatsappNumber}</p>
            </div>

            <div className="h-px bg-sage/10 w-full" />
            
            <div>
              <p className="text-[10px] uppercase tracking-widest text-sage/70 font-bold mb-1">Titular Yape</p>
              <p className={`text-base ${yapeHolderName !== settings.yapeHolderName ? 'text-gold font-bold' : 'text-brown'}`}>{yapeHolderName}</p>
            </div>
          </div>

          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={() => setShowTextPreviewModal(false)}
              disabled={isUpdating}
              className="flex-1 py-3 rounded-xl border-sage/20 text-brown"
            >
              Regresar
            </Button>
            <Button 
              onClick={executeTextSave}
              disabled={isUpdating}
              className="flex-1 py-3 rounded-xl bg-gold hover:bg-gold/90 text-white shadow-md"
            >
              {isUpdating ? 'Guardando...' : 'Guardar y Publicar'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Image Cropper Modal */}
      {tempImageSrc && (
        <ImageCropperModal 
          isOpen={showCropper}
          onClose={() => setShowCropper(false)}
          imageSrc={tempImageSrc}
          onCropComplete={handleCropComplete}
          aspectRatio={1} // Square QR
        />
      )}
    </div>
  );
}
