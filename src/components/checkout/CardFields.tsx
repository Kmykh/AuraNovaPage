"use client";

import React, { useEffect, useId, useRef, useState } from 'react';
import { AlertCircle, Loader2, Lock } from 'lucide-react';
import {
  CardPaymentMethod, IdentificationType, InstallmentOption, MercadoPagoInstance, SecureField, SecureFieldStyle, SecureFieldType,
} from '@/lib/mercadopago';
import { formatCurrency } from '@/lib/formatters';
import { CardPreview } from './CardPreview';
import { BrandLogo, brandFromMethod, CardBrand } from './PaymentIcons';

/** Desde este monto se ofrecen cuotas con tarjeta de crédito; en compras pequeñas solo estorban. */
export const INSTALLMENTS_FROM = 200;

export interface CardPaymentData {
  token: string;
  paymentMethodId: string;
  paymentTypeId: string;
  installments: number;
  identificationType: string;
  identificationNumber: string;
}

interface CardFieldsProps {
  mp: MercadoPagoInstance;
  amount: number;
  /** true mientras se crea el token y se cobra (la página se cubre con "Procesando…"). */
  onProcessing: (active: boolean) => void;
  onPay: (data: CardPaymentData) => Promise<void>;
}

/** Estilo del texto dentro de los campos seguros (el borde y el fondo los pone el contenedor). */
const FIELD_STYLE: SecureFieldStyle = {
  color: '#4a3933',
  placeholderColor: '#b7a9a0',
  fontFamily: 'Inter, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  fontSize: '16px',
};

const FIELD_ERRORS: Record<SecureFieldType, string> = {
  cardNumber: 'Revisa el número de la tarjeta.',
  expirationDate: 'Revisa la fecha de vencimiento (MM/AA).',
  securityCode: 'Revisa el código de seguridad.',
};

const ACCEPTED: CardBrand[] = ['visa', 'master', 'amex', 'diners'];

const FALLBACK_DOCUMENTS: IdentificationType[] = [
  { id: 'DNI', name: 'DNI', min_length: 8, max_length: 8 },
  { id: 'C.E', name: 'C.E', min_length: 8, max_length: 12 },
];

/**
 * Formulario de tarjeta con los campos seguros de Mercado Pago: el número, el vencimiento y el código
 * se escriben dentro de iframes de Mercado Pago y nunca pasan por Aura Nova. El resto (titular, documento
 * y cuotas) es nuestro, con el estilo de la tienda y una tarjeta que se va llenando mientras escribe.
 */
