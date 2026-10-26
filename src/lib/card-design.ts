import type { StaticImageData } from 'next/image';
import angelesImg from '@/app/(public)/images/angeles.png';
import florImg from '@/app/(public)/images/flowera.png';
import flortalloImg from '@/app/(public)/images/flortallo.png';
import flo1Img from '@/app/(public)/images/flo1.png';
import flo2Img from '@/app/(public)/images/flo2.png';

/**
 * Tarjeta con dedicatoria: un solo diseño para la vista previa del cliente, el PNG que descarga
 * y la tarjeta que el taller imprime (antes el panel imprimía otro diseño distinto).
 */
export type CardThemeId = 'marfil' | 'rosa' | 'pergamino' | 'noir' | 'salvia' | 'foto';

export interface CardDesign {
  text: string;
  font: string;
  theme: CardThemeId;
  to: string;
  from: string;
  /** Foto propia: data URL ya comprimida (cliente) o URL firmada (panel). */
  photo?: string | null;
}

export const EMPTY_CARD: CardDesign = { text: '', font: 'Elegante/Cursiva', theme: 'marfil', to: '', from: '' };

export const MAX_CARD_TEXT = 180;

export const QUICK_PHRASES = [
  { label: 'Cumpleaños', text: '¡Feliz cumpleaños! Que la vida te regale tantos momentos felices como flores tiene este detalle.' },
  { label: 'Amor', text: 'Te amo con todo mi corazón. Gracias por iluminar cada uno de mis días.' },
  { label: 'Aniversario', text: 'Feliz aniversario. Cada día a tu lado es mi regalo favorito.' },
  { label: 'Gracias', text: 'Gracias por existir y ser mi persona favorita.' },
  { label: 'Mamá', text: 'Para la mujer más especial de mi vida. Te quiero muchísimo, mamá.' },
  { label: 'Graduación', text: '¡Lo lograste! Estoy muy orgulloso(a) de ti. Lo mejor recién empieza.' },
];

export const CARD_FONTS = [
  { id: 'Elegante/Cursiva', label: 'Elegante', hint: 'Cursiva fina', css: 'font-serif italic' },
  { id: 'Clásica', label: 'Clásica', hint: 'Boutique formal', css: 'font-serif' },
  { id: 'Moderna', label: 'Moderna', hint: 'Limpia y simple', css: 'font-sans font-light' },
] as const;

interface CardTheme {
  id: CardThemeId;
  name: string;
  /** Degradado del fondo (también para la miniatura del selector) */
  stops: [string, string, string];
  ink: string;
  meta: string;
  accent: string;
  decoration?: {
    image: StaticImageData;
    /** Posición en la vista previa (porcentajes de la tarjeta) */
    css: { top?: string; right?: string; bottom?: string; left?: string; width: string; rotate?: number };
    /** Rectángulo en el lienzo de 1600×1000 */
    canvas: [number, number, number, number];
    alpha: number;
    blend?: 'multiply' | 'normal';
  };
}

