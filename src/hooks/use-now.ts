import { useSyncExternalStore } from 'react';

// Un solo reloj compartido: avisa cada 30 s a los componentes que muestran cuentas regresivas
let now = Date.now();
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!timer) {
    now = Date.now();
    timer = setInterval(() => {
      now = Date.now();
      listeners.forEach(l => l());
    }, 30_000);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

/** Hora actual en el navegador (null durante el render del servidor, para no desalinear la hidratación). */
export function useNow(): number | null {
  return useSyncExternalStore(subscribe, () => now, () => null);
}
