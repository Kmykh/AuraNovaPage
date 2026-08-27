import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Modal } from './Modal';
import { Button } from './Button';
import getCroppedImg from '@/lib/cropImage';

interface ImageCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete: (croppedFile: File) => void;
  aspectRatio?: number;
}

export function ImageCropperModal({ 
  isOpen, 
  onClose, 
  imageSrc, 
  onCropComplete,
  aspectRatio = 1 
}: ImageCropperModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropChange = (crop: any) => {
    setCrop(crop);
  };

  const onCropCompleteHandler = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    
    setIsProcessing(true);
    try {
      const croppedImageFile = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (croppedImageFile) {
        onCropComplete(croppedImageFile);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl">
      <div className="p-6 h-[70vh] min-h-[500px] flex flex-col">
        <h2 className="text-2xl font-serif font-bold text-brown mb-2 text-center">Ajustar Imagen</h2>
        <p className="text-sage text-center text-sm mb-6">
          Arrastra para centrar o usa la barra para hacer zoom.
        </p>

        <div className="relative flex-1 bg-black/5 rounded-2xl overflow-hidden mb-6">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={onCropChange}
            onCropComplete={onCropCompleteHandler}
            onZoomChange={setZoom}
            objectFit="contain"
          />
        </div>

        <div className="space-y-6">
          <div className="px-4">
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => {
                setZoom(Number(e.target.value));
              }}
              className="w-full h-2 bg-sage/20 rounded-lg appearance-none cursor-pointer accent-gold"
            />
          </div>

          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 py-3 rounded-xl border-sage/20 text-brown"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={isProcessing}
              className="flex-1 py-3 rounded-xl bg-gold hover:bg-gold/90 text-white shadow-md"
            >
              {isProcessing ? 'Procesando...' : 'Confirmar Recorte'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