export const CARD_THEMES: CardTheme[] = [
  {
    id: 'marfil', name: 'Marfil & Ángeles', stops: ['#fffdfa', '#fbf7ee', '#f4ebe1'],
    ink: '#3d2e28', meta: '#887870', accent: '#c8a96b',
    decoration: { image: angelesImg, css: { top: '-2%', right: '-3%', width: '40%', rotate: -6 }, canvas: [1020, 30, 560, 380], alpha: 0.3, blend: 'multiply' },
  },
  {
    id: 'rosa', name: 'Rosa Romance', stops: ['#fff8f9', '#fcebed', '#f8dce2'],
    ink: '#5d2b38', meta: '#9c5365', accent: '#c4687d',
    decoration: { image: flo1Img, css: { bottom: '-4%', right: '-3%', width: '34%' }, canvas: [1110, 530, 470, 470], alpha: 0.34, blend: 'multiply' },
  },
  {
    id: 'pergamino', name: 'Pergamino Vintage', stops: ['#faf5ec', '#f5ede0', '#eadcc4'],
    ink: '#4a3728', meta: '#856545', accent: '#966d3b',
    decoration: { image: flo2Img, css: { bottom: '-4%', right: '-3%', width: '32%' }, canvas: [1130, 540, 450, 450], alpha: 0.3, blend: 'multiply' },
  },
  {
    id: 'noir', name: 'Noir & Oro', stops: ['#24211e', '#1a1817', '#11100f'],
    ink: '#f5ece1', meta: '#b0a497', accent: '#e5c058',
    decoration: { image: florImg, css: { top: '0%', right: '1%', width: '28%' }, canvas: [1160, 30, 400, 400], alpha: 0.22 },
  },
  {
    id: 'salvia', name: 'Jardín Salvia', stops: ['#f5f8f6', '#ebf3ed', '#d8e6db'],
    ink: '#233529', meta: '#54735e', accent: '#4f755b',
    decoration: { image: flortalloImg, css: { bottom: '-6%', left: '-2%', width: '30%', rotate: -6 }, canvas: [30, 220, 380, 760], alpha: 0.3, blend: 'multiply' },
  },
  {
    // La foto del cliente ocupa todo el fondo; el mensaje va en un panel claro para que siempre se lea
    id: 'foto', name: 'Tu foto', stops: ['#fffdfa', '#fbf7ee', '#f4ebe1'],
    ink: '#3d2e28', meta: '#6f5f57', accent: '#b08a4e',
  },
];

export function cardTheme(id: string | null | undefined): CardTheme {
  return CARD_THEMES.find(t => t.id === id) ?? CARD_THEMES[0];
}

export function cardFont(id: string | null | undefined) {
  return CARD_FONTS.find(f => f.id === id) ?? CARD_FONTS[0];
}

/** Texto plano para WhatsApp, tickets y pedidos antiguos: incluye para quién y de quién. */
export function cardSummary(design: Pick<CardDesign, 'text' | 'to' | 'from'>): string {
  const to = design.to.trim();
  const from = design.from.trim();
  return `${to ? `Para ${to}: ` : ''}“${design.text.trim()}”${from ? ` — ${from}` : ''}`;
}

/* ───────────────────────────── Foto propia ───────────────────────────── */

const PHOTO_WIDTH = 1440;
const PHOTO_HEIGHT = 900;
const MAX_PHOTO_DATA_URL = 650_000;

/**
 * Prepara la foto del cliente en su celular: la recorta centrada a la forma de la tarjeta (16:10),
 * la reduce a 1440×900 y la comprime (WebP, ~100-250 KB). Así se sube poco, se guarda poco y
 * la vista previa no descarga nada del servidor.
 */
export async function prepareCardPhoto(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Elige una imagen (JPG, PNG o WEBP).');
  if (file.size > 25 * 1024 * 1024) throw new Error('La foto es muy pesada (máximo 25 MB).');

  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' }).catch(() => {
    throw new Error('No pudimos abrir esa foto. Prueba con otra en JPG o PNG.');
  });

  const ratio = PHOTO_WIDTH / PHOTO_HEIGHT;
  const cropWidth = Math.min(bitmap.width, bitmap.height * ratio);
  const cropHeight = cropWidth / ratio;
  const width = Math.round(Math.min(PHOTO_WIDTH, cropWidth));
  const height = Math.round(width / ratio);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Tu navegador no pudo procesar la foto.');
  context.drawImage(bitmap, (bitmap.width - cropWidth) / 2, (bitmap.height - cropHeight) / 2, cropWidth, cropHeight, 0, 0, width, height);
  bitmap.close();

  // WebP si el navegador lo soporta; si no, JPEG
  let quality = 0.8;
  let dataUrl = canvas.toDataURL('image/webp', quality);
  const type = dataUrl.startsWith('data:image/webp') ? 'image/webp' : 'image/jpeg';
  if (type === 'image/jpeg') dataUrl = canvas.toDataURL(type, quality);
  while (dataUrl.length > MAX_PHOTO_DATA_URL && quality > 0.45) {
    quality -= 0.12;
    dataUrl = canvas.toDataURL(type, quality);
  }
  return dataUrl;
}

