"use client";

import React, { useRef, useState } from 'react';
import { AlertCircle, Loader2, Menu } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { YapeLogo } from './PaymentIcons';

const CODE_LENGTH = 6;

interface YapeFormProps {
  amount: number;
  disabled?: boolean;
  /** Paga con el celular y el código; devuelve true si se aprobó (si no, se borra el código para escribir uno nuevo). */
  onPay: (phone: string, code: string) => Promise<boolean>;
}

/** "949 930 037": el celular en grupos de 3 mientras se escribe. */
const formatPhone = (digits: string) => digits.replace(/(\d{3})(?=\d)/g, '$1 ').trim();

/**
 * Pago con Yape: el cliente escribe su celular Yape y el código de aprobación de su app.
 * No se rellena nada solo: el número del pedido no siempre es el de su Yape y el cobro fallaba.
 */
export function YapeForm({ amount, disabled, onPay }: YapeFormProps) {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [paying, setPaying] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const boxes = useRef<(HTMLInputElement | null)[]>([]);
  // Bloqueo inmediato: el estado tarda un render y un doble toque mandaba dos cobros
  const sending = useRef(false);

  // 9 dígitos, como valida el backend (los números de prueba de Mercado Pago no empiezan con 9)
  const phoneValid = /^\d{9}$/.test(phone);
  const codeValue = code.join('');
  const codeValid = codeValue.length === CODE_LENGTH;

  const focusBox = (index: number) => boxes.current[Math.max(0, Math.min(CODE_LENGTH - 1, index))]?.focus();

  // Escribir, pegar el código completo o borrar hacia atrás, casilla por casilla
  const fillFrom = (start: number, digits: string) => {
    const next = [...code];
    digits.slice(0, CODE_LENGTH - start).split('').forEach((digit, offset) => { next[start + offset] = digit; });
    setCode(next);
    focusBox(start + digits.length);
  };

  const handleChange = (index: number, value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length > 1) return fillFrom(index, digits);
    const next = [...code];
    next[index] = digits;
    setCode(next);
    if (digits && index < CODE_LENGTH - 1) focusBox(index + 1);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      e.preventDefault();
      const next = [...code];
      next[index - 1] = '';
      setCode(next);
      focusBox(index - 1);
    } else if (e.key === 'ArrowLeft') focusBox(index - 1);
    else if (e.key === 'ArrowRight') focusBox(index + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!phoneValid || !codeValid || sending.current) return;
    sending.current = true;
    setPaying(true);
    try {
      await onPay(phone, codeValue);
    } finally {
      // El código es de un solo uso (también si se aprobó): reenviarlo hace que Mercado Pago lo rechace.
      // Para pagar el saldo se necesita uno nuevo.
      setCode(Array(CODE_LENGTH).fill(''));
      setSubmitted(false);
      sending.current = false;
      setPaying(false);
    }
  };

  const errorText = (text: string) => (
    <p className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-rose-600"><AlertCircle className="h-3.5 w-3.5" /> {text}</p>
  );

  return (
    <form onSubmit={handleSubmit} noValidate className="mx-auto max-w-md rounded-[1.5rem] border border-[#efe6dd] bg-white p-5 shadow-[0_18px_40px_-30px_rgba(116,34,132,0.55)] sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <YapeLogo className="h-12 w-12" />
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#887870]">Vas a yapear</p>
          <p className="font-serif text-2xl font-bold text-[#4a3933]">{formatCurrency(amount)}</p>
        </div>
      </div>

      <label className="mt-5 block">
        <span className="mb-1.5 block text-sm font-semibold text-[#6b5a50]">Ingresa tu celular Yape</span>
        <input
          type="tel"
          inputMode="numeric"
          name="yape-celular"
          autoComplete="off"
          value={formatPhone(phone)}
          onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
          placeholder="9XX XXX XXX"
          disabled={paying || disabled}
          className={`h-13 w-full rounded-xl border bg-white px-4 text-lg font-semibold tracking-wide text-[#4a3933] outline-none transition placeholder:font-normal placeholder:text-[#c4b8af] ${
            submitted && !phoneValid ? 'border-rose-300 ring-4 ring-rose-100' : 'border-[#e8dcdc] focus:border-[#742284] focus:ring-4 focus:ring-[#742284]/10'
          }`}
        />
        {submitted && !phoneValid && errorText('Escribe el celular de 9 dígitos de tu Yape.')}
      </label>

      <div className="mt-5">
        <span className="mb-1.5 block text-sm font-semibold text-[#6b5a50]" id="yape-code-label">Código de aprobación</span>
        <div className="grid grid-cols-6 gap-2" role="group" aria-labelledby="yape-code-label">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={el => { boxes.current[index] = el; }}
              type="text"
              inputMode="numeric"
              autoComplete={index === 0 ? 'one-time-code' : 'off'}
              maxLength={CODE_LENGTH}
              value={digit}
              onChange={e => handleChange(index, e.target.value)}
              onKeyDown={e => handleKeyDown(index, e)}
              onFocus={e => e.target.select()}
              aria-label={`Dígito ${index + 1} del código`}
              disabled={paying || disabled}
              className={`h-13 w-full rounded-xl border bg-white text-center font-mono text-xl font-bold text-[#4a3933] outline-none transition ${
                submitted && !codeValid && !digit ? 'border-rose-300 ring-2 ring-rose-100' : 'border-[#e8dcdc] focus:border-[#742284] focus:ring-4 focus:ring-[#742284]/10'
              }`}
            />
          ))}
        </div>
        {submitted && !codeValid
          ? errorText('Escribe los 6 dígitos del código de tu app Yape.')
          : <p className="mt-2 text-xs text-[#887870]">Encuéntralo en el menú de Yape. Cambia cada pocos minutos.</p>}
      </div>

      {/* Dónde está el código, en 3 pasos */}
      <ol className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-[#f7f0f9] p-3 text-center text-[11px] leading-snug text-[#5b2a67]">
        <li><strong className="block text-[#742284]">1</strong>Abre Yape</li>
        <li><strong className="flex items-center justify-center gap-1 text-[#742284]">2 <Menu className="h-3 w-3" /></strong>Menú → Código de aprobación</li>
        <li><strong className="block text-[#742284]">3</strong>Escríbelo aquí</li>
      </ol>

      <button
        type="submit"
        disabled={paying || disabled}
        className="mt-5 flex h-13 w-full items-center justify-center gap-2 rounded-full bg-[#742284] text-base font-bold text-white shadow-lg shadow-[#742284]/25 transition hover:bg-[#5e1b6b] disabled:opacity-50"
      >
        {paying ? <><Loader2 className="h-4 w-4 animate-spin" /> Procesando…</> : <>Yapear {formatCurrency(amount)}</>}
      </button>
      <p className="mt-3 text-center text-[11px] leading-relaxed text-[#887870]">
        Disponible para yaperos BCP y Yape con DNI. Revisa que tu límite de Yape (S/ 500, 900 o 2,000) cubra el monto.
      </p>
    </form>
  );
}
