import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ShieldCheck, ArrowLeft, Clock, CreditCard, Truck, RefreshCw, Sparkles, MessageCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Términos y Condiciones | Aura Nova',
  description: 'Conoce los términos y condiciones de compra, pedidos personalizados y envíos de Aura Nova.',
};

export default function TerminosPage() {
  const sections = [
    {
      icon: Sparkles,
      title: '1. Naturaleza Artesanal y Personalizada',
      content: [
        'En Aura Nova elaboramos arreglos florales, detalles botánicos y obsequios de forma artesanal y personalizada.',
        'Debido al origen natural y la manufactura a mano de nuestros productos, pueden existir leves variaciones estéticas respecto a las imágenes referenciales del catálogo, garantizando siempre la misma o superior calidad y frescura de los insumos.',
      ],
    },
    {
      icon: Clock,
      title: '2. Proceso de Pedidos y Tiempos de Elaboración',
      content: [
        'Los pedidos de catálogo deben realizarse con al menos 24 a 48 horas de anticipación según la disponibilidad de fechas.',
        'Para pedidos personalizados o fechas especiales (San Valentín, Día de la Madre, etc.), recomendamos realizar la reserva con un mínimo de 3 a 5 días de antelación para asegurar insumos y cupo de entrega.',
      ],
    },
    {
      icon: CreditCard,
      title: '3. Precios y Formas de Pago',
      content: [
        'Todos los precios están expresados en Soles Peruanos (S/). El costo del envío se cotiza por separado según la dirección o modalidad seleccionada.',
        'Aceptamos pagos a través de Yape, Plin y transferencias bancarias directas (BCP, BBVA, Interbank).',
        'La elaboración de cualquier pedido personalizado inicia únicamente una vez confirmado el abono correspondiente y verificado el comprobante de pago.',
      ],
    },
    {
      icon: Truck,
      title: '4. Envíos y Modalidades de Entrega',
      content: [
        'Delivery Directo: Se entrega en la dirección indicada dentro del rango horario coordinado. Es responsabilidad del cliente asegurar que haya una persona autorizada para recibir el pedido.',
        'Puntos de Encuentro: Entregas gratuitas o de costo reducido en estaciones y puntos acordados, con una tolerancia máxima de espera de 15 minutos.',
        'Envíos a Provincias: Se despachan debidamente embalados a través de agencias de encomienda (Shalom, Olva Courier u otras). Los tiempos de traslado dependen de la agencia elegida.',
      ],
    },
    {
      icon: RefreshCw,
      title: '5. Cancelaciones, Cambios y Devoluciones',
      content: [
        'Por la naturaleza perecible y personalizada de nuestros productos, no se aceptan devoluciones de dinero una vez iniciada la confección del arreglo.',
        'Las reprogramaciones de fecha deben solicitarse con al menos 24 horas de anticipación a la fecha de entrega original, sujetas a disponibilidad de agenda.',
        'En el improbable caso de que un producto llegue dañado por transporte propio, el cliente debe reportarlo de inmediato vía WhatsApp al momento de la recepción con foto y video para brindarle una solución pronta.',
      ],
    },
    {
      icon: ShieldCheck,
      title: '6. Garantía de Calidad y Cuidados',
      content: [
        'Aura Nova se compromete a entregar flores e insumos en óptimas condiciones. Junto con tu pedido te brindamos recomendaciones de conservación para prolongar la vida y brillo de tu detalle.',
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
              Información Legal
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-brown">
              Términos y Condiciones
            </h1>
            <p className="text-sage text-sm sm:text-base max-w-2xl leading-relaxed">
              Te agradecemos elegir Aura Nova. A continuación detallamos las condiciones que rigen nuestras ventas, pedidos personalizados y entregas.
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

        {/* Tarjeta de Contacto para dudas */}
        <div className="bg-gradient-to-br from-[#4a3933] to-[#2d221e] text-[#faf7f2] rounded-3xl p-6 sm:p-8 border border-[#c8a96b]/30 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center sm:text-left">
            <h3 className="font-serif font-bold text-lg sm:text-xl text-white">
              ¿Tienes alguna duda sobre tu pedido?
            </h3>
            <p className="text-xs sm:text-sm text-stone-300">
              Estamos a tu disposición en WhatsApp para responder cualquier consulta previa a tu compra.
            </p>
          </div>

          <a
            href="https://wa.me/51987654321?text=Hola%20Aura%20Nova,%20tengo%20una%20consulta%20sobre%20los%20términos%20y%20condiciones"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#c8a96b] hover:bg-[#b89759] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shrink-0"
          >
            <MessageCircle size={16} />
            <span>Consultar por WhatsApp</span>
          </a>
        </div>

        <div className="text-center pt-2 text-xs text-sage">
          Última actualización: Septiembre 2026 • Aura Nova Perú
        </div>

      </div>
    </div>
  );
}