export function CardFields({ mp, amount, onProcessing, onPay }: CardFieldsProps) {
  const uid = useId().replace(/:/g, '');
  const containers: Record<SecureFieldType, string> = {
    cardNumber: `${uid}-number`,
    expirationDate: `${uid}-expiry`,
    securityCode: `${uid}-cvv`,
  };
  const fields = useRef<Partial<Record<SecureFieldType, SecureField>>>({});

  const [ready, setReady] = useState(false);
  const [focused, setFocused] = useState<SecureFieldType | null>(null);
  const [invalid, setInvalid] = useState<Partial<Record<SecureFieldType, boolean>>>({});
  const [touched, setTouched] = useState<Partial<Record<SecureFieldType, boolean>>>({});
  const [expiryReady, setExpiryReady] = useState(false);

  const [bin, setBin] = useState('');
  // Lo que respondió Mercado Pago para cada inicio de tarjeta (si cambia el número, deja de valer)
  const [lookup, setLookup] = useState<{ bin: string; method: CardPaymentMethod | null } | null>(null);
  const [holder, setHolder] = useState('');
  const [documents, setDocuments] = useState<IdentificationType[]>(FALLBACK_DOCUMENTS);
  const [documentType, setDocumentType] = useState('DNI');
  const [documentNumber, setDocumentNumber] = useState('');
  const [costs, setCosts] = useState<{ key: string; options: InstallmentOption[] } | null>(null);
  const [installments, setInstallments] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [paying, setPaying] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Campos seguros: se montan una vez (si cambia el monto no hace falta volver a crearlos)
  useEffect(() => {
    const created: SecureField[] = [];
    try {
      const make = (type: SecureFieldType, placeholder: string) => {
        const field = mp.fields.create(type, { placeholder, style: FIELD_STYLE }).mount(containers[type]);
        created.push(field);
        fields.current[type] = field;
        field.on('focus', () => setFocused(type));
        field.on('blur', () => {
          setFocused(current => (current === type ? null : current));
          setTouched(current => ({ ...current, [type]: true }));
        });
        field.on('validityChange', ({ errorMessages }) => {
          setInvalid(current => ({ ...current, [type]: errorMessages.length > 0 }));
          if (type === 'expirationDate') setExpiryReady(errorMessages.length === 0);
        });
        return field;
      };
      const number = make('cardNumber', '1234 1234 1234 1234');
      make('expirationDate', 'MM/AA');
      make('securityCode', '123');
      number.on('ready', () => setReady(true));
      number.on('binChange', ({ bin: value }) => setBin(value ?? ''));
    } catch {
      // Se avisa fuera del efecto (Mercado Pago no pudo crear los campos: bloqueador o sin conexión)
      queueMicrotask(() => setFormError('No pudimos cargar el formulario de tarjeta. Recarga la página.'));
    }
    return () => {
      created.forEach(field => {
        try { field.unmount(); } catch { /* ya no está en la página */ }
      });
      fields.current = {};
    };
    // Los ids de los contenedores no cambian (useId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mp]);

  // Tipos de documento de Perú (DNI, C.E, RUC…); si no responde, quedan DNI y C.E
  useEffect(() => {
    mp.getIdentificationTypes()
      .then(types => { if (types?.length) setDocuments(types); })
      .catch(() => {});
  }, [mp]);

  // Con los primeros dígitos Mercado Pago dice qué tarjeta es (Visa, Mastercard…, crédito o débito)
  useEffect(() => {
    if (bin.length < 6) return;
    let cancelled = false;
    mp.getPaymentMethods({ bin })
      .then(({ results }) => {
        if (cancelled) return;
        const found = results?.[0] ?? null;
        setLookup({ bin, method: found });
        const settings = found?.settings?.[0];
        if (settings) {
          fields.current.cardNumber?.update({ settings: settings.card_number });
          fields.current.securityCode?.update({ settings: settings.security_code });
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [bin, mp]);

  const method = bin.length >= 6 && lookup?.bin === bin ? lookup.method : null;
  const unknownCard = bin.length >= 6 && lookup?.bin === bin && !lookup.method;

  // Cuotas: solo con tarjeta de crédito y desde S/ 200
  const offersInstallments = method?.payment_type_id === 'credit_card' && amount >= INSTALLMENTS_FROM;
  const costsKey = `${bin}-${amount}`;
  useEffect(() => {
    if (!offersInstallments) return;
    let cancelled = false;
    mp.getInstallments({ amount: amount.toFixed(2), bin, paymentTypeId: 'credit_card' })
      .then(result => { if (!cancelled) setCosts({ key: costsKey, options: result?.[0]?.payer_costs ?? [] }); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [offersInstallments, costsKey, bin, amount, mp]);

  const payerCosts = offersInstallments && costs?.key === costsKey ? costs.options : [];
  const chosenInstallments = payerCosts.some(cost => cost.installments === installments) ? installments : 1;

  const selectedDocument = documents.find(d => d.id === documentType) ?? documents[0];
  const documentDigits = documentNumber.replace(/\s/g, '');
  const documentValid = documentDigits.length >= (selectedDocument?.min_length ?? 6) && documentDigits.length <= (selectedDocument?.max_length ?? 20);
  const holderValid = holder.trim().length >= 3;
  const brand = brandFromMethod(method?.id);

  const showFieldError = (type: SecureFieldType) => invalid[type] && (touched[type] || submitted);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setFormError(null);
    if (!holderValid || !documentValid) return;
    if (unknownCard) {
      setFormError('No reconocemos esta tarjeta. Prueba con otra o paga con Yape.');
      return;
    }

    setPaying(true);
    onProcessing(true);
    try {
      let token: { id: string };
      try {
        token = await mp.fields.createCardToken({
          cardholderName: holder.trim(),
          identificationType: selectedDocument?.id ?? documentType,
          identificationNumber: documentDigits,
        });
      } catch {
        onProcessing(false);
        setFormError('Revisa el número, el vencimiento y el código de la tarjeta.');
        return;
      }
      if (!method) {
        onProcessing(false);
        setFormError('Revisa el número de la tarjeta.');
        return;
      }
      await onPay({
        token: token.id,
        paymentMethodId: method.id,
        paymentTypeId: method.payment_type_id,
        installments: chosenInstallments,
        identificationType: selectedDocument?.id ?? documentType,
        identificationNumber: documentDigits,
      });
    } finally {
      setPaying(false);
    }
  };

  const box = (active: boolean, error: boolean) =>
    `relative h-12 rounded-2xl border bg-white px-4 transition [&_iframe]:h-full [&_iframe]:w-full ${
      error ? 'border-rose-300 ring-4 ring-rose-100' : active ? 'border-[#c8a96b] ring-4 ring-[#c8a96b]/15' : 'border-[#e8dcdc]'
    }`;
  const inputClass = (error: boolean) =>
    `h-12 w-full rounded-2xl border bg-white px-4 text-base text-[#4a3933] outline-none transition placeholder:text-[#b7a9a0] ${
      error ? 'border-rose-300 ring-4 ring-rose-100' : 'border-[#e8dcdc] focus:border-[#c8a96b] focus:ring-4 focus:ring-[#c8a96b]/15'
    }`;
  const label = 'mb-1.5 block text-xs font-bold text-[#887870]';
  const errorText = (text: string) => (
    <p className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-rose-600"><AlertCircle className="h-3.5 w-3.5" /> {text}</p>
  );

  return (
    <div className="@container">
      <div className="grid grid-cols-1 gap-6 @xl:grid-cols-[minmax(0,260px)_1fr] @xl:items-start @xl:gap-7">
        <div className="space-y-4 @xl:sticky @xl:top-28">
          <CardPreview brand={brand} bin={bin} holder={holder} expiryReady={expiryReady} flipped={focused === 'securityCode'} />
          <div className="flex items-center justify-center gap-2" aria-label="Tarjetas aceptadas">
            {ACCEPTED.map(item => (
              <span key={item} className={`transition ${brand && brand !== item ? 'opacity-25 grayscale' : ''}`}>
                <BrandLogo brand={item} className="h-6 w-auto rounded-[4px] shadow-[0_0_0_1px_#efe6dd]" />
              </span>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <span className={label}>Número de la tarjeta</span>
            <div className={box(focused === 'cardNumber', !!showFieldError('cardNumber') || unknownCard)}>
              <div id={containers.cardNumber} className="h-full pr-12" />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                {brand && <BrandLogo brand={brand} className="h-6 w-auto rounded-[4px] shadow-[0_0_0_1px_#efe6dd]" />}
              </span>
              {!ready && <span className="absolute inset-2 animate-pulse rounded-xl bg-[#faf7f2]" />}
            </div>
            {unknownCard ? errorText('No reconocemos esta tarjeta.') : showFieldError('cardNumber') && errorText(FIELD_ERRORS.cardNumber)}
            {method && !unknownCard && (
              <p className="mt-1.5 text-xs text-[#887870]">{method.payment_type_id === 'debit_card' ? 'Tarjeta de débito' : 'Tarjeta de crédito'}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className={label}>Vencimiento</span>
              <div className={box(focused === 'expirationDate', !!showFieldError('expirationDate'))}>
                <div id={containers.expirationDate} className="h-full" />
              </div>
              {showFieldError('expirationDate') && errorText('Revisa la fecha.')}
            </div>
            <div>
              <span className={label}>Código de seguridad</span>
              <div className={box(focused === 'securityCode', !!showFieldError('securityCode'))}>
                <div id={containers.securityCode} className="h-full" />
              </div>
              {showFieldError('securityCode') && errorText('Revisa el código.')}
            </div>
          </div>

          <label className="block">
            <span className={label}>Nombre del titular</span>
            <input
              value={holder}
              onChange={e => setHolder(e.target.value.replace(/[^\p{L} .'-]/gu, ''))}
              autoComplete="cc-name"
              maxLength={60}
              placeholder="Como aparece en la tarjeta"
              className={inputClass(submitted && !holderValid)}
            />
            {submitted && !holderValid && errorText('Escribe el nombre como aparece en la tarjeta.')}
          </label>

          <div>
            <span className={label}>Documento del titular</span>
            <div className={`flex h-12 overflow-hidden rounded-2xl border bg-white transition focus-within:border-[#c8a96b] focus-within:ring-4 focus-within:ring-[#c8a96b]/15 ${submitted && !documentValid ? 'border-rose-300 ring-4 ring-rose-100' : 'border-[#e8dcdc]'}`}>
              <select
                value={documentType}
                onChange={e => setDocumentType(e.target.value)}
                aria-label="Tipo de documento"
                className="border-r border-[#efe6dd] bg-[#fdfbf8] px-3 text-sm font-semibold text-[#4a3933] outline-none"
              >
                {documents.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <input
                value={documentNumber}
                onChange={e => setDocumentNumber(e.target.value.replace(/[^\dA-Za-z]/g, ''))}
                inputMode={documentType === 'DNI' ? 'numeric' : 'text'}
                maxLength={selectedDocument?.max_length ?? 20}
                placeholder={documentType === 'DNI' ? '8 dígitos' : 'Número'}
                aria-label="Número de documento"
                className="min-w-0 flex-1 px-4 text-base text-[#4a3933] outline-none placeholder:text-[#b7a9a0]"
              />
            </div>
            {submitted && !documentValid && errorText(documentType === 'DNI' ? 'El DNI tiene 8 dígitos.' : 'Revisa el número de documento.')}
          </div>

          {offersInstallments && payerCosts.length > 1 && (
            <label className="block">
              <span className={label}>Cuotas</span>
              <select
                value={chosenInstallments}
                onChange={e => setInstallments(Number(e.target.value))}
                className="h-12 w-full rounded-2xl border border-[#e8dcdc] bg-white px-4 text-base text-[#4a3933] outline-none focus:border-[#c8a96b] focus:ring-4 focus:ring-[#c8a96b]/15"
              >
                {payerCosts.map(cost => <option key={cost.installments} value={cost.installments}>{cost.recommended_message}</option>)}
              </select>
              <span className="mt-1.5 block text-xs text-[#887870]">Si tu banco cobra intereses por las cuotas, los verás en tu estado de cuenta.</span>
            </label>
          )}

          {formError && (
            <p className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-700" role="alert">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={!ready || paying}
            className="flex h-13 w-full items-center justify-center gap-2 rounded-full bg-[#4a3933] text-sm font-bold text-white shadow-lg shadow-[#4a3933]/20 transition hover:bg-[#3a2d28] disabled:opacity-50"
          >
            {paying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />} Pagar {formatCurrency(amount)}
          </button>
        </form>
      </div>
    </div>
  );
}
