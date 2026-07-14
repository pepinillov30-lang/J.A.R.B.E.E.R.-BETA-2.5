import { API_BASE_URL, GEMINI_FUNCTION_URL, IS_PRODUCTION, getMode } from './config';
import { systemStatus, productionData, BATCHES, documents } from '../data/mockData';

async function get<T>(path: string, timeoutMs = 2500): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

async function post<T>(path: string, body: unknown, timeoutMs = 2500): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Arquitectura híbrida Búnker (backend local real) / Online (mocks locales)
// ─────────────────────────────────────────────────────────────────────────
// En modo BÚNKER se intenta llamar siempre a la API local real. Si falla
// (backend apagado, red no disponible, timeout) se cae automáticamente a
// los datos simulados, para que la demo nunca se rompa ni lance errores
// visibles al usuario.
// ─────────────────────────────────────────────────────────────────────────

type SystemStatusResponse = typeof systemStatus;
type BatchResponse = typeof productionData;
type DocumentsResponse = typeof documents;
type ChatResponse = { reply: string };

async function withFallback<T>(real: () => Promise<T>, mock: () => T): Promise<T> {
  if (getMode() !== 'bunker') return mock();
  try {
    return await real();
  } catch {
    // Backend local no disponible: degradamos a datos simulados sin romper la UI.
    return mock();
  }
}

export const api = {
  getStatus: (): Promise<SystemStatusResponse> =>
    withFallback(() => get<SystemStatusResponse>('/api/v1/status'), () => systemStatus),

  // ── Batches ───────────────────────────────────────────────────────────────
  getBatches: (): Promise<BatchResponse[]> =>
    withFallback(() => get<BatchResponse[]>('/api/v1/batches'), () => BATCHES),
  getBatch: (_id: string): Promise<BatchResponse> =>
    withFallback(() => get<BatchResponse>(`/api/v1/batches/${_id}`), () => productionData),
  createBatch: (data: unknown): Promise<BatchResponse> =>
    withFallback(
      () => post<BatchResponse>('/api/v1/batches', data),
      () => ({ ...productionData, ...(data as object) })
    ),

  // ── Documents ─────────────────────────────────────────────────────────────
  getDocuments: (): Promise<DocumentsResponse> =>
    withFallback(() => get<DocumentsResponse>('/api/v1/documents'), () => documents),

  // ── Comandos de voz / chat ───────────────────────────────────────────────
  // En producción (Netlify) el chat se resuelve a través de la Netlify Function
  // que a su vez llama a Google Gemini usando JARBEER_KEY.
  // En desarrollo se mantiene el comportamiento original: backend local o mock.
  sendCommand: (command: string): Promise<ChatResponse> =>
    IS_PRODUCTION
      ? post<ChatResponse>(GEMINI_FUNCTION_URL, { command }, 15000)
      : withFallback(
          () => post<ChatResponse>('/api/v1/command', { command }),
          () => ({ reply: `Procesando: "${command}"` })
        ),
  chat: (message: string): Promise<ChatResponse> => api.sendCommand(message),

  // ── Avatar (reset tras responder) ────────────────────────────────────────
  resetAvatar: (): Promise<void> =>
    withFallback(
      () => post<void>('/api/v1/avatar/reset', {}),
      () => undefined
    ),
};

export { get, post };
