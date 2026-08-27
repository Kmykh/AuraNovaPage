import { ProblemDetails } from '../types/common';

export class ApiProblemDetails extends Error {
  public type?: string;
  public title?: string;
  public status?: number;
  public detail?: string;
  public instance?: string;
  public extensions?: Record<string, unknown>;

  constructor(problem: ProblemDetails) {
    super(problem.detail || problem.title || 'Unknown API Error');
    this.name = 'ApiProblemDetails';
    this.type = problem.type;
    this.title = problem.title;
    this.status = problem.status;
    this.detail = problem.detail;
    this.instance = problem.instance;
    this.extensions = problem.extensions;

    // Set prototype explicitly for built-in Error extensions in TS
    Object.setPrototypeOf(this, ApiProblemDetails.prototype);
  }
}

/**
 * Determina si un error es transitorio (problema de red, timeout o fallo del Gateway/Servidor).
 * Se utiliza para ofrecer contingencia (ej. WhatsApp Fallback) sin engañar al usuario.
 */
export function isTransientApiError(error: unknown): boolean {
  if (!error) return false;
  
  // Si es nuestro error mapeado, revisamos el status HTTP
  if (error instanceof ApiProblemDetails) {
    const status = error.status || 500;
    return status === 502 || status === 503 || status === 504 || status >= 500;
  }

  // Si es un AxiosError (Network Error o Timeout)
  // Como no queremos acoplar fuertemente a Axios aquí, verificamos propiedades comunes
  const err = error as Record<string, unknown>;
  
  if (err.isAxiosError) {
    // Network errors generally don't have a response
    if (!err.response) return true;
    
    // Status in response
    const status = (err.response as { status?: number })?.status;
    if (status && (status === 502 || status === 503 || status === 504 || status >= 500)) {
      return true;
    }
    
    // Axios code (ECONNABORTED para timeouts)
    if (err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK') {
      return true;
    }
  }

  // Fallback nativo
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return true;
  }

  return false;
}
