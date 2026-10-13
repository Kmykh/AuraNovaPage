"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Sparkles, Check, ArrowRight, ChevronDown, ChevronUp, Download } from 'lucide-react';

import florImg from '@/app/(public)/images/flowera.png';
import flortalloImg from '@/app/(public)/images/flortallo.png';
import angelesImg from '@/app/(public)/images/angeles.png';
import flo1Img from '@/app/(public)/images/flo1.png';
import flo2Img from '@/app/(public)/images/flo2.png';

export const QUICK_PHRASES = [
  '¡Feliz Cumpleaños! 🎂 Que la vida te regale tantos momentos felices como flores tiene este arreglo.',
  'Te amo con todo mi corazón ❤️ Gracias por iluminar cada uno de mis días.',
  'Gracias por existir y ser mi persona favorita ✨',
  'Un detalle especial para alguien extraordinario 🌸 Te quiero mucho.',
  'Siempre juntos, celebrando cada paso de tu vida 💫',
];

export const CARD_THEMES = [
  {
    id: 'marfil',
    name: 'Marfil & Ángeles',
    bgClasses: 'bg-gradient-to-br from-[#fffdfa] via-[#fbf7ee] to-[#f4ebe1]',
    textColor: 'text-[#4a3933]',
    metaColor: 'text-[#887870]',
    borderColor: 'border-[#c8a96b]/60',
    accentColor: '#c8a96b',
    badge: 'bg-[#c8a96b]/15 text-[#8f6d28] border-[#c8a96b]/30',
    image: angelesImg,
    imageClass: '-top-1 -right-2 w-36 md:w-52 opacity-30 mix-blend-multiply pointer-events-none -rotate-6'
  },
  {
    id: 'rosa',
    name: 'Rosa Romance',
    bgClasses: 'bg-gradient-to-br from-[#fff8f9] via-[#fcebed] to-[#f8dce2]',
    textColor: 'text-[#5d2b38]',
    metaColor: 'text-[#9c5365]',
    borderColor: 'border-[#e098a7]/60',
    accentColor: '#c4687d',
    badge: 'bg-[#e098a7]/20 text-[#a03d54] border-[#e098a7]/40',
    image: flo1Img,
    imageClass: '-bottom-2 -right-2 w-32 md:w-44 opacity-35 mix-blend-multiply pointer-events-none'
  },
  {
    id: 'pergamino',
    name: 'Pergamino Vintage',
    bgClasses: 'bg-gradient-to-br from-[#faf5ec] via-[#f5ede0] to-[#eadcc4]',
    textColor: 'text-[#4a3728]',
    metaColor: 'text-[#856545]',
    borderColor: 'border-[#b89569]/60',
    accentColor: '#966d3b',
    badge: 'bg-[#b89569]/20 text-[#6d4d23] border-[#b89569]/40',
    image: flo2Img,
    imageClass: '-bottom-2 -right-2 w-32 md:w-44 opacity-30 mix-blend-multiply pointer-events-none'
  },
  {
    id: 'noir',
    name: 'Noir & Oro',
    bgClasses: 'bg-gradient-to-br from-[#24211e] via-[#1a1817] to-[#11100f]',
    textColor: 'text-[#f5ece1]',
    metaColor: 'text-[#a89d91]',
    borderColor: 'border-[#d4af37]/60',
    accentColor: '#e5c058',
    badge: 'bg-[#d4af37]/25 text-[#f0d078] border-[#d4af37]/50',
    image: florImg,
    imageClass: 'top-0 right-1 w-28 md:w-36 opacity-25 filter brightness-125 pointer-events-none'
  },
  {
    id: 'salvia',
    name: 'Jardín Salvia',
    bgClasses: 'bg-gradient-to-br from-[#f5f8f6] via-[#ebf3ed] to-[#d8e6db]',
    textColor: 'text-[#233529]',
    metaColor: 'text-[#54735e]',
    borderColor: 'border-[#7a9e85]/60',
    accentColor: '#4f755b',
    badge: 'bg-[#7a9e85]/20 text-[#325a3f] border-[#7a9e85]/40',
    image: flortalloImg,
    imageClass: '-bottom-4 -left-2 w-28 md:w-40 opacity-30 mix-blend-multiply pointer-events-none -rotate-6'
  }
] as const;

