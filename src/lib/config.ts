export const APP_NAME = 'J.A.R.B.E.E.R.';
export const APP_VERSION = 'BETA 2.5';
export const USER_NAME = 'Juanfran';

// Modo desarrollo: backend local (VITE_API_URL o localhost:8000).
// Modo producción: rutas relativas a Netlify (/.netlify/functions/*).
export const IS_PRODUCTION = import.meta.env.PROD === true;
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? (IS_PRODUCTION ? '' : 'http://localhost:8000');
export const GEMINI_FUNCTION_URL = '/.netlify/functions/gemini';

export type SystemMode = 'bunker' | 'online';

const MODE_KEY = 'jarbeer_mode';

export function getMode(): SystemMode {
  try {
    const stored = localStorage.getItem(MODE_KEY);
    if (stored === 'bunker' || stored === 'online') return stored;
  } catch { /* localStorage no disponible */ }
  return 'online';
}

export function setMode(mode: SystemMode): void {
  try { localStorage.setItem(MODE_KEY, mode); } catch { /* noop */ }
}