/* ─────────────────────────── Tarjeta en PNG ─────────────────────────── */

const W = 1600;
const H = 1000;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    if (/^https?:/i.test(src)) image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('No se pudo cargar la imagen.'));
    image.src = src;
  });
}

/** La fuente real de la web (next/font le cambia el nombre): se lee de una clase de Tailwind. */
function familyOf(className: string, fallback: string) {
  const probe = document.createElement('span');
  probe.className = className;
  probe.style.cssText = 'position:absolute;visibility:hidden';
  document.body.appendChild(probe);
  const family = getComputedStyle(probe).fontFamily;
  probe.remove();
  return family || fallback;
}

function wrap(context: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split(/\n+/)) {
    let line = '';
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const test = line ? `${line} ${word}` : word;
      if (line && context.measureText(test).width > maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

/** Dibuja la tarjeta a 1600×1000 (lista para imprimir). Lanza error si la foto no se puede leer. */
export async function renderCard(design: CardDesign, footer = 'Hecho a mano con dedicación • Aura Nova'): Promise<HTMLCanvasElement> {
  const theme = cardTheme(design.theme);
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo preparar la tarjeta.');

  const serif = familyOf('font-serif', 'Georgia, serif');
  const sans = familyOf('font-sans', 'system-ui, sans-serif');
  await document.fonts?.ready;

  // Fondo
  const usePhoto = design.theme === 'foto' && !!design.photo;
  if (usePhoto) {
    const photo = await loadImage(design.photo!);
    const scale = Math.max(W / photo.naturalWidth, H / photo.naturalHeight);
    const pw = photo.naturalWidth * scale;
    const ph = photo.naturalHeight * scale;
    ctx.drawImage(photo, (W - pw) / 2, (H - ph) / 2, pw, ph);
  } else {
    const gradient = ctx.createLinearGradient(0, 0, W, H);
    theme.stops.forEach((color, index) => gradient.addColorStop(index / 2, color));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);
  }

  // Ilustración de la temática
  if (theme.decoration) {
    try {
      const art = await loadImage(theme.decoration.image.src);
      ctx.save();
      ctx.globalAlpha = theme.decoration.alpha;
      if (theme.decoration.blend === 'multiply') ctx.globalCompositeOperation = 'multiply';
      const [x, y, w, h] = theme.decoration.canvas;
      ctx.drawImage(art, x, y, w, h);
      ctx.restore();
    } catch {
      // Sin ilustración la tarjeta sigue siendo válida
    }
  }

  // Panel claro sobre la foto para que el texto se lea siempre
  if (usePhoto) {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 252, 246, 0.86)';
    ctx.beginPath();
    ctx.roundRect(230, 150, W - 460, H - 300, 36);
    ctx.fill();
    ctx.restore();
  }

  // Marco doble
  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 4;
  ctx.strokeRect(40, 40, W - 80, H - 80);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(56, 56, W - 112, H - 112);

  // Encabezado
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const top = usePhoto ? 225 : 140;
  ctx.fillStyle = theme.accent;
  ctx.font = `600 27px ${serif}`;
  ctx.fillText('✦   A U R A   N O V A   ✦', W / 2, top);
  ctx.beginPath();
  ctx.moveTo(W / 2 - 150, top + 28);
  ctx.lineTo(W / 2 + 150, top + 28);
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Para
  const to = design.to.trim();
  if (to) {
    ctx.fillStyle = theme.accent;
    ctx.font = `600 38px ${serif}`;
    ctx.fillText(`Para: ${to}`, W / 2, top + 95);
  }

  // Mensaje: se achica hasta que entra en 5 líneas
  const font = cardFont(design.font);
  const style = (size: number) =>
    font.id === 'Moderna' ? `300 ${size}px ${sans}` : font.id === 'Clásica' ? `${size}px ${serif}` : `italic ${size}px ${serif}`;
  const maxWidth = usePhoto ? 980 : 1180;
  let size = 50;
  let lines: string[];
  for (;;) {
    ctx.font = style(size);
    lines = wrap(ctx, `“${design.text.trim()}”`, maxWidth);
    if (lines.length <= 5 || size <= 26) break;
    size -= 2;
  }

  const lineHeight = Math.round(size * 1.45);
  const areaTop = to ? top + 130 : top + 70;
  const areaBottom = usePhoto ? H - 250 : H - 190;
  const startY = areaTop + Math.max(0, (areaBottom - areaTop - lines.length * lineHeight) / 2) + lineHeight * 0.75;
  ctx.fillStyle = theme.ink;
  lines.forEach((line, index) => ctx.fillText(line, W / 2, startY + index * lineHeight));

  // Firma
  const from = design.from.trim();
  if (from) {
    ctx.fillStyle = theme.accent;
    ctx.font = `italic 38px ${serif}`;
    ctx.fillText(`Con todo mi amor, ${from}`, W / 2, usePhoto ? H - 200 : H - 150);
  }

  // Pie (en el panel del taller lleva el código del pedido). Sobre una foto va en una franja clara para que se lea.
  ctx.font = `15px ${sans}`;
  if (usePhoto) {
    const width = ctx.measureText(footer).width + 40;
    ctx.fillStyle = 'rgba(255, 252, 246, 0.86)';
    ctx.beginPath();
    ctx.roundRect(W / 2 - width / 2, H - 108, width, 38, 19);
    ctx.fill();
  }
  ctx.fillStyle = theme.meta;
  ctx.globalAlpha = usePhoto ? 1 : 0.75;
  ctx.fillText(footer, W / 2, H - 83);
  ctx.globalAlpha = 1;

  return canvas;
}

