const TOKEN_KEY = 'auranova_auth_token';
const ADMIN_NAME_KEY = 'auranova_admin_name';

export const AuthTokenStorage = {
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
  }
};

export const AuthSession = {
  ...AuthTokenStorage,
  
  getAdminName: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ADMIN_NAME_KEY);
  },

  getRole: (): string | null => {
    const token = AuthTokenStorage.getToken();
    if (!token) return null;
    
    try {
      const payload = token.split('.')[1];
      if (!payload) return null;
      
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      const parsed = JSON.parse(decoded);
      return parsed['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || parsed['role'] || null;
    } catch (error) {
      console.error('[AuthSession] Error parsing token', error);
      return null;
    }
  },

  setSession: (token: string, adminName: string): void => {
    if (typeof window === 'undefined') return;
    
    // Protección defensiva estricta
    if (!token || token === 'undefined' || token === 'null' || typeof token !== 'string') {
      console.error('[AuthSession] Intento crítico de guardar un token inválido', token);
      return; // Prevenir guardar estados corruptos
    }
    if (!adminName || adminName === 'undefined' || adminName === 'null') {
      adminName = 'Administrador'; // Fallback pasable para el nombre
    }

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(ADMIN_NAME_KEY, adminName);
  },

  clearSession: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_NAME_KEY);
  },

  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem(TOKEN_KEY);
  }
};
