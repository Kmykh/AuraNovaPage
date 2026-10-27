import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Menu } from 'lucide-react';
import { YapeLogo } from '@/components/checkout/PaymentIcons';
import { MercadoPagoLogo } from '@/components/checkout/MercadoPagoLogo';
import yapeOnline from '../images/yape-online.jpg';

const STEPS = [
  { title: 'Elige Yape al pagar', text: 'En la página de pago de tu pedido.' },
  { title: 'Saca tu código', text: 'En tu app: menú → Código de aprobación.' },
  { title: 'Escribe celular y código', text: 'Y listo: se confirma al instante.' },
];

/** Anuncio en el inicio: ya se puede pagar con Yape en la web (por Mercado Pago). */
export function YapeOnlineSection() {
  return (
    <section className="relative z-10 px-6 py-14 md:py-20" aria-labelledby="yape-online-title">
      {/* Sin caja: la imagen y el texto van directo sobre el fondo de la página */}
      <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:gap-16">
        <div className="relative">
          <div className="pointer-events-none absolute -inset-10 rounded-full bg-[radial-gradient(circle,rgba(116,34,132,0.18),rgba(32,211,194,0.12)_45%,transparent_70%)] blur-2xl" />
          <Image
            src={yapeOnline}
            alt="Ya puedes yapear online en auranovaoficial.com con tu código de aprobación"
            sizes="(min-width: 768px) 480px, 100vw"
            className="relative mx-auto w-full max-w-[440px] rounded-[2rem] shadow-[0_24px_50px_-24px_rgba(116,34,132,0.7)]"
            placeholder="blur"
          />
        </div>

        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#742284]/10 py-1 pl-1 pr-3 text-xs font-bold text-[#742284]">
            <YapeLogo className="h-6 w-6" /> Nuevo en Aura Nova
          </span>
          <h2 id="yape-online-title" className="mt-4 font-serif text-4xl font-bold leading-tight text-[#4a3933] md:text-5xl">
            Ya puedes pagar con <span className="text-[#742284]">Yape</span> online
          </h2>
          <p className="mt-3 max-w-lg text-base leading-relaxed text-[#6b5a50]">
            Paga tu pedido aquí mismo con tu celular Yape y el código de aprobación de tu app. Sin capturas ni esperas: el 50 % de adelanto o el total, como prefieras.
          </p>

          <ol className="mt-6 space-y-3">
            {STEPS.map((step, index) => (
              <li key={step.title} className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#742284] text-sm font-bold text-white shadow-sm shadow-[#742284]/30">
                  {index === 1 ? <Menu className="h-4 w-4" /> : index + 1}
                </span>
                <span>
                  <span className="block text-sm font-bold text-[#4a3933]">{step.title}</span>
                  <span className="block text-sm text-[#887870]">{step.text}</span>
                </span>
              </li>
            ))}
          </ol>

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Link href="/productos" className="inline-flex h-12 items-center gap-2 rounded-full bg-[#4a3933] px-6 text-sm font-bold text-white shadow-lg shadow-[#4a3933]/20 transition hover:bg-[#3a2d28]">
              Elegir mi detalle <ArrowRight className="h-4 w-4" />
            </Link>
            <span className="flex items-center gap-1.5 text-xs text-[#887870]">
              <MercadoPagoLogo className="h-4 w-4" /> Pago seguro con Mercado Pago
            </span>
          </div>
          <p className="mt-4 text-[11px] text-[#a3958c]">Disponible para yaperos BCP y Yape con DNI.</p>
        </div>
      </div>
    </section>
  );
}
