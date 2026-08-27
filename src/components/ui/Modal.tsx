"use client";

import React, { useEffect, useRef, ReactNode } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  closeOnOverlayClick?: boolean;
  maxWidth?: string;
}

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer, 
  closeOnOverlayClick = true,
  maxWidth = 'max-w-lg'
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === overlayRef.current) {
      onClose();
    }
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-brown/40 backdrop-blur-sm p-4 transition-opacity"
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div 
        ref={dialogRef}
        className={`relative bg-white rounded-xl shadow-lg w-full ${maxWidth} overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200`}
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-sage/10">
          {title ? (
            <h2 id="modal-title" className="text-lg font-semibold text-brown">{title}</h2>
          ) : <div />}
          <button 
            onClick={onClose}
            className="p-1.5 rounded-md text-sage hover:bg-cream hover:text-brown focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold transition-colors"
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {children}
        </div>

        {footer && (
          <div className="px-6 py-4 bg-cream/30 border-t border-sage/10 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  if (typeof window === 'undefined') return null;

  return createPortal(modalContent, document.body);
}
