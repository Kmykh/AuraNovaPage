"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, ChevronDown, CreditCard, Mail, MapPin, MessageCircle, PackageSearch, Truck } from 'lucide-react';
import { useBusinessSettings } from '@/hooks/use-info';

import flo4 from '../images/flo4.png';
import flo from '../images/flo.png';

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
        <header className="mx-auto mb-10 max-w-2xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#c8a96b]">Contacto</p>
          <h2 className="mt-2 font-serif text-4xl font-bold leading-tight text-brown sm:text-5xl">
            Hablemos de tu <span className="font-light italic text-rose">detalle</span>
          </h2>
          <p className="mt-3 text-base text-brown/70">
            Cuéntanos qué buscas, para quién y para cuándo. Te respondemos por WhatsApp.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          {/* WhatsApp */}
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#1f7a4a] to-[#25a35e] p-6 text-white shadow-[0_24px_50px_-24px_rgba(31,122,74,0.6)] sm:p-8 lg:col-span-3">
            <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10" />
            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
                <span className="h-2 w-2 rounded-full bg-[#9ef5c2]" /> WhatsApp
              </span>
              <p className="mt-4 font-serif text-3xl font-bold sm:text-4xl">{display}</p>
              <p className="mt-1 text-sm text-white/80">La forma más rápida de resolver tus dudas y coordinar tu pedido.</p>

              <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">Empieza con un mensaje</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {STARTERS.map(s => (
                  <a
                    key={s.label}
                    href={whatsappHref(number, s.message)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-white/15 px-3.5 py-2 text-xs font-semibold backdrop-blur transition hover:bg-white hover:text-[#1f7a4a]"
                  >
                    {s.label}
                  </a>
                ))}
              </div>

              <a
                href={whatsappHref(number, '¡Hola Aura Nova! Tengo una consulta.')}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-bold text-[#1f7a4a] shadow-lg transition hover:-translate-y-0.5"
              >
                <MessageCircle className="h-5 w-5" /> Escribir por WhatsApp
              </a>
            </div>
          </div>

          {/* Otros canales */}
          <div className="grid grid-cols-2 gap-3 lg:col-span-2 lg:grid-cols-1">
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
          </div>
        </div>

        {/* Datos útiles */}
        <ul className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
          <InfoItem icon={MapPin} title="Huancayo, Junín" text="Taller y delivery por zonas" />
          <InfoItem icon={Truck} title="Envíos a todo el Perú" text="Por Shalom u Olva" />
          <InfoItem icon={CreditCard} title="Paga con tarjeta o Yape" text="50% de adelanto o el total" />
        </ul>

        {withFaq && (
          <div className="mx-auto mt-14 max-w-3xl">
            <h3 className="text-center font-serif text-3xl font-bold text-brown">Preguntas frecuentes</h3>
            <div className="mt-6 space-y-2.5">
              {FAQS.map((faq, index) => <FaqItem key={faq.q} question={faq.q} answer={faq.a} defaultOpen={index === 0} />)}
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

function FaqItem({ question, answer, defaultOpen }: { question: string; answer: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className={`overflow-hidden rounded-2xl border bg-white transition ${open ? 'border-[#c8a96b]/40 shadow-sm' : 'border-[#ece3da]'}`}>
      <button type="button" onClick={() => setOpen(o => !o)} aria-expanded={open} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
        <span className="font-semibold text-brown">{question}</span>
        <ChevronDown className={`h-5 w-5 shrink-0 text-[#b08a4e] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <p className="px-5 pb-5 text-sm leading-relaxed text-[#6b5a50]">{answer}</p>}
    </div>
  );
}
