"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLogin } from '@/hooks/use-login';
import { AuthSession } from '@/lib/auth-storage';
import { Button } from '@/components/ui/Button';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { ApiProblemDetails } from '@/lib/api-errors';

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mutate: login, isPending } = useLogin();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Si ya está logueado al montar, redirigir automáticamente
  useEffect(() => {
    if (AuthSession.isAuthenticated()) {
      router.push('/admin');
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) return;

    login(
      { email, password },
      {
        onSuccess: (data: any) => {
          const actualToken = data?.token || data?.Token || data?.accessToken || data?.jwt;
          const actualAdmin = data?.adminName || data?.AdminName || data?.name || data?.user?.name || 'Administrador';

          // Validación defensiva extrema: Confirmar que la API realmente devolvió Token
          if (!actualToken || typeof actualToken !== 'string') {
            setErrorMessage('Data recibida del backend: ' + JSON.stringify(data));
            return;
          }

          // Guardar sesión de forma segura
          AuthSession.setSession(actualToken, actualAdmin);
          
          // Validar open redirect y returnUrl
          const returnUrl = searchParams.get('returnUrl');
          if (returnUrl && returnUrl.startsWith('/admin')) {
            router.push(returnUrl);
          } else {
            router.push('/admin');
          }
        },
        onError: (error) => {
          if (error instanceof ApiProblemDetails) {
            if (error.status === 401) {
              setErrorMessage('Correo o contraseña incorrectos.');
              return;
            }
            if (error.status === 429) {
              setErrorMessage('Has realizado demasiados intentos. Espera un momento antes de volver a intentarlo.');
              return;
            }
          }
          setErrorMessage('No pudimos conectarnos con Aura Nova. Inténtalo nuevamente.');
        }
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMessage && (
        <div className="bg-red-50/50 backdrop-blur-sm border border-red-200/50 text-red-700 rounded-lg p-4 flex gap-3 text-xs font-medium" role="alert">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p>{errorMessage}</p>
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-[10px] font-bold tracking-[0.2em] uppercase text-[#c8a96b] mb-3 ml-2">
          Correo Electrónico
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="block w-full bg-[#fdfbf9] px-5 py-4 text-[#4a3933] text-sm rounded-2xl border border-[#c8a96b]/20 focus:outline-none focus:bg-white focus:border-[#c8a96b]/60 focus:ring-4 focus:ring-[#c8a96b]/10 transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)]"
          placeholder="Ej: admin@auranova.com"
          disabled={isPending}
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-[10px] font-bold tracking-[0.2em] uppercase text-[#c8a96b] mb-3 ml-2">
          Contraseña
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full bg-[#fdfbf9] px-5 py-4 text-[#4a3933] text-sm rounded-2xl border border-[#c8a96b]/20 focus:outline-none focus:bg-white focus:border-[#c8a96b]/60 focus:ring-4 focus:ring-[#c8a96b]/10 transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] pr-12"
            placeholder="••••••••"
            disabled={isPending}
          />
          <button
            type="button"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#c8a96b]/60 hover:text-[#c8a96b] transition-colors"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            disabled={isPending}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-[#c8a96b] hover:bg-[#b59555] text-white border-none transition-all duration-300 rounded-full font-serif italic text-lg px-8 h-14 shadow-[0_8px_30px_rgba(200,169,107,0.25)] hover:shadow-[0_8px_30px_rgba(200,169,107,0.4)] hover:-translate-y-1 flex items-center justify-center"
        >
          {isPending ? 'Ingresando...' : 'Acceder al panel'}
        </Button>
      </div>
    </form>
  );
}
