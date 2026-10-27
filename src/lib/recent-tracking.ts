/** Pedidos que este dispositivo ya consultó: para volver a verlos sin escribir el código. */
export interface RecentTracking {
  code: string;
  orderCode: string;
  savedAt: string;
}

const KEY = 'auranova-recent-tracking';
const MAX = 5;
const listeners = new Set<() => void>();

/** Texto guardado tal cual: sirve como "snapshot" estable para useSyncExternalStore. */
export function readRecentRaw(): string {
  try { return localStorage.getItem(KEY) ?? ''; } catch { return ''; }
}

export function parseRecent(raw: string): RecentTracking[] {
  try {
    const list = JSON.parse(raw || '[]');
    return Array.isArray(list) ? list.filter(r => typeof r?.code === 'string' && typeof r?.orderCode === 'string') : [];
  } catch {
    return [];
  }
}

export function subscribeRecent(callback: () => void) {
  listeners.add(callback);
  return () => { listeners.delete(callback); };
}

export function saveRecentTracking(code: string, orderCode: string) {
  if (!code || !orderCode) return;
  try {
    const list = parseRecent(readRecentRaw()).filter(r => r.code !== code);
    list.unshift({ code, orderCode, savedAt: new Date().toISOString() });
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
    listeners.forEach(l => l());
  } catch {
    // Sin almacenamiento (modo privado): no se recuerda, y no pasa nada
  }
}

export function forgetRecentTracking(code: string) {
  try {
    localStorage.setItem(KEY, JSON.stringify(parseRecent(readRecentRaw()).filter(r => r.code !== code)));
    listeners.forEach(l => l());
  } catch { /* sin almacenamiento */ }
}
