"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, CreditCard, Mail, MapPin, MessageCircle, PackageSearch, Plus, Truck } from 'lucide-react';
import { useBusinessSettings } from '@/hooks/use-info';
import { Reveal } from '@/components/motion/Reveal';
import { BotanicalSprig, FlowerGlyph } from '@/components/motion/BotanicalSprig';

import flo4 from '../images/flo4.png';
import flo from '../images/flo.png';
import flo1 from '../images/flo1.png';
import flo5 from '../images/flo5.png';
import angeles from '../images/angeles.png';

const EMAIL = 'auranova1606@gmail.com';
const INSTAGRAM = 'https://www.instagram.com/auranova122?igsh=bGsxamJ5bTgwdzhu';
const TIKTOK = 'https://www.tiktok.com/@aura.nova40?_r=1&_t=ZS-9937jDsFvbV';

/** Mensajes listos: el cliente toca uno y llega a WhatsApp con la pregunta escrita. */
const STARTERS = [
  { label: 'Quiero un ramo personalizado', message: 'Hola Aura Nova, quiero un ramo personalizado. ¿Me ayudan a armarlo?' },
  { label: '¿Envían a mi ciudad?', message: 'Hola Aura Nova, ¿hacen envíos a mi ciudad? Estoy en ' },
  { label: 'Consulta sobre mi pedido', message: 'Hola Aura Nova, tengo una consulta sobre mi pedido ' },
  { label: 'Detalles para un evento', message: 'Hola Aura Nova, quisiera cotizar detalles para un evento.' },
];

const FAQS = [
  {
    q: '¿Cómo pago mi pedido?',
    a: 'En la web, con tarjeta o Yape a través de Mercado Pago. Puedes pagar el 50% de adelanto y el resto antes de la entrega, o el total de una vez.',
  },
  {
    q: '¿Hacen delivery y envíos a provincia?',
    a: 'En Huancayo tenemos delivery por zonas y puntos de encuentro. A todo el Perú enviamos por agencia (Shalom u Olva); el flete lo pagas al recoger.',
  },
  {
    q: '¿Cómo sé en qué va mi pedido?',
    a: 'Al confirmar tu compra recibes un código de seguimiento por correo. Con él ves cada paso en la página de Seguimiento, desde el taller hasta la entrega.',
  },
  {
    q: '¿Pueden hacer un diseño a mi gusto?',
    a: 'Sí. En "Personalizado" nos cuentas tu idea con fotos de referencia y te enviamos una cotización; si la aceptas, pagas desde la web.',
  },
  {
    q: '¿Qué pasa si mi pedido se cancela?',
    a: 'Te devolvemos lo que pagaste al mismo medio (tarjeta o Yape) y lo ves reflejado en tu seguimiento.',
  },
];

