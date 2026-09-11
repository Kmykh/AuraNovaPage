"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useProduct } from '@/hooks/use-product';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { formatCurrency, formatStageName, getImageUrl } from '@/lib/formatters';
import { ArrowLeft, PackageOpen, ShoppingBag, Download, Sparkles, Heart, Palette, Check, User, Type, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { ApiProblemDetails } from '@/lib/api-errors';
import { useCartStore } from '@/store/cart.store';
import { toast } from 'sonner';
import { useProducts } from '@/hooks/use-products';
import { ProductCard } from '@/components/shared/ProductCard';

import estatuoImg from '../../images/estatuo.png';
import nubeImg from '../../images/nube2.png';
import florImg from '../../images/flowera.png';
import flortalloImg from '../../images/flortallo.png';
import angelesImg from '../../images/angeles.png';
import flo1Img from '../../images/flo1.png';
import flo2Img from '../../images/flo2.png';

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

interface ProductDetailClientProps {
  id: string;
}

export function ProductDetailClient({ id }: ProductDetailClientProps) {
  const { data: product, isLoading, error, refetch } = useProduct(id);
  const addItem = useCartStore(state => state.addItem);

  const [isVariousColors, setIsVariousColors] = useState(false);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedFlowerTypes, setSelectedFlowerTypes] = useState<string[]>([]);
  const [hasLights, setHasLights] = useState(false);
  const [hasButterfly, setHasButterfly] = useState(false);
  const [hasPhraseCard, setHasPhraseCard] = useState(false);
  const [phraseText, setPhraseText] = useState('');
  const [phraseFont, setPhraseFont] = useState('Elegante/Cursiva');
  const [phraseBackground, setPhraseBackground] = useState<CardThemeId>('marfil');
  const [phraseTo, setPhraseTo] = useState('');
  const [phraseFrom, setPhraseFrom] = useState('');
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isPhraseModalOpen, setIsPhraseModalOpen] = useState(false);
  const [activeCardStep, setActiveCardStep] = useState<'theme' | 'recipients' | 'message'>('theme');
  
  // Accordion state
  const [activeSection, setActiveSection] = useState<string | null>('colors');
  
  // Cross-selling (Complementos y otros productos)
  const { data: allProducts } = useProducts();
  const rawSuggested = allProducts?.filter(p => p.id !== product?.id && (
    p.category?.name?.toLowerCase().includes('accesorio') || 
    p.category?.name?.toLowerCase().includes('llavero') || 
    p.category?.name?.toLowerCase().includes('peluche') ||
    p.category?.name?.toLowerCase().includes('regalo')
  )) || [];

  const suggestedProducts = (rawSuggested.length >= 2 ? rawSuggested : allProducts?.filter(p => p.id !== product?.id) || []).slice(0, 4);

  useEffect(() => {
    if (product) {
      if (product.availableColors && product.availableColors.length > 0) {
        setSelectedColors([product.availableColors[0]]);
      }
      if (product.availableFlowerTypes && product.availableFlowerTypes.length > 0) {
        setSelectedFlowerTypes([product.availableFlowerTypes[0]]);
      }
      if (!product.availableColors?.length && product.availableFlowerTypes?.length) {
        setActiveSection('flowers');
      }
    }
  }, [product]);

  const handleToggleColor = (color: string) => {
    if (selectedColors.includes(color)) {
      if (selectedColors.length > 1) {
        setSelectedColors(selectedColors.filter(c => c !== color));
      }
    } else {
      if (selectedColors.length >= 5) {
        setSelectedColors([...selectedColors.slice(1), color]);
      } else {
        setSelectedColors([...selectedColors, color]);
      }
    }
  };

  const handleToggleFlowerType = (flower: string) => {
    if (selectedFlowerTypes.includes(flower)) {
      if (selectedFlowerTypes.length > 1) {
        setSelectedFlowerTypes(selectedFlowerTypes.filter(f => f !== flower));
      }
    } else {
      if (selectedFlowerTypes.length >= 5) {
        setSelectedFlowerTypes([...selectedFlowerTypes.slice(1), flower]);
      } else {
        setSelectedFlowerTypes([...selectedFlowerTypes, flower]);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="pt-24 md:pt-32 max-w-7xl mx-auto px-4 md:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-[40%_60%] gap-10 lg:gap-16 animate-pulse">
          <div className="flex justify-center md:justify-end">
            <Skeleton variant="card" className="aspect-[4/5] w-full max-w-[400px] rounded-2xl md:rounded-[2rem]" />
          </div>
          <div className="flex flex-col pt-4">
            <Skeleton variant="text" className="w-2/3 h-14 mb-3 rounded-xl" />
            <Skeleton variant="text" className="w-1/3 h-10 mb-8 rounded-xl" />
            <Skeleton variant="text" className="w-full h-3 mb-2 rounded-full" />
            <Skeleton variant="text" className="w-4/5 h-3 mb-8 rounded-full" />
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <Skeleton variant="text" className="w-1/2 h-3 mb-3 rounded-full" />
                <div className="flex gap-2">
                  <Skeleton variant="rect" className="w-16 h-8 rounded-full" />
                  <Skeleton variant="rect" className="w-16 h-8 rounded-full" />
                </div>
              </div>
              <div>
                <Skeleton variant="text" className="w-1/2 h-3 mb-3 rounded-full" />
                <div className="flex gap-2">
                  <Skeleton variant="rect" className="w-16 h-8 rounded-full" />
                  <Skeleton variant="rect" className="w-16 h-8 rounded-full" />
                </div>
              </div>
            </div>
            <Skeleton variant="rect" className="w-full h-12 rounded-full mt-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    const isNotFound = error instanceof ApiProblemDetails && error.status === 404;
    return (
      <div className="py-12">
        {isNotFound ? (
          <div className="flex flex-col items-center text-center p-8 bg-[#F9F8F6] rounded-2xl border border-sage/10 min-h-[300px]">
            <PackageOpen className="h-16 w-16 text-sage/40 mb-4" strokeWidth={1} />
            <h3 className="text-xl font-serif font-semibold text-brown mb-2">Joya floral no encontrada</h3>
            <p className="text-sage mb-6">El detalle que buscas no existe o ya no está disponible en nuestro catálogo.</p>
            <Link href="/productos" tabIndex={-1}>
              <Button variant="outline" className="rounded-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a la colección
              </Button>
            </Link>
          </div>
        ) : (
          <ErrorState 
            title="No pudimos cargar el producto" 
            message="Hubo un inconveniente conectando con nuestro sistema."
            onRetry={() => refetch()} 
          />
        )}
      </div>
    );
  }

  if (!product) return null;

  const isOutOfStock = !product.isAvailable || product.stock <= 0;
  const isLowStock = !isOutOfStock && product.stock > 0 && product.stock <= 3;

  const downloadCardImage = async () => {
    if (!phraseText.trim()) {
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

    const currentTheme = CARD_THEMES.find(t => t.id === phraseBackground) || CARD_THEMES[0];

    // 1. Background Gradient (Formato Horizontal 16:10)
    const grad = ctx.createLinearGradient(0, 0, 1600, 1000);
    if (phraseBackground === 'noir') {
      grad.addColorStop(0, '#24211e');
      grad.addColorStop(0.5, '#1a1817');
      grad.addColorStop(1, '#11100f');
    } else if (phraseBackground === 'rosa') {
      grad.addColorStop(0, '#fff8f9');
      grad.addColorStop(0.5, '#fcebed');
      grad.addColorStop(1, '#f8dce2');
    } else if (phraseBackground === 'pergamino') {
      grad.addColorStop(0, '#faf5ec');
      grad.addColorStop(0.5, '#f5ede0');
      grad.addColorStop(1, '#eadcc4');
    } else if (phraseBackground === 'salvia') {
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
          ctx.globalAlpha = phraseBackground === 'noir' ? 0.18 : 0.28;
          if (phraseBackground === 'marfil') {
            ctx.drawImage(decImg, 1600 - 580, 40, 520, 350);
          } else if (phraseBackground === 'rosa') {
            ctx.drawImage(decImg, 1600 - 480, 1000 - 480, 440, 440);
          } else if (phraseBackground === 'pergamino') {
            ctx.drawImage(decImg, 1600 - 460, 1000 - 460, 420, 420);
          } else if (phraseBackground === 'salvia') {
            ctx.drawImage(decImg, 40, 200, 360, 700);
          } else if (phraseBackground === 'noir') {
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
    ctx.fillStyle = phraseBackground === 'noir' ? '#b0a497' : '#887870';
    ctx.fillText('Atelier Floral & Regalos Exclusivos', 800, 160);

    ctx.beginPath();
    ctx.moveTo(640, 185);
    ctx.lineTo(960, 185);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 5. Destinatario ("Para:")
    const mainTextColor = phraseBackground === 'noir' ? '#f5ece1' : currentTheme.id === 'rosa' ? '#5d2b38' : currentTheme.id === 'salvia' ? '#233529' : '#3d2e28';
    if (phraseTo.trim()) {
      ctx.fillStyle = accent;
      ctx.font = 'bold 20px "Playfair Display", Georgia, serif';
      ctx.fillText(`Para: ${phraseTo.trim()}`, 800, 260);
    }

    // 6. Texto de Dedicatoria (Centrado y con ajuste de línea)
    const fontStyle = phraseFont === 'Elegante/Cursiva'
      ? 'italic 38px "Playfair Display", Georgia, serif'
      : phraseFont === 'Clásica'
      ? '34px "Playfair Display", Georgia, serif'
      : '32px system-ui, -apple-system, sans-serif';

    ctx.font = fontStyle;
    ctx.fillStyle = mainTextColor;

    const maxWidth = 1200;
    const words = phraseText.trim().split(' ');
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

    const lineHeight = phraseFont === 'Elegante/Cursiva' ? 62 : 56;
    const totalTextHeight = lines.length * lineHeight;
    const startY = Math.max(phraseTo.trim() ? 340 : 300, (1000 - totalTextHeight) / 2);

    lines.forEach((line, idx) => {
      const isFirst = idx === 0;
      const isLast = idx === lines.length - 1;
      const prefix = isFirst ? '“' : '';
      const suffix = isLast ? '”' : '';
      ctx.fillText(`${prefix}${line}${suffix}`, 800, startY + (idx * lineHeight));
    });

    // 7. Firma Remitente ("Con todo mi amor, ...")
    if (phraseFrom.trim()) {
      ctx.font = 'italic 24px "Playfair Display", Georgia, serif';
      ctx.fillStyle = accent;
      ctx.fillText(`Con todo mi amor, ${phraseFrom.trim()}`, 800, 860);
    }

    // 8. Marca de Atelier en el pie
    ctx.font = '14px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = phraseBackground === 'noir' ? '#665e57' : '#a89d96';
    ctx.fillText('Hecho a mano con dedicación • www.auranova.pe', 800, 935);

    // Descarga directa en archivo PNG
    const link = document.createElement('a');
    link.download = `AuraNova_Tarjeta_${(product?.name || 'Dedicatoria').replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast.success('¡Tarjeta dedicatoria descargada en alta resolución!', {
      description: 'Guardada en formato PNG horizontal.'
    });
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    
    if (hasPhraseCard && !phraseText.trim()) {
      toast.error('Falta la dedicatoria', {
        description: 'Por favor, escribe una frase para la tarjeta o desmarca la opción.'
      });
      return;
    }
    
    const formattedPhrase = phraseTo.trim() || phraseFrom.trim()
      ? `${phraseTo.trim() ? `[Para: ${phraseTo.trim()}] ` : ''}${phraseText}${phraseFrom.trim() ? ` [De: ${phraseFrom.trim()}]` : ''}`
      : phraseText;

    addItem({
      productId: product.id,
      name: product.name,
      price: product.effectivePrice,
      quantity: 1,
      imageUrl: getImageUrl(product.imageUrl),
      stock: product.stock,
      isAvailable: product.isAvailable,
      selectedPrimaryColor: isVariousColors
        ? 'Surtido (Varios colores)'
        : (selectedColors[0] || (product.availableColors?.length > 0 ? selectedColors.join(', ') : undefined)),
      selectedSecondaryColor: !isVariousColors && selectedColors.length > 1
        ? selectedColors.slice(1).join(', ')
        : undefined,
      selectedFlowerType: selectedFlowerTypes[0] || (product.availableFlowerTypes?.length > 0 ? selectedFlowerTypes.join(', ') : undefined),
      selectedFlowerColor: selectedFlowerTypes.length > 1
        ? selectedFlowerTypes.slice(1).join(', ')
        : undefined,
      hasLights: product.allowsLights ? hasLights : undefined,
      hasButterfly: product.allowsButterfly ? hasButterfly : undefined,
      hasPhraseCard: product.allowsPhraseCard ? hasPhraseCard : undefined,
      phraseText: hasPhraseCard ? formattedPhrase : undefined,
      phraseFont: hasPhraseCard ? phraseFont : undefined,
      phraseBackground: hasPhraseCard ? phraseBackground : undefined,
    });
    
    toast.success('Detalle agregado al carrito', {
      description: product.name,
      icon: <ShoppingBag className="h-4 w-4" />
    });
  };

  return (
    <div className="relative overflow-hidden">
      {/* Float Animations & Masks */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes floatGentle {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-14px); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .detail-float-gentle { animation: floatGentle 6s ease-in-out infinite; }
        .detail-float-slow { animation: floatSlow 9s ease-in-out infinite; }
        .detail-vignette {
          mask-image: radial-gradient(ellipse at center, black 30%, transparent 75%);
          -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 75%);
        }
        `
      }} />

      {/* ── Global Page Decorations ── */}
      {/* Angeles top-right background */}
      <div className="absolute -top-8 right-0 translate-x-1/4 w-72 md:w-[28rem] opacity-[0.07] pointer-events-none mix-blend-multiply detail-vignette -rotate-12">
        <Image src={angelesImg} alt="" className="w-full h-full object-contain" />
      </div>
      {/* Statue bottom-right */}
      <div className="absolute bottom-0 right-0 translate-x-1/6 translate-y-1/6 w-52 md:w-80 opacity-[0.65] pointer-events-none mix-blend-multiply detail-vignette detail-float-slow hidden md:block">
        <Image src={estatuoImg} alt="" className="w-full h-full object-contain" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[42%_58%] gap-8 lg:gap-14 items-center pt-20 md:pt-28 max-w-7xl mx-auto px-4 md:px-8 pb-10 relative z-10 min-h-[calc(100vh-5rem)]">
        {/* Image Column */}
        <div className="relative w-full flex justify-center">
          <div className="relative aspect-[3/4] w-full max-w-[420px] rounded-2xl md:rounded-[2rem] overflow-hidden bg-[#F9F8F6] shadow-[0_8px_40px_rgba(74,57,51,0.08)]">
            {product.imageUrl ? (
              <Image
                src={getImageUrl(product.imageUrl)}
                alt={`Imagen de ${product.name}`}
                fill
                className="object-cover object-center transition-transform duration-[2s] ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:scale-105"
                sizes="(max-width: 768px) 100vw, 42vw"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-[#887870]/40">
                <PackageOpen size={64} strokeWidth={1} />
              </div>
            )}
          </div>
        </div>

        {/* Info Column */}
        <div className="flex flex-col justify-center relative">
          
          {/* Inline Decorative Images */}
          <div className="absolute -top-10 right-0 w-44 md:w-64 opacity-60 pointer-events-none mix-blend-multiply detail-vignette detail-float-gentle">
            <Image src={nubeImg} alt="" className="w-full h-full object-contain" />
          </div>
          <div className="absolute top-8 right-8 md:right-16 w-20 md:w-28 opacity-35 pointer-events-none mix-blend-multiply detail-float-slow rotate-12 detail-vignette">
            <Image src={florImg} alt="" className="w-full h-full object-contain" />
          </div>
          <div className="absolute bottom-4 left-0 w-28 md:w-40 opacity-25 pointer-events-none mix-blend-multiply detail-float-gentle -translate-x-1/4 detail-vignette hidden md:block">
            <Image src={flortalloImg} alt="" className="w-full h-full object-contain" />
          </div>

          {/* Title + Price Row */}
          <div className="mb-5 relative z-10">
            {product.isCampaignActive && product.campaignStageName && (
              <div className="flex items-center gap-2 mb-3">
                <span className="h-px w-6 bg-[#8f2d3b]/50" />
                <span className="text-[#8f2d3b] text-xs uppercase tracking-[0.25em] font-extrabold font-serif">
                  {formatStageName(product.campaignStageName)} {product.campaignName && `— ${product.campaignName}`}
                </span>
              </div>
            )}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between md:gap-6">
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-[#4a3933] leading-[1.05] tracking-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-3 mt-3 md:mt-0 shrink-0">
                <div className="flex flex-col md:items-end">
                  {product.isCampaignActive ? (
                    <>
                      <span className="text-sm font-serif text-stone-400 line-through">
                        {formatCurrency(product.price)}
                      </span>
                      <span className="text-3xl md:text-4xl font-serif font-bold text-[#8f2d3b] tracking-tight whitespace-nowrap">
                        {formatCurrency(product.effectivePrice)}
                      </span>
                    </>
                  ) : (
                    <span className="text-3xl md:text-4xl font-serif font-bold text-[#3d2e28] tracking-tight whitespace-nowrap">
                      {formatCurrency(product.effectivePrice)}
                    </span>
                  )}
                </div>
                {isOutOfStock ? (
                  <span className="bg-red-50 text-red-600 text-[9px] uppercase tracking-[0.15em] font-bold px-2.5 py-1 rounded-full border border-red-100">
                    Agotado
                  </span>
                ) : isLowStock ? (
                  <span className="bg-[#c8a96b]/10 text-[#c8a96b] text-[9px] uppercase tracking-[0.15em] font-bold px-2.5 py-1 rounded-full border border-[#c8a96b]/20">
                    Últimas {product.stock}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="w-12 h-px bg-[#c8a96b]/40 mt-3" />
          </div>

          {/* Description */}
          <div className="mb-5 relative">
            <div className={`overflow-hidden transition-all duration-500 relative ${isDescriptionExpanded ? '' : 'max-h-[60px]'}`}>
              <p className="text-[#887870] leading-[1.7] whitespace-pre-wrap font-medium text-sm">
                {product.description}
              </p>
              {!isDescriptionExpanded && ((product.description?.length ?? 0) > 100) && (
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#faf7f2] to-transparent pointer-events-none" />
              )}
            </div>
            {(product.description?.length ?? 0) > 100 && (
              <button 
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="mt-2 text-[10px] font-bold uppercase tracking-widest text-[#c8a96b] hover:text-[#4a3933] transition-colors flex items-center gap-1"
              >
                {isDescriptionExpanded ? 'Ver menos' : 'Ver más'}
                <svg className={`w-3 h-3 transition-transform duration-300 ${isDescriptionExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
          </div>

          {/* --- Opciones de Personalización (Accordion) --- */}
          <div className="space-y-3 mb-6">
            {product.availableColors && product.availableColors.length > 0 && (
              <div className="bg-[#FBF9F5] rounded-2xl border border-sage/15 overflow-hidden transition-all duration-300">
                <button 
                  onClick={() => setActiveSection(activeSection === 'colors' ? null : 'colors')}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left"
                >
                  <div>
                    <label className="block text-[11px] font-bold text-[#4a3933] uppercase tracking-wider cursor-pointer">
                      Colores del Arreglo
                    </label>
                    <p className="text-[10px] text-[#887870] mt-0.5">
                      {selectedColors.length > 0 && !isVariousColors ? selectedColors.join(', ') : isVariousColors ? 'Surtido multicolor' : 'Selecciona hasta 5 colores'}
                    </p>
                  </div>
                  {activeSection === 'colors' ? <ChevronUp className="w-4 h-4 text-sage" /> : <ChevronDown className="w-4 h-4 text-sage" />}
                </button>
                
                {activeSection === 'colors' && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 border-t border-sage/10 animate-in slide-in-from-top-2 fade-in duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                      <p className="text-[11px] text-[#887870]">
                        {isVariousColors ? 'Se armará un surtido variado con una combinación armoniosa.' : 'Elige hasta 5 colores para tu diseño floral.'}
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsVariousColors(!isVariousColors)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 border self-start sm:self-auto ${
                          isVariousColors 
                            ? 'bg-[#c8a96b] text-white border-[#c8a96b] shadow-xs' 
                            : 'bg-white text-[#4a3933] border-sage/30 hover:border-[#c8a96b]'
                        }`}
                      >
                        ✨ {isVariousColors ? 'Surtido multicolor' : 'Quiero colores varios'}
                      </button>
                    </div>

                    {!isVariousColors && (
                      <div className="flex flex-wrap gap-2">
                        {product.availableColors.map(color => {
                          const isSelected = selectedColors.includes(color);
                          return (
                            <button
                              key={color}
                              type="button"
                              onClick={() => handleToggleColor(color)}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-300 border flex items-center gap-1.5 ${
                                isSelected 
                                  ? 'bg-[#4a3933] text-white border-[#4a3933] shadow-xs' 
                                  : 'bg-white text-[#887870] border-sage/30 hover:border-[#4a3933]/50'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3" />}
                              {color}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {product.availableFlowerTypes && product.availableFlowerTypes.length > 0 && (
              <div className="bg-[#FBF9F5] rounded-2xl border border-sage/15 overflow-hidden transition-all duration-300">
                <button 
                  onClick={() => setActiveSection(activeSection === 'flowers' ? null : 'flowers')}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left"
                >
                  <div>
                    <label className="block text-[11px] font-bold text-[#4a3933] uppercase tracking-wider cursor-pointer">
                      Tipo de Flor
                    </label>
                    <p className="text-[10px] text-[#887870] mt-0.5">
                      {selectedFlowerTypes.length > 0 ? selectedFlowerTypes.join(', ') : 'Selecciona tus flores'}
                    </p>
                  </div>
                  {activeSection === 'flowers' ? <ChevronUp className="w-4 h-4 text-sage" /> : <ChevronDown className="w-4 h-4 text-sage" />}
                </button>

                {activeSection === 'flowers' && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 border-t border-sage/10 animate-in slide-in-from-top-2 fade-in duration-200">
                    <p className="text-[11px] text-[#887870] mb-3">
                      Puedes elegir hasta 5 flores diferentes para tu diseño.
                    </p>
                    <div className="flex flex-wrap gap-2.5">
                      {product.availableFlowerTypes.map(flower => {
                        const isSelected = selectedFlowerTypes.includes(flower);
                        return (
                          <button
                            key={flower}
                            type="button"
                            onClick={() => handleToggleFlowerType(flower)}
                            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 border flex items-center gap-2 ${
                              isSelected 
                                ? 'bg-[#4a3933] text-white border-[#4a3933] shadow-xs' 
                                : 'bg-white text-[#887870] border-sage/30 hover:border-[#4a3933]/50'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 text-[#c8a96b]" />}
                            {flower}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {(product.allowsLights || product.allowsButterfly) && (
              <div className="bg-[#FBF9F5] rounded-2xl border border-sage/15 overflow-hidden transition-all duration-300">
                <button 
                  onClick={() => setActiveSection(activeSection === 'extras' ? null : 'extras')}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left"
                >
                  <div>
                    <label className="block text-[11px] font-bold text-[#4a3933] uppercase tracking-wider cursor-pointer">
                      Extras Mágicos
                    </label>
                    <p className="text-[10px] text-[#887870] mt-0.5">
                      {hasLights || hasButterfly ? `${hasLights ? 'Luces' : ''}${hasLights && hasButterfly ? ' y ' : ''}${hasButterfly ? 'Mariposas' : ''}` : 'Agregar luces o mariposas'}
                    </p>
                  </div>
                  {activeSection === 'extras' ? <ChevronUp className="w-4 h-4 text-sage" /> : <ChevronDown className="w-4 h-4 text-sage" />}
                </button>

                {activeSection === 'extras' && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 border-t border-sage/10 animate-in slide-in-from-top-2 fade-in duration-200">
                    <div className="flex flex-col sm:flex-row gap-5">
                      {product.allowsLights && (
                        <label className="flex items-center gap-2.5 cursor-pointer group">
                          <div className={`w-4 h-4 rounded-[3px] border flex items-center justify-center transition-colors ${hasLights ? 'bg-[#4a3933] border-[#4a3933]' : 'border-sage/40 group-hover:border-[#4a3933]'}`}>
                            {hasLights && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                          </div>
                          <input type="checkbox" className="hidden" checked={hasLights} onChange={e => setHasLights(e.target.checked)} />
                          <span className={`text-sm font-medium transition-colors ${hasLights ? 'text-[#4a3933]' : 'text-[#887870]'}`}>Añadir Luces</span>
                        </label>
                      )}
                      
                      {product.allowsButterfly && (
                        <label className="flex items-center gap-2.5 cursor-pointer group">
                          <div className={`w-4 h-4 rounded-[3px] border flex items-center justify-center transition-colors ${hasButterfly ? 'bg-[#4a3933] border-[#4a3933]' : 'border-sage/40 group-hover:border-[#4a3933]'}`}>
                            {hasButterfly && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                          </div>
                          <input type="checkbox" className="hidden" checked={hasButterfly} onChange={e => setHasButterfly(e.target.checked)} />
                          <span className={`text-sm font-medium transition-colors ${hasButterfly ? 'text-[#4a3933]' : 'text-[#887870]'}`}>Añadir Mariposas</span>
                        </label>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {product.allowsPhraseCard && (
              <div className="bg-[#FBF9F5] rounded-2xl border border-sage/15 overflow-hidden transition-all duration-300">
                <button 
                  onClick={() => setActiveSection(activeSection === 'card' ? null : 'card')}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left"
                >
                  <div>
                    <label className="block text-[11px] font-bold text-[#4a3933] uppercase tracking-wider cursor-pointer">
                      Tarjeta con Dedicatoria
                    </label>
                    <p className="text-[10px] text-[#887870] mt-0.5">
                      {hasPhraseCard ? (phraseText ? 'Mensaje personalizado agregado' : 'Incluir tarjeta') : 'Personaliza tu mensaje'}
                    </p>
                  </div>
                  {activeSection === 'card' ? <ChevronUp className="w-4 h-4 text-sage" /> : <ChevronDown className="w-4 h-4 text-sage" />}
                </button>

                {activeSection === 'card' && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 border-t border-sage/10 animate-in slide-in-from-top-2 fade-in duration-200">
                    <label className="flex items-center gap-2.5 cursor-pointer group w-fit mb-3">
                      <div className={`w-4 h-4 rounded-[3px] border flex items-center justify-center transition-colors ${hasPhraseCard ? 'bg-[#4a3933] border-[#4a3933]' : 'border-sage/40 group-hover:border-[#4a3933]'}`}>
                        {hasPhraseCard && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <input type="checkbox" className="hidden" checked={hasPhraseCard} onChange={e => {
                        const isChecked = e.target.checked;
                        setHasPhraseCard(isChecked);
                        if (isChecked && !phraseText) {
                          setIsPhraseModalOpen(true);
                        }
                        if (!isChecked) setPhraseText('');
                      }} />
                      <span className={`text-sm font-medium transition-colors ${hasPhraseCard ? 'text-[#4a3933]' : 'text-[#887870]'}`}>Incluir Tarjeta con Dedicatoria</span>
                    </label>

                    {hasPhraseCard && (
                      <div className="pl-6 animate-in slide-in-from-top-2 fade-in duration-300">
                        {phraseText.trim() ? (
                          (() => {
                            const theme = CARD_THEMES.find(t => t.id === phraseBackground) || CARD_THEMES[0];
                            return (
                              <div className={`p-4 sm:p-5 rounded-2xl border shadow-md flex flex-col justify-between relative overflow-hidden group transition-all ${theme.bgClasses} ${theme.borderColor}`}>
                                {/* Frontend artwork watermark in inline preview */}
                                {theme.image && (
                                  <div className={`absolute pointer-events-none ${theme.imageClass}`}>
                                    <Image src={theme.image} alt="" className="w-full h-full object-contain" />
                                  </div>
                                )}

                                <div className="relative z-10">
                                  <div className="flex items-center justify-between w-full border-b border-black/5 pb-2 mb-2">
                                    <span className={`text-[9px] sm:text-[10px] font-serif uppercase tracking-widest font-bold ${theme.metaColor}`}>
                                      {theme.name} • {phraseFont.split('/')[0]}
                                    </span>
                                    {phraseTo && (
                                      <span className={`text-[9px] sm:text-[10px] font-serif font-bold ${theme.metaColor}`}>
                                        Para: {phraseTo}
                                      </span>
                                    )}
                                  </div>
                                  <p className={`w-full break-words py-1 ${theme.textColor} ${
                                    phraseFont === 'Elegante/Cursiva' ? 'font-serif italic text-sm sm:text-base md:text-lg' :
                                    phraseFont === 'Clásica' ? 'font-serif text-xs sm:text-sm md:text-base' :
                                    'font-sans font-light text-xs sm:text-sm'
                                  }`}>
                                    &ldquo;{phraseText}&rdquo;
                                  </p>
                                  {phraseFrom && (
                                    <p className={`text-[10px] sm:text-xs font-serif italic text-right mt-1 ${theme.metaColor}`}>
                                      — Con todo mi amor, {phraseFrom}
                                    </p>
                                  )}
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-3 border-t border-black/5 w-full justify-between relative z-10 mt-3">
                                  <button
                                    onClick={() => setIsPhraseModalOpen(true)}
                                    className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#c8a96b] hover:text-[#4a3933] transition-colors flex items-center gap-1.5"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                    Editar tarjeta
                                  </button>
                                  <button
                                    onClick={downloadCardImage}
                                    className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#4a3933] hover:text-[#c8a96b] transition-colors flex items-center gap-1.5"
                                    title="Descargar como imagen horizontal"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    Descargar PNG
                                  </button>
                                </div>
                              </div>
                            );
                          })()
                        ) : (
                          <button
                            onClick={() => setIsPhraseModalOpen(true)}
                            className="px-4 py-2 rounded-full border border-[#c8a96b] text-[#c8a96b] text-xs font-medium hover:bg-[#c8a96b] hover:text-white transition-all flex items-center gap-2"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            Personalizar tarjeta dedicatoria
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          {/* --- Fin Opciones de Personalización --- */}

          {/* Phrase Card Modal (Collapsible by Sections & Horizontal Preview) */}
          {isPhraseModalOpen && (
            <div 
              className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 md:p-8 pt-20 md:pt-24 pb-6 overflow-y-auto" 
              onClick={() => setIsPhraseModalOpen(false)}
            >
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
              <div 
                className="relative bg-[#fcfaf7] rounded-3xl shadow-2xl w-full max-w-4xl lg:max-w-5xl max-h-[85vh] overflow-y-auto p-5 md:p-8 border border-amber-900/15 my-auto"
                onClick={e => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={() => setIsPhraseModalOpen(false)}
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
                                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: (CARD_THEMES.find(t => t.id === phraseBackground) || CARD_THEMES[0]).accentColor }} />
                                {(CARD_THEMES.find(t => t.id === phraseBackground) || CARD_THEMES[0]).name}
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
                              const isSelected = phraseBackground === theme.id;
                              return (
                                <button
                                  key={theme.id}
                                  onClick={() => setPhraseBackground(theme.id)}
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
                                {phraseTo || phraseFrom 
                                  ? `${phraseTo ? `Para: ${phraseTo}` : ''}${phraseTo && phraseFrom ? ' · ' : ''}${phraseFrom ? `De: ${phraseFrom}` : ''}`
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
                                value={phraseTo}
                                onChange={e => setPhraseTo(e.target.value.slice(0, 40))}
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
                                value={phraseFrom}
                                onChange={e => setPhraseFrom(e.target.value.slice(0, 40))}
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
                        onClick={() => setActiveCardStep(activeCardStep === 'message' ? null as any : 'message')}
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
                                {phraseText.trim() ? `"${phraseText.slice(0, 24)}..."` : 'Escribe tus palabras...'}
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
                                  onClick={() => setPhraseText(quick.slice(0, 160))}
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
                              <span className="text-[9px] text-sage/70 font-medium">{phraseText.length}/160</span>
                            </div>
                            <textarea
                              value={phraseText}
                              onChange={e => setPhraseText(e.target.value.slice(0, 160))}
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
                                  onClick={() => setPhraseFont(f.id)}
                                  className={`p-2 rounded-xl text-left border transition-all ${
                                    phraseFont === f.id
                                      ? 'bg-[#4a3933] text-white border-[#4a3933] shadow-xs'
                                      : 'bg-[#faf8f5] text-[#887870] border-sage/20 hover:border-[#4a3933]/30'
                                  }`}
                                >
                                  <div className={`text-[10px] sm:text-[11px] font-medium ${f.fontClass}`}>{f.label}</div>
                                  <div className={`text-[8px] ${phraseFont === f.id ? 'text-stone-300' : 'text-[#887870]/70'}`}>{f.sub}</div>
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
                        onClick={downloadCardImage}
                        type="button"
                        className="w-full sm:w-1/2 h-10 rounded-full border border-[#c8a96b] text-[#8f6d28] hover:bg-[#c8a96b]/10 text-[10px] md:text-[11px] font-serif font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                      >
                        <Download className="w-3.5 h-3.5 text-[#c8a96b]" />
                        Descargar PNG
                      </button>

                      <button
                        onClick={() => {
                          setHasPhraseCard(true);
                          setIsPhraseModalOpen(false);
                          toast.success('¡Tarjeta dedicatoria guardada!', {
                            description: 'Tu dedicatoria se incluirá con el pedido.'
                          });
                        }}
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
                      const theme = CARD_THEMES.find(t => t.id === phraseBackground) || CARD_THEMES[0];
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
                            {phraseTo.trim() && (
                              <p className="text-[9px] sm:text-[10px] font-serif font-bold text-center mt-1" style={{ color: theme.accentColor }}>
                                Para: {phraseTo.trim()}
                              </p>
                            )}

                            {/* Message */}
                            <div className="my-auto flex items-center justify-center text-center px-3 sm:px-6">
                              {phraseText.trim() ? (
                                <p className={`text-[11px] sm:text-[13px] md:text-sm px-2 break-words w-full leading-relaxed ${theme.textColor} ${
                                  phraseFont === 'Elegante/Cursiva' ? 'font-serif italic text-xs sm:text-sm md:text-base' :
                                  phraseFont === 'Clásica' ? 'font-serif' :
                                  'font-sans font-light tracking-wide'
                                }`}>
                                  &ldquo;{phraseText}&rdquo;
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
                              {phraseFrom.trim() && (
                                <p className="text-[9px] sm:text-[10px] font-serif italic" style={{ color: theme.accentColor }}>
                                  Con todo mi amor, {phraseFrom.trim()}
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
          )}

          <div className="mt-auto space-y-4 pt-6 border-t border-sage/10">
            <Button 
              size="lg" 
              className="w-full text-base rounded-full bg-[#c8a96b] hover:bg-[#b59555] text-white shadow-[0_8px_30px_rgba(200,169,107,0.2)] transition-all hover:-translate-y-1 h-12 border-none font-serif italic" 
              disabled={isOutOfStock}
              onClick={handleAddToCart}
            >
              {isOutOfStock ? 'No disponible temporalmente' : (
                <div className="flex items-center justify-center gap-3">
                  <ShoppingBag className="h-5 w-5" />
                  <span>Agregar al carrito</span>
                </div>
              )}
            </Button>
            
            <p className="text-[11px] text-center text-[#887870] uppercase tracking-[0.2em] font-bold mt-6">
              Detalles únicos y eternos, creados con amor.
            </p>
          </div>
        </div>
      </div>

      {/* --- También Podría Interesarte (Cross-Selling con el estilo idéntico de ProductCard) --- */}
      {suggestedProducts.length > 0 && (
        <section className="mt-16 md:mt-24 pt-12 border-t border-sage/15 animate-in fade-in duration-700">
          <div className="flex flex-col items-center text-center mb-8 md:mb-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="h-px w-6 bg-[#c8a96b]" />
              <span className="text-[10px] md:text-[11px] font-serif uppercase tracking-[0.25em] text-[#c8a96b] font-bold">
                Complementos & Regalos
              </span>
              <span className="h-px w-6 bg-[#c8a96b]" />
            </div>
            <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-[#4a3933]">
              También podría interesarte
            </h2>
            <p className="text-xs md:text-sm text-[#887870] font-serif italic mt-1.5">
              Detalles únicos diseñados para complementar tu regalo especial
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
            {suggestedProducts.map((sp) => (
              <ProductCard key={sp.id} product={sp} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