/** Descarga la tarjeta en PNG (1600×1000). */
export async function downloadCard(design: CardDesign, fileName: string, footer?: string) {
  const canvas = await renderCard(design, footer);
  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('No se pudo generar la imagen.');
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName.replace(/[^\w.-]+/g, '_')}.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/**
 * Tarjeta de un pedido guardado. Los pedidos antiguos traen "[Para: X] mensaje [De: Y]" dentro del texto
 * y no guardaban el diseño: se separan y se usa el diseño clásico.
 */
export function designFromOrder(item: {
  phraseText?: string | null; phraseFont?: string | null; phraseTo?: string | null; phraseFrom?: string | null;
  phraseTheme?: string | null; cardBackgroundUrl?: string | null;
}): CardDesign {
  let text = item.phraseText?.trim() ?? '';
  let to = item.phraseTo ?? '';
  let from = item.phraseFrom ?? '';
  if (!item.phraseTo && !item.phraseFrom) {
    const legacy = text.match(/^(?:\[Para: ([\s\S]*?)\]\s*)?([\s\S]*?)(?:\s*\[De: ([\s\S]*?)\])?$/);
    if (legacy) {
      to = legacy[1] ?? '';
      text = legacy[2] ?? text;
      from = legacy[3] ?? '';
    }
  }
  const theme = (CARD_THEMES.some(t => t.id === item.phraseTheme) ? item.phraseTheme : 'marfil') as CardThemeId;
  return {
    text, to, from,
    font: item.phraseFont ?? 'Elegante/Cursiva',
    theme: theme === 'foto' && !item.cardBackgroundUrl ? 'marfil' : theme,
    photo: item.cardBackgroundUrl ?? null,
  };
}
