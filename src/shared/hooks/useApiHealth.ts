import { useCallback, useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../../config/api';

type ApiHealthStatus = 'checking' | 'online' | 'offline';

type HealthResponse = {
  status: string;
  service: string;
  environment: string;
  utc: string;
};

export function useApiHealth(isOnline: boolean) {
  const [status, setStatus] = useState<ApiHealthStatus>('checking');
  const [lastCheckedAt, setLastCheckedAt] = useState<string | null>(null);
  const [serviceUtc, setServiceUtc] = useState<string | null>(null);

  const checkHealth = useCallback(async () => {
    if (!isOnline) {
      setStatus('offline');
      setLastCheckedAt(new Date().toISOString());
      return;
    }

    setStatus('checking');

    try {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 5000);

      const response = await fetch(API_ENDPOINTS.health, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          Accept: 'application/json'
        }
      });

      window.clearTimeout(timeoutId);

      if (!response.ok) {
        setStatus('offline');
        setLastCheckedAt(new Date().toISOString());
        return;
      }

      const data = (await response.json()) as HealthResponse;

      setStatus(data.status === 'ok' ? 'online' : 'offline');
      setServiceUtc(data.utc ?? null);
      setLastCheckedAt(new Date().toISOString());
    } catch {
      setStatus('offline');
      setLastCheckedAt(new Date().toISOString());
    }
  }, [isOnline]);

  useEffect(() => {
    void checkHealth();
  }, [checkHealth]);

  return {
    status,
    lastCheckedAt,
    serviceUtc,
    checkHealth
  };
}