import { useEffect, useRef, useState } from 'react';
import { api } from './api';
import { getMode } from './config';
import { systemStatus as mockStatus } from '../data/mockData';

type SystemStatus = typeof mockStatus;

const POLL_INTERVAL_MS = 3000;

/**
 * Sincroniza el estado del sistema con la API.
 * En modo BÚNKER hace polling real cada 3s a GET /api/v1/status.
 * En modo ONLINE devuelve los datos simulados sin red.
 * Si el backend local no responde, degrada a los datos simulados
 * sin interrumpir el polling ni lanzar errores visibles.
 */
export function useSystemStatus(mode: 'bunker' | 'online') {
  const [status, setStatus] = useState<SystemStatus>(mockStatus);
  const [connected, setConnected] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchStatus = async () => {
      try {
        const data = await api.getStatus();
        if (cancelled) return;
        setStatus(data);
        setConnected(mode === 'bunker');
      } catch {
        if (cancelled) return;
        setStatus(mockStatus);
        setConnected(false);
      }
    };

    fetchStatus();

    if (mode === 'bunker') {
      intervalRef.current = setInterval(fetchStatus, POLL_INTERVAL_MS);
    }

    return () => {
      cancelled = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [mode]);

  return { status, connected };
}