export type CardThemeId = typeof CARD_THEMES[number]['id'];

export interface PhraseCardValue {
  text: string;
  font: string;
  background: CardThemeId;
  to: string;
  from: string;
}

export const EMPTY_PHRASE_CARD: PhraseCardValue = {
  text: '',
  font: 'Elegante/Cursiva',
  background: 'marfil',
  to: '',
  from: '',
};

/** Texto que se guarda en el pedido: incluye para quién y de quién. */
export function formatPhraseForOrder(value: PhraseCardValue): string {
  const to = value.to.trim();
  const from = value.from.trim();
  return `${to ? `[Para: ${to}] ` : ''}${value.text.trim()}${from ? ` [De: ${from}]` : ''}`;
}

export function cardTheme(id: CardThemeId) {
  return CARD_THEMES.find(t => t.id === id) || CARD_THEMES[0];
}

/** Descarga la tarjeta en PNG horizontal (1600×1000). */
export async function downloadPhraseCard(value: PhraseCardValue, productName?: string) {
    if (!value.text.trim()) {
      toast.error('Falta la dedicatoria', {
        description: 'Escribe un mensaje antes de descargar la tarjeta.'
      });
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 1600;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentTheme = CARD_THEMES.find(t => t.id === value.background) || CARD_THEMES[0];

    // 1. Background Gradient (Formato Horizontal 16:10)
    const grad = ctx.createLinearGradient(0, 0, 1600, 1000);
    if (value.background === 'noir') {
      grad.addColorStop(0, '#24211e');
      grad.addColorStop(0.5, '#1a1817');
      grad.addColorStop(1, '#11100f');
    } else if (value.background === 'rosa') {
      grad.addColorStop(0, '#fff8f9');
      grad.addColorStop(0.5, '#fcebed');
      grad.addColorStop(1, '#f8dce2');
    } else if (value.background === 'pergamino') {
      grad.addColorStop(0, '#faf5ec');
      grad.addColorStop(0.5, '#f5ede0');
      grad.addColorStop(1, '#eadcc4');
    } else if (value.background === 'salvia') {
      grad.addColorStop(0, '#f5f8f6');
      grad.addColorStop(0.5, '#ebf3ed');
      grad.addColorStop(1, '#d8e6db');
    } else {
      grad.addColorStop(0, '#fffdfa');
      grad.addColorStop(0.5, '#fbf7ee');
      grad.addColorStop(1, '#f4ebe1');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1600, 1000);

    // 2. Dibujar Arte Decorativo del Frontend en el Fondo de la Tarjeta
    try {
      if (currentTheme.image?.src) {
        const decImg = new window.Image();
        decImg.crossOrigin = 'anonymous';
        decImg.src = currentTheme.image.src;
        await new Promise((resolve) => {
          decImg.onload = resolve;
          decImg.onerror = resolve;
          setTimeout(resolve, 800);
        });

        if (decImg.complete && decImg.naturalWidth > 0) {
          ctx.save();
          ctx.globalAlpha = value.background === 'noir' ? 0.18 : 0.28;
          if (value.background === 'marfil') {
            ctx.drawImage(decImg, 1600 - 580, 40, 520, 350);
          } else if (value.background === 'rosa') {
            ctx.drawImage(decImg, 1600 - 480, 1000 - 480, 440, 440);
          } else if (value.background === 'pergamino') {
            ctx.drawImage(decImg, 1600 - 460, 1000 - 460, 420, 420);
          } else if (value.background === 'salvia') {
            ctx.drawImage(decImg, 40, 200, 360, 700);
          } else if (value.background === 'noir') {
            ctx.drawImage(decImg, 1600 - 420, 40, 380, 380);
          }
          ctx.restore();
        }
      }
    } catch {
      // Si falla la carga de imagen en canvas, continúa con los textos y marcos
    }

    // 3. Marcos Decorativos Dobles
    const accent = currentTheme.accentColor;
    ctx.strokeStyle = accent;
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 40, 1600 - 80, 1000 - 80);

    ctx.lineWidth = 1.5;
    ctx.strokeRect(55, 55, 1600 - 110, 1000 - 110);

    // Ornamentos de Esquinas
    const cornerSize = 36;
    ctx.fillStyle = accent;
    ctx.fillRect(50, 50, cornerSize, 3);
    ctx.fillRect(50, 50, 3, cornerSize);
    ctx.fillRect(1600 - 50 - cornerSize, 50, cornerSize, 3);
    ctx.fillRect(1600 - 50, 50, 3, cornerSize);
    ctx.fillRect(50, 1000 - 50, cornerSize, 3);
    ctx.fillRect(50, 1000 - 50 - cornerSize, 3, cornerSize);
    ctx.fillRect(1600 - 50 - cornerSize, 1000 - 50, cornerSize, 3);
    ctx.fillRect(1600 - 50, 1000 - 50 - cornerSize, 3, cornerSize);

    // 4. Monograma y Encabezado Oficial
    ctx.textAlign = 'center';
    ctx.fillStyle = accent;
    ctx.font = '600 22px "Playfair Display", Georgia, serif';
    ctx.fillText('✦   A U R A   N O V A   ✦', 800, 130);

    ctx.font = 'italic 16px "Playfair Display", Georgia, serif';
    ctx.fillStyle = value.background === 'noir' ? '#b0a497' : '#887870';
    ctx.fillText('Atelier Floral & Regalos Exclusivos', 800, 160);

    ctx.beginPath();
    ctx.moveTo(640, 185);
    ctx.lineTo(960, 185);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 5. Destinatario ("Para:")
    const mainTextColor = value.background === 'noir' ? '#f5ece1' : currentTheme.id === 'rosa' ? '#5d2b38' : currentTheme.id === 'salvia' ? '#233529' : '#3d2e28';
    if (value.to.trim()) {
      ctx.fillStyle = accent;
      ctx.font = 'bold 20px "Playfair Display", Georgia, serif';
      ctx.fillText(`Para: ${value.to.trim()}`, 800, 260);
    }

    // 6. Texto de Dedicatoria (Centrado y con ajuste de línea)
    const fontStyle = value.font === 'Elegante/Cursiva'
      ? 'italic 38px "Playfair Display", Georgia, serif'
      : value.font === 'Clásica'
      ? '34px "Playfair Display", Georgia, serif'
      : '32px system-ui, -apple-system, sans-serif';

    ctx.font = fontStyle;
    ctx.fillStyle = mainTextColor;

    const maxWidth = 1200;
    const words = value.text.trim().split(' ');
    const lines: string[] = [];
    let currentLine = words[0] || '';

    for (let i = 1; i < words.length; i++) {
      const testLine = currentLine + ' ' + words[i];
      const metrics = ctx.measureText(testLine);
      if (metrics.width < maxWidth) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = words[i];
      }
    }
    lines.push(currentLine);

    const lineHeight = value.font === 'Elegante/Cursiva' ? 62 : 56;
    const totalTextHeight = lines.length * lineHeight;
    const startY = Math.max(value.to.trim() ? 340 : 300, (1000 - totalTextHeight) / 2);

    lines.forEach((line, idx) => {
      const isFirst = idx === 0;
      const isLast = idx === lines.length - 1;
      const prefix = isFirst ? '“' : '';
      const suffix = isLast ? '”' : '';
      ctx.fillText(`${prefix}${line}${suffix}`, 800, startY + (idx * lineHeight));
    });

    // 7. Firma Remitente ("Con todo mi amor, ...")
    if (value.from.trim()) {
      ctx.font = 'italic 24px "Playfair Display", Georgia, serif';
      ctx.fillStyle = accent;
      ctx.fillText(`Con todo mi amor, ${value.from.trim()}`, 800, 860);
    }

    // 8. Marca de Atelier en el pie
    ctx.font = '14px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = value.background === 'noir' ? '#665e57' : '#a89d96';
    ctx.fillText('Hecho a mano con dedicación • www.auranova.pe', 800, 935);

    // Descarga directa en archivo PNG
    const link = document.createElement('a');
    link.download = `AuraNova_Tarjeta_${(productName || 'Dedicatoria').replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast.success('¡Tarjeta dedicatoria descargada en alta resolución!', {
      description: 'Guardada en formato PNG horizontal.'
    });
}

/** Vista previa compacta de la tarjeta (dentro de la personalización del producto). */
export function PhraseCardPreview({ value, onEdit, productName }: { value: PhraseCardValue; onEdit: () => void; productName?: string }) {
  const theme = cardTheme(value.background);
  return (
    <div className={`p-4 sm:p-5 rounded-2xl border shadow-md flex flex-col justify-between relative overflow-hidden ${theme.bgClasses} ${theme.borderColor}`}>
      {theme.image && (
        <div className={`absolute pointer-events-none ${theme.imageClass}`}>
          <Image src={theme.image} alt="" className="w-full h-full object-contain" />
        </div>
      )}
      <div className="relative z-10">
        <div className="flex items-center justify-between w-full border-b border-black/5 pb-2 mb-2">
          <span className={`text-[10px] font-serif uppercase tracking-widest font-bold ${theme.metaColor}`}>
            {theme.name} • {value.font.split('/')[0]}
          </span>
          {value.to && <span className={`text-[10px] font-serif font-bold ${theme.metaColor}`}>Para: {value.to}</span>}
        </div>
        <p className={`w-full break-words py-1 ${theme.textColor} ${
          value.font === 'Elegante/Cursiva' ? 'font-serif italic text-sm sm:text-base' :
          value.font === 'Clásica' ? 'font-serif text-sm' : 'font-sans font-light text-sm'
        }`}>
          &ldquo;{value.text}&rdquo;
        </p>
        {value.from && (
          <p className={`text-xs font-serif italic text-right mt-1 ${theme.metaColor}`}>— Con todo mi amor, {value.from}</p>
        )}
      </div>
      <div className="flex items-center gap-4 pt-3 border-t border-black/5 w-full justify-between relative z-10 mt-3">
        <button type="button" onClick={onEdit} className="text-[11px] font-bold uppercase tracking-wider text-[#c8a96b] hover:text-[#4a3933] transition-colors">
          Editar tarjeta
        </button>
        <button
          type="button"
          onClick={() => downloadPhraseCard(value, productName)}
          className="text-[11px] font-bold uppercase tracking-wider text-[#4a3933] hover:text-[#c8a96b] transition-colors flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" /> PNG
        </button>
      </div>
    </div>
  );
}

interface PhraseCardModalProps {
  value: PhraseCardValue;
  onChange: (value: PhraseCardValue) => void;
  onClose: () => void;
  onSave: () => void;
  productName?: string;
}

/** Editor paso a paso de la tarjeta dedicatoria con vista previa horizontal. */
export function PhraseCardModal({ value, onChange, onClose, onSave, productName }: PhraseCardModalProps) {
  const [activeCardStep, setActiveCardStep] = useState<'theme' | 'recipients' | 'message' | null>('theme');
  const setField = <K extends keyof PhraseCardValue>(key: K, fieldValue: PhraseCardValue[K]) =>
    onChange({ ...value, [key]: fieldValue });

  return (
      <div 
        className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 md:p-8 pt-20 md:pt-24 pb-6 overflow-y-auto" 
        onClick={() => onClose()}
      >
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        <div 
          className="relative bg-[#fcfaf7] rounded-3xl shadow-2xl w-full max-w-4xl lg:max-w-5xl max-h-[85vh] overflow-y-auto p-5 md:p-8 border border-amber-900/15 my-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={() => onClose()}
            className="absolute top-4 right-4 md:top-5 md:right-5 w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center text-[#887870] hover:text-[#4a3933] hover:bg-[#4a3933]/10 transition-all z-20"
            aria-label="Cerrar ventana"
          >
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Modal Header */}
          <div className="mb-5 md:mb-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="h-px w-6 bg-[#c8a96b]" />
              <span className="text-[9px] md:text-[10px] font-serif uppercase tracking-[0.25em] text-[#c8a96b] font-bold">Atelier Personalizado • Formato Horizontal</span>
            </div>
            <h3 className="font-serif text-xl md:text-2xl lg:text-3xl font-bold text-[#4a3933]">Tarjeta con Dedicatoria</h3>
            <p className="text-[11px] md:text-xs text-[#887870] mt-0.5 max-w-lg">Personaliza paso a paso el diseño de tu tarjeta artesanal.</p>
          </div>

          {/* 2-Column Responsive Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[53%_47%] gap-6 lg:gap-8 items-start">
            
            {/* Left Column: Form Controls Organizados en Secciones Plegables */}
            <div className="space-y-3">
              
              {/* --- Sección 1: Fondo y Diseño --- */}
              <div className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                activeCardStep === 'theme' ? 'bg-white border-[#c8a96b]/50 shadow-sm' : 'bg-[#faf8f4] border-black/5 hover:border-black/15'
              }`}>
                <button
                  type="button"
                  onClick={() => setActiveCardStep(activeCardStep === 'theme' ? 'recipients' : 'theme')}
                  className="w-full flex items-center justify-between p-3.5 sm:p-4 text-left transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                      activeCardStep === 'theme' ? 'bg-[#c8a96b] text-white' : 'bg-[#4a3933]/10 text-[#4a3933]'
                    }`}>
                      1
                    </span>
                    <div>
                      <span className="text-[11px] font-bold text-[#4a3933] uppercase tracking-wider block">
                        Fondo y Temática
                      </span>
                      {activeCardStep !== 'theme' && (
                        <span className="text-[10px] text-[#887870] mt-0.5 inline-flex items-center gap-1.5 font-medium">
                          <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: (CARD_THEMES.find(t => t.id === value.background) || CARD_THEMES[0]).accentColor }} />
                          {(CARD_THEMES.find(t => t.id === value.background) || CARD_THEMES[0]).name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {activeCardStep !== 'theme' && (
                      <span className="text-[10px] text-[#c8a96b] font-medium hover:underline">Cambiar</span>
                    )}
                    {activeCardStep === 'theme' ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
                  </div>
                </button>

                {activeCardStep === 'theme' && (
                  <div className="px-3.5 pb-4 sm:px-4 sm:pb-4 pt-1 border-t border-black/5 animate-in slide-in-from-top-2 duration-200">
                    <p className="text-[10px] text-[#887870] mb-2.5">Elige el acabado artesanal que mejor combine con tu detalle:</p>
                    <div className="grid grid-cols-2 gap-2.5">
                      {CARD_THEMES.map(theme => {
                        const isSelected = value.background === theme.id;
                        return (
                          <button
                            key={theme.id}
                            onClick={() => setField('background', theme.id)}
                            className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between h-16 md:h-18 ${
                              isSelected
                                ? 'border-[#c8a96b] shadow-md ring-2 ring-[#c8a96b]/30 scale-[1.02]'
                                : 'border-black/5 hover:border-black/20 hover:scale-[1.01]'
                            } ${theme.bgClasses}`}
                          >
                            <span className={`text-[9px] md:text-[10px] font-serif font-bold leading-tight ${theme.textColor}`}>
                              {theme.name}
                            </span>
                            <div className="flex items-center justify-between w-full mt-auto">
                              <span
                                className="w-3 h-3 rounded-full border border-black/10 shadow-inner"
                                style={{ backgroundColor: theme.accentColor }}
                              />
                              {isSelected && (
                                <Check className="w-3 h-3 text-[#c8a96b]" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    
                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setActiveCardStep('recipients')}
                        className="px-3.5 py-1.5 rounded-full bg-[#4a3933] text-white text-[10px] font-medium hover:bg-[#3a2d28] transition-all flex items-center gap-1.5"
                      >
                        <span>Siguiente: Destinatario</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* --- Sección 2: Destinatario y Remitente --- */}
              <div className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                activeCardStep === 'recipients' ? 'bg-white border-[#c8a96b]/50 shadow-sm' : 'bg-[#faf8f4] border-black/5 hover:border-black/15'
              }`}>
                <button
                  type="button"
                  onClick={() => setActiveCardStep(activeCardStep === 'recipients' ? 'message' : 'recipients')}
                  className="w-full flex items-center justify-between p-3.5 sm:p-4 text-left transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                      activeCardStep === 'recipients' ? 'bg-[#c8a96b] text-white' : 'bg-[#4a3933]/10 text-[#4a3933]'
                    }`}>
                      2
                    </span>
                    <div>
                      <span className="text-[11px] font-bold text-[#4a3933] uppercase tracking-wider block">
                        Destinatario & Remitente
                      </span>
                      {activeCardStep !== 'recipients' && (
                        <span className="text-[10px] text-[#887870] mt-0.5 block font-medium">
                          {value.to || value.from 
                            ? `${value.to ? `Para: ${value.to}` : ''}${value.to && value.from ? ' · ' : ''}${value.from ? `De: ${value.from}` : ''}`
                            : 'Opcional (Sin especificar)'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {activeCardStep !== 'recipients' && (
                      <span className="text-[10px] text-[#c8a96b] font-medium hover:underline">Editar</span>
                    )}
                    {activeCardStep === 'recipients' ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
                  </div>
                </button>

                {activeCardStep === 'recipients' && (
                  <div className="px-3.5 pb-4 sm:px-4 sm:pb-4 pt-1 border-t border-black/5 animate-in slide-in-from-top-2 duration-200">
                    <p className="text-[10px] text-[#887870] mb-2.5">Puedes incluir para quién es y tu nombre o firma:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[9px] font-bold text-[#887870] uppercase tracking-widest mb-1">
                          Para (Destinatario)
                        </label>
                        <input
                          type="text"
                          value={value.to}
                          onChange={e => setField('to', e.target.value.slice(0, 40))}
                          placeholder="Ej: Mi amor, Mamá, Sofía..."
                          className="w-full px-3 py-2 rounded-xl border border-sage/20 text-[#4a3933] text-[11px] md:text-xs font-medium focus:outline-none focus:border-[#4a3933] bg-[#faf8f5]"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-[#887870] uppercase tracking-widest mb-1">
                          De (Remitente)
                        </label>
                        <input
                          type="text"
                          value={value.from}
                          onChange={e => setField('from', e.target.value.slice(0, 40))}
                          placeholder="Ej: Tu persona favorita, Carlos..."
                          className="w-full px-3 py-2 rounded-xl border border-sage/20 text-[#4a3933] text-[11px] md:text-xs font-medium focus:outline-none focus:border-[#4a3933] bg-[#faf8f5]"
                        />
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setActiveCardStep('theme')}
                        className="text-[10px] text-[#887870] hover:text-[#4a3933] font-medium"
                      >
                        ← Volver a Temas
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveCardStep('message')}
                        className="px-3.5 py-1.5 rounded-full bg-[#4a3933] text-white text-[10px] font-medium hover:bg-[#3a2d28] transition-all flex items-center gap-1.5"
                      >
                        <span>Siguiente: Mensaje</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* --- Sección 3: Dedicatoria & Tipografía --- */}
              <div className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                activeCardStep === 'message' ? 'bg-white border-[#c8a96b]/50 shadow-sm' : 'bg-[#faf8f4] border-black/5 hover:border-black/15'
              }`}>
                <button
                  type="button"
                  onClick={() => setActiveCardStep(activeCardStep === 'message' ? null : 'message')}
                  className="w-full flex items-center justify-between p-3.5 sm:p-4 text-left transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                      activeCardStep === 'message' ? 'bg-[#c8a96b] text-white' : 'bg-[#4a3933]/10 text-[#4a3933]'
                    }`}>
                      3
                    </span>
                    <div>
                      <span className="text-[11px] font-bold text-[#4a3933] uppercase tracking-wider block">
                        Dedicatoria & Tipografía
                      </span>
                      {activeCardStep !== 'message' && (
                        <span className="text-[10px] text-[#887870] mt-0.5 block font-medium truncate max-w-[200px] sm:max-w-xs">
                          {value.text.trim() ? `"${value.text.slice(0, 24)}..."` : 'Escribe tus palabras...'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {activeCardStep !== 'message' && (
                      <span className="text-[10px] text-[#c8a96b] font-medium hover:underline">Escribir</span>
                    )}
                    {activeCardStep === 'message' ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
                  </div>
                </button>

                {activeCardStep === 'message' && (
                  <div className="px-3.5 pb-4 sm:px-4 sm:pb-4 pt-1 border-t border-black/5 animate-in slide-in-from-top-2 duration-200 space-y-3">
                    {/* Sugerencias Rápidas */}
                    <div>
                      <label className="block text-[9px] font-bold text-[#887870] uppercase tracking-widest mb-1.5 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-[#c8a96b]" />
                        <span>Inspiración rápida (Toca para usar)</span>
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {QUICK_PHRASES.map((quick, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setField('text', quick.slice(0, 160))}
                            className="text-[9px] px-2 py-1 rounded-lg bg-[#faf8f5] hover:bg-[#c8a96b]/15 text-[#4a3933] border border-sage/20 transition-all text-left"
                          >
                            {quick.split(' ')[0]} {quick.split(' ')[1]} {quick.split(' ')[2]}...
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Textarea */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[9px] font-bold text-[#887870] uppercase tracking-widest">
                          Tu Dedicatoria
                        </label>
                        <span className="text-[9px] text-sage/70 font-medium">{value.text.length}/160</span>
                      </div>
                      <textarea
                        value={value.text}
                        onChange={e => setField('text', e.target.value.slice(0, 160))}
                        placeholder="Escribe aquí las palabras que harán latir su corazón..."
                        className="w-full p-2.5 sm:p-3 rounded-xl border border-sage/20 text-[#4a3933] text-[11px] md:text-xs font-medium focus:outline-none focus:border-[#4a3933] resize-none h-20 bg-[#faf8f5] transition-all placeholder:text-sage/40"
                      />
                    </div>

                    {/* Typography Selector */}
                    <div>
                      <label className="block text-[9px] font-bold text-[#887870] uppercase tracking-widest mb-1.5">
                        Estilo de Letra
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'Elegante/Cursiva', label: 'Elegante', sub: 'Cursiva fina', fontClass: 'font-serif italic' },
                          { id: 'Clásica', label: 'Clásica', sub: 'Boutique formal', fontClass: 'font-serif' },
                          { id: 'Moderna', label: 'Moderna', sub: 'Minimalista', fontClass: 'font-sans' }
                        ].map(f => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => setField('font', f.id)}
                            className={`p-2 rounded-xl text-left border transition-all ${
                              value.font === f.id
                                ? 'bg-[#4a3933] text-white border-[#4a3933] shadow-xs'
                                : 'bg-[#faf8f5] text-[#887870] border-sage/20 hover:border-[#4a3933]/30'
                            }`}
                          >
                            <div className={`text-[10px] sm:text-[11px] font-medium ${f.fontClass}`}>{f.label}</div>
                            <div className={`text-[8px] ${value.font === f.id ? 'text-stone-300' : 'text-[#887870]/70'}`}>{f.sub}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions: Download Image & Save Dedication */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
                <button
                  onClick={() => downloadPhraseCard(value, productName)}
                  type="button"
                  className="w-full sm:w-1/2 h-10 rounded-full border border-[#c8a96b] text-[#8f6d28] hover:bg-[#c8a96b]/10 text-[10px] md:text-[11px] font-serif font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-3.5 h-3.5 text-[#c8a96b]" />
                  Descargar PNG
                </button>

                <button
                  onClick={onSave}
                  type="button"
                  className="w-full sm:w-1/2 h-10 rounded-full bg-[#4a3933] text-white text-[10px] md:text-[11px] font-serif font-bold uppercase tracking-widest hover:bg-[#3a2d28] shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-3.5 h-3.5" />
                  Guardar Dedicatoria
                </button>
              </div>

            </div>

            {/* Right Column: Real-time Horizontal Card Preview */}
            <div className="lg:sticky lg:top-4 flex flex-col gap-2.5 lg:border-l lg:border-sage/20 lg:pl-7">
              <div className="flex items-center justify-between px-1 max-w-[420px] mx-auto w-full">
                <span className="text-[9px] md:text-[10px] text-[#887870] uppercase tracking-[0.25em] font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#c8a96b]" />
                  Vista Previa (Horizontal)
                </span>
                <span className="text-[8px] md:text-[9px] text-sage font-serif italic">16:10</span>
              </div>

              {(() => {
                const theme = CARD_THEMES.find(t => t.id === value.background) || CARD_THEMES[0];
                return (
                  <div className={`w-full max-w-[420px] mx-auto aspect-[16/10] rounded-2xl border shadow-xl relative overflow-hidden transition-all duration-500 p-3 sm:p-4 flex flex-col justify-between select-none ${theme.bgClasses} ${theme.borderColor}`}>
                    {/* Artwork Watermark from Frontend */}
                    {theme.image && (
                      <div className={`absolute pointer-events-none ${theme.imageClass}`}>
                        <Image src={theme.image} alt="" className="w-full h-full object-contain" priority />
                      </div>
                    )}

                    {/* Inner double border with corner styling */}
                    <div className={`w-full h-full border rounded-xl p-3 flex flex-col justify-between relative z-10 ${theme.borderColor}`}>
                      {/* Header */}
                      <div className="text-center">
                        <p className="text-[8px] sm:text-[9px] font-serif uppercase tracking-[0.3em] font-bold" style={{ color: theme.accentColor }}>
                          ✦ AURA NOVA ✦
                        </p>
                        <p className={`text-[6px] sm:text-[7px] font-serif italic mt-0.5 ${theme.metaColor}`}>Atelier Floral & Regalos Exclusivos</p>
                        <div className="w-16 sm:w-20 h-px mx-auto mt-1.5" style={{ backgroundColor: theme.accentColor }} />
                      </div>

                      {/* Recipient */}
                      {value.to.trim() && (
                        <p className="text-[9px] sm:text-[10px] font-serif font-bold text-center mt-1" style={{ color: theme.accentColor }}>
                          Para: {value.to.trim()}
                        </p>
                      )}

                      {/* Message */}
                      <div className="my-auto flex items-center justify-center text-center px-3 sm:px-6">
                        {value.text.trim() ? (
                          <p className={`text-[11px] sm:text-[13px] md:text-sm px-2 break-words w-full leading-relaxed ${theme.textColor} ${
                            value.font === 'Elegante/Cursiva' ? 'font-serif italic text-xs sm:text-sm md:text-base' :
                            value.font === 'Clásica' ? 'font-serif' :
                            'font-sans font-light tracking-wide'
                          }`}>
                            &ldquo;{value.text}&rdquo;
                          </p>
                        ) : (
                          <p className={`text-[9px] sm:text-[10px] italic font-serif ${theme.metaColor} opacity-70`}>
                            Tu mensaje personalizado aparecerá aquí...
                          </p>
                        )}
                      </div>

                      {/* Footer / Sender */}
                      <div className="flex items-end justify-between w-full pt-2">
                        <span className={`text-[5px] sm:text-[6px] ${theme.metaColor} opacity-60 font-sans tracking-wider`}>
                          AURA NOVA • ATELIER
                        </span>
                        {value.from.trim() && (
                          <p className="text-[9px] sm:text-[10px] font-serif italic" style={{ color: theme.accentColor }}>
                            Con todo mi amor, {value.from.trim()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

          </div>
        </div>
      </div>
  );
}
