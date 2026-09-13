import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Lock, ArrowLeft, Shield, EyeOff, FileText, UserCheck, MessageCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Política de Privacidad | Aura Nova',
  description: 'Conoce cómo protegemos y cuidamos tus datos personales en Aura Nova.',
};

export default function PrivacidadPage() {
  const sections = [
    {
      icon: Shield,
      title: '1. Compromiso de Privacidad',
      content: [
        'En Aura Nova valoramos profundamente tu confianza. Esta Política de Privacidad describe cómo recopilamos, utilizamos, almacenamos y protegemos la información personal que nos proporcionas al realizar pedidos o interactuar con nuestra tienda web y canales oficiales.',
      ],
    },
    {
      icon: FileText,
      title: '2. Información que Recopilamos',
      content: [
        'Datos del comprador y destinatario: Nombres, apellidos, número de teléfono (para coordinación vía WhatsApp), dirección física de entrega y referencias de ubicación.',
        'Datos del pedido: Dedicatorias para tarjetas, notas de regalo y preferencias específicas de flores o detalles.',
        'Comprobantes de pago: Capturas de transferencias o pagos por Yape/Plin requeridos únicamente para validar la transacción.',
      ],
    },
    {
      icon: Lock,
      title: '3. Finalidad del Uso de Datos',
      content: [
        'Gestión de pedidos: Confeccionar el detalle seleccionado y coordinar la entrega eficiente con el repartidor o agencia.',
        'Atención y seguimiento: Enviar notificaciones sobre el estado de tu pedido (preparación, en ruta, entregado) y resolver dudas.',
        'No vendemos ni transferimos tus datos a terceros con fines publicitarios o comerciales ajenos a Aura Nova.',
      ],
    },
    {
      icon: EyeOff,
      title: '4. Confidencialidad de Mensajes y Dedicatorias',
      content: [
        'Entendemos que los regalos contienen emociones y palabras íntimas. Tratamos con absoluta reserva y discreción cualquier dedicatoria, carta o mensaje especial que nos confíes para adjuntar en tus obsequios.',
      ],
    },
    {
      icon: UserCheck,
      title: '5. Derechos del Titular de Datos',
      content: [
        'Puedes solicitar en cualquier momento la rectificación, actualización o eliminación de tus datos personales de nuestros registros comunicándote directamente a través de nuestro WhatsApp oficial o correo de contacto.',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#faf7f2] pt-28 sm:pt-32 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navegación y Encabezado */}
        <div>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brown/70 hover:text-brown transition-colors mb-6 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Volver al inicio</span>
          </Link>

          <div className="space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#c8a96b] block">
              Protección de Datos
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-brown">
              Política de Privacidad
            </h1>
            <p className="text-sage text-sm sm:text-base max-w-2xl leading-relaxed">
              Tu tranquilidad es fundamental para nosotros. Aquí te explicamos de manera transparente cómo cuidamos de tu información en cada entrega.
            </p>
          </div>
        </div>

        {/* Lista de Secciones */}
        <div className="space-y-6">
          {sections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <div 
                key={idx}
                className="bg-white/80 backdrop-blur-md rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-[#c8a96b]/20 shadow-[0_4px_25px_rgba(0,0,0,0.02)] space-y-3.5 transition-all hover:border-[#c8a96b]/40"
              >
                <div className="flex items-center gap-3 text-brown">
                  <div className="w-10 h-10 rounded-xl bg-[#c8a96b]/15 text-brown flex items-center justify-center shrink-0 border border-[#c8a96b]/30">
                    <Icon size={20} className="text-[#c8a96b]" />
                  </div>
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-brown">
                    {section.title}
                  </h2>
                </div>

                <div className="pl-0 sm:pl-13 space-y-2 text-sm text-brown/80 leading-relaxed">
                  {section.content.map((paragraph, pIdx) => (
                    <p key={pIdx}>{paragraph}</p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Tarjeta de Contacto */}
        <div className="bg-gradient-to-br from-[#4a3933] to-[#2d221e] text-[#faf7f2] rounded-3xl p-6 sm:p-8 border border-[#c8a96b]/30 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center sm:text-left">
            <h3 className="font-serif font-bold text-lg sm:text-xl text-white">
              ¿Deseas consultar sobre tus datos?
            </h3>
            <p className="text-xs sm:text-sm text-stone-300">
              Escríbenos por WhatsApp y te ayudaremos con cualquier solicitud sobre tu información.
            </p>
          </div>

          <a
            href="https://wa.me/51987654321?text=Hola%20Aura%20Nova,%20tengo%20una%20consulta%20sobre%20la%20política%20de%20privacidad"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#c8a96b] hover:bg-[#b89759] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shrink-0"
          >
            <MessageCircle size={16} />
            <span>Contáctanos en WhatsApp</span>
          </a>
        </div>

        <div className="text-center pt-2 text-xs text-sage">
          Última actualización: Septiembre 2026 • Aura Nova Perú
        </div>

      </div>
    </div>
  );
}