function whatsappHref(number: string, message: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/** Contacto: WhatsApp primero (con mensajes listos), redes y correo; en su propia página también las preguntas frecuentes. */
export function ContactSection({ withFaq = false }: { withFaq?: boolean }) {
  const { data: settings } = useBusinessSettings();
  const number = (settings?.whatsappNumber || '51950482596').replace(/\D/g, '');
  const display = number.length === 11 ? `+${number.slice(0, 2)} ${number.slice(2, 5)} ${number.slice(5, 8)} ${number.slice(8)}` : number;

  return (
    <section id="contacto" className="relative scroll-mt-24 overflow-x-clip py-14 md:py-20">
      <div className="pointer-events-none absolute right-0 top-0 w-[340px] translate-x-1/3 -translate-y-1/4 opacity-25 mix-blend-multiply animate-spin-slow">
        <Image src={flo4} alt="" width={340} height={340} style={{ width: 'auto', height: 'auto' }} />
      </div>
      <div className="pointer-events-none absolute bottom-10 left-4 w-[140px] opacity-30 mix-blend-multiply animate-float-delayed">
        <Image src={flo} alt="" width={140} height={140} style={{ width: 'auto', height: 'auto' }} />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal as="div" className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#c8a96b]">Contacto</p>
          <h2 className="mt-2 font-serif text-4xl font-bold leading-tight text-brown sm:text-6xl">
            Hablemos de tu <span className="font-light italic text-rose">detalle</span>
          </h2>
          <BotanicalSprig className="mx-auto mt-3 h-9 w-44" />
          <p className="mt-3 text-base text-brown/70">
            Cuéntanos qué buscas, para quién y para cuándo. Te respondemos por WhatsApp.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          {/* WhatsApp: postal con los colores de la marca */}
          <Reveal variant="left" className="lg:col-span-3">
            <div className="relative h-full overflow-hidden rounded-[2rem] border border-[#e8c98a]/60 bg-[#fffaf3] p-6 shadow-[0_30px_60px_-36px_rgba(74,57,51,0.55)] sm:p-9">
              {/* Marco punteado y acuarela */}
              <div className="pointer-events-none absolute inset-3 rounded-[1.6rem] border border-dashed border-[#c8a96b]/35" />
              <div className="pointer-events-none absolute -bottom-16 -right-14 w-64 animate-float-gentle opacity-90 mix-blend-multiply sm:w-80">
                <Image src={flo1} alt="" width={320} height={320} style={{ width: 'auto', height: 'auto' }} />
              </div>
              {/* Estampilla */}
              <div className="absolute right-6 top-6 hidden rotate-6 sm:block">
                {/* Estampilla: borde dentado con puntos del color del papel */}
                <div className="relative h-[6.5rem] w-[5.25rem] rounded-[3px] bg-white p-2 shadow-md ring-[3px] ring-white [outline:3px_dotted_#fffaf3] [outline-offset:-1px]">
                  <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden border border-[#c8a96b]/40 bg-gradient-to-b from-[#fdf0f2] to-[#fbe6d6]">
                    <Image src={flo5} alt="" width={90} height={90} className="w-[105%] max-w-none mix-blend-multiply" style={{ height: 'auto' }} />
                    <span className="absolute bottom-1 font-serif text-[9px] font-bold text-[#8f6d28]">Aura Nova</span>
                    <span className="absolute right-1 top-0.5 font-serif text-[9px] font-bold text-[#c06b7d]">S/ ♥</span>
                  </div>
                </div>
              </div>

              <div className="relative max-w-lg">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#25D366]/30 bg-[#effbf3] px-3 py-1 text-xs font-bold text-[#1f7a4a]">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#25D366]" />
                  </span>
                  WhatsApp · te respondemos aquí
                </span>
                <p className="mt-5 font-serif text-4xl font-bold tracking-tight text-[#4a3933] sm:text-5xl">{display}</p>
                <p className="mt-2 text-sm text-[#887870]">La forma más rápida de resolver tus dudas y coordinar tu pedido.</p>

                <p className="mt-7 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#b08a4e]">
                  <FlowerGlyph className="h-3.5 w-3.5" color="#e9a4b4" /> Empieza con un mensaje
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {STARTERS.map(s => (
                    <a
                      key={s.label}
                      href={whatsappHref(number, s.message)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-[#c8a96b]/35 bg-white/90 px-3.5 py-2 text-xs font-semibold text-[#5e4a42] transition hover:-translate-y-0.5 hover:border-[#4a3933] hover:bg-[#4a3933] hover:text-white"
                    >
                      {s.label}
                    </a>
                  ))}
                </div>

                <a
                  href={whatsappHref(number, '¡Hola Aura Nova! Tengo una consulta.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mt-7 inline-flex h-12 items-center gap-2.5 rounded-full bg-[#1f9d55] px-6 text-sm font-bold text-white shadow-lg shadow-[#1f9d55]/25 transition hover:-translate-y-0.5 hover:bg-[#1a8a4a]"
                >
                  <MessageCircle className="h-5 w-5" /> Escribir por WhatsApp
                  <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              </div>
            </div>
          </Reveal>

          {/* Otros canales */}
          <Reveal variant="right" delay={150} className="grid grid-cols-2 gap-3 lg:col-span-2 lg:grid-cols-1">
            <ChannelCard
              href={INSTAGRAM}
              label="Instagram"
              detail="Fotos de nuestros trabajos"
              className="hover:border-[#e1306c]/40"
              icon={(
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-[#e1306c]" aria-hidden>
                  <path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.2-4.35-2.62-6.78-6.98-6.98C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 100 12.32 6.16 6.16 0 000-12.32zM12 16a4 4 0 110-8 4 4 0 010 8zm6.41-11.85a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z" />
                </svg>
              )}
            />
            <ChannelCard
              href={TIKTOK}
              label="TikTok"
              detail="Lives con ofertas"
              className="hover:border-[#4a3933]/30"
              icon={(
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-[#1a1412]" aria-hidden>
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.48 6.28 6.28 0 001.82-4.49V8.76a8.26 8.26 0 004.82 1.55V6.86a4.84 4.84 0 01-1.06-.17z" />
                </svg>
              )}
            />
            <ChannelCard href={`mailto:${EMAIL}`} label="Correo" detail={EMAIL} icon={<Mail className="h-5 w-5 text-[#b08a4e]" />} className="hover:border-[#c8a96b]/50" external={false} />
            <ChannelCard href="/seguimiento" label="Mi pedido" detail="Ver en qué va con tu código" icon={<PackageSearch className="h-5 w-5 text-[#d38b8b]" />} className="hover:border-[#d38b8b]/40" external={false} internal />
          </Reveal>
        </div>

        {/* Datos útiles */}
        <ul className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
          <InfoItem icon={MapPin} title="Huancayo, Junín" text="Taller y delivery por zonas" />
          <InfoItem icon={Truck} title="Envíos a todo el Perú" text="Por Shalom u Olva" />
          <InfoItem icon={CreditCard} title="Paga con tarjeta o Yape" text="50% de adelanto o el total" />
        </ul>

        {withFaq && (
          <div className="mt-20 grid grid-cols-1 gap-10 lg:grid-cols-5 lg:gap-14">
            <Reveal variant="left" className="lg:col-span-2">
              <div className="lg:sticky lg:top-28">
                <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#c8a96b]">Dudas</p>
                <h3 className="mt-2 font-serif text-4xl font-bold leading-tight text-brown sm:text-5xl">
                  Preguntas <span className="font-light italic text-rose">frecuentes</span>
                </h3>
                <p className="mt-3 text-brown/70">Lo que más nos preguntan antes de pedir.</p>

                <div className="relative mt-8 hidden aspect-[4/3] overflow-hidden rounded-t-[999px] border border-[#e8c98a]/50 bg-gradient-to-b from-[#fdf3ea] to-[#f6e8e3] lg:block">
                  <div className="absolute inset-3 rounded-t-[999px] border border-[#c8a96b]/30" />
                  <Image src={angeles} alt="" width={520} height={390} className="absolute inset-x-0 bottom-0 mx-auto w-[92%] animate-float-gentle object-contain mix-blend-multiply" style={{ height: 'auto' }} />
                </div>

                <a
                  href={whatsappHref(number, 'Hola Aura Nova, tengo una pregunta: ')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mt-5 flex items-center gap-3 rounded-[1.5rem] border border-[#ece3da] bg-white p-4 transition hover:-translate-y-0.5 hover:border-[#25D366]/50"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#effbf3] text-[#1f9d55]"><MessageCircle className="h-5 w-5" /></span>
                  <span className="flex-1">
                    <span className="block font-bold text-brown">¿No está tu pregunta?</span>
                    <span className="block text-xs text-sage">Escríbenos y te respondemos.</span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-sage transition group-hover:text-brown" />
                </a>
              </div>
            </Reveal>

            <div className="space-y-3 lg:col-span-3">
              {FAQS.map((faq, index) => (
                <Reveal key={faq.q} delay={index * 90}>
                  <FaqItem number={index + 1} question={faq.q} answer={faq.a} defaultOpen={index === 0} />
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function ChannelCard({ href, label, detail, icon, className, external = true, internal = false }: {
  href: string; label: string; detail: string; icon: React.ReactNode; className?: string; external?: boolean; internal?: boolean;
}) {
  const content = (
    <>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#faf7f2]">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-brown">{label}</span>
        <span className="block truncate text-xs text-sage">{detail}</span>
      </span>
      <ArrowUpRight className="hidden h-4 w-4 shrink-0 text-sage transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brown sm:block" />
    </>
  );
  const cls = `group flex flex-col items-start gap-3 rounded-[1.5rem] border border-[#ece3da] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 sm:flex-row sm:items-center ${className ?? ''}`;
  return internal
    ? <Link href={href} className={cls}>{content}</Link>
    : <a href={href} className={cls} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{content}</a>;
}

function InfoItem({ icon: Icon, title, text }: { icon: React.ElementType; title: string; text: string }) {
  return (
    <li className="flex items-center gap-3 rounded-[1.25rem] bg-white/70 px-4 py-3">
      <Icon className="h-5 w-5 shrink-0 text-[#c8a96b]" />
      <span>
        <span className="block font-semibold text-brown">{title}</span>
        <span className="block text-xs text-sage">{text}</span>
      </span>
    </li>
  );
}

function FaqItem({ number, question, answer, defaultOpen }: { number: number; question: string; answer: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className={`relative overflow-hidden rounded-[1.5rem] border bg-white transition-all duration-300 ${open ? 'border-[#c8a96b]/50 shadow-[0_20px_40px_-30px_rgba(74,57,51,0.5)]' : 'border-[#ece3da] hover:border-[#c8a96b]/40'}`}>
      <span className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#e8c98a] to-[#e9a4b4] transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`} />
      <button type="button" onClick={() => setOpen(o => !o)} aria-expanded={open} className="flex w-full items-center gap-4 px-5 py-5 text-left sm:px-6">
        <span className={`font-serif text-lg font-bold transition-colors ${open ? 'text-[#c06b7d]' : 'text-[#d9c7b8]'}`}>{String(number).padStart(2, '0')}</span>
        <span className="flex-1 font-semibold text-brown sm:text-lg">{question}</span>
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${open ? 'rotate-45 bg-[#4a3933] text-white' : 'bg-[#faf7f2] text-[#b08a4e]'}`}>
          <Plus className="h-4 w-4" />
        </span>
      </button>
      {/* La respuesta se despliega suave (grid de 0fr a 1fr) */}
      <div className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <p className="pb-6 pl-[3.6rem] pr-6 text-sm leading-relaxed text-[#6b5a50] sm:text-base">{answer}</p>
        </div>
      </div>
    </div>
  );
}
